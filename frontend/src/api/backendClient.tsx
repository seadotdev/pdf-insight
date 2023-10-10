import { backendUrl } from "~/config";
import type { FilingItem } from "~/types/ch-data";
import type { Message } from "~/types/conversation";
import type { DocumentSchema } from "~/types/document";
import type { Document } from "~/types/document";
import { fromBackendSchema } from "~/types/document";

interface CreateConversationPayload {
    id: string;
}

interface GetConversationPayload {
    id: string;
    messages: Message[];
    documents: DocumentSchema[];
}

interface GetConversationReturnType {
    messages: Message[];
    documents: Document[];
}

/**
 * A class representing a client for interacting with the backend API.
 */
class BackendClient {
    /**
     * Sends a GET request to the backend API with the specified endpoint and query parameters.
     * @param endpoint - The endpoint to send the request to.
     * @param body - The query parameters to include in the request.
     * @returns A Promise that resolves to the Response object returned by the API.
     * @throws An error if the API returns a non-OK status code.
     */
    private async get(endpoint: string, body?: Record<string, string>): Promise<Response> {
        const url = backendUrl + endpoint + '?' + (new URLSearchParams(body)).toString();
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res;
    }

    /**
     * Sends a POST request to the backend API with the specified endpoint and body.
     * @param endpoint - The endpoint to send the request to.
     * @param body - The request body to send.
     * @returns A Promise that resolves to the Response object returned by the API.
     */
    private async post(endpoint: string, body: { [key: string]: string[] } | FilingItem): Promise<Response> {
        const url = backendUrl + endpoint;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res;
    }

    /**
     * Retrieves a list of supported document types from the backend.
     * @returns A Promise that resolves to an array of strings representing the supported document types.
     */
    public async getSupportedDocTypes(): Promise<string[]> {
        const res = await this.get("document/types");

        return res.json() as Promise<string[]>;
    }

    /**
     * Uploads a file to the backend server.
     * @param body - The file to upload.
     * @returns A Promise that resolves to the server response.
     * @throws An error if the server response is not ok.
     */
    public async uploadFile(body: FormData) {
        const url = backendUrl + "data/upload"
        const res = await fetch(url, {
            method: "POST",
            body: body,
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res;
    }

    /**
     * Uploads a Companies House document to the backend.
     * @param details - The details of the filing item to be uploaded.
     * @returns A Promise that resolves to the response from the backend.
     */
    public async uploadCHDocument(details: FilingItem) {
        const res = await this.post("data/search-ch", details);

        return res;
    }

    /**
     * Creates a new conversation with the given document IDs.
     * @param documentIds An array of document IDs to include in the conversation.
     * @returns A Promise that resolves with the ID of the newly created conversation.
     */
    public async createConversation(documentIds: string[]): Promise<string> {
        const endpoint = "conversation/";
        const payload = { document_ids: documentIds };
        const res = await this.post(endpoint, payload);
        const data = (await res.json()) as CreateConversationPayload;

        return data.id;
    }

    /**
     * Fetches a conversation by ID from the backend API.
     * @param id - The ID of the conversation to fetch.
     * @returns A promise that resolves to an object containing the conversation's messages and documents.
     */
    public async fetchConversation(id: string): Promise<GetConversationReturnType> {
        const endpoint = `conversation/${id}`;
        const res = await this.get(endpoint);
        const data = (await res.json()) as GetConversationPayload;

        return {
            messages: data.messages,
            documents: data.documents.map((doc: DocumentSchema): Document => fromBackendSchema(doc)),
        };
    }

    /**
     * Fetches all documents from the backend.
     * @returns A Promise that resolves to an array of Document objects.
     */
    public async fetchDocuments(): Promise<Document[]> {
        const endpoint = `document/`;
        const res = await this.get(endpoint);
        const data = (await res.json()) as DocumentSchema[];
        const docs = data.map((doc: DocumentSchema): Document => fromBackendSchema(doc));

        return docs;
    }
}

export const backendClient = new BackendClient();
