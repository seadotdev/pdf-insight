import React from "react";

import { SelectDocument } from "~/components/landing-page/SelectDocument";
import { SelectFromCH } from "~/components/landing-page/SelectFromCH";

export const DocumentExplorer = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 sm:h-[600px]">
            <div className="p-4 text-center text-xl font-bold">
                Upload documents
            </div>
            <div className="h-1/8 flex w-full flex-wrap items-center justify-center font-nunito">
                <SelectDocument />
            </div>
            <div className="p-4 text-center text-xl font-bold">
                Upload from Companies House
            </div>
            <div className="h-1/8 flex w-full flex-wrap items-center justify-center font-nunito">
                <SelectFromCH />
            </div>
        </div>);
};