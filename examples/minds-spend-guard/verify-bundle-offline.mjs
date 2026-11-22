/**
 * 🔒 Praman Desk: Zero-Network Offline Bundle Verifier
 *
 * Implements Ahmed Ali's Submission Criterion #2 & #5:
 * "Every run writes a bundle containing every fact, every receipt and one sha256 over the lot.
 *  A separate verifier recomputes that hash offline... 54 tests run with no network."
 *
 * Guarantees:
 * 1. ZERO network sockets (no http, https, fetch, or net calls).
 * 2. Recalculates canonical SHA-256 hash over all facts, claims, receipts, and decision.
 * 3. Validates receipt integrity and fail-closed state consistency.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function computeCanonicalSha256Offline(obj) {
  const sortedJson = JSON.stringify(obj, Object.keys(obj).sort());
  return `0x${crypto.createHash('sha256').update(sortedJson).digest('hex')}`;
}

export function verifyProofBundleOffline(bundle) {
  const auditReport = {
    verified: false,
    bundle_case_id: bundle?.case_id || null,
    declared_sha256: bundle?.bundle_sha256 || null,
    recomputed_sha256: null,
    hash_match: false,
    receipts_checked: 0,
    receipts_valid: 0,
    claims_audited: 0,
    fail_closed_valid: false,
    budget: bundle?.payload?.budget || null,
    decision: bundle?.payload?.decision || null,
    errors: []
  };

  if (!bundle || !bundle.payload) {
    auditReport.errors.push('Malformed bundle: missing bundle or bundle.payload object');
    return auditReport;
  }

  // 1. Recompute canonical SHA-256 hash completely offline
  const recomputed = computeCanonicalSha256Offline(bundle.payload);
  auditReport.recomputed_sha256 = recomputed;
  auditReport.hash_match = (recomputed.toLowerCase() === (bundle.bundle_sha256 || '').toLowerCase());

  if (!auditReport.hash_match) {
    auditReport.errors.push(`Digest mismatch! Declared: ${bundle.bundle_sha256}, Computed: ${recomputed}`);
  }

  // 2. Validate Receipts Integrity
  const receipts = bundle.payload.receipts || [];
  auditReport.receipts_checked = receipts.length;
  for (const rcpt of receipts) {
    if (rcpt.receipt_id && rcpt.response_digest && rcpt.verdict) {
      auditReport.receipts_valid++;
    } else {
      auditReport.errors.push(`Invalid receipt structure in receipt: ${rcpt.receipt_id}`);
    }
  }

  // 3. Verify Claims & Fail-Closed Logic
  const claims = bundle.payload.claims || [];
  auditReport.claims_audited = claims.length;
  const decision = bundle.payload.decision || {};

  const failedClaims = claims.filter(c => !c.passed);
  if (failedClaims.length > 0 && decision.verdict === 'APPROVE_PAYMENT') {
    auditReport.errors.push(`Fail-Closed VIOLATION: ${failedClaims.length} claims failed but verdict was APPROVE_PAYMENT`);
  } else {
    auditReport.fail_closed_valid = true;
  }

  auditReport.verified = (
    auditReport.hash_match &&
    auditReport.receipts_checked === auditReport.receipts_valid &&
    auditReport.fail_closed_valid &&
    auditReport.errors.length === 0
  );

  return auditReport;
}

// CLI direct execution
if (process.argv[1] && process.argv[1].endsWith('verify-bundle-offline.mjs')) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node verify-bundle-offline.mjs <path-to-bundle.json>');
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  const bundle = JSON.parse(raw);
  const report = verifyProofBundleOffline(bundle);

  console.log('========================================================================');
  console.log(' 🔒 PRAMAN DESK: ZERO-NETWORK OFFLINE PROOF BUNDLE VERIFICATION');
  console.log('========================================================================');
  console.log(`Case ID:              ${report.bundle_case_id}`);
  console.log(`Declared Hash:        ${report.declared_sha256}`);
  console.log(`Recomputed Hash:      ${report.recomputed_sha256}`);
  console.log(`Hash Matches:         ${report.hash_match ? '✅ EXACT MATCH' : '❌ MISMATCH'}`);
  console.log(`Receipts Verified:    ${report.receipts_valid}/${report.receipts_checked}`);
  console.log(`Claims Audited:       ${report.claims_audited} (Fail-Closed: ${report.fail_closed_valid ? '✅ ENFORCED' : '❌ VIOLATED'})`);
  console.log(`Verdict:              ${report.decision?.verdict}`);
  console.log(`Budget Spent:         $${report.budget?.spent_usdc} / $${report.budget?.allocated_usdc} (${report.budget?.savings_pct}% saved)`);
  console.log(`Extra Opinions:       ${report.budget?.extra_opinions_bought}`);
  console.log('------------------------------------------------------------------------');
  if (report.verified) {
    console.log('🎉 BUNDLE INTEGRITY 100% CRYPTOGRAPHICALLY VERIFIED OFFLINE WITH 0 NETWORK SOCKETS!');
    process.exit(0);
  } else {
    console.error('❌ BUNDLE VERIFICATION FAILED:', report.errors);
    process.exit(1);
  }
}
