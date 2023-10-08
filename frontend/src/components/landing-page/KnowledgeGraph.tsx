import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";
import { backendClient } from "~/api/backendClient";

import { backendUrl } from "~/config";
import useMessages from "~/hooks/useMessages";
import { MESSAGE_STATUS, type Message } from "~/types/conversation";
import { RenderConversations } from "~/components/conversations/RenderConversations";
import { BsArrowUpCircle } from "react-icons/bs";
import useLocalStorage from "~/hooks/utils/useLocalStorage";


/**
 * Renders the knowledge graph component, which allows the user to interact with a chatbot and receive information.
 */
export const KnowledgeGraph = () => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isMessagePending, setIsMessagePending] = useState<boolean>(false);
    const [userMessage, setUserMessage] = useState<string>("");
    const [conversationIdStored, setConversationIdStored] = useLocalStorage<string | null>("conversationId", null);
    const { messages, userSendMessage, systemSendMessage, setMessages } = useMessages(conversationId || "");
    const textFocusRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (conversationIdStored) {
            setConversationId(conversationIdStored);
            console.info(`Loaded conversation from session cookie: ${conversationIdStored}`);
        }
    }, [conversationIdStored]);

    /**
     * Fetches the stored conversation from the backend and sets the messages state.
     * @param id The ID of the conversation to fetch.
     */
    useEffect(() => {
        const fetchConversation = async (id: string) => {
            const result = await backendClient.fetchConversation(id);
            if (result.messages) {
                setMessages(result.messages);
            }
        };

        if (conversationId) {
            fetchConversation(conversationId).catch(() => console.error("Conversation Load Error"));
        }
    }, [conversationId, setMessages]);

    /**
     * Sends the user's message to the backend and processes the response.
     */
    const processUserMessage = useCallback((id: string) => {
        setIsMessagePending(true);
        userSendMessage(userMessage);
        setUserMessage("");

        const messageEndpoint = backendUrl + `conversation/${id}/message`;
        const url = messageEndpoint + `?user_message=${encodeURI(userMessage)}`;

        const events = new EventSource(url);
        events.onmessage = (event: MessageEvent) => {
            const parsedData: Message = JSON.parse(event.data as string) as Message;
            systemSendMessage(parsedData);

            if (parsedData.status === MESSAGE_STATUS.SUCCESS || parsedData.status === MESSAGE_STATUS.ERROR) {
                events.close();
                setIsMessagePending(false);
            }
        };
    }, [userMessage, userSendMessage, systemSendMessage]);

    /**
     * Handles the submission of the user's message.
     */
    const submit = useCallback(() => {
        if (!userMessage)
            return;

        if (!conversationId) {
            // If no conversation id, create one (we're creating with no docs here, hacky way to use KG)
            backendClient.createConversation([])
                .then(id => {
                    setConversationId(id);
                    setConversationIdStored(id);
                    console.info(`Created new conversation: ${id}`);
                    processUserMessage(id);
                })
                .catch(() => { console.error("Conversation Creation Error"); alert("Failed to create conversation!"); });
        } else {
            processUserMessage(conversationId);
        }
    }, [conversationId, userMessage, processUserMessage, setConversationIdStored]);

    /**
     * Handles changes to the text input field.
     * @param event The change event.
     */
    const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setUserMessage(event.target.value);
    };

    /**
     * Automatically resizes the text input field based on its content.
     */
    useEffect(() => {
        const textarea = document.querySelector("textarea");
        if (textarea) {
            textarea.style.height = "auto";

            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [userMessage]);

    /**
     * Handles the submission of the user's message when the Enter key is pressed.
     */
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

        // Cleanup before re-render
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [submit, isMessagePending]);

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