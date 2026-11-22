import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';

export const QUERY_CATALOG = [
  // 1. Corporate Registry (Rank 1 Intent)
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify SAP SE in Germany',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Siemens AG in Germany',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Apple Inc in California US',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Alphabet Inc in Delaware US',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Microsoft Corporation in Washington US',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify ASML Holding N.V. in Netherlands',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Schneider Electric SE in France',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify ABB Ltd in Switzerland',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Tata Steel Limited in India',
  '[CORPORATE_REGISTRY_LOOKUP_GENERAL] Verify Glencore International AG in Switzerland',

  // 2. Sanctions Screening (Rank 4 Intent)
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen Bank Rossiya against OFAC SDN',
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen VTB Bank against OFAC SDN',
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen Sberbank against OFAC SDN',
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen Promsvyazbank against OFAC SDN',
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen Siemens AG against OFAC SDN',
  '[SANCTIONS_SCREENING_MATCH_GENERAL] Screen Apple Inc against OFAC SDN',

  // 3. Purchase Order Verification
  '[PURCHASE_ORDER_VERIFY_GENERAL] Verify Purchase Order PO-2026-001 Siemens Sinamics S120 drives 10 units @ 4500 EUR',
  '[PURCHASE_ORDER_VERIFY_GENERAL] Verify Purchase Order PO-2026-002 Schneider Electric Masterpact MTZ breakers 4 units @ 12500 USD',
  '[PURCHASE_ORDER_VERIFY_GENERAL] Verify Purchase Order PO-2026-003 ABB IRB-6700 servomotors 12 units @ 5000 CHF',

  // 4. Invoice Reconciliation
  '[INVOICE_LEDGER_RECONCILE_GENERAL] Reconcile Invoice INV-8819 Siemens 3-way match against PO-901 and GRN-901',
  '[INVOICE_LEDGER_RECONCILE_GENERAL] Reconcile Invoice INV-SCH-1092 Schneider Electric against PO-SCH-402',
  '[INVOICE_LEDGER_RECONCILE_GENERAL] Reconcile Invoice INV-TS-5541 Tata Steel hot rolled coils against PO-TS-081',

  // 5. Vendor Verification
  '[VENDOR_VERIFY_GENERAL] Verify Vendor SAP SE VAT DE143454238',
  '[VENDOR_VERIFY_GENERAL] Verify Vendor Siemens AG VAT DE129274202',
  '[VENDOR_VERIFY_GENERAL] Verify Vendor Microsoft Corporation LEI INR2EJN1ERAN0W5ZP974',

  // 6. Document Authenticity
  '[DOCUMENT_AUTHENTICITY_GENERAL] Verify e-Invoice hash 0x8fda594cdd161204848c9b091f389cb43b5ed4490c65461dd0f4beb72a210310',
  '[DOCUMENT_AUTHENTICITY_GENERAL] Verify bill of lading BL-2026-7781 SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',

  // 7. Contract Obligation Audit
  '[CONTRACT_OBLIGATION_AUDIT_GENERAL] Audit FIDIC Sub-Clause 20.1 time-bar notice for delay claim',
  '[CONTRACT_OBLIGATION_AUDIT_GENERAL] Audit MahaRERA Section 18 delay compensation interest calculation',

  // 8. Regulatory Filing Monitor
  '[REGULATORY_FILING_MONITOR_GENERAL] Monitor SEC EDGAR 10-K filing status for Goldman Sachs Group Inc',
  '[REGULATORY_FILING_MONITOR_GENERAL] Monitor SEC EDGAR 10-Q filing status for Apple Inc',

  // 9. Liquidity Depth Verify
  '[LIQUIDITY_DEPTH_VERIFY_GENERAL] Verify liquidity depth for Uniswap v3 pool 0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640 on ethereum',

  // 10. Web Search
  '[WEB_SEARCH_GENERAL] What are the latest developments in Telegraph Protocol Season II?',
  '[WEB_SEARCH_GENERAL] Overview of EU Corporate Sustainability Due Diligence Directive CSDDD requirements',

  // 11. Onchain TX Lookup
  '[ONCHAIN_TX_LOOKUP_GENERAL] Lookup Ethereum Sepolia transaction 0x524f24c37819fe77c5ba0f6cd125dca6a63e3f0fb193df87beddd363da0a4800',

  // 12. Token Total Supply
  '[TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL] Verify total supply for token 0xcc194e1a843B658526D0D5C431f670028582Ae17 on Sepolia',

  // 13. Wallet Balance Check
  '[WALLET_BALANCE_CHECK_GENERAL] Check native ETH balance for wallet 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466 on Sepolia',

  // 14. Research Query
  '[RESEARCH_QUERY_GENERAL] Synthesize regulatory compliance requirements for cross-border e-invoicing in European Union',

  // 15. Grid Power Price
  '[GRID_POWER_PRICE_GENERAL] What is the day-ahead LMP price at CAISO SP15 hub?'
];

