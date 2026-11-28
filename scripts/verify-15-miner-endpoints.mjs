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
  { intent: 'PAYMENT_METHOD_VERIFY_GENERAL', path: '/api/miner/payment-method-verify?prompt=Is%20BIN%20411111%20a%20valid%20Visa%20and%20routing%20021000021%20active', check: j => j.ok === true && j.valid === true },
  { intent: 'CONTRACT_OBLIGATION_CLAUSE_EXTRACT', path: '/api/miner/contract-obligation?prompt=Delivery%20within%2014%20days%20of%20PO%2C%20Net%2030%20payment%20terms%2C%20governed%20by%20the%20laws%20of%20Singapore%2C%20liability%20capped%20at%20100%25%20of%20fees%2C%20notice%2030%20days.', check: j => j.status === 'obligations_extracted' && /Net\s*30/i.test(String(j.summary || '')) && /Singapore/i.test(String(j.summary || '')) },
  { intent: 'PURCHASE_ORDER_VERIFY_CAP_FIX', path: '/api/miner/po-verify?po_number=PO-2231&amount=%2442%2C000&prompt=Verify%20PO-2231%20for%20%2442%2C000%2C%20status%3A%20approved%2C%20Q3%20budget%20cap%3A%20%2450%2C000', check: j => j.verified === true && Number(j.amount) === 42000 && Number(j.approval_cap) === 50000 },
  { intent: 'FRAUD_RISK_SUBJECT_PARAM', path: '/api/miner/fraud-risk?subject=alice%40mailinator.com%20IP%2045.83.12.9%20headless%20browser', check: j => j.ok === true && Number(j.risk_score) >= 0.65 && Number(j.fraud_probability) >= 0.65 },
  { intent: 'GRID_POWER_EXPLICIT_INTERVAL', path: '/api/miner/grid-power-price?node=NP15&market=DAM&interval_start=2026-11-24T18%3A00%3A00Z', check: j => j.ok === true && Number(j.lmp_usd_per_mwh) > 0 && /^2026-11-24T18:00/i.test(String(j.interval_start || '')) },
  { intent: 'LIQUIDITY_DEPTH_ETH_USDC_TVL', path: '/api/miner/liquidity-depth?pair=ETH%2FUSDC', check: j => j.ok === true && Number(j.liquidity_usd) > 20000000 },
  { intent: 'LIQUIDITY_DEPTH_SOL_USDC', path: '/api/miner/liquidity-depth?pair=SOL%2FUSDC', check: j => j.ok === true && Number(j.liquidity_usd) > 100000 },
  { intent: 'WALLET_BALANCE_SOLANA_SPL', path: '/api/miner/wallet-balance?address=3r428Z8YSgQFJpsyPcQyxmt1faQQBuNRpqz92m9ucbuL&chain=solana', check: j => j.status !== 'error' && j.chain === 'solana' && /SOL/i.test(String(j.answer || '')) },
  { intent: 'TOKEN_TOTAL_SUPPLY_SOLANA', path: '/api/miner/token-supply?token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&chain=solana', check: j => j.status !== 'error' && Number(j.total_supply) > 1000000 },
  { intent: 'ONCHAIN_TX_SOLANA', path: '/api/miner/onchain-tx?tx=mGGrojDg7cBeNpcWz9Vb9p3qkEpJm6iETVwR4AxtE56WkdMVjEkUbFHQDX4XR3SpSo4wRcKzvrP2TcMNSfMepNa&chain=solana', check: j => j.status === 'confirmed' && Number(j.slot) > 0 },
  { intent: 'TOKEN_TOTAL_SUPPLY_PARENS_ONDO', path: '/api/miner/token-supply?token=Ondo%20Finance%20(ONDO)%20on%20Ethereum', check: j => j.status === 'confirmed' && Number(j.total_supply) > 1000000000 },
  { intent: 'FRAUD_RISK_PHISHING_DOMAIN', path: '/api/miner/fraud-risk?subject=unisvvap.org%20unlimited%20approval', check: j => j.ok === true && Number(j.risk_score) >= 0.7 && (j.risk_level === 'HIGH' || j.risk_level === 'CRITICAL') },
  { intent: 'LIQUIDITY_DEPTH_FEE_TIER_30BPS', path: '/api/miner/liquidity-depth?pool=Uniswap%20v3%20ETH%2FUSDC%200.3%25&chain=ethereum', check: j => j.ok === true && /0\.30%/i.test(String(j.dex || '')) && Number(j.liquidity_usd) > 1000000 },
  { intent: 'CONTRACT_OBLIGATION_NAMED_CORP', path: '/api/miner/contract-obligation?contract=Acme%20Corp%20shall%20deliver%20500%20servers%20within%2015%20business%20days.', check: j => j.verdict === 'Unclear' && Array.isArray(j.obligations) && j.obligations.some(o => /Acme Corp/i.test(o)) },
  { intent: 'URL_SCAN_VERDICT', path: '/api/miner/url-scan?url=https%3A%2F%2Funiswap.org', check: j => j.ok === true && typeof j.safe === 'boolean' && j.safe === true },
  { intent: 'THREAT_INTELLIGENCE_INDICATOR', path: '/api/miner/threat-intel?indicator=FnvLGtucz4E1ppJHRTev6Qv4X7g8Pw6WPStHCcbAKbfx', check: j => j.ok === true && j.malicious === true },
  { intent: 'TRANSACTION_RISK_GENERAL', path: '/api/miner/transaction-risk?transaction=0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13&chain=sepolia', check: j => j.ok === true && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(j.risk_level) && typeof j.risk_score === 'number' },
  { intent: 'SSL_VERIFICATION_CERT', path: '/api/miner/ssl-verify?host=praman-desk.vercel.app', check: j => j.ok === true && j.certificate_valid === true },
  { intent: 'CVE_LOOKUP_CVSS', path: '/api/miner/cve-lookup?cve_id=CVE-2024-3094', check: j => j.ok === true && Number(j.cvss_score) >= 9 && j.severity === 'CRITICAL' },
  { intent: 'SHIPMENT_DELAY_RISK_GENERAL', path: '/api/miner/shipment-delay?shipment=Shanghai%20to%20Los%20Angeles%20container%20vessel', check: j => j.ok === true && ['low', 'moderate', 'high', 'severe'].includes(j.risk_level) && typeof j.delay_probability === 'number' },
  { intent: 'IP_GEOLOCATION_GENERAL', path: '/api/miner/ip-geolocation?ip=8.8.8.8', check: j => j.ok === true && /United States/i.test(String(j.country || '')) && typeof j.latitude === 'number' },
  { intent: 'TOKEN_HOLDER_COUNT_GENERAL', path: '/api/miner/token-holders?token=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&chain=ethereum', check: j => j.ok === true && Number(j.holders_count) > 100000 && j.token_symbol === 'USDC' },
  { intent: 'WASH_TRADING_DETECTION_GENERAL', path: '/api/miner/wash-trading?subject=WETH%2FUSDC', check: j => j.ok === true && ['wash_trading', 'likely_wash_trading', 'inconclusive', 'organic'].includes(j.verdict) && typeof j.wash_volume_pct === 'number' },
  { intent: 'TELEGRAPH_KNOWLEDGE_GENERAL', path: '/api/miner/telegraph-knowledge?question=What%20is%20the%20Sepolia%20Diamond%20address%20for%20Telegraph%20Protocol%3F', check: j => j.ok === true && j.knowledge_topic === 'telegraph' && String(j.brief || '').length <= 80 && String(j.brief || '').length > 0 }
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
