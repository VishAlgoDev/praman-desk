import { createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem';
import { sepolia } from 'viem/chains';
import crypto from 'node:crypto';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const DIAMOND = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const eventAbi = parseAbiItem(
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
);

async function main() {
  const txHash = '0x6f98357046e6fcdf1ecbf4439d44d18702078bbe9e0b3e968025940d98dcaca6';
  console.log('Fetching tx receipt for:', txHash);
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  console.log('Status:', receipt.status);
  console.log('Block Number:', receipt.blockNumber);
  console.log('Gas Used:', receipt.gasUsed.toString());

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() === DIAMOND.toLowerCase()) {
      try {
        const decoded = decodeEventLog({
          abi: [eventAbi],
          data: log.data,
          topics: log.topics
        });
        console.log('\n--- Decoded MinerRegistered Event ---');
        console.log('Registration ID:', decoded.args.registrationId.toString());
        console.log('Miner Address:  ', decoded.args.miner);
        console.log('Fee Address:    ', decoded.args.feeAddress);
        console.log('Min Price USDC: ', decoded.args.minPriceUsdc.toString());
        console.log('YAML URL:       ', decoded.args.yamlUrl);
        console.log('YAML Hash:      ', decoded.args.yamlHash);
        console.log('Intents (' + decoded.args.supportedIntents.length + '):', decoded.args.supportedIntents);

        // Fetch URL and check hash
        const res = await fetch(decoded.args.yamlUrl);
        const yamlText = await res.text();
        const sha256 = '0x' + crypto.createHash('sha256').update(Buffer.from(yamlText)).digest('hex');
        console.log('\n--- Hash Verification ---');
        console.log('Fetched YAML length:', yamlText.length);
        console.log('Computed SHA-256:   ', sha256);
        console.log('Matches Event Hash: ', sha256.toLowerCase() === decoded.args.yamlHash.toLowerCase());
      } catch (e) {
        // Not this event
      }
    }
  }
}

main().catch(console.error);
