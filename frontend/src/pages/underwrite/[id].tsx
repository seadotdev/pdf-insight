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
                </div>
                <ShareLinkModal
                    isOpen={isShareModalOpen}
                    toggleModal={toggleShareModal}
                />
            </div>
        </PdfFocusProvider>
    );
}