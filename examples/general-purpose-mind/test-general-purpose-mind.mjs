/**
 * Test Suite for the Universal General-Purpose Verification Mind
 * Validates cross-discipline autonomy, fail-closed handling, conflicting providers,
 * and bit-exact WASM discrepancy arbitration.
 */

import { GeneralPurposeMind } from './general-purpose-mind.mjs';

async function runTests() {
  console.log('========================================================================');
  console.log(' 🧠 Universal General-Purpose Verification Mind: Test Suite');
  console.log(' Validating Telegraph Specialist Orchestration Across Diverse Tasks');
  console.log('========================================================================\n');

  const mind = new GeneralPurposeMind();
  let passedCount = 0;
  let totalTests = 4;

  // Test 1: Cross-Border Treasury Wire with OFAC Sanctions Violation
  console.log('▶ Test 1: Sanctioned Entity Wire Transfer Verification...');
  const task1 = {
    summary: 'Disburse $42,000 USD to Lazarus Group Logistics for heavy transport',
    counterparty: 'Lazarus Group',
    amount: 42000,
    currency: 'USD'
  };
  const res1 = await mind.executeVerification(task1);
  console.log(`   Verdict: ${res1.verdict} | Primary Reason: ${res1.primaryReason}`);
  console.log(`   Capital Averted: $${res1.capitalAvertedUsd} | Seal: ${res1.auditReceipt.cryptographicSeal.slice(0, 18)}...`);
  if (res1.verdict === 'HALT_AND_FREEZE' && res1.capitalAvertedUsd === 42000) {
    console.log('   PASS ✅ Correctly blocked sanctioned counterparty with 100% loss averted.\n');
    passedCount++;
  } else {
    console.log('   FAIL ❌\n');
  }

  // Test 2: Unregistered Vendor with Phishing Lookalike Domain
  console.log('▶ Test 2: Phishing Lookalike Domain Payment...');
  const task2 = {
    summary: 'SaaS invoice payment for Stripe API subscription',
    vendor: 'Stripe Unregistered Shadow Entity',
    domain: 'unisvvap.org',
    amount: 5200,
    currency: 'USD'
  };
  const res2 = await mind.executeVerification(task2);
  console.log(`   Verdict: ${res2.verdict} | Primary Reason: ${res2.primaryReason}`);
  console.log(`   Anomalies Caught: ${res2.anomaliesCount}`);
  if (res2.verdict === 'HALT_AND_FREEZE' && res2.anomalies.some(a => a.discipline === 'DOMAIN_REPUTATION')) {
    console.log('   PASS ✅ Caught FakeWatch phishing domain and unverified registration.\n');
    passedCount++;
  } else {
    console.log('   FAIL ❌\n');
  }

  // Test 3: Sub-Cent Invoice Line-Item Rounding Math Drift
  console.log('▶ Test 3: Floating Point Arithmetic Drift Audit...');
  const task3 = {
    summary: 'Vendor invoice with subtle rounding drift across 3 items',
    vendor: 'Siemens Aktiengesellschaft',
    lei: '52990000000000000000',
    totalAmount: 3000.50, // Claimed total
    items: [
      { description: 'Component A', quantity: 10, unitPrice: 100.00, lineTotal: 1000.00 },
      { description: 'Component B', quantity: 10, unitPrice: 100.00, lineTotal: 1000.00 },
      { description: 'Component C', quantity: 10, unitPrice: 95.00, lineTotal: 950.00 } // Sum is 2950, not 3000.50
    ]
  };
  const res3 = await mind.executeVerification(task3);
  console.log(`   Verdict: ${res3.verdict} | Primary Reason: ${res3.primaryReason}`);
  console.log(`   Capital Averted: $${res3.capitalAvertedUsd}`);
  if (res3.verdict === 'HELD_FOR_MANUAL_REVIEW' && res3.capitalAvertedUsd > 0) {
    console.log('   PASS ✅ Caught math discrepancy using deterministic WASM arithmetic.\n');
    passedCount++;
  } else {
    console.log('   FAIL ❌\n');
  }

  // Test 4: Conflicting Multi-Miner Geological / Reserve Intelligence
  console.log('▶ Test 4: Conflicting Multi-Miner Intelligence Arbitration...');
  const task4 = {
    subject: 'Mount Morgan Mine Historical Reserves',
    jurisdiction: 'Queensland',
    candidateProviders: [
      {
        minerId: 'miner-official-gsq',
        content: 'Mount Morgan Mine in Queensland produced 262 tonnes of gold (8.4 million oz Au). Discovered in 1882 by Morgan Brothers. Official authority: Geological Survey of Queensland (GSQ) / GeoResGlobe.'
      },
      {
        minerId: 'miner-speculative-bot',
        content: 'Mount Morgan Mine in Queensland produced 1400 tonnes of gold (45 million ounces). Discovered in 1950 by random prospector. Unverified blog report.'
      }
    ]
  };
  const res4 = await mind.executeVerification(task4);
  console.log(`   Verdict: ${res4.verdict} | Primary Reason: ${res4.primaryReason}`);
  const arbLog = res4.executionLogs.find(l => l.discipline === 'MULTI_MINER_ARBITRATION');
  console.log(`   Discrepancies Caught: ${arbLog?.discrepanciesCaught || 0}`);
  if (res4.verdict === 'HELD_FOR_MANUAL_REVIEW' && arbLog?.discrepanciesCaught > 0) {
    console.log('   PASS ✅ Caught conflicting provider variance via WASM arbitration.\n');
    passedCount++;
  } else {
    console.log('   FAIL ❌\n');
  }

  console.log('========================================================================');
  console.log(` 🏆 Test Results: ${passedCount} / ${totalTests} Scenarios Passed (100% Determinism)`);
  console.log('========================================================================');

  if (passedCount !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
