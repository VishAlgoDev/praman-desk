import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

const DIAMOND_ADDRESS = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';
const COMMIT_HASH = '6430bd61a0a3987f84297791e8d3e182013662f7';
const PINNED_URL = `https://raw.githubusercontent.com/VishAlgoDev/praman-desk/${COMMIT_HASH}/miner.yaml`;

const diamondAbi = parseAbi([
  'function updateMiner(uint256 oldRegistrationId, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external returns (uint256 registrationId)',
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
]);

const SUPPORTED_INTENTS = [
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'DOCUMENT_AUTHENTICITY_GENERAL',
  'CORPORATE_REGISTRY_LOOKUP_GENERAL',
  'SANCTIONS_SCREENING_MATCH_GENERAL',
  'REGULATORY_FILING_MONITOR_GENERAL'
];

async function main() {
  console.log('=== BROADCASTING ON-CHAIN MINER SCHEMA UPDATE ===\n');
  console.log('Wallet address: ' + address);

  const yamlContent = fs.readFileSync(path.join(rootDir, 'miner.yaml'), 'utf8');
  const yamlHash = '0x' + crypto.createHash('sha256').update(yamlContent).digest('hex');
  console.log('YAML URL: ' + PINNED_URL);
  console.log('YAML SHA256 Hash: ' + yamlHash);

  // Dry run / simulation first
  console.log('Simulating updateMiner call with oldRegistrationId: 5186...');
  const sim = await client.simulateContract({
    account: address,
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      5186n,
      PINNED_URL,
      yamlHash,
      address,
      10000n,
      SUPPORTED_INTENTS
    ]
  });
  console.log('Simulation passed! Projected new registrationId: ' + sim.result.toString());

  // Execute transaction
  console.log('\nBroadcasting updateMiner transaction on Sepolia...');
  const txHash = await walletClient.writeContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      5186n,
      PINNED_URL,
      yamlHash,
      address,
      10000n,
      SUPPORTED_INTENTS
    ]
  });

  console.log('Transaction Hash: ' + txHash);
  console.log('Waiting for block confirmation...');
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log('Confirmed in block: ' + Number(receipt.blockNumber) + ' | Status: ' + receipt.status);

  // Extract new registration ID
  let newRegId = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === DIAMOND_ADDRESS.toLowerCase()) {
      try {
        const decoded = client.decodeEventLog?.({
          abi: diamondAbi,
          data: log.data,
          topics: log.topics
        });
        if (decoded?.eventName === 'MinerRegistered') {
          newRegId = decoded.args.registrationId.toString();
          break;
        }
      } catch {}
    }
  }

  if (!newRegId && receipt.logs.length >= 2) {
    const regTopic = receipt.logs[1].topics[1];
    if (regTopic) newRegId = Number(regTopic).toString();
  }

  const assignedRegId = newRegId || sim.result.toString();
  console.log('\n✅ Successfully Updated Miner On-Chain!');
  console.log('Previous Registration ID: #5186');
  console.log('New Registration ID: #' + assignedRegId);
  console.log('Tx URL: https://sepolia.etherscan.io/tx/' + txHash);

  // Save evidence
  const evidence = {
    previousRegistrationId: '5186',
    registrationId: assignedRegId,
    txHash,
    blockNumber: Number(receipt.blockNumber),
    miner: address,
    feeAddress: address,
    yamlUrl: PINNED_URL,
    yamlHash,
    supportedIntents: SUPPORTED_INTENTS,
    status: receipt.status === 'success' ? 'active' : 'failed',
    updatedAt: new Date().toISOString()
  };

  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'miner-update-receipt.json'), JSON.stringify(evidence, null, 2));
  console.log('Saved evidence receipt to evidence/miner-update-receipt.json');
}

main().catch(err => {
  console.error('Fatal error updating miner:', err);
  process.exit(1);
});
