import { createPublicClient, http, parseAbi, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com')
});

const QUOTER = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3';
const USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';

const quoterAbi = parseAbi([
  'function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amount, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)'
]);

async function main() {
  const neededMachina = 193429316875625019n; // For 4 intents
  try {
    const res = await client.readContract({
      address: QUOTER,
      abi: quoterAbi,
      functionName: 'quoteExactOutputSingle',
      args: [{
        tokenIn: USDC,
        tokenOut: MACHINA,
        amount: neededMachina,
        fee: 3000,
        sqrtPriceLimitX96: 0n
      }]
    });
    console.log('Quoted amountIn USDC:', res[0], `(${formatUnits(res[0], 6)} USDC)`);
  } catch (e) {
    console.error('Quoter error:', e.message || e);
  }
}

main();
