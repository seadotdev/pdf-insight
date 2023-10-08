import logging
import io
import requests
import shutil
import re

from datetime import date

from typing import Annotated, List
from fastapi import APIRouter, Form, HTTPException, Response, File, UploadFile
from app.api import crud
from app.chat.engine import build_doc_id_to_index_map, get_s3_fs, get_tool_service_context
from app.db.session import SessionLocal
from app.schemas.pydantic_schema import CHFiling, Document, DocumentTypeEnum
from app.core.config import settings


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{filename}")
async def retrieve(filename: str) -> Response:
    fs = get_s3_fs()
    with fs.open(f"{settings.S3_ASSET_BUCKET_NAME}/{filename}", "rb") as f:
        return Response(io.BytesIO(f.read()).getvalue(), media_type="application/pdf")


@router.post("/upload")
async def upload_file(file: Annotated[UploadFile, File()], company_name: Annotated[str, Form()], document_type: Annotated[str, Form()]) -> Response:
    logger.info(f"Uploading: {file.filename}...")
    if file.content_type != "application/pdf":
        logger.error(
            f"Can only upload pdf files. {file.content_type} not supported")
        
        raise HTTPException(status_code=422, detail=f"Can only upload pdf files. {file.content_type} not supported")

    fs = get_s3_fs()
    with fs.open(f"{settings.S3_ASSET_BUCKET_NAME}/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info(f"File uploaded: {file.filename}\nIndexing...\n")

    metadata = {"name": company_name, "doc_type": document_type, "year": 2022}
    doc = Document(url=f"data/{file.filename}", metadata_map=metadata)
    async with SessionLocal() as db:
        document = await crud.upsert_document(db, doc)

    # Build index for the document
    service_context = get_tool_service_context([])
    await build_doc_id_to_index_map(service_context, [document], fs=fs)

    return Response(status_code=200)


@router.post("/search-ch")
async def upload_from_ch(data: CHFiling) -> Response:
    """
    Upload a filing from Companies House
    """

    url_base = "https://api.company-information.service.gov.uk/"

    # Fetch the company details
    company_details_url = url_base + re.sub(r"/filing-history.+$", "", data.links.self)
    company_data = requests.get(company_details_url, headers={'Authorization': settings.CH_API_KEY}).json()
    company_name = company_data["company_name"]

    response = requests.get(data.links.document_metadata, auth=(settings.CH_API_KEY, ''))
    metadata = response.json()
    doc_link = metadata['links']['document']
    doc_response = requests.get(doc_link, auth=(settings.CH_API_KEY, ''), headers={'Accept': 'application/pdf'})

    url = f"data/{metadata['filename']}.pdf"
    with open(url, "wb") as f:
        f.write(doc_response.content)

    metadata = {
        "name": company_name,
        # TODO: hard code for now, will have to map CH categories to our metadata type enum
        "doc_type": DocumentTypeEnum.ANNUAL_REPORT,
        "year": date.fromisoformat(data.date).year
    }
    doc = Document(url=url, metadata_map=metadata)
    async with SessionLocal() as db:
        document = await crud.upsert_document(db, doc)

    fs = get_s3_fs()
    service_context = get_tool_service_context([])
    await build_doc_id_to_index_map(service_context, [document], fs=fs)

    return Response(status_code=200)
