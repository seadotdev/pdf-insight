import { backendUrl } from "~/config";
import { DocumentColorEnum } from "~/utils/colors";

// We define a flexible structure to account for changes in the backend schema
// Only require essential values
export interface DocumentSchema {
    id: string;
    url: string;
    created_at: string;
    updated_at: string;
    metadata_map: {
        doc_type: string;
        year: number;
        name: string;
    };
    [key: string]: any;
}

export interface Document {
    id: string;
    url: string;
    name: string;
    year: string;
    docType: string;
    color: DocumentColorEnum;
}

export function fromBackendSchema(backendDoc: DocumentSchema): Document {
    return {
        id: backendDoc.id,
        url: `${backendUrl}${backendDoc.url}`,
        year: backendDoc.metadata_map.year.toString(),
        name: backendDoc.metadata_map.name,
        docType: backendDoc.metadata_map.doc_type,
        color: DocumentColorEnum.lime,
    } as Document;
}