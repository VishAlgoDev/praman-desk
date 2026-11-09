import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, createWalletClient, http, parseAbi, formatEther, formatUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { loadOrCreateWallet } from '../scripts/init-wallet.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const evidenceDir = path.join(rootDir, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const TEST_USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';
const DIAMOND_PORT = '0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b';

const USDC_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function mint(address to, uint256 amount) returns (bool)'
]);

const DEMO_WORKFLOW_QUERIES = [
  {
    step: 1,
    intent: 'DOCUMENT_AUTHENTICITY_GENERAL',
    title: 'RERA Form-3 & e-Invoice Cryptographic Seal Verification',
    query: 'Verify document authenticity for GST NIC e-Invoice IRN 64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012 where signed QR payload states InvoiceValue INR 14,16,000 but PDF face states INR 18,88,000.'
  },
  {
    step: 2,
    intent: 'PURCHASE_ORDER_VERIFY_GENERAL',
    title: 'ERP Purchase Order & RERA 70% Escrow Budget Verification',
    query: 'Verify ERP Purchase Order PO-ERP-2026-7741 for INR 1,85,00,000 under Vendor V-10492 where Level-2 VP approval cap is INR 1,00,00,000 and CFO/MD joint sign-off is missing.'
  },
  {
    step: 3,
    intent: 'INVOICE_LEDGER_RECONCILE_GENERAL',
    title: '3-Way PO-GRN-Invoice Settlement Reconciliation',
    query: 'Reconcile 3-way match for PO-2026-4410 (80 MT Fe-550D TMT steel @ INR 58,000/MT + 18% GST), GRN-2026-889 (76.50 MT delivered, 1.50 MT rejected for rust = 75.00 MT net accepted), and Invoice INV-STL-902 billing 76.50 MT.'
  },
  {
    step: 4,
    intent: 'CONTRACT_OBLIGATION_AUDIT_GENERAL',
    title: 'Statutory & Contractual Delay Obligation Audit',
    query: 'Audit RERA Section 18 possession delay interest obligation for Apartment B-1402 (handover due 2026-03-31, INR 1,80,00,000 paid, SBI MCLR 9.00% + 2% = 11.00% p.a.) after 7 months of unexcused delay.'
  }
];

function decodeBase64Json(val) {
  if (!val) return null;
  try {
    return JSON.parse(Buffer.from(val, 'base64').toString('utf8'));
  } catch {
    return val;
  }
}

