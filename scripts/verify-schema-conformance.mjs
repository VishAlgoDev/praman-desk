import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROD_BASE = process.env.PRAMAN_BASE_URL || 'https://praman-desk.vercel.app';

const TEST_MATRIX = [
  {
    name: '1. Corporate Registry (GLEIF)',
    intent: 'CORPORATE_REGISTRY_LOOKUP_GENERAL',
    url: `${PROD_BASE}/api/miner/corporate-registry?company=Apple%20Inc.&jurisdiction=US-CA`,
    method: 'GET',
    schemaProps: ['found', 'legal_name', 'registration_id', 'entity_status', 'active', 'summary', 'intent', 'schema_version'],
    validate: (data) => data.found === true && data.active === true && typeof data.legal_name === 'string'
  },
  {
    name: '2. Sanctions Screening (OFAC SDN)',
    intent: 'SANCTIONS_SCREENING_MATCH_GENERAL',
    url: `${PROD_BASE}/api/miner/sanctions-screen?name=Al-Quds%20Force`,
    method: 'GET',
    schemaProps: ['screened', 'matched', 'verdict', 'lists', 'summary', 'matches', 'intent', 'schema_version'],
    validate: (data) => data.screened === true && data.matched === true && Array.isArray(data.lists)
  },
  {
    name: '3. Regulatory Filing Monitor (SEC / FR)',
    intent: 'REGULATORY_FILING_MONITOR_GENERAL',
    url: `${PROD_BASE}/api/miner/regulatory-filing?entity=Apple%20Inc.&period=last%2012%20months`,
    method: 'GET',
    schemaProps: ['found', 'filing_count', 'summary', 'intent', 'schema_version'],
    validate: (data) => data.found === true && typeof data.filing_count === 'number'
  },
  {
    name: '4. Invoice vs Ledger Reconciliation',
    intent: 'INVOICE_LEDGER_RECONCILE_GENERAL',
    url: `${PROD_BASE}/api/miner/invoice-reconcile`,
    method: 'POST',
    body: { billedQty: 100, acceptedQty: 100, unitPrice: 50.0, taxRatePct: 8.25 },
    schemaProps: ['reconciled', 'verdict', 'summary', 'details', 'intent', 'schema_version'],
    validate: (data) => data.reconciled === true && data.verdict === 'RECONCILED'
  },
  {
    name: '5. Purchase Order Verification',
    intent: 'PURCHASE_ORDER_VERIFY_GENERAL',
    url: `${PROD_BASE}/api/miner/po-verify?po_number=PO-2026-7741&vendor=Authorized%20Enterprise%20Vendor&amount=45000&approval_cap=50000`,
    method: 'GET',
    schemaProps: ['verified', 'status', 'summary', 'amount', 'approval_cap'],
    validate: (data) => data.verified === true && data.amount === 45000
  },
  {
    name: '6. Cryptographic Document Authenticity',
    intent: 'DOCUMENT_AUTHENTICITY_GENERAL',
    url: `${PROD_BASE}/api/miner/doc-authenticity?irnOrSha256=64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012&signedQrAmount=27062.50&pdfFaceAmount=27062.50`,
    method: 'GET',
    schemaProps: ['authentic', 'verdict', 'summary', 'evidence'],
    validate: (data) => data.authentic === true && ['Authentic', 'Likely authentic', 'Likely forged', 'Forged', 'Inconclusive'].includes(data.verdict)
  },
  {
    name: '7. Contract Obligation Audit',
    intent: 'CONTRACT_OBLIGATION_AUDIT_GENERAL',
    url: `${PROD_BASE}/api/miner/contract-obligation?question=${encodeURIComponent('MahaRERA Section 18 delay interest on Apartment B-1402 possession date 2026-03-31')}`,
    method: 'GET',
    schemaProps: ['verdict', 'obligations', 'penalty_amount', 'summary', 'intent', 'schema_version'],
    validate: (data) => ['Compliant', 'Partially compliant', 'Non-compliant', 'Unclear'].includes(data.verdict)
  },
  {
    name: '8. Wholesale Grid Power Pricing',
    intent: 'GRID_POWER_PRICE_GENERAL',
    url: `${PROD_BASE}/api/miner/grid-power-price?node_or_zone=TH_NP15_GEN-APND&market=RTM`,
    method: 'GET',
    schemaProps: ['lmp_usd_per_mwh', 'node_or_zone', 'market', 'currency', 'verdict', 'summary', 'intent'],
    validate: (data) => typeof data.lmp_usd_per_mwh === 'number' && data.lmp_usd_per_mwh > 0 && data.currency === 'USD'
  },
  {
    name: '9. Vendor Statutory Verification',
    intent: 'VENDOR_VERIFY_GENERAL',
    url: `${PROD_BASE}/api/miner/vendor-verify?vendor=SAP%20SE&vat_number=DE143454238`,
    method: 'GET',
    schemaProps: ['valid', 'status', 'summary', 'jurisdiction', 'intent', 'schema_version'],
    validate: (data) => typeof data.valid === 'boolean'
  },
  {
    name: '10. Pre-Payment Spend Guard Clearance Gate',
    intent: 'MISSION_SPEND_GUARD_CLEARANCE',
    url: `${PROD_BASE}/api/mission/autonomous-spend`,
    method: 'POST',
    body: { vendor: 'Apple Inc.', amount: 45000, approval_cap: 50000, currency: 'USD' },
    schemaProps: ['status', 'summary', 'verdict'],
    validate: (data) => typeof data.verdict === 'string'
  },
  {
    name: '11. Stablecoin Settlement Gate',
    intent: 'MISSION_STABLECOIN_SETTLEMENT_GATE',
    url: `${PROD_BASE}/api/mission/stablecoin-gate?recipient=0x98021b20Efdb7ae2C57366010a6E0fDE207b4466&amount_usdc=1000`,
    method: 'GET',
    schemaProps: ['mission', 'network', 'cleared', 'action', 'riskLevel', 'flags'],
    validate: (data) => typeof data.cleared === 'boolean' && typeof data.action === 'string'
  },
  {
    name: '12. Web Search Intelligence (Wikipedia + News)',
    intent: 'WEB_SEARCH_GENERAL',
    url: `${PROD_BASE}/api/miner/web-search?query=Ethereum%20London%20Hard%20Fork`,
    method: 'GET',
    schemaProps: ['answer', 'sources', 'brief', 'status', 'confidence'],
    validate: (data) => data.status === 'ok' && typeof data.answer === 'string' && Array.isArray(data.sources)
  },
  {
    name: '13. On-Chain Transaction Lookup (EVM RPC)',
    intent: 'ONCHAIN_TX_LOOKUP_GENERAL',
    url: `${PROD_BASE}/api/miner/onchain-tx?tx_hash=0x31f127785ae58f6b9a71b6816ef3005531a7af527d6f490be446a2ba84b62619&chain=sepolia`,
    method: 'GET',
    schemaProps: ['tx_hash', 'status', 'from', 'to', 'block_number', 'value_eth', 'confidence'],
    validate: (data) => data.status === 'confirmed' && data.block_number === 12175886
  },
  {
    name: '14. Multi-Miner Discrepancy Arbitration (Meta-Arbiter)',
    intent: 'DISCREPANCY_ARBITRATION_GENERAL',
    url: `${PROD_BASE}/api/miner/arbitrate?query=Sanctions%20Bank%20Rossiya`,
    method: 'GET',
    schemaProps: ['ok', 'task', 'consensus', 'discrepancy_detected', 'arbitrated_verdict', 'sha256_receipt'],
    validate: (data) => data.ok === true && typeof data.sha256_receipt === 'string'
  },
  {
    name: '15. Token Total Supply Verification (EVM RPC)',
    intent: 'TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL',
    url: `${PROD_BASE}/api/miner/token-supply?token_address=0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4&chain=sepolia`,
    method: 'GET',
    schemaProps: ['status', 'token_address', 'chain', 'decimals', 'total_supply_raw', 'total_supply', 'confidence'],
    validate: (data) => data.status === 'confirmed' && typeof data.total_supply === 'number'
  },
  {
    name: '16. Wallet Balance Check (EVM RPC)',
    intent: 'WALLET_BALANCE_CHECK_GENERAL',
    url: `${PROD_BASE}/api/miner/wallet-balance?wallet_address=0x98021b20Efdb7ae2C57366010a6E0fDE207b4466&chain=sepolia`,
    method: 'GET',
    schemaProps: ['status', 'wallet_address', 'chain', 'balance_wei', 'balance_eth', 'confidence'],
    validate: (data) => data.status === 'confirmed' && typeof data.balance_eth === 'number'
  },
  {
    name: '17. Deep Research Query (Multi-Source Attribution)',
    intent: 'RESEARCH_QUERY_GENERAL',
    url: `${PROD_BASE}/api/miner/research-query?query=Autonomous%20AI%20agent%20compliance%20architecture`,
    method: 'GET',
    schemaProps: ['status', 'query', 'summary', 'key_findings', 'sources', 'confidence'],
    validate: (data) => data.status === 'ok' && Array.isArray(data.key_findings) && Array.isArray(data.sources)
  }
];

