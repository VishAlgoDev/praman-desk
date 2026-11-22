import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';

const DIAMOND_ADDRESS = '0x72a70e949362670bf8bcead24efc5b8f950aa08b';
const TEST_USDC_ADDRESS = '0xcc194e1a843B658526D0D5C431f670028582Ae17';

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log(`Depositing 1.00 USDC for ${address}...`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com')
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http('https://ethereum-sepolia-rpc.publicnode.com')
  });

  const amount = 1000000n; // 1.00 USDC (6 decimals)

  const diamondAbi = parseAbi(['function depositUSDC(uint256) external']);

  console.log('Sending depositUSDC transaction to Sepolia Diamond...');
  const txHash = await walletClient.writeContract({
    address: DIAMOND_ADDRESS,
    abi: diamondAbi,
    functionName: 'depositUSDC',
    args: [amount]
  });

  console.log(`Tx broadcast: ${txHash}`);
  console.log('Waiting for receipt...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  console.log(`Deposit confirmed in block ${receipt.blockNumber}! Status: ${receipt.status}`);
}

main().catch(err => {
  console.error('Deposit failed:', err);
  process.exit(1);
});
