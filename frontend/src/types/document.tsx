import type { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
    ANNUAL_REPORT = "Annual Report",
    CONFIRMATION_STATEMENT = "Confirmation Statement"
}

export interface Document {
    id: string;
    url: string;
    name: string;
    year: string;
    docType: DocumentType;
    color: DocumentColorEnum;
}

export interface BackendDocument {
    id: string;
    created_at: string;
    updated_at: string;
    url: string;
    metadata_map: {
        doc_type: DocumentType;
        year: number;
        name: string;
    }
}