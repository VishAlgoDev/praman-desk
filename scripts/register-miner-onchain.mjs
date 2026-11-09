import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

const DIAMOND_ADDRESS = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';
const YAML_URL = 'https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main/miner.yaml';

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);

const diamondAbi = parseAbi([
  'function quoteMinerBond(uint256 intentCount) external view returns (uint256 usd, uint256 machina)',
  'function registerMiner(string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external',
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
]);

const SUPPORTED_INTENTS = [
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'DOCUMENT_AUTHENTICITY_GENERAL'
];

async function main() {
  console.log(`\n======================================================`);
  console.log(`Registering Praman Compliance Miner on Ethereum Sepolia`);
  console.log(`Wallet Address: ${address}`);
  console.log(`Diamond Address: ${DIAMOND_ADDRESS}`);
  console.log(`======================================================\n`);

  // Step 1: Fetch raw YAML from GitHub & compute SHA-256
  console.log(`1. Fetching manifest from: ${YAML_URL}`);
  const yamlRes = await fetch(YAML_URL);
  if (!yamlRes.ok) {
    throw new Error(`Failed to fetch miner.yaml from GitHub: ${yamlRes.status}`);
  }
  const yamlText = await yamlRes.text();
  const yamlHash = '0x' + crypto.createHash('sha256').update(Buffer.from(yamlText)).digest('hex');
  console.log(`   Manifest Length: ${yamlText.length} bytes`);
  console.log(`   SHA-256 Digest:  ${yamlHash}`);

  // Step 2: Check required bond
  console.log(`\n2. Quoting required security deposit bond for ${SUPPORTED_INTENTS.length} intents...`);
  const [bondUsd, bondMachina] = await client.readContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'quoteMinerBond',
    args: [BigInt(SUPPORTED_INTENTS.length)]
  });
  console.log(`   Quoted Bond: ${formatUnits(bondUsd, 6)} USD (${formatUnits(bondMachina, 18)} MACHINA)`);

  const currentMachina = await client.readContract({
    address: MACHINA,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address]
  });
  console.log(`   Current Wallet MACHINA: ${formatUnits(currentMachina, 18)} MACHINA`);
  if (currentMachina < bondMachina) {
    throw new Error(`Insufficient MACHINA: has ${formatUnits(currentMachina, 18)}, needs ${formatUnits(bondMachina, 18)}`);
  }

  // Step 3: Approve Diamond contract to spend MACHINA bond
  console.log(`\n3. Checking Diamond contract allowance...`);
  const currentAllowance = await client.readContract({
    address: MACHINA,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, DIAMOND_ADDRESS]
  });
  if (currentAllowance < bondMachina) {
    console.log(`   Approving Diamond to spend ${formatUnits(bondMachina, 18)} MACHINA...`);
    const approveTx = await walletClient.writeContract({
      address: MACHINA,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DIAMOND_ADDRESS, currentMachina]
    });
    console.log(`   Approve Tx Hash: ${approveTx}`);
    await client.waitForTransactionReceipt({ hash: approveTx });
    console.log(`   Approve confirmed on-chain.`);
  } else {
    console.log(`   Allowance already sufficient (${formatUnits(currentAllowance, 18)} MACHINA).`);
  }

  // Step 4: Call registerMiner on Diamond contract
  console.log(`\n4. Calling registerMiner on-chain...`);
  const minPriceUsdc = 10000n; // $0.01

  const regTx = await walletClient.writeContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'registerMiner',
    args: [
      YAML_URL,
      yamlHash,
      address,
      minPriceUsdc,
      SUPPORTED_INTENTS
    ]
  });

  console.log(`   Registration Tx Hash: ${regTx}`);
  console.log(`   Waiting for Sepolia block confirmation...`);
  const receipt = await client.waitForTransactionReceipt({ hash: regTx });
  console.log(`   Confirmed in block ${receipt.blockNumber}, status: ${receipt.status}`);

  // Step 5: Extract registrationId from MinerRegistered log
  let registrationId = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === DIAMOND_ADDRESS.toLowerCase()) {
      try {
        const decoded = client.decodeEventLog?.({
          abi: diamondAbi,
          data: log.data,
          topics: log.topics
        });
        if (decoded && decoded.eventName === 'MinerRegistered') {
          registrationId = decoded.args.registrationId.toString();
          break;
        }
      } catch {}
    }
  }

  const evidence = {
    registrationId,
    txHash: regTx,
    blockNumber: Number(receipt.blockNumber),
    miner: address,
    feeAddress: address,
    yamlUrl: YAML_URL,
    yamlHash,
    minPriceUsdc: Number(minPriceUsdc),
    supportedIntents: SUPPORTED_INTENTS,
    bondMachinaPaid: formatUnits(bondMachina, 18),
    registeredAt: new Date().toISOString(),
    status: receipt.status === 'success' ? 'active' : 'failed'
  };

  const evidencePath = path.join(evidenceDir, 'miner-registration.json');
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
  console.log(`\n=== Miner Registration Successful! ===`);
  console.log(JSON.stringify(evidence, null, 2));
  console.log(`Saved registration receipt to: ${evidencePath}`);
}

main().catch(console.error);
