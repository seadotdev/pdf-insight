// import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';


/**
 * Placeholder analytics Gif
 */
export const Underwrite = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <div className="p-4 text-center text-xl font-bold">
                Underwriting Tools
            </div>
            <Image src="/uwtools.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" />
            <div className="p-4 text-center text-xl font-bold">
                
            </div>
            <div className="p-4 text-center text-xl font-bold">
                Recently Created Links
            </div>
            <Image src="/uwlinks.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" />
 
        </div>);
};