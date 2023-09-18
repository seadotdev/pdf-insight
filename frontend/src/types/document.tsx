import { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
  ANNUAL_REPORT = "Annual Report",
  BALANCE_SHEET = "Balance Sheet"
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
