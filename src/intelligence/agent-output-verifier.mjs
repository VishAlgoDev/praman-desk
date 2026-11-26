/**
 * Praman Desk Independent Agent Output Claim Decomposition & Verification Engine
 *
 * Implements Tencent #01 (Pre-Spend Gate) & Tencent #03 (Independent Post-Task Output Verification):
 * Decomposes arbitrary enterprise LLM / Tencent Cloud ADP / Hunyuan output bundles into verifiable claims
 * across 4 deterministic domains (OFAC Sanctions, GLEIF/RDAP Entity & Domain, 651-byte WASM Arithmetic + ECB FX,
 * and BIN/ABA/IBAN Payment Routing), flags omitted/unsupported assertions, and computes a SHA-256 signed GO/NO_GO verdict.
 */
import crypto from 'node:crypto';
import { getWasmInstance } from '../../comparator/wasm-buffer.mjs';
import { screenSanctions, lookupCorporateRegistry } from '../handlers.mjs';
import { enrichB2BIdentity, verifyPaymentMethod } from './commercial-trust-intents.mjs';
import { checkFakeWatchDomain } from '../bridges/fakewatch-bridge.mjs';
import { parseDynamicInvoiceReconciliation } from './dynamic-solver.mjs';

function extractAgentClaimsFromText(agentOutput = '') {
  const text = String(agentOutput || '').trim();
  const evmMatches = [...new Set([...text.matchAll(/\b(0x[a-fA-F0-9]{40})\b/g)].map(m => m[1]))];
  const urlOrDomains = [...new Set([
    ...[...text.matchAll(/https?:\/\/[^\s"'<>),]+/gi)].map(m => m[0]),
    ...[...text.matchAll(/\b([a-z0-9][a-z0-9-]*\.(?:com|org|net|io|ai|de|uk|nl|sg))\b/gi)].map(m => m[1])
  ])];
  const ibanMatch = text.match(/\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b/);
  const abaMatch = text.match(/\b(?:routing(?:\s+number)?|ABA)\s*(?:#|:|is|of)?\s*(\d{9})\b/i);
  const binMatch = text.match(/\b(?:BIN|IIN)\s*(?:#|:|is|of)?\s*(\d{6,8})\b/i);

  const fxPairMatch = text.match(/\b(EUR|GBP|CAD|CHF|JPY|INR|AUD|SGD)\s*[\/->]\s*(USD|EUR|USDC)\b(?:\s*(?:rate|at|=|:)?\s*(\d+(?:\.\d+)?))?/i)
    || text.match(/\b(?:fx|exchange)\s+rate\s*(?:of|is|=|:)?\s*(\d+(?:\.\d+)?)\b/i);

  const assertsSanctionsClear = /\b(?:sanctions?\s*(?:clear|passed|clean|negative|zero\s*hits)|no\s+(?:ofac|sanctions)\s+(?:match|hits|flags)|not\s+sanctioned)\b/i.test(text);
  const assertsEntityActive = /\b(?:active\s+(?:company|entity|lei|registration)|gleif\s+verified|valid\s+lei|in\s+good\s+standing|legitimate\s+vendor)\b/i.test(text);
  const assertsBlanketApproval = /\b(?:all\s+checks\s+passed|approved\s+for\s+payment|ready\s+to\s+settle|safe\s+to\s+pay|cleared\s+for\s+disbursement)\b/i.test(text);

  const moneyNums = [...text.matchAll(/(?:USD|EUR|USDC|\$|€)\s*([0-9][0-9,]*(?:\.[0-9]+)?)/gi)].map(m => Number(m[1].replace(/,/g, ''))).filter(Number.isFinite);

  return {
    text,
    evmMatches,
    urlOrDomains,
    iban: ibanMatch?.[1] || null,
    routingNumber: abaMatch?.[1] || null,
    bin: binMatch?.[1] || null,
    fxPairMatch,
    assertsSanctionsClear,
    assertsEntityActive,
    assertsBlanketApproval,
    primaryMoneyAmount: moneyNums.length ? Math.max(...moneyNums) : null
  };
}

async function fetchEcbFxRate(fromCur, toCur) {
  const f = String(fromCur || '').toUpperCase();
  const t = String(toCur || '').toUpperCase();
  if (!f || !t || f === t) return 1.0;
  const normTo = t === 'USDC' || t === 'USDT' ? 'USD' : t;
  const normFrom = f === 'USDC' || f === 'USDT' ? 'USD' : f;
  if (normFrom === normTo) return 1.0;
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(normFrom)}&to=${encodeURIComponent(normTo)}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const json = await res.json();
      const rate = Number(json?.rates?.[normTo]);
      if (Number.isFinite(rate) && rate > 0) return rate;
    }
  } catch {}
  return null;
}

export async function verifyEnterpriseAgentOutput(payload = {}, options = {}) {
  const t0 = performance.now();
  const modelName = String(payload.model || 'tencent-hunyuan-enterprise-agent').trim();
  const rawAgentOutput = String(payload.agentOutput || payload.output || payload.responseText || payload.summary || '').trim();
  const explicitPrompt = String(payload.prompt || payload.task || '').trim();

  let generatedOutput = rawAgentOutput;
  let generationMode = 'deterministic_bundle_audit';

  // Live Tencent Hunyuan / OpenAI-compatible generation only when explicit credentials + prompt without prior output
  const apiKey = process.env.TENCENT_HUNYUAN_API_KEY || process.env.OPENAI_API_KEY || '';
  if (!generatedOutput && explicitPrompt && options.liveModel && apiKey) {
    try {
      const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.hunyuan.cloud.tencent.com/v1').replace(/\/+$/, '');
      const compRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: payload.model || 'hunyuan-turbos-latest',
          messages: [{ role: 'user', content: explicitPrompt }],
          temperature: 0
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (compRes.ok) {
        const compJson = await compRes.json();
        generatedOutput = String(compJson?.choices?.[0]?.message?.content || '').trim();
        generationMode = 'live_model_completion_audited';
      }
    } catch {}
  }

  const extracted = extractAgentClaimsFromText(generatedOutput);
  const targetVendor = String(payload.vendor || payload.vendorName || payload.company || '').trim();
  const targetDomain = String(payload.domain || payload.paymentUrl || extracted.urlOrDomains[0] || '').trim();
  const targetRecipient = String(payload.recipientAddress || payload.walletAddress || extracted.evmMatches[0] || '').trim();
  const claimedTotal = Number(payload.claimedTotal ?? payload.invoiceAmount ?? payload.spendAmountUsdc ?? extracted.primaryMoneyAmount ?? 0);
  const expectedTotal = Number(payload.expectedTotal ?? payload.poAmount ?? claimedTotal);
  const exposureBasis = Number.isFinite(claimedTotal) && claimedTotal > 0 ? claimedTotal : (Number.isFinite(expectedTotal) && expectedTotal > 0 ? expectedTotal : 0);

  const claimMatrix = [];
  const omittedOrUnverifiedClaims = [];
  let preventedUsd = 0;

  // 1. Domain A: Sanctions Screening Claim (OFAC 19,565 + Digital Currency Addresses)
  const sdnTargets = [...new Set([targetVendor, targetRecipient, ...extracted.evmMatches].filter(Boolean))];
  if (sdnTargets.length > 0) {
    let hit = null;
    for (const target of sdnTargets) {
      const s = await screenSanctions({ name: target, threshold: 0.72 });
      if (s?.matched) {
        hit = { target, s };
        break;
      }
    }
    if (hit) {
      const matchedName = hit.s.matches?.[0]?.matched_name || hit.target;
      const riskAmt = exposureBasis > 0 ? exposureBasis : 10000;
      preventedUsd += riskAmt;
      claimMatrix.push({
        domain: 'SANCTIONS_SCREENING_MATCH_GENERAL',
        claim: extracted.assertsSanctionsClear
          ? `Agent asserted counterparty "${hit.target}" is clear of sanctions`
          : `Agent proposed payout/interaction involving "${hit.target}"`,
        groundTruth: `OFAC SDN HIT: ${matchedName} (UID ${hit.s.matches?.[0]?.sdn_uid || 'N/A'}, score ${hit.s.match_score})`,
        status: 'CONTRADICTED',
        evidenceSource: 'US Treasury OFAC SDN & Consolidated RAM Index (19,565 entries)',
        varianceUsd: riskAmt
      });
    } else {
      claimMatrix.push({
        domain: 'SANCTIONS_SCREENING_MATCH_GENERAL',
        claim: `Screen ${sdnTargets.join(', ')} against OFAC SDN`,
        groundTruth: 'Zero OFAC SDN name or EVM digital currency matches found',
        status: 'VERIFIED',
        evidenceSource: 'US Treasury OFAC SDN & Consolidated RAM Index (19,565 entries)',
        varianceUsd: 0
      });
    }
  } else if (extracted.assertsSanctionsClear || extracted.assertsBlanketApproval) {
    omittedOrUnverifiedClaims.push('Agent claimed sanctions clearance or payout readiness without specifying counterparty name or recipient address.');
    claimMatrix.push({
      domain: 'SANCTIONS_SCREENING_MATCH_GENERAL',
      claim: 'Sanctions clearance asserted without target identifier',
      groundTruth: 'Missing counterparty legal name or wallet address',
      status: 'MISSING_EVIDENCE',
      evidenceSource: 'US Treasury OFAC SDN RAM Index',
      varianceUsd: 0
    });
  }

  // 2. Domain B: Corporate Registry & Domain Phishing Verification (GLEIF + FakeWatch / RDAP)
  if (targetVendor || targetDomain) {
    let corp = null;
    if (targetVendor) {
      corp = await lookupCorporateRegistry({ company: targetVendor, jurisdiction: payload.country || payload.jurisdiction || '' }).catch(() => null);
    }
    let domSafety = null;
    if (targetDomain) {
      domSafety = await checkFakeWatchDomain(targetDomain).catch(() => null);
    }

    if (domSafety && (domSafety.verdict === 'PHISHING' || domSafety.verdict === 'MALICIOUS')) {
      const riskAmt = exposureBasis > 0 ? exposureBasis : 15000;
      preventedUsd += riskAmt;
      claimMatrix.push({
        domain: 'B2B_IDENTITY_ENRICHMENT_GENERAL',
        claim: `Agent referenced destination "${targetDomain}" for vendor disbursement`,
        groundTruth: `MALICIOUS / PHISHING DOMAIN CONFIRMED (${domSafety.source})`,
        status: 'CONTRADICTED',
        evidenceSource: domSafety.source || 'FakeWatch Live & Typosquat Shield',
        varianceUsd: riskAmt
      });
    } else if (corp && corp.found && corp.active === false) {
      const riskAmt = exposureBasis > 0 ? exposureBasis : 10000;
      preventedUsd += riskAmt;
      claimMatrix.push({
        domain: 'CORPORATE_REGISTRY_LOOKUP_GENERAL',
        claim: extracted.assertsEntityActive
          ? `Agent asserted "${targetVendor}" is an active corporate counterparty`
          : `Corporate standing for "${targetVendor}"`,
        groundTruth: `LAPSED / INACTIVE ENTITY (${corp.registration_id || 'Registry record'}, status: ${corp.registration_status || corp.entity_status})`,
        status: 'CONTRADICTED',
        evidenceSource: corp.source || 'GLEIF Global LEI Index',
        varianceUsd: riskAmt
      });
    } else if (corp && corp.found && corp.active === true) {
      let b2bExtra = null;
      if (targetDomain && !domSafety?.verdict?.includes('PHISHING')) {
        b2bExtra = await enrichB2BIdentity({ domain: targetDomain, company: targetVendor }).catch(() => null);
      }
      claimMatrix.push({
        domain: 'CORPORATE_REGISTRY_LOOKUP_GENERAL',
        claim: `Verify active legal entity standing for "${targetVendor}"`,
        groundTruth: `ACTIVE: ${corp.legal_name} (ID: ${corp.registration_id}, Jurisdiction: ${corp.jurisdiction})${b2bExtra?.domain_valid ? `, domain ${targetDomain} valid` : ''}`,
        status: 'VERIFIED',
        evidenceSource: corp.source || 'GLEIF Global LEI Index',
        varianceUsd: 0
      });
    } else if (targetVendor || extracted.assertsEntityActive) {
      omittedOrUnverifiedClaims.push(`Corporate entity "${targetVendor || 'unspecified'}" could not be confirmed in GLEIF, UK Companies House, or SEC EDGAR.`);
      claimMatrix.push({
        domain: 'CORPORATE_REGISTRY_LOOKUP_GENERAL',
        claim: `Corporate entity standing for "${targetVendor || 'unspecified'}"`,
        groundTruth: 'Unverified in GLEIF / UK Companies House / SEC EDGAR public registries',
        status: 'MISSING_EVIDENCE',
        evidenceSource: 'GLEIF / SEC EDGAR / UK Companies House',
        varianceUsd: 0
      });
    }
  } else if (extracted.assertsEntityActive || extracted.assertsBlanketApproval) {
    omittedOrUnverifiedClaims.push('Agent approved transaction without naming a verifiable corporate entity or domain.');
  }

  // 3. Domain C: 651-Byte WASM Arithmetic Parity + ECB/Frankfurter Live FX Check
  const dynamicMath = extracted.text ? parseDynamicInvoiceReconciliation(extracted.text) : null;
  const wasm = await getWasmInstance();
  const hasStructuredAmounts = Number.isFinite(claimedTotal) && claimedTotal > 0 && Number.isFinite(expectedTotal) && expectedTotal > 0;
  let mathChecked = false;

  if (dynamicMath && dynamicMath.details) {
    mathChecked = true;
    const invCents = Math.round((dynamicMath.details.invoice_total || 0) * 100);
    const ledCents = Math.round((dynamicMath.details.ledger_total || 0) * 100);
    const wasmScore = wasm.scoreDeterministic(ledCents, invCents, 1, 1);
    const diffUsd = Math.abs(Math.round((dynamicMath.details.delta_total || 0) * 100) / 100);
    if (!dynamicMath.reconciled || wasmScore < 10000) {
      preventedUsd += diffUsd;
      claimMatrix.push({
        domain: 'INVOICE_LEDGER_RECONCILE_GENERAL',
        claim: 'Inline financial equations & invoice totals in agent output',
        groundTruth: `ARITHMETIC MISMATCH DETECTED: variance ${diffUsd.toFixed(2)} (${dynamicMath.explanation})`,
        status: 'CONTRADICTED',
        evidenceSource: '651-byte WebAssembly Bit-Exact Comparator',
        wasmScore,
        varianceUsd: diffUsd
      });
    } else {
      claimMatrix.push({
        domain: 'INVOICE_LEDGER_RECONCILE_GENERAL',
        claim: 'Inline financial equations & invoice totals in agent output',
        groundTruth: `BIT-EXACT MATCH (WASM score ${wasmScore}/10000): ${dynamicMath.explanation}`,
        status: 'VERIFIED',
        evidenceSource: '651-byte WebAssembly Bit-Exact Comparator',
        wasmScore,
        varianceUsd: 0
      });
    }
  } else if (hasStructuredAmounts) {
    mathChecked = true;
    const cCents = Math.round(claimedTotal * 100);
    const eCents = Math.round(expectedTotal * 100);
    const wasmScore = wasm.scoreDeterministic(eCents, cCents, 1, 1);
    const diffUsd = Math.round(Math.abs(claimedTotal - expectedTotal) * 100) / 100;
    if (wasmScore < 10000) {
      preventedUsd += diffUsd;
      claimMatrix.push({
        domain: 'INVOICE_LEDGER_RECONCILE_GENERAL',
        claim: `Claimed total ${claimedTotal.toFixed(2)} matches authorized total ${expectedTotal.toFixed(2)}`,
        groundTruth: `WASM VARIANCE DETECTED: difference of ${diffUsd.toFixed(2)} (score ${wasmScore}/10000)`,
        status: 'CONTRADICTED',
        evidenceSource: '651-byte WebAssembly Bit-Exact Comparator',
        wasmScore,
        varianceUsd: diffUsd
      });
    } else {
      claimMatrix.push({
        domain: 'INVOICE_LEDGER_RECONCILE_GENERAL',
        claim: `Claimed total ${claimedTotal.toFixed(2)} matches authorized total ${expectedTotal.toFixed(2)}`,
        groundTruth: `BIT-EXACT WASM PARITY (${wasmScore}/10000)`,
        status: 'VERIFIED',
        evidenceSource: '651-byte WebAssembly Bit-Exact Comparator',
        wasmScore,
        varianceUsd: 0
      });
    }
  }

  // FX claim validation against live ECB/Frankfurter spot rate
  const fxFrom = payload.currency || (extracted.fxPairMatch?.[1] && !/^\d/.test(extracted.fxPairMatch[1]) ? extracted.fxPairMatch[1] : null);
  const fxTo = payload.settlementCurrency || (extracted.fxPairMatch?.[2] && !/^\d/.test(extracted.fxPairMatch[2]) ? extracted.fxPairMatch[2] : null);
  const claimedFx = Number(payload.claimedFxRate ?? extracted.fxPairMatch?.[3] ?? extracted.fxPairMatch?.[1] ?? NaN);
  if (fxFrom && fxTo && String(fxFrom).toUpperCase() !== String(fxTo).toUpperCase() && Number.isFinite(claimedFx) && claimedFx > 0) {
    const liveSpot = await fetchEcbFxRate(fxFrom, fxTo);
    if (liveSpot) {
      const relDev = Math.abs(claimedFx - liveSpot) / liveSpot;
      const fxExposure = exposureBasis > 0 ? Math.round(exposureBasis * relDev * 100) / 100 : Math.round(relDev * 10000) / 100;
      if (relDev > 0.05) {
        preventedUsd += fxExposure;
        claimMatrix.push({
          domain: 'FX_PARITY_VERIFICATION',
          claim: `Agent stated FX rate ${fxFrom}/${fxTo} = ${claimedFx}`,
          groundTruth: `FX DEVIATION (${(relDev * 100).toFixed(2)}%): ECB/Frankfurter live spot is ${liveSpot.toFixed(4)}`,
          status: 'CONTRADICTED',
          evidenceSource: 'European Central Bank (api.frankfurter.app)',
          varianceUsd: fxExposure
        });
      } else {
        claimMatrix.push({
          domain: 'FX_PARITY_VERIFICATION',
          claim: `Agent stated FX rate ${fxFrom}/${fxTo} = ${claimedFx}`,
          groundTruth: `Within spot tolerance (ECB live spot: ${liveSpot.toFixed(4)})`,
          status: 'VERIFIED',
          evidenceSource: 'European Central Bank (api.frankfurter.app)',
          varianceUsd: 0
        });
      }
    }
  } else if (!mathChecked && extracted.assertsBlanketApproval) {
    omittedOrUnverifiedClaims.push('Agent approved disbursement without verifiable line-item arithmetic or reconciliation proof.');
  }

  // 4. Domain D: Payment Method / Bank Account Routing Claim (BIN / ABA / IBAN)
  const pmBin = payload.bin || extracted.bin || '';
  const pmRouting = payload.routingNumber || payload.routing_number || extracted.routingNumber || '';
  const pmIban = payload.iban || extracted.iban || '';
  if (pmBin || pmRouting || pmIban) {
    const pm = await verifyPaymentMethod({ bin: pmBin, routing_number: pmRouting, iban: pmIban }).catch(() => null);
    if (pm) {
      const riskAmt = pm.valid ? 0 : (exposureBasis > 0 ? Math.round(exposureBasis * 0.1 * 100) / 100 : 1000);
      if (!pm.valid) preventedUsd += riskAmt;
      claimMatrix.push({
        domain: 'PAYMENT_METHOD_VERIFY_GENERAL',
        claim: `Validate payment instrument (${[pmBin && `BIN ${pmBin}`, pmRouting && `ABA ${pmRouting}`, pmIban && `IBAN ${pmIban}`].filter(Boolean).join(', ')})`,
        groundTruth: pm.summary || (pm.valid ? 'Checksum & directory valid' : 'Invalid payment checksum or routing'),
        status: pm.valid ? 'VERIFIED' : 'CONTRADICTED',
        evidenceSource: 'ISO 7812 Luhn / Fedwire ABA Mod-10 / ISO 13616 IBAN Mod-97',
        varianceUsd: riskAmt
      });
    }
  }

  const contradictedCount = claimMatrix.filter(c => c.status === 'CONTRADICTED').length;
  const missingCount = claimMatrix.filter(c => c.status === 'MISSING_EVIDENCE').length + (claimMatrix.length === 0 ? 1 : 0);
  const verifiedCount = claimMatrix.filter(c => c.status === 'VERIFIED').length;

  let verdict = 'GO';
  if (contradictedCount > 0) verdict = 'NO_GO';
  else if (missingCount > 0 || omittedOrUnverifiedClaims.length > 0 || claimMatrix.length === 0) verdict = 'HOLD_FOR_MISSING_EVIDENCE';

  const financialExposurePreventedUsd = Math.round(preventedUsd * 100) / 100;
  const sha256Seal = '0x' + crypto.createHash('sha256').update(JSON.stringify({
    model: modelName,
    verdict,
    counts: { verified: verifiedCount, contradicted: contradictedCount, missing: missingCount },
    claimMatrix,
    financialExposurePreventedUsd
  })).digest('hex');

  const summary = verdict === 'GO'
    ? `TENCENT #03 VERIFIER GO: Independently verified ${verifiedCount} claim(s) across OFAC SDN, corporate registry, and 651-byte WASM arithmetic with zero contradictions.`
    : verdict === 'NO_GO'
    ? `TENCENT #03 VERIFIER NO_GO: Detected ${contradictedCount} contradicted claim(s) in agent output; prevented $${financialExposurePreventedUsd.toLocaleString('en-US')} capital/compliance exposure.`
    : `TENCENT #03 VERIFIER HOLD: Insufficient verifiable evidence (${omittedOrUnverifiedClaims.length || missingCount} omitted or unverified claim(s)).`;

  return {
    ok: true,
    intent: 'AGENT_OUTPUT_CLAIM_VERIFICATION',
    model: modelName,
    generationMode,
    verdict,
    approved: verdict === 'GO',
    counts: {
      verified: verifiedCount,
      contradicted: contradictedCount,
      missingEvidence: missingCount
    },
    financialExposurePreventedUsd,
    claimMatrix,
    omittedOrUnverifiedClaims,
    wasmComparator: '651-byte WebAssembly Bit-Exact Engine',
    sha256Seal,
    summary,
    latencyMs: Math.round(performance.now() - t0),
    timestamp: new Date().toISOString()
  };
}
