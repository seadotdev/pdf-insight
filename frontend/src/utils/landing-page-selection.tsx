import { DocumentType } from "~/types/document";
import type { Document } from "~/types/document";

import type { SelectOption } from "~/types/selection";
import { filterByTickerAndType } from "./documents";

export const documentTypeOptions = [
  { value: DocumentType.CONFIRMATION_STATEMENT, label: DocumentType.CONFIRMATION_STATEMENT },
  { value: DocumentType.ANNUAL_REPORT, label: DocumentType.ANNUAL_REPORT },
] as SelectOption[];

function documentToYearOption(document: Document): SelectOption {
  return {
    value: document.id,
    label: "2022",
  };
}

export function getAvailableYears(ticker: string, type: DocumentType, documents: Document[]): SelectOption[] {
  const docs = filterByTickerAndType(ticker, type, documents);
  const yearOptions: SelectOption[] = documents.map(documentToYearOption);

  return yearOptions;
}
