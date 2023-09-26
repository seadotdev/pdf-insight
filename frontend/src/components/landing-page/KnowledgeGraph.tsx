import React, { ChangeEvent, Component, ComponentPropsWithRef, useEffect, useRef, useState } from "react";
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
} from "reactflow";
import { backendClient } from "~/api/backendClient";

import { backendUrl } from "~/config";
import useMessages from "~/hooks/useMessages";
import { MESSAGE_STATUS, Message } from "~/types/conversation";
import { RenderConversations } from "~/components/conversations/RenderConversations";
import { BsArrowUpCircle } from "react-icons/bs";
import useLocalStorage from "~/hooks/utils/useLocalStorage";

export const KnowledgeGraph = () => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isMessagePending, setIsMessagePending] = useState<boolean>(false);
    const [userMessage, setUserMessage] = useState<string>("");
    const { messages, userSendMessage, systemSendMessage, setMessages } = useMessages(conversationId || "");

    const textFocusRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const fetchConversation = async (id: string) => {
            const result = await backendClient.fetchConversation(id);
            if (result.messages) {
                setMessages(result.messages);
            }
        };
        if (conversationId) {
            fetchConversation(conversationId).catch(() =>
                console.error("Conversation Load Error")
            );
        }
    }, [conversationId, setMessages]);

    // Keeping this in this file for now because this will be subject to change
    const submit = () => {
        if (!conversationId) {
            console.info("apparently we are null lol");
            console.info(conversationId);
            // If no conversation id, create one (we're creating with no docs here, hacky way to use KG)
            backendClient.createConversation([])
                .then(id => { setConversationId(id); console.info(`here we go again: ${id}`); });
        }

        if (!userMessage || !conversationId)
            return;

        setIsMessagePending(true);
        userSendMessage(userMessage);
        setUserMessage("");

        const messageEndpoint = backendUrl + `conversation/${conversationId}/message`;
        const url = messageEndpoint + `?user_message=${encodeURI(userMessage)}`;

        const events = new EventSource(url);
        events.onmessage = (event: MessageEvent) => {
            const parsedData: Message = JSON.parse(event.data);
            systemSendMessage(parsedData);

            if (parsedData.status === MESSAGE_STATUS.SUCCESS || parsedData.status === MESSAGE_STATUS.ERROR) {
                events.close();
                setIsMessagePending(false);
            }
        };
    };

    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setUserMessage(event.target.value);
    };

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
    }, [submit]);

    return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <div className="flex max-h-[500px] w-[44vw] flex-grow flex-col overflow-scroll ">
                <RenderConversations
                    messages={messages}
                    documents={[]}
                    setUserMessage={setUserMessage}
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
        </div>);
};