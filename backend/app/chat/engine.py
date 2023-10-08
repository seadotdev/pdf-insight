import io
import logging
import s3fs
import requests
import fitz
import nest_asyncio


from datetime import timedelta
from cachetools import cached, TTLCache
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime
from fsspec.asyn import AsyncFileSystem

from llama_index import (
    QuestionAnswerPrompt,
    RefinePrompt,
    ServiceContext,
    VectorStoreIndex,
    StorageContext,
    load_indices_from_storage,
)
from llama_index.prompts.prompt_type import PromptType
from llama_index.vector_stores.types import VectorStore
from llama_index.schema import Document as LlamaIndexDocument
from llama_index.agent import OpenAIAgent
from llama_index.llms import ChatMessage, OpenAI
from llama_index.embeddings.openai import (
    OpenAIEmbedding,
    OpenAIEmbeddingMode,
    OpenAIEmbeddingModelType,
)
from llama_index.llms.base import MessageRole
from llama_index.callbacks.base import BaseCallbackHandler, CallbackManager
from llama_index.tools import QueryEngineTool, ToolMetadata
from llama_index.query_engine import SubQuestionQueryEngine
from llama_index.indices.query.base import BaseQueryEngine
from llama_index import (
    LLMPredictor,
    ServiceContext,
    StorageContext,
    KnowledgeGraphIndex,
)
from llama_index.llms import OpenAI
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.retrievers import KnowledgeGraphRAGRetriever
from llama_index import get_response_synthesizer, load_index_from_storage
from llama_index.graph_stores import KuzuGraphStore
from llama_index.indices.query.schema import QueryBundle
from llama_index.vector_stores.types import (
    MetadataFilters,
    ExactMatchFilter,
)
from llama_index.node_parser.simple import SimpleNodeParser

from app.core.config import settings
from app.schemas.pydantic_schema import (
    Message as MessageSchema,
    Document as DocumentSchema,
    Conversation as ConversationSchema,
)
from app.db.models.base import MessageRoleEnum, MessageStatusEnum
from app.chat.constants import (
    DB_DOC_ID_KEY,
    SYSTEM_MESSAGE,
    NODE_PARSER_CHUNK_OVERLAP,
    NODE_PARSER_CHUNK_SIZE,
)
from app.chat.tools import get_api_query_engine_tool, build_title_for_document
from app.chat.pg_vector import get_vector_store_singleton
from app.chat.qa_response_synth import get_custom_response_synth

logger = logging.getLogger(__name__)
logger.info("Applying nested asyncio patch")
nest_asyncio.apply()


def get_s3_fs() -> AsyncFileSystem:
    s3 = s3fs.S3FileSystem(
        key=settings.AWS_KEY,
        secret=settings.AWS_SECRET,
        endpoint_url=settings.S3_ENDPOINT_URL,
    )

    return s3


def fetch_and_read_document(document: DocumentSchema) -> List[LlamaIndexDocument]:
    """
    Reading a document (in the Pydantic schema format, as retrieved from database)
    and returning a LLaMA Index document
    """

    s3 = get_s3_fs()
    filename = Path(document.url).name
    f = s3.open(f"{settings.S3_ASSET_BUCKET_NAME}/{filename}", "rb")
    doc = fitz.open(stream=io.BytesIO(f.read()), filetype="pdf")
    extra_info = {
        DB_DOC_ID_KEY: str(document.id),
        "total_pages": len(doc),
        "file_path": document.url,
        "file_name": document.url
    }

    data = []
    for page in doc:
        # if there's no text, try ocr on the page
        text = page.get_text().encode("utf-8")
        if len(text) == 0:
            text = page.get_textpage_ocr().extractText().encode("utf-8")

        data.append(LlamaIndexDocument(
            text=text,
            metadata={},
            extra_info=dict(
                extra_info,
                **{"source": f"{page.number + 1}", "page_label": page.number + 1, },
            ),
        ))

    return data


def build_description_for_document(document: DocumentSchema) -> str:
    return "A document containing useful information that the user pre-selected to discuss with the assistant."


def index_to_query_engine(doc_id: str, index: VectorStoreIndex) -> BaseQueryEngine:
    kwargs = {"similarity_top_k": 3}
    return index.as_query_engine(**kwargs)


@cached(TTLCache(maxsize=10, ttl=timedelta(minutes=5).total_seconds()), key=lambda *args, **kwargs: "global_storage_context")
def get_storage_context(persist_dir: str, vector_store: VectorStore, fs: Optional[AsyncFileSystem] = None) -> StorageContext:
    logger.info("Fetching storage context.")
    return StorageContext.from_defaults(persist_dir=persist_dir, vector_store=vector_store, fs=fs)


