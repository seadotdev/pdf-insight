import { DocumentColorEnum } from "~/utils/colors";

export interface FilingItem {
    category: string,
    date: Date,
    description: string,
    links: {
        self: string, 
        document_metadata: string,
    },
    transaction_id: string,
    description_values?: JSON,
    type?: string,
    pages?: number,
    barcode?: string,
}

export class FilingResponse {
    total_count: number = 0;
    items_per_page: number = 0;
    start_index: number = 0;
    items: FilingItem[] = [];
}