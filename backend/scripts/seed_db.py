import asyncio
import os
from app.chat.engine import build_doc_id_to_index_map, fetch_and_read_document, get_s3_fs, get_tool_service_context
from app.schemas.pydantic_schema import DocumentTypeEnum
import seed_storage_context
import s3fs
import upsert_document
from pathlib import Path
from fire import Fire
from app.core.config import settings
from typing import List
from download_sec_pdf import DEFAULT_CIKS, DEFAULT_FILING_TYPES, DEFAULT_SOURCE_DIR

from llama_index.schema import Document as LlamaIndexDocument
from llama_index import (
    LLMPredictor,
    ServiceContext,
    KnowledgeGraphIndex,
)
from llama_index.graph_stores import SimpleGraphStore
from llama_index.node_parser import SimpleNodeParser
from llama_index.storage.storage_context import StorageContext
from llama_index.llms import OpenAI


def copy_to_s3(dir_path: str, s3_bucket: str = settings.S3_ASSET_BUCKET_NAME):
    """
    Copy all files in dir_path to S3.
    """

    s3 = s3fs.S3FileSystem(
        key=settings.AWS_KEY,
        secret=settings.AWS_SECRET,
        endpoint_url=settings.S3_ENDPOINT_URL,
    )

    if not (settings.RENDER or s3.exists(s3_bucket)):
        s3.mkdir(s3_bucket)

    s3.put(dir_path, s3_bucket, recursive=True)


async def async_seed_db():
    path = DEFAULT_SOURCE_DIR
    s3_bucket = settings.S3_ASSET_BUCKET_NAME
    persist_dir = f"{settings.S3_BUCKET_NAME}"

    print("Copying documents to S3")
    copy_to_s3(path, s3_bucket)

    fs = get_s3_fs()

    print("Upserting records of pdf files into database")
    all_pdf_docs = [os.path.join(path, f) for f in os.listdir(path) if not f.startswith('.') and f.endswith('.pdf')]
    # TODO: for now it lives locally, but we want to move them to s3 buckets or equivalent 
    # can't do yet due to the url hack and the api endpoint relying on it (original design legacy)
    # fs.glob(f"{s3_bucket}/*.pdf")

    print("Indexing documents:\n")
    print(all_pdf_docs)

    all_docs = []
    print("Seeding storage context")
    for filename in all_pdf_docs:
        metadata = {"name": "good company", "doc_type": DocumentTypeEnum.ANNUAL_REPORT, "year": 2022}
        doc = await upsert_document.upsert_single_document(url=filename, metadata=metadata)
        all_docs = all_docs + fetch_and_read_document(doc)

        # Build index for the document
        service_context = get_tool_service_context([])
        await build_doc_id_to_index_map(service_context, [doc], fs=fs)

    # Build the KG here        
    print("Generating Knowledge Graph...\n")
    
    graph_store = SimpleGraphStore()
    storage_context = StorageContext.from_defaults(graph_store=graph_store)

    # Rebel supports up to 512 input tokens, but shorter sequences also work well
    llm = OpenAI(model="gpt-4", temperature=0)

    # Can customize various parameters of the service context
    # service_context = ServiceContext.from_defaults(
    #   llm=llm,
    #   embed_model=embed_model,
    #   node_parser=node_parser,
    #   prompt_helper=prompt_helper
    # )
    service_context = ServiceContext.from_defaults(llm=llm, chunk_size=512)

    # Building KG index automatically from the documents
    kg_index = KnowledgeGraphIndex.from_documents(
        all_docs,
        max_triplets_per_chunk=15,
        storage_context=storage_context,
        service_context=service_context,
        include_embeddings=True
    )

    # Here we can stick in whatever triplets we like, e.g.

    # kg_index.upsert_triplet(("James Kaberry", "is director of", "SME ANALYTICS & TECHNOLOGIES LIMITED"))

    kg_index.storage_context.persist(persist_dir=persist_dir)

    print(
        """
Done! 🏁
\t- PDF documents uploaded to the S3 assets bucket ✅
\t- Documents database table has been populated ✅
\t- Vector storage table has been seeded with embeddings ✅
\t- Knowledge graph index has been generated
    """.strip()
    )


def seed_db():
    asyncio.run(async_seed_db())


if __name__ == "__main__":
    Fire(seed_db)