async def build_doc_id_to_index_map(service_context: ServiceContext, documents: List[DocumentSchema], fs: Optional[AsyncFileSystem] = None) -> Dict[str, VectorStoreIndex]:
    persist_dir = f"{settings.S3_BUCKET_NAME}"
    vector_store = await get_vector_store_singleton()
    try:
        try:
            storage_context = get_storage_context(persist_dir, vector_store, fs=fs)
        except FileNotFoundError:
            logger.error("Could not find storage context in S3. Creating new storage context.")
            storage_context = StorageContext.from_defaults(vector_store=vector_store, fs=fs)
            storage_context.persist(persist_dir=persist_dir, fs=fs)

        index_ids = [str(doc.id) for doc in documents]
        indices = load_indices_from_storage(
            storage_context,
            index_ids=index_ids,
            service_context=service_context,
        )

        doc_id_to_index = dict(zip(index_ids, indices))
        logger.info("Loaded indices from storage.")
        storage_context = StorageContext.from_defaults(persist_dir=persist_dir, vector_store=vector_store, fs=fs)
    except ValueError:
        logger.error("Failed to load indices from storage. Creating new indices.", exc_info=True)
        storage_context = StorageContext.from_defaults(persist_dir=persist_dir, vector_store=vector_store, fs=fs)
        doc_id_to_index = {}
        for doc in documents:
            llama_index_docs = fetch_and_read_document(doc)
            storage_context.docstore.add_documents(llama_index_docs)
            index = VectorStoreIndex.from_documents(
                llama_index_docs,
                storage_context=storage_context,
                service_context=service_context,
            )
            index.set_index_id(str(doc.id))
            index.storage_context.persist(persist_dir=persist_dir, fs=fs)
            doc_id_to_index[str(doc.id)] = index

    return doc_id_to_index


def get_chat_history(chat_messages: List[MessageSchema]) -> List[ChatMessage]:
    """
    Given a list of chat messages, return a list of ChatMessage instances.

    Failed chat messages are filtered out and then the remaining ones are
    sorted by created_at.
    """

    # pre-process chat messages
    chat_messages = [
        m
        for m in chat_messages
        if m.content.strip() and m.status == MessageStatusEnum.SUCCESS
    ]
    # TODO: could be a source of high CPU utilization
    chat_messages = sorted(chat_messages, key=lambda m: m.created_at)

    chat_history = []
    for message in chat_messages:
        role = (
            MessageRole.ASSISTANT
            if message.role == MessageRoleEnum.assistant
            else MessageRole.USER
        )
        chat_history.append(ChatMessage(content=message.content, role=role))

    return chat_history


def get_tool_service_context(callback_handlers: List[BaseCallbackHandler]) -> ServiceContext:
    llm = OpenAI(
        temperature=0,
        model="gpt-4",
        streaming=False,
        api_key=settings.OPENAI_API_KEY,
        additional_kwargs={"api_key": settings.OPENAI_API_KEY},
    )
    callback_manager = CallbackManager(callback_handlers)
    embedding_model = OpenAIEmbedding(
        mode=OpenAIEmbeddingMode.SIMILARITY_MODE,
        model_type=OpenAIEmbeddingModelType.TEXT_EMBED_ADA_002,
        api_key=settings.OPENAI_API_KEY,
    )
    # Use a smaller chunk size to retrieve more granular results
    node_parser = SimpleNodeParser.from_defaults(
        chunk_size=NODE_PARSER_CHUNK_SIZE,
        chunk_overlap=NODE_PARSER_CHUNK_OVERLAP,
        callback_manager=callback_manager,
    )
    service_context = ServiceContext.from_defaults(
        callback_manager=callback_manager,
        llm=llm,
        embed_model=embedding_model,
        node_parser=node_parser,
    )

    return service_context


