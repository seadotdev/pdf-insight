import _ from "lodash";
import { type Document } from "~/types/document";
import type { SelectOption } from "~/types/selection";

export function filterByNameAndType(name: string, docType: string, documents: Document[]): Document[] {
    if (!name)
        return [];

    return documents.filter((document) => document.name === name && document.docType === docType);
}

export function getAvailableYears(name: string, type: string, documents: Document[]): SelectOption[] {
    const docs = filterByNameAndType(name, type, documents);
    const yearOptions: SelectOption[] = docs.map((doc: Document): SelectOption => { return ({ value: doc.year, label: doc.year }); });
    const uniqueYearOptions = _.uniqBy(yearOptions, 'label');

    return uniqueYearOptions;
}

export function getAllNames(documents: Document[]) {
    return (documents.map((doc: Document): string => { return doc.name; }))
}

export function findDocumentById(id: string, documents: Document[]): Document | null {
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