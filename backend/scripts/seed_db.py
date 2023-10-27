import asyncio
import json
import os
from app.chat.engine import build_doc_id_to_index_map, fetch_and_read_document, get_s3_fs, get_tool_service_context
from app.schemas.pydantic_schema import DocumentTypeEnum
import s3fs
from app.api.crud import create_kg_index, fetch_kg_index
from app.db.session import SessionLocal
import upsert_document
from pathlib import Path
from fire import Fire
from app.core.config import settings
from typing import List
from download_sec_pdf import DEFAULT_SOURCE_DIR

from llama_index.schema import Document as LlamaIndexDocument
from llama_index import (
    LLMPredictor,
    ServiceContext,
    KnowledgeGraphIndex,
    load_graph_from_storage,
    load_index_from_storage,
)
from llama_index.graph_stores import KuzuGraphStore
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
    s3_bucket = settings.S3_ASSET_BUCKET_NAME
    persist_dir = f"{settings.S3_BUCKET_NAME}"
    fs = get_s3_fs()

    path = DEFAULT_SOURCE_DIR
    print("Copying documents to S3")
    copy_to_s3(path, s3_bucket)

    print("Upserting records of pdf files into database")
    all_pdf_docs = [os.path.join(path, f) for f in os.listdir(
        path) if not f.startswith('.') and f.endswith('.pdf')]
    # TODO: for now it lives locally, but we want to move them to s3 buckets or equivalent
    # can't do yet due to the url hack and the api endpoint relying on it (original design legacy)
    # fs.glob(f"{s3_bucket}/*.pdf")

    print("Indexing documents:\n")
    print(all_pdf_docs)

    print("Seeding storage context")
    for filename in all_pdf_docs:
        print(f"Processing {filename}...\n")

        # Placeholder metadata, need a more robust way of populating this stuff
        metadata = {"name": "Good Company Inc",
                    "doc_type": DocumentTypeEnum.ANNUAL_REPORT, "year": 2022}
        doc = await upsert_document.upsert_single_document(url=filename, metadata=metadata)

        # This is one of the SMEC documents, use this for now to generate KG, if we want to use any docs to initialize
        # if(filename == "data/12592114_aa_2023-08-04.pdf"):
        #     kg_docs = kg_docs + fetch_and_read_document(doc)

        # Build index for the document
        service_context = get_tool_service_context([])
        await build_doc_id_to_index_map(service_context, [doc], fs=fs)

    print(
        """
Done! 🏁
\t- PDF documents uploaded to the S3 assets bucket ✅
\t- Documents database table has been populated ✅
\t- Vector storage table has been seeded with embeddings ✅
\t- Knowledge graph index has been generated
    """.strip()
    )


async def build_kg():
    persist_dir = f"{settings.S3_BUCKET_NAME}"
    s3_fs = get_s3_fs()

    # Build the KG here
    print("Generating Knowledge Graph...\n")

    graph_store = KuzuGraphStore(fs=s3_fs, persist_dir=persist_dir)
    storage_context = StorageContext.from_defaults(graph_store=graph_store, fs=s3_fs, persist_dir=persist_dir)
    service_context = ServiceContext.from_defaults()

    # Building an empty KG (can override with json input or seed with some custom data)
    # KnowledgeGrapIndex will also build a vectorstore alongside the graphstore by default
    kg_index = KnowledgeGraphIndex.from_documents(
        [],
        storage_context=storage_context,
        service_context=service_context,
        include_embeddings=False
    )

    # Persist the index in db
    async with SessionLocal() as db:
        await create_kg_index(db, kg_index.index_id)

    # Make note of the index id, because might need to specify it when loading
    print(f"Index Id: {kg_index.index_id}\n")

    # is director of
    # is shareholder of
    
    # is subsidiary of - check how this is done on CH

    # SME ltd is shareholder of SME Tech Ltd

    # Store the index in the s3 bucket
    print(f"Persisting in {persist_dir}\n")
    kg_index.storage_context.persist(persist_dir=persist_dir, fs=s3_fs)

    return kg_index.index_id


async def load_kg():
    # Loading the index
    s3_fs = get_s3_fs()
    persist_dir = f"{settings.S3_BUCKET_NAME}"

    # Rebel supports up to 512 input tokens, but shorter sequences also work well
    llm = OpenAI(model="gpt-4", temperature=0)
    service_context = ServiceContext.from_defaults(llm=llm, chunk_size=512)
    storage_context = StorageContext.from_defaults(fs=s3_fs, persist_dir=persist_dir)

    # Can customize various parameters of the service context
    # service_context = ServiceContext.from_defaults(
    #   llm=llm,
    #   embed_model=embed_model,
    #   node_parser=node_parser,
    #   prompt_helper=prompt_helper
    # )
    
    async with SessionLocal() as db:
        index_id = await fetch_kg_index(db)

    kg_index = load_index_from_storage(
        storage_context=storage_context,
        service_context=service_context,
        index_id=index_id,
        verbose=True,
    )

    return kg_index

async def update_kg():
    s3_fs = get_s3_fs()
    persist_dir = f"{settings.S3_BUCKET_NAME}"
    kg_index = await load_kg()

    kg_index.upsert_triplet(("Peter Berry", "is shareholder of", "SME LENDING"))
    kg_index.upsert_triplet(("Peter Berry", "is shareholder of", "SME TECHNOLOGIES"))
    
    kg_index.upsert_triplet(("Andy Davis", "is shareholder of", "SME LENDING"))
    kg_index.upsert_triplet(("Andy Davis", "is shareholder of", "SME TECHNOLOGIES"))

    kg_index.upsert_triplet(("Ronnie Jayson", "is shareholder of", "SME TECHNOLOGIES"))

    kg_index.upsert_triplet(("John Roberts", "is shareholder of", "BANK TECH"))
    kg_index.upsert_triplet(("Sarah Smith", "is shareholder of", "BANK TECH"))
    

    kg_index.upsert_triplet(("SME LENDING", "has shareholder", "Peter Berry"))
    kg_index.upsert_triplet(("SME TECHNOLOGIES", "has shareholder", "Peter Berry"))
    kg_index.upsert_triplet(("SME LENDING", "has shareholder", "Andy Davis"))
    kg_index.upsert_triplet(("SME TECHNOLOGIES", "has shareholder", "Andy Davis"))
    kg_index.upsert_triplet(("SME TECHNOLOGIES", "has shareholder", "Ronnie Jayson"))
    kg_index.upsert_triplet(("BANK TECH", "has shareholder", "John Roberts"))
    kg_index.upsert_triplet(("BANK TECH", "has shareholder", "Sarah Smith"))

    # Store the index in the s3 bucket
    kg_index.storage_context.persist(persist_dir=persist_dir, fs=s3_fs)


def seed_db():
    asyncio.run(async_seed_db())


if __name__ == "__main__":
    # builds kg
    # index_id = asyncio.run(build_kg())
    
    # Loads from data/ into the vector store 
    # Fire(async_seed_db)

    # loads index from virtual S3
    kg_index = asyncio.run(update_kg())
    # print(f'🚨 put this in the engine yo! just search for index_id="{kg_index.index_id}"')