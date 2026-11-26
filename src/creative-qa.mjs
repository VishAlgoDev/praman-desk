/**
 * ByteDance Use Case #5 — Independent Creative Quality Assurance (Greenfield Implementation)
 *
 * Pre-payout brand safety, regulatory disclosure, phishing landing-URL vetting,
 * sponsor KYB (GLEIF LEI + OFAC SDN), and 651-byte WASM insertion-order arithmetic gate
 * before ad-campaign escrow disbursement.
 */

import crypto from 'node:crypto';
import { getWasmInstance } from '../comparator/wasm-buffer.mjs';

const PROHIBITED_CLAIM_PATTERNS = [
  { code: 'PROHIBITED_GUARANTEED_RETURNS', regex: /\b(?:guaranteed\s+(?:profit|return|roi|income)|risk[-\s]?free\s+(?:return|profit|yield)|100%\s+guaranteed\s+returns?)\b/i, msg: 'Prohibited unsubstantiated financial guarantee claim' },
  { code: 'PROHIBITED_MEDICAL_MIRACLE_CLAIM', regex: /\b(?:100%\s+cure|miracle\s+cure|cures?\s+(?:cancer|diabetes|alzheimer)|clinically\s+proven\s+to\s+cure)\b/i, msg: 'Prohibited unverified medical cure claim' },
  { code: 'MISLEADING_GOVERNMENT_ENDORSEMENT', regex: /\b(?:fda\s+approved\s+supplement|government\s+endorsed\s+investment|sec\s+approved\s+token)\b/i, msg: 'Misleading regulatory or government endorsement claim' }
];

const RESTRICTED_CATEGORY_REGEX = /\b(?:crypto\s+leverage|binary\s+options|unlicensed\s+gambling|online\s+casino|prescription\s+opioid)\b/i;

