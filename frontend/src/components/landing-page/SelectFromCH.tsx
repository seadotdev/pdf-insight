import React, { useEffect, useState } from "react";
import { backendClient } from "~/api/backendClient";
import { Button, FileInput, SelectInput, TextInput } from "~/components/basics/GenericElements";
import { FilingItem, FilingResponse } from "~/types/ch-data";
import { chApiKey } from "~/config"

export const SelectFromCH = () => {
    const [searchResults, setSearchResults] = useState<FilingResponse | null>(null);
    const [selectedItem, setSelectedItem] = useState<FilingItem | null>(null);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (searchResults) {
            const selectedIndex = e.target.selectedIndex;
            const item = searchResults.items[selectedIndex];

            if (item)
                setSelectedItem(item);
        }
    };

    useEffect(() => {
        if (searchResults) {
            const item = searchResults.items[0];

            if (item)
                setSelectedItem(item);
        }
    }, [searchResults]);

    const CHFilingElement = () => {
        return (
            <div className="w-full flex flex-wrap py-4 items-center justify-center">
                <p><b>Company Name: placeholder</b></p>
                <SelectInput id="grid-document-type" name="document_type" onChange={handleSelect}>
                    {
                        searchResults &&
                        searchResults.items.map((item) => (<option id={item.transaction_id} key={item.transaction_id}>{item.category + ' for ' + item.date}</option>))
                    }
                </SelectInput>
            </div>
        );
    };

    const handleSearchFormSubmit = async (e: { preventDefault: () => void; target: any; }) => {
        e.preventDefault()

        const form = e.target;
        const url = 'https://api.company-information.service.gov.uk/company/' + form.company_id.value + '/filing-history';
        // headers: { 'Authorization': 'Basic ' + Buffer.from(chApiKey + ":").toString('base64') },

        const res = await fetch(url, {
            method: "GET",
            headers: { 'Authorization': chApiKey },
        });

        if (res.ok)
            setSearchResults(await res.json())
        else
            throw new Error(`HTTP error! status: ${res.status}`);
    };

    const handleCHFileUpload = async (e: { preventDefault: () => void; target: any; }) => {
        e.preventDefault()
        if (selectedItem) {
            // We send this over to backend to handle (avoids stupid CORS issues with redirects to s3 etc.)
            const res = await backendClient.uploadCHDocument(selectedItem);
            if (res.ok)
                alert("File Uploaded!");
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
                        <input type="text" id="simple-search" name="company_id" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search company id..." required />
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
