import _ from "lodash";
import { MAX_NUMBER_OF_SELECTED_DOCUMENTS } from "~/hooks/useDocumentSelector";
import { type Document, DocumentType, type BackendDocument } from "~/types/document";
import type { SelectOption } from "~/types/selection";
import { documentColors } from "~/utils/colors";
import { backendUrl } from "~/config";

export const documentTypeOptions = [
    { value: DocumentType.CONFIRMATION_STATEMENT, label: DocumentType.CONFIRMATION_STATEMENT },
    { value: DocumentType.ANNUAL_REPORT, label: DocumentType.ANNUAL_REPORT },
] as SelectOption[];

export function filterByNameAndType(name: string, docType: DocumentType, documents: Document[]): Document[] {
    if (!name) {
        return [];
    }

    return documents.filter((document) => document.name === name && document.docType === docType);
}

export function getAvailableYears(name: string, type: DocumentType, documents: Document[]): SelectOption[] {
    const docs = filterByNameAndType(name, type, documents);
    const yearOptions: SelectOption[] = docs.map((doc: Document): SelectOption => { return ({ value: doc.year, label: doc.year }); });
    const uniqueYearOptions = _.uniqBy(yearOptions, 'label');

    return uniqueYearOptions;
}

export function getAllNames(documents: Document[]) {
    return (documents.map((doc: Document): string => { return doc.name; }))
}

export function findDocumentById(
    id: string,
    documents: Document[]
): Document | null {
    return documents.find((val) => val.id === id) || null;
}

export function sortDocuments(selectedDocuments: Document[]): Document[] {
    return selectedDocuments.sort((a, b) => {
        // Sort by name
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison !== 0) return nameComparison;

        // If names are equal, sort by year
        return a.year.localeCompare(b.year);
    });
}

export function sortSelectOptions(options: SelectOption[] | null = []): SelectOption[] {
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
            url: `${backendUrl}${backendDoc.url}`,
            year: backendDoc.metadata_map.year.toString(),
            name: `${backendDoc.metadata_map.name}`,
            ticker: `${backendDoc.id}`,
            docType: backendDoc.metadata_map.doc_type,
            color: documentColors[colorIndex],
        } as Document;

        frontendDocs.push(payload);
    });

    return frontendDocs;
};
