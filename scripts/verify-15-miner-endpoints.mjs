import http from 'node:http';
import { handleApiRequest } from '../src/handlers.mjs';

const TEST_QUERIES = [
  { intent: 'PURCHASE_ORDER_VERIFY_GENERAL', path: '/api/miner/po-verify?prompt=Verify%20PO-2026-7741%20for%20Apex%20Geotech' },
  { intent: 'INVOICE_LEDGER_RECONCILE_GENERAL', path: '/api/miner/invoice-reconcile?prompt=Audit%20INV-101%20vs%20LEDGER-101' },
  { intent: 'VENDOR_VERIFY_GENERAL', path: '/api/miner/vendor-verify?prompt=Verify%20corporate%20status%20of%20Siemens%20AG' },
  { intent: 'DOCUMENT_AUTHENTICITY_GENERAL', path: '/api/miner/doc-authenticity?prompt=Check%20cryptographic%20e-invoice%20integrity' },
  { intent: 'CORPORATE_REGISTRY_LOOKUP_GENERAL', path: '/api/miner/corporate-registry?prompt=Look%20up%20Apple%20Inc%20in%20Delaware' },
  { intent: 'SANCTIONS_SCREENING_MATCH_GENERAL', path: '/api/miner/sanctions-screen?prompt=Screen%20Banco%20Nacional%20de%20Cuba' },
  { intent: 'REGULATORY_FILING_MONITOR_GENERAL', path: '/api/miner/regulatory-filing?prompt=How%20many%20Federal%20Register%20documents%20mention%20Boeing' },
  { intent: 'CONTRACT_OBLIGATION_AUDIT_GENERAL', path: '/api/miner/contract-obligation?prompt=Audit%20FIDIC%20Yellow%20Book%20Clause%2014.3' },
  { intent: 'MINING_INTELLIGENCE_GENERAL', path: '/api/miner/mining-intelligence?prompt=Evaluate%20Devnode%20Epoch%2039%20miner%20scores' },
  { intent: 'GRID_POWER_PRICE_GENERAL', path: '/api/miner/grid-power-price?prompt=Query%20CAISO%20NP15%20HE19%20day-ahead%20price' },
  { intent: 'WEB_SEARCH_GENERAL', path: '/api/miner/web-search?prompt=Search%20Telegraph%20Protocol%20documentation' },
  { intent: 'ONCHAIN_TX_LOOKUP_GENERAL', path: '/api/miner/onchain-tx?prompt=Lookup%20onchain%20transaction%200x524f24c37819fe77c5ba0f6cd125dca6a63e3f0fb193df87beddd363da0a4800' },
  { intent: 'TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL', path: '/api/miner/token-supply?prompt=Verify%20token%20supply%20for%20USDC%20on%20Sepolia' },
  { intent: 'WALLET_TOKEN_BALANCE_GENERAL', path: '/api/miner/wallet-balance?prompt=Check%20token%20balance%20for%200x98021b20Efdb7ae2C57366010a6E0fDE207b4466' },
  { intent: 'RESEARCH_QUERY_GENERAL', path: '/api/miner/research?prompt=Research%20post-quantum%20cryptography' },
  { intent: 'RESEARCH_QUERY_GENERAL_ALIAS', path: '/api/miner/research-query?prompt=Research%20post-quantum%20cryptography' },
  { intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL', path: '/api/miner/liquidity-depth?prompt=Verify%20liquidity%20depth%20for%20USDC-WETH' }
];

async function main() {
  const server = http.createServer((req, res) => handleApiRequest(req, res));
  await new Promise(r => server.listen(3496, '127.0.0.1', r));
  console.log('Verification server listening on port 3496...\n');

  let passed = 0;
  let failed = 0;

  for (const item of TEST_QUERIES) {
    try {
      const url = `http://127.0.0.1:3496${item.path}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));

      const hasSummary = Boolean(json.summary || json.reason || json.explanation || json.answer);
      const hasConfidence = typeof json.confidence === 'number' || typeof json.score === 'number' || json.verified !== undefined || json.found !== undefined;

      if (res.status === 200 && hasSummary) {
        console.log(`✅ [${res.status}] ${item.intent}`);
        console.log(`   Path: ${item.path}`);
        console.log(`   Summary: ${(json.summary || json.reason || json.explanation || json.answer).slice(0, 100)}...`);
        console.log(`   Confidence: ${json.confidence ?? 'N/A'}`);
        passed++;
      } else {
        console.error(`❌ [${res.status}] ${item.intent} - Failed verification`);
        console.error(`   Payload:`, JSON.stringify(json));
        failed++;
      }
    } catch (err) {
      console.error(`❌ EXCEPTION [${item.intent}]:`, err.message);
      failed++;
    }
  }

  server.close();

  console.log(`\n============================================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} passed, ${failed} failed (${TEST_QUERIES.length} total)`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
