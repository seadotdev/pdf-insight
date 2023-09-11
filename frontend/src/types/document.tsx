import { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
  TenK = "Balance Sheet", 
  TenQ = "Profit and Loss",
  // IM = "Investment Memorandum",
  // TenK = "Form 10K", 
  // TenQ = "Form 10Q",
  // TODO: need to change these in the database?
}

export type Ticker = {
  ticker: string;
  fullName: string;
};

export interface SecDocument extends Ticker {
  id: string;
  url: string;
  year: string;
  docType: DocumentType;
  quarter?: string;
  color: DocumentColorEnum;
}
