import { backendUrl, chApiKey } from "~/config";
import { FilingItem } from "~/types/ch-data";
import type { Message } from "~/types/conversation";
import type { BackendDocument } from "~/types/document";
import { Document } from "~/types/document";
import { fromBackendDocumentToFrontend } from "~/utils/documents";

interface CreateConversationPayload {
    id: string;
}

interface GetConversationPayload {
    id: string;
    messages: Message[];
    documents: BackendDocument[];
}

interface GetConversationReturnType {
    messages: Message[];
    documents: Document[];
}

// Connection endpoints between frontend and backend api
class BackendClient {
    private async get(endpoint: string, body?: any) {
        const url = backendUrl + endpoint + '?' + new URLSearchParams(body);
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res;
    }

    private async post(endpoint: string, body?: any) {
        const url = backendUrl + endpoint;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res;
    }

    public async getSupportedDocTypes(): Promise<[string]> {
        const res = await this.get("document/types")

        return res.json();
    }

    public async getSchemaMapping(document_type: string): Promise<JSON> {
        const res = await this.get("document/schema", { 'document_type': document_type })

        return res.json();
    }

    public async uploadFile(body?: any) {
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

    public async uploadCHDocument(details: FilingItem) {
        const res = await this.post("data/search-ch", details);

        return res;
    }

    public async createConversation(documentIds: string[]): Promise<string> {
        const endpoint = "conversation/";
        const payload = { document_ids: documentIds };
        const res = await this.post(endpoint, payload);
        const data = (await res.json()) as CreateConversationPayload;

        return data.id;
    }

    public async fetchConversation(id: string): Promise<GetConversationReturnType> {
        const endpoint = `conversation/${id}`;
        const res = await this.get(endpoint);
        const data = (await res.json()) as GetConversationPayload;

        return {
            messages: data.messages,
            documents: fromBackendDocumentToFrontend(data.documents),
        };
    }

    public async fetchDocuments(): Promise<Document[]> {
        const endpoint = `document/`;
        const res = await this.get(endpoint);
        const data = (await res.json()) as BackendDocument[];
        const docs = fromBackendDocumentToFrontend(data);

        return docs;
    }
}

export const backendClient = new BackendClient();
