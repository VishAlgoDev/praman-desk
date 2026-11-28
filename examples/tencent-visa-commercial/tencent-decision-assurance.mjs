/**
 * Praman Desk - Tencent Agent Decision Assurance Adapter (#01 Pre-Spend, #02 Watchlist Monitor, #03 Post-Task Audit)
 * Zero extra UI needed: composes Two-Mind Spend Guard, OFAC 19,629 SDN RAM screen, GLEIF lookup, and 651-byte WASM arithmetic.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { investigateProcurement } from '../minds-spend-guard/investigator-mind.mjs';
import { reviewAndGateSpend } from '../minds-spend-guard/reviewer-mind.mjs';
import { screenSanctions, reconcileInvoicePrimary } from '../../src/handlers.mjs';
import { generateComplianceCertificate } from '../../src/certificate.mjs';
import { getWasmInstance } from '../../comparator/wasm-buffer.mjs';
import { verifyEnterpriseAgentOutput } from '../../src/intelligence/agent-output-verifier.mjs';
import { purchaseTelegraphSignal, isLiveTelegraphMode } from '../lib/telegraph-live-buyer.mjs';

export { verifyEnterpriseAgentOutput };

export async function runTencentDecisionAssurance(request, options = {}) {
  const auditTrail = [];
  const wantLive = isLiveTelegraphMode(options.live);

  // Stage #01: Pre-Spend Diligence & Escrow Clearance (Mind 1 + Mind 2)
  const caseFile = await investigateProcurement({ ...request, live: wantLive });
  const preSpendVerdict = await reviewAndGateSpend(caseFile);
  auditTrail.push({
    stage: '01_PRE_SPEND_GATE',
    verdict: preSpendVerdict.verdict,
    caseId: caseFile.caseId,
    caseDigest: caseFile.caseDigest,
    telegraphPurchase: caseFile.evidence?.telegraphPurchase || null,
    blockingFlags: preSpendVerdict.blockingFlags
  });

  if (preSpendVerdict.verdict !== 'APPROVE_PAYMENT') {
    return {
      approved: false,
      haltedAtStage: '01_PRE_SPEND_GATE',
      verdict: preSpendVerdict.verdict,
      reason: preSpendVerdict.primaryReason,
      auditTrail,
      receipt: null
    };
  }

  // Stage #02: Continuous Watchlist & Mid-Stream Delta Monitor
  const screenTarget = options.watchlistOverrideEntity || request.vendor;
  const watchlistDelta = await screenSanctions({ name: screenTarget });
  auditTrail.push({
    stage: '02_CONTINUOUS_WATCHLIST_MONITOR',
    target: screenTarget,
    matched: watchlistDelta.matched,
    matchCount: watchlistDelta.match_count ?? (watchlistDelta.matches?.length || 0)
  });

  if (watchlistDelta.matched) {
    const haltHash = '0x' + crypto.createHash('sha256').update(JSON.stringify({ stage: '02', target: screenTarget, halted: true })).digest('hex');
    return {
      approved: false,
      haltedAtStage: '02_CONTINUOUS_WATCHLIST_MONITOR',
      verdict: 'HALTED_WATCHLIST_DRIFT',
      reason: `Continuous monitor detected mid-stream sanctions match for "${screenTarget}". Escrow frozen before payout.`,
      certHash: haltHash,
      auditTrail,
      receipt: null
    };
  }

  // Stage #03: Post-Task Independent Verification (651-byte WASM Math + Agent Output Claim Decomposition + Optional Live Telegraph Receipt)
  const wasm = await getWasmInstance();
  const deliveredTotal = Number(options.deliveredAmount ?? request.totalAmount);
  const expectedTotal = Number(request.totalAmount);
  const mathCheck = await reconcileInvoicePrimary({
    invoice_amount: deliveredTotal,
    po_amount: expectedTotal
  });
  const wasmScore = wasm.scoreDeterministic(
    Math.round(expectedTotal * 100),
    Math.round(deliveredTotal * 100),
    0,
    0
  );
  const exactMatch = wasmScore === 10000;

  let claimAudit = null;
  if (request.agentOutput || options.agentOutput || request.iban || request.routingNumber || request.bin) {
    claimAudit = await verifyEnterpriseAgentOutput({
      model: request.model || 'tencent-hunyuan-enterprise-agent',
      vendor: request.vendor,
      domain: request.domain,
      recipientAddress: request.recipientAddress,
      country: request.country,
      claimedTotal: deliveredTotal,
      expectedTotal,
      currency: request.currency,
      settlementCurrency: request.settlementCurrency,
      claimedFxRate: request.claimedFxRate,
      iban: request.iban,
      routingNumber: request.routingNumber,
      bin: request.bin,
      agentOutput: options.agentOutput || request.agentOutput || ''
    }, { liveModel: Boolean(options.liveModel) });
  }

  let stage03Purchase = null;
  if (wantLive) {
    stage03Purchase = await purchaseTelegraphSignal({
      intent: 'INVOICE_LEDGER_RECONCILE_GENERAL',
      query: `[INVOICE_LEDGER_RECONCILE_GENERAL] Verify invoice ${request.invoiceNumber || 'INV'} total ${deliveredTotal} against PO ${expectedTotal}`,
      live: true
    });
  }

  const claimsPassed = claimAudit ? claimAudit.verdict === 'GO' : true;
  const postTaskPassed = exactMatch && claimsPassed;
  auditTrail.push({
    stage: '03_POST_TASK_VERIFICATION',
    expectedTotal,
    deliveredTotal,
    wasmScore,
    exactMatch,
    claimVerdict: claimAudit?.verdict || 'STRUCTURED_ONLY',
    claimMatrix: claimAudit?.claimMatrix || [],
    telegraphPurchase: stage03Purchase,
    reconcileVerdict: mathCheck.verdict || mathCheck.status,
    passed: postTaskPassed
  });

  if (!postTaskPassed) {
    const varianceHash = '0x' + crypto.createHash('sha256').update(JSON.stringify({ stage: '03', expectedTotal, deliveredTotal, claimVerdict: claimAudit?.verdict })).digest('hex');
    return {
      approved: false,
      haltedAtStage: '03_POST_TASK_VERIFICATION',
      verdict: !exactMatch ? 'POST_TASK_VARIANCE_HALT' : `POST_TASK_CLAIM_${claimAudit?.verdict || 'HALT'}`,
      reason: !exactMatch
        ? `Post-task independent check caught amount mismatch (${deliveredTotal} delivered vs ${expectedTotal} authorized).`
        : claimAudit?.summary || 'Post-task output verification flagged claim contradiction or missing evidence.',
      claimAudit,
      certHash: varianceHash,
      auditTrail,
      receipt: null
    };
  }

  const cert = await generateComplianceCertificate({
    entity: request.vendor,
    vendor: request.vendor,
    lei: caseFile.evidence?.corporateRegistry?.registration_id || 'W38RGI023J3WT1HWRP32',
    jurisdiction: request.country || 'DE',
    invoiceAmount: deliveredTotal,
    poAmount: expectedTotal,
    invoiceNumber: request.invoiceNumber,
    poNumber: request.poNumber || request.invoiceNumber
  });

  return {
    approved: true,
    haltedAtStage: null,
    verdict: 'SETTLED_AND_ATTESTED',
    certHash: cert.cryptographicSeal?.sealDigest || preSpendVerdict.escrowReceipt?.receiptHash,
    escrowReceipt: preSpendVerdict.escrowReceipt,
    certificate: cert,
    auditTrail
  };
}

if (process.argv[1] && (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('tencent-decision-assurance.mjs'))) {
  const cleanRes = await runTencentDecisionAssurance({
    invoiceNumber: 'INV-TC-2026-001',
    vendor: 'Siemens Aktiengesellschaft',
    country: 'DE',
    domain: 'siemens.com',
    recipientAddress: '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466',
    items: [{ description: 'Industrial Automation Gateway', quantity: 10, unitPrice: 840, lineTotal: 8400 }],
    currency: 'EUR',
    totalAmount: 8400
  });
  assert.equal(cleanRes.approved, true);
  assert.equal(cleanRes.verdict, 'SETTLED_AND_ATTESTED');
  assert.equal(cleanRes.auditTrail.length, 3);
  console.log('[Tencent #01/#02/#03] Clean 3-stage assurance PASSED:', cleanRes.certHash);
}
