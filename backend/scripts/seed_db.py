import asyncio
import argparse

from app.chat.engine import get_s3_fs
from app.db.models.base import KnowledgeGraph
from app.schemas.pydantic_schema import DocumentTypeEnum
from app.api.crud import create_kg_index, fetch_kg_index
from app.db.session import SessionLocal
from app.core.config import settings

from llama_index import (
    ServiceContext,
    KnowledgeGraphIndex,
    load_index_from_storage,
)
from llama_index.graph_stores import KuzuGraphStore
from llama_index.graph_stores import SimpleGraphStore
from llama_index.node_parser import SimpleNodeParser
from llama_index.storage.storage_context import StorageContext
from llama_index.llms import OpenAI


# Create empty KG
async def build_kg():
    persist_dir = f"{settings.S3_BUCKET_NAME}"
    s3_fs = get_s3_fs()

    # Build the KG here
    print("Generating Knowledge Graph...\n")

    graph_store = SimpleGraphStore(fs=s3_fs, persist_dir=persist_dir)
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

    # Load the index id from db
    async with SessionLocal() as db:
        index_id = await fetch_kg_index(db)

    kg_index = load_index_from_storage(
        storage_context=storage_context,
        service_context=service_context,
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

    kg_index.upsert_triplet(("BANK TECH", "is acquired by", "SME TECHNOLOGIES"))
    kg_index.upsert_triplet(("SME TECHNOLOGIES", "has acquired", "BANK TECH"))

    # Store the index in the s3 bucket
    kg_index.storage_context.persist(persist_dir=persist_dir, fs=s3_fs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='KG Seeder', description='I seed the KG', epilog='Good luck!')
    parser.add_argument('action', choices=['build', 'update', 'create_table'], help='What to do?')

    args = parser.parse_args()
    if args.action == 'build':
        asyncio.run(build_kg())
    elif args.action == 'update':
        kg_index = asyncio.run(update_kg())
        print(f'🚨 put this in the engine yo! just search for index_id="{kg_index.index_id}"')
    else:
        raise ValueError('Invalid action')