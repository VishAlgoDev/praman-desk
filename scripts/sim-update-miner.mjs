import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { address } = loadOrCreateWallet();

const DIAMOND = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';
const diamondAbi = parseAbi([
  'function updateMiner(uint256 oldRegistrationId, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents) external returns (uint256 registrationId)'
]);

async function sim() {
  try {
    const res = await client.simulateContract({
      account: address,
      address: DIAMOND,
      abi: diamondAbi,
      functionName: 'updateMiner',
      args: [
        5186n,
        'https://raw.githubusercontent.com/VishAlgoDev/praman-desk/6430bd61a0a3987f84297791e8d3e182013662f7/miner.yaml',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        address,
        10000n,
        [
          'PURCHASE_ORDER_VERIFY_GENERAL',
          'INVOICE_LEDGER_RECONCILE_GENERAL',
          'VENDOR_VERIFY_GENERAL',
          'DOCUMENT_AUTHENTICITY_GENERAL',
          'CORPORATE_REGISTRY_LOOKUP_GENERAL',
          'SANCTIONS_SCREENING_MATCH_GENERAL',
          'REGULATORY_FILING_MONITOR_GENERAL'
        ]
      ]
    });
    console.log('Simulate succeeded! New reg ID: ' + res.result);
  } catch (e) {
    console.log('Simulate error: ' + e.message);
  }
}

sim();
