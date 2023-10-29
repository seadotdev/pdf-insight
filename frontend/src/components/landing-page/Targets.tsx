// import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import Image from 'next/image';
import {
    HiArrowSmRight,
    HiChartPie,
    HiTable,
    HiUser,
    HiViewBoards,
    HiAdjustments,
    HiHome,
    HiOutlineArrowCircleRight,
    HiNewspaper,
    HiChat,
    HiLogin,
    HiDocument,
    HiAcademicCap,
    HiChartBar,
    HiTerminal,
    HiPresentationChartLine,
    HiOutlineServer,
    HiCubeTransparent,
    HiDatabase,
    HiCog,
    HiLockClosed,
    HiOutlineColorSwatch,
    HiUserGroup,
    HiBriefcase
} from 'react-icons/hi';

/**
 * Placeholder analytics Gif
 */
export const Targets = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            {/* <Image src="/targets.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" /> */}
            <span className="font-extrabold">Data Integration Targets</span>
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">#</th>
                    <th scope="col" className="px-6 py-4">Target Name</th>
                    <th scope="col" className="px-6 py-4">Target Type</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">1</td>
                    <td className="whitespace-nowrap px-6 py-4">Hubspot</td>
                    <td className="whitespace-nowrap px-6 py-4">Customer Relationship Management</td>
                    <td className="whitespace-nowrap px-6 py-4">Active</td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">2</td>
                    <td className="whitespace-nowrap px-6 py-4">nCino</td>
                    <td className="whitespace-nowrap px-6 py-4">Loan Management System</td>
                    <td className="whitespace-nowrap px-6 py-4">Draft</td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">3</td>
                    <td className="whitespace-nowrap px-6 py-4">Salesforce</td>
                    <td className="whitespace-nowrap px-6 py-4">Customer Relationship Management</td>
                    <td className="whitespace-nowrap px-6 py-4">Active</td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-400 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">4</td>
                    <td className="whitespace-nowrap px-6 py-4">kennek</td>
                    <td className="whitespace-nowrap px-6 py-4">Loan Management System</td>
                    <td className="whitespace-nowrap px-6 py-4">Active</td>
                    <td className="whitespace-nowrap px-6 py-4">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                    </svg></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>);
};