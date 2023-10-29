import React from "react";
import Image from 'next/image';

import { SelectDocument } from "~/components/landing-page/SelectDocument";
import { SelectFromCH } from "~/components/landing-page/SelectFromCH";


export const DocumentExplorer = () => {
    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <div className="p-1 text-center text-xl font-bold">
                Document Templates
            </div>
            <div className="h-1/8 flex w-full flex-wrap items-center justify-center font-nunito">
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full text-left text-sm font-light">
                <thead className="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">doc id#</th>
                    <th scope="col" className="px-6 py-4">Document Name</th>
                    <th scope="col" className="px-6 py-4">Document Type</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                //   border-b bg-white dark:border-neutral-500 dark:bg-neutral-600">

                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">1</td>
                    <td className="whitespace-nowrap px-6 py-4">Business Plan</td>
                    <td className="whitespace-nowrap px-6 py-4">Risk Analysis</td>
                    <td className="whitespace-nowrap px-6 py-4">2023</td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">2</td>
                    <td className="whitespace-nowrap px-6 py-4">Investment Memorandum</td>
                    <td className="whitespace-nowrap px-6 py-4">Risk Analysis</td>
                    <td className="whitespace-nowrap px-6 py-4">2023</td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">3</td>
                    <td className="whitespace-nowrap px-6 py-4">Proof of Income</td>
                    <td className="whitespace-nowrap px-6 py-4">Risk Analysis</td>
                    <td className="whitespace-nowrap px-6 py-4">2023</td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">1</td>
                    <td className="whitespace-nowrap px-6 py-4">Loan Collateral</td>
                    <td className="whitespace-nowrap px-6 py-4">Operational</td>
                    <td className="whitespace-nowrap px-6 py-4">2022</td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">2</td>
                    <td className="whitespace-nowrap px-6 py-4">Credit History</td>
                    <td className="whitespace-nowrap px-6 py-4">Risk Analysis</td>
                    <td className="whitespace-nowrap px-6 py-4">2021</td>
                  </tr>
                  <tr
                    className="border-b transition duration-10 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">3</td>
                    <td className="whitespace-nowrap px-6 py-4">Key Management</td>
                    <td className="whitespace-nowrap px-6 py-4">Risk Analysis</td>
                    <td className="whitespace-nowrap px-6 py-4">2022</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
            </div>
            <div className="p-4 text-center text-xl font-bold">
                Upload and convert to template
            </div>
            <div className="h-1/8 flex w-full flex-wrap items-center justify-center font-nunito">
                <SelectDocument />
            </div>
        </div>);
};


  