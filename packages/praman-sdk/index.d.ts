export interface PramanDeskOptions {
  endpoint?: string;
  timeout?: number;
}

export interface SpendClearanceInput {
  vendor: string;
  amount: number;
  invoiceNumber?: string;
  currency?: string;
  poNumber?: string;
  lei?: string;
  jurisdiction?: string;
}

export interface SpendClearanceResult {
  cleared: boolean;
  verdict: 'CLEAR' | 'SANCTIONED' | 'DISCREPANCY_DETECTED' | 'MANUAL_REVIEW';
  variance?: number;
  sdnCheck?: {
    matched: boolean;
    latency_ms: number;
  };
  leiStatus?: string;
  onChainTx?: string;
  summary: string;
}

export interface SanctionsInput {
  entity?: string;
  address?: string;
  threshold?: number;
}

export interface SanctionsResult {
  screened: boolean;
  verdict: 'CLEAR' | 'SANCTIONED';
  matched: boolean;
  match_count: number;
  matches: Array<{ name: string; score: number; list: string }>;
  confidence: number;
  latency_ms: number;
}

export declare class PramanDesk {
  constructor(options?: PramanDeskOptions);
  clearSpend(input: SpendClearanceInput): Promise<SpendClearanceResult>;
  screenSanctions(input: SanctionsInput): Promise<SanctionsResult>;
  verifyVendor(input: { vendor: string; lei?: string; jurisdiction?: string }): Promise<any>;
  reconcileInvoice(input: { invoiceAmount: number; poAmount: number; invoice?: any; po?: any; tolerance?: number }): Promise<any>;
  getCertificate(input: { vendor?: string; entity?: string; lei?: string; format?: 'json' | 'html' }): Promise<any>;
  counterpartyShield(input: { domain?: string; url?: string; vendor?: string; amount?: number; lei?: string }): Promise<any>;
  rugReceiptScreen(input: { contractAddress?: string; deployerAddress?: string; tokenSymbol?: string }): Promise<any>;
}

export default PramanDesk;
