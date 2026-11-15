import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({ chain: sepolia, transport: http('https://ethereum-sepolia-rpc.publicnode.com') });
const DIAMOND = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const loupeAbi = parseAbi([
  'function facetFunctionSelectors(address facet) external view returns (bytes4[])',
  'function facetAddresses() external view returns (address[])'
]);

async function check() {
  try {
    const addresses = await client.readContract({
      address: DIAMOND,
      abi: loupeAbi,
      functionName: 'facetAddresses'
    });
    console.log('Facet count:', addresses.length);
    console.log('Facets:', addresses);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
check();
