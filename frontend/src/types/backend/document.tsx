export enum BackendDocumentType {
  BalanceSheet = "Balance Sheet", 
  PnL = "Profit and Loss",
}

export interface BackendDocument {
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}