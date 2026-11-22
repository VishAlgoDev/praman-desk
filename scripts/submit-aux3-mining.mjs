import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateAux3Wallet } from './init-aux-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');
const evidenceDir = path.join(rootDir, 'evidence');

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';
const intentId = 'MINING_INTELLIGENCE_GENERAL';
const file = 'aux3_mining_intelligence_general.jsonl';

async function main() {
  const { account, address } = loadOrCreateAux3Wallet();
  console.log(`Node 03 Submitter Address: ${address}`);

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
  const url = `${NODE_URL}/api/evalpool/submissions?intent_id=${encodeURIComponent(intentId)}&submitter=${encodeURIComponent(address)}`;

  console.log(`\n▶ Submitting Node 03 dataset for [${intentId}]...`);
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

  // Check updated status
  const statusRes = await fetch(`${NODE_URL}/api/evalpool/status?intent_id=${encodeURIComponent(intentId)}`);
  const statusData = await statusRes.json();
  console.log(`\nUpdated [${intentId}] Status:`);
  console.log(`  Submitters: ${statusData.submitters} / Min: ${statusData.min_submitters}`);
  console.log(`  Eligible Submitters: ${statusData.eligible_submitters}`);
  console.log(`  Admitted / Eligible:`, JSON.stringify(statusData.by_state));

  const outReceipt = path.join(evidenceDir, 'aux3-mining-receipt.json');
  fs.writeFileSync(outReceipt, JSON.stringify({ submitter: address, timestamp: new Date().toISOString(), response: parsed, statusData }, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
