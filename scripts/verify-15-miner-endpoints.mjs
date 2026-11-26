import http from 'node:http';
import { handleApiRequest } from '../src/handlers.mjs';

const TEST_QUERIES = [
  { intent: 'PURCHASE_ORDER_VERIFY_GENERAL', path: '/api/miner/po-verify?prompt=Verify%20PO-2026-7741%20for%20Apex%20Geotech', check: j => j.status !== 'error' },
  { intent: 'INVOICE_LEDGER_RECONCILE_GENERAL', path: '/api/miner/invoice-reconcile?prompt=Audit%20INV-101%20vs%20LEDGER-101', check: j => j.status !== 'error' },
  { intent: 'VENDOR_VERIFY_GENERAL', path: '/api/miner/vendor-verify?prompt=Verify%20corporate%20status%20of%20Siemens%20AG', check: j => j.valid === true && Boolean(j.lei) },
  { intent: 'DOCUMENT_AUTHENTICITY_GENERAL', path: '/api/miner/doc-authenticity?prompt=Check%20cryptographic%20e-invoice%20integrity', check: j => j.status !== 'error' },
  { intent: 'CORPORATE_REGISTRY_LOOKUP_GENERAL', path: '/api/miner/corporate-registry?prompt=Look%20up%20Apple%20Inc%20in%20Delaware', check: j => j.found === true },
  { intent: 'SANCTIONS_SCREENING_MATCH_GENERAL', path: '/api/miner/sanctions-screen?prompt=Screen%20Banco%20Nacional%20de%20Cuba', check: j => j.matched === true },
  { intent: 'REGULATORY_FILING_MONITOR_GENERAL', path: '/api/miner/regulatory-filing?prompt=How%20many%20Federal%20Register%20documents%20mention%20Boeing', check: j => j.found === true && j.filing_count > 0 },
  { intent: 'CONTRACT_OBLIGATION_AUDIT_GENERAL', path: '/api/miner/contract-obligation?prompt=Audit%20FIDIC%20Yellow%20Book%20Clause%2014.3', check: j => j.status !== 'error' },
  { intent: 'CONTRACT_OBLIGATION_AUDIT_MISSION', path: '/api/mission/contract-audit?prompt=Audit%20MahaRERA%20Section%2018%20delay%20interest%20Registration%20P51900022104', check: j => j.status === 'delay_interest_triggered' && j.verdict === 'Non-compliant' },
  { intent: 'MINING_INTELLIGENCE_GENERAL', path: '/api/miner/mining-intelligence?prompt=Evaluate%20Devnode%20Epoch%2039%20miner%20scores', check: j => j.status !== 'error' },
  { intent: 'GRID_POWER_PRICE_GENERAL', path: '/api/miner/grid-power-price?prompt=Query%20CAISO%20NP15%20DAM%20price', check: j => j.ok === true && Number(j.price_mwh) > 0 && j.confidence >= 0.9 },
  { intent: 'WEB_SEARCH_GENERAL', path: '/api/miner/web-search?prompt=Search%20Telegraph%20Protocol%20documentation', check: j => (j.ok === true || j.status === 'ok') && j.confidence >= 0.7 },
  { intent: 'ONCHAIN_TX_LOOKUP_GENERAL', path: '/api/miner/onchain-tx?prompt=Lookup%20onchain%20transaction%200x524f24c37819fe77c5ba0f6cd125dca6a63e3f0fb193df87beddd363da0a4800', check: j => j.status !== 'error' },
  { intent: 'TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL', path: '/api/miner/token-supply?prompt=Verify%20token%20supply%20for%20USDC%20on%20Sepolia', check: j => (j.ok === true || j.status === 'confirmed') && Number(j.total_supply) > 0 },
  { intent: 'WALLET_BALANCE_CHECK_GENERAL', path: '/api/miner/wallet-balance?prompt=Check%20token%20balance%20for%200x98021b20Efdb7ae2C57366010a6E0fDE207b4466', check: j => j.status !== 'error' && /ETH|USDC|balance/i.test(String(j.answer || '')) },
  { intent: 'RESEARCH_QUERY_GENERAL', path: '/api/miner/research?prompt=Research%20post-quantum%20cryptography', check: j => j.status !== 'error' && j.confidence > 0 },
  { intent: 'RESEARCH_QUERY_GENERAL_ALIAS', path: '/api/miner/research-query?prompt=Research%20post-quantum%20cryptography', check: j => j.status !== 'error' && j.confidence > 0 },
  { intent: 'LIQUIDITY_DEPTH_VERIFY_GENERAL', path: '/api/miner/liquidity-depth?prompt=Verify%20liquidity%20depth%20for%20USDC-WETH', check: j => j.ok === true && Number(j.liquidity_usd) > 0 && j.confidence >= 0.9 },
  { intent: 'B2B_IDENTITY_ENRICHMENT_GENERAL', path: '/api/miner/b2b-identity?prompt=Enrich%20siemens.com%20legal%20entity%20name%20and%20LEI', check: j => j.ok === true && j.found === true && Boolean(j.lei) },
  { intent: 'FRAUD_RISK_GENERAL', path: '/api/miner/fraud-risk?prompt=Score%20fraud%20risk%20of%20signup%20IP%2045.83.x.x%20headless%20browser%20disposable%20email', check: j => j.ok === true && Number(j.fraud_probability) >= 0.7 },
  { intent: 'PAYMENT_METHOD_VERIFY_GENERAL', path: '/api/miner/payment-method-verify?prompt=Is%20BIN%20411111%20a%20valid%20Visa%20and%20routing%20021000021%20active', check: j => j.ok === true && j.valid === true }
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

      const textSummary = String(json.summary || json.reason || json.explanation || json.answer || '');
      const hasSummary = textSummary.length > 0 && !/\bundefined\b|\[object Object\]/.test(textSummary);
      const semanticOk = item.check ? Boolean(item.check(json)) : true;

      if (res.status === 200 && hasSummary && json.status !== 'error' && semanticOk) {
        console.log(`✅ [${res.status}] ${item.intent}`);
        console.log(`   Path: ${item.path}`);
        console.log(`   Summary: ${textSummary.slice(0, 100)}...`);
        console.log(`   Confidence: ${json.confidence ?? 'N/A'}`);
        passed++;
      } else {
        console.error(`❌ [${res.status}] ${item.intent} - Failed semantic/status verification`);
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
