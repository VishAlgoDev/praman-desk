import crypto from 'node:crypto';
import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { DIAMOND_PORT } from '../src/handlers.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const DIAMOND_ADDRESS = DIAMOND_PORT;
const address = '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466';

const diamondAbi = parseAbi([
  'function quoteMinerBond(uint256 intentCount) external view returns (uint256 usd, uint256 machina)',
  'function updateMiner(uint256 oldRegistrationId, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external returns (uint256 registrationId)'
]);

const TEST_INTENTS = [
  'PURCHASE_ORDER_VERIFY_GENERAL',
  'INVOICE_LEDGER_RECONCILE_GENERAL',
  'VENDOR_VERIFY_GENERAL',
  'DOCUMENT_AUTHENTICITY_GENERAL',
  'CORPORATE_REGISTRY_LOOKUP_GENERAL',
  'SANCTIONS_SCREENING_MATCH_GENERAL',
  'REGULATORY_FILING_MONITOR_GENERAL',
  'CONTRACT_OBLIGATION_AUDIT_GENERAL',
  'GRID_POWER_PRICE_GENERAL',
  'WEB_SEARCH_GENERAL',
  'ONCHAIN_TX_LOOKUP_GENERAL'
];

async function main() {
  const commit = '37afe83';
  const url = `https://raw.githubusercontent.com/VishAlgoDev/praman-desk/${commit}/miner.yaml`;
  const res = await fetch(url);
  const text = await res.text();
  const yamlHash = `0x${crypto.createHash('sha256').update(Buffer.from(text)).digest('hex')}`;

  console.log('Testing bond quote for 11 intents...');
  const quote = await client.readContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'quoteMinerBond',
    args: [BigInt(TEST_INTENTS.length)]
  });
  console.log('Bond quote for 11 intents:', quote);

  console.log('Simulating updateMiner with 11 intents...');
  try {
    const sim = await client.simulateContract({
      account: address,
      address: DIAMOND_ADDRESS,
      abi: diamondAbi,
      functionName: 'updateMiner',
      args: [
        6142n,
        url,
        yamlHash,
        address,
        10000n,
        TEST_INTENTS
      ]
    });
    console.log('Simulation SUCCESS! Projected registrationId:', sim.result.toString());
  } catch (err) {
    console.error('Simulation FAILED:', err.shortMessage || err.message);
  }
}

main().catch(console.error);
