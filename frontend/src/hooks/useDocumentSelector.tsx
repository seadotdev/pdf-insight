import { useState, useEffect, useRef } from "react";
import { GroupBase } from "react-select";
import Select from "react-select/dist/declarations/src/Select";
import { Document, DocumentType } from "~/types/document";
import type { SelectOption } from "~/types/selection";
import { findDocumentById, getAllNames, sortDocuments, sortSelectOptions, documentTypeOptions, getAvailableYears } from "~/utils/doc-selection";
import useLocalStorage from "./utils/useLocalStorage";
import { backendClient } from "~/api/backendClient";

export const MAX_NUMBER_OF_SELECTED_DOCUMENTS = 10;

export const useDocumentSelector = () => {
    const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
    const [availableNames, setAvailableNames] = useState<string[]>([]);
    const availableDocumentTypes = documentTypeOptions;
    const [availableYears, setAvailableYears] = useState<SelectOption[] | null>(null);
    const sortedAvailableYears = sortSelectOptions(availableYears);

    useEffect(() => {
        setAvailableNames(getAllNames(availableDocuments));
    }, [availableDocuments]);

    useEffect(() => {
        backendClient.fetchDocuments()
            .then(docs => setAvailableDocuments(docs))
            .catch(() => console.error("could not fetch documents"));
    }, []);

    const [selectedDocuments, setSelectedDocuments] = useLocalStorage<Document[]>("selectedDocuments", []);
    const sortedSelectedDocuments = sortDocuments(selectedDocuments);

    const [selectedCompany, setSelectedCompany] = useState<Document | null>(null);
    const [selectedDocumentType, setSelectedDocumentType] =
        useState<SelectOption | null>(null);
    const [selectedYear, setSelectedYear] = useState<SelectOption | null>(null);

    const handleAddDocument = () => {
        if (selectedCompany && selectedDocumentType && selectedYear) {
            setSelectedDocuments((prevDocs = []) => {
                if (prevDocs.find((doc) => doc.id === selectedCompany.id)) {
                    return prevDocs;
                }

                return [selectedCompany, ...prevDocs];
            });

            setSelectedCompany(null);
            setSelectedDocumentType(null);
            setSelectedYear(null);
        }
    };

    const handleRemoveDocument = (documentIndex: number) => {
        setSelectedDocuments((prevDocs) =>
            prevDocs.filter((_, index) => index !== documentIndex)
        );
    };

    useEffect(() => {
        setSelectedDocumentType(null);
        setSelectedYear(null);
    }, [selectedCompany]);

    useEffect(() => {
        setSelectedYear(null);
    }, [selectedDocumentType]);

    useEffect(() => {
        if (selectedCompany && selectedDocumentType) {
            setAvailableYears(
                getAvailableYears(selectedCompany.name, selectedDocumentType?.value as DocumentType, availableDocuments)
            );
        }
    }, [selectedCompany, selectedDocumentType, availableDocuments]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                (event.key === "Enter" && event.shiftKey) ||
                (event.key === "Enter" && event.metaKey)
            ) {
                handleAddDocument();
            }
            if (event.key === "k" && event.metaKey) {
                setShouldFocusCompanySelect(true);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleAddDocument]);

    const isDocumentSelectionEnabled =
        selectedDocuments.length < MAX_NUMBER_OF_SELECTED_DOCUMENTS;

    const isStartConversationButtonEnabled = selectedDocuments.length > 0;

    const selectCompany = (company: Document) => {
        setSelectedCompany(company);
        setFocusDocumentType(true);
    };

    const selectDocumentType = (docType: SelectOption | null) => {
        setSelectedDocumentType(docType);
        setFocusYear(true);
    };

    const [shouldFocusCompanySelect, setShouldFocusCompanySelect] = useState(false);

    const [focusYear, setFocusYear] = useState(false);
    const yearFocusRef = useRef<Select<
        SelectOption,
        false,
        GroupBase<SelectOption>
    > | null>(null);

    useEffect(() => {
        if (focusYear && yearFocusRef.current) {
            yearFocusRef.current?.focus();
            setFocusYear(false);
        }
    }, [focusYear]);

    const [focusDocumentType, setFocusDocumentType] = useState(false);
    const documentTypeFocusRef = useRef<Select<
        SelectOption,
        false,
        GroupBase<SelectOption>
    > | null>(null);

    useEffect(() => {
        if (focusDocumentType && documentTypeFocusRef.current) {
            documentTypeFocusRef.current?.focus();
            setFocusDocumentType(false);
        }
    }, [focusDocumentType]);

    return {
        availableDocuments,
        availableNames,
        availableDocumentTypes,
        availableYears,
        sortedAvailableYears,
        selectedDocuments,
        sortedSelectedDocuments,
        selectedName: selectedCompany,
        selectedDocumentType,
        selectedYear,
        setSelectedYear,
        handleAddDocument,
        handleRemoveDocument,
        isDocumentSelectionEnabled,
        isStartConversationButtonEnabled,
        yearFocusRef,
        documentTypeFocusRef,
        selectedCompany,
        selectCompany,
        selectDocumentType,
        shouldFocusCompanySelect,
        setShouldFocusCompanySelect,
    };
};
