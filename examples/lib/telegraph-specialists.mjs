/**
 * Live Telegraph specialist queries via Praman Desk production HTTP API
 * (streamable MCP-backed miner tools — no direct handlers.mjs imports).
 */
import { PramanDesk } from '../../packages/praman-sdk/index.js';

export function createPramanTelegraphClient(options = {}) {
  return new PramanDesk({
    endpoint: options.endpoint || process.env.PRAMAN_DESK_ENDPOINT || 'https://praman-desk.vercel.app',
    timeout: options.timeout || Number(process.env.PRAMAN_DESK_TIMEOUT_MS || 15000)
  });
}

export async function screenSanctionsViaTelegraph(client, { name, address, threshold = 0.7 } = {}) {
  return client.screenSanctions({ entity: address || name, threshold });
}

export async function lookupCorporateViaTelegraph(client, { query, lei, jurisdiction = '' } = {}) {
  return client.verifyVendor({
    vendor: query,
    lei,
    jurisdiction
  });
}

export async function checkPaymentDomainViaTelegraph(client, domain, vendor = '') {
  const host = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0];
  if (!host) return null;
  const shield = await client.counterpartyShield({
    domain: host,
    url: `https://${host}`,
    vendor,
    amount: 0
  });
  const domainSafety = shield.domainSafety || {};
  const label = String(
    domainSafety.verdict ||
    shield.shieldVerdict ||
    shield.verdict ||
    shield.status ||
    ''
  );
  let verdict = 'UNKNOWN';
  let risk_score = Number(domainSafety.risk_score ?? 50);

  if (domainSafety.verdict === 'PHISHING' || shield.shieldVerdict === 'BLOCKED_PHISHING' || /PHISHING|BLOCKED|Malicious/i.test(label)) {
    verdict = 'PHISHING';
    risk_score = Math.max(90, risk_score);
  } else if (shield.cleared === true || domainSafety.verdict === 'SAFE' || /SAFE|CLEARED/i.test(label)) {
    verdict = 'SAFE';
    risk_score = Math.min(20, risk_score);
  } else if (!shield.cleared) {
    verdict = 'UNKNOWN';
    risk_score = Math.max(60, risk_score);
  }

  return {
    domain: host,
    verdict,
    risk_score,
    source: domainSafety.source || 'Praman Desk /api/bridge/fakewatch (FakeWatch Miner #42420)'
  };
}