export async function evaluateCreativeQa(payload = {}, deps = {}) {
  const {
    screenSanctions,
    lookupCorporateRegistry,
    checkFakeWatchDomain
  } = deps;

  if (!screenSanctions || !lookupCorporateRegistry || !checkFakeWatchDomain) {
    throw new Error('Creative QA requires screenSanctions, lookupCorporateRegistry, and checkFakeWatchDomain dependencies.');
  }

  const p = payload && typeof payload === 'object' ? payload : {};
  const campaignId = String(p.campaignId || p.campaign_id || `CAMP-${Date.now().toString(36).toUpperCase()}`).trim();
  const advertiserName = String(p.advertiserName || p.advertiser || p.sponsor || p.vendorName || '').trim();
  const payoutAddress = String(p.payoutAddress || p.recipientAddress || p.wallet || '').trim();
  const landingUrl = String(p.landingUrl || p.landing_url || p.ctaUrl || p.url || '').trim();
  const region = String(p.region || p.market || 'GLOBAL').trim().toUpperCase();
  const creativeTitle = String(p.creativeTitle || p.title || '').trim();
  const creativeCopy = String(p.creativeCopy || p.copy || p.script || p.caption || '').trim();
  const combinedCopy = `${creativeTitle} ${creativeCopy}`.trim();

  const isSponsored = p.isSponsored !== false;
  const hasSponsoredDisclosure = Boolean(
    p.sponsoredDisclosurePresent ??
    p.disclosurePresent ??
    /(?:#ad\b|#sponsored\b|paid\s+partnership|sponsored\s+by|advertisement\b)/i.test(combinedCopy)
  );
  const aiGenerated = Boolean(p.aiGenerated ?? p.syntheticMedia ?? false);
  const hasAiDisclosure = Boolean(
    p.aiDisclosurePresent ??
    /(?:ai[-\s]?generated|synthetic\s+media|created\s+with\s+ai|made\s+with\s+ai|virtual\s+creator)/i.test(combinedCopy)
  );

  // Numerical Insertion Order validation (either impressions * cpmUsd / 1000 or direct spendAmountUsdc)
  const rawSpend = p.spendAmountUsdc ?? p.mediaBudgetUsd ?? p.budgetUsd ?? p.statedTotalUsd;
  const spendAmountUsdc = rawSpend !== undefined && rawSpend !== null && rawSpend !== '' ? Number(rawSpend) : 0;
  const singleCapUsd = Number(p.singleCapUsd ?? p.approvalCapUsd ?? 5000);
  const impressions = p.impressions !== undefined && p.impressions !== null && p.impressions !== '' ? Number(p.impressions) : null;
  const cpmUsd = p.cpmUsd !== undefined && p.cpmUsd !== null && p.cpmUsd !== '' ? Number(p.cpmUsd) : null;
  const statedTotalUsd = p.statedTotalUsd !== undefined && p.statedTotalUsd !== null && p.statedTotalUsd !== ''
    ? Number(p.statedTotalUsd)
    : spendAmountUsdc;

  const flags = [];
  const checks = [];

  if (!advertiserName) {
    flags.push('MISSING_ADVERTISER_ENTITY: Sponsor legal entity name required for KYB vetting');
  }
  if (!combinedCopy) {
    flags.push('MISSING_CREATIVE_COPY: Creative script, headline, or caption payload is empty');
  }
  if (!Number.isFinite(spendAmountUsdc) || spendAmountUsdc <= 0) {
    flags.push('INVALID_CAMPAIGN_BUDGET: Positive campaign spendAmountUsdc required');
  }

  // Parallel Sponsor Sanctions + Corporate LEI + Phishing URL check
  const [sanctionsRes, addrSanctionsRes, corpRes, urlRes] = await Promise.all([
    advertiserName ? screenSanctions({ name: advertiserName }) : Promise.resolve({ matched: false, near_miss: false }),
    payoutAddress ? screenSanctions({ name: payoutAddress }) : Promise.resolve({ matched: false, near_miss: false }),
    advertiserName ? lookupCorporateRegistry({ company: advertiserName }) : Promise.resolve(null),
    landingUrl ? checkFakeWatchDomain(landingUrl) : Promise.resolve(null)
  ]);

  if (sanctionsRes?.matched) {
    flags.push(`SANCTIONED_ADVERTISER: "${advertiserName}" matches OFAC SDN (${sanctionsRes.matches?.[0]?.matched_name || 'SDN Entry'})`);
  } else if (sanctionsRes?.near_miss) {
    flags.push(`ADVERTISER_SANCTIONS_NEAR_MISS: "${advertiserName}" triggered phonetic near-miss review (${sanctionsRes.potential_matches?.[0]?.matched_name || 'SDN Candidate'})`);
  }
  if (addrSanctionsRes?.matched) {
    flags.push(`SANCTIONED_PAYOUT_WALLET: ${payoutAddress} is on US Treasury OFAC SDN digital currency list`);
  }

  const gleifVerified = Boolean(corpRes && (corpRes.found || corpRes.active));
  if (advertiserName && !gleifVerified) {
    flags.push(`UNVERIFIED_ADVERTISER_KYB: "${advertiserName}" failed GLEIF/Registry verification`);
  }
  checks.push({
    pillar: 'Advertiser KYB & OFAC SDN',
    passed: Boolean(advertiserName && gleifVerified && !sanctionsRes?.matched && !sanctionsRes?.near_miss && !addrSanctionsRes?.matched),
    detail: gleifVerified
      ? `${corpRes.legal_name || advertiserName} (LEI ${corpRes.registration_id || 'Verified'}, ${corpRes.jurisdiction || region}) · OFAC Clear`
      : 'Advertiser entity unverified or sanctions flagged'
  });

  if (landingUrl && urlRes) {
    if (urlRes.verdict === 'PHISHING' || urlRes.verdict === 'MALICIOUS') {
      flags.push(`MALICIOUS_LANDING_URL: CTA destination (${urlRes.domain || landingUrl}) flagged ${urlRes.verdict} by FakeWatch`);
    } else if (urlRes.verdict === 'UNKNOWN' || urlRes.verdict === 'Unavailable') {
      flags.push(`UNVERIFIED_LANDING_URL: CTA destination (${urlRes.domain || landingUrl}) lacks clean whitelist attestation`);
    }
    checks.push({
      pillar: 'CTA / Landing URL Reputation',
      passed: urlRes.verdict === 'SAFE',
      detail: `${urlRes.domain || landingUrl}: ${urlRes.verdict}`
    });
  } else if (landingUrl) {
    checks.push({ pillar: 'CTA / Landing URL Reputation', passed: false, detail: 'Unable to resolve URL safety' });
    flags.push('UNVERIFIED_LANDING_URL: Unable to verify landing page domain safety');
  }

  // Disclosure & Brand Safety Policy Checks
  if (isSponsored && !hasSponsoredDisclosure) {
    flags.push('MISSING_SPONSORED_DISCLOSURE: Commercial creative lacks #ad / Paid Partnership label (FTC / ByteDance policy)');
  }
  if (aiGenerated && !hasAiDisclosure) {
    flags.push('MISSING_SYNTHETIC_AI_DISCLOSURE: Synthetic / AI-generated creative lacks required AI content label');
  }
  for (const rule of PROHIBITED_CLAIM_PATTERNS) {
    if (rule.regex.test(combinedCopy)) {
      flags.push(`${rule.code}: ${rule.msg}`);
    }
  }
  if (RESTRICTED_CATEGORY_REGEX.test(combinedCopy)) {
    flags.push('RESTRICTED_AD_CATEGORY: Restricted financial/health category requires explicit regional pre-clearance');
  }
  checks.push({
    pillar: 'Disclosure & Brand Safety Policy',
    passed: (!isSponsored || hasSponsoredDisclosure) && (!aiGenerated || hasAiDisclosure) && !PROHIBITED_CLAIM_PATTERNS.some(r => r.regex.test(combinedCopy)) && !RESTRICTED_CATEGORY_REGEX.test(combinedCopy),
    detail: `Sponsored label: ${hasSponsoredDisclosure ? 'Present' : 'Missing'} · AI label: ${aiGenerated ? (hasAiDisclosure ? 'Present' : 'Missing') : 'N/A'}`
  });

  // 651B WASM Insertion-Order & Budget Cap Gate
  const wasmEngine = await getWasmInstance();
  let computedTotalUsd = spendAmountUsdc;
  if (Number.isFinite(impressions) && impressions > 0 && Number.isFinite(cpmUsd) && cpmUsd > 0) {
    computedTotalUsd = Math.round(((impressions * cpmUsd) / 1000) * 100) / 100;
  }
  const computedCents = Math.round(computedTotalUsd * 100);
  const statedCents = Math.round((Number.isFinite(statedTotalUsd) ? statedTotalUsd : 0) * 100);
  const wasmScoreBps = wasmEngine.scoreDeterministic(computedCents, statedCents, 0, 0);
  const discrepancyUsd = Math.round(Math.abs(computedCents - statedCents)) / 100;

  if (wasmScoreBps !== 10000) {
    flags.push(`INSERTION_ORDER_MATH_MISMATCH: Computed $${computedTotalUsd.toFixed(2)} differs from stated $${(statedCents / 100).toFixed(2)} (discrepancy $${discrepancyUsd.toFixed(2)})`);
  }
  if (Number.isFinite(singleCapUsd) && spendAmountUsdc > singleCapUsd) {
    flags.push(`CAMPAIGN_ESCROW_CAP_EXCEEDED: $${spendAmountUsdc.toFixed(2)} exceeds $${singleCapUsd.toFixed(2)} single-campaign authorization cap`);
  }
  checks.push({
    pillar: '651B WASM IO Math & Cap',
    passed: wasmScoreBps === 10000 && spendAmountUsdc > 0 && spendAmountUsdc <= singleCapUsd,
    detail: `WASM score ${wasmScoreBps} bps · IO $${computedTotalUsd.toFixed(2)} vs Stated $${(statedCents / 100).toFixed(2)} (cap $${singleCapUsd.toFixed(2)})`
  });

  const approved = flags.length === 0;
  const outPayload = {
    ok: true,
    useCase: 'ByteDance #5 — Independent Creative Quality Assurance',
    campaignId,
    region,
    advertiser: {
      name: advertiserName || null,
      legalName: corpRes?.legal_name || null,
      lei: corpRes?.registration_id || null,
      jurisdiction: corpRes?.jurisdiction || region,
      gleifVerified,
      sanctionsClear: !sanctionsRes?.matched && !sanctionsRes?.near_miss && !addrSanctionsRes?.matched
    },
    creative: {
      title: creativeTitle || null,
      landingUrl: landingUrl || null,
      urlVerdict: urlRes?.verdict || null,
      isSponsored,
      hasSponsoredDisclosure,
      aiGenerated,
      hasAiDisclosure
    },
    financials: {
      impressions: impressions ?? null,
      cpmUsd: cpmUsd ?? null,
      computedTotalUsd,
      statedTotalUsd: statedCents / 100,
      spendAmountUsdc,
      singleCapUsd,
      wasmEngine: 'praman-wasm-651b',
      wasmScoreBps,
      discrepancyUsd
    },
    approved,
    verdict: approved ? 'APPROVED_FOR_AD_RELEASE' : 'REJECTED_BRAND_SAFETY_HOLD',
    status: approved ? 'APPROVED' : 'HALTED',
    flags,
    checks,
    summary: approved
      ? `CREATIVE QA APPROVED (${campaignId}): Sponsor ${corpRes?.legal_name || advertiserName} (LEI ${corpRes?.registration_id || 'Verified'}) OFAC clear, landing URL safe, disclosures compliant, and WASM IO math exact ($${spendAmountUsdc.toFixed(2)}). Safe for escrow release.`
      : `CREATIVE QA HALTED (${campaignId}): ${flags[0]}`,
    timestamp: new Date().toISOString()
  };

  outPayload.canonicalSha256 = '0x' + crypto.createHash('sha256').update(JSON.stringify(outPayload)).digest('hex');
  return outPayload;
}