const b64json = (v) => {
  if (!v) return undefined;
  try { return JSON.parse(Buffer.from(v, 'base64').toString('utf8')); } catch { return undefined; }
};

export async function executeEscrowAsk(account, address, query) {
  const startTs = Date.now();
  const res1 = await fetch(`${NODE_URL}/engine/v1/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (res1.status !== 402) {
    const text = await res1.text();
    return { ok: false, status: res1.status, error: text, durationMs: Date.now() - startTs };
  }

  const paymentReqHeader = res1.headers.get('PAYMENT-REQUIRED') || res1.headers.get('payment-required');
  const ch = b64json(paymentReqHeader);
  const esc = ch?.accepts?.find(a => a.scheme === 'escrow' && a.network === 'eip155:11155111');
  if (!esc || !esc.extra?.message) {
    return { ok: false, error: 'No escrow accepts in 402', durationMs: Date.now() - startTs };
  }

  const m = esc.extra.message.match(/Amount:\s*(\d+)\s*uUSDC/);
  const now = Math.floor(Date.now() / 1000);
  const authorization = {
    from: address.toLowerCase(),
    to: esc.payTo,
    value: m ? m[1] : '10000',
    validAfter: String(now - 5),
    validBefore: String(now + 100),
    nonce: crypto.randomUUID()
  };

  const message = esc.extra.message
    .replace('{from}', authorization.from)
    .replace('{nonce}', authorization.nonce)
    .replace('{validAfter}', authorization.validAfter)
    .replace('{validBefore}', authorization.validBefore);

  const signature = await account.signMessage({ message });

  const payment = Buffer.from(JSON.stringify({
    x402Version: 2,
    scheme: 'escrow',
    network: esc.network,
    payload: { signature, authorization }
  })).toString('base64');

  const res2 = await fetch(`${NODE_URL}/engine/v1/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PAYMENT': payment
    },
    body: JSON.stringify({ query })
  });

  const bodyText = await res2.text();
  let parsed = null;
  try { parsed = JSON.parse(bodyText); } catch {}

  return {
    ok: res2.status === 200,
    status: res2.status,
    minerId: parsed?.miner_id,
    minerName: parsed?.miner_name,
    signalHash: parsed?.signal_hash,
    intent: parsed?.intent,
    rawLength: bodyText.length,
    durationMs: Date.now() - startTs
  };
}

async function runBatch(count = 10, minIntervalMs = 2000, maxIntervalMs = 5000) {
  const { account, address } = loadOrCreateWallet();
  console.log('========================================================================');
  console.log(' ⚡ PRAMAN DESK: DEVNODE ESCROW ASKS PACER');
  console.log(` Caller Address : ${address}`);
  console.log(` Batch Target   : ${count} asks rotating across 15 universal intents`);
  console.log('========================================================================\n');

  const historyFile = path.join(evidenceDir, 'pacer-escrow-runs.json');
  let history = [];
  if (fs.existsSync(historyFile)) {
    try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch {}
  }

  let successCount = 0;
  for (let i = 0; i < count; i++) {
    const query = QUERY_CATALOG[i % QUERY_CATALOG.length];
    const timestamp = new Date().toISOString();
    console.log(`[${i + 1}/${count}] ${query.slice(0, 60)}...`);

    const result = await executeEscrowAsk(account, address, query);
    console.log(`   Status: HTTP ${result.status} | Miner: ${result.minerId || 'n/a'} | Latency: ${result.durationMs}ms | Signal: ${result.signalHash ? result.signalHash.slice(0, 16) + '...' : 'none'}`);

    if (result.ok) successCount++;

    history.push({
      timestamp,
      query,
      status: result.status,
      minerId: result.minerId,
      minerName: result.minerName,
      signalHash: result.signalHash,
      intent: result.intent,
      latencyMs: result.durationMs
    });

    if (i < count - 1) {
      const wait = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
      console.log(`   Pacing pause ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  // Check Devnode miner requests served counter
  try {
    const res = await fetch(`${NODE_URL}/api/miners`);
    const list = await res.json();
    const praman = list.find(m => m.id === '6164' || m.id === 6164);
    console.log('\n========================================================================');
    console.log(` Batch Finished: ${successCount}/${count} asks successful.`);
    console.log(` Devnode Praman Miner ID: ${praman?.id} | Total Requests Served: ${praman?.total_requests_served}`);
    console.log('========================================================================');
  } catch (e) {
    console.log('\nBatch complete; Devnode stats query noted:', e.message);
  }
}

const batchArg = process.argv.find(a => a.startsWith('--count='))?.split('=')[1];
const targetCount = batchArg ? parseInt(batchArg, 10) : 10;

runBatch(targetCount).catch(console.error);
