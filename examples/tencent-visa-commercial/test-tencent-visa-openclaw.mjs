/**
 * Integrated Test Suite for Tencent (#01/#02/#03), Visa (#10/#11), and OpenClaw/Hermes (#19/#20)
 */
import assert from 'node:assert/strict';
import { runTencentDecisionAssurance } from './tencent-decision-assurance.mjs';
import { runVisaCommercialJob, VisaBudgetCapError } from './visa-commercial-runner.mjs';
import { verifyOpenClawHermesSkill } from './openclaw-hermes-skill/verify-skill.mjs';

async function main() {
  console.log('=== Praman Desk Complementary Commercial & Agent Stack Verification ===\n');

  // 1. Tencent #01 / #02 / #03
  const tcClean = await runTencentDecisionAssurance({
    invoiceNumber: 'INV-TC-01',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    recipientAddress: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466',
    items: [{ description: 'PLC Module', quantity: 10, unitPrice: 840, lineTotal: 8400 }],
    currency: 'EUR',
    totalAmount: 8400
  });
  assert.equal(tcClean.approved, true);
  assert.equal(tcClean.auditTrail.length, 3);
  console.log('1. [PASS] Tencent 3-stage clean assurance settled:', tcClean.certHash);

  const tcDrift = await runTencentDecisionAssurance({
    invoiceNumber: 'INV-TC-02',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    recipientAddress: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466',
    items: [{ description: 'PLC Module', quantity: 10, unitPrice: 840, lineTotal: 8400 }],
    currency: 'EUR',
    totalAmount: 8400
  }, { watchlistOverrideEntity: 'Lazarus Group' });
  assert.equal(tcDrift.approved, false);
  assert.equal(tcDrift.haltedAtStage, '02_CONTINUOUS_WATCHLIST_MONITOR');
  console.log('2. [PASS] Tencent mid-stream watchlist monitor caught drift and froze escrow.');

  const tcVariance = await runTencentDecisionAssurance({
    invoiceNumber: 'INV-TC-03',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    recipientAddress: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466',
    items: [{ description: 'PLC Module', quantity: 10, unitPrice: 840, lineTotal: 8400 }],
    currency: 'EUR',
    totalAmount: 8400
  }, { deliveredAmount: 9600 });
  assert.equal(tcVariance.approved, false);
  assert.equal(tcVariance.haltedAtStage, '03_POST_TASK_VERIFICATION');
  console.log('3. [PASS] Tencent post-task WASM verification halted overbilled amount.');

  // 2. Visa #10 / #11
  const visaOk = await runVisaCommercialJob({
    jobId: 'VISA-101',
    vendor: 'Siemens Aktiengesellschaft',
    grossRevenueUsd: 25.00,
    intelligenceBudgetUsd: 0.10,
    invoiceAmount: 8400,
    poAmount: 8400
  });
  assert.equal(visaOk.status, 'COMPLETED_WITHIN_CAP');
  assert.equal(visaOk.pnl.netProfitUsd, 24.97);
  assert.equal(visaOk.receiptLedger.length, 3);
  console.log('4. [PASS] Visa commercial P&L runner verified within $0.10 cap ($24.97 net margin).');

  let caughtBudget = false;
  try {
    await runVisaCommercialJob({
      jobId: 'VISA-OVERCAP',
      vendor: 'Siemens Aktiengesellschaft',
      grossRevenueUsd: 25.00,
      intelligenceBudgetUsd: 0.02
    });
  } catch (err) {
    caughtBudget = err instanceof VisaBudgetCapError;
  }
  assert.equal(caughtBudget, true, 'Visa runner must halt before exceeding intelligenceBudgetUsd');
  console.log('5. [PASS] Visa budget circuit breaker halted 3rd query exceeding $0.02 cap.');

  // 3. OpenClaw / Hermes #19 / #20
  const skillRes = await verifyOpenClawHermesSkill();
  assert.equal(skillRes.mcpToolCount, 18);
  console.log('6. [PASS] OpenClaw & Hermes 18-tool skill verified end-to-end.');

  console.log('\n=== All 6 Complementary Tencent/Visa/OpenClaw Tests Passed (6/6) ===');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
