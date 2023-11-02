import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';


/**
 * Placeholder analytics Gif
 */
export const DataModel = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
            </div>
            <span className="font-extrabold">Data Modelling</span>
            <Image src="/bizdatamodel.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" />
            <span className="font-extrabold">Data Query</span>
            <Image src="/dataquery.png" width={1000} height={800} className="mx-2 rounded-lg" alt="analytics" />
          </div>
        </div>);
};