import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com')
});

const DIAMOND_ADDRESS = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const abi = parseAbi([
  'function quoteMinerBond(uint256 intentCount) external view returns (uint256 usd, uint256 machina)',
  'function entityBonds() external view returns (uint64 adapterUsd, uint64 contributorUsd, uint64 minerBaseUsd, uint64 minerPerIntentUsd)',
  'function machinaToken() external view returns (address)'
]);

async function main() {
  try {
    const machina = await client.readContract({
      address: DIAMOND_ADDRESS,
      abi,
      functionName: 'machinaToken'
    });
    console.log('Machina Token:', machina);

    const quote1 = await client.readContract({
      address: DIAMOND_ADDRESS,
      abi,
      functionName: 'quoteMinerBond',
      args: [1n]
    });
    console.log('Quote for 1 intent (usd, machina):', quote1);

    const quote2 = await client.readContract({
      address: DIAMOND_ADDRESS,
      abi,
      functionName: 'quoteMinerBond',
      args: [2n]
    });
    console.log('Quote for 2 intents (usd, machina):', quote2);

    const quote4 = await client.readContract({
      address: DIAMOND_ADDRESS,
      abi,
      functionName: 'quoteMinerBond',
      args: [4n]
    });
    console.log('Quote for 4 intents (usd, machina):', quote4);

    const entityBonds = await client.readContract({
      address: DIAMOND_ADDRESS,
      abi,
      functionName: 'entityBonds'
    });
    console.log('Entity Bonds:', entityBonds);
  } catch (err) {
    console.error('Contract read error:', err);
  }
}

main();
