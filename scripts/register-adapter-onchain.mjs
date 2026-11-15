import { createPublicClient, createWalletClient, http, parseAbi, parseUnits, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOrCreateWallet } from './init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const RPC = process.env.SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com';
const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
const { account, address } = loadOrCreateWallet();
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

const DIAMOND = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';
const MACHINA = '0xd68305cA83C7AF42A4F720144E7416fB53F8AaF4';
const USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function mint(address to, uint256 amount) external'
]);

const routerAbi = parseAbi([
  'function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountIn)'
]);

const diamondAbi = parseAbi([
  'function registerWasm(bytes32 wasmHash, string wasmUrl, string intent, address feeAddress, string wasmRunnableUrl) external returns (uint256)',
  'function entityBonds() external view returns (uint64 adapterUsd, uint64 contributorUsd, uint64 minerBaseUsd, uint64 minerPerIntentUsd)'
]);

// Registration Parameters
const INTENT = 'SANCTIONS_SCREENING_MATCH';
const WASM_HASH = '0x62db6aa4025553aa7e83e093eb2cb0349f00717abfa0de605e64150345a12ca4';
const WASM_URL = 'https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main/packages/SANCTIONS_SCREENING_MATCH.safetensors';
const WASM_FEE_ADDRESS = '0x98021b20Efdb7ae2C57366010a6E0fDE207b4466';
const WASM_RUNNABLE_URL = process.env.WASM_RUNNABLE_URL || 'https://pet-becomes-horses-accordingly.trycloudflare.com';

