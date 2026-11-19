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
  async clearSpend({ vendor = '', amount = 0, invoiceNumber = '', currency = 'USD', poNumber = '', lei = '', jurisdiction = 'US' } = {}) {
    const res = await this._request('/api/spend-guard/evaluate', 'POST', {
      vendor,
      amount,
      invoiceNumber,
      currency,
      poNumber,
      lei,
      jurisdiction
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
  async auditContractObligation({ contractText = '', invoiceAmount = 0, invoiceDate = '', paymentDueDate = '', interestRatePct = 0 } = {}) {
    return this._request('/api/miner/contract-obligation', 'POST', {
      contractText,
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
}

export default PramanDesk;
