import logging

from typing import Any, List, Optional
from fastapi import Depends, APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.api import crud
from app.schemas import pydantic_schema

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def get_documents(document_ids: Optional[List[UUID]] = Query(None), db: AsyncSession = Depends(get_db)) -> List[pydantic_schema.Document]:
    """
    Get all documents or documents by their ids
    """
    if document_ids is None:
        # If no ids provided, fetch all documents
        docs = await crud.fetch_documents(db)
    else:
        # If ids are provided, fetch documents by ids
        docs = await crud.fetch_documents(db, ids=document_ids)

    if len(docs) == 0:
        raise HTTPException(status_code=404, detail="Document(s) not found")

    return docs


# Make sure this comes before the individual document routing
@router.get("/types")
async def get_document_types() -> List[pydantic_schema.DocumentTypeEnum]:
    """
    Used to return the currently supported document types (for custom upload etc)
    We fetch from backend to avoid duplicate definitions
    """
    return([t.value for t in pydantic_schema.DocumentTypeEnum])


# Make sure this comes before the individual document routing
@router.get("/schema")
async def get_document_schema(document_type: str) -> List[str]:
    """
    Get the schema mapping for selected document type
    """
    return(pydantic_schema.DocumentMetadata.list_properties())


@router.get("/{document_id}")
async def get_document(document_id: UUID, db: AsyncSession = Depends(get_db)) -> pydantic_schema.Document:
    """
    Get document by UUID
    """
    docs = await crud.fetch_documents(db, id=document_id)
    if len(docs) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    # Make sure there's no random duplicates
    assert(len(docs) == 1)

    return docs[0]