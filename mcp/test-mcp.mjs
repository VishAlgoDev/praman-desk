import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverScript = path.join(__dirname, 'server.mjs');

async function runTests() {
  console.log('=== Praman Spend Guard MCP Server Test Suite ===\n');

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverScript],
    cwd: path.resolve(__dirname, '..'),
  });

  const client = new Client(
    {
      name: 'praman-test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  console.log('1. Connecting to Praman Spend Guard via Stdio Transport...');
  await client.connect(transport);
  console.log('   Connected successfully.\n');

  // Test 1: List Tools
  console.log('2. Requesting Tool List (ListToolsRequest)...');
  const toolsResult = await client.listTools();
  console.log(`   Found ${toolsResult.tools.length} tools:`);
  for (const t of toolsResult.tools) {
    console.log(`   - ${t.name}: ${t.description.slice(0, 65)}...`);
  }
  if (toolsResult.tools.length !== 29) {
    throw new Error(`Expected 29 tools, found ${toolsResult.tools.length}`);
  }
  console.log('   PASS: All 29 tools registered.\n');

  // Test 2: verify_counterparty (STRIPE, LLC)
  console.log('3. Testing tool: verify_counterparty (STRIPE, LLC)...');
  const resVendor = await client.callTool({
    name: 'verify_counterparty',
    arguments: { vendor: 'STRIPE, LLC' },
  });
  const vendorParsed = JSON.parse(resVendor.content[0].text);
  console.log(`   Result: ${vendorParsed.vendor} | LEI: ${vendorParsed.lei} | Status: ${vendorParsed.registration_status}`);
  if (!vendorParsed.lei || vendorParsed.registration_status !== 'ISSUED') {
    throw new Error('Expected Stripe LEI to be resolved and ISSUED');
  }
  console.log('   PASS: verify_counterparty succeeded.\n');

  // Test 3: reconcile_invoice (Exact match vs overbilling)
  console.log('4. Testing tool: reconcile_invoice (Overbilling discrepancy test)...');
  const resRecon = await client.callTool({
    name: 'reconcile_invoice',
    arguments: {
      invoice_id: 'INV-2026-900',
      po_number: 'PO-2026-440',
      billed_qty: 120, // billed 120
      accepted_qty: 100, // received 100
      unit_price: 250,
      tax_rate_pct: 10,
      currency: 'USD',
    },
  });
  const reconParsed = JSON.parse(resRecon.content[0].text);
  console.log(`   Reconciled: ${reconParsed.reconciled}`);
  console.log(`   Discrepancy: ${reconParsed.discrepancy}`);
  if (reconParsed.reconciled !== false) {
    throw new Error('Expected reconciliation to fail on 20 unit overbilling');
  }
  console.log('   PASS: reconcile_invoice caught overbilling correctly.\n');

  // Test 4: verify_spend_authorization (Cap check)
  console.log('5. Testing tool: verify_spend_authorization (Cap exceed check)...');
  const resCap = await client.callTool({
    name: 'verify_spend_authorization',
    arguments: {
      po_number: 'PO-2026-440',
      vendor: 'Enterprise Cloud Inc',
      amount: 75000,
      approval_cap: 50000,
      currency: 'USD',
      dual_signoff_present: false,
    },
  });
  const capParsed = JSON.parse(resCap.content[0].text);
  console.log(`   Status: ${capParsed.status} | Verified: ${capParsed.verified}`);
  if (capParsed.verified !== false || capParsed.status !== 'approval_cap_exceeded') {
    throw new Error('Expected cap exceeded without dual signoff');
  }
  console.log('   PASS: verify_spend_authorization enforced delegation cap.\n');

  // Test 5: verify_receipt_provenance (Cryptographic digest)
  console.log('6. Testing tool: verify_receipt_provenance (Authentic SHA-256)...');
  const testHash = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
  const resProv = await client.callTool({
    name: 'verify_receipt_provenance',
    arguments: {
      document_ref: 'Receipt-440.pdf',
      sha256_digest: testHash,
      signed_amount: 33000,
      face_amount: 33000,
      currency: 'USD',
    },
  });
  const provParsed = JSON.parse(resProv.content[0].text);
  console.log(`   Authentic: ${provParsed.authentic} | Verdict: ${provParsed.verdict}`);
  if (provParsed.authentic !== true) {
    throw new Error('Expected authentic SHA-256 verification');
  }
  console.log('   PASS: verify_receipt_provenance verified digest.\n');

  // Test 6: clear_spend (Composite clearance)
  console.log('7. Testing tool: clear_spend (Clean pass scenario)...');
  const resClear = await client.callTool({
    name: 'clear_spend',
    arguments: {
      vendor: 'Apple Inc.',
      invoice_id: 'INV-2026-APP-01',
      po_number: 'PO-2026-APP-01',
      billed_qty: 10,
      accepted_qty: 10,
      unit_price: 1500,
      tax_rate_pct: 0,
      approval_cap: 25000,
      currency: 'USD',
    },
  });
  const clearParsed = JSON.parse(resClear.content[0].text);
  console.log(`   Gate Decision: Cleared=${clearParsed.gate_decision.cleared}, Action=${clearParsed.gate_decision.action}, Risk=${clearParsed.gate_decision.risk_level}`);
  if (!clearParsed.gate_decision.cleared || clearParsed.gate_decision.action !== 'APPROVE_PAYMENT') {
    throw new Error('Expected clean spend to clear gate');
  }
  console.log('   PASS: clear_spend composite gate approved valid payment.\n');

  // Test 6b: clear_spend with FakeWatch Unknown payment URL (Manual Review Gate)
  console.log('7b. Testing tool: clear_spend with Unknown payment URL (FakeWatch gate)...');
  const resUnknownUrl = await client.callTool({
    name: 'clear_spend',
    arguments: {
      vendor: 'Apple Inc.',
      invoice_id: 'INV-2026-APP-02',
      po_number: 'PO-2026-APP-02',
      billed_qty: 1,
      accepted_qty: 1,
      unit_price: 500,
      approval_cap: 5000,
      payment_url: 'https://uniswapp-claim.xyz',
    },
  });
  const unknownUrlParsed = JSON.parse(resUnknownUrl.content[0].text);
  console.log(`   Gate Decision: Cleared=${unknownUrlParsed.gate_decision.cleared}, Action=${unknownUrlParsed.gate_decision.action}, Risk=${unknownUrlParsed.gate_decision.risk_level}`);
  if (unknownUrlParsed.gate_decision.cleared !== false || unknownUrlParsed.gate_decision.action !== 'HELD_FOR_MANUAL_REVIEW') {
    throw new Error('Expected Unknown URL to trigger HELD_FOR_MANUAL_REVIEW gate');
  }
  console.log('   PASS: clear_spend correctly routed Unknown URL to HELD_FOR_MANUAL_REVIEW.\n');

  // Test 6c: clear_spend with omitted invoice_id / po_number / approval_cap (ND-34 & ND-35)
  console.log('7c. Testing tool: clear_spend with omitted approval_cap / doc IDs (ND-34/ND-35)...');
  const resMissingCap = await client.callTool({
    name: 'clear_spend',
    arguments: {
      vendor: 'Siemens AG',
      billed_qty: 10,
      accepted_qty: 10,
      unit_price: 6000,
      currency: 'USD',
    },
  });
  const missingCapParsed = JSON.parse(resMissingCap.content[0].text);
  if (
    missingCapParsed.gate_decision.cleared !== false ||
    missingCapParsed.gate_decision.action !== 'HELD_FOR_MANUAL_REVIEW' ||
    !missingCapParsed.gate_decision.flags.some(f => f.startsWith('UNVERIFIED_APPROVAL_CAP')) ||
    JSON.stringify(missingCapParsed).includes('undefined') ||
    JSON.stringify(missingCapParsed).includes('INV-2026-081') ||
    JSON.stringify(missingCapParsed).includes('PO-2026-7741')
  ) {
    throw new Error(`ND-34/ND-35 failed in clear_spend: ${JSON.stringify(missingCapParsed)}`);
  }
  console.log('   PASS: clear_spend held unverified approval_cap cleanly without synthetic IDs or undefined.\n');

  // Test 7: compare_evaluator_scoring (WASM deterministic scoring)
  console.log('8. Testing tool: compare_evaluator_scoring (WASM deterministic)...');
  const resWasm = await client.callTool({
    name: 'compare_evaluator_scoring',
    arguments: {
      ground_truth: 10000,
      miner_output: 10250,
      rule_code: 2, // RelTol
      tolerance: 500, // 5%
    },
  });
  const wasmParsed = JSON.parse(resWasm.content[0].text);
  console.log(`   Score Basis Points: ${wasmParsed.score_basis_points} (${wasmParsed.score_percentage})`);
  console.log(`   Engine: ${wasmParsed.engine}`);
  if (wasmParsed.score_basis_points !== 7500) {
    throw new Error(`Expected score 7500 bp, got ${wasmParsed.score_basis_points}`);
  }
  console.log('   PASS: compare_evaluator_scoring executed standalone WASM.\n');

  // Test 8: screen_sanctions (OFAC SDN Match)
  console.log('9. Testing tool: screen_sanctions (Banco Nacional de Cuba)...');
  const resSanc = await client.callTool({
    name: 'screen_sanctions',
    arguments: { name: 'Banco Nacional de Cuba' },
  });
  const sancParsed = JSON.parse(resSanc.content[0].text);
  console.log(`   Matches found: ${sancParsed.match_count} | Top match: ${sancParsed.matches?.[0]?.matched_name}`);
  if (!sancParsed.matches || sancParsed.matches.length === 0) {
    throw new Error('Expected OFAC SDN sanctions hit for Banco Nacional de Cuba');
  }
  console.log('   PASS: screen_sanctions flagged sanctioned entity.\n');

  // Test 9: lookup_corporate_registry (GLEIF Live LEI)
  console.log('10. Testing tool: lookup_corporate_registry (Tesla Inc)...');
  const resCorp = await client.callTool({
    name: 'lookup_corporate_registry',
    arguments: { company: 'Tesla Inc', jurisdiction: 'US' },
  });
  const corpParsed = JSON.parse(resCorp.content[0].text);
  console.log(`   Found: ${corpParsed.found} | LEI: ${corpParsed.results?.[0]?.lei} | Name: ${corpParsed.results?.[0]?.legal_name}`);
  if (!corpParsed.found || !corpParsed.results?.[0]?.lei) {
    throw new Error('Expected GLEIF corporate registry match for Tesla Inc');
  }
  console.log('   PASS: lookup_corporate_registry resolved GLEIF LEI.\n');

  // Test 10: monitor_regulatory_filings (SEC EDGAR)
  console.log('11. Testing tool: monitor_regulatory_filings (Tesla Inc)...');
  const resFiling = await client.callTool({
    name: 'monitor_regulatory_filings',
    arguments: { company: 'Tesla Inc', period: '2026' },
  });
  const filingParsed = JSON.parse(resFiling.content[0].text);
  console.log(`   Filings count: ${filingParsed.total_results} | Sources: ${filingParsed.sources?.join(', ')}`);
  if (typeof filingParsed.total_results !== 'number') {
    throw new Error('Expected numeric total_results for regulatory filings');
  }
  console.log('   PASS: monitor_regulatory_filings queried SEC EDGAR.\n');

  // Test 11: clear_spend with Sanctioned Counterparty (Critical Gate Block Test)
  console.log('12. Testing tool: clear_spend (CRITICAL SANCTIONS BLOCK on Banco Nacional de Cuba)...');
  const resSancBlock = await client.callTool({
    name: 'clear_spend',
    arguments: {
      vendor: 'Banco Nacional de Cuba',
      invoice_id: 'INV-SANC-999',
      po_number: 'PO-SANC-999',
      billed_qty: 10,
      accepted_qty: 10,
      unit_price: 1000,
      approval_cap: 50000,
    },
  });
  const sancBlockParsed = JSON.parse(resSancBlock.content[0].text);
  console.log(`   Gate Decision: Cleared=${sancBlockParsed.gate_decision.cleared}, Action=${sancBlockParsed.gate_decision.action}, Risk=${sancBlockParsed.gate_decision.risk_level}`);
  if (sancBlockParsed.gate_decision.cleared !== false || sancBlockParsed.gate_decision.risk_level !== 'CRITICAL_SANCTIONS_BLOCK' || sancBlockParsed.gate_decision.action !== 'REJECT_AND_FREEZE') {
    throw new Error('CRITICAL FLAW: clear_spend failed to block payment to sanctioned entity!');
  }
  console.log('   PASS: clear_spend successfully enforced REJECT_AND_FREEZE on sanctioned counterparty.\n');

  // Test 12: screen_stablecoin_settlement (Mission 02: Clean + Sanctioned Freeze + Invalid Amount)
  console.log('13. Testing tool: screen_stablecoin_settlement (Mission 02 Sepolia gate)...');
  const m2Clean = await client.callTool({
    name: 'screen_stablecoin_settlement',
    arguments: {
      recipient_address: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amount_usdc: 0.25,
      beneficiary_name: 'Apple Inc.',
      delegation_cap_usdc: 500,
    },
  });
  const m2CleanParsed = JSON.parse(m2Clean.content[0].text);
  console.log(`   Clean Gate: cleared=${m2CleanParsed.cleared} | action=${m2CleanParsed.action} | block=${m2CleanParsed.onchainState?.chainBlockNumber} | usdc=${m2CleanParsed.onchainState?.senderUsdcBalance}`);
  if (m2CleanParsed.cleared !== true || m2CleanParsed.action !== 'APPROVE_USDC_TRANSFER' || !m2CleanParsed.onchainState?.chainBlockNumber) {
    throw new Error(`Expected Mission 02 clean transfer approval, got ${JSON.stringify(m2CleanParsed)}`);
  }

  const m2Freeze = await client.callTool({
    name: 'screen_stablecoin_settlement',
    arguments: {
      recipient_address: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amount_usdc: 10,
      beneficiary_name: 'Lazarus Group',
    },
  });
  const m2FreezeParsed = JSON.parse(m2Freeze.content[0].text);
  console.log(`   Sanctioned Freeze: cleared=${m2FreezeParsed.cleared} | action=${m2FreezeParsed.action} | risk=${m2FreezeParsed.riskLevel}`);
  if (m2FreezeParsed.cleared !== false || m2FreezeParsed.action !== 'REJECT_AND_FREEZE') {
    throw new Error(`Expected REJECT_AND_FREEZE for Lazarus Group, got ${JSON.stringify(m2FreezeParsed)}`);
  }

  const m2Negative = await client.callTool({
    name: 'screen_stablecoin_settlement',
    arguments: {
      recipient_address: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amount_usdc: -5,
      beneficiary_name: 'Apple Inc.',
    },
  });
  const m2NegParsed = JSON.parse(m2Negative.content[0].text);
  if (m2NegParsed.cleared !== false || m2NegParsed.action !== 'REJECT_INVALID_SETTLEMENT') {
    throw new Error(`Expected REJECT_INVALID_SETTLEMENT for negative amount, got ${JSON.stringify(m2NegParsed)}`);
  }

  const m2OmitOrig = await client.callTool({
    name: 'screen_stablecoin_settlement',
    arguments: {
      recipient_address: '0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b',
      amount_usdc: 1500,
      beneficiary_name: 'Apple Inc.',
    },
  });
  const m2OmitParsed = JSON.parse(m2OmitOrig.content[0].text);
  if (m2OmitParsed.cleared !== false || m2OmitParsed.action !== 'HOLD_TRAVEL_RULE') {
    throw new Error(`Expected HOLD_TRAVEL_RULE when originator_name omitted on >=$1000, got ${JSON.stringify(m2OmitParsed)}`);
  }

  const sancHighThresh = await client.callTool({
    name: 'screen_sanctions',
    arguments: {
      name: 'Viktor Bout',
      threshold: 0.99,
    },
  });
  const sancHighParsed = JSON.parse(sancHighThresh.content[0].text);
  if (sancHighParsed.matched !== false) {
    throw new Error(`Expected threshold=0.99 to filter comma/middle-name match (0.88-0.96), got ${JSON.stringify(sancHighParsed)}`);
  }

  const m2EvmFreeze = await client.callTool({
    name: 'screen_stablecoin_settlement',
    arguments: {
      recipient_address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
      amount_usdc: 0.25,
      beneficiary_name: 'Benign Counterparty Inc.',
      originator_name: 'Praman Desk Treasury',
    },
  });
  const m2EvmFreezeParsed = JSON.parse(m2EvmFreeze.content[0].text);
  if (m2EvmFreezeParsed.cleared !== false || m2EvmFreezeParsed.action !== 'REJECT_AND_FREEZE') {
    throw new Error(`Expected REJECT_AND_FREEZE on OFAC EVM address with benign name, got ${JSON.stringify(m2EvmFreezeParsed)}`);
  }
  console.log('   PASS: screen_stablecoin_settlement & screen_sanctions threshold enforced live RPC, FATF Travel Rule, OFAC EVM addrs & bounds.\n');

  // Test 16: get_compliance_certificate
  console.log('16. Testing tool: get_compliance_certificate (Apple Inc.)...');
  const resCert = await client.callTool({
    name: 'get_compliance_certificate',
    arguments: { entity: 'Apple Inc.', invoice_amount: 500, po_amount: 500 },
  });
  const certParsed = JSON.parse(resCert.content[0].text);
  if (!certParsed.certificateId || !certParsed.cryptographicSeal?.sealDigest) {
    throw new Error(`Expected certificateId and sealDigest, got ${JSON.stringify(certParsed)}`);
  }
  console.log(`   Result: Certificate ${certParsed.certificateId} | Verdict: ${certParsed.clearanceVerdict} | Seal: ${certParsed.cryptographicSeal.sealDigest.slice(0, 16)}...`);
  console.log('   PASS: get_compliance_certificate succeeded.\n');

  // Test 17: fakewatch_counterparty_shield
  console.log('17. Testing tool: fakewatch_counterparty_shield (unisvvap phishing link vs stripe)...');
  const resFakeWatch = await client.callTool({
    name: 'fakewatch_counterparty_shield',
    arguments: { domain: 'unisvvap.org', vendor: 'Stripe, LLC' },
  });
  const fwParsed = JSON.parse(resFakeWatch.content[0].text);
  if (fwParsed.shieldVerdict !== 'BLOCKED_PHISHING' || !fwParsed.blocked) {
    throw new Error(`Expected BLOCKED_PHISHING for unisvvap.org, got ${JSON.stringify(fwParsed)}`);
  }
  console.log(`   Result: Phishing blocked | Verdict: ${fwParsed.shieldVerdict} | Reason: ${fwParsed.primaryReason}`);
  console.log('   PASS: fakewatch_counterparty_shield succeeded.\n');

  // Test 18: rugreceipt_contract_screen
  console.log('18. Testing tool: rugreceipt_contract_screen (Lazarus EVM address)...');
  const resRugRec = await client.callTool({
    name: 'rugreceipt_contract_screen',
    arguments: { contract_address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' },
  });
  const rugParsed = JSON.parse(resRugRec.content[0].text);
  if (rugParsed.verdict !== 'CRITICAL_RISK' || rugParsed.safetyScore > 10) {
    throw new Error(`Expected CRITICAL_RISK for Lazarus EVM address, got ${JSON.stringify(rugParsed)}`);
  }
  console.log(`   Result: Critical risk flagged | Score: ${rugParsed.safetyScore}/100 | Receipt: ${rugParsed.receiptId}`);
  console.log('   PASS: rugreceipt_contract_screen succeeded.\n');

  // Test 19: paysheet_consensus_screen (Issue #214 3-way consensus)
  console.log('19. Testing tool: paysheet_consensus_screen (Lazarus Address vs Clean)...');
  const resPaysheet = await client.callTool({
    name: 'paysheet_consensus_screen',
    arguments: { target: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96', amount_usdc: '500.00' },
  });
  const psParsed = JSON.parse(resPaysheet.content[0].text);
  if (psParsed.cleared !== false || psParsed.action !== 'HALT_AND_FREEZE' || !psParsed.consensusReached) {
    throw new Error(`Expected HALT_AND_FREEZE on Paysheet consensus screen for Lazarus address, got ${JSON.stringify(psParsed)}`);
  }
  console.log(`   Result: Consensus HALT | Action: ${psParsed.action} | Seal: ${psParsed.attestationSeal.slice(0, 16)}...`);
  console.log('   PASS: paysheet_consensus_screen succeeded.\n');

  // Test 20: audit_contract_obligation (Mission 04 / Intent 8)
  console.log('20. Testing tool: audit_contract_obligation (MahaRERA Section 18 delay interest)...');
  const resContract = await client.callTool({
    name: 'audit_contract_obligation',
    arguments: { text: 'MahaRERA Registration P51900022104 Apartment B-1402 delay interest under Section 18 with Clause 7.1 grace period' },
  });
  const coParsed = JSON.parse(resContract.content[0].text);
  if (!coParsed.verdict || coParsed.status !== 'delay_interest_triggered' || coParsed.interest_rate_pct !== 11.00) {
    throw new Error(`Expected delay_interest_triggered at 11.00% p.a., got ${JSON.stringify(coParsed)}`);
  }
  console.log(`   Result: Statutory delay interest triggered | Rate: ${coParsed.interest_rate_pct}% p.a. | Liability: INR ${coParsed.accrued_liability}`);
  console.log('   PASS: audit_contract_obligation succeeded.\n');

  // Test 21: query_mining_intelligence (Gold Rush / Track 2 & 3)
  console.log('21. Testing tool: query_mining_intelligence (Mount Morgan Mine GSQ record)...');
  const resMining = await client.callTool({
    name: 'query_mining_intelligence',
    arguments: { query: 'Investigate Mount Morgan Mine Queensland VHMS geology and historical gold production' },
  });
  const miningParsed = JSON.parse(resMining.content[0].text);
  if (miningParsed.verdict !== 'VERIFIED_HISTORICAL_RECORD' || miningParsed.production?.gold_tonnes !== 262.0) {
    throw new Error(`Expected Mount Morgan GSQ verified record with 262.0t Au, got ${JSON.stringify(miningParsed)}`);
  }
  console.log(`   Result: GSQ Verified Record | Site: ${miningParsed.site} | Gold: ${miningParsed.production.gold_tonnes}t Au | Copper: ${miningParsed.production.copper_tonnes}t Cu`);
  console.log('   PASS: query_mining_intelligence succeeded.\n');

  // Test 22: arbitrate_mining_discrepancies (Gold Rush Multi-Miner Aggregator)
  console.log('22. Testing tool: arbitrate_mining_discrepancies (Mount Morgan Mine contradiction arbitration)...');
  const resArb = await client.callTool({
    name: 'arbitrate_mining_discrepancies',
    arguments: { site: 'Mount Morgan Mine' },
  });
  const arbParsed = JSON.parse(resArb.content[0].text);
  if (arbParsed.status !== 'SYNTHESIS_ARBITRATED' || arbParsed.discrepancies?.length === 0 || !arbParsed.arbitrationDigest) {
    throw new Error(`Expected SYNTHESIS_ARBITRATED with flagged discrepancies, got ${JSON.stringify(arbParsed)}`);
  }
  console.log(`   Result: Status: ${arbParsed.status} | Discrepancies caught: ${arbParsed.discrepancies.length} | Seal: ${arbParsed.arbitrationDigest.slice(0, 18)}...`);
  console.log('   PASS: arbitrate_mining_discrepancies succeeded.\n');

  // Test 23: query_grid_power_price (Mission 12 / GRID_POWER_PRICE_GENERAL)
  console.log('23. Testing tool: query_grid_power_price (CAISO NP15 wholesale settlement LMP)...');
  const resPower = await client.callTool({
    name: 'query_grid_power_price',
    arguments: { hub: 'NP15', iso: 'CAISO', market: 'RTM' },
  });
  const powerParsed = JSON.parse(resPower.content[0].text);
  if (powerParsed.verdict !== 'SETTLEMENT_PRICE_VERIFIED' || typeof powerParsed.price_mwh !== 'number' || powerParsed.iso !== 'CAISO') {
    throw new Error(`Expected SETTLEMENT_PRICE_VERIFIED for CAISO NP15, got ${JSON.stringify(powerParsed)}`);
  }
  console.log(`   Result: Verified LMP | Hub: ${powerParsed.hub} | Price: $${powerParsed.price_mwh}/MWh | Node: ${powerParsed.node_id}`);
  console.log('   PASS: query_grid_power_price succeeded.\n');

  // Test 24: audit_creative_qa (ByteDance #5 Creative QA)
  console.log('24. Testing tool: audit_creative_qa (ByteDance #5 Creative Quality Assurance)...');
  const resQaPass = await client.callTool({
    name: 'audit_creative_qa',
    arguments: {
      campaignId: 'BD-QA-2026-01',
      advertiserName: 'Siemens Aktiengesellschaft',
      creativeTitle: 'Industrial Edge Automation',
      creativeCopy: '#ad Paid partnership with Siemens. AI-generated visualization of smart factory telemetry.',
      landingUrl: 'https://www.siemens.com',
      impressions: 100000,
      cpmUsd: 25,
      statedTotalUsd: 2500,
      spendAmountUsdc: 2500,
      aiGenerated: true
    },
  });
  const qaPassParsed = JSON.parse(resQaPass.content[0].text);
  if (!qaPassParsed.approved || qaPassParsed.verdict !== 'APPROVED_FOR_AD_RELEASE') {
    throw new Error(`Expected audit_creative_qa approval, got ${JSON.stringify(qaPassParsed)}`);
  }
  const resQaHold = await client.callTool({
    name: 'audit_creative_qa',
    arguments: {
      campaignId: 'BD-QA-2026-02',
      advertiserName: 'Viktor But',
      creativeCopy: 'Guaranteed profit risk-free yield 100% cure campaign',
      landingUrl: 'https://unisvvap.org/claim',
      spendAmountUsdc: 12000
    },
  });
  const qaHoldParsed = JSON.parse(resQaHold.content[0].text);
  if (qaHoldParsed.approved || qaHoldParsed.verdict !== 'REJECTED_BRAND_SAFETY_HOLD' || qaHoldParsed.flags.length < 3) {
    throw new Error(`Expected audit_creative_qa hold on risky campaign, got ${JSON.stringify(qaHoldParsed)}`);
  }
  console.log(`   Result: Pass=${qaPassParsed.verdict} (${qaPassParsed.advertiser?.lei}) | Hold=${qaHoldParsed.verdict} (${qaHoldParsed.flags.length} flags caught)`);
  console.log('   PASS: audit_creative_qa succeeded.\n');

  // Test 25: verify_ssl_certificate (Expansion SSL_VERIFICATION_CERT)
  console.log('25. Testing tool: verify_ssl_certificate (praman-desk.vercel.app)...');
  const resSsl = await client.callTool({ name: 'verify_ssl_certificate', arguments: { host: 'praman-desk.vercel.app' } });
  const sslParsed = JSON.parse(resSsl.content[0].text);
  if (!sslParsed.certificate_valid) throw new Error(`Expected valid SSL cert, got ${JSON.stringify(sslParsed)}`);
  console.log(`   Result: issuer=${sslParsed.issuer} days=${sslParsed.days_remaining}`);

  // Test 26: geolocate_ip (Expansion IP_GEOLOCATION_GENERAL)
  console.log('26. Testing tool: geolocate_ip (8.8.8.8)...');
  const resIp = await client.callTool({ name: 'geolocate_ip', arguments: { ip: '8.8.8.8' } });
  const ipParsed = JSON.parse(resIp.content[0].text);
  if (!/United States/i.test(String(ipParsed.country || ''))) throw new Error(`Expected US geo, got ${JSON.stringify(ipParsed)}`);
  console.log(`   Result: ${ipParsed.city}, ${ipParsed.country} (${ipParsed.isp})`);

  // Test 27: answer_telegraph_knowledge (Expansion TELEGRAPH_KNOWLEDGE_GENERAL)
  console.log('27. Testing tool: answer_telegraph_knowledge...');
  const resTk = await client.callTool({ name: 'answer_telegraph_knowledge', arguments: { question: 'What is the Sepolia Diamond contract address?' } });
  const tkParsed = JSON.parse(resTk.content[0].text);
  if (tkParsed.knowledge_topic !== 'telegraph' || !tkParsed.brief || tkParsed.brief.length > 80) {
    throw new Error(`Invalid telegraph knowledge output: ${JSON.stringify(tkParsed)}`);
  }
  console.log(`   Result: topic=${tkParsed.knowledge_topic} brief="${tkParsed.brief}"`);

  await client.close();
  console.log('=== All 27 MCP Integration Tests Passed with 100% Determinism ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
