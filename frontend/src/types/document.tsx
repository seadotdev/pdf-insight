import { DocumentColorEnum } from "~/utils/colors";

export enum DocumentType {
  BalanceSheet = "Balance Sheet", 
  PnL = "Profit and Loss",
  IM = "Investment Memorandum",
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