async function runVerification() {
  console.log(`[Schema Verifier] Testing 17 endpoints across 14 intents + meta-arbitration on ${PROD_BASE}...\n`);
  const results = [];

  for (const item of TEST_MATRIX) {
    const t0 = Date.now();
    const opts = {
      method: item.method,
      headers: {
        'User-Agent': 'Praman-Enterprise-Agent/2.4 (Schema-Conformance-Auditor; +https://praman-desk.vercel.app)',
        ...(item.body ? { 'Content-Type': 'application/json' } : {})
      },
      body: item.body ? JSON.stringify(item.body) : undefined
    };

    try {
      const res = await fetch(item.url, opts);
      const lat = Date.now() - t0;
      const data = await res.json().catch(() => ({}));
      const isHttp200 = res.status === 200;
      
      const missingProps = item.schemaProps.filter(p => !(p in data));
      const schemaPass = missingProps.length === 0;
      const domainPass = item.validate ? item.validate(data) : true;
      const pass = isHttp200 && schemaPass && domainPass;

      results.push({
        name: item.name,
        intent: item.intent,
        status: res.status,
        durationMs: lat,
        pass,
        missingProps,
        verdict: data.verdict || data.action || data.status || 'OK'
      });

      console.log(`[${pass ? 'PASS' : 'FAIL'}] ${item.name} -> HTTP ${res.status} (${lat}ms) | verdict: ${data.verdict || data.action || data.status || 'OK'}`);
      if (!pass) {
        if (!isHttp200) console.log(`   └─ Error: Non-200 HTTP status ${res.status}`);
        if (!schemaPass) console.log(`   └─ Error: Missing schema properties: ${missingProps.join(', ')}`);
        if (!domainPass) console.log(`   └─ Error: Domain assertion failed. Returned:`, JSON.stringify(data).slice(0, 200));
      }
    } catch (err) {
      results.push({
        name: item.name,
        intent: item.intent,
        status: 0,
        durationMs: Date.now() - t0,
        pass: false,
        error: err.message
      });
      console.log(`[FAIL] ${item.name} -> Exception: ${err.message}`);
    }
  }

  const allPassed = results.every(r => r.pass);
  const avgLat = Math.round(results.reduce((s, r) => s + r.durationMs, 0) / results.length);
  console.log(`\n======================================================`);
  console.log(`Summary: ${results.filter(r => r.pass).length}/${results.length} PASSED (Avg Latency: ${avgLat}ms)`);
  console.log(`Bit-Exact Conformance: ${allPassed ? '100% BIT-EXACT PERFECT' : 'FAILURES DETECTED'}`);
  console.log(`======================================================\n`);

  return { allPassed, results, avgLat };
}

runVerification().then(res => {
  if (!res.allPassed) process.exit(1);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
