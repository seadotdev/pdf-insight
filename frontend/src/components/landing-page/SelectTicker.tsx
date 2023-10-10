import React, { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { useCombobox } from "downshift";
import cx from "classnames";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import useFocus from "~/hooks/utils/useFocus";
import type { Document } from "~/types/document";

interface DocumentSelectComboboxProps {
    selectedItem: Document | null;
    setSelectedItem: (doc: Document) => void;
    availableDocuments: Document[];
    shouldFocusTicker: boolean;
    setFocusState: Dispatch<SetStateAction<boolean>>;
}

export const DocumentSelectCombobox: React.FC<DocumentSelectComboboxProps> = ({ selectedItem, availableDocuments, setSelectedItem, shouldFocusTicker, setFocusState }) => {
    const [focusRef, setFocus] = useFocus<HTMLInputElement>();
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(availableDocuments);

    /**
     * A custom hook that returns an object containing properties and methods for rendering a dropdown menu with selectable items.
     * @returns An object containing properties and methods for rendering a dropdown menu with selectable items.
     */
    const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, setInputValue } = useCombobox({
        onInputValueChange() { setFilteredDocuments(availableDocuments); },
        items: filteredDocuments,
        itemToString(doc) { return doc ? doc.name : ""; },
        selectedItem,
        onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
            if (newSelectedItem) {
                setSelectedItem(newSelectedItem);
            }
        },
    });

    useEffect(() => {
        if (shouldFocusTicker) {
            setInputValue("");
            setFocus();
            setFocusState(false);
        }
    }, [shouldFocusTicker, setFocusState, setInputValue, setFocus]);

    useEffect(() => {
        setFilteredDocuments(availableDocuments);
    }, [availableDocuments]);

    return (
        <div className="flex-grow">
            <div className="flex flex-col gap-1 rounded-s bg-[#F7F7F7]">
                <div className="flex items-center justify-center gap-0.5 shadow-sm">
                    <div className="ml-2">
                        <HiOutlineBuildingOffice2 size={20} />
                    </div>
                    <input
                        placeholder="Select Company"
                        className="align-center mt-[5px] w-full p-1.5 focus:outline-none "
                        {...getInputProps({ ref: focusRef })}
                        style={{ backgroundColor: "#F7F7F7" }}
                    />
                </div>
            </div>
            <ul
                className={`absolute z-20 mt-1 max-h-72 w-72 overflow-scroll bg-white p-0 shadow-md ${
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    !(isOpen && filteredDocuments.length) && "hidden"
                    }`}
                {...getMenuProps()}
            >
                {isOpen &&
                    filteredDocuments.map((item, index) => (
                        <li
                            className={cx(
                                highlightedIndex === index && "bg-[#818BE7] text-white",
                                selectedItem === item && "font-bold",
                                "z-20 flex flex-col px-3 py-2 shadow-sm"
                            )}
                            key={`${item.name}${index}`}
                            {...getItemProps({ item, index })}
                        >
                            <span>{item.name}</span>
                            <span className="text-sm ">{item.id}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
};
