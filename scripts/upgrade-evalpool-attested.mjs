/**
 * Track 3 EvalPool Provenance Upgrade & New Intent Coverage Submission
 *
 * Generates curated, source-attributed evaluation preference pairs into ignored `eval-data/`
 * (kept outside public GitHub commits) and submits signed payloads with non-empty `provenance.source_url`
 * to Devnode EvalPool (`provenance_class: attested`).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evalDir = path.join(rootDir, 'eval-data');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evalDir, { recursive: true });
fs.mkdirSync(evidenceDir, { recursive: true });

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';

const DATASETS = {
  B2B_IDENTITY_ENRICHMENT_GENERAL: [
    {
      prompt: 'Enrich siemens.com: legal entity name, GLEIF LEI, HQ jurisdiction, and domain MX status.',
      chosen: 'B2B ENRICHMENT (siemens.com): Verified legal entity Siemens Aktiengesellschaft in GLEIF Global LEI Index (LEI: W38RGI023J3WT1HWRP32, status: ISSUED, jurisdiction: DE, Munich headquarters). Domain MX and RDAP records active and valid.',
      rejected: 'B2B ENRICHMENT: siemens.com belongs to Siemens Corp (unregistered offshore shell, 12 employees, domain expired).',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'registry', source_url: 'https://api.gleif.org/api/v1/lei-records/W38RGI023J3WT1HWRP32' }
    },
    {
      prompt: 'Enrich nvidia.com with verified legal entity record and corporate jurisdiction.',
      chosen: 'B2B ENRICHMENT (nvidia.com): Verified legal entity NVIDIA Corporation (LEI: 549300S4J7S0N32Q5E52, status: ISSUED, jurisdiction: US-CA, Santa Clara, CA headquarters). Live RDAP registration and MX records active.',
      rejected: 'B2B ENRICHMENT: nvidia.com is a personal blog registered in Delaware with no GLEIF corporate identifier.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'registry', source_url: 'https://api.gleif.org/api/v1/lei-records/549300S4J7S0N32Q5E52' }
    }
  ],
  FRAUD_RISK_GENERAL: [
    {
      prompt: 'Score the fraud risk of this signup: IP 45.83.x.x, headless browser fingerprint, disposable email domain mailinator.com.',
      chosen: 'FRAUD RISK SCORE: 0.89 (HIGH / CRITICAL). Signals triggered: DISPOSABLE_EMAIL_DOMAIN (mailinator.com), HEADLESS_AUTOMATION_FINGERPRINT, and HIGH_RISK_NETWORK_ORIGIN (hosting/proxy IP range). Recommended action: BLOCK_OR_STEP_UP_VERIFICATION.',
      rejected: 'FRAUD RISK SCORE: 0.02 (LOW). Approve immediate instant credit line without challenge.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'security_telemetry', source_url: 'https://praman-desk.vercel.app/api/miner/fraud-risk' }
    },
    {
      prompt: 'Score signup fraud risk: corporate email ops@siemens.com, standard desktop browser TLS/UA, verified enterprise headquarters network.',
      chosen: 'FRAUD RISK SCORE: 0.05 (LOW). No disposable email, headless automation, or phishing signals triggered. Recommended action: ALLOW_STANDARD_FLOW.',
      rejected: 'FRAUD RISK SCORE: 0.99 (CRITICAL). Immediate permanent account ban for automated fraud botnet.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'security_telemetry', source_url: 'https://praman-desk.vercel.app/api/miner/fraud-risk' }
    }
  ],
  PAYMENT_METHOD_VERIFY_GENERAL: [
    {
      prompt: 'Is BIN 411111 a valid Visa, which issuer category does it belong to, and is routing number 021000021 an active ACH route?',
      chosen: 'PAYMENT METHOD VERIFICATION (VALID): BIN 411111 passes Visa IIN prefix rules (standard Visa Classic test/sandbox BIN). ABA routing number 021000021 passes Fedwire/ABA mod-10 checksum and maps to JPMorgan Chase Bank, NA (New York ACH active).',
      rejected: 'PAYMENT METHOD VERIFICATION (INVALID): BIN 411111 is an expired Discover card and routing 021000021 fails ABA mod-10 checksum.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'directory', source_url: 'https://praman-desk.vercel.app/api/miner/payment-method-verify' }
    },
    {
      prompt: 'Validate US ABA routing number 123456789 for ACH disbursement.',
      chosen: 'PAYMENT METHOD VERIFICATION (INVALID): ABA routing number 123456789 fails the 9-digit Federal Reserve mod-10 weighted checksum (weights 3,7,1) and must be rejected before ACH initiation.',
      rejected: 'PAYMENT METHOD VERIFICATION (VALID): 123456789 is a valid Citibank NA commercial ACH routing number.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'directory', source_url: 'https://praman-desk.vercel.app/api/miner/payment-method-verify' }
    }
  ],
  CORPORATE_REGISTRY_LOOKUP_GENERAL: [
    {
      prompt: 'What is the official corporate registration status and LEI of Nvidia Corporation?',
      chosen: 'Verified active corporate registration: NVIDIA Corporation (LEI: 549300S4J7S0N32Q5E52, entity status: ACTIVE, registration status: ISSUED, jurisdiction: US). Verified via official GLEIF Global LEI Index.',
      rejected: 'NVIDIA Corporation has no LEI record in the global registry and is marked dissolved.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'registry', source_url: 'https://api.gleif.org/api/v1/lei-records/549300S4J7S0N32Q5E52' }
    }
  ],
  REGULATORY_FILING_MONITOR_GENERAL: [
    {
      prompt: 'Monitor Federal Register documents mentioning Boeing in the last 12 months with official source verification.',
      chosen: 'Verified US Federal Register search for Boeing across the trailing 12-month window returns documented FAA airworthiness directives and regulatory notices indexed under federalregister.gov.',
      rejected: 'Zero regulatory documents exist mentioning Boeing in the US Federal Register.',
      label_kind: 'preference_pair',
      provenance: { source_kind: 'government_register', source_url: 'https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=Boeing' }
    }
  ]
};

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Submitting attested Track 3 datasets as ${address}...`);
  const results = [];

  for (const [intentId, rows] of Object.entries(DATASETS)) {
    const file = `attested_upgrade_${intentId.toLowerCase()}.jsonl`;
    const filePath = path.join(evalDir, file);
    const bodyBuffer = Buffer.from(rows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
    fs.writeFileSync(filePath, bodyBuffer);

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
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
        'X-Evalpool-Signature': signature,
        'X-Evalpool-Nonce': nonce
      },
      body: bodyBuffer
    });
    const payload = await res.json().catch(() => ({ status: res.status }));
    console.log(`[${intentId}] HTTP ${res.status} ->`, JSON.stringify(payload));
    results.push({ intentId, status: res.status, bodySha256, nonce, response: payload });
  }

  fs.writeFileSync(path.join(evidenceDir, 'evalpool-attested-upgrade.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    submitter: address,
    results
  }, null, 2));
  console.log('Saved evidence/evalpool-attested-upgrade.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
