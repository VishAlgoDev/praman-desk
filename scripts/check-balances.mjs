import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { address } = loadOrCreateWallet();

const USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';
const erc20 = parseAbi(['function balanceOf(address) external view returns (uint256)']);

async function check() {
  const eth = await client.getBalance({ address });
  const usdc = await client.readContract({ address: USDC, abi: erc20, functionName: 'balanceOf', args: [address] });
  const machina = await client.readContract({ address: MACHINA, abi: erc20, functionName: 'balanceOf', args: [address] });
  console.log('Wallet address: ' + address);
  console.log('Sepolia ETH: ' + (Number(eth) / 1e18));
  console.log('USDC balance: ' + (Number(usdc) / 1e6));
  console.log('MACHINA balance: ' + (Number(machina) / 1e18));
}

check();
