import { loadStoredLedger } from '../src/handlers.mjs';

const ledger = loadStoredLedger();
console.log('=== PRAMAN DESK AGGREGATED LEDGER STATUS ===');
console.log(`Total Paid Calls: ${ledger.totalPaidCalls}`);
console.log(`Total Calls Array Length: ${ledger.calls.length}`);
console.log(`Unique Transaction Hashes: ${new Set(ledger.calls.map(l => l.txHash || l.tx_hash)).size}`);

const byMission = {};
ledger.calls.forEach(l => {
  const m = l.mission || 'Mission 04';
  byMission[m] = (byMission[m] || 0) + 1;
});
console.log('Breakdown by Mission:', JSON.stringify(byMission, null, 2));

console.log('Sample Recent Settlement:');
console.log(JSON.stringify(ledger.calls[ledger.calls.length - 1], null, 2));
