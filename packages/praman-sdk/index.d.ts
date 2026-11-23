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
  supervisorSignature?: string;
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
  auditContractObligation(input: { contractText?: string; invoiceAmount?: number; invoiceDate?: string; paymentDueDate?: string; interestRatePct?: number }): Promise<any>;
  screenStablecoinSettlement(input: { recipientAddress: string; amount: number; asset?: string; purpose?: string; dryRun?: boolean }): Promise<any>;
  paysheetConsensus(input: { payeeAddress: string; grossAmount: number; deductions?: number; netPayable?: number; payPeriod?: string }): Promise<any>;
  getGridPowerPrice(input?: { hub?: string; iso?: string; market?: string; query?: string }): Promise<any>;
  queryMiningIntelligence(input?: { site?: string; entity?: string; jurisdiction?: string }): Promise<any>;
  arbitrateMiningDiscrepancies(input?: { site?: string; entity?: string; miners?: any[] }): Promise<any>;
}

export declare class PramanSpendGuardError extends Error {
  name: 'PramanSpendGuardError';
  clearance: any;
  certHash: string | null;
  verdictText: string | null;
  status: string;
  constructor(message: string, clearanceData?: any);
}

export declare function createAgentSpendMiddleware(options?: PramanDeskOptions): (
  context: string | { vendor?: string; amount?: number; currency?: string; address?: string; prompt?: string; [key: string]: any },
  next?: ((clearance: any) => Promise<any> | any) | null
) => Promise<any>;

export declare function createToolGuard<T = any>(
  toolFn: (params: T, clearance?: any) => Promise<any> | any,
  options?: PramanDeskOptions
): (params: T) => Promise<any>;

export default PramanDesk;
