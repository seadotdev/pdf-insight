export enum BackendDocumentType {
  ANNUAL_REPORT = "Annual Report",
  BALANCE_SHEET = "Balance Sheet"
}

export interface BackendDocument {
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}