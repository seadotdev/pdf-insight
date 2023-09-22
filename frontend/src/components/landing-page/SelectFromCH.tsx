import React, { useEffect, useState } from "react";
import { backendClient } from "~/api/backendClient";
import useFocus from "~/hooks/utils/useFocus";
import { Button, FileInput, SelectInput, TextInput } from "~/components/basics/GenericElements";

export const SelectFromCH = () => {
    const [searchResults, setSearchResults] = useState<JSON | null>(null)

    const handleFormSubmit = async (e: { preventDefault: () => void; target: any; }) => {
        e.preventDefault()
        const form = e.target;
        const res = await backendClient.queryCompaniesHouseFilings(form.company_id.value);
        if (res.status == 200)
        {
            setSearchResults(await res.json());
            console.log(searchResults);
        }
    };

    return (
        <div className="w-full flex justify-between min-w-[700px] max-w-[700px] border-gray-500 rounded border px-4 py-4">
            <form className="flex items-center w-full" onSubmit={handleFormSubmit}>
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
            {
                searchResults &&
                <div>Banana</div>
            }
        </div>
    );
};
