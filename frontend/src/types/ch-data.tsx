export interface FilingItem extends JSON {
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

export interface FilingResponse extends JSON {
    total_count: number;
    items_per_page: number;
    start_index: number;
    items: FilingItem[];
}