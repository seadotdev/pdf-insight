import React, { PropsWithChildren, useState, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import useIsMobile from "~/hooks/utils/useIsMobile";
import { DocumentExplorer } from "~/components/landing-page/DocumentExplorer"
import { Conversation } from "~/components/landing-page/Conversation";
import { KnowledgeGraph } from "~/components/landing-page/KnowledgeGraph";
import Flow from "~/components/landing-page/Flow";
import { Sidebar } from 'flowbite-react';
import type { CustomFlowbiteTheme } from 'flowbite-react';
import { Flowbite } from 'flowbite-react';
import {
    HiArrowSmRight,
    HiChartPie,
    HiTable,
    HiUser,
    HiViewBoards,
    HiAdjustments,
    HiOutlineArrowCircleRight,
    HiNewspaper,
    HiChat,
    HiLogin,
    HiDocument,
    HiAcademicCap,
    HiChartBar,
    HiTerminal,
    HiPresentationChartLine
} from 'react-icons/hi';

function Content(props: { activeItem: string; }) {
    const activeItem = props.activeItem;
    switch (activeItem) {
        case "Home":
            return (<div>Hi!</div>)
        case "Data Exploration":
            return (<Conversation />)
        case "Data Modelling":
            return (<KnowledgeGraph />)
        case "Template Tab":
            return (<div>Editor</div>);
        // return (<Editor />)
        case "Agent":
            return (<Flow />)
        case "Document Templates":
            return (<DocumentExplorer />)
        default:
            return (<div>Hi!</div>);
    }
}


const customTheme: CustomFlowbiteTheme = {
    sidebar: {
        root: {
            base: "h-full",
            collapsed: {
                on: "w-16",
                off: "w-64"
            },
            inner: "flex flex-col h-full overflow-y-auto overflow-x-hidden rounded py-4 px-3 bg-gray-200"
        },
        collapse: {
            button: "group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-sea-blue dark:text-white dark:hover:bg-gray-700",
            icon: {
                base: "h-6 w-6 text-gray-500 transition duration-500 ease-in-out group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
                open: {
                    off: "",
                    on: "text-gray-900"
                }
            },
            label: {
                base: "ml-3 flex-1 whitespace-nowrap text-left",
                icon: {
                    base: "h-6 w-6 transition ease-in-out delay-0",
                    open: {
                        on: "rotate-180",
                        off: ""
                    }
                }
            },
            list: "space-y-2 py-2"
        },
        cta: {
            base: "mt-6 rounded-lg p-4 bg-gray-100 dark:bg-gray-700",
            color: {
                blue: "bg-cyan-50 dark:bg-cyan-900",
                dark: "bg-dark-50 dark:bg-dark-900",
                failure: "bg-red-50 dark:bg-red-900",
                gray: "bg-alternative-50 dark:bg-alternative-900",
                green: "bg-green-50 dark:bg-green-900",
                light: "bg-light-50 dark:bg-light-900",
                red: "bg-red-50 dark:bg-red-900",
                purple: "bg-purple-50 dark:bg-purple-900",
                success: "bg-green-50 dark:bg-green-900",
                yellow: "bg-yellow-50 dark:bg-yellow-900",
                warning: "bg-yellow-50 dark:bg-yellow-900"
            }
        },
        item: {
            base: "group flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-sea-blue dark:text-white dark:hover:bg-gray-700",
            active: "bg-sea-blue dark:bg-gray-700",
            collapsed: {
                insideCollapse: "group w-full pl-8 transition duration-75",
                noIcon: "font-bold"
            },
            content: {
                base: "px-3 flex-1 whitespace-nowrap"
            },
            icon: {
                base: "h-6 w-6 flex-shrink-0 text-gray-500 transition duration-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
                active: "text-gray-700 dark:text-gray-100"
            },
            label: "",
            listItem: ""
        },
        items: "grow flex flex-col justify-between",
        itemGroup: "mt-4 space-y-2 border-t border-gray-300 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700",
        logo: {
            base: "mb-5 flex items-center pl-2.5",
            collapsed: {
                on: "hidden",
                off: "self-center whitespace-nowrap text-xl font-semibold dark:text-white"
            },
            img: "mr-3 h-6 sm:h-7"
        }
    }
};


export const TitlePage = () => {
    const { isMobile } = useIsMobile();
    const { boot } = useIntercom();

    useEffect(() => { boot(); }, [boot]);

    const [activeItem, setActiveItem] = useState("doc-tab");

    return (
        <div className="h-screen w-screen flex flex-row">
            <Flowbite theme={{ theme: customTheme }}>
                <Sidebar aria-label="Nav Menu">
                    <Sidebar.Logo href="#" img="/favicon.ico" imgAlt="SeaDotDev Logo">
                        <p>sea.dev</p>
                    </Sidebar.Logo>
                    <Sidebar.Items>
                        <Sidebar.ItemGroup >
                            <Sidebar.Collapse icon={HiViewBoards} label="Lending Workflows">
                                <Sidebar.Item href="#" icon={HiNewspaper} onClick={() => { setActiveItem("Underwriting Tools"); }} className="pl-4">Underwriting Tools</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiDocument} onClick={() => { setActiveItem("Document Templates"); }} className="pl-4">Document Templates</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiViewBoards} onClick={() => { setActiveItem("Deployed Agents"); }} className="pl-4">Deployed Agents</Sidebar.Item>
                            </Sidebar.Collapse>
                            <Sidebar.Collapse icon={HiChartPie} label="Semantic Layer">
                                <Sidebar.Item href="#" icon={HiPresentationChartLine} onClick={() => { setActiveItem("Data Modelling"); }} className="pl-4">Data Modelling</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiChat} onClick={() => { setActiveItem("Data Exploration"); }} className="pl-4">Data Exploration</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiArrowSmRight} onClick={() => { setActiveItem("Data Activation"); }} className="pl-4">Data Activation</Sidebar.Item>
                            </Sidebar.Collapse>
                            <Sidebar.Collapse icon={HiTable} label="Data Integration">
                                <Sidebar.Item href="#" icon={HiTable} onClick={() => { setActiveItem("Sources"); }} className="pl-4">Sources</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiOutlineArrowCircleRight} onClick={() => { setActiveItem("Targets"); }} className="pl-4">Targets</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiAcademicCap} onClick={() => { setActiveItem("Analytics"); }} className="pl-4">Analytics</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiTerminal} onClick={() => { setActiveItem("LLM Configuration"); }} className="pl-4">LLM Configuration</Sidebar.Item>
                                <Sidebar.Item href="#" icon={HiChartBar} onClick={() => { setActiveItem("Agent Control Plane"); }} className="pl-4">Agent Control Plane</Sidebar.Item>
                            </Sidebar.Collapse>
                            <Sidebar.Item href="#" icon={HiAdjustments} onClick={() => { setActiveItem("Admin"); }}>Admin</Sidebar.Item>
                        </Sidebar.ItemGroup>
                        <Sidebar.ItemGroup>
                            <Sidebar.Item href="#" icon={HiLogin}>
                                <p>Sign In</p>
                            </Sidebar.Item>
                            <Sidebar.Item href="#" icon={HiUser}>
                                <p>Sign Up</p>
                            </Sidebar.Item>
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            </Flowbite>
            <div className="flex justify-center items-center flex-grow h-screen overflow-y-auto">
                {Content({ activeItem: activeItem })}
            </div>
        </div >
    )
}