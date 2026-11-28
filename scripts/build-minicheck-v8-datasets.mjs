#!/usr/bin/env node
/**
 * Generate shortcut-free preference pair datasets (train + disjoint val) for
 * MiniCheck-DeBERTa-v3-Large (512-token lora-v2) Telegraph Track 3 evaluators.
 *
 * Balances positive/negative labels 50/50 and swaps symmetric verdict phrasing so:
 *   - Length baseline accuracy ~50% (<= 65% gate)
 *   - Surface BoW probe with prompt hidden ~50% (<= 65% gate)
 *   - Unique rejected >= 95%, train/val entities 100% disjoint
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, 'eval-data');
fs.mkdirSync(outDir, { recursive: true });

function rngFactory(seed = 20261128) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = rngFactory();
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

function hex64(seedStr) {
  return crypto.createHash('sha256').update(seedStr).digest('hex');
}

function formatPair(prompt, chosenObj, rejectedObj, idx) {
  const mode = idx % 3;
  if (mode === 0) {
    return {
      prompt,
      chosen: JSON.stringify(chosenObj),
      rejected: JSON.stringify(rejectedObj),
      label_kind: 'preference_pair'
    };
  }
  if (mode === 1) {
    const toBullets = (o) => Object.entries(o).map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join('; ') : v}`).join('\n');
    return { prompt, chosen: toBullets(chosenObj), rejected: toBullets(rejectedObj), label_kind: 'preference_pair' };
  }
  return {
    prompt,
    chosen: chosenObj.summary,
    rejected: rejectedObj.summary,
    label_kind: 'preference_pair'
  };
}

// ---------------------------------------------------------------------------
// 1. INVOICE_LEDGER_RECONCILE (240 train / 60 val, balanced 50% exact vs 50% mismatch)
// ---------------------------------------------------------------------------
const VENDORS_TRAIN = ['Siemens AG', 'Bosch Rexroth', 'Schneider Electric', 'ABB Robotics', 'Honeywell Process', 'Fanuc Corp', 'KUKA Systems', 'Rockwell Automation', 'Emerson Electric', 'Yokogawa Electric', 'Danfoss Drives', 'Festo Pneumatic', 'SKF Industrial', 'Parker Hannifin', 'Keyence Corp', 'Omron Automation'];
const VENDORS_VAL = ['Beckhoff Automation', 'Mitsubishi Electric', 'Endress+Hauser', 'WAGO Kontakttechnik', 'Phoenix Contact', 'Murrelektronik GmbH'];

function buildInvoicePairs(vendors, count, seedPrefix) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const vendor = vendors[i % vendors.length];
    const po = `PO-${seedPrefix}-${1000 + i}`;
    const inv = `INV-${seedPrefix}-${5000 + i}`;
    const qtyOrdered = randInt(20, 400);
    const unitPrice = Number((randInt(15, 250) + pick([0, 0.25, 0.4, 0.5, 0.75])).toFixed(2));
    const taxPct = pick([0, 5, 8, 10, 18]);
    const isMatch = i % 2 === 0;
    const acceptedQty = isMatch ? qtyOrdered : Math.max(5, qtyOrdered - randInt(3, 18));
    const expectedSubtotal = Number((acceptedQty * unitPrice).toFixed(2));
    const expectedTotal = Number((expectedSubtotal * (1 + taxPct / 100)).toFixed(2));
    const billedQty = qtyOrdered;
    const billedSubtotal = Number((billedQty * unitPrice).toFixed(2));
    const billedTotal = Number((billedSubtotal * (1 + taxPct / 100)).toFixed(2));
    const discrepancy = Number(Math.abs(billedTotal - expectedTotal).toFixed(2));

    const prompt = `Reconcile ${inv} from ${vendor} against ${po}: billed ${billedQty} units at USD ${unitPrice.toFixed(2)} (${taxPct}% tax, billed total USD ${billedTotal.toFixed(2)}) vs warehouse receipt confirming ${acceptedQty} conforming units.`;

    const matchObj = {
      reconciled: true,
      discrepancy: 0,
      po_number: po,
      vendor,
      expected_total: billedTotal,
      summary: `RECONCILED (${po} / ${inv}): ${vendor} invoice total USD ${billedTotal.toFixed(2)} matches ${acceptedQty} accepted units x USD ${unitPrice.toFixed(2)} plus ${taxPct}% tax with discrepancy 0.00.`
    };
    const mismatchObj = {
      reconciled: false,
      discrepancy: discrepancy > 0 ? discrepancy : Number((unitPrice * 2).toFixed(2)),
      po_number: po,
      vendor,
      expected_total: expectedTotal,
      summary: `DISCREPANCY DETECTED (${po} / ${inv}): ${vendor} overbilled ${billedQty} vs ${acceptedQty} accepted units at USD ${unitPrice.toFixed(2)} (+${taxPct}% tax); shortfall USD ${(discrepancy || unitPrice * 2).toFixed(2)}.`
    };
    rows.push(isMatch ? formatPair(prompt, matchObj, mismatchObj, i) : formatPair(prompt, mismatchObj, matchObj, i));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 2. CONTRACT_OBLIGATION_AUDIT (220 train / 56 val, balanced verdicts)
// ---------------------------------------------------------------------------
const PARTIES_TRAIN = ['Helios Logistics Ltd', 'Nordic Freight GmbH', 'Pacific Alloys Inc', 'Atlas Components BV', 'Vanguard Robotics Co', 'Meridian Energy AG', 'Apex Geotech Pty', 'Caspian Marine SA'];
const PARTIES_VAL = ['Boreal Maritime AS', 'Trident Semiconductor LLC', 'Rhine Valley Metals AG', 'Solstice Cloud Inc'];

function buildContractPairs(parties, count) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const p1 = parties[i % parties.length];
    const days = randInt(10, 45);
    const capPct = pick([100, 150, 200]);
    const cid = `CTR-${randInt(100, 999)}-${i}`;
    const ld = randInt(5, 50) * 500;
    const isCompliant = i % 2 === 0;
    const prompt = isCompliant
      ? `Audit contract ${cid}: ${p1} shall deliver servers within ${days} days under ${capPct}% liability cap with USD ${ld} delay penalty. Record confirms on-time delivery.`
      : `Audit contract ${cid}: ${p1} shall deliver servers within ${days} days under ${capPct}% liability cap with USD ${ld} delay penalty. Record confirms late delivery triggering USD ${ld}.`;

    const compObj = {
      verdict: 'Compliant',
      obligations: [`${p1} delivers within ${days} days`, `Cap ${capPct}% / USD ${ld} penalty clause`],
      clauses: [`Delivery within ${days} days`, `Liability cap ${capPct}%`],
      summary: `Verdict Compliant (${cid}): ${p1} fulfilled the ${days}-day delivery covenant cleanly with USD 0 penalty.`
    };
    const nonCompObj = {
      verdict: 'Non-compliant',
      obligations: [`${p1} delivers within ${days} days`, `USD ${ld} penalty owed for delay`],
      clauses: [`Delivery within ${days} days`, `Liquidated damages USD ${ld}`],
      summary: `Verdict Non-compliant (${cid}): ${p1} breached the ${days}-day delivery covenant and owes USD ${ld} penalty.`
    };
    rows.push(isCompliant ? formatPair(prompt, compObj, nonCompObj, i) : formatPair(prompt, nonCompObj, compObj, i));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 3. FRAUD_RISK (220 train / 56 val, balanced LOW vs CRITICAL/HIGH)
// ---------------------------------------------------------------------------
const GOOD_DOMAINS_TRAIN = ['siemens.com', 'stripe.com', 'cloudflare.com', 'shopify.com', 'atlassian.com', 'github.com', 'datadoghq.com', 'figma.com'];
const GOOD_DOMAINS_VAL = ['linear.app', 'vercel.com', 'notion.so', 'anthropic.com'];
const BAD_DOMAINS_TRAIN = ['unisvvap.org', 'metamask-restore.xyz', 'ledger-firmware-sync.top', 'arbitrum-airdrop-claim.vip', 'opensea-mint-verify.tk', 'binance-kyc-update.info'];
const BAD_DOMAINS_VAL = ['revoke-cash-bonus.xyz', 'phantom-wallet-claim.top', 'coinbase-unlock-verify.vip', 'base-bridge-reward.tk'];
const DISPOSABLE = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'trashmail.com', '10minutemail.com'];

function buildFraudPairs(goodDoms, badDoms, count, startIdx) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const isRisky = i % 2 === 1;
    const ses = `SES-${startIdx + i}`;
    const dom = isRisky ? badDoms[i % badDoms.length] : goodDoms[i % goodDoms.length];
    const mailHost = isRisky ? DISPOSABLE[i % DISPOSABLE.length] : dom;
    const ip = `${randInt(12, 99)}.${randInt(10, 240)}.${randInt(1, 250)}.${randInt(2, 250)}`;
    const prompt = isRisky
      ? `Assess fraud risk for session ${ses}: actor_${startIdx + i}@${mailHost}, domain ${dom}, IP ${ip}, headless webdriver drainer approval.`
      : `Assess fraud risk for session ${ses}: finance-${i + startIdx}@${mailHost}, domain ${dom}, IP ${ip}, Chrome macOS corporate TLS.`;

    const lowObj = {
      risk_level: 'LOW',
      risk_score: Number((0.04 + (i % 7) * 0.01).toFixed(2)),
      signals: ['VERIFIED_CORPORATE_DOMAIN', 'CLEAN_SESSION_FINGERPRINT'],
      summary: `FRAUD RISK LOW [${ses} | ${dom} | ${ip}]: Verified domain identity and standard user fingerprint cleared.`
    };
    const highObj = {
      risk_level: 'CRITICAL',
      risk_score: Number((0.85 + (i % 8) * 0.01).toFixed(2)),
      signals: ['DISPOSABLE_OR_PHISHING_DOMAIN', 'HEADLESS_AUTOMATION_LURE'],
      summary: `FRAUD RISK CRITICAL [${ses} | ${dom} | ${ip}]: Phishing/disposable domain marker and headless automation lure flagged.`
    };
    rows.push(isRisky ? formatPair(prompt, highObj, lowObj, i) : formatPair(prompt, lowObj, highObj, i));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 4. DOCUMENT_AUTHENTICITY (220 train / 56 val, balanced Authentic vs Tampered)
// ---------------------------------------------------------------------------
function buildDocAuthPairs(count, prefix) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const docId = `DOC-${prefix}-${2000 + i}`;
    const expectedHash = hex64(`${docId}-expected`);
    const isAuthentic = i % 2 === 0;
    const faceAmt = (randInt(10, 250) * 100).toFixed(2);
    const qrAmt = isAuthentic ? faceAmt : (Number(faceAmt) + randInt(500, 9000)).toFixed(2);
    const observedHash = isAuthentic ? expectedHash : hex64(`${docId}-tampered`);

    const prompt = `Verify cryptographic authenticity of e-Invoice ${docId}: stated total USD ${faceAmt}, signed QR payload amount USD ${qrAmt}, PDF digest ${observedHash.slice(0, 16)}... vs IRN anchor ${expectedHash.slice(0, 16)}...`;
    const authObj = {
      authentic: true,
      verdict: 'Authentic',
      discrepancy: 0,
      summary: `AUTHENTIC (${docId}): Document SHA-256 digest and signed QR payload (USD ${faceAmt}) match registered IRN cryptographic anchor cleanly.`
    };
    const tampObj = {
      authentic: false,
      verdict: 'Tampered',
      discrepancy: Number(Math.abs(Number(qrAmt) - Number(faceAmt)).toFixed(2)) || 1000,
      summary: `TAMPERED (${docId}): PDF digest and face amount USD ${faceAmt} conflict with signed IRN payload (USD ${qrAmt}) cryptographic hash.`
    };
    rows.push(isAuthentic ? formatPair(prompt, authObj, tampObj, i) : formatPair(prompt, tampObj, authObj, i));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 5. URL_SCAN (220 train / 56 val, balanced safe=true vs safe=false)
// ---------------------------------------------------------------------------
const SAFE_URLS_TRAIN = ['https://uniswap.org/swap', 'https://app.aave.com/markets', 'https://stripe.com/docs', 'https://github.com/ethereum', 'https://etherscan.io/txs', 'https://docs.solana.com/cli', 'https://ethereum.org/en/developers', 'https://lido.fi/ethereum'];
const SAFE_URLS_VAL = ['https://base.org/ecosystem', 'https://arbitrum.io/bridge', 'https://docs.cdp.coinbase.com/', 'https://praman-desk.vercel.app/verify'];

function buildUrlPairs(safeUrls, badDoms, count, tag) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const isSafe = i % 2 === 0;
    const url = isSafe
      ? `${safeUrls[i % safeUrls.length]}?ref=${tag}${i}`
      : `https://${badDoms[i % badDoms.length]}/claim-airdrop?id=${tag}${i}`;
    const prompt = `Scan URL safety verdict for: ${url}`;
    const safeObj = {
      safe: true,
      verdict: 'SAFE',
      summary: `SAFE URL (${url}): Verified official host with clean threat feed record.`
    };
    const badObj = {
      safe: false,
      verdict: 'MALICIOUS',
      summary: `UNSAFE URL (${url}): Phishing typosquat lure and drainer feed flag.`
    };
    rows.push(isSafe ? formatPair(prompt, safeObj, badObj, i) : formatPair(prompt, badObj, safeObj, i));
  }
  return rows;
}

function statsCheck(name, rows) {
  const uniqRej = new Set(rows.map(r => r.rejected)).size / rows.length;
  let chLonger = 0;
  for (const r of rows) if (r.chosen.length > r.rejected.length) chLonger++;
  const lenAcc = Math.max(chLonger / rows.length, 1 - chLonger / rows.length);
  console.log(`  [${name}] rows=${rows.length} uniqRej=${(uniqRej * 100).toFixed(1)}% lenAcc=${(lenAcc * 100).toFixed(1)}%`);
}

function writeSplit(prefix, trainRows, valRows) {
  const tPath = path.join(outDir, `${prefix}_train.jsonl`);
  const vPath = path.join(outDir, `${prefix}_val.jsonl`);
  fs.writeFileSync(tPath, trainRows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  fs.writeFileSync(vPath, valRows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  statsCheck(`${prefix}_train`, trainRows);
  statsCheck(`${prefix}_val`, valRows);
}

console.log('Generating balanced MiniCheck LoRA-v2 datasets into:', outDir);
writeSplit('v8_invoice_reconcile', buildInvoicePairs(VENDORS_TRAIN, 240, 'TR'), buildInvoicePairs(VENDORS_VAL, 60, 'VA'));
writeSplit('v8_contract_obligation', buildContractPairs(PARTIES_TRAIN, 220), buildContractPairs(PARTIES_VAL, 56));
writeSplit('v8_fraud_risk', buildFraudPairs(GOOD_DOMAINS_TRAIN, BAD_DOMAINS_TRAIN, 220, 100), buildFraudPairs(GOOD_DOMAINS_VAL, BAD_DOMAINS_VAL, 56, 900));
writeSplit('v8_document_authenticity', buildDocAuthPairs(220, 'TR'), buildDocAuthPairs(56, 'VA'));
writeSplit('v8_url_scan', buildUrlPairs(SAFE_URLS_TRAIN, BAD_DOMAINS_TRAIN, 220, 'tr'), buildUrlPairs(SAFE_URLS_VAL, BAD_DOMAINS_VAL, 56, 'va'));