async def get_chat_engine(callback_handler: BaseCallbackHandler, conversation: ConversationSchema) -> OpenAIAgent:
    service_context = get_tool_service_context([callback_handler])
    s3_fs = get_s3_fs()

    # [TODO: hacky way to use the knowledge graph, please change this for the love of god]
    if (len(conversation.documents) == 0):
        llm = OpenAI(model="gpt-4", temperature=0)
        service_context = service_context = ServiceContext.from_defaults(llm=llm, chunk_size=512)
        response_synthesizer = get_response_synthesizer(response_mode="tree_summarize")
        # response_synthesizer = get_response_synthesizer(response_mode="refine")

        persist_dir = f"{settings.S3_BUCKET_NAME}"
        storage_context = StorageContext.from_defaults(
            fs=s3_fs, persist_dir=persist_dir)

        kg_index = load_index_from_storage(
            storage_context=storage_context,
            # TODO change this
            # index_id="",
            index_id="21b11038-1a2d-4c11-b36c-84fc436dc115",
            service_context=service_context,
            max_triplets_per_chunk=15,
            verbose=True,
        )

        graph_retriever = kg_index.as_retriever(
            include_text=False,
            embedding_mode="hybrid",
            similarity_top_k=5,
            graph_store_query_depth=2
        )

        graph_query_engine = RetrieverQueryEngine.from_args(
            graph_retriever,
            service_context=service_context,
            response_synthesizer=response_synthesizer
        )

        query_engine_tools = [
            QueryEngineTool(
                query_engine=graph_query_engine,
                metadata=ToolMetadata(name="Knowledge Graph", description="KG metadata")
            )
        ]

        refine_template_str = f"""
A user has asked a question about a company that has \
information about it in a knowledge graph.
The original query is as follows: {{query_str}}
We have provided an existing answer: {{existing_answer}}
We have the opportunity to refine the existing answer \
(only if needed) with some more context below.
------------
{{context_msg}}
------------
Given the new context, refine the original answer to better \
answer the query. \
If the context isn't useful, return the original answer.
Refined Answer:
""".strip()
        refine_prompt = RefinePrompt(
            template=refine_template_str,
            prompt_type=PromptType.REFINE,
        )

        qa_template_str = f"""
A user has a question about a company. \
Context information is below.
---------------------
{{context_str}}
---------------------
Given the context information and not prior knowledge, \
answer the query.
Query: {{query_str}}
Answer:
""".strip()
        qa_prompt = QuestionAnswerPrompt(
            template=qa_template_str,
            prompt_type=PromptType.QUESTION_ANSWER,
        )

        response_synth = get_response_synthesizer(
            service_context,
            refine_template=refine_prompt,
            text_qa_template=qa_prompt,
            structured_answer_filtering=True,
        )

        question_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=query_engine_tools,
            service_context=service_context,
            response_synthesizer=response_synth,
            verbose=settings.VERBOSE,
            use_async=True,
        )

        top_level_sub_tools = [
            QueryEngineTool(
                query_engine=question_engine,
                metadata=ToolMetadata(
                    name="question_engine",
                    description="""
A query engine that can answer questions about data in the knowledge graph that the user pre-selected for the conversation.
""".strip(),
                ),
            ),
        ]
    else:
        doc_id_to_index = await build_doc_id_to_index_map(service_context, conversation.documents, fs=s3_fs)
        id_to_doc: Dict[str, DocumentSchema] = {
            str(doc.id): doc for doc in conversation.documents
        }

        query_engine_tools = [
            QueryEngineTool(
                query_engine=index_to_query_engine(doc_id, index),
                metadata=ToolMetadata(
                    name=doc_id,
                    description=build_description_for_document(
                        id_to_doc[doc_id]),
                ),
            )
            for doc_id, index in doc_id_to_index.items()
        ]

        response_synth = get_custom_response_synth(
            service_context, conversation.documents)

        qualitative_question_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=query_engine_tools,
            service_context=service_context,
            response_synthesizer=response_synth,
            verbose=settings.VERBOSE,
            use_async=True,
        )

        api_query_engine_tools = [get_api_query_engine_tool(
            doc, service_context) for doc in conversation.documents]

        quantitative_question_engine = SubQuestionQueryEngine.from_defaults(
            query_engine_tools=api_query_engine_tools,
            service_context=service_context,
            response_synthesizer=response_synth,
            verbose=settings.VERBOSE,
            use_async=True,
        )

        top_level_sub_tools = [
            QueryEngineTool(
                query_engine=qualitative_question_engine,
                metadata=ToolMetadata(
                    name="qualitative_question_engine",
                    description="""
    A query engine that can answer qualitative questions about a set of company financial documents that the user pre-selected for the conversation.
    Any questions about company-related headwinds, tailwinds, risks, sentiments, or administrative information should be asked here.
    """.strip(),
                ),
            ),
            QueryEngineTool(
                query_engine=quantitative_question_engine,
                metadata=ToolMetadata(
                    name="quantitative_question_engine",
                    description="""
    A query engine that can answer quantitative questions about a set of company financial documents that the user pre-selected for the conversation.
    Any questions about company-related financials or other metrics should be asked here.
    """.strip(),
                ),
            ),
        ]

    chat_llm = OpenAI(
        temperature=0,
        model="gpt-4",
        streaming=True,
        api_key=settings.OPENAI_API_KEY,
        additional_kwargs={"api_key": settings.OPENAI_API_KEY},
    )
    chat_messages: List[MessageSchema] = conversation.messages
    chat_history = get_chat_history(chat_messages)
    logger.debug("Chat history: %s", chat_history)

    if conversation.documents:
        doc_titles = "\n".join(
            "- " + build_title_for_document(doc) for doc in conversation.documents
        )
    else:
        doc_titles = "No documents selected. Using Knowledge Graph"

    curr_date = datetime.utcnow().strftime("%Y-%m-%d")
    chat_engine = OpenAIAgent.from_tools(
        tools=top_level_sub_tools,
        llm=chat_llm,
        chat_history=chat_history,
        verbose=settings.VERBOSE,
        system_prompt=SYSTEM_MESSAGE.format(doc_titles=doc_titles, curr_date=curr_date),
        callback_manager=service_context.callback_manager,
        max_function_calls=3,
    )

    return chat_engine
