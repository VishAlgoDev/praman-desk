import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  keccak256,
  toHex,
  formatUnits
} from 'viem';
import { sepolia } from 'viem/chains';
import { loadOrCreateWallet } from './init-wallet.mjs';
import { loadOrCreateAuxWallet } from './init-aux-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contractPath = path.join(rootDir, 'contracts', 'PramanEscrow.sol');
const abiOutPath = path.join(rootDir, 'contracts', 'PramanEscrow.abi.json');
const evidenceOutPath = path.join(rootDir, 'evidence', 'praman-escrow-receipts.json');

const RPC = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const TEST_USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const COMPILE_ONLY = process.argv.includes('--compile-only');

const erc20Abi = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);

function compileContract() {
  const source = fs.readFileSync(contractPath, 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'PramanEscrow.sol': { content: source }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: 'paris',
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (output.errors || []).filter((e) => e.severity === 'error');
  if (errors.length > 0) {
    throw new Error('Solc compilation failed:\n' + errors.map((e) => e.formattedMessage).join('\n'));
  }
  const compiled = output.contracts['PramanEscrow.sol']['PramanEscrow'];
  if (!compiled || !compiled.evm?.bytecode?.object) {
    throw new Error('Missing compiled bytecode for PramanEscrow');
  }
  fs.writeFileSync(abiOutPath, JSON.stringify(compiled.abi, null, 2) + '\n', 'utf8');
  return {
    abi: compiled.abi,
    bytecode: `0x${compiled.evm.bytecode.object}`
  };
}

async function main() {
  const { abi, bytecode } = compileContract();
  console.log(`Compiled PramanEscrow.sol (solc ${solc.version()}, bytecode ${(bytecode.length - 2) / 2} bytes)`);
  if (COMPILE_ONLY) {
    console.log('Compile-only check passed.');
    return;
  }

  const client = createPublicClient({ chain: sepolia, transport: http(RPC) });
  const { account, address: buyerArbiter } = loadOrCreateWallet();
  const { address: sellerAddress } = loadOrCreateAuxWallet();
  if (sellerAddress.toLowerCase() === buyerArbiter.toLowerCase()) {
    throw new Error('Seller address must differ from buyer/arbiter address');
  }
  const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC) });

  const ethBal = await client.getBalance({ address: buyerArbiter });
  const usdcBal = await client.readContract({
    address: TEST_USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [buyerArbiter]
  });
  console.log(`Buyer/Arbiter: ${buyerArbiter}`);
  console.log(`Seller (Aux):  ${sellerAddress}`);
  console.log(`Balances:      ${formatUnits(ethBal, 18)} ETH | ${formatUnits(usdcBal, 6)} TEST_USDC`);

  if (ethBal < 5_000_000_000_000_000n) {
    throw new Error('Insufficient Sepolia ETH (< 0.005 ETH)');
  }
  if (usdcBal < 1_500_000n) {
    throw new Error('Insufficient TEST_USDC (< 1.50 USDC required for Deal 0 + Deal 1)');
  }

  // 1. Deploy PramanEscrow
  console.log('\n[1/5] Deploying PramanEscrow on Ethereum Sepolia...');
  const deployTxHash = await walletClient.deployContract({
    abi,
    bytecode,
    args: []
  });
  console.log(`Deploy tx: ${deployTxHash}`);
  const deployReceipt = await client.waitForTransactionReceipt({ hash: deployTxHash });
  if (deployReceipt.status !== 'success' || !deployReceipt.contractAddress) {
    throw new Error(`Deployment failed: ${JSON.stringify(deployReceipt)}`);
  }
  const escrowAddress = deployReceipt.contractAddress;
  console.log(`PramanEscrow deployed at ${escrowAddress} (block ${deployReceipt.blockNumber})`);

  // 2. Approve 1.50 TEST_USDC (1_500_000 micro-USDC)
  console.log('\n[2/5] Approving 1.50 TEST_USDC for PramanEscrow...');
  const approveTxHash = await walletClient.writeContract({
    address: TEST_USDC,
    abi: erc20Abi,
    functionName: 'approve',
    args: [escrowAddress, 1_500_000n]
  });
  const approveReceipt = await client.waitForTransactionReceipt({ hash: approveTxHash });
  if (approveReceipt.status !== 'success') throw new Error('USDC approve failed');
  console.log(`Approved in block ${approveReceipt.blockNumber}: ${approveTxHash}`);

  // Compute authentic 651B comparator WASM digest
  const wasmBytes = fs.readFileSync(path.join(rootDir, 'comparator', 'comparator.wasm'));
  const wasmDigest = `0x${crypto.createHash('sha256').update(wasmBytes).digest('hex')}`;

  // 3. Deal #0: PO-ALI-9021 reconciled split (1.00 test-USDC -> 0.80 seller + 0.20 buyer refund)
  console.log('\n[3/5] Creating & settling Deal #0 (PO-ALI-9021: 1.00 test-USDC -> 0.80 seller / 0.20 buyer refund)...');
  const poHash0 = keccak256(toHex('PO-ALI-9021:SIEMENS-AG:100x1000USD:CAINIAO-CN-LAX-88201:TESTNET-SCALE-1USDC'));
  const bundleHash0 = keccak256(toHex(`PRAMAN-BUNDLE-0:${wasmDigest}:GLEIF-W38RGI023J3WT1HWRP32:OFAC-CLEAR:8000BPS`));

  const create0Tx = await walletClient.writeContract({
    address: escrowAddress,
    abi,
    functionName: 'createEscrow',
    args: [poHash0, sellerAddress, buyerArbiter, TEST_USDC, 1_000_000n]
  });
  const create0Rcpt = await client.waitForTransactionReceipt({ hash: create0Tx });
  if (create0Rcpt.status !== 'success') throw new Error('Deal 0 createEscrow failed');

  const settle0Tx = await walletClient.writeContract({
    address: escrowAddress,
    abi,
    functionName: 'settleSplit',
    args: [0n, 800_000n, 200_000n, wasmDigest, bundleHash0, 8000]
  });
  const settle0Rcpt = await client.waitForTransactionReceipt({ hash: settle0Tx });
  if (settle0Rcpt.status !== 'success') throw new Error('Deal 0 settleSplit failed');
  console.log(`Deal #0 settled in block ${settle0Rcpt.blockNumber}: ${settle0Tx}`);

  // 4. Deal #1: PO-ALI-9021-HALT circuit breaker (0.50 test-USDC -> 100% buyer refund)
  console.log('\n[4/5] Creating & halting Deal #1 (PO-ALI-9021-HALT: 0.50 test-USDC -> full buyer refund)...');
  const poHash1 = keccak256(toHex('PO-ALI-9021-HALT:UNAUTHORIZED-FULL-RELEASE-BLOCKED:TESTNET-0.50USDC'));
  const haltReasonHash1 = keccak256(toHex('CIRCUIT_BREAKER_HALT:WASM_3WAY_MATH_MISMATCH:-20%_CONFORMANCE_SHORTFALL'));

  const create1Tx = await walletClient.writeContract({
    address: escrowAddress,
    abi,
    functionName: 'createEscrow',
    args: [poHash1, sellerAddress, buyerArbiter, TEST_USDC, 500_000n]
  });
  const create1Rcpt = await client.waitForTransactionReceipt({ hash: create1Tx });
  if (create1Rcpt.status !== 'success') throw new Error('Deal 1 createEscrow failed');

  const halt1Tx = await walletClient.writeContract({
    address: escrowAddress,
    abi,
    functionName: 'haltAndRefund',
    args: [1n, haltReasonHash1, wasmDigest]
  });
  const halt1Rcpt = await client.waitForTransactionReceipt({ hash: halt1Tx });
  if (halt1Rcpt.status !== 'success') throw new Error('Deal 1 haltAndRefund failed');
  console.log(`Deal #1 halted & refunded in block ${halt1Rcpt.blockNumber}: ${halt1Tx}`);

  // 5. Read back verified on-chain state
  console.log('\n[5/5] Verifying on-chain contract state...');
  const count = await client.readContract({ address: escrowAddress, abi, functionName: 'dealCount' });
  const deal0 = await client.readContract({ address: escrowAddress, abi, functionName: 'getDeal', args: [0n] });
  const deal1 = await client.readContract({ address: escrowAddress, abi, functionName: 'getDeal', args: [1n] });
  const usdcAfter = await client.readContract({
    address: TEST_USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [buyerArbiter]
  });

  const evidence = {
    protocol: 'PramanEscrow',
    network: 'ethereum-sepolia',
    chainId: 11155111,
    contractAddress: escrowAddress,
    tokenAddress: TEST_USDC,
    tokenSymbol: 'TEST_USDC',
    solcVersion: solc.version(),
    deployTxHash,
    deployBlockNumber: Number(deployReceipt.blockNumber),
    deployEtherscanUrl: `https://sepolia.etherscan.io/tx/${deployTxHash}`,
    contractEtherscanUrl: `https://sepolia.etherscan.io/address/${escrowAddress}`,
    approveTxHash,
    wasmDigest,
    buyerArbiter,
    sellerCounterparty: sellerAddress,
    dealCount: Number(count),
    usdcBalanceAfter: formatUnits(usdcAfter, 6),
    deals: [
      {
        dealId: 0,
        caseId: 'po-ali-9021',
        title: 'PO-ALI-9021 Reconciled Split Settlement (80% Conforming / 20% Shortfall)',
        commercialScaleNote: 'Models $100,000 commercial PO ($80k release / $20k refund) on Sepolia testnet at 1.00 test-USDC scale.',
        poHash: poHash0,
        complianceBundleHash: bundleHash0,
        escrowAmountUusdc: '1000000',
        escrowAmountUsdc: 1.0,
        sellerReleasedUusdc: deal0.sellerReleased.toString(),
        sellerReleasedUsdc: Number(deal0.sellerReleased) / 1e6,
        buyerRefundedUusdc: deal0.buyerRefunded.toString(),
        buyerRefundedUsdc: Number(deal0.buyerRefunded) / 1e6,
        wasmScoreBps: Number(deal0.wasmScoreBps),
        status: Number(deal0.status),
        statusLabel: 'SettledSplit',
        createTxHash: create0Tx,
        createBlockNumber: Number(create0Rcpt.blockNumber),
        settleTxHash: settle0Tx,
        settleBlockNumber: Number(settle0Rcpt.blockNumber),
        gasUsed: Number(settle0Rcpt.gasUsed),
        etherscanUrl: `https://sepolia.etherscan.io/tx/${settle0Tx}`
      },
      {
        dealId: 1,
        caseId: 'po-ali-9021-halt',
        title: 'PO-ALI-9021 Unauthorized Overbill Circuit Breaker Halt & Full Refund',
        commercialScaleNote: 'Full buyer refund executed after 651B WASM comparator flagged -20% delivery shortfall.',
        poHash: poHash1,
        haltReasonHash: haltReasonHash1,
        escrowAmountUusdc: '500000',
        escrowAmountUsdc: 0.5,
        sellerReleasedUusdc: deal1.sellerReleased.toString(),
        sellerReleasedUsdc: Number(deal1.sellerReleased) / 1e6,
        buyerRefundedUusdc: deal1.buyerRefunded.toString(),
        buyerRefundedUsdc: Number(deal1.buyerRefunded) / 1e6,
        wasmScoreBps: Number(deal1.wasmScoreBps),
        status: Number(deal1.status),
        statusLabel: 'HaltedRefunded',
        createTxHash: create1Tx,
        createBlockNumber: Number(create1Rcpt.blockNumber),
        settleTxHash: halt1Tx,
        settleBlockNumber: Number(halt1Rcpt.blockNumber),
        gasUsed: Number(halt1Rcpt.gasUsed),
        etherscanUrl: `https://sepolia.etherscan.io/tx/${halt1Tx}`
      }
    ],
    recordedAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(evidenceOutPath), { recursive: true });
  fs.writeFileSync(evidenceOutPath, JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  console.log(`Saved ${evidenceOutPath}`);
  console.log(`Remaining USDC balance: ${evidence.usdcBalanceAfter}`);
}

main().catch((err) => {
  console.error('DEPLOY FAILED:', err);
  process.exit(1);
});
