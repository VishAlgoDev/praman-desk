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
  if (toolsResult.tools.length !== 6) {
    throw new Error(`Expected 6 tools, found ${toolsResult.tools.length}`);
  }
  console.log('   PASS: All 6 tools registered.\n');

  // Test 2: verify_counterparty (Stripe)
  console.log('3. Testing tool: verify_counterparty (Stripe)...');
  const resVendor = await client.callTool({
    name: 'verify_counterparty',
    arguments: { vendor: 'Stripe' },
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

  await client.close();
  console.log('=== All 7 MCP Integration Tests Passed with 100% Determinism ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
