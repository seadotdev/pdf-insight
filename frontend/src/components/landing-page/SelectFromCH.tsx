import React, { useEffect, useState } from "react";
import { backendClient } from "~/api/backendClient";
import { Button, SelectInput } from "~/components/basics/GenericElements";
import type { FilingItem, FilingResponse } from "~/types/ch-data";
import { chApiKey } from "~/config"

/**
 * A component that allows users to search for and select a Companies House filing to upload.
 * @returns {JSX.Element} The SelectFromCH component.
 */
export const SelectFromCH = (): JSX.Element => {
    const [searchInput, setSearchInput] = useState<string | null>(null)
    const [searchResults, setSearchResults] = useState<FilingResponse | null>(null);
    const [selectedItem, setSelectedItem] = useState<FilingItem | null>(null);

    useEffect(() => {
        if (searchResults) {
            const item = searchResults.items[0];

            if (item)
                setSelectedItem(item);
        }
    }, [searchResults]);

    /**
     * A component that displays the selected filing.
     * @returns {JSX.Element} The CHFilingElement component.
     */
    const CHFilingElement = (): JSX.Element => {
        return (
            <div className="w-full flex flex-wrap py-4 items-center justify-center">
                <p><b>Company Name: placeholder</b></p>
                <SelectInput id="grid-document-type" name="document_type" onChange={handleSelect}>
                    {
                        searchResults &&
                        searchResults.items
                            .map((item) => (<option id={item.transaction_id} key={item.transaction_id}>{`${item.category} for ${item.date.toString()}`}</option>))
                    }
                </SelectInput>
            </div>
        );
    };

    /**
     * Handles the selection of a filing from the search results.
     * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event object.
     * @returns {void}
     */
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (searchResults) {
            const selectedIndex = e.target.selectedIndex;
            const item = searchResults.items[selectedIndex];

            if (item)
                setSelectedItem(item);
        }
    };

    /**
     * Handles the change event of the search input element and updates the search input state.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object.
     * @returns {void}
     */
    const handleSearchTermsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchInput(e.target.value);
    };

    /**
     * Handles the submission of the search form by fetching filing history data from the Companies House API
     * @param {React.FormEvent<HTMLFormElement>} e - The form event
     * @returns {void}
     */
    const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!searchInput)
            return;

        const companyId = searchInput;
        const url = `https://api.company-information.service.gov.uk/company/${companyId}/filing-history`;

        fetch(url, {
            method: "GET",
            headers: { 'Authorization': chApiKey },
        })
            .then(res => { if (res.ok) return res.json(); else throw new Error(`HTTP error! status: ${res.status}`) })
            .then(json => setSearchResults(json as FilingResponse))
            .catch(() => console.error("Could not fetch search results"));
    };

    /**
     * Handles the upload of a Companies House filing to the backend.
     * @param {Object} e - The event object.
     * @param {Function} e.preventDefault - Prevents the default behavior of the event.
     * @param {Object} e.target - The target of the event.
     */
    const handleCHFileUpload = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()

        if (selectedItem) {
            // We send this over to backend to handle (avoids stupid CORS issues with redirects to s3 etc.)
            backendClient.uploadCHDocument(selectedItem)
                .then(res => { if (res.ok) alert("File Uploaded!"); else alert("File Upload Failed!") })
                .catch(() => console.error("Could not upload file"));
        }
    };

    return (
        <div className="w-full flex flex-wrap justify-between min-w-[700px] max-w-[700px] border-gray-500 rounded border px-4 py-4">
            <div className="w-full flex flex-wrap justify-between">
                <form id="search-form-submit" className="flex items-center w-full" onSubmit={handleSearchFormSubmit}>
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2" />
                            </svg>
                        </div>
                        <input type="text" id="simple-search" name="company_id" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={handleSearchTermsChange} placeholder="Search company id..." required />
                    </div>
                    <button type="submit" className="p-2.5 ml-2 text-sm font-medium text-white bg-llama-indigo rounded-lg border border-blue-700 hover:bg-[#3B3775]">
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                        <span className="sr-only">Search</span>
                    </button>
                </form>
            </div>
            <div className="w-full flex flex-wrap justify-between">
                {
                    searchResults &&
                    <form className="flex flex-wrap items-center w-full" onSubmit={handleCHFileUpload}>
                        <CHFilingElement />
                        <Button type="submit" />
                    </form>
                }
            </div>
        </div>
    );
};
