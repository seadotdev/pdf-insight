import io
import logging
import s3fs
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
    ServiceContext,
    StorageContext,
)
from llama_index.llms import OpenAI
from llama_index.query_engine import RetrieverQueryEngine
# from llama_index.retrievers import KnowledgeGraphRAGRetriever
from llama_index import get_response_synthesizer, load_index_from_storage
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
from app.api.crud import fetch_kg_index
from app.db.session import SessionLocal


"""KG Retrievers."""
import logging
from collections import defaultdict
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

from llama_index.indices.base_retriever import BaseRetriever
from llama_index.indices.keyword_table.utils import extract_keywords_given_response
from llama_index.indices.knowledge_graph.base import KnowledgeGraphIndex
from llama_index.indices.query.embedding_utils import get_top_k_embeddings
from llama_index.indices.query.schema import QueryBundle
from llama_index.indices.service_context import ServiceContext
from llama_index.prompts import BasePromptTemplate, PromptTemplate, PromptType
from llama_index.prompts.default_prompts import DEFAULT_QUERY_KEYWORD_EXTRACT_TEMPLATE
from llama_index.schema import BaseNode, MetadataMode, NodeWithScore, TextNode
from llama_index.storage.storage_context import StorageContext
from llama_index.utils import print_text, truncate_text

DQKET = DEFAULT_QUERY_KEYWORD_EXTRACT_TEMPLATE
DEFAULT_NODE_SCORE = 1000.0
GLOBAL_EXPLORE_NODE_LIMIT = 3
REL_TEXT_LIMIT = 30

logger = logging.getLogger(__name__)


class KGRetrieverMode(str, Enum):
    """Query mode enum for Knowledge Graphs.

    Can be passed as the enum struct, or as the underlying string.

    Attributes:
        KEYWORD ("keyword"): Default query mode, using keywords to find triplets.
        EMBEDDING ("embedding"): Embedding mode, using embeddings to find
            similar triplets.
        HYBRID ("hybrid"): Hyrbid mode, combining both keywords and embeddings
            to find relevant triplets.
    """

    KEYWORD = "keyword"
    EMBEDDING = "embedding"
    HYBRID = "hybrid"


DEFAULT_SYNONYM_EXPAND_TEMPLATE = """
Generate synonyms or possible form of keywords up to {max_keywords} in total,
considering possible cases of capitalization, pluralization, common expressions, etc.
Provide all synonyms of keywords in comma-separated format: 'SYNONYMS: <keywords>'
Note, result should be in one-line with only one 'SYNONYMS: ' prefix
----
KEYWORDS: {question}
----
"""

DEFAULT_SYNONYM_EXPAND_PROMPT = PromptTemplate(
    DEFAULT_SYNONYM_EXPAND_TEMPLATE,
    prompt_type=PromptType.QUERY_KEYWORD_EXTRACT,
)


