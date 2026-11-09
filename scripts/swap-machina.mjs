import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

const ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);

const routerAbi = parseAbi([
  'function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountIn)'
]);

async function main() {
  console.log(`Executing Uniswap V3 swap on Sepolia for ${address}...`);

  const initialMachina = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
  console.log(`Initial MACHINA balance: ${formatUnits(initialMachina, 18)}`);

  const targetMachina = 220000000000000000n; // 0.22 MACHINA (covers 4 intents)
  if (initialMachina >= targetMachina) {
    console.log('Already hold sufficient MACHINA bond!');
    return;
  }

  const shortfall = targetMachina - initialMachina;
  const maxUsdcIn = 2500000n; // $2.50 max USDC (quoter said $1.30)

  // Step 1: Check & Approve USDC for SwapRouter
  const allowance = await client.readContract({ address: USDC, abi: erc20Abi, functionName: 'allowance', args: [address, ROUTER] });
  if (allowance < maxUsdcIn) {
    console.log(`Approving Router to spend ${formatUnits(maxUsdcIn, 6)} USDC...`);
    const approveHash = await walletClient.writeContract({
      address: USDC,
      abi: erc20Abi,
      functionName: 'approve',
      args: [ROUTER, maxUsdcIn]
    });
    console.log(`Approve Tx: ${approveHash}`);
    await client.waitForTransactionReceipt({ hash: approveHash });
    console.log('Approval confirmed.');
  }

  // Step 2: Swap USDC -> MACHINA via exactOutputSingle
  console.log(`Swapping for ${formatUnits(shortfall, 18)} MACHINA...`);
  const swapHash = await walletClient.writeContract({
    address: ROUTER,
    abi: routerAbi,
    functionName: 'exactOutputSingle',
    args: [{
      tokenIn: USDC,
      tokenOut: MACHINA,
      fee: 3000,
      recipient: address,
      amountOut: shortfall,
      amountInMaximum: maxUsdcIn,
      sqrtPriceLimitX96: 0n
    }]
  });

  console.log(`Swap Tx Hash: ${swapHash}`);
  const receipt = await client.waitForTransactionReceipt({ hash: swapHash });
  console.log(`Swap confirmed in block ${receipt.blockNumber}, status: ${receipt.status}`);

  const finalMachina = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
  console.log(`Final MACHINA balance: ${formatUnits(finalMachina, 18)} MACHINA`);
}

main().catch(console.error);
