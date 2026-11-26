/**
 * Praman Desk Official SDK (JavaScript / TypeScript / ESM)
 * Zero-dependency client for autonomous pre-payment spend clearance and compliance verification.
 */

export class PramanDesk {
  constructor(options = {}) {
    this.endpoint = (options.endpoint || 'https://praman-desk.vercel.app').replace(/\/+$/, '');
    this.timeout = options.timeout || 8000;
  }

  async _request(path, method = 'GET', body = null) {
    const url = `${this.endpoint}${path}`;
    const headers = { 'Accept': 'application/json' };
    const opts = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout)
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`PramanDesk API error (${res.status} ${res.statusText}): ${errText}`);
    }
    return await res.json();
  }

  /**
   * Universal 1-line Pre-Payment Spend Guard.
   * Runs OFAC SDN check, corporate registry lookup, WASM line-item math, and delegation policy caps.
   */
  async clearSpend({ vendor = '', amount = 0, invoiceNumber = '', currency = 'USD', poNumber = '', lei = '', jurisdiction = 'US', supervisorSignature = '' } = {}) {
    const res = await this._request('/api/spend-guard/evaluate', 'POST', {
      vendor,
      amount,
      invoiceNumber,
      currency,
      poNumber,
      lei,
      jurisdiction,
      supervisorSignature
    });
    return {
      ...res,
      cleared: res.status === 'APPROVED'
    };
  }

  /**
   * High-speed (<25ms RAM) OFAC SDN & EVM digital currency screening.
   */
  async screenSanctions({ entity = '', address = '', threshold = 0.70 } = {}) {
    const target = address || entity;
    return this._request('/api/miner/sanctions-screen', 'POST', {
      name: target,
      threshold
    });
  }

  /**
   * GLEIF & Corporate Registry Lookup.
   */
  async verifyVendor({ vendor = '', lei = '', jurisdiction = 'US' } = {}) {
    return this._request('/api/miner/corporate-registry', 'POST', {
      company: vendor,
      lei,
      jurisdiction
    });
  }

  /**
   * Deterministic 651-byte WebAssembly Invoice Reconciler.
   */
  async reconcileInvoice({ invoiceAmount = 0, poAmount = 0, invoice = null, po = null, tolerance = 0.05 } = {}) {
    return this._request('/api/miner/invoice-reconcile', 'POST', {
      invoice_amount: invoiceAmount,
      po_amount: poAmount,
      invoice,
      po,
      tolerance
    });
  }

  /**
   * Retrieve Bank-Grade Compliance Audit Certificate.
   */
  async getCertificate({ vendor = '', entity = '', lei = '', format = 'json' } = {}) {
    const name = entity || vendor;
    const q = new URLSearchParams({ vendor: name, lei, format }).toString();
    return this._request(`/api/audit/certificate?${q}`, 'GET');
  }

  /**
   * FakeWatch reciprocal domain + counterparty shield.
   */
  async counterpartyShield({ domain = '', url = '', vendor = '', amount = 0, lei = '' } = {}) {
    return this._request('/api/bridge/fakewatch', 'POST', {
      domain,
      url,
      vendor,
      amount,
      lei
    });
  }

  /**
   * RugReceipt contract and deployer sanctions safety attestation.
   */
  async rugReceiptScreen({ contractAddress = '', deployerAddress = '', tokenSymbol = 'TOKEN' } = {}) {
    const res = await this._request('/api/bridge/rugreceipt', 'POST', {
      contractAddress,
      deployerAddress,
      tokenSymbol
    });
    return {
      ...res,
      cleared: res.verdict === 'VERIFIED_SAFE' || (res.safetyScore ?? 0) >= 70
    };
  }

  /**
   * Mission 04 & CONTRACT_OBLIGATION_AUDIT_GENERAL: Audit contractual payment obligations.
   */
  async auditContractObligation({ contractText = '', principal = undefined, rate_pct = undefined, days_overdue = undefined, months_overdue = undefined, invoiceAmount = 0, invoiceDate = '', paymentDueDate = '', interestRatePct = 0 } = {}) {
    return this._request('/api/miner/contract-obligation', 'POST', {
      contractText,
      principal: principal ?? invoiceAmount,
      rate_pct: rate_pct ?? interestRatePct,
      days_overdue,
      months_overdue,
      invoiceAmount,
      invoiceDate,
      paymentDueDate,
      interestRatePct
    });
  }

  /**
   * Mission 02: Stablecoin pre-payment & on-chain settlement gate with Sepolia Diamond receipt.
   */
  async screenStablecoinSettlement({ recipientAddress = '', amount = 0, asset = 'USDC', purpose = '', dryRun = false } = {}) {
    return this._request('/api/mission/stablecoin-gate', 'POST', {
      recipientAddress,
      amount,
      asset,
      purpose,
      dryRun
    });
  }

  /**
   * Issue #214 / PR #1: 3-way consensus payroll shield with Paysheet.
   */
  async paysheetConsensus({ payeeAddress = '', grossAmount = 0, deductions = 0, netPayable = 0, payPeriod = '' } = {}) {
    return this._request('/api/bridge/paysheet', 'POST', {
      payeeAddress,
      grossAmount,
      deductions,
      netPayable,
      payPeriod
    });
  }

  /**
   * Mission 12 / GRID_POWER_PRICE_GENERAL: Wholesale Locational Marginal Pricing (CAISO / ERCOT).
   */
  async getGridPowerPrice({ hub = 'NP15', iso = 'CAISO', market = 'RTM', query = '' } = {}) {
    const q = new URLSearchParams({ hub, iso, market, query }).toString();
    return this._request(`/api/miner/grid-power-price?${q}`, 'GET');
  }

  /**
   * Mission 12 / MINING_INTELLIGENCE_GENERAL: Sovereign Geological Survey Mining Intelligence.
   */
  async queryMiningIntelligence({ site = '', entity = '', jurisdiction = '' } = {}) {
    const target = site || entity;
    const q = new URLSearchParams({ site: target, jurisdiction }).toString();
    return this._request(`/api/miner/gold-rush?${q}`, 'GET');
  }

  /**
   * Universal Multi-Miner Discrepancy Arbitrator & Consensus Synthesizer.
   */
  async arbitrateMiningDiscrepancies({ site = '', entity = '', miners = [] } = {}) {
    const target = site || entity;
    return this._request('/api/gold-rush/aggregate', 'POST', {
      site: target,
      miners
    });
  }
}

