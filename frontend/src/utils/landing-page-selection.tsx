import { DocumentType } from "~/types/document";
import type { Document } from "~/types/document";

import type { SelectOption } from "~/types/selection";
import { filterByTickerAndType } from "./documents";

export const documentTypeOptions = [
  { value: DocumentType.BALANCE_SHEET, label: DocumentType.BALANCE_SHEET },
  { value: DocumentType.ANNUAL_REPORT, label: DocumentType.ANNUAL_REPORT },
] as SelectOption[];

function documentToYearOption(document: Document): SelectOption {
  return {
    value: document.id,
    label: document.year,
  };
}

export function getAvailableYears(
  ticker: string,
  type: DocumentType,
  documents: Document[]
): SelectOption[] {
  const docs = filterByTickerAndType(ticker, type, documents);
  const yearOptions: SelectOption[] = docs.map(documentToYearOption);
  return yearOptions;
}
