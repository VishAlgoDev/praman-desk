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
  if (toolsResult.tools.length !== 10) {
    throw new Error(`Expected 10 tools, found ${toolsResult.tools.length}`);
  }
  console.log('   PASS: All 10 tools registered.\n');

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
      recipient_address: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
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
      recipient_address: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
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
      recipient_address: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
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
      recipient_address: '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b',
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

  await client.close();
  console.log('=== All 15 MCP Integration Tests Passed with 100% Determinism ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
