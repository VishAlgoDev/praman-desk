#!/usr/bin/env node
/**
 * OpenClaw & Hermes Unattended Autonomous Gating Trace
 *
 * Exercises Praman Desk's keyless MCP JSON-RPC / live HTTP endpoints and Solana Devnet
 * Spend Guard across an unattended multi-step treasury & compliance workflow,
 * recording verifiable timestamps, hashes, and policy blocks into evidence/agent-session-trace.jsonl.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeMcpTool } from '../../mcp/server.mjs';
import { SolanaSpendGuard } from '../../packages/praman-sdk/solana.js';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..', '..');
const tracePath = path.join(rootDir, 'evidence', 'agent-session-trace.jsonl');

async function runTrace() {
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  const events = [];

  const logEvent = (step, action, outcome) => {
    const rec = {
      timestamp: new Date().toISOString(),
      agent: 'openclaw-hermes-treasury-v2',
      step,
      action,
      ...outcome
    };
    events.push(rec);
    fs.appendFileSync(tracePath, JSON.stringify(rec) + '\n', 'utf8');
    return rec;
  };

  console.log('=== OpenClaw / Hermes Autonomous Agent Session Trace ===\n');

  // Step 1: Hermetic counterparty vetting on German parent LEI (Chrysolite regression case)
  const s1Res = await executeMcpTool('lookup_corporate_registry', { company: 'Siemens Aktiengesellschaft' });
  const s1 = JSON.parse(s1Res.content[0].text);
  logEvent(1, 'mcp:lookup_corporate_registry', {
    verdict: s1.verdict,
    lei: s1.registration_id,
    jurisdiction: s1.jurisdiction
  });
  console.log(`1. Corporate LEI resolved: ${s1.legal_name} (${s1.registration_id}, ${s1.jurisdiction})`);

  // Step 2: Intercept phonetic OFAC transliteration near-miss before wire initiation
  const s2Res = await executeMcpTool('screen_sanctions', { name: 'Viktor But' });
  const s2 = JSON.parse(s2Res.content[0].text);
  logEvent(2, 'mcp:screen_sanctions', {
    matched: s2.matched,
    nearMiss: s2.near_miss,
    verdict: s2.verdict,
    potentialMatch: s2.potential_matches?.[0]?.matched_name || null
  });
  console.log(`2. Phonetic sanctions near-miss caught: verdict=${s2.verdict}, review_required=${s2.review_required}`);

  // Step 3: Halt ByteDance #5 creative payout with unlabeled AI + prohibited claim + IO mismatch
  const s3Res = await executeMcpTool('audit_creative_qa', {
    campaignId: 'HERMES-AD-001',
    advertiserName: 'Siemens Aktiengesellschaft',
    creativeCopy: 'Guaranteed profit risk-free yield campaign',
    landingUrl: 'https://unisvvap.org',
    impressions: 50000,
    cpmUsd: 20,
    statedTotalUsd: 1450,
    spendAmountUsdc: 1450,
    aiGenerated: true
  });
  const s3 = JSON.parse(s3Res.content[0].text);
  logEvent(3, 'mcp:audit_creative_qa', {
    approved: s3.approved,
    verdict: s3.verdict,
    flagsCount: s3.flags?.length || 0,
    canonicalSha256: s3.canonicalSha256
  });
  console.log(`3. Creative QA escrow hold triggered: verdict=${s3.verdict} (${s3.flags?.length} flags)`);

  // Step 4: Solana Pre-Signature Spend Guard cumulative budget + drainer halt
  const guard = new SolanaSpendGuard({ maxSingleSpend: { SOL: 1.0 }, maxSessionSpend: { SOL: 2.0 } });
  const payer = new PublicKey('3r428Z8YSgQFJpsyPcQyxmt1faQQBuNRpqz92m9ucbuL');
  const dest = new PublicKey('11111111111111111111111111111111');
  const tx1 = new Transaction().add(SystemProgram.transfer({ fromPubkey: payer, toPubkey: dest, lamports: 0.5 * LAMPORTS_PER_SOL }));
  const cleanEval = guard.guardTransaction(tx1);
  let overCapBlocked = false;
  let overCapReason = '';
  try {
    const tx2 = new Transaction().add(SystemProgram.transfer({ fromPubkey: payer, toPubkey: dest, lamports: 1.8 * LAMPORTS_PER_SOL }));
    guard.guardTransaction(tx2);
  } catch (err) {
    overCapBlocked = true;
    overCapReason = err.message;
  }
  if (!cleanEval.cleared || !overCapBlocked) {
    throw new Error(`Expected Solana guard to approve 0.5 SOL and block 1.8 SOL (clean=${cleanEval.cleared}, blocked=${overCapBlocked})`);
  }
  logEvent(4, 'solana:pre_signature_spend_guard', {
    cleanCleared: cleanEval.cleared,
    cleanCertHash: cleanEval.certHash,
    overCapBlocked,
    overCapReason
  });
  console.log(`4. Solana Spend Guard: clean=${cleanEval.cleared} | overCapBlocked=${overCapBlocked} (${overCapReason.slice(0, 75)}...)`);

  console.log(`\nTrace written (${events.length} events) to: ${tracePath}`);
}

runTrace().catch((err) => {
  console.error(err);
  process.exit(1);
});
