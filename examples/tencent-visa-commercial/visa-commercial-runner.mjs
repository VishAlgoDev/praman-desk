/**
 * Praman Desk - Visa Agentic Commerce & Budget-Capped Commercial Runner (#10 / #11)
 * Accepts a commercial diligence job, enforces strict machine-payment spend ceiling,
 * dispatches live Telegraph specialist verification calls, and returns exact P&L + receipt ledger.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  screenSanctions,
  lookupCorporateRegistry,
  reconcileInvoicePrimary,
  DIAMOND_PORT
} from '../../src/handlers.mjs';
import { getWasmInstance } from '../../comparator/wasm-buffer.mjs';
import { purchaseTelegraphSignal } from '../lib/telegraph-live-buyer.mjs';

const SPECIALIST_UNIT_PRICE_USDC = 0.01; // Verified Devnode & Sepolia Ledger fee per specialist call

export class VisaBudgetCapError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'VisaBudgetCapError';
    this.details = details;
  }
}

export async function runVisaCommercialJob(job) {
  const jobId = job.jobId || `VISA-JOB-${Date.now()}`;
  const grossRevenueUsd = Number(job.grossRevenueUsd ?? 25.0);
  const intelligenceBudgetUsd = Number(job.intelligenceBudgetUsd ?? 0.50);
  const steps = Array.isArray(job.steps) ? job.steps : [
    { intent: 'SANCTIONS_SCREENING_MATCH_GENERAL', vendor: job.vendor },
    { intent: 'CORPORATE_REGISTRY_LOOKUP_GENERAL', company: job.vendor },
    { intent: 'INVOICE_LEDGER_RECONCILE_GENERAL', invoiceAmount: job.invoiceAmount, poAmount: job.poAmount }
  ];

  let spentUsd = 0;
  const receiptLedger = [];

  for (const step of steps) {
    const stepCost = Number(step.unitPriceUsd ?? SPECIALIST_UNIT_PRICE_USDC);
    if (spentUsd + stepCost > intelligenceBudgetUsd + 1e-9) {
      throw new VisaBudgetCapError(
        `[VISA BUDGET GUARD] Halted before step ${step.intent}: projected cost $${(spentUsd + stepCost).toFixed(2)} exceeds cap $${intelligenceBudgetUsd.toFixed(2)}`,
        { jobId, spentUsd, attemptedCostUsd: stepCost, intelligenceBudgetUsd }
      );
    }

    let result;
    const liveBuyer = await purchaseTelegraphSignal({
      intent: step.intent,
      query: `[${step.intent}] Verify ${step.vendor || step.company || job.vendor} (${step.intent})`,
      live: Boolean(job.live)
    });

    if (step.intent === 'SANCTIONS_SCREENING_MATCH_GENERAL') {
      result = await screenSanctions({ name: step.vendor || job.vendor });
    } else if (step.intent === 'CORPORATE_REGISTRY_LOOKUP_GENERAL') {
      result = await lookupCorporateRegistry({ company: step.company || job.vendor });
    } else if (step.intent === 'INVOICE_LEDGER_RECONCILE_GENERAL') {
      const wasm = await getWasmInstance();
      const inv = Number(step.invoiceAmount ?? job.invoiceAmount ?? 0);
      const po = Number(step.poAmount ?? job.poAmount ?? 0);
      const rec = await reconcileInvoicePrimary({ invoice_amount: inv, po_amount: po });
      const wasmScore = wasm.scoreDeterministic(Math.round(po * 100), Math.round(inv * 100), 0, 0);
      result = { ...rec, wasmScore, exactMatch: wasmScore === 10000 };
    } else {
      result = { verified: false, note: 'Unsupported custom intent' };
    }

    spentUsd = Number((spentUsd + stepCost).toFixed(4));
    const localDigest = '0x' + crypto
      .createHash('sha256')
      .update(JSON.stringify({ jobId, intent: step.intent, spentUsd, result }))
      .digest('hex');

    receiptLedger.push({
      intent: step.intent,
      costUsdc: stepCost,
      diamondPort: DIAMOND_PORT,
      mode: liveBuyer.mode,
      simulated_offline: Boolean(liveBuyer.simulated_offline),
      rail: liveBuyer.rail || null,
      liveSettled: Boolean(liveBuyer.settled),
      receiptHash: liveBuyer.receiptHash || localDigest,
      signalHash: liveBuyer.signalHash || null,
      txHash: liveBuyer.txHash || null,
      resultSummary: result.verdict || result.status || (result.found ? `LEI:${result.registration_id}` : 'COMPLETED')
    });
  }

  const netProfitUsd = Number((grossRevenueUsd - spentUsd).toFixed(4));
  const grossMarginPct = grossRevenueUsd > 0 ? Number(((netProfitUsd / grossRevenueUsd) * 100).toFixed(2)) : 0;

  return {
    jobId,
    status: 'COMPLETED_WITHIN_CAP',
    vendor: job.vendor,
    pnl: {
      grossRevenueUsd,
      telegraphSpendUsd: spentUsd,
      intelligenceBudgetUsd,
      budgetHeadroomUsd: Number((intelligenceBudgetUsd - spentUsd).toFixed(4)),
      netProfitUsd,
      grossMarginPct
    },
    receiptLedger
  };
}

if (process.argv[1] && (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('visa-commercial-runner.mjs'))) {
  const out = await runVisaCommercialJob({
    jobId: 'VISA-COMM-2026-01',
    vendor: 'Siemens Aktiengesellschaft',
    grossRevenueUsd: 25.00,
    intelligenceBudgetUsd: 0.10,
    invoiceAmount: 10000,
    poAmount: 10000
  });
  assert.equal(out.status, 'COMPLETED_WITHIN_CAP');
  assert.equal(out.pnl.telegraphSpendUsd, 0.03);
  assert.equal(out.pnl.netProfitUsd, 24.97);
  console.log('[Visa #10/#11] Commercial Runner PASSED:', JSON.stringify(out.pnl));
}
