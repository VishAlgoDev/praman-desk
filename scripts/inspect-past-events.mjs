import { createPublicClient, http, parseAbiItem, keccak256, toHex } from 'viem';
import { sepolia } from 'viem/chains';
import crypto from 'node:crypto';

const rpcs = [
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://rpc.sepolia.org',
  'https://1rpc.io/sepolia',
  'https://sepolia.drpc.org'
];

const DIAMOND = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const eventAbi = parseAbiItem(
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
);

async function main() {
  for (const rpc of rpcs) {
    try {
      const client = createPublicClient({ chain: sepolia, transport: http(rpc) });
      const currentBlock = await client.getBlockNumber();
      console.log(`RPC ${rpc} current block:`, currentBlock);
      const logs = await client.getLogs({
        address: DIAMOND,
        event: eventAbi,
        fromBlock: currentBlock - 2000n
      });
      console.log(`Found ${logs.length} logs on ${rpc}:`);
      for (const log of logs.slice(-3)) {
        const { registrationId, miner, yamlUrl, yamlHash, feeAddress, minPriceUsdc, supportedIntents } = log.args;
        console.log({
          registrationId: registrationId.toString(),
          miner,
          yamlUrl,
          yamlHash,
          feeAddress,
          minPriceUsdc: minPriceUsdc.toString(),
          supportedIntents
        });
        try {
          const text = await (await fetch(yamlUrl)).text();
          const kHash = keccak256(Buffer.from(text));
          const sHash = '0x' + crypto.createHash('sha256').update(Buffer.from(text)).digest('hex');
          console.log('  On-chain yamlHash:', yamlHash);
          console.log('  keccak256(yaml):  ', kHash, kHash.toLowerCase() === yamlHash.toLowerCase() ? 'MATCH!' : 'no');
          console.log('  sha256(yaml):     ', sHash, sHash.toLowerCase() === yamlHash.toLowerCase() ? 'MATCH!' : 'no');
        } catch (err) {
          console.log('  Could not fetch yamlUrl:', err.message);
        }
      }
      if (logs.length > 0) return;
    } catch (e) {
      console.log(`Failed on ${rpc}:`, e.message || e);
    }
  }
}

main().catch(console.error);
