/**
 * Update active Sepolia miner registration (Diamond reg #6135) with pinned miner.yaml from GitHub.
 * Uses production DIAMOND_PORT — NOT legacy 0x3624... contract.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';
import { DIAMOND_PORT } from '../src/handlers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');

const RPC = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const COMMIT_HASH = process.env.MINER_YAML_COMMIT || '8a07b9d';
const PINNED_URL = `https://raw.githubusercontent.com/VishAlgoDev/praman-desk/${COMMIT_HASH}/miner.yaml`;
const PREVIOUS_REGISTRATION_ID = BigInt(process.env.MINER_REGISTRATION_ID || '6135');
const DRY_RUN = process.argv.includes('--dry-run');

const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';

const SUPPORTED_INTENTS = [
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'DOCUMENT_AUTHENTICITY_GENERAL',
  'CORPORATE_REGISTRY_LOOKUP_GENERAL',
  'SANCTIONS_SCREENING_MATCH_GENERAL',
  'REGULATORY_FILING_MONITOR_GENERAL',
  'CONTRACT_OBLIGATION_AUDIT_GENERAL',
  'GRID_POWER_PRICE_GENERAL'
  // MINING_INTELLIGENCE_GENERAL: served via HTTP/miner.yaml but not yet bondable on Diamond (reverts unsupported intent).
];

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);

const diamondAbi = parseAbi([
  'function quoteMinerBond(uint256 intentCount) external view returns (uint256 usd, uint256 machina)',
  'function updateMiner(uint256 oldRegistrationId, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external returns (uint256 registrationId)',
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
]);

const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

async function main() {
  console.log('=== LIVE DIAMOND MINER YAML UPDATE ===');
  console.log('Diamond:', DIAMOND_PORT);
  console.log('Wallet:', address);
  console.log('Previous registration:', PREVIOUS_REGISTRATION_ID.toString());
  console.log('YAML URL:', PINNED_URL);
  console.log('Intents:', SUPPORTED_INTENTS.length);

  const yamlRes = await fetch(PINNED_URL);
  if (!yamlRes.ok) throw new Error(`Failed to fetch yaml: ${yamlRes.status}`);
  const yamlText = await yamlRes.text();
  const yamlHash = `0x${crypto.createHash('sha256').update(Buffer.from(yamlText)).digest('hex')}`;
  console.log('YAML SHA-256:', yamlHash);

  const bondQuote = await client.readContract({
    address: DIAMOND_PORT,
    abi: diamondAbi,
    functionName: 'quoteMinerBond',
    args: [BigInt(SUPPORTED_INTENTS.length)]
  });
  console.log('Bond quote (10 intents) usd/machina:', bondQuote);

  const sim = await client.simulateContract({
    account: address,
    address: DIAMOND_PORT,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      PREVIOUS_REGISTRATION_ID,
      PINNED_URL,
      yamlHash,
      address,
      10000n,
      SUPPORTED_INTENTS
    ]
  });
  console.log('Simulation OK — projected new registrationId:', sim.result.toString());

  if (DRY_RUN) {
    console.log('--dry-run: stopping before approve/broadcast');
    return;
  }

  const neededAllowance = 1000000000000000000n;
  const currentAllowance = await client.readContract({
    address: MACHINA,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, DIAMOND_PORT]
  });
  if (currentAllowance < neededAllowance) {
    console.log('Approving MACHINA for Diamond...');
    const approveTx = await walletClient.writeContract({
      address: MACHINA,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DIAMOND_PORT, neededAllowance]
    });
    await client.waitForTransactionReceipt({ hash: approveTx });
  }

  const updateTx = await walletClient.writeContract({
    address: DIAMOND_PORT,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      PREVIOUS_REGISTRATION_ID,
      PINNED_URL,
      yamlHash,
      address,
      10000n,
      SUPPORTED_INTENTS
    ]
  });
  console.log('Broadcast tx:', updateTx);
  const receipt = await client.waitForTransactionReceipt({ hash: updateTx });
  console.log('Confirmed block', receipt.blockNumber, 'status', receipt.status);

  let newRegId = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== DIAMOND_PORT.toLowerCase()) continue;
    try {
      const decoded = client.decodeEventLog({
        abi: diamondAbi,
        data: log.data,
        topics: log.topics
      });
      if (decoded.eventName === 'MinerRegistered') {
        newRegId = decoded.args.registrationId.toString();
        break;
      }
    } catch {
      // continue
    }
  }

  const evidence = {
    previousRegistrationId: PREVIOUS_REGISTRATION_ID.toString(),
    registrationId: newRegId,
    txHash: updateTx,
    blockNumber: Number(receipt.blockNumber),
    diamond: DIAMOND_PORT,
    miner: address,
    yamlUrl: PINNED_URL,
    yamlHash,
    supportedIntents: SUPPORTED_INTENTS,
    updatedAt: new Date().toISOString()
  };
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'miner-registration-live.json'), JSON.stringify(evidence, null, 2));
  console.log('Saved evidence/miner-registration-live.json');
  console.log('New registration ID:', newRegId || '(decode from receipt)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});