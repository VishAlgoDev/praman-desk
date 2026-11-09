import { loadOrCreateWallet } from './init-wallet.mjs';

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const INTENTS = [
  'DOCUMENT_AUTHENTICITY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'CONTRACT_OBLIGATION_AUDIT_GENERAL',
  'REGULATORY_FILING_MONITOR_GENERAL'
];

async function main() {
  const { address } = loadOrCreateWallet();
  console.log(`Checking Telegraph EvalPool Status for Contributor: ${address}\n`);

  const mineRes = await fetch(`${NODE_URL}/api/evalpool/submissions/mine?submitter=${encodeURIComponent(address)}&limit=500`);
  const mineJson = await mineRes.json();
  console.log(`Contributor Total Rows in Pool: ${mineJson.count}`);

  for (const intentId of INTENTS) {
    const res = await fetch(`${NODE_URL}/api/evalpool/status?intent_id=${encodeURIComponent(intentId)}`);
    const status = await res.json();
    const myRows = (mineJson.rows || []).filter(r => r.intent_id === intentId);
    const myStates = myRows.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    console.log(`- ${intentId}:`);
    console.log(`    Network Pool: submitters=${status.submitters} (min=${status.min_submitters}), by_state=${JSON.stringify(status.by_state)}, epoch=${status.current_epoch}`);
    console.log(`    Your Rows (${myRows.length}): ${JSON.stringify(myStates)}`);
  }
}

main().catch(console.error);
