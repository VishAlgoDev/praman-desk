import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com')
});

const { address } = loadOrCreateWallet();

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)'
]);

const USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';

async function main() {
  const usdcBal = await client.readContract({ address: USDC, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
  const machinaBal = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
  const ethBal = await client.getBalance({ address });

  console.log(`Wallet: ${address}`);
  console.log(`Sepolia ETH: ${formatUnits(ethBal, 18)} ETH`);
  console.log(`USDC Balance: ${formatUnits(usdcBal, 6)} USDC (${usdcBal} raw)`);
  console.log(`MACHINA Balance: ${formatUnits(machinaBal, 18)} MACHINA (${machinaBal} raw)`);
}

main().catch(console.error);
