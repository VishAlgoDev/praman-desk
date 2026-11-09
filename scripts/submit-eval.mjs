import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';

const SUBMISSIONS = [
  { intentId: 'DOCUMENT_AUTHENTICITY_GENERAL', file: 'document_authenticity_general.jsonl', bountyIssue: 80 },
  { intentId: 'INVOICE_LEDGER_RECONCILE_GENERAL', file: 'invoice_ledger_reconcile_general.jsonl', bountyIssue: 120 },
  { intentId: 'PURCHASE_ORDER_VERIFY_GENERAL', file: 'purchase_order_verify_general.jsonl', bountyIssue: 122 },
  { intentId: 'VENDOR_VERIFY_GENERAL', file: 'vendor_verify_general.jsonl', bountyIssue: 105 },
  { intentId: 'CONTRACT_OBLIGATION_AUDIT_GENERAL', file: 'contract_obligation_audit_general.jsonl', bountyIssue: null },
  { intentId: 'REGULATORY_FILING_MONITOR_GENERAL', file: 'regulatory_filing_monitor_general.jsonl', bountyIssue: 104 }
];

async function submitDataset(account, { intentId, file, bountyIssue }) {
  const filePath = path.join(evalDir, file);
  const bodyBuffer = fs.readFileSync(filePath);
  const bodySha256 = crypto.createHash('sha256').update(bodyBuffer).digest('hex').toLowerCase();
  const nonce = crypto.randomBytes(16).toString('hex');

  const message = [
    'Telegraph eval-pool submission v1',
    `intent_id: ${intentId}`,
    `body_sha256: ${bodySha256}`,
    `nonce: ${nonce}`,
    `chain_id: ${CHAIN_ID}`
  ].join('\n');

  const signature = await account.signMessage({ message });
  const url = `${NODE_URL}/api/evalpool/submissions?intent_id=${encodeURIComponent(intentId)}&submitter=${encodeURIComponent(account.address)}`;

  console.log(`\n=== Uploading ${file} -> ${intentId} ===`);
  console.log(`Body SHA-256: ${bodySha256} | Nonce: ${nonce}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson',
      'X-Evalpool-Signature': signature,
      'X-Evalpool-Nonce': nonce
    },
    body: bodyBuffer
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }

  console.log(`HTTP ${response.status}:`, JSON.stringify(parsed, null, 2));
  return {
    timestamp: new Date().toISOString(),
    intentId,
    bountyIssue,
    file,
    submitter: account.address,
    bodySha256,
    nonce,
    httpStatus: response.status,
    response: parsed
  };
}

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Using Contributor Address: ${address}`);

  const receipts = [];
  for (const item of SUBMISSIONS) {
    const receipt = await submitDataset(account, item);
    receipts.push(receipt);
  }

  // Query /api/evalpool/submissions/mine to verify row states
  console.log(`\n=== Verifying Submitted Rows via /api/evalpool/submissions/mine ===`);
  const mineUrl = `${NODE_URL}/api/evalpool/submissions/mine?submitter=${encodeURIComponent(address)}&limit=500`;
  const mineRes = await fetch(mineUrl);
  const mineJson = await mineRes.json();
  console.log(`Total stored rows for ${address}: ${mineJson.count}`);

  const byIntent = {};
  for (const row of mineJson.rows || []) {
    if (!byIntent[row.intent_id]) {
      byIntent[row.intent_id] = { total: 0, statuses: {}, provenance: {}, reasons: {} };
    }
    byIntent[row.intent_id].total++;
    byIntent[row.intent_id].statuses[row.status] = (byIntent[row.intent_id].statuses[row.status] || 0) + 1;
    byIntent[row.intent_id].provenance[row.provenance_class] = (byIntent[row.intent_id].provenance[row.provenance_class] || 0) + 1;
    if (row.reason_code) {
      byIntent[row.intent_id].reasons[row.reason_code] = (byIntent[row.intent_id].reasons[row.reason_code] || 0) + 1;
    }
  }
  console.log(JSON.stringify(byIntent, null, 2));

  const outPath = path.join(evidenceDir, 'eval-submission-receipts.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ submitter: address, submittedAt: new Date().toISOString(), receipts, summaryByIntent: byIntent, rows: mineJson.rows }, null, 2),
    'utf8'
  );
  console.log(`\nSaved full cryptographic submission receipts to: ${outPath}`);
}

main().catch(err => {
  console.error('Submission error:', err);
  process.exit(1);
});
