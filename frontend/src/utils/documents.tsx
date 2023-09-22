import { MAX_NUMBER_OF_SELECTED_DOCUMENTS } from "~/hooks/useDocumentSelector";
import { Document, Ticker, DocumentType, BackendDocument } from "~/types/document";
import { SelectOption } from "~/types/selection";
import { documentColors } from "~/utils/colors";

export function getAllTickers(documents: Document[]): Ticker[] {
  const result: Ticker[] = [];
  const seen: { [key: string]: boolean } = {};

  for (const doc of documents) {
    // Skip if we've seen this ticker before
    if (seen[doc.ticker])
      continue;

    seen[doc.ticker] = true;
    result.push({fullName: doc.fullName, ticker: doc.ticker});
  }

  return result;
}

export function filterByTickerAndType(
  ticker: string,
  docType: DocumentType,
  documents: Document[]
): Document[] {
  if (!ticker) {
    return [];
  }
  return documents.filter(
    (document) => document.ticker === ticker && document.docType === docType
  );
}

export function findDocumentById(
  id: string,
  documents: Document[]
): Document | null {
  return documents.find((val) => val.id === id) || null;
}

export function sortDocuments(selectedDocuments: Document[]): Document[] {
  return selectedDocuments.sort((a, b) => {
    // Sort by fullName
    const nameComparison = a.fullName.localeCompare(b.fullName);
    if (nameComparison !== 0) return nameComparison;

    // If fullNames are equal, sort by year
    return a.year.localeCompare(b.year);
  });
}

export function sortSelectOptions(
  options: SelectOption[] | null = []
): SelectOption[] {
  if (!options) {
    return [];
  }

  return options.sort((a, b) => parseInt(a.label) - parseInt(b.label));
}

export const fromBackendDocumentToFrontend = (backendDocuments: BackendDocument[]) => {
  const frontendDocs: Document[] = [];
  backendDocuments.map((backendDoc, index) => {
    // we have 10 colors for 10 
    const colorIndex = index < MAX_NUMBER_OF_SELECTED_DOCUMENTS ? index : 0;

    // fill this with metadata from the backend doc  
    const payload = {
      id: backendDoc.id,
      url: `http://localhost:8000/api/${backendDoc.url}`,
      year: "2022", // change this once we have some metadata
      fullName: `${backendDoc.url}`,
      ticker: `${backendDoc.id}`,
      docType: backendDoc.docType,
      color: documentColors[colorIndex],
    } as Document;
    frontendDocs.push(payload);
  });

  return frontendDocs;
};
