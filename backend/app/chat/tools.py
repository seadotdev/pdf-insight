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
    # sec_metadata = DocumentMetadata.parse_obj(
    #     document.metadata_map[DocumentMetadataKeysEnum.SEC_DOCUMENT]
    # )
    # time_period = (
    #     f"{sec_metadata.year} Q{sec_metadata.quarter}"
    #     if sec_metadata.quarter is not None
    #     else str(sec_metadata.year)
    # )
    # return f"{sec_metadata.company_name} ({sec_metadata.company_ticker}) {sec_metadata.doc_type.value} ({time_period})"
    return ("Company Metadata")


def describe_financials(financials: StockFinancial) -> str:
    sentences: List[str] = []

    company = financials.company_name
    fiscal_year = financials.fiscal_year
    fiscal_period = financials.fiscal_period

    sentences.append(
        f"For {company} in fiscal year {fiscal_year} covering the period {fiscal_period}:")

    income_statement = financials.financials.income_statement

    if income_statement:
        revenues = income_statement.revenues
        if revenues:
            revenue_str = f"{revenues.label}: {revenues.value} {revenues.unit}"
            sentences.append(f"Revenues were {revenue_str}.")

        expenses = income_statement.operating_expenses
        if expenses:
            expenses_str = f"{expenses.label}: {expenses.value} {expenses.unit}"
            sentences.append(f"Operating expenses were {expenses_str}.")

        gross_profit = income_statement.gross_profit
        if gross_profit:
            gross_profit_str = f"{gross_profit.value} {gross_profit.unit}"
            sentences.append(f"Gross profit was {gross_profit_str}.")

    net_income = (
        financials.financials.comprehensive_income.comprehensive_income_loss_attributable_to_parent
    )
    if net_income:
        net_income_str = f"{net_income.label}: {net_income.value} {net_income.unit}"
        sentences.append(f"Net income was {net_income_str}.")

    cash_flows = financials.financials.cash_flow_statement
    if cash_flows:
        operating_cash_flows = cash_flows.net_cash_flow
        if operating_cash_flows:
            operating_str = f"{operating_cash_flows.label}: {operating_cash_flows.value} {operating_cash_flows.unit}"
            sentences.append(
                f"Net cash from operating activities was {operating_str}.")

        financing_cash_flows = cash_flows.net_cash_flow_from_financing_activities
        if financing_cash_flows:
            financing_str = f"{financing_cash_flows.label}: {financing_cash_flows.value} {financing_cash_flows.unit}"
            sentences.append(
                f"Net cash from financing activities was {financing_str}.")

    return " ".join(sentences)


def get_tool_metadata_for_document(doc: DocumentSchema) -> ToolMetadata:
    doc_title = build_title_for_document(doc)
    name = f"extract_json_from_sec_document[{doc_title}]"
    description = f"Returns basic financial data extracted from the company documents {doc_title}"

    return ToolMetadata(name=name, description=description)
