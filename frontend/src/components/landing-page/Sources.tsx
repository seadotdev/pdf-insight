// import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import { SelectFromCH } from "~/components/landing-page/SelectFromCH";
import Image from 'next/image';


/**
 * Placeholder analytics Gif
 */
export const Sources = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <div className="p-4 text-center text-xl font-bold">
                Upload from Companies House
            </div>
            <div className="h-1/8 flex w-full flex-wrap items-center justify-center font-nunito">
                <SelectFromCH />
            </div>
            <div className="p-4 text-center text-xl font-bold">
                
            </div>
            <div className="p-4 text-center text-xl font-bold">
                Other sources
            </div>
            <Image src="/integrations.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" />
        </div>);
};