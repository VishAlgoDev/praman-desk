import { createPublicClient, http, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({ chain: sepolia, transport: http('https://ethereum-sepolia-rpc.publicnode.com') });
const DIAMOND_ADDRESS = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const eventAbi = parseAbiItem(
  'event MinerRegistered(uint256 indexed registrationId, address indexed miner, string yamlUrl, bytes32 yamlHash, address feeAddress, uint256 minPriceUsdc, string[] supportedIntents)'
);

async function main() {
  const logs = await client.getLogs({
    address: DIAMOND_ADDRESS,
    event: eventAbi,
    fromBlock: 12098460n,
    toBlock: 12098463n
  });
  console.log(`Found ${logs.length} logs:`);
  for (const log of logs) {
    console.log('Registration ID:', log.args.registrationId.toString());
    console.log('Miner:', log.args.miner);
    console.log('YamlUrl:', log.args.yamlUrl);
  }
}

main().catch(console.error);