async function main() {
  console.log('================================================================');
  console.log('  Telegraph Protocol — Canonical Evaluator Adapter Registration ');
  console.log('================================================================');
  console.log(`Wallet Address:      ${address}`);
  console.log(`Diamond Address:     ${DIAMOND}`);
  console.log(`Intent / Family:     ${INTENT}`);
  console.log(`WASM Keccak256:      ${WASM_HASH}`);
  console.log(`WASM Package URL:    ${WASM_URL}`);
  console.log(`WASM Fee Address:    ${WASM_FEE_ADDRESS}`);
  console.log(`WASM Runnable URL:   ${WASM_RUNNABLE_URL}`);

  // Step 1: Pre-flight check on Runnable URL
  console.log('\n--- Step 1: Verifying Runnable URL ---');
  try {
    const probeRes = await fetch(WASM_RUNNABLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: [] })
    });
    const probeJson = await probeRes.json();
    console.log('Runnable URL probe status:', probeRes.status, JSON.stringify(probeJson));
    if (!probeJson || !Array.isArray(probeJson.results)) {
      throw new Error('Runnable URL failed to return valid batch results array');
    }
  } catch (err) {
    console.error('FAILED TO CONNECT TO RUNNABLE URL:', err.message);
    process.exit(1);
  }

  // Step 2: Check Balances & Bond Requirements
  console.log('\n--- Step 2: Checking Balances ---');
  const ethBal = await client.getBalance({ address });
  const usdcBal = await client.readContract({ address: USDC, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
  let machinaBal = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'balanceOf', args: [address] });

  console.log(`Sepolia ETH: ${formatUnits(ethBal, 18)} ETH`);
  console.log(`USDC:        ${formatUnits(usdcBal, 6)} USDC`);
  console.log(`MACHINA:     ${formatUnits(machinaBal, 18)} MACHINA`);

  const minMachinaNeeded = parseUnits('0.50', 18); // ~$5.00 bond is ~0.48 MACHINA
  if (machinaBal < minMachinaNeeded) {
    const shortfall = minMachinaNeeded - machinaBal;
    const maxUsdcIn = 7000000n; // $7.00 max USDC

    if (usdcBal < maxUsdcIn) {
      console.log(`USDC balance (${formatUnits(usdcBal, 6)}) < 7.00. Minting 10 free test USDC...`);
      const mintTx = await walletClient.writeContract({
        address: USDC,
        abi: erc20Abi,
        functionName: 'mint',
        args: [address, 10000000n]
      });
      console.log(`Mint Tx: ${mintTx}`);
      await client.waitForTransactionReceipt({ hash: mintTx });
      console.log('10 USDC minted successfully.');
    }

    console.log(`\nMACHINA balance (${formatUnits(machinaBal, 18)}) < 0.50. Executing swap from USDC...`);

    const routerAllowance = await client.readContract({ address: USDC, abi: erc20Abi, functionName: 'allowance', args: [address, ROUTER] });
    if (routerAllowance < maxUsdcIn) {
      console.log('Approving Uniswap V3 Router to spend USDC...');
      const appHash = await walletClient.writeContract({
        address: USDC,
        abi: erc20Abi,
        functionName: 'approve',
        args: [ROUTER, maxUsdcIn]
      });
      console.log(`Approve Tx: ${appHash}`);
      await client.waitForTransactionReceipt({ hash: appHash });
      console.log('USDC approved.');
    }

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
    console.log(`Swap Tx: ${swapHash}`);
    const swapReceipt = await client.waitForTransactionReceipt({ hash: swapHash });
    console.log(`Swap confirmed in block ${swapReceipt.blockNumber}, status: ${swapReceipt.status}`);

    machinaBal = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'balanceOf', args: [address] });
    console.log(`New MACHINA balance: ${formatUnits(machinaBal, 18)} MACHINA`);
  }

  // Step 3: Approve Diamond to take MACHINA bond
  console.log('\n--- Step 3: Approving Diamond for MACHINA Bond ---');
  const diamondAllowance = await client.readContract({ address: MACHINA, abi: erc20Abi, functionName: 'allowance', args: [address, DIAMOND] });
  const bondApprovalAmount = parseUnits('2.0', 18); // 2.0 MACHINA allowance
  if (diamondAllowance < minMachinaNeeded) {
    console.log(`Approving Diamond (${DIAMOND}) to spend MACHINA...`);
    const appTx = await walletClient.writeContract({
      address: MACHINA,
      abi: erc20Abi,
      functionName: 'approve',
      args: [DIAMOND, bondApprovalAmount]
    });
    console.log(`Diamond Approve Tx: ${appTx}`);
    await client.waitForTransactionReceipt({ hash: appTx });
    console.log('Diamond allowance confirmed.');
  } else {
    console.log(`Diamond already has allowance: ${formatUnits(diamondAllowance, 18)} MACHINA`);
  }

  // Step 4: Dry-run simulation (eth_call)
  console.log('\n--- Step 4: Simulating registerWasm (Dry-Run) ---');
  const simResult = await client.simulateContract({
    account,
    address: DIAMOND,
    abi: diamondAbi,
    functionName: 'registerWasm',
    args: [WASM_HASH, WASM_URL, INTENT, WASM_FEE_ADDRESS, WASM_RUNNABLE_URL]
  });

  console.log('DRY RUN SUCCESS! Predicted Registration ID:', simResult.result.toString());

  // Step 5: Broadcast Transaction
  console.log('\n--- Step 5: Broadcasting registerWasm Transaction ---');
  const txHash = await walletClient.writeContract({
    address: DIAMOND,
    abi: diamondAbi,
    functionName: 'registerWasm',
    args: [WASM_HASH, WASM_URL, INTENT, WASM_FEE_ADDRESS, WASM_RUNNABLE_URL]
  });

  console.log(`Transaction broadcast! Hash: ${txHash}`);
  console.log(`Sepolia Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);

  console.log('Waiting for receipt...');
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  console.log(`Transaction confirmed in block ${receipt.blockNumber}! Status: ${receipt.status}`);

  const evidenceRecord = {
    timestamp: new Date().toISOString(),
    event: 'registerWasm',
    intent: INTENT,
    wasmHash: WASM_HASH,
    wasmUrl: WASM_URL,
    wasmRunnableUrl: WASM_RUNNABLE_URL,
    feeAddress: WASM_FEE_ADDRESS,
    submitter: address,
    txHash,
    blockNumber: receipt.blockNumber.toString(),
    status: receipt.status,
    predictedRegistrationId: simResult.result.toString(),
    etherscanUrl: `https://sepolia.etherscan.io/tx/${txHash}`
  };

  const receiptPath = path.join(evidenceDir, 'adapter-registration-receipt.json');
  fs.writeFileSync(receiptPath, JSON.stringify(evidenceRecord, null, 2), 'utf8');
  console.log(`Saved registration receipt to: ${receiptPath}`);
  console.log('\n================================================================');
  console.log('  SUCCESSFULLY REGISTERED CANONICAL EVALUATOR ADAPTER ON-CHAIN! ');
  console.log('================================================================');
}

main().catch(err => {
  console.error('\nEXECUTION FAILED:', err);
  process.exit(1);
});
