import logging

from typing import List, Iterator, cast

from app.schemas.pydantic_schema import (
    Document as DocumentSchema,
    DocumentTypeEnum,
    DocumentMetadata,
)
from app.core.config import settings

from llama_index.tools import FunctionTool, ToolMetadata, QueryEngineTool
from llama_index.indices.service_context import ServiceContext
from llama_index.agent import OpenAIAgent


logger = logging.getLogger(__name__)


def build_title_for_document(document: DocumentSchema) -> str:
    return ("Company Metadata")


def get_tool_metadata_for_document(doc: DocumentSchema) -> ToolMetadata:
    doc_title = build_title_for_document(doc)
    name = f"extract_json_from_sec_document[{doc_title}]"
    description = f"Returns basic financial data extracted from the company documents {doc_title}"

    return ToolMetadata(name=name, description=description)
