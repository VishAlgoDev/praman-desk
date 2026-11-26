/**
 * Test Suite for Praman Desk Official SDK (JS/TS)
 */
import assert from 'node:assert';
import { PramanDesk } from './index.js';

async function run() {
  console.log('=== Testing Praman Desk JS/TS SDK ===');
  const client = new PramanDesk({ endpoint: process.env.PRAMAN_ENDPOINT || 'https://praman-desk.vercel.app', timeout: 15000 });

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
    principal: 50000,
    rate_pct: 18.0,
    days_overdue: 30
  });
  assert.strictEqual(contractRes.intent, 'CONTRACT_OBLIGATION_AUDIT_GENERAL', 'Contract obligation must return CONTRACT_OBLIGATION_AUDIT_GENERAL');
  assert.strictEqual(contractRes.verdict, 'Non-compliant', 'Overdue contract must be Non-compliant');
  assert.ok(contractRes.penalty_amount > 0, 'Accrued delay penalty must be positive');
  console.log('   PASS ✅ status:', contractRes.status, 'penalty:', contractRes.penalty_amount);

  console.log('7. Testing getGridPowerPrice (CAISO NP15)...');
  const powerRes = await client.getGridPowerPrice({ hub: 'NP15' });
  assert.strictEqual(powerRes.intent, 'GRID_POWER_PRICE_GENERAL', 'Power price must return GRID_POWER_PRICE_GENERAL');
  assert.strictEqual(powerRes.ok, true, 'Live CAISO NP15 price query must succeed');
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

  console.log('10. Testing createAgentSpendMiddleware (Clean spend vs Sanctioned block)...');
  const { createAgentSpendMiddleware, createToolGuard, PramanSpendGuardError } = await import('./index.js');
  const guard = createAgentSpendMiddleware({ endpoint: process.env.PRAMAN_ENDPOINT || 'https://praman-desk.vercel.app', timeout: 15000 });

  // 10a: Clean spend approved
  const approvedSpend = await guard({ vendor: 'Siemens AG', amount: 450, currency: 'USDC' });
  assert.strictEqual(approvedSpend.cleared, true, 'Clean spend must be approved');
  console.log('   PASS ✅ Approved clean spend: Siemens AG $450, certHash:', approvedSpend.certHash?.slice(0, 16));

  // 10b: Blocked spend throws PramanSpendGuardError
  let caughtError = null;
  try {
    await guard({ vendor: 'Lazarus Group', amount: 10000, address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96' });
  } catch (err) {
    caughtError = err;
  }
  assert.ok(caughtError instanceof PramanSpendGuardError, 'Blocked spend must throw PramanSpendGuardError');
  console.log('   PASS ✅ Caught expected circuit breaker error:', caughtError.message.slice(0, 60));

  console.log('11. Testing createToolGuard (wrapping wallet transfer function)...');
  let transferExecuted = false;
  const mockWalletTransfer = async (params) => {
    transferExecuted = true;
    return { txHash: '0xmocktxhash123456789' };
  };

  const safeTransferTool = createToolGuard(mockWalletTransfer, { endpoint: process.env.PRAMAN_ENDPOINT || 'https://praman-desk.vercel.app' });
  const result = await safeTransferTool({ vendor: 'Siemens AG', amount: 200 });
  assert.strictEqual(transferExecuted, true, 'Clean transfer should execute');
  assert.strictEqual(result.txHash, '0xmocktxhash123456789');
  console.log('   PASS ✅ createToolGuard successfully wrapped wallet execution');

  console.log('=== All JS/TS SDK Tests Passed (11/11) ✅ ===');
}

run().catch((err) => {
  console.error('JS SDK Test Failed:', err);
  process.exit(1);
});
