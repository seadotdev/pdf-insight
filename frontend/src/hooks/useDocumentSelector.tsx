import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import type { GroupBase } from "react-select";
import type Select from "react-select/dist/declarations/src/Select";
import type { Document } from "~/types/document";
import type { SelectOption } from "~/types/selection";
import { getAllNames, sortDocuments, sortSelectOptions, getAvailableYears } from "~/utils/doc-selection";
import useLocalStorage from "./utils/useLocalStorage";
import { backendClient } from "~/api/backendClient";

export const MAX_NUMBER_OF_SELECTED_DOCUMENTS = 10;

enum ActionTypeEnum {
    setAvailableDocuments = "SET_AVAILABLE_DOCUMENTS",
    setAvailableDocTypes = "SET_AVAILABLE_DOCUMENT_TYPES",
    setAvailableYears = "SET_AVAILABLE_YEARS",
    setAvailableCompanyNames = "SET_AVAILABLE_COMPANY_NAMES",

    setSelectedYear = "SET_SELECTED_YEAR",
    setSelectedCompany = "SET_SELECTED_COMPANY",
    setSelectedDocumentType = "SET_SELECTED_DOCUMENT_TYPE",
}

class DocumentSelectorState {
    availableDocuments: Document[] = [];
    availableCompanyNames: string[] = [];
    availableDocumentTypes: SelectOption[] = [];
    availableYears: SelectOption[] = [];

    selectedCompany: Document | null = null;
    selectedDocumentType: SelectOption | null = null;
    selectedYear: SelectOption | null = null;
}

type Action =
    | { type: ActionTypeEnum.setAvailableDocuments; payload: Document[] }
    | { type: ActionTypeEnum.setAvailableDocTypes; payload: SelectOption[] }
    | { type: ActionTypeEnum.setAvailableYears; payload: SelectOption[] }
    | { type: ActionTypeEnum.setAvailableCompanyNames; payload: string[] }
    | { type: ActionTypeEnum.setSelectedYear; payload: SelectOption | null }
    | { type: ActionTypeEnum.setSelectedCompany; payload: Document | null }
    | { type: ActionTypeEnum.setSelectedDocumentType; payload: SelectOption | null };

function reducer(state: DocumentSelectorState, action: Action) {
    switch (action.type) {
        case ActionTypeEnum.setAvailableDocuments:
            return {
                ...state,
                availableDocuments: action.payload,
            };
        case ActionTypeEnum.setAvailableDocTypes:
            return {
                ...state,
                availableDocumentTypes: action.payload,
            };
        case ActionTypeEnum.setAvailableYears:
            return {
                ...state,
                availableYears: action.payload,
            };
        case ActionTypeEnum.setAvailableCompanyNames:
            return {
                ...state,
                availableCompanyNames: action.payload,
            };
        case ActionTypeEnum.setSelectedYear:
            return {
                ...state,
                selectedYear: action.payload,
            };
        case ActionTypeEnum.setSelectedCompany:
            return {
                ...state,
                selectedCompany: action.payload,
            };
        case ActionTypeEnum.setSelectedDocumentType:
            return {
                ...state,
                selectedDocumentType: action.payload,
            };
        default:
            throw new Error();
    }
}


/**
 * Custom hook for managing document selection state and available options.
 * @returns An object containing the available document types and the selected year.
 */
