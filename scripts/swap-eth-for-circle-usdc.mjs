import { createPublicClient, createWalletClient, http, parseAbi, parseEther, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

const ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';
const WETH = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
const CIRCLE_USDC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const wethAbi = parseAbi([
  'function deposit() public payable',
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function balanceOf(address) view returns (uint256)'
]);

const routerAbi = parseAbi([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
]);

async function main() {
  console.log('Swapping 0.005 Sepolia ETH for Circle USDC on Uniswap V3...');
  const amount = parseEther('0.005');

  // Step 1: Deposit ETH to WETH
  console.log('1. Depositing 0.005 ETH to WETH...');
  const depHash = await walletClient.writeContract({
    address: WETH,
    abi: wethAbi,
    functionName: 'deposit',
    value: amount
  });
  console.log('   Deposit Tx:', depHash);
  await client.waitForTransactionReceipt({ hash: depHash });

  // Step 2: Approve Router
  console.log('2. Approving Uniswap V3 Router...');
  const appHash = await walletClient.writeContract({
    address: WETH,
    abi: wethAbi,
    functionName: 'approve',
    args: [ROUTER, amount]
  });
  console.log('   Approve Tx:', appHash);
  await client.waitForTransactionReceipt({ hash: appHash });

  // Step 3: Swap WETH -> Circle USDC
  console.log('3. Executing exactInputSingle on Uniswap V3 (fee 500)...');
  const swapHash = await walletClient.writeContract({
    address: ROUTER,
    abi: routerAbi,
    functionName: 'exactInputSingle',
    args: [{
      tokenIn: WETH,
      tokenOut: CIRCLE_USDC,
      fee: 500,
      recipient: address,
      amountIn: amount,
      amountOutMinimum: 0n,
      sqrtPriceLimitX96: 0n
    }]
  });
  console.log('   Swap Tx:', swapHash);
  const rcpt = await client.waitForTransactionReceipt({ hash: swapHash });
  console.log('   Confirmed in Block:', rcpt.blockNumber);

  // Check Circle USDC balance
  const circleBal = await client.readContract({
    address: CIRCLE_USDC,
    abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [address]
  });
  console.log(`\n🎉 New Circle USDC Balance: ${formatUnits(circleBal, 6)} USDC!`);
}

main().catch(err => {
  console.error('Swap failed:', err);
  process.exit(1);
});
