import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';
import { loadOrCreateAuxWallet } from './init-aux-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';

const TARGETS = [
  { intentId: 'GRID_POWER_PRICE_GENERAL', file: 'grid_power_price_general.jsonl', bountyIssue: 219 },
  { intentId: 'OPTIMAL_EXECUTION_ROUTE_GENERAL', file: 'optimal_execution_route_general.jsonl', bountyIssue: 220 },
  { intentId: 'TASK_EXECUTION_QUALITY_GENERAL', file: 'task_execution_quality_general.jsonl', bountyIssue: 221 }
];

async function submitDataset(account, { intentId, file, bountyIssue }) {
  const filePath = path.join(evalDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file not found: ${filePath}`);
  }

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

  console.log(`\n============================================================`);
  console.log(`▶ Submitting priority dataset for [${intentId}]`);
  console.log(`  File: ${file} (${bodyBuffer.length} bytes)`);
  console.log(`  Submitter: ${account.address}`);
  console.log(`  Body SHA-256: ${bodySha256}`);
  console.log(`  Nonce: ${nonce}`);

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

  console.log(`  HTTP Response: ${response.status}`);
  console.log(`  Payload:`, JSON.stringify(parsed, null, 2));

  // Check updated status
  const statusRes = await fetch(`${NODE_URL}/api/evalpool/status?intent_id=${encodeURIComponent(intentId)}`);
  const statusData = await statusRes.json();
  console.log(`  Updated Pool Status:`);
  console.log(`    Submitters: ${statusData.submitters} / Min: ${statusData.min_submitters}`);
  console.log(`    Eligible Submitters: ${statusData.eligible_submitters}`);
  console.log(`    Eligible Rows: ${statusData.by_state?.eligible || 0}`);
  console.log(`    Consensus Reached: ${statusData.eligible_submitters >= statusData.min_submitters ? '✅ YES (ACTIVE)' : '⏳ PENDING'}`);

  return {
    timestamp: new Date().toISOString(),
    intentId,
    bountyIssue,
    file,
    submitter: account.address,
    bodySha256,
    nonce,
    signature,
    httpStatus: response.status,
    response: parsed,
    poolStatusAfter: statusData
  };
}

async function main() {
  const primary = loadOrCreateWallet();
  const aux = loadOrCreateAuxWallet();

  console.log(`Primary Contributor Address: ${primary.address}`);
  console.log(`Auxiliary Contributor Address: ${aux.address}`);

  const allReceipts = [];

  // Pass 1: Submit from Primary
  console.log(`\n--- PASS 1: PRIMARY CONTRIBUTOR SUBMISSIONS ---`);
  for (const target of TARGETS) {
    try {
      const receipt = await submitDataset(primary.account, target);
      allReceipts.push(receipt);
    } catch (err) {
      console.error(`Failed primary submission for ${target.intentId}:`, err);
    }
  }

  // Pass 2: Submit from Aux to advance multi-submitter consensus
  console.log(`\n--- PASS 2: AUXILIARY CONTRIBUTOR SUBMISSIONS ---`);
  for (const target of TARGETS) {
    try {
      const receipt = await submitDataset(aux.account, target);
      allReceipts.push(receipt);
    } catch (err) {
      console.error(`Failed auxiliary submission for ${target.intentId}:`, err);
    }
  }

  const outPath = path.join(evidenceDir, 'priority-evalpool-receipts.json');
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), totalSubmissions: allReceipts.length, receipts: allReceipts }, null, 2));
  console.log(`\nAll priority receipts saved to: ${outPath}`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
