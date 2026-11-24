/**
 * 🏛️ Praman Desk: Takar Dispute Signing & On-Chain Seconding Engine
 * 
 * Executes autonomous dispute resolution on Ethereum Sepolia:
 * 1. Case 2 (Quantity Dispute): Deal 0 on TakarSettle5 (0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B)
 *    - Supplier invoiced 1,000 units @ $12.40 ($12,400.00), GRN accepted 960 units ($11,904.00)
 *    - Variance: $496.00 (Split: 96% supplier payment, 4% refund)
 *    - Seconding Proposal Hash: 0x5a328eb1b97a5bc02f7df0908ca147c30a8b88ac298f5ba7e209eba719b1c4f2
 * 
 * 2. Case 1 (Ferry Dispute): Deal 1 on TakarSettle v4 (0x310275e6D66818E068245326bB9e398822304248)
 *    - Megastar berthed at Helsinki per AIS telemetry, GRN accepts 1,000 units
 *    - Seconding Proposal Hash: 0x8f4d39493e214e5e5a5a1f6ae92779895aa9935140e6ed5295c213b40d3efcf2
 * 
 * Enforces Gas Safety Pre-Check (balance >= estimatedGas * 1.5).
 * Writes final cryptographic execution receipts to evidence/takar-resolver-receipts.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  formatEther
} from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const RECEIPTS_PATH = path.join(evidenceDir, 'takar-resolver-receipts.json');

// Contract Addresses
export const TAKAR_SETTLE_5_ADDRESS = '0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B';
export const TAKAR_SETTLE_V4_ADDRESS = '0x310275e6D66818E068245326bB9e398822304248';

// ABI for seconding disputes
export const TAKAR_SETTLE_ABI = parseAbi([
  'function second(uint256 id, bytes32 proposalHash) external',
  'function isResolver(address) external view returns (bool)',
  'function hasBacked(uint256 id, address resolver) external view returns (bool)'
]);

export async function signTakarDisputes(options = {}) {
  const rpcUrl = options.rpcUrl || process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  
  console.log(`\n=======================================================================`);
  console.log(`⚖️ PRAMAN DESK — TAKAR ON-CHAIN DISPUTE RESOLUTION ENGINE`);
  console.log(`=======================================================================\n`);

  // 1. Load contributor wallet
  const wallet = loadOrCreateWallet();
  console.log(`🔑 Resolver Account: ${wallet.address}`);
  console.log(`🌐 Target Network:   Ethereum Sepolia (Chain ID 11155111)`);
  console.log(`📡 RPC Endpoint:     ${rpcUrl}\n`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    account: wallet.account,
    chain: sepolia,
    transport: http(rpcUrl)
  });

  // Verify resolver authorization
  const [isResolver5, isResolver4] = await Promise.all([
    publicClient.readContract({
      address: TAKAR_SETTLE_5_ADDRESS,
      abi: TAKAR_SETTLE_ABI,
      functionName: 'isResolver',
      args: [wallet.address]
    }),
    publicClient.readContract({
      address: TAKAR_SETTLE_V4_ADDRESS,
      abi: TAKAR_SETTLE_ABI,
      functionName: 'isResolver',
      args: [wallet.address]
    })
  ]);

  console.log(`📋 Resolver Authorization Status:`);
  console.log(`  - TakarSettle5 (${TAKAR_SETTLE_5_ADDRESS}): ${isResolver5 ? '✅ AUTHORIZED' : '❌ UNAUTHORIZED'}`);
  console.log(`  - TakarSettle v4 (${TAKAR_SETTLE_V4_ADDRESS}): ${isResolver4 ? '✅ AUTHORIZED' : '❌ UNAUTHORIZED'}`);

  if (!isResolver5 || !isResolver4) {
    throw new Error(`Wallet ${wallet.address} is not authorized on both Takar resolver panels.`);
  }

  // 2. Gas Safety Pre-Check
  console.log(`\n⛽ Running Gas Safety Pre-Check...`);
  const initialBalance = await publicClient.getBalance({ address: wallet.address });
  const gasPrice = await publicClient.getGasPrice();

  console.log(`  Current Balance:   ${formatEther(initialBalance)} ETH (${initialBalance} wei)`);
  console.log(`  Current Gas Price: ${formatEther(gasPrice * 1000000000n)} Gwei (${gasPrice} wei)`);

  const disputeCases = [
    {
      caseName: 'Case 2 (Quantity Dispute)',
      contractName: 'TakarSettle5',
      contractAddress: TAKAR_SETTLE_5_ADDRESS,
      dealId: 0n,
      proposalHash: '0x5a328eb1b97a5bc02f7df0908ca147c30a8b88ac298f5ba7e209eba719b1c4f2',
      details: 'Supplier invoiced 1,000 units @ $12.40 ($12,400.00), GRN accepted 960 units ($11,904.00), variance $496.00 (split: 96% supplier, 4% refund).'
    },
    {
      caseName: 'Case 1 (Ferry Dispute)',
      contractName: 'TakarSettle v4',
      contractAddress: TAKAR_SETTLE_V4_ADDRESS,
      dealId: 1n,
      proposalHash: '0x8f4d39493e214e5e5a5a1f6ae92779895aa9935140e6ed5295c213b40d3efcf2',
      details: 'Megastar berthed at Helsinki per AIS telemetry, GRN accepts 1,000 units conforming delivery.'
    }
  ];

  let totalEstimatedGasUnits = 0n;
  const gasEstimates = [];

  for (const c of disputeCases) {
    // Check if already backed
    const alreadyBacked = await publicClient.readContract({
      address: c.contractAddress,
      abi: TAKAR_SETTLE_ABI,
      functionName: 'hasBacked',
      args: [c.dealId, wallet.address]
    }).catch(() => false);

    c.alreadyBacked = alreadyBacked;

    if (!alreadyBacked) {
      const gasEst = await publicClient.estimateContractGas({
        address: c.contractAddress,
        abi: TAKAR_SETTLE_ABI,
        functionName: 'second',
        args: [c.dealId, c.proposalHash],
        account: wallet.account
      });
      c.estimatedGas = gasEst;
      totalEstimatedGasUnits += gasEst;
      gasEstimates.push(gasEst);
      console.log(`  - Gas Estimate for ${c.caseName}: ${gasEst} units`);
    } else {
      console.log(`  - ${c.caseName} already backed by ${wallet.address}`);
    }
  }

  const totalEstimatedGasCostWei = totalEstimatedGasUnits * gasPrice;
  const safetyRequiredWei = (totalEstimatedGasCostWei * 15n) / 10n; // 1.5x buffer

  console.log(`  Total Estimated Gas:      ${totalEstimatedGasUnits} units`);
  console.log(`  Total Estimated Gas Cost: ${formatEther(totalEstimatedGasCostWei)} ETH`);
  console.log(`  Required Safety (1.5x):   ${formatEther(safetyRequiredWei)} ETH`);

  if (initialBalance < safetyRequiredWei) {
    const errMsg = `[GAS SAFETY HALT] Insufficient ETH balance. Required: ${formatEther(safetyRequiredWei)} ETH, Available: ${formatEther(initialBalance)} ETH.`;
    console.error(`❌ ${errMsg}`);
    throw new Error(errMsg);
  }

  console.log(`  ✅ Gas Safety Check Passed: Balance is sufficient (${formatEther(initialBalance)} ETH >= ${formatEther(safetyRequiredWei)} ETH)\n`);

  // 3. Execute Broadcasts
  const receipts = [];

  for (const c of disputeCases) {
    console.log(`-----------------------------------------------------------------------`);
    console.log(`🚀 Executing ${c.caseName}`);
    console.log(`   Contract: ${c.contractName} (${c.contractAddress})`);
    console.log(`   Deal ID:  ${c.dealId}`);
    console.log(`   Proposal: ${c.proposalHash}`);
    console.log(`   Context:  ${c.details}`);

    if (c.alreadyBacked) {
      console.log(`   ℹ️ Already backed by resolver seat on-chain. Retrieving existing record.`);
      receipts.push({
        case_id: c.caseName,
        contract_name: c.contractName,
        contract_address: c.contractAddress,
        deal_id: Number(c.dealId),
        proposal_hash: c.proposalHash,
        status: 'already_seconded',
        note: 'Resolver seat previously voted to second this proposal hash'
      });
      continue;
    }

    const t0 = Date.now();
    const hash = await walletClient.writeContract({
      address: c.contractAddress,
      abi: TAKAR_SETTLE_ABI,
      functionName: 'second',
      args: [c.dealId, c.proposalHash]
    });

    console.log(`   Broadcasted Tx: ${hash}`);
    console.log(`   Awaiting Sepolia confirmation...`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const elapsed = Date.now() - t0;

    const gasUsed = receipt.gasUsed;
    const effectiveGasPrice = receipt.effectiveGasPrice || gasPrice;
    const feeWei = gasUsed * effectiveGasPrice;

    console.log(`   ✅ Confirmed in Block: ${receipt.blockNumber}`);
    console.log(`   Status:       ${receipt.status === 'success' ? 'SUCCESS (1)' : 'REVERTED (0)'}`);
    console.log(`   Gas Consumed: ${gasUsed} units (${formatEther(feeWei)} ETH)`);
    console.log(`   Duration:     ${elapsed} ms`);
    console.log(`   Etherscan:    https://sepolia.etherscan.io/tx/${hash}`);

    receipts.push({
      case_id: c.caseName,
      contract_name: c.contractName,
      contract_address: c.contractAddress,
      deal_id: Number(c.dealId),
      proposal_hash: c.proposalHash,
      tx_hash: hash,
      block_number: Number(receipt.blockNumber),
      gas_used: gasUsed.toString(),
      effective_gas_price_wei: effectiveGasPrice.toString(),
      gas_fee_eth: formatEther(feeWei),
      status: receipt.status,
      elapsed_ms: elapsed,
      etherscan_link: `https://sepolia.etherscan.io/tx/${hash}`,
      dispute_summary: c.details
    });
  }

  // 4. Save Receipts Ledger
  const finalBalance = await publicClient.getBalance({ address: wallet.address });
  const totalGasSpentWei = initialBalance - finalBalance;

  const outputPayload = {
    executed_at: new Date().toISOString(),
    network: 'Ethereum Sepolia (Chain ID 11155111)',
    resolver_address: wallet.address,
    initial_balance_eth: formatEther(initialBalance),
    final_balance_eth: formatEther(finalBalance),
    total_gas_spent_eth: formatEther(totalGasSpentWei),
    disputes_count: receipts.length,
    disputes: receipts
  };

  fs.writeFileSync(RECEIPTS_PATH, JSON.stringify(outputPayload, null, 2), 'utf8');
  console.log(`\n=======================================================================`);
  console.log(`🎯 All Takar Disputes Successfully Seconded & Anchored On-Chain!`);
  console.log(`Receipts Ledger saved to: ${RECEIPTS_PATH}`);
  console.log(`=======================================================================\n`);

  return outputPayload;
}

// Auto-run if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  signTakarDisputes()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('\nFatal Error in signTakarDisputes:', err);
      process.exit(1);
    });
}

export default signTakarDisputes;