class KnowledgeGraphRAGRetriever(BaseRetriever):
    """
    Knowledge Graph RAG retriever.

    Retriever that perform SubGraph RAG towards knowledge graph.

    Args:
        service_context (Optional[ServiceContext]): A service context to use.
        storage_context (Optional[StorageContext]): A storage context to use.
        entity_extract_fn (Optional[Callable]): A function to extract entities.
        entity_extract_template Optional[BasePromptTemplate]): A Query Key Entity
            Extraction Prompt (see :ref:`Prompt-Templates`).
        entity_extract_policy (Optional[str]): The entity extraction policy to use.
            default: "union"
            possible values: "union", "intersection"
        synonym_expand_fn (Optional[Callable]): A function to expand synonyms.
        synonym_expand_template (Optional[QueryKeywordExpandPrompt]): A Query Key Entity
             Expansion Prompt (see :ref:`Prompt-Templates`).
        synonym_expand_policy (Optional[str]): The synonym expansion policy to use.
            default: "union"
            possible values: "union", "intersection"
        max_entities (int): The maximum number of entities to extract.
            default: 5
        max_synonyms (int): The maximum number of synonyms to expand per entity.
            default: 5
        retriever_mode (Optional[str]): The retriever mode to use.
            default: "keyword"
            possible values: "keyword", "embedding", "keyword_embedding"
        with_nl2graphquery (bool): Whether to combine NL2GraphQuery in context.
            default: False
        graph_traversal_depth (int): The depth of graph traversal.
            default: 2
        max_knowledge_sequence (int): The maximum number of knowledge sequence to
            include in the response. By default, it's 30.
        verbose (bool): Whether to print out debug info.
    """

    def __init__(
        self,
        service_context: Optional[ServiceContext] = None,
        storage_context: Optional[StorageContext] = None,
        entity_extract_fn: Optional[Callable] = None,
        entity_extract_template: Optional[BasePromptTemplate] = None,
        entity_extract_policy: Optional[str] = "union",
        synonym_expand_fn: Optional[Callable] = None,
        synonym_expand_template: Optional[BasePromptTemplate] = None,
        synonym_expand_policy: Optional[str] = "union",
        max_entities: int = 5,
        max_synonyms: int = 5,
        retriever_mode: Optional[str] = "keyword",
        with_nl2graphquery: bool = False,
        graph_traversal_depth: int = 2,
        max_knowledge_sequence: int = REL_TEXT_LIMIT,
        verbose: bool = False,
        **kwargs: Any,
    ) -> None:
        """Initialize the retriever."""
        # Ensure that we have a graph store
        assert storage_context is not None, "Must provide a storage context."
        assert (
            storage_context.graph_store is not None
        ), "Must provide a graph store in the storage context."
        self._storage_context = storage_context
        self._graph_store = storage_context.graph_store

        self._service_context = service_context or ServiceContext.from_defaults()

        self._entity_extract_fn = entity_extract_fn
        self._entity_extract_template = (
            entity_extract_template or DEFAULT_QUERY_KEYWORD_EXTRACT_TEMPLATE
        )
        self._entity_extract_policy = entity_extract_policy

        self._synonym_expand_fn = synonym_expand_fn
        self._synonym_expand_template = (
            synonym_expand_template or DEFAULT_SYNONYM_EXPAND_PROMPT
        )
        self._synonym_expand_policy = synonym_expand_policy

        self._max_entities = max_entities
        self._max_synonyms = max_synonyms
        self._retriever_mode = retriever_mode
        self._with_nl2graphquery = with_nl2graphquery
        if self._with_nl2graphquery:
            from llama_index.query_engine.knowledge_graph_query_engine import (
                KnowledgeGraphQueryEngine,
            )

            graph_query_synthesis_prompt = kwargs.get(
                "graph_query_synthesis_prompt",
                None,
            )
            if graph_query_synthesis_prompt is not None:
                del kwargs["graph_query_synthesis_prompt"]

            graph_response_answer_prompt = kwargs.get(
                "graph_response_answer_prompt",
                None,
            )
            if graph_response_answer_prompt is not None:
                del kwargs["graph_response_answer_prompt"]

            refresh_schema = kwargs.get("refresh_schema", False)
            response_synthesizer = kwargs.get("response_synthesizer", None)
            self._kg_query_engine = KnowledgeGraphQueryEngine(
                service_context=self._service_context,
                storage_context=self._storage_context,
                graph_query_synthesis_prompt=graph_query_synthesis_prompt,
                graph_response_answer_prompt=graph_response_answer_prompt,
                refresh_schema=refresh_schema,
                verbose=verbose,
                response_synthesizer=response_synthesizer,
                **kwargs,
            )

        self._graph_traversal_depth = graph_traversal_depth
        self._max_knowledge_sequence = max_knowledge_sequence
        self._verbose = verbose
        refresh_schema = kwargs.get("refresh_schema", False)
        try:
            self._graph_schema = self._graph_store.get_schema(refresh=refresh_schema)
        except NotImplementedError:
            self._graph_schema = ""
        except Exception as e:
            logger.warning(f"Failed to get graph schema: {e}")
            self._graph_schema = ""

    def _process_entities(
        self,
        query_str: str,
        handle_fn: Optional[Callable],
        handle_llm_prompt_template: Optional[BasePromptTemplate],
        cross_handle_policy: Optional[str] = "union",
        max_items: Optional[int] = 5,
        result_start_token: str = "KEYWORDS:",
    ) -> List[str]:
        """Get entities from query string."""
        assert cross_handle_policy in [
            "union",
            "intersection",
        ], "Invalid entity extraction policy."
        if cross_handle_policy == "intersection":
            assert all(
                [
                    handle_fn is not None,
                    handle_llm_prompt_template is not None,
                ]
            ), "Must provide entity extract function and template."
        assert any(
            [
                handle_fn is not None,
                handle_llm_prompt_template is not None,
            ]
        ), "Must provide either entity extract function or template."
        enitities_fn: List[str] = []
        entities_llm: Set[str] = set()

        if handle_fn is not None:
            enitities_fn = handle_fn(query_str)
        if handle_llm_prompt_template is not None:
            response = self._service_context.llm_predictor.predict(
                handle_llm_prompt_template,
                max_keywords=max_items,
                question=query_str,
            )
            entities_llm = extract_keywords_given_response(
                response, start_token=result_start_token, lowercase=False
            )
            print(f"entities_llm is {entities_llm}\n\n\n")

        if "cross_handle_policfy == ""union{entities_llm}\n\n\n":
            entities = list(set(enitities_fn) | entities_llm)
        elif cross_handle_policy == "intersection":
            entities = list(set(enitities_fn).intersection(set(entities_llm)))
        if self._verbose:
            print_text(f"Entities processed: {entities}\n", color="green")

        return entities

    async def _aprocess_entities(
        self,
        query_str: str,
        handle_fn: Optional[Callable],
        handle_llm_prompt_template: Optional[BasePromptTemplate],
        cross_handle_policy: Optional[str] = "union",
        max_items: Optional[int] = 5,
        result_start_token: str = "KEYWORDS:",
    ) -> List[str]:
        """Get entities from query string."""
        assert cross_handle_policy in [
            "union",
            "intersection",
        ], "Invalid entity extraction policy."
        if cross_handle_policy == "intersection":
            assert all(
                [
                    handle_fn is not None,
                    handle_llm_prompt_template is not None,
                ]
            ), "Must provide entity extract function and template."
        assert any(
            [
                handle_fn is not None,
                handle_llm_prompt_template is not None,
            ]
        ), "Must provide either entity extract function or template."
        enitities_fn: List[str] = []
        entities_llm: Set[str] = set()

        if handle_fn is not None:
            enitities_fn = handle_fn(query_str)
        if handle_llm_prompt_template is not None:
            response = await self._service_context.llm_predictor.apredict(
                handle_llm_prompt_template,
                max_keywords=max_items,
                question=query_str,
            )
            entities_llm = extract_keywords_given_response(
                response, start_token=result_start_token, lowercase=False
            )

        if cross_handle_policy == "union":
            entities = list(set(enitities_fn) | entities_llm)
        elif cross_handle_policy == "intersection":
            entities = list(set(enitities_fn).intersection(set(entities_llm)))
        if self._verbose:
            print_text(f"Entities processed: {entities}\n", color="green")

        return entities

    def _get_entities(self, query_str: str) -> List[str]:
        """Get entities from query string."""
        entities = self._process_entities(
            query_str,
            self._entity_extract_fn,
            self._entity_extract_template,
            self._entity_extract_policy,
            self._max_entities,
            "KEYWORDS:",
        )
        expanded_entities = self._expand_synonyms(entities)
        return list(set(entities) | set(expanded_entities))

    async def _aget_entities(self, query_str: str) -> List[str]:
        """Get entities from query string."""
        entities = await self._aprocess_entities(
            query_str,
            self._entity_extract_fn,
            self._entity_extract_template,
            self._entity_extract_policy,
            self._max_entities,
            "KEYWORDS:",
        )
        expanded_entities = await self._aexpand_synonyms(entities)
        return list(set(entities) | set(expanded_entities))

    def _expand_synonyms(self, keywords: List[str]) -> List[str]:
        """Expand synonyms or similar expressions for keywords."""
        return self._process_entities(
            str(keywords),
            self._synonym_expand_fn,
            self._synonym_expand_template,
            self._synonym_expand_policy,
            self._max_synonyms,
            "SYNONYMS:",
        )

    async def _aexpand_synonyms(self, keywords: List[str]) -> List[str]:
        """Expand synonyms or similar expressions for keywords."""
        return await self._aprocess_entities(
            str(keywords),
            self._synonym_expand_fn,
            self._synonym_expand_template,
            self._synonym_expand_policy,
            self._max_synonyms,
            "SYNONYMS:",
        )

    def _get_knowledge_sequence(
        self, entities: List[str]
    ) -> Tuple[List[str], Optional[Dict[Any, Any]]]:
        """Get knowledge sequence from entities."""
        # Get SubGraph from Graph Store as Knowledge Sequence
        rel_map: Optional[Dict] = self._graph_store.get_rel_map(
            entities, self._graph_traversal_depth, limit=self._max_knowledge_sequence
        )
        logger.info(f"rel_map: {rel_map}")

        # Build Knowledge Sequence
        knowledge_sequence = []
        if rel_map:
            knowledge_sequence.extend(
                [str(rel_obj) for rel_objs in rel_map.values() for rel_obj in rel_objs]
            )
        else:
            logger.info("> No knowledge sequence extracted from entities.")
            return [], None

        return knowledge_sequence, rel_map
    
    async def _get_rel_map(self, subj, depth, limit):
        """Get one subect's rel map in max depth."""
        graph_dict = { k.lower(): v for k, v in self._graph_store.to_dict()['graph_dict'].items() }
        if depth == 0:
            return []
        rel_map = []
        rel_count = 0
        if subj.lower() in graph_dict:
            for rel, obj in graph_dict[subj.lower()]:
                if rel_count >= limit:
                    break
                rel_map.append([subj, rel, obj])
                rel_map += await self._get_rel_map(obj, depth - 1, limit)
                rel_count += 1
        return rel_map

    async def _aget_knowledge_sequence(
        self, entities: List[str]
    ) -> Tuple[List[str], Optional[Dict[Any, Any]]]:
        depth = self._graph_traversal_depth
        limit = self._max_knowledge_sequence
        # This is unelievably trash, llama_index doesn't care about KG I guess :(
        """Get subjects' rel map in max depth."""
        rel_map = {}
        for subj in entities:
            rel_map[subj] = await self._get_rel_map(subj, depth=depth, limit=limit)
            
        # TBD, truncate the rel_map in a spread way, now just truncate based
        # on iteration order
        rel_count = 0
        return_map = {}
        for subj in rel_map:
            if rel_count + len(rel_map[subj]) > limit:
                return_map[subj] = rel_map[subj][: limit - rel_count]
                break
            else:
                return_map[subj] = rel_map[subj]
                rel_count += len(rel_map[subj])

        rel_map = return_map

        # Build Knowledge Sequence
        knowledge_sequence = []
        if rel_map:
            knowledge_sequence.extend(
                [str(rel_obj) for rel_objs in rel_map.values() for rel_obj in rel_objs]
            )
        else:
            logger.info("> No knowledge sequence extracted from entities.")
            return [], None

        return knowledge_sequence, rel_map

    def _build_nodes(
        self, knowledge_sequence: List[str], rel_map: Optional[Dict[Any, Any]] = None
    ) -> List[NodeWithScore]:
        """Build nodes from knowledge sequence."""
        if len(knowledge_sequence) == 0:
            logger.info("> No knowledge sequence extracted from entities.")
            return []
        _new_line_char = "\n"
        context_string = (
            f"The following are knowledge sequence in max depth"
            f" {self._graph_traversal_depth} "
            f"in the form of directed graph like:\n"
            f"`subject -[predicate]->, object, <-[predicate_next_hop]-,"
            f" object_next_hop ...`"
            f" extracted based on key entities as subject:\n"
            f"{_new_line_char.join(knowledge_sequence)}"
        )
        if self._verbose:
            print_text(f"Graph RAG context:\n{context_string}\n", color="blue")

        rel_node_info = {
            "kg_rel_map": rel_map,
            "kg_rel_text": knowledge_sequence,
        }
        metadata_keys = ["kg_rel_map", "kg_rel_text"]
        if self._graph_schema != "":
            rel_node_info["kg_schema"] = {"schema": self._graph_schema}
            metadata_keys.append("kg_schema")
        node = NodeWithScore(
            node=TextNode(
                text=context_string,
                score=1.0,
                metadata=rel_node_info,
                excluded_embed_metadata_keys=metadata_keys,
                excluded_llm_metadata_keys=metadata_keys,
            )
        )
        return [node]

    def _retrieve_keyword(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """Retrieve in keyword mode."""
        if self._retriever_mode not in ["keyword", "keyword_embedding"]:
            return []
        # Get entities
        entities = self._get_entities(query_bundle.query_str)
        # Before we enable embedding/semantic search, we need to make sure
        # we don't miss any entities that's synoynm of the entities we extracted
        # in string matching based retrieval in following steps, thus we expand
        # synonyms here.
        if len(entities) == 0:
            logger.info("> No entities extracted from query string.")
            return []

        # Get SubGraph from Graph Store as Knowledge Sequence
        knowledge_sequence, rel_map = self._get_knowledge_sequence(entities)

        return self._build_nodes(knowledge_sequence, rel_map)

    async def _aretrieve_keyword(
        self, query_bundle: QueryBundle
    ) -> List[NodeWithScore]:
        """Retrieve in keyword mode."""
        if self._retriever_mode not in ["keyword", "keyword_embedding"]:
            return []
        # Get entities
        entities = await self._aget_entities(query_bundle.query_str)
        # Before we enable embedding/semantic search, we need to make sure
        # we don't miss any entities that's synoynm of the entities we extracted
        # in string matching based retrieval in following steps, thus we expand
        # synonyms here.
        if len(entities) == 0:
            logger.info("> No entities extracted from query string.")
            return []

        # Get SubGraph from Graph Store as Knowledge Sequence
        knowledge_sequence, rel_map = await self._aget_knowledge_sequence(entities)

        return self._build_nodes(knowledge_sequence, rel_map)

    def _retrieve_embedding(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """Retrieve in embedding mode."""
        if self._retriever_mode not in ["embedding", "keyword_embedding"]:
            return []
        # TBD: will implement this later with vector store.
        raise NotImplementedError

    async def _aretrieve_embedding(
        self, query_bundle: QueryBundle
    ) -> List[NodeWithScore]:
        """Retrieve in embedding mode."""
        if self._retriever_mode not in ["embedding", "keyword_embedding"]:
            return []
        # TBD: will implement this later with vector store.
        raise NotImplementedError

    def _retrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """Build nodes for response."""
        nodes: List[NodeWithScore] = []
        if self._with_nl2graphquery:
            try:
                nodes_nl2graphquery = self._kg_query_engine._retrieve(query_bundle)
                nodes.extend(nodes_nl2graphquery)
            except Exception as e:
                logger.warning(f"Error in retrieving from nl2graphquery: {e}")

        nodes.extend(self._retrieve_keyword(query_bundle))
        nodes.extend(self._retrieve_embedding(query_bundle))

        return nodes

    async def _aretrieve(self, query_bundle: QueryBundle) -> List[NodeWithScore]:
        """Build nodes for response."""
        nodes: List[NodeWithScore] = []
        if self._with_nl2graphquery:
            try:
                nodes_nl2graphquery = await self._kg_query_engine._aretrieve(
                    query_bundle
                )
                nodes.extend(nodes_nl2graphquery)
            except Exception as e:
                logger.warning(f"Error in retrieving from nl2graphquery: {e}")

        nodes.extend(await self._aretrieve_keyword(query_bundle))
        nodes.extend(await self._aretrieve_embedding(query_bundle))

        return nodes


##################################################################################
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
        service_context = ServiceContext.from_defaults(llm=llm, chunk_size=512)
        response_synthesizer = get_response_synthesizer(response_mode="refine")
        persist_dir = f"{settings.S3_BUCKET_NAME}"
        storage_context = StorageContext.from_defaults(fs=s3_fs, persist_dir=persist_dir)

        graph_retriever = KnowledgeGraphRAGRetriever(
            storage_context=storage_context,
            service_context=service_context,
            llm=llm,
            verbose=True,
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
        refine_prompt = RefinePrompt(template=refine_template_str, prompt_type=PromptType.REFINE)

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
