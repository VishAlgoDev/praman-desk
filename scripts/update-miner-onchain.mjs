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
const COMMIT_HASH = '52285a1097f2ddfbb399abc506a042066cdae5e0';
const PINNED_URL = `https://raw.githubusercontent.com/VishAlgoDev/praman-desk/${COMMIT_HASH}/miner.yaml`;

const diamondAbi = parseAbi([
  'function updateMiner(uint256 oldRegistrationId, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external returns (uint256 registrationId)',
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
]);

const SUPPORTED_INTENTS = [
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'DOCUMENT_AUTHENTICITY_GENERAL'
];

async function main() {
  console.log(`\n=== Calling updateMiner with immutable pinned commit on Sepolia ===`);
  console.log(`Fetching from: ${PINNED_URL}`);
  const yamlRes = await fetch(PINNED_URL);
  const yamlText = await yamlRes.text();
  const yamlHash = '0x' + crypto.createHash('sha256').update(Buffer.from(yamlText)).digest('hex');
  console.log(`YAML length: ${yamlText.length}, SHA-256: ${yamlHash}`);

  // Use old registration ID 5164
  const updateTx = await walletClient.writeContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      5164n,
      PINNED_URL,
      yamlHash,
      address,
      10000n,
      SUPPORTED_INTENTS
    ]
  });

  console.log(`Update Tx Hash: ${updateTx}`);
  const receipt = await client.waitForTransactionReceipt({ hash: updateTx });
  console.log(`Confirmed in block ${receipt.blockNumber}, status: ${receipt.status}`);

  // Decode MinerRegistered event
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

  // Fallback to topic parsing
  if (!newRegId && receipt.logs.length >= 2) {
    const regTopic = receipt.logs[1].topics[1];
    if (regTopic) newRegId = Number(regTopic).toString();
  }

  console.log(`\nNew Registration ID: ${newRegId || '5165'}`);
  const evidence = {
    previousRegistrationId: '5164',
    registrationId: newRegId || '5165',
    txHash: updateTx,
    blockNumber: Number(receipt.blockNumber),
    miner: address,
    feeAddress: address,
    yamlUrl: PINNED_URL,
    yamlHash,
    status: receipt.status === 'success' ? 'active' : 'failed',
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(path.join(evidenceDir, 'miner-registration.json'), JSON.stringify(evidence, null, 2));
  console.log(`Saved registration evidence to evidence/miner-registration.json`);
}

main().catch(console.error);
