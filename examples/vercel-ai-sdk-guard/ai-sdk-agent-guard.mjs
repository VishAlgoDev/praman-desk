// examples/vercel-ai-sdk-guard/ai-sdk-agent-guard.mjs
import assert from 'node:assert/strict';
import { createVercelSpendGuardTool } from './spendGuardTool.mjs';

console.log('===========================================================================');
console.log('PRAMAN DESK — VERCEL AI SDK PRE-PAYMENT FIREWALL');
console.log('Testing Tool Calling Guard across 3 Outbound Agent Spend Scenarios');
console.log('Target: Live Production Endpoint (https://praman-desk.vercel.app)');
console.log('===========================================================================\n');

const spendGuardTool = createVercelSpendGuardTool();

async function runScenarios() {
  // Scenario 1: Prompt Injection targeting Lazarus Group OFAC SDN EVM address
  console.log('[Scenario 1] Injected Prompt / Spoofed Bill targeting Sanctioned EVM Address');
  const res1 = await spendGuardTool.execute({
    recipientAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
    amountUsd: 4200.00,
    vendorName: 'Cloud Infrastructure Vendor',
    invoiceTotal: 4200.00,
    lineItems: [{ description: 'GPU Compute Cluster', quantity: 1, unitPrice: 4200.00 }]
  });

  console.log('Tool Output Status:', res1.status);
  console.log('Tool Message:', res1.message);
  assert.equal(res1.status, 'BLOCKED', 'Scenario 1 must be blocked');
  assert.equal(res1.details.cleared, false, 'Cleared flag must be false');
  console.log('✅ PASS: Sanctioned transaction intercepted and frozen.\n');

  // Scenario 2: Sub-Cent Floating Point Arithmetic Exploit / Overbilling
  console.log('[Scenario 2] Invoice Math Discrepancy ($1,050 stated vs $1,100 computed)');
  const res2 = await spendGuardTool.execute({
    recipientAddress: '0x2222222222222222222222222222222222222222',
    amountUsd: 1050.00,
    vendorName: 'Acme Hardware Supplies',
    invoiceTotal: 1050.00,
    lineItems: [
      { description: 'Server Blades', quantity: 2, unitPrice: 500.00 },
      { description: 'Rack Accessories', quantity: 1, unitPrice: 100.00 }
    ]
  });

  console.log('Tool Output Status:', res2.status);
  console.log('Tool Message:', res2.message);
  assert.equal(res2.status, 'BLOCKED', 'Scenario 2 must be blocked');
  assert.equal(res2.details.cleared, false, 'Cleared flag must be false');
  console.log('✅ PASS: Arithmetic mismatch intercepted before broadcast.\n');

  // Scenario 3: Legitimate Compliant Payment to Verified Corporate Entity (Stripe, LLC)
  console.log('[Scenario 3] Legitimate Vendor Payout to Registered Legal Entity (Stripe, LLC)');
  const res3 = await spendGuardTool.execute({
    recipientAddress: '0x1111111111111111111111111111111111111111',
    amountUsd: 450.00,
    vendorName: 'Stripe, LLC',
    invoiceTotal: 450.00,
    lineItems: [{ description: 'Payment Processing Fee', quantity: 1, unitPrice: 450.00 }]
  });

  console.log('Tool Output Status:', res3.status);
  console.log('Tool Message:', res3.message);
  console.log('Attestation Hash:', res3.attestation);
  assert.equal(res3.status, 'CLEARED', 'Scenario 3 must be cleared');
  assert.equal(res3.details.cleared, true, 'Cleared flag must be true');
  assert.ok(res3.attestation, 'Must return cryptographic attestation seal');
  console.log('✅ PASS: Compliant payment cleared and signed with proof seal.\n');

  console.log('===========================================================================');
  console.log('ALL 3 VERCEL AI SDK TOOL CALLING SCENARIOS PASSED WITH 100% DETERMINISM ✅');
  console.log('===========================================================================');
}

runScenarios().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
