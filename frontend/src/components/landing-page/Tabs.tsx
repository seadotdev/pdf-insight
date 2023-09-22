import { useState } from "react";
import { DocumentExplorer } from "~/components/landing-page/DocumentExplorer"
import { Conversation } from "~/components/landing-page/Conversation";

function TabsContent(props: { activeTab: string; }) {
    const activeTab = props.activeTab;
    switch (activeTab) {
        case "doc-tab":
            return (<DocumentExplorer />)
        case "conversation-tab":
            return (<Conversation />)
        case "kg-tab":
            return (<div>Knowledge Graph</div>)
        case "template-tab":
            return (<div>Template</div>)
        case "agent-tab":
            return (<div>Agent</div>)
        default:
            return (<div></div>);
    }
}

const Tabs = () => {
    const [activeTab, setActiveTab] = useState("doc-tab");
    const tabHrefClassString = "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg text-white hover:text-gray-900 hover:border-gray-900 dark:hover:text-gray-300 group";

    return (
        <div id="tabs" className="border-b border-transparent max-w-[1200px] w-full">
            <ul className="flex flex-wrap -mb-px text-sm font-medium border-transparent text-center text-gray-500 dark:text-blue-400 w-full">
                <li className={activeTab === "doc-tab" ? "active mr-2" : "mr-2"} onClick={() => { setActiveTab("doc-tab"); }}>
                    <a href="#" className={tabHrefClassString + (activeTab === "doc-tab" ? " bg-llama-indigo" : "")}>
                        <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-200 dark:group-hover:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 23">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>Document Explorer
                    </a>
                </li>
                <li className={activeTab === "conversation-tab" ? "active mr-2" : "mr-2"} onClick={() => { setActiveTab("conversation-tab"); }}>
                    <a href="#" className={tabHrefClassString + (activeTab === "conversation-tab" ? " bg-llama-indigo" : "")}>
                        <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-200 dark:group-hover:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 23">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88836 21.6244 10.4003 22 12 22Z" />
                            <path d="M7.825 12.85C7.36937 12.85 7 13.2194 7 13.675C7 14.1306 7.36937 14.5 7.825 14.5H13.875C14.3306 14.5 14.7 14.1306 14.7 13.675C14.7 13.2194 14.3306 12.85 13.875 12.85H7.825Z" />
                            <path d="M7.825 9C7.36937 9 7 9.36937 7 9.825C7 10.2806 7.36937 10.65 7.825 10.65H16.625C17.0806 10.65 17.45 10.2806 17.45 9.825C17.45 9.36937 17.0806 9 16.625 9H7.825Z" />
                        </svg>Chat With Documents
                    </a>
                </li>
                <li className={activeTab === "kg-tab" ? "active mr-2" : "mr-2"} onClick={() => { setActiveTab("kg-tab"); }}>
                    <a href="#" className={tabHrefClassString + (activeTab === "kg-tab" ? " bg-llama-indigo" : "")}>
                        <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-200 dark:group-hover:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 23">
                            <path d="M18 13h1c.55 0 1 .45 1 1.01v2.98c0 .56-.45 1.01-1 1.01h-4c-.55 0-1-.45-1-1.01v-2.98c0-.56.45-1.01 1-1.01h1v-2h-5v2h1c.55 0 1 .45 1 1.01v2.98c0 .56-.45 1.01-1 1.01H8c-.55 0-1-.45-1-1.01v-2.98c0-.56.45-1.01 1-1.01h1v-2H4v2h1c.55 0 1 .45 1 1.01v2.98C6 17.55 5.55 18 5 18H1c-.55 0-1-.45-1-1.01v-2.98C0 13.45.45 13 1 13h1v-2c0-1.1.9-2 2-2h5V7H8c-.55 0-1-.45-1-1.01V3.01C7 2.45 7.45 2 8 2h4c.55 0 1 .45 1 1.01v2.98C13 6.55 12.55 7 12 7h-1v2h5c1.1 0 2 .9 2 2v2z" />
                        </svg>Knowledge Graph
                    </a>
                </li>
                <li className={activeTab === "template-tab" ? "active mr-2" : "mr-2"} onClick={() => { setActiveTab("template-tab"); }}>
                    <a href="#" className={tabHrefClassString + (activeTab === "template-tab" ? " bg-llama-indigo" : "")}>
                        <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-200 dark:group-hover:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 23">
                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                        </svg>Templates
                    </a>
                </li>
                <li className={activeTab === "agent-tab" ? "active mr-2" : "mr-2"} onClick={() => { setActiveTab("agent-tab"); }}>
                    <a href="#" className={tabHrefClassString + (activeTab === "agent-tab" ? " bg-llama-indigo" : "")}>
                        <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-200 dark:group-hover:text-gray-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 25 23">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>Agents
                    </a>
                </li>
            </ul>
            <div id="tabs-content">
                <TabsContent activeTab={activeTab} />
            </div>
        </div >
    );
};

export default Tabs;