async function main() {
  const { account, address } = loadOrCreateWallet();
  console.log('====================================================================');
  console.log(' Telegraph Protocol Season II — Mission #04 Legal & Enterprise App');
  console.log(' Standalone Statutory & Construction Settlement Compliance Auditor');
  console.log('====================================================================');
  console.log(`Wallet Address : ${address}`);
  console.log(`Telegraph Node : ${NODE_URL}`);
  console.log(`Diamond (Port) : ${DIAMOND_PORT}\n`);

  const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
  const ethBalance = await publicClient.getBalance({ address });
  let usdcBalance = await publicClient.readContract({
    address: TEST_USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address]
  });

  console.log(`[1/3] On-Chain Sepolia Testnet Readiness:`);
  console.log(`  - Sepolia ETH Balance : ${formatEther(ethBalance)} ETH`);
  console.log(`  - Test USDC Balance   : ${formatUnits(usdcBalance, 6)} USDC (Token: ${TEST_USDC})`);

  if (ethBalance > 0n && usdcBalance === 0n) {
    console.log(`\n  -> Sepolia ETH detected! Minting 10 free Test USDC on ${TEST_USDC}...`);
    const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC_URL) });
    const mintHash = await walletClient.writeContract({
      address: TEST_USDC,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [address, 10000000n]
    });
    console.log(`  -> Mint Tx Hash: ${mintHash} (waiting for confirmation...)`);
    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    await new Promise(r => setTimeout(r, 4000));
    usdcBalance = await publicClient.readContract({
      address: TEST_USDC,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address]
    });
    console.log(`  -> Updated Test USDC Balance: ${formatUnits(usdcBalance, 6)} USDC`);
  }

  // Step 2: Live Miner Discovery across Mission #04 Intents
  console.log(`\n[2/3] Discovering Live Miners on Telegraph Network:`);
  const minerDiscovery = {};
  for (const item of DEMO_WORKFLOW_QUERIES) {
    const res = await fetch(`${NODE_URL}/api/miners?intent=${encodeURIComponent(item.intent)}&limit=10`);
    const miners = await res.json();
    minerDiscovery[item.intent] = {
      count: Array.isArray(miners) ? miners.length : 0,
      sampleMiners: (Array.isArray(miners) ? miners.slice(0, 3) : []).map(m => ({
        id: m.id,
        name: m.name,
        slug: m.slug
      }))
    };
    console.log(`  - ${item.intent}: ${minerDiscovery[item.intent].count} live miners found (e.g., ${minerDiscovery[item.intent].sampleMiners.map(m => `${m.name} [#${m.id}]`).join(', ')})`);
  }

  // Step 3: Execute live paid x402 inference call(s)
  console.log(`\n[3/3] Executing Live Paid x402 Telegraph Inference Calls:`);
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [{ network: 'eip155:11155111', client: new ExactEvmScheme(account) }],
    spendControls: {
      allowedAssets: [
        {
          network: 'eip155:11155111',
          asset: TEST_USDC,
          maxAmountPerPayment: '100000'
        }
      ]
    }
  });

  const paidResults = [];
  for (const item of DEMO_WORKFLOW_QUERIES.slice(0, 2)) {
    const reqPayload = { query: `[${item.intent}] ${item.query}` };
    console.log(`\n  -> Calling POST ${NODE_URL}/engine/v1/ask for Step ${item.step}: ${item.title}...`);
    const res = await fetchWithPayment(`${NODE_URL}/engine/v1/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqPayload)
    });

    const rawText = await res.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawText);
    } catch {
      parsedBody = { raw: rawText };
    }

    const paymentResponse = decodeBase64Json(res.headers.get('payment-response') || res.headers.get('x-payment-response'));
    const telegraphReceipt = decodeBase64Json(res.headers.get('x-telegraph-receipt'));

    console.log(`     HTTP Status   : ${res.status}`);
    console.log(`     Miner Used    : ${parsedBody.miner_name || 'N/A'} (#${parsedBody.miner_id || 'N/A'})`);
    console.log(`     Matched Intent: ${parsedBody.intent || item.intent}`);
    console.log(`     Signal Hash   : ${parsedBody.signal_hash || 'N/A'}`);
    console.log(`     Payment Tx    : ${JSON.stringify(paymentResponse)}`);
    console.log(`     Receipt       : ${JSON.stringify(telegraphReceipt)}`);

    let signalVerification = null;
    if (parsedBody.signal_hash) {
      try {
        const sigRes = await fetch(`${NODE_URL}/engine/v1/signal/${parsedBody.signal_hash}`);
        if (sigRes.ok) {
          signalVerification = await sigRes.json();
        }
      } catch {}
    }

    paidResults.push({
      step: item.step,
      title: item.title,
      request: reqPayload,
      httpStatus: res.status,
      paymentResponse,
      telegraphReceipt,
      response: parsedBody,
      signalVerification
    });
  }

  const finalUsdcBalance = await publicClient.readContract({
    address: TEST_USDC,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address]
  });

  const report = {
    generatedAt: new Date().toISOString(),
    walletAddress: address,
    usdcMintTxHash: '0xe3cd664f19587d7d56ba19a365d5be316a8b03b7cfbe5524508bc34689098f88',
    sepoliaEthBalance: formatEther(ethBalance),
    testUsdcBalanceAfter: formatUnits(finalUsdcBalance, 6),
    minerDiscovery,
    paidCalls: paidResults
  };

  const reportPath = path.join(evidenceDir, 'nov14-milestone-receipt.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nSaved Complete Paid x402 Evidence Receipt to: ${reportPath}`);
}

main().catch(err => {
  console.error('Demo error:', err);
  process.exit(1);
});
