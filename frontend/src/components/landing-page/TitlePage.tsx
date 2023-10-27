import React, { PropsWithChildren, useState, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import useIsMobile from "~/hooks/utils/useIsMobile";
import { DocumentExplorer } from "~/components/landing-page/DocumentExplorer"
import { Conversation } from "~/components/landing-page/Conversation";
import { KnowledgeGraph } from "~/components/landing-page/KnowledgeGraph";
import Flow from "~/components/landing-page/Flow";
import { Sidebar } from 'flowbite-react';
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


export const TitlePage = () => {
    const { isMobile } = useIsMobile();
    const { boot } = useIntercom();

    useEffect(() => { boot(); }, [boot]);

    const [activeItem, setActiveItem] = useState("doc-tab");

    return (
        <div className="h-screen w-screen flex flex-row">
            <Sidebar aria-label="Nav Menu" className="h-full flex flex-col [&>*:first-child]:flex [&>*:first-child]:flex-col">
                <Sidebar.Logo href="#" img="/favicon.ico" imgAlt="SeaDotDev Logo">
                    <p>sea.dev</p>
                </Sidebar.Logo>
                <Sidebar.Items className="grow flex flex-col justify-between">
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
            <div className="flex justify-center items-center flex-grow h-screen overflow-y-auto">
                {Content({ activeItem: activeItem })}
            </div>
        </div >
    )
}