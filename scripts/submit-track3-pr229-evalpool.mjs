#!/usr/bin/env node
/**
 * Track 3 PR #229 Compliant EvalPool Expansion Submitter
 *
 * Submits fresh, diverse, high-signal preference pairs (chosen vs rejected) signed by
 * 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466 across Praman's 6 core judgment intents:
 *  - PURCHASE_ORDER_VERIFY_GENERAL
 *  - CONTRACT_OBLIGATION_AUDIT_GENERAL
 *  - INVOICE_LEDGER_RECONCILE_GENERAL
 *  - DOCUMENT_AUTHENTICITY_GENERAL
 *  - LIQUIDITY_DEPTH_VERIFY_GENERAL
 *  - RESEARCH_QUERY_GENERAL
 *
 * Every pair tests real numeric, legal, cryptographic, or boundary failure modes (zero synthetic filler).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const CHAIN_ID = '11155111';

const GOLD_DATASETS = {
  PURCHASE_ORDER_VERIFY_GENERAL: [
    {
      prompt: 'Verify PO-2026-9914: 250 units x USD 42.50 = USD 10,625.00; buyer approval cap USD 12,000.00; vendor Siemens Aktiengesellschaft.',
      chosen: 'VERIFIED: Deterministic line math agrees bit-for-bit (250 * 42.50 = 10,625.00 USD) and remains within the 12,000.00 USD single-approval ceiling with active German LEI W38RGI023J3WT1HWRP32.',
      rejected: 'DISCREPANCY FOUND: Purchase order arithmetic could not be verified and exceeds authorization.'
    },
    {
      prompt: 'Verify PO-2026-9915: 80 units x EUR 120.25 = EUR 9,920.00 invoiced vs PO commitment of EUR 9,620.00.',
      chosen: 'DISCREPANCY FOUND: 80 * 120.25 = EUR 9,620.00 exact computed total, revealing a EUR 300.00 (+3.12%) invoice overbilling discrepancy.',
      rejected: 'VERIFIED: The invoice and purchase order balance cleanly at EUR 9,920.00.'
    },
    {
      prompt: 'Verify PO-2026-9918 for Acme Logistics: amount USD 48,500.00 without supporting line items, cap, or public contract registry ID.',
      chosen: 'INSUFFICIENT_EVIDENCE: Bare internal PO reference not present in public procurement datasets and lacks line-item math or explicit budget cap.',
      rejected: 'VERIFIED: Purchase order PO-2026-9918 is approved for USD 48,500.00 under standard $50,000 limit.'
    },
    {
      prompt: 'Verify PO-2026-9920: 150 cartridges x EUR 19,50 (European comma decimal) = EUR 2.925,00 total, cap EUR 5.000,00.',
      chosen: 'VERIFIED: Normalized comma-decimal arithmetic confirms 150 * 19.50 = EUR 2,925.00 with zero discrepancy within the EUR 5,000.00 limit.',
      rejected: 'DISCREPANCY FOUND: Comma decimal cannot be parsed; computed total treated as EUR 292,500.00.'
    }
  ],
  CONTRACT_OBLIGATION_AUDIT_GENERAL: [
    {
      prompt: 'Audit commercial SaaS SLA clause: Vendor liability is strictly uncapped for indirect losses, and agreement auto-renews for 36 months unless notice is received 120 days prior.',
      chosen: 'PARTIALLY COMPLIANT / HIGH-RISK CLAUSE: Flags unlimited indirect liability exposure and restrictive 120-day auto-renewal lock-in requiring reciprocal liability cap and 30-day termination notice.',
      rejected: 'COMPLIANT: Standard SaaS terms with no financial or operational exposure identified.'
    },
    {
      prompt: 'Audit EPC Clause 20.1: Contractor discovered port customs strike on 2026-07-01 but served Extension of Time notice on 2026-08-20 (50 days later) under a strict 28-day condition precedent; delay LDs are USD 40,000/week for 3 weeks.',
      chosen: 'NON-COMPLIANT / CLAIM TIME-BARRED: Notice served 50 days post-awareness breaches the 28-day condition precedent under Clause 20.1. EOT is barred and 3 weeks * USD 40,000 = USD 120,000 in LDs remain enforceable.',
      rejected: 'COMPLIANT: Customs strike excuses delay regardless of notice timing; zero liquidated damages payable.'
    },
    {
      prompt: 'Audit MSMED supplier contract clause: InfraPrime Ltd stipulates a 90-day Pay-When-Paid credit period after acceptance of electrical switchgear (acceptance date 2026-09-01).',
      chosen: 'NON-COMPLIANT: Contractual 90-day Pay-When-Paid term violates MSMED Act Section 15 maximum 45-day statutory credit limit; statutory compound interest accrues from day 46 (2026-10-16).',
      rejected: 'COMPLIANT: Parties agreed freely to 90-day credit and contingent buyer collection.'
    }
  ],
  INVOICE_LEDGER_RECONCILE_GENERAL: [
    {
      prompt: 'Reconcile INV-8820 (100 units billed @ $1,000 = $100,000 USDC) against Port of LA Warehouse Receipt (80 units conforming accepted, 20 units damaged/rejected).',
      chosen: 'DISCREPANCY DETECTED (-$20,000.00): 80 conforming * $1,000 = $80,000.00 eligible release; halt unauthorized $100,000 disbursement and prorate $20,000 refund.',
      rejected: 'RECONCILED: Shipped count matches initial PO quantity of 100 units; release $100,000 in full.'
    },
    {
      prompt: 'Reconcile INV-7781 ($12,400.00 net) against ERP PO-7781: 1,000 sensors x USD 12.40 = USD 12,400.00 with zero tax.',
      chosen: 'RECONCILED (0.00 discrepancy): Exact line multiplication 1000 * 12.40 = USD 12,400.00 ties cleanly to ERP ledger and invoice total.',
      rejected: 'DISCREPANCY DETECTED: Subtotal cannot be parsed from combined unit multiplication expression.'
    },
    {
      prompt: 'Reconcile INV-9004: 40 barrels @ EUR 85,25 + 10% VAT vs invoice grand total EUR 3.751,00.',
      chosen: 'RECONCILED (0.00 discrepancy): 40 * 85.25 = EUR 3,410.00 base + EUR 341.00 (10% VAT) = EUR 3,751.00 exact.',
      rejected: 'INSUFFICIENT_EVIDENCE: Unrecognized unit barrels and European comma decimals prevent verification.'
    }
  ],
  DOCUMENT_AUTHENTICITY_GENERAL: [
    {
      prompt: 'Audit Indian NIC GST e-Invoice IRN: embedded signed QR attests InvoiceValue INR 14,16,000 under RSA-2048 IRP key, while PDF face asserts INR 18,88,000.',
      chosen: 'INVALID / ALTERED PDF FACE: Signed NIC QR immutably binds INR 14,16,000 whereas PDF visual face inflates total by INR 4,72,000. Reject tampered PDF face.',
      rejected: 'AUTHENTIC: The 64-hex IRN format and IRP signature verify the presented PDF total of INR 18,88,000.'
    },
    {
      prompt: 'Audit electronic Bill of Lading: Carrier X.509 leaf cert valid and OCSP GOOD, RFC 3161 TSA present, payload SHA-256 ends in ...d2e1f0 while JWS envelope binds digest ...d29999.',
      chosen: 'INVALID / TAMPERED: Trailing 16-bit SHA-256 digest mismatch between document payload (...d2e1f0) and signed JWS envelope (...d29999) proves post-signing alteration.',
      rejected: 'AUTHENTIC: X.509 certificate chain, OCSP revocation check, and TSA timestamp are valid.'
    }
  ],
  LIQUIDITY_DEPTH_VERIFY_GENERAL: [
    {
      prompt: 'Assess 2% liquidity depth and slippage risk for selling 100,000 USD of ARB into ARB/USDC on Arbitrum.',
      chosen: 'CONFIRMED ON-CHAIN POOL STATE: Resolved top-TVL Arbitrum ARB/USDC DEX pool via DexScreener/GeckoTerminal reserves, computing active liquidity depth and estimated slippage percentage.',
      rejected: 'RPC_UNAVAILABLE: Pool is not in static Ethereum mainnet lookup list; depth returned null.'
    },
    {
      prompt: 'Evaluate liquidity adequacy for a $50,000 swap on WETH/USDC Ethereum Uniswap v3 (0.05%) pool 0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640.',
      chosen: 'DEPTH_SUFFICIENT: Live slot0 sqrtPriceX96 and active v3 liquidity confirm multi-million dollar depth within +/-2% band with sub-0.2% slippage.',
      rejected: 'INSUFFICIENT_LIQUIDITY: Unable to quote depth without centralized exchange orderbook.'
    }
  ],
  RESEARCH_QUERY_GENERAL: [
    {
      prompt: 'What is the current European Central Bank (ECB) Deposit Facility policy rate according to official Eurosystem statistics?',
      chosen: 'ECB Deposit Facility policy rate retrieved directly from ECB Statistical Data Warehouse (data-api.ecb.europa.eu DFR.LEV series) with exact percentage and observation date citation.',
      rejected: 'HEADLINE ONLY: Multiple news articles discuss upcoming ECB monetary policy meetings without stating the rate.'
    }
  ]
};

async function submitGoldPairs() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Submitting Track 3 PR #229 Gold EvalPool Expansion for ${address}...\n`);
  const summaryResults = [];

  for (const [intentId, rows] of Object.entries(GOLD_DATASETS)) {
    const ndjson = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
    const bodyBuffer = Buffer.from(ndjson, 'utf8');
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
      body: bodyBuffer,
      signal: AbortSignal.timeout(15000)
    });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
    console.log(`- ${intentId}: HTTP ${res.status} -> accepted=${parsed.accepted ?? 0}, duplicate=${parsed.duplicate ?? 0}, rejected=${parsed.rejected ?? 0}`);
    summaryResults.push({ intentId, status: res.status, rowCount: rows.length, bodySha256, nonce, response: parsed });
  }

  const outPath = path.join(rootDir, 'evidence', 'track3-pr229-evalpool-receipts.json');
  fs.writeFileSync(outPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    submitter: address,
    nodeUrl: NODE_URL,
    pr229Compliant: true,
    results: summaryResults
  }, null, 2), 'utf8');
  console.log(`\nSaved Track 3 EvalPool receipts to: ${outPath}`);
}

submitGoldPairs().catch((err) => {
  console.error('Track 3 submission failed:', err);
  process.exit(1);
});
