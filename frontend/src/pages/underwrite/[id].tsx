import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { PdfFocusProvider } from "~/context/pdf";
import { v4 as uuidv4 } from "uuid";

import type { ChangeEvent } from "react";
import DisplayMultiplePdfs from "~/components/pdf-viewer/DisplayMultiplePdfs";
import { backendUrl } from "src/config";
import { MESSAGE_STATUS, ROLE, type Message } from "~/types/conversation";
import useMessages from "~/hooks/useMessages";
import { backendClient } from "~/api/backendClient";
import { RenderConversations as RenderConversations } from "~/components/conversations/RenderConversations";
import { BiArrowBack } from "react-icons/bi";
import type { Document } from "~/types/document";
import { FiShare } from "react-icons/fi";
import ShareLinkModal from "~/components/modals/ShareLinkModal";
import { BsArrowUpCircle } from "react-icons/bs";
import { useModal } from "~/hooks/utils/useModal";
import { useIntercom } from "react-use-intercom";
import useIsMobile from "~/hooks/utils/useIsMobile";
import { UnderwritingConversation } from "~/components/conversations/UnderwritingConversation";
import { getDateWithUTCOffset } from "~/utils/timezone";

export default function Conversation() {
    const router = useRouter();
    const { id } = router.query;
    const { shutdown } = useIntercom();

    useEffect(() => {
        shutdown();
    }, [shutdown]);

    const questionList: string[] = [
        "Please tell us about your business and why you need a loan. Please also make references to the documents you've uploaded",
        "Who are you, what is your relation to the business?",
        "Who are the other shareholders of the business, how long have they owned the business and what is their long term plan?",
        "What is the split of the usage of the loan between acquisition and buying out the previous owner, and has the business considered other forms of financing?",
        "What does the business do, who are the customers of the business, who are the suppliers?",
    ];

    const { isOpen: isShareModalOpen, toggleModal: toggleShareModal } = useModal();
    const { isMobile } = useIsMobile();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isMessagePending, setIsMessagePending] = useState(false);
    const [userMessage, setUserMessage] = useState("");
    const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
    const { messages, userSendMessage, systemSendMessage, setMessages } = useMessages(conversationId || "");
    const [countAgentMessages, setCountAgentMessages] = useState(1);
    const textFocusRef = useRef<HTMLTextAreaElement | null>(null);

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setUserMessage(event.target.value);
    };

    useEffect(() => {
        // router can have multiple query params which would then return string[]
        if (id && typeof id === "string") {
            setConversationId(id);

            const parsedData: Message = {
                id: String(setCountAgentMessages),
                content: "Please tell us about your business and why you need a loan. Please also make references to the documents you've uploaded",
                role: ROLE.ASSISTANT,
                status: MESSAGE_STATUS.SUCCESS,
                conversationId: id,
                created_at: new Date(),
            };

            systemSendMessage(parsedData);
        }
    }, [id]);

    useEffect(() => {
        const fetchConversation = async (id: string) => {
            const result = await backendClient.fetchConversation(id);
            if (result.documents) {
                setSelectedDocuments(result.documents);
            }
        };
        if (conversationId) {
            fetchConversation(conversationId).catch(() =>
                console.error("Conversation Load Error")
            );
        }
    }, [conversationId, setMessages]);


    // Keeping this in this file for now because this will be subject to change
    const submit = useCallback(() => {
        if (!userMessage || !conversationId) {
            return;
        }

        setIsMessagePending(false);
        userSendMessage(userMessage);
        setUserMessage("");

        let content = "";
        if(countAgentMessages < questionList.length)
             content = questionList[countAgentMessages] as string;
        else
            content = "Thank you, we are processing your request and will get back to you";

        const parsedData: Message = {
            id: uuidv4(),
            conversationId,
            content,
            role: ROLE.ASSISTANT,
            status: MESSAGE_STATUS.SUCCESS,
            created_at: getDateWithUTCOffset(),
        };

        // Without "this"
        setTimeout(() => { 
            systemSendMessage(parsedData);
            setCountAgentMessages(countAgentMessages + 1);
            console.error(parsedData);
            setIsMessagePending(false);
        }, 2000)
    }, [userMessage, conversationId, userSendMessage, systemSendMessage, setIsMessagePending, setUserMessage]);

    useEffect(() => {
        const textarea = document.querySelector("textarea");
        if (textarea) {
            textarea.style.height = "auto";

            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [userMessage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                event.preventDefault();
                if (!isMessagePending) {
                    submit();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [submit, isMessagePending]);

    const setSuggestedMessage = (text: string) => {
        setUserMessage(text);
        if (textFocusRef.current) {
            textFocusRef.current.focus();
        }
    };

    useEffect(() => {
        if (textFocusRef.current) {
            textFocusRef.current.focus();
        }
    }, []);

    if (isMobile) {
        return (
            <div className="landing-page-gradient-1 relative flex h-screen w-screen items-center justify-center">
                <div className="flex h-min w-3/4 flex-col items-center justify-center rounded border bg-white p-4">
                    <div className="text-center text-xl ">
                        Sorry, the mobile view of this page is currently a work in progress.
                        Please switch to desktop!
                    </div>
                    <button
                        onClick={() => {
                            router
                                .push(`/`)
                                .catch(() => console.log("error navigating to conversation"));
                        }}
                        className="m-4 rounded border bg-llama-indigo px-8 py-2 font-bold text-white hover:bg-[#3B3775]"
                    >
                        Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PdfFocusProvider>
            <div className="flex h-[100vh] w-full items-center justify-between">
                <div className="flex h-[100vh] w-[44vw] flex-col items-center border-r-2 bg-white">
                    <div className="flex h-[44px] w-full items-center justify-between border-b-2 ">
                        <div className="flex w-full items-center justify-between">
                            <button
                                onClick={() => {
                                    router
                                        .push("/")
                                        .catch(() => console.error("error navigating home"));
                                }}
                                className="ml-4 flex items-center justify-center rounded px-2 font-light text-[#9EA2B0] hover:text-gray-90"
                            >
                                <BiArrowBack className="mr-1" /> Back to Document Selection
                            </button>
                            <button
                                onClick={toggleShareModal}
                                className="mr-3 flex items-center justify-center rounded-full border border-gray-400 p-1 px-3 text-gray-400 hover:bg-gray-15"
                            >
                                <div className="text-xs font-medium">Share</div>
                                <FiShare className="ml-1" size={12} />
                            </button>
                        </div>
                    </div>
                    <div className="flex max-h-[calc(100vh-114px)] w-[44vw] flex-grow flex-col overflow-scroll ">
                        <UnderwritingConversation
                            messages={messages}
                            documents={selectedDocuments}
                            setUserMessage={setSuggestedMessage}
                        />
                    </div>
                    <div className="relative flex h-[70px] w-[44vw] w-full items-center border-b-2 border-t">
                        <textarea
                            ref={textFocusRef}
                            rows={1}
                            className="box-border w-full flex-grow resize-none overflow-hidden rounded px-5 py-3 pr-10 text-gray-90 placeholder-gray-60 outline-none"
                            placeholder={"Start typing your question..."}
                            value={userMessage}
                            onChange={handleTextChange}
                        />
                        <button
                            disabled={isMessagePending || userMessage.length === 0}
                            onClick={submit}
                            className="z-1 absolute right-6 top-1/2 mb-1 -translate-y-1/2 transform rounded text-gray-90 opacity-80 enabled:hover:opacity-100 disabled:opacity-30"
                        >
                            <BsArrowUpCircle size={24} />
                        </button>
                    </div>
                </div>
                <div className="h-screen w-max flex flex-col">
                    <div></div>
                    {/* <DisplayMultiplePdfs pdfs={selectedDocuments} /> */}
                    <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="l-1 text-sm font-bold">Progress Overview</div>
                    </div>
                    <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                            </svg>
                            <span className="sr-only">Check icon</span>
                        </div>
                        <div className="ml-3 text-sm font-normal">Personal Details</div>
                        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
                            {/* <span className="sr-only">Close</span> */}
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                    <div id="toast-warning" className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                            </svg>
                            <span className="sr-only">Warning icon</span>
                        </div>
                        <div className="ml-3 text-sm font-normal">Company Ownership Structure</div>
                        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
                            <span className="sr-only">Close</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                    <div id="toast-warning" className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                            </svg>
                            <span className="sr-only">Warning icon</span>
                        </div>
                        <div className="ml-3 text-sm font-normal">Loan Purpose and Growth Prospects</div>
                        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
                            <span className="sr-only">Close</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                    <div id="toast-warning" className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                        <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                            </svg>
                            <span className="sr-only">Warning icon</span>
                        </div>
                        <div className="ml-3 text-sm font-normal">Incentive Structure</div>
                        <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
                            <span className="sr-only">Close</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>
                    <div id="toast-interactive" className="w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400" role="alert">
                <div className="flex">
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:text-blue-300 dark:bg-blue-900">
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"/>
                        </svg>
                        <span className="sr-only">Refresh icon</span>
                    </div>
                    <div className="ml-3 text-sm font-normal">
                        <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Request Review</span>
                        <div className="mb-2 text-sm font-normal">Speak to a human about your loan needs</div> 
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <a href="#" className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800">Request call back</a>
                            </div>
                            <div>
                                {/* <a href="#" className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Not now</a>  */}
                            </div>
                        </div>    
                    </div>
                    <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-interactive" aria-label="Close">
                        <span className="sr-only">Close</span>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>
                {/* <div id="toast-simple" className="flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-white divide-x divide-gray-200 rounded-lg shadow dark:text-gray-400 dark:divide-gray-700 space-x dark:bg-gray-800" role="alert">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-500 rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 17 8 2L9 1 1 19l8-2Zm0 0V9"/>
                </svg>
                <div className="pl-4 text-sm font-normal"></div>
            </div> */}
            </div>
                </div>
                <ShareLinkModal
                    isOpen={isShareModalOpen}
                    toggleModal={toggleShareModal}
                />
            </div>
        </PdfFocusProvider>
    );
}