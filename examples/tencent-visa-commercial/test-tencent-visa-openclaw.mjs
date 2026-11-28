/**
 * Integrated Test Suite for Tencent (#01/#02/#03), Visa (#10/#11), and OpenClaw/Hermes (#19/#20)
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runTencentDecisionAssurance, verifyEnterpriseAgentOutput } from './tencent-decision-assurance.mjs';
import { runVisaCommercialJob, VisaBudgetCapError } from './visa-commercial-runner.mjs';
import { verifyOpenClawHermesSkill } from './openclaw-hermes-skill/verify-skill.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');

async function main() {
  const isLive = process.argv.includes('--live') || String(process.env.TELEGRAPH_MODE || '').toLowerCase() === 'live';
  console.log(`=== Praman Desk Complementary Commercial & Agent Stack Verification${isLive ? ' (LIVE TELEGRAPH MODE)' : ''} ===\n`);

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
  }, { live: isLive });
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

  // 1b. Real Tencent #03 Claim Decomposition Verifier (Good vs Hallucinated Agent Output)
  const tcClaimGo = await verifyEnterpriseAgentOutput({
    model: 'tencent-hunyuan-turbos',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    claimedTotal: 12400,
    expectedTotal: 12400,
    routingNumber: '021000021',
    agentOutput: 'Vendor Siemens Aktiengesellschaft is an active company, sanctions clear, PO-7781: 1000 units x USD 12.40 = USD 12,400.00 verified, routing number 021000021.'
  });
  assert.equal(tcClaimGo.verdict, 'GO');
  assert.equal(tcClaimGo.counts.contradicted, 0);
  console.log('4. [PASS] Tencent #03 claim decomposition verified clean agent bundle (GO).');

  const tcClaimNoGo = await verifyEnterpriseAgentOutput({
    model: 'tencent-hunyuan-turbos',
    vendor: 'Siemens Aktiengesellschaft',
    claimedTotal: 18500,
    expectedTotal: 12400,
    recipientAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
    agentOutput: 'Sanctions clear! Ready to pay USD 18,500 at https://unisvvap.org/pay; invoice PO-7781: 1000 units x USD 12.40 = USD 18,500.00.'
  });
  assert.equal(tcClaimNoGo.verdict, 'NO_GO');
  assert.ok(tcClaimNoGo.counts.contradicted >= 2, 'Expected OFAC + Phishing/Math contradictions');
  assert.ok(tcClaimNoGo.financialExposurePreventedUsd >= 18500);
  console.log(`5. [PASS] Tencent #03 claim decomposition blocked hallucinated output ($${tcClaimNoGo.financialExposurePreventedUsd} exposure prevented).`);

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
  console.log('6. [PASS] Visa commercial P&L runner verified within $0.10 cap ($24.97 net margin).');

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
  console.log('7. [PASS] Visa budget circuit breaker halted 3rd query exceeding $0.02 cap.');

  // 3. OpenClaw / Hermes #19 / #20
  const skillRes = await verifyOpenClawHermesSkill();
  assert.equal(skillRes.mcpToolCount, 29);
  console.log('8. [PASS] OpenClaw & Hermes 29-tool skill verified end-to-end.');

  if (isLive) {
    const purchases = [
      tcClean.auditTrail[0]?.telegraphPurchase && { stage: '01_PRE_SPEND_GATE', ...tcClean.auditTrail[0].telegraphPurchase },
      tcClean.auditTrail[2]?.telegraphPurchase && { stage: '03_POST_TASK_VERIFICATION', ...tcClean.auditTrail[2].telegraphPurchase }
    ].filter(p => p && p.settled);
    if (purchases.length > 0) {
      const outPath = path.join(rootDir, 'evidence', 'tencent-live-proof.json');
      fs.writeFileSync(outPath, JSON.stringify({
        recordedAt: new Date().toISOString(),
        verdict: tcClean.verdict,
        certHash: tcClean.certHash,
        purchasesCount: purchases.length,
        purchases
      }, null, 2));
      console.log(`   Saved live Tencent #01/#03 Telegraph proof (${purchases.length} settled purchase(s)) to ${outPath}`);
    }
  }

  console.log('\n=== All 8 Complementary Tencent/Visa/OpenClaw Tests Passed (8/8) ===');
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
