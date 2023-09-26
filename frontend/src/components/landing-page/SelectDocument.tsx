import React, { useEffect, useState } from "react";
import { backendClient } from "~/api/backendClient";
import useFocus from "~/hooks/utils/useFocus";
import { Button, FileInput, SelectInput, TextInput } from "~/components/basics/GenericElements";

export const SelectDocument = () => {
    const [focusRef, setFocus] = useFocus<HTMLInputElement>();
    const [file, setFile] = useState<File | null>(null);
    const [fileIsUploaded, setFileIsUploaded] = useState<boolean>(false);
    const [supportedDocumentTypes, setSupportedDocumentTypes] = useState<string[]>([])
    const [documentTypeSchemaMapping, setDocumentTypeSchemaMapping] = useState<JSON | null>(null)
    const [documentType, setDocumentType] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (e.target.files[0])
                setFile(e.target.files[0]);
        }
    };

    const handleTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let selectedOptions = e.target.selectedOptions
        if (selectedOptions.length && selectedOptions[0]) {
            setDocumentType(selectedOptions[0].label)
        }
    };

    const handleFormSubmit = async (e: { preventDefault: () => void; target: any; }) => {
        e.preventDefault()
        if (file) {
            const form = e.target;
            const formData = new FormData(form);
            const res = await backendClient.uploadFile(formData);
            if (res.ok)
                setFileIsUploaded(true);
        }
    };

    // Fetch all the available document types on render
    useEffect(() => {
        async function getDocTypes() {
            const docs = await backendClient.getSupportedDocTypes();
            setSupportedDocumentTypes(docs);
        }
        getDocTypes().catch(() => console.error("Could not fetch document types"));
    }, []);

    // Fetch all the available document types on render
    useEffect(() => {
        async function getSchemaMapping() {
            if (documentType) {
                const schema_mapping = await backendClient.getSchemaMapping(documentType);
                setDocumentTypeSchemaMapping(schema_mapping);
            }
        }
        getSchemaMapping().catch(() => console.error("Could not fetch schema mapping"));
    }, [documentType]);

    return (
        <div className="w-full flex justify-between max-w-[700px] border-gray-500 rounded border">
            <form className="mx-0 w-full px-4 py-4" onSubmit={handleFormSubmit}>
                <div id="file-upload" className="flex justify-between">
                    <FileInput id="file" name="file" onChange={handleFileChange} />
                </div>
                {
                    file &&
                    <div className="mt-4 mx-0 border-gray-500 rounded border w-full px-4 py-4">
                        <div className="flex flex-wrap -mx-3 mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-company-name">Company Name</label>
                                <TextInput id="grid-company-name" name="company_name" required placeholder="Company Name" />
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-document-type">Document Type</label>
                                <SelectInput id="grid-document-type" name="document_type" onChange={handleTypeSelect}>
                                    {supportedDocumentTypes.map((typeName) => (<option key={typeName}>{typeName}</option>))}
                                </SelectInput>
                            </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                            {/* {
                            (documentType && documentTypeSchemaMapping) &&
                            (Object.values(documentTypeSchemaMapping) as string[]).map((typeName) => (<p>{typeName}</p>))
                        } */}
                        </div>
                        <Button type="submit">Index Document</Button>
                    </div>
                }
            </form>
        </div >
    );
};
