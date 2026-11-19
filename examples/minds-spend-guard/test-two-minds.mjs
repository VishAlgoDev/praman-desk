/**
 * Automated End-to-End Test Suite for Collaborative Two-Mind Architecture
 * Tests:
 * 1. Clean enterprise procurement (Siemens AG €8,400) -> APPROVE_PAYMENT + Sepolia Escrow Receipt
 * 2. Inverted FX rate & arithmetic discrepancy -> HELD_FOR_MANUAL_REVIEW (0 loss)
 * 3. Phishing domain & sanctions collision -> REJECT_PAYMENT (hard block)
 */

import { investigateProcurement } from './investigator-mind.mjs';
import { reviewAndGateSpend } from './reviewer-mind.mjs';

async function runTests() {
  console.log('========================================================================');
  console.log(' 🧠 Praman Desk: Collaborative Two-Mind Spend Guard Verification Suite');
  console.log(' Animoca Brands Minds (hellominds.ai) + Telegraph Protocol Intelligence');
  console.log('========================================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Clean Siemens AG Procurement (€8,400, 12 units @ €700)
  // -------------------------------------------------------------------------
  totalCount++;
  console.log('--- TEST 1: Clean Enterprise Procurement (Siemens AG €8,400) ---');
  const cleanRequest = {
    invoiceNumber: 'INV-2026-SIE-0842',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    recipientAddress: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466',
    items: [
      {
        description: 'Simatic S7-1500 Modular PLC Controller',
        quantity: 12,
        unitPrice: 700.00,
        lineTotal: 8400.00
      }
    ],
    currency: 'EUR',
    totalAmount: 8400.00
  };

  const caseFile1 = await investigateProcurement(cleanRequest);
  console.log(`[Mind 1] Investigator completed Case: ${caseFile1.caseId} (Digest: ${caseFile1.caseDigest.slice(0, 16)}...)`);
  console.log(`[Mind 1] GLEIF: ${caseFile1.evidence.corporateRegistry.found ? 'FOUND' : 'NOT_FOUND'} | Sanctions: ${caseFile1.evidence.sanctionsScreening.matched ? 'HIT' : 'CLEAN'} | Domain: ${caseFile1.evidence.domainSafety?.verdict}`);

  const verdict1 = await reviewAndGateSpend(caseFile1);
  console.log(`[Mind 2] Reviewer Verdict: ${verdict1.verdict}`);
  console.log(`[Mind 2] Primary Reason: ${verdict1.primaryReason}`);
  console.log(`[Mind 2] Blocking Flags: ${verdict1.blockingFlags.join(', ')}`);
  console.log(`[Mind 2] WASM Math Score: ${verdict1.wasmEvaluation.score}/10000 (Exact Match: ${verdict1.wasmEvaluation.exactMatch})`);
  console.log(`[Mind 2] Escrow Authorization: ${verdict1.escrowReceipt.status} (Diamond Port: ${verdict1.escrowReceipt.diamondPort})`);

  if (verdict1.verdict === 'APPROVE_PAYMENT' && verdict1.escrowReceipt.status === 'ESCROW_RELEASE_AUTHORIZED') {
    console.log('✅ TEST 1 PASSED: Clean enterprise invoice approved and escrow authorized.\n');
    passedCount++;
  } else {
    console.error('❌ TEST 1 FAILED: Expected APPROVE_PAYMENT, got:', verdict1.verdict);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Adversarial Inverted FX Rate / Currency Overcharge
  // -------------------------------------------------------------------------
  totalCount++;
  console.log('--- TEST 2: Adversarial Inverted FX Rate (Claimed 0.92 USD/EUR instead of 1.085) ---');
  const invertedFxRequest = {
    invoiceNumber: 'INV-2026-FX-CORRUPT',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    items: [
      {
        description: 'Industrial Servo Drive Sinamics S120',
        quantity: 10,
        unitPrice: 850.00,
        lineTotal: 8500.00
      }
    ],
    currency: 'EUR',
    settlementCurrency: 'USD',
    claimedFxRate: 0.9216, // Flipped rate: 1 / 1.085 instead of 1.085
    totalAmount: 8500.00
  };

  const caseFile2 = await investigateProcurement(invertedFxRequest);
  console.log(`[Mind 1] Investigator flagged anomalies: ${caseFile2.anomalies.map(a => a.type).join(', ')}`);

  const verdict2 = await reviewAndGateSpend(caseFile2);
  console.log(`[Mind 2] Reviewer Verdict: ${verdict2.verdict}`);
  console.log(`[Mind 2] Blocking Flags: ${verdict2.blockingFlags.join(', ')}`);
  console.log(`[Mind 2] Loss Averted: $${verdict2.escrowReceipt.lossAvertedEstimateUsd.toLocaleString()}`);

  if (verdict2.verdict === 'HELD_FOR_MANUAL_REVIEW' && verdict2.blockingFlags.includes('INVERTED_FX_OVERCHARGE_PREVENTED')) {
    console.log('✅ TEST 2 PASSED: Inverted FX rate caught, funds safely held with 0 loss.\n');
    passedCount++;
  } else {
    console.error('❌ TEST 2 FAILED: Expected HELD_FOR_MANUAL_REVIEW, got:', verdict2.verdict);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Adversarial Phishing Domain (FakeWatch Miner #42420 Shield)
  // -------------------------------------------------------------------------
  totalCount++;
  console.log('--- TEST 3: Phishing Domain Attack (unisvvap.org / clone portal) ---');
  const phishingRequest = {
    invoiceNumber: 'INV-2026-PHISH-99',
    vendor: 'Malicious Clone Vendor LLC',
    country: 'US',
    domain: 'https://unisvvap.org/pay',
    items: [
      {
        description: 'Bogus Cloud Security Subscription',
        quantity: 1,
        unitPrice: 4500.00,
        lineTotal: 4500.00
      }
    ],
    currency: 'USD',
    totalAmount: 4500.00
  };

  const caseFile3 = await investigateProcurement(phishingRequest);
  console.log(`[Mind 1] Investigator FakeWatch Domain Verdict: ${caseFile3.evidence.domainSafety?.verdict}`);

  const verdict3 = await reviewAndGateSpend(caseFile3);
  console.log(`[Mind 2] Reviewer Verdict: ${verdict3.verdict}`);
  console.log(`[Mind 2] Blocking Flags: ${verdict3.blockingFlags.join(', ')}`);

  if (verdict3.verdict === 'REJECT_PAYMENT' && verdict3.blockingFlags.includes('PHISHING_DOMAIN_HARD_BLOCK')) {
    console.log('✅ TEST 3 PASSED: Phishing domain hard-blocked, 0 funds released.\n');
    passedCount++;
  } else {
    console.error('❌ TEST 3 FAILED: Expected REJECT_PAYMENT, got:', verdict3.verdict);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Arithmetic Drift in Line Items (Sub-cent WASM detection)
  // -------------------------------------------------------------------------
  totalCount++;
  console.log('--- TEST 4: Mathematical Line-Item Drift (WASM sub-cent audit) ---');
  const mathDriftRequest = {
    invoiceNumber: 'INV-2026-MATH-DRIFT',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    items: [
      {
        description: 'Precision Sensor Element',
        quantity: 100,
        unitPrice: 19.99,
        lineTotal: 1999.00
      }
    ],
    currency: 'EUR',
    totalAmount: 2049.00 // +50 EUR stealth inflation
  };

  const caseFile4 = await investigateProcurement(mathDriftRequest);
  const verdict4 = await reviewAndGateSpend(caseFile4);
  console.log(`[Mind 2] Reviewer WASM Score: ${verdict4.wasmEvaluation.score}/10000 (Drift: ${verdict4.wasmEvaluation.driftMicroUnits} cents)`);
  console.log(`[Mind 2] Reviewer Verdict: ${verdict4.verdict}`);

  if (verdict4.verdict === 'HELD_FOR_MANUAL_REVIEW' && verdict4.blockingFlags.includes('WASM_ARITHMETIC_DRIFT_DETECTED')) {
    console.log('✅ TEST 4 PASSED: WASM engine identified stealth invoice inflation.\n');
    passedCount++;
  } else {
    console.error('❌ TEST 4 FAILED: Expected HELD_FOR_MANUAL_REVIEW, got:', verdict4.verdict);
    process.exit(1);
  }

  console.log('========================================================================');
  console.log(`🎉 ALL ${passedCount}/${totalCount} TESTS PASSED! Two-Mind Collaborative Architecture is 100% verified.`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