export const useDocumentSelector = () => {
    const [state, dispatch] = useReducer(reducer, new DocumentSelectorState());
    const [selectedDocuments, setSelectedDocuments] = useLocalStorage<Document[]>("selectedDocuments", []);
    const sortedAvailableYears = sortSelectOptions(state.availableYears);
    const sortedSelectedDocuments = sortDocuments(selectedDocuments);
    
    // Fetch documents from backend on mount
    useEffect(() => {
        backendClient.fetchDocuments()
            .then(docs => dispatch({ type: ActionTypeEnum.setAvailableDocuments, payload: docs }))
            .catch(() => console.error("Could not fetch documents"));
    }, []);

    // Update available company names and document types when available documents change
    useEffect(() => {
        dispatch({
            type: ActionTypeEnum.setAvailableCompanyNames,
            payload: getAllNames(state.availableDocuments),
        });
        dispatch({
            type: ActionTypeEnum.setAvailableDocTypes,
            payload: state.availableDocuments.map((doc: Document): SelectOption => ({
                label: doc.docType,
                value: doc.docType,
            }))
        });
    }, [state.availableDocuments]);

    // Update available document types when selected company changes
    useEffect(() => {
        dispatch({
            type: ActionTypeEnum.setAvailableDocTypes,
            payload: state.availableDocuments.filter((doc: Document) => doc.name === state.selectedCompany?.name).map((doc: Document): SelectOption => ({
                label: doc.docType,
                value: doc.docType,
            })),
        });
        dispatch({ type: ActionTypeEnum.setSelectedYear, payload: null });
        dispatch({ type: ActionTypeEnum.setSelectedDocumentType, payload: null });
    }, [state.selectedCompany, state.availableDocuments]);

    // Reset selected year when selected company or document type changes
    useEffect(() => {
        dispatch({
            type: ActionTypeEnum.setSelectedYear,
            payload: null,
        });
    }, [state.selectedCompany, state.selectedDocumentType]);

    // Calculate available years when selected company and document type are both set
    useEffect(() => {
        if (state.selectedCompany && state.selectedDocumentType) {
            const availableYears = getAvailableYears(state.selectedCompany.name, state.selectedDocumentType?.value, state.availableDocuments);
            dispatch({
                type: ActionTypeEnum.setAvailableYears,
                payload: availableYears,
            });
        }
    }, [state.selectedCompany, state.selectedDocumentType, state.availableDocuments]);

    /**
     * Adds a selected document to the list of selected documents if all required fields are selected.
     * Clears the selected company, document type, and year after adding the document.
     */
    const handleAddDocument = useCallback(() => {
        const selectedCompany = state.selectedCompany;
        if (selectedCompany && selectedCompany.id && state.selectedDocumentType && state.selectedYear) {
            setSelectedDocuments((prevDocs = []) => {
                if (prevDocs.find((doc) => doc.id === selectedCompany.id)) {
                    return prevDocs;
                }

                return [...prevDocs, selectedCompany];
            });

            dispatch({ type: ActionTypeEnum.setSelectedCompany, payload: null });
            dispatch({ type: ActionTypeEnum.setSelectedDocumentType, payload: null });
            dispatch({ type: ActionTypeEnum.setSelectedYear, payload: null });
        }
    }, [state.selectedCompany, state.selectedDocumentType, state.selectedYear, setSelectedDocuments]);

    const handleRemoveDocument = (documentIndex: number) => {
        setSelectedDocuments((prevDocs) =>
            prevDocs.filter((_, index) => index !== documentIndex)
        );
    };

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

    const isDocumentSelectionEnabled = selectedDocuments.length < MAX_NUMBER_OF_SELECTED_DOCUMENTS;
    const isStartConversationButtonEnabled = selectedDocuments.length > 0;

    const selectCompany = (company: Document) => {
        dispatch({ type: ActionTypeEnum.setSelectedCompany, payload: company });
        setFocusDocumentType(true);
    };

    const selectDocumentType = (docType: SelectOption | null) => {
        dispatch({ type: ActionTypeEnum.setSelectedDocumentType, payload: docType });
        setFocusYear(true);
    };

    const selectYear = (year: SelectOption | null) => {
        dispatch({ type: ActionTypeEnum.setSelectedYear, payload: year });
        setFocusYear(true);
    };

    const [shouldFocusCompanySelect, setShouldFocusCompanySelect] = useState(false);
    const [focusYear, setFocusYear] = useState(false);
    const yearFocusRef = useRef<Select<SelectOption, false, GroupBase<SelectOption>> | null>(null);

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
        ...state,
        sortedAvailableYears,
        selectedDocuments,
        sortedSelectedDocuments,
        selectedName: state.selectedCompany,
        selectYear,
        handleAddDocument,
        handleRemoveDocument,
        isDocumentSelectionEnabled,
        isStartConversationButtonEnabled,
        yearFocusRef,
        documentTypeFocusRef,
        selectCompany,
        selectDocumentType,
        shouldFocusCompanySelect,
        setShouldFocusCompanySelect,
    };
};
