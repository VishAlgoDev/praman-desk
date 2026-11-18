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
   * Runs OFAC SDN check, corporate registry lookup, and optional invoice-to-PO reconciliation.
   */
  async clearSpend({ vendor = '', amount = 0, invoiceNumber = '', currency = 'USD', poNumber = '', lei = '', jurisdiction = 'US' } = {}) {
    return this._request('/api/audit/primary', 'POST', {
      vendor,
      amount,
      invoiceNumber,
      currency,
      poNumber,
      lei,
      jurisdiction
    });
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
    return this._request('/api/bridge/rugreceipt', 'POST', {
      contractAddress,
      deployerAddress,
      tokenSymbol
    });
  }
}

export default PramanDesk;
