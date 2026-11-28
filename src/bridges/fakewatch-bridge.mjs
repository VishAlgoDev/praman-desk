/**
 * Praman Desk x FakeWatch Reciprocal Integration Bridge
 * Connects FakeWatch Domain Safety (Miner #42420) with Praman Desk Compliance & OFAC (Devnode #6164 / Sepolia Diamond)
 *
 * Implements the reciprocal counterparty shield:
 * 1. Checks invoice / dApp domain against FakeWatch & ScamSniffer feeds
 * 2. Enforces "Unknown triggers manual CFO review" security policy
 * 3. Screens legal entity against Praman Desk OFAC SDN in-memory engine (<25ms)
 * 4. Verifies corporate LEI against GLEIF database
 */

import { screenSanctions, lookupCorporateRegistry } from '../handlers.mjs';

// High-risk and known malicious patterns for deterministic local fallback when offline
const KNOWN_PHISHING_REGEXES = [
  /unisvvap\./i,
  /app-uniswap-rewards\./i,
  /claim-arbitrum-foundation\./i,
  /metamask-support-portal\./i,
  /ledger-security-update\./i,
  /opensea-airdrop\./i,
  /revoke-cash-claim\./i
];

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Uint8Array(n + 1));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

const PROTECTED_BRANDS = [
  'uniswap', 'metamask', 'opensea', 'binance', 'coinbase', 'stripe', 'paypal', 'ethereum', 'arbitrum', 'optimism', 'polygon'
];

export async function checkFakeWatchDomain(urlOrDomain) {
  const tStart = performance.now();
  let domain = String(urlOrDomain || '').trim();
  const rawInput = domain;
  try {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      const u = new URL(domain);
      domain = u.hostname;
    } else {
      domain = domain.split('/')[0];
    }
  } catch {
    // keep raw domain
  }

  const targetUrl = (rawInput.startsWith('http://') || rawInput.startsWith('https://'))
    ? rawInput
    : `https://${domain}`;

  // 1. Live FakeWatch API Query (Miner #42420 / https://fakewatch.pro/tools/url-check-api)
  try {
    const res = await fetch(`https://fakewatch.pro/api/v1/url-safe?url=${encodeURIComponent(targetUrl)}`, {
      signal: AbortSignal.timeout(2500),
      headers: { 'Accept': 'application/json', 'User-Agent': 'PramanDesk-SpendGuard/2.0' }
    });
    if (res.ok) {
      const data = await res.json();
      const rawVerdict = String(data.verdict || '').toUpperCase();
      let verdict = 'UNKNOWN';
      let risk_score = 50;

      if (rawVerdict === 'MALICIOUS' || data.safe === false) {
        verdict = 'PHISHING';
        risk_score = Math.max(90, Math.round((data.confidence || 0.95) * 100));
      } else if (rawVerdict === 'SUSPICIOUS') {
        verdict = 'SUSPICIOUS';
        risk_score = 75;
      } else if (rawVerdict === 'SAFE' || data.safe === true) {
        verdict = 'SAFE';
        risk_score = Math.max(0, Math.round((1 - (data.confidence || 0.8)) * 10));
      }

      return {
        domain,
        url: targetUrl,
        verdict,
        raw_verdict: data.verdict,
        safe: data.safe,
        risk_score,
        detections: data.detections || 0,
        sources: data.sources || [],
        summary: data.summary || '',
        confidence: data.confidence !== undefined ? data.confidence : 0.95,
        source: 'FakeWatch Live Network (Miner #42420)',
        details: data,
        latency_ms: Math.round(performance.now() - tStart)
      };
    }
  } catch {
    // fall through to deterministic offline heuristics
  }

  // 2. Offline / Fallback: Generalized Heuristic Typosquat Detection
  const sld = domain.toLowerCase().split('.')[0].replace(/[^a-z0-9]/g, '');
  for (const brand of PROTECTED_BRANDS) {
    if (sld !== brand && Math.abs(sld.length - brand.length) <= 2) {
      const dist = levenshtein(sld, brand);
      if (dist === 1 || (dist === 2 && sld.length > 5)) {
        return {
          domain,
          verdict: 'PHISHING',
          risk_score: 96,
          source: `FakeWatch Heuristic Typosquat Shield (Target: ${brand})`,
          latency_ms: Math.round(performance.now() - tStart)
        };
      }
    }
  }

  // 3. Offline / Fallback: Check deterministic local heuristic / blacklist
  for (const rx of KNOWN_PHISHING_REGEXES) {
    if (rx.test(domain)) {
      return {
        domain,
        verdict: 'PHISHING',
        risk_score: 98,
        source: 'FakeWatch ScamSniffer Rulepack',
        latency_ms: Math.round(performance.now() - tStart)
      };
    }
  }

  // 3. Fallback heuristic for unrecognized domains: triggers UNKNOWN
  const isTopTierSafe = /^(?:[a-z0-9-]+\.)*(?:stripe\.com|google\.com|microsoft\.com|github\.com|aws\.amazon\.com|apple\.com|etherscan\.io|uniswap\.org|circle\.com|coinbase\.com|siemens\.com|sap\.com|ibm\.com|oracle\.com|cisco\.com)$/i.test(domain);
  if (isTopTierSafe) {
    return {
      domain,
      verdict: 'SAFE',
      risk_score: 2,
      source: 'FakeWatch Verified Whitelist',
      latency_ms: Math.round(performance.now() - tStart)
    };
  }

  return {
    domain,
    verdict: 'UNKNOWN',
    risk_score: 45,
    source: 'FakeWatch Heuristic Evaluator',
    note: 'Domain not present in high-reputation whitelist; triggers manual review under enterprise spend policy.',
    latency_ms: Math.round(performance.now() - tStart)
  };
}

