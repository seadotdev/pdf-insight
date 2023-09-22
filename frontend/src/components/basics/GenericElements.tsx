import React, { ComponentPropsWithRef, useState } from "react";
import classNames from "classnames";

export const FileInput = (props: ComponentPropsWithRef<"input">) => {
    return (
        <input
            {...props}
            type="file"
            className={classNames({
                // base colors
                "file:bg-llama-indigo file:text-gray-900": true,
                // hover styling
                "hover:file:bg-[#3B3775] hover:file:text-gray-100 hover:file:cursor-pointer": true,
                // shape and spacing
                "file:rounded-lg file:rounded-tr-none file:rounded-br-none": true,
                "file:px-4 file:py-2 file:mr-4 file:border-none": true,
            })}
        />
    );
};

export const Button = (props: ComponentPropsWithRef<"button">) => {
    return (
        <button
            {...props}
            className={classNames({
                // margins and border
                "px-4 py-2 rounded border": true,
                // colours
                "bg-llama-indigo text-gray-900 ": true,
                //hover styling
                "hover:bg-[#3B3775] hover:text-gray-100": true,
            })}
        >Upload</button>
    )
}

export const TextInput = (props: ComponentPropsWithRef<"input">) => {
    return (
        <input
            {...props}
            type="text"
            className={classNames({
                // general appearance
                "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight": true,
                // on focus
                "focus:outline-none focus:bg-white focus:border-gray-500 focus:outline-none": true,
            })}
        />
    )
}

export const SelectInput = (props: ComponentPropsWithRef<"select">) => {
    return (
        <select
            {...props}
            className={classNames({
                // general appearance
                "block w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight": true,
                // on focus
                "focus:outline-none focus:bg-white focus:border-gray-500": true,
            })}
        >
        </select>
    )
}