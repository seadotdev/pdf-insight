import logging
import io
import shutil

from typing import Annotated, List, Optional
from fastapi import APIRouter, Form, HTTPException, Response, File, UploadFile
from app.api import crud
from app.chat.engine import build_doc_id_to_index_map, fetch_and_read_document, get_s3_fs, get_tool_service_context
from app.db.session import SessionLocal
from app.schemas.pydantic_schema import Document, DocumentMetadata

 
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{filename}")
async def retrieve(filename: str):
    with open(f'data/{filename}', 'rb') as f:
        return Response(io.BytesIO(f.read()).getvalue(), media_type="application/pdf")

# File uploads 
@router.post("/upload")
async def upload_file(file: Annotated[UploadFile, File()], company_name: Annotated[str, Form()], document_type: Annotated[str, Form()]):
    logger.info(f"Uploading: {file.filename}...")
    if file.content_type != "application/pdf":
        logger.error("Can only upload pdf files. {file.content_type} not supported")
        raise HTTPException(status_code=422, detail="Can only upload pdf files. {file.content_type} not supported")

    with open(f'data/{file.filename}', 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info(f"File uploaded: {file.filename}")

    metadata = { "name": company_name, "doc_type": document_type, "year": 2022 }
    doc = Document(url=f"data/{file.filename}", metadata_map=metadata)
    async with SessionLocal() as db:
        document = await crud.upsert_document(db, doc)

    fs = get_s3_fs()
    service_context = get_tool_service_context([])
    await build_doc_id_to_index_map(service_context, [document], fs=fs)
    
    return {"status": "OK", "filename": file.filename}