import React, { useEffect, useState } from "react";
import { backendClient } from "~/api/backendClient";
import { Button, FileInput, SelectInput, TextInput } from "~/components/basics/GenericElements";


export const SelectDocument = () => {
    const [file, setFile] = useState<File | null>(null);
    const [supportedDocumentTypes, setSupportedDocumentTypes] = useState<string[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (e.target.files[0])
                setFile(e.target.files[0]);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (file) {
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            backendClient.uploadFile(formData)
                .then(res => { if (res.ok) alert("File Uploaded!"); else alert("File Upload Failed!") })
                .catch(() => { console.error("Could not upload file"); alert("File Upload Failed!") });
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
                                <SelectInput id="grid-document-type" name="document_type">
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
