#!/usr/bin/env node
/**
 * ByteDance Use Case #5 — Independent Creative Quality Assurance Demo
 * Demonstrates pre-payout ad escrow gating using Praman's live creative QA engine:
 *  Case A: Unlabeled AI claim + prohibited return guarantee + phishing CTA + IO mismatch -> REJECTED_BRAND_SAFETY_HOLD
 *  Case B: Verified GLEIF sponsor (Siemens AG) + #ad + AI label + safe URL + WASM IO tie-out -> APPROVED_FOR_AD_RELEASE
 */
import { screenSanctions, lookupCorporateRegistry } from '../../src/handlers.mjs';
import { checkFakeWatchDomain } from '../../src/bridges/fakewatch-bridge.mjs';
import { evaluateCreativeQa } from '../../src/creative-qa.mjs';

async function main() {
  console.log('=== ByteDance #5: Independent Creative Quality Assurance ===\n');

  const caseA = await evaluateCreativeQa({
    campaignId: 'CREATIVE-BD-001',
    advertiserName: 'Viktor But',
    creativeTitle: 'Instant Wealth Vault',
    creativeCopy: 'Guaranteed profit with risk-free yield every week! Limited slots.',
    landingUrl: 'https://unisvvap.org/airdrop',
    impressions: 100000,
    cpmUsd: 20,
    statedTotalUsd: 2800,
    spendAmountUsdc: 2800,
    aiGenerated: true,
    aiDisclosurePresent: false
  }, { screenSanctions, lookupCorporateRegistry, checkFakeWatchDomain });

  console.log('CASE A (Should Halt):', caseA.verdict, '| Approved:', caseA.approved);
  console.log('Flags:', caseA.flags);

  const caseB = await evaluateCreativeQa({
    campaignId: 'CREATIVE-BD-002',
    advertiserName: 'Siemens Aktiengesellschaft',
    creativeTitle: 'Siemens Industrial AI Edge',
    creativeCopy: '#ad Paid partnership with Siemens. AI-generated visual walkthrough.',
    landingUrl: 'https://www.siemens.com',
    impressions: 100000,
    cpmUsd: 25,
    statedTotalUsd: 2500,
    spendAmountUsdc: 2500,
    aiGenerated: true
  }, { screenSanctions, lookupCorporateRegistry, checkFakeWatchDomain });

  console.log('\nCASE B (Should Approve):', caseB.verdict, '| Approved:', caseB.approved);
  console.log('Sponsor LEI:', caseB.advertiser.lei, '| Canonical SHA-256:', caseB.canonicalSha256);

  if (caseA.approved !== false || caseB.approved !== true) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
