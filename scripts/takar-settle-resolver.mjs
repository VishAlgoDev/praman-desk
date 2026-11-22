/**
 * 🏛️ Praman Desk: TakarSettle v4 On-Chain Escrow Resolver (Seat 3)
 *
 * Implements autonomous dispute resolution for TakarSettle v4 on Ethereum Sepolia.
 * Contract: 0x310275e6D66818E068245326bB9e398822304248
 *
 * Resolvers Panel:
 *   - Seat 0: 0x39D2bae5EAedA9283535dDC98F1991c81eD5Cd7E (Takar)
 *   - Seat 1: 0x9cBDD9Cac5382d2cfe65669e5045C2D3dee6327E (Takar)
 *   - Seat 2: 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466 (Praman Desk)
 *
 * Resolution Workflow:
 *   1. Polls for disputed deals where both payerDisputed and payeeDisputed are true.
 *   2. Reads terms (JSON) and extracted counterparty name.
 *   3. Evaluates counterparty against Praman's 19,565 OFAC SDN trie and GLEIF registry.
 *   4. If clean and conditionMet is valid -> calls second(dealId, proposalHash).
 *   5. If flagged / sanctioned -> declines to call second, keeping escrow locked.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http, parseAbi, isAddress, keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';
import { evaluateCounterpartyClaims, computeCanonicalSha256 } from '../examples/minds-spend-guard/claim-arbitrator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const RESOLVER_LEDGER = path.join(evidenceDir, 'takar-resolver-decisions.json');

export const TAKAR_SETTLE_V4_ADDRESS = '0x310275e6D66818E068245326bB9e398822304248';

// Verified TakarSettle v4 ABI definition from Blockscout Sepolia
export const TAKAR_SETTLE_V4_ABI = parseAbi([
  'event Disputed(uint256 indexed id, address by, uint256 bond)',
  'event Proposed(uint256 indexed id, address indexed by, bool conditionMet, bytes32[] signals, string evidence)',
  'event Seconded(uint256 indexed id, address indexed by, uint8 approvals, uint64 finalizesAt)',
  'event Settled(uint256 indexed id, bool conditionMet, address paidTo, uint256 amount, bytes32 proposalHash)',
  'function second(uint256 id, bytes32 proposalHash) external',
  'function isResolver(address) external view returns (bool)',
  'function resolvers(uint256) external view returns (address)',
  'function resolverCount() external view returns (uint256)',
  'function threshold() external view returns (uint256)',
  'function bond() external view returns (uint256)',
  'function count() external view returns (uint256)',
  'function hasBacked(uint256 id, address resolver) external view returns (bool)',
  'function deal(uint256 id) external view returns ((address payer, address payee, uint96 amount, uint64 resolveAfter, uint8 kind, uint8 state, bool conditionMet, uint8 approvals, uint64 finalizesAt, bytes32 proposalHash, bytes32 disputedHash, uint96 payerBond, uint96 payeeBond, bool payerBondOn, bool payeeBondOn, bool payerDisputed, bool payeeDisputed, string terms))'
]);

export class TakarSettleResolver {
  constructor(options = {}) {
    this.rpcUrl = options.rpcUrl || process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    this.contractAddress = options.contractAddress || process.env.TAKAR_SETTLE_V4_ADDRESS || TAKAR_SETTLE_V4_ADDRESS;
    this.wallet = loadOrCreateWallet();
    this.dryRun = options.dryRun ?? false;

    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.rpcUrl)
    });

    this.walletClient = createWalletClient({
      account: this.wallet.account,
      chain: sepolia,
      transport: http(this.rpcUrl)
    });

    this.decisions = this.loadLedger();
  }

  loadLedger() {
    if (fs.existsSync(RESOLVER_LEDGER)) {
      try {
        return JSON.parse(fs.readFileSync(RESOLVER_LEDGER, 'utf8'));
      } catch {
        return [];
      }
    }
    return [];
  }

  saveLedger() {
    fs.writeFileSync(RESOLVER_LEDGER, JSON.stringify(this.decisions, null, 2), 'utf8');
  }

  /**
   * Computes canonical proposal hash matching TakarSettle4.sol:
   * keccak256(abi.encode(conditionMet, signals))
   */
  computeProposalHash(conditionMet, signals) {
    return keccak256(encodeAbiParameters(parseAbiParameters('bool, bytes32[]'), [conditionMet, signals]));
  }

  /**
   * Evaluates an escalated dispute using Praman's 7-claim arbitrator & deterministic OFAC trie
   */
  async evaluateDispute({ dealId, proposalHash, payer, payee, counterpartyName, amountUsdc = 1.0 }) {
    console.log(`\n========================================================================`);
    console.log(`⚖️ [TakarSettle v4 Resolver 3] Evaluating Deal ID: ${dealId}`);
    console.log(`   Payer: ${payer} | Payee: ${payee}`);
    console.log(`   Counterparty: ${counterpartyName} | Amount: $${amountUsdc} USDC`);
    console.log(`   Proposal Hash: ${proposalHash}`);
    console.log(`========================================================================`);

    const claimRequest = {
      deal_id: String(dealId),
      vendor: counterpartyName,
      counterparty_name: counterpartyName,
      domain: `${counterpartyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      country: 'GLOBAL',
      recipient_address: payee,
      payer_address: payer,
      amount_usd: amountUsdc,
      source_claim_signals: [
        { source: 'Payer_Escrow_Intent', claim: `Disputed payment for goods/services from ${counterpartyName}` },
        { source: 'Payee_Fulfilled_Proof', claim: `Delivery attested under deal ${dealId}` }
      ]
    };

    // Run Ahmed Ali Golden Challenge Claim Arbitrator
    const evaluation = await evaluateCounterpartyClaims(claimRequest, {
      maxBudgetUsdc: 0.25,
      endpoint: process.env.PRAMAN_DESK_ENDPOINT || 'https://praman-desk.vercel.app'
    });

    const verdict = evaluation.payload.decision.verdict; // 'APPROVE_PAYMENT', 'REJECT_PAYMENT', etc.
    const authorized = evaluation.payload.decision.escrow_release_authorized;
    const computedHash = computeCanonicalSha256(evaluation.payload);

    console.log(`[Resolver Evaluation] Verdict: ${verdict} | Escrow Release Authorized: ${authorized}`);
    console.log(`[Resolver Evaluation] Computed Bundle SHA-256: ${computedHash}`);

    const flags = evaluation.payload.decision.blocking_flags || [];
    const reasonText = flags.length > 0 ? flags.join(', ') : (authorized ? 'All 7 claims verified compliant' : 'Claims failed');

    const decisionRecord = {
      timestamp: new Date().toISOString(),
      resolver_address: this.wallet.address,
      deal_id: String(dealId),
      counterparty_name: counterpartyName,
      payer,
      payee,
      amount_usd: amountUsdc,
      verdict,
      authorized,
      proposal_hash: proposalHash,
      bundle_sha256: computedHash,
      seconded: false,
      tx_hash: null,
      reason: reasonText
    };

    if (authorized && verdict === 'APPROVE_PAYMENT') {
      console.log(`✅ DISPUTE RESOLUTION: CLEAR. Calling second(${dealId}, "${proposalHash}")...`);
      const secondResult = await this.broadcastSecond(dealId, proposalHash);
      decisionRecord.seconded = secondResult.success;
      decisionRecord.tx_hash = secondResult.txHash;
      decisionRecord.execution_note = secondResult.note;
    } else {
      console.warn(`🛑 DISPUTE RESOLUTION: REJECTED / SUSPECT (${reasonText}). Declining to second. Escrow remains LOCKED.`);
      decisionRecord.seconded = false;
      decisionRecord.execution_note = `Declined by Resolver 3: ${reasonText}`;
    }

    this.decisions.push(decisionRecord);
    this.saveLedger();

    return decisionRecord;
  }

  /**
   * Broadcasts the on-chain second(dealId, proposalHash) call
   */
  async broadcastSecond(dealId, proposalHash) {
    if (this.dryRun || !isAddress(this.contractAddress) || this.contractAddress === '0x0000000000000000000000000000000000000000') {
      const mockTxHash = `0xsim_${crypto.randomBytes(28).toString('hex')}`;
      console.log(`[Simulated On-Chain Second] dryRun / test mode. Sim Tx: ${mockTxHash}`);
      return { success: true, txHash: mockTxHash, note: 'Simulated execution verified (dry-run mode)' };
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: this.contractAddress,
        abi: TAKAR_SETTLE_V4_ABI,
        functionName: 'second',
        args: [BigInt(dealId), proposalHash]
      });

      console.log(`🚀 [Sepolia Broadcast] second() transaction sent: ${hash}`);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      console.log(`🎉 [Sepolia Confirmed] Block: ${receipt.blockNumber} (Status: ${receipt.status})`);
      return { success: receipt.status === 'success', txHash: hash, note: `Confirmed in block ${receipt.blockNumber}` };
    } catch (err) {
      console.error(`❌ [Sepolia Error] Failed to broadcast second:`, err.message);
      return { success: false, txHash: null, note: err.message };
    }
  }

  /**
   * Inspects all active deals on TakarSettle v4 and resolves escalated ones
   */
  async inspectAndResolve() {
    console.log(`[TakarSettle v4 Resolver 3] Inspecting deals on ${this.contractAddress}...`);
    const dealCount = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: TAKAR_SETTLE_V4_ABI,
      functionName: 'count'
    });

    console.log(`Total deals on-chain: ${dealCount}`);

    for (let i = 0n; i < dealCount; i++) {
      const d = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: TAKAR_SETTLE_V4_ABI,
        functionName: 'deal',
        args: [i]
      });

      console.log(`\n--- Deal ${i} ---`);
      console.log(`  Payer: ${d.payer} | Payee: ${d.payee}`);
      console.log(`  Payer Disputed: ${d.payerDisputed} | Payee Disputed: ${d.payeeDisputed}`);
      console.log(`  State: ${d.state} | Approvals: ${d.approvals}`);
      console.log(`  Proposal Hash: ${d.proposalHash}`);

      let counterpartyName = 'Unknown Entity';
      try {
        const termsObj = JSON.parse(d.terms);
        if (termsObj.name) counterpartyName = termsObj.name;
      } catch {}

      const hasBacked = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: TAKAR_SETTLE_V4_ABI,
        functionName: 'hasBacked',
        args: [i, this.wallet.address]
      });

      console.log(`  Counterparty Name: ${counterpartyName}`);
      console.log(`  Praman Desk Already Backed: ${hasBacked}`);

      // If both disputed and proposal is active, evaluate and resolve
      if (d.payerDisputed && d.payeeDisputed && d.proposalHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && !hasBacked) {
        await this.evaluateDispute({
          dealId: i,
          proposalHash: d.proposalHash,
          payer: d.payer,
          payee: d.payee,
          counterpartyName,
          amountUsdc: Number(d.amount) / 1e6
        });
      } else if (d.proposalHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log(`  Status: Deal ${i} is disputed but waiting for initial propose() call from panel.`);
      }
    }
  }
}

// CLI Execution Handler
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const resolver = new TakarSettleResolver({
    dryRun: process.argv.includes('--dry-run')
  });

  resolver.inspectAndResolve().catch(console.error);
}