/**
 * Standard Circuit Breaker Exception thrown when an autonomous agent spend is halted.
 */
export class PramanSpendGuardError extends Error {
  constructor(message, clearanceData = {}) {
    super(message);
    this.name = 'PramanSpendGuardError';
    this.clearance = clearanceData;
    this.certHash = clearanceData.certHash || null;
    this.verdictText = clearanceData.verdictText || null;
    this.status = clearanceData.status || 'HALTED';
    this.reason = clearanceData.reason || null;
  }
}

/**
 * 2-Line Autonomous Agent Wallet Spend Middleware
 * Drop into any AI agent framework (Minds, LangChain, ElizaOS, Coinbase AgentKit, Vercel AI SDK).
 * Intercepts tool calls and transaction dispatches before on-chain execution.
 */
export function createAgentSpendMiddleware(options = {}) {
  const client = new PramanDesk(options);

  return async function guardTransaction(context, next = null) {
    const payload = typeof context === 'string' ? { prompt: context } : { ...context };
    const vendor = payload.vendor || payload.recipient || payload.to || payload.counterparty || '';
    const amount = Number(payload.amount || payload.value || 0);
    const currency = payload.currency || payload.token || 'USDC';
    const address = payload.address || payload.recipientAddress || payload.to || '';
    const prompt = payload.prompt || `Disburse ${amount} ${currency} to ${vendor || address}`;

    const res = await client._request('/api/spend-guard/evaluate', 'POST', {
      prompt,
      vendor,
      amount,
      currency,
      address
    });

    const cleared = res.status === 'APPROVED';
    const clearance = {
      ...res,
      cleared,
      timestamp: new Date().toISOString()
    };

    if (!cleared) {
      const errMessage = `[PRAMAN CIRCUIT BREAKER] Transaction HALTED: ${res.verdictText || 'Policy violation detected'}`;
      throw new PramanSpendGuardError(errMessage, clearance);
    }

    if (typeof next === 'function') {
      return await next(clearance);
    }
    return clearance;
  };
}

/**
 * Wraps an agent tool function with pre-payment spend clearance.
 */
export function createToolGuard(toolFn, options = {}) {
  const guard = createAgentSpendMiddleware(options);
  return async function guardedTool(params) {
    const clearance = await guard(params);
    return await toolFn(params, clearance);
  };
}

// Re-export Solana Spend Guard Middleware
export * from './solana.js';

export default PramanDesk;
