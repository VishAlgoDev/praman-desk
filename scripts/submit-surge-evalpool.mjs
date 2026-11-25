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

const SURGE_TARGETS = [
  { intentId: 'ONCHAIN_TX_LOOKUP_GENERAL', file: 'surge_onchain_tx_lookup_general.jsonl' },
  { intentId: 'TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL', file: 'surge_token_total_supply_verify_general.jsonl' },
  { intentId: 'WALLET_BALANCE_CHECK_GENERAL', file: 'surge_wallet_balance_check_general.jsonl' },
  { intentId: 'LIQUIDITY_DEPTH_VERIFY_GENERAL', file: 'surge_liquidity_depth_verify_general.jsonl' },
  { intentId: 'RESEARCH_QUERY_GENERAL', file: 'surge_research_query_general.jsonl' },
  { intentId: 'WEB_SEARCH_GENERAL', file: 'surge_web_search_general.jsonl' },
  { intentId: 'SMART_CONTRACT_AUDIT_GENERAL', file: 'surge_smart_contract_audit_general.jsonl' },
  { intentId: 'WASH_TRADING_DETECTION_GENERAL', file: 'surge_wash_trading_detection_general.jsonl' },
  { intentId: 'MACRO_ECONOMIC_INDICATOR_GENERAL', file: 'surge_macro_economic_indicator_general.jsonl' },
  { intentId: 'GAS_PRICE_GENERAL', file: 'surge_gas_price_general.jsonl' },
  { intentId: 'CODE_REVIEW_GENERAL', file: 'surge_code_review_general.jsonl' },
  { intentId: 'EVENT_OUTCOME_RESOLUTION_GENERAL', file: 'surge_event_outcome_resolution_general.jsonl' },
  { intentId: 'LIVE_PORT_CONGESTION_GENERAL', file: 'surge_live_port_congestion_general.jsonl' },
  { intentId: 'VESSEL_TELEMETRY_VERIFY_GENERAL', file: 'surge_vessel_telemetry_verify_general.jsonl' }
];

async function submitDataset(account, { intentId, file }) {
  const filePath = path.join(evalDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
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
  console.log(`▶ Submitting surge dataset for [${intentId}]`);
  console.log(`  File: ${file} (${bodyBuffer.length} bytes)`);
  console.log(`  Submitter: ${account.address}`);
  console.log(`  Body SHA-256: ${bodySha256}`);
  console.log(`  Nonce: ${nonce}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson',
      'X-Evalpool-Signature': signature,
      'X-Evalpool-Nonce': nonce,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    body: bodyBuffer
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    parsed = { raw: text };
  }

  console.log(`  HTTP Response: ${response.status}`);
  console.log(`  Payload:`, JSON.stringify(parsed, null, 2));

  return {
    intentId,
    file,
    submitter: account.address,
    bodySha256,
    nonce,
    status: response.status,
    response: parsed,
    submittedAt: new Date().toISOString()
  };
}

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Primary Contributor Address: ${address}`);
  console.log(`Submitting 14 Surge Datasets (210 Rows Total)...`);

  const results = [];
  for (const target of SURGE_TARGETS) {
    try {
      const res = await submitDataset(account, target);
      results.push(res);
      // Small pause between requests
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`❌ Error submitting ${target.intentId}:`, err.message);
    }
  }

  const receiptPath = path.join(evidenceDir, 'surge-evalpool-receipts.json');
  fs.writeFileSync(receiptPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ All surge receipts saved to: ${receiptPath}`);
}

main().catch(console.error);
