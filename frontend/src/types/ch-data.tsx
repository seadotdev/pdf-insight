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
    total_count = 0;
    items_per_page = 0;
    start_index = 0;
    items: FilingItem[] = [];
}