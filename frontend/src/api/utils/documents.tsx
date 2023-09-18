import { MAX_NUMBER_OF_SELECTED_DOCUMENTS } from "~/hooks/useDocumentSelector";
import { BackendDocument, BackendDocumentType } from "~/types/backend/document";
import { Document, DocumentType } from "~/types/document";
import { documentColors } from "~/utils/colors";

export const fromBackendDocumentToFrontend = (
  backendDocuments: BackendDocument[]
) => {
  const frontendDocs: Document[] = [];
  backendDocuments.map((backendDoc, index) => {
    const backendDocType = BackendDocumentType.ANNUAL_REPORT;
    const frontendDocType = backendDocType === BackendDocumentType.ANNUAL_REPORT ? DocumentType.ANNUAL_REPORT : DocumentType.BALANCE_SHEET;

    // we have 10 colors for 10 
    const colorIndex = index < MAX_NUMBER_OF_SELECTED_DOCUMENTS ? index : 0;
    const payload = {
      id: backendDoc.id,
      url: `http://localhost:8000/api/${backendDoc.url}`,
      year: "2022", // change this once we have some metadata
      fullName: "Random Doc",
      ticker: backendDoc.id,
      docType: frontendDocType,
      color: documentColors[colorIndex],
    } as Document;
    frontendDocs.push(payload);
  });

  return frontendDocs;
};
