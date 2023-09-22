import { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
  ANNUAL_REPORT = "Annual Report",
  CONFIRMATION_STATEMENT = "Confirmation Statement"
}

export type Ticker = {
  ticker: string;
  fullName: string;
};

export interface Document extends Ticker {
  id: string;
  url: string;
  year: string;
  docType: DocumentType;
  color: DocumentColorEnum;
}

export interface BackendDocument {
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
  docType: DocumentType;
}