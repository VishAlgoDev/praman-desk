#!/usr/bin/env node
/**
 * Integration test for Praman Virtuals ACP v2 Agent & Evaluator.
 * Validates real SDK bindings, PramanViemEvmAcpProvider construction, and live HTTP
 * ACCEPT/REJECT evaluation against https://praman-desk.vercel.app (zero mock tx hashes).
 */
import assert from 'node:assert/strict';
import { base, baseSepolia } from 'viem/chains';
import {
  getAcpContractBindings,
  evaluateAcpDeliverable,
  PramanViemEvmAcpProvider
} from './praman-acp-agent.mjs';

async function main() {
  console.log('=== Praman Virtuals ACP v2 Integration Tests ===\n');

  const bindings = getAcpContractBindings();
  assert.equal(bindings.baseMainnet.chainId, base.id);
  assert.equal(bindings.baseSepolia.chainId, baseSepolia.id);
  assert.match(bindings.baseMainnet.acpContract, /^0x[0-9a-fA-F]{40}$/);
  assert.match(bindings.baseMainnet.usdcContract, /^0x[0-9a-fA-F]{40}$/);
  console.log('1. Verified ACP Base contracts:', bindings.baseMainnet.acpContract);

  const testProvider = new PramanViemEvmAcpProvider({
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    chain: base
  });
  const addr = await testProvider.getAddress();
  assert.match(addr, /^0x[0-9a-fA-F]{40}$/);
  console.log('2. Instantiated PramanViemEvmAcpProvider:', addr);

  const acceptCase = await evaluateAcpDeliverable({
    vendorName: 'Siemens Aktiengesellschaft',
    spendAmountUsdc: 450,
    statedTotal: 450,
    lineItems: [{ desc: 'Industrial Relay', qty: 9, unitPrice: 50, amount: 450 }]
  });
  assert.equal(acceptCase.accept, true, `Expected ACCEPT, got ${JSON.stringify(acceptCase)}`);
  assert.equal(acceptCase.detail?.vendorVerification?.lei, 'W38RGI023J3WT1HWRP32');
  console.log('3. Clean Siemens AG deliverable evaluated -> ACP_ACCEPT_CLEARED');

  const rejectCase = await evaluateAcpDeliverable({
    useCase: 'creative-qa',
    advertiserName: 'Viktor But',
    creativeCopy: 'Guaranteed profit risk-free yield campaign',
    landingUrl: 'https://unisvvap.org',
    spendAmountUsdc: 2500
  });
  assert.equal(rejectCase.accept, false, 'Expected REJECT on sanctioned near-miss + phishing');
  console.log('4. Risky Creative QA deliverable evaluated -> REJECTED_BRAND_SAFETY_HOLD');

  console.log('\nALL VIRTUALS ACP V2 SDK & EVALUATOR TESTS PASSED!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
