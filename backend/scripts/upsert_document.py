import asyncio

from fire import Fire
from app.schemas.pydantic_schema import Document, DocumentMetadata
from app.db.session import SessionLocal
from app.api import crud


async def upsert_single_document(url: str, metadata : DocumentMetadata) -> Document:
    """
    Upserts a single document into the database using its URL.
    """

    doc = Document(url=url, metadata_map=metadata)
    async with SessionLocal() as db:
        document = await crud.upsert_document(db, doc)
        print(f"Upserted document. Database ID:\n{document.id}")

    return document

def main_upsert_single_document(doc_url: str):
    """
    Script to upsert a single document by URL. metada_map parameter will be empty dict ({})
    This script is useful when trying to use your own PDF files.
    """

    asyncio.run(upsert_single_document(doc_url))


if __name__ == "__main__":
    Fire(main_upsert_single_document)
