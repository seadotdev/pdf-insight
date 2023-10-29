// import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';


/**
 * Placeholder analytics Gif
 */
export const Analytics = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <Image src="/rill.gif" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" />
 
        </div>);
};