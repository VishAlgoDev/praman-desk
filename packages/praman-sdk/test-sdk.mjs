/**
 * Test Suite for Praman Desk Official SDK (JS/TS)
 */
import assert from 'node:assert';
import { PramanDesk } from './index.js';

async function run() {
  console.log('=== Testing Praman Desk JS/TS SDK ===');
  const client = new PramanDesk({ endpoint: 'https://praman-desk.vercel.app', timeout: 10000 });

  console.log('1. Testing screenSanctions (Lazarus Group EVM)...');
  const sdnRes = await client.screenSanctions({ address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
  assert.strictEqual(sdnRes.matched, true, 'Sanctions screening must match Lazarus Group');
  console.log('   PASS ✅ matched:', sdnRes.matched, 'matches:', sdnRes.matches?.length);

  console.log('2. Testing verifyVendor (Stripe, LLC)...');
  const corpRes = await client.verifyVendor({ vendor: 'Stripe, LLC' });
  assert.strictEqual(corpRes.found, true, 'Corporate registry must find Stripe');
  console.log('   PASS ✅ found:', corpRes.found, 'lei:', corpRes.lei || corpRes.reg_id);

  console.log('3. Testing clearSpend (Banco Nacional de Cuba block)...');
  const spendRes = await client.clearSpend({ vendor: 'Banco Nacional de Cuba', amount: 5000 });
  assert.strictEqual(spendRes.cleared, false, 'Sanctioned spend must be halted');
  console.log('   PASS ✅ cleared:', spendRes.cleared, 'status:', spendRes.status);

  console.log('4. Testing counterpartyShield (unisvvap.org phishing)...');
  const shieldRes = await client.counterpartyShield({ domain: 'unisvvap.org', vendor: 'Uniswap' });
  assert.strictEqual(shieldRes.cleared, false, 'Phishing domain must be blocked');
  console.log('   PASS ✅ cleared:', shieldRes.cleared, 'verdict:', shieldRes.shieldVerdict || shieldRes.verdict);

  console.log('5. Testing rugReceiptScreen (Lazarus address)...');
  const rugRes = await client.rugReceiptScreen({ contractAddress: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
  assert.strictEqual(rugRes.cleared, false, 'Exploit contract must be flagged');
  console.log('   PASS ✅ cleared:', rugRes.cleared, 'verdict:', rugRes.verdict, 'safetyScore:', rugRes.safetyScore);

  console.log('6. Testing auditContractObligation (Mission 04)...');
  const contractRes = await client.auditContractObligation({
    contractText: 'Late payment interest accrues at 18% per annum compounded monthly if unpaid after 30 days.',
    invoiceAmount: 50000,
    invoiceDate: '2026-08-01',
    paymentDueDate: '2026-08-31',
    interestRatePct: 18.0
  });
  assert.ok(contractRes.intent === 'CONTRACT_OBLIGATION_AUDIT_GENERAL' || contractRes.status, 'Contract obligation must respond');
  console.log('   PASS ✅ status:', contractRes.status, 'accrued:', contractRes.accruedLiability || contractRes.accrued_liability);

  console.log('7. Testing getGridPowerPrice (CAISO NP15)...');
  const powerRes = await client.getGridPowerPrice({ hub: 'NP15' });
  assert.strictEqual(powerRes.intent, 'GRID_POWER_PRICE_GENERAL', 'Power price must return GRID_POWER_PRICE_GENERAL');
  assert.ok(powerRes.price_mwh > 0, 'Price per MWh must be positive');
  console.log('   PASS ✅ hub:', powerRes.hub, 'price_mwh:', powerRes.price_mwh);

  console.log('8. Testing queryMiningIntelligence (Mount Morgan)...');
  const mineRes = await client.queryMiningIntelligence({ site: 'Mount Morgan Mine' });
  assert.ok(mineRes.summary || mineRes.verdict, 'Mining intelligence must return summary or verdict');
  console.log('   PASS ✅ site:', mineRes.site || 'Mount Morgan Mine', 'verdict:', mineRes.verdict);

  console.log('9. Testing arbitrateMiningDiscrepancies (Universal Multi-Miner Arbitrator)...');
  const arbRes = await client.arbitrateMiningDiscrepancies({ site: 'Mount Morgan Mine' });
  assert.ok(arbRes.status === 'SYNTHESIS_ARBITRATED' || arbRes.status === 'DISCREPANCY_FLAGGED', 'Arbitration must flag or arbitrate');
  console.log('   PASS ✅ status:', arbRes.status, 'discrepancies:', arbRes.discrepancies_found);

  console.log('=== All JS/TS SDK Tests Passed (9/9) ✅ ===');
}

run().catch((err) => {
  console.error('JS SDK Test Failed:', err);
  process.exit(1);
});