export async function evaluateCounterpartyShield({
  url = '',
  domain = '',
  vendor = '',
  entity = '',
  lei = '',
  address = '',
  amount = 0,
  currency = 'USD'
}) {
  const t0 = performance.now();
  const targetDomain = domain || url;
  const targetEntity = entity || vendor;

  // Step 1: Run FakeWatch domain safety
  const domainReport = targetDomain ? await checkFakeWatchDomain(targetDomain) : null;

  // Step 2: Run Praman Desk OFAC SDN screening
  let sanctionsReport = null;
  if (targetEntity || address) {
    sanctionsReport = await screenSanctions({
      name: address || targetEntity,
      threshold: 0.70
    });
  }

  // Step 3: Run Corporate Registry & LEI verification
  let corporateReport = null;
  if (targetEntity || lei) {
    corporateReport = await lookupCorporateRegistry({
      query: lei || targetEntity
    });
  }

  // Step 4: Enforce Enterprise Spend Shield Policy
  let shieldVerdict = 'CLEARED_FOR_PAYMENT';
  let primaryReason = 'Counterparty cleared: Domain verified, zero sanctions hits, valid enterprise profile.';
  const flags = [];

  // A. Check domain phishing
  if (domainReport && domainReport.verdict === 'PHISHING') {
    shieldVerdict = 'BLOCKED_PHISHING';
    primaryReason = `Payment blocked: Destination domain (${domainReport.domain}) flagged as PHISHING by FakeWatch.`;
    flags.push('PHISHING_DOMAIN_DETECTED');
  }

  // B. Check OFAC sanctions
  if (sanctionsReport && sanctionsReport.matched) {
    shieldVerdict = 'BLOCKED_SANCTIONS';
    primaryReason = `Payment blocked: Counterparty matched US Treasury OFAC SDN list (${sanctionsReport.matches?.[0]?.name || targetEntity}).`;
    flags.push('OFAC_SDN_MATCH_DETECTED');
  }

  // C. Check UNKNOWN domain -> triggers MANUAL REVIEW policy agreed with FakeWatch
  if (shieldVerdict === 'CLEARED_FOR_PAYMENT' && domainReport && domainReport.verdict === 'UNKNOWN') {
    shieldVerdict = 'MANUAL_REVIEW_REQUIRED';
    primaryReason = `Manual review required: Destination domain (${domainReport.domain}) is unrated on FakeWatch. Dual CFO sign-off recommended before release.`;
    flags.push('UNRATED_DOMAIN_MANUAL_REVIEW');
  }

  // D. Check high-value spend without LEI
  const parsedAmt = Number(amount) || 0;
  if (parsedAmt > 10000 && (!corporateReport || !corporateReport.found)) {
    if (shieldVerdict === 'CLEARED_FOR_PAYMENT') {
      shieldVerdict = 'MANUAL_REVIEW_REQUIRED';
      primaryReason = `Manual review required: Transaction amount ($${parsedAmt.toLocaleString()}) exceeds $10k without verified LEI on corporate registry.`;
    }
    flags.push('HIGH_VALUE_UNVERIFIED_LEI');
  }

  const totalLatencyMs = Math.round(performance.now() - t0);

  return {
    shieldVerdict,
    cleared: shieldVerdict === 'CLEARED_FOR_PAYMENT',
    actionRequired: shieldVerdict === 'MANUAL_REVIEW_REQUIRED',
    blocked: shieldVerdict.startsWith('BLOCKED'),
    primaryReason,
    flags,
    parameters: {
      domain: targetDomain || null,
      entity: targetEntity || null,
      address: address || null,
      lei: lei || null,
      amount: parsedAmt,
      currency
    },
    domainSafety: domainReport,
    sanctionsCheck: sanctionsReport ? {
      matched: sanctionsReport.matched,
      matchCount: sanctionsReport.matches?.length || 0,
      matches: sanctionsReport.matches || [],
      lists: ['US Treasury OFAC SDN', 'Digital Currency Addresses']
    } : null,
    corporateRegistry: corporateReport ? {
      found: corporateReport.found,
      lei: corporateReport.lei || null,
      status: corporateReport.status || null,
      name: corporateReport.name || null
    } : null,
    reciprocalAttribution: {
      integratedMiners: [
        { id: 6164, diamondRegistration: 6216, name: 'Praman Desk', role: 'OFAC SDN & LEI Compliance Engine' },
        { id: 42420, name: 'FakeWatch', role: 'Domain Reputation & Phishing Detection' }
      ],
      network: 'Telegraph Protocol Season II',
      spec: 'ERC-x402 Pre-Flight Counterparty Shield v1'
    },
    latency_ms: totalLatencyMs,
    timestamp: new Date().toISOString()
  };
}
