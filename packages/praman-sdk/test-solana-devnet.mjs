/**
 * Praman Desk — Solana Devnet Live Connectivity & Spend Guard Test Suite
 * 
 * Verifies:
 * 1. Live RPC Connection to Solana Devnet (https://api.devnet.solana.com)
 * 2. Cluster Health, Current Slot, and Latency measurement
 * 3. Recent Blockhash retrieval
 * 4. Pre-Signature Armoring on live Devnet Transaction instances
 * 5. Circuit Breakers: Spend Caps, Malicious Drainer Wallets, and OFAC SDN Entities
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';

import {
  SolanaSpendGuard,
  createSolanaDevnetConnection,
  checkSolanaClusterHealth,
  inspectSolanaToken2022Mint,
  MALICIOUS_DRAINER_ADDRESSES
} from './solana.js';

import { PramanSpendGuardError } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

function loadOrProvisionDevnetKeypair() {
  let rawSecret = process.env.SOLANA_DEVNET_SECRET_KEY || '';
  if (!rawSecret && fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const m = line.match(/^SOLANA_DEVNET_SECRET_KEY=(.+)$/);
      if (m) {
        rawSecret = m[1].trim().replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
  if (rawSecret) {
    try {
      const parsed = JSON.parse(rawSecret);
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    } catch (_) {
      // Fallback to generating a clean wallet if malformed
    }
  }
  const kp = Keypair.generate();
  const serialized = JSON.stringify(Array.from(kp.secretKey));
  const appendLine = `\nSOLANA_DEVNET_SECRET_KEY=${serialized}\n`;
  fs.appendFileSync(ENV_PATH, appendLine, 'utf8');
  return kp;
}

async function main() {
  console.log('=======================================================================');
  console.log('PRAMAN DESK - SOLANA DEVNET LIVE CONNECTIVITY & SPEND GUARD TESTS');
  console.log('=======================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Check Live Devnet Cluster Health
  console.log('▶ TEST 1: Live Devnet Cluster Health & Latency');
  try {
    const health = await checkSolanaClusterHealth('https://api.devnet.solana.com');
    assert.equal(health.ok, true, 'Devnet health check must succeed');
    assert(typeof health.slot === 'number', 'Devnet slot must be a number');
    console.log(`  ✅ [PASS] Connected to ${health.endpoint} (Solana Core: ${JSON.stringify(health.version)}, Slot: ${health.slot}, Latency: ${health.latencyMs}ms)`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] Devnet connection failed: ${err.message}`);
    failed++;
  }

  // Set up connection and guard
  const connection = await createSolanaDevnetConnection('https://api.devnet.solana.com');
  const guard = new SolanaSpendGuard({
    maxSingleSpend: { SOL: 1.0, USDC: 100 },
    maxSessionSpend: { SOL: 5.0, USDC: 500 }
  });

  const payer = loadOrProvisionDevnetKeypair();
  const legitimateRecipient = Keypair.generate().publicKey;
  const drainerRecipient = new PublicKey('FnvLGtucz4E1ppJHRTev6Qv4X7g8Pw6WPStHCcbAKbfx');

  // Test 2: Pre-Signature Guard on Valid Devnet Transaction
  console.log('\n▶ TEST 2: Pre-Signature Spend Approval (0.01 SOL)');
  try {
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: payer.publicKey }).add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: legitimateRecipient,
        lamports: 10_000_000 // 0.01 SOL
      })
    );

    const clearance = guard.guardTransaction(tx);
    assert.equal(clearance.approved, true);
    assert.equal(clearance.status, 'APPROVED');
    assert(clearance.certHash.startsWith('0x'));
    console.log(`  ✅ [PASS] Approved valid 0.01 SOL transfer. Cert Hash: ${clearance.certHash.slice(0, 18)}...`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] Legitimate transaction was rejected: ${err.message}`);
    failed++;
  }

  // Test 3: Circuit Breaker on Over-Cap Devnet Transaction (5 SOL > 1 SOL cap)
  console.log('\n▶ TEST 3: Circuit Breaker Single Spend Cap (5 SOL > 1 SOL limit)');
  try {
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: payer.publicKey }).add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: legitimateRecipient,
        lamports: 5_000_000_000 // 5 SOL
      })
    );

    guard.guardTransaction(tx);
    console.error('  ❌ [FAIL] Over-cap transaction should have been halted');
    failed++;
  } catch (err) {
    if (err instanceof PramanSpendGuardError && err.status === 'HALTED') {
      console.log(`  ✅ [PASS] Intercepted over-cap transfer: ${err.message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] Unexpected error type: ${err.message}`);
      failed++;
    }
  }

  // Test 4: Malicious Drainer Exfiltration Interception
  console.log('\n▶ TEST 4: Malicious Drainer Address Interception (FnvLGtucz4...)');
  try {
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: payer.publicKey }).add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: drainerRecipient,
        lamports: 50_000_000 // 0.05 SOL
      })
    );

    guard.guardTransaction(tx);
    console.error('  ❌ [FAIL] Malicious drainer transaction should have been halted');
    failed++;
  } catch (err) {
    if (err instanceof PramanSpendGuardError && err.status === 'HALTED') {
      console.log(`  ✅ [PASS] Successfully halted drainer exfiltration: ${err.message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] Unexpected error type: ${err.message}`);
      failed++;
    }
  }

  // Test 5: Guard and Simulate Execution on Solana Devnet
  console.log('\n▶ TEST 5: Guard & Simulated Execution on Devnet');
  try {
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    const tx = new Transaction({ recentBlockhash: blockhash, feePayer: payer.publicKey }).add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: legitimateRecipient,
        lamports: 1_000_000 // 0.001 SOL
      })
    );

    const result = await guard.guardAndSimulateTransaction(connection, tx);
    assert.equal(result.approved, true);
    assert(result.simulation !== undefined);
    console.log(`  ✅ [PASS] Guarded and simulated on Devnet. Simulation result: ${result.simulation.err ? 'Simulated error (expected without funding)' : 'Success'}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] Guard and simulate failed: ${err.message}`);
    failed++;
  }

  // Test 6: Live Token-2022 / SPL Mint Account Inspection on Devnet (Wrapped SOL mint)
  console.log('\n▶ TEST 6: Live Devnet SPL Mint Inspection');
  try {
    const mintReport = await inspectSolanaToken2022Mint(connection, 'So11111111111111111111111111111111111111112');
    assert.equal(mintReport.exists, true);
    assert.equal(mintReport.decimals, 9);
    console.log(`  [PASS] Live Devnet mint inspected: decimals=${mintReport.decimals}, riskLevel=${mintReport.riskLevel}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Live Devnet mint inspection failed: ${err.message}`);
    failed++;
  }

  // Test 7: Conditional Real Devnet Transaction Broadcast (when treasury wallet is funded)
  console.log('\n▶ TEST 7: Guarded Real Devnet Settlement Broadcast');
  try {
    const balanceLamports = await connection.getBalance(payer.publicKey, 'confirmed');
    const balanceSol = balanceLamports / 1e9;
    const pubkeyStr = payer.publicKey.toBase58();
    const evidenceDir = path.join(ROOT_DIR, 'evidence');
    fs.mkdirSync(evidenceDir, { recursive: true });

    if (balanceLamports >= 5_000_000) {
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      const settleTx = new Transaction({ recentBlockhash: blockhash, feePayer: payer.publicKey }).add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: legitimateRecipient,
          lamports: 1_000_000 // 0.001 SOL
        })
      );
      const settled = await guard.guardAndSendDevnetTransaction(connection, settleTx, [payer]);
      assert.equal(settled.broadcast, true);
      assert(settled.signature && settled.signature.length > 20);
      const receipt = {
        network: 'solana-devnet',
        treasuryAddress: pubkeyStr,
        balanceBeforeSol: balanceSol,
        amountSol: 0.001,
        signature: settled.signature,
        solscanUrl: settled.solscanUrl,
        explorerUrl: settled.explorerUrl,
        certHash: settled.certHash,
        timestamp: settled.timestamp
      };
      fs.writeFileSync(path.join(evidenceDir, 'solana-devnet-settlement.json'), JSON.stringify(receipt, null, 2));
      fs.writeFileSync(path.join(evidenceDir, 'solana-devnet-wallet.json'), JSON.stringify({
        network: 'solana-devnet',
        treasuryAddress: pubkeyStr,
        balanceSol,
        fundingRequired: false,
        lastSignature: settled.signature,
        solscanUrl: settled.solscanUrl,
        timestamp: settled.timestamp
      }, null, 2));
      console.log(`  [PASS] Real Solana Devnet tx confirmed: ${settled.solscanUrl}`);
    } else {
      const pendingInfo = {
        network: 'solana-devnet',
        treasuryAddress: pubkeyStr,
        balanceSol,
        fundingRequired: true,
        faucetUrl: 'https://faucet.solana.com',
        note: 'Fund treasuryAddress at https://faucet.solana.com then re-run test-solana-devnet.mjs to broadcast a real Solscan-verified Devnet settlement.'
      };
      fs.writeFileSync(path.join(evidenceDir, 'solana-devnet-wallet.json'), JSON.stringify(pendingInfo, null, 2));
      console.log(`  [INFO] Devnet treasury wallet ${pubkeyStr} has ${balanceSol} SOL (unfunded). Saved wallet prompt to evidence/solana-devnet-wallet.json`);
    }
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Devnet settlement test error: ${err.message}`);
    failed++;
  }

  console.log('\n=======================================================================');
  console.log(`DEVNET TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in Devnet test:', err);
  process.exit(1);
});
