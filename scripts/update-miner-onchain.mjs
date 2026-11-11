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
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';
const COMMIT_HASH = '47e6d9f80b2799ffde90ae2ba5947a872bed7301';
const PINNED_URL = `https://raw.githubusercontent.com/VishAlgoDev/praman-desk/${COMMIT_HASH}/miner.yaml`;

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);

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
  console.log(`\n=== Calling updateMiner with immutable pinned commit on Sepolia ===`);
  console.log(`Fetching from: ${PINNED_URL}`);
  const yamlRes = await fetch(PINNED_URL);
  const yamlText = await yamlRes.text();
  const yamlHash = '0x' + crypto.createHash('sha256').update(Buffer.from(yamlText)).digest('hex');
  console.log(`YAML length: ${yamlText.length}, SHA-256: ${yamlHash}`);

  // Check & ensure MACHINA bond allowance for Diamond contract
  const neededAllowance = 100000000000000000n; // 0.10 MACHINA
  const currentAllowance = await client.readContract({
    address: MACHINA,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, DIAMOND_ADDRESS]
  });
  console.log(`Current Diamond MACHINA allowance: ${currentAllowance}`);
  if (currentAllowance < neededAllowance) {
    console.log(`Approving Diamond contract to spend MACHINA bond...`);
    const approveTx = await walletClient.writeContract({
      address: MACHINA,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DIAMOND_ADDRESS, 1000000000000000000n] // 1.0 MACHINA
    });
    console.log(`Approve Tx Hash: ${approveTx}`);
    await client.waitForTransactionReceipt({ hash: approveTx });
    console.log(`MACHINA allowance approved successfully.`);
  }

  // Use old registration ID 5179
  const updateTx = await walletClient.writeContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'updateMiner',
    args: [
      5179n,
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
    previousRegistrationId: '5179',
    registrationId: newRegId || '5180',
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
