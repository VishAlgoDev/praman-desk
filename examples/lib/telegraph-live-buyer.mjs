/**
 * Praman Desk Autonomous Telegraph Network Buyer
 *
 * Satisfies Season II Section 05 (Autonomous Machine-to-Machine Commerce):
 * Executes genuine 402 -> X-PAYMENT Devnode escrow/x402 purchases on behalf
 * of Track 1 apps (Minds Spend Guard, Alibaba Trade Assurance, Visa/Tencent Runner).
 *
 * Modes:
 * - TELEGRAPH_MODE=live (or --live CLI flag): signs real Devnode 402 challenges with CONTRIBUTOR_PRIVATE_KEY / wallet.json.
 * - Offline/CI default (no key or non-live mode): returns explicit { mode: 'SIMULATED_OFFLINE', simulated_offline: true } without spoofing tx hashes.
 */

import crypto from 'node:crypto';
import { privateKeyToAccount } from 'viem/accounts';
import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { loadOrCreateWallet } from '../../scripts/init-wallet.mjs';

const NODE_URL = process.env.TELEGRAPH_NODE_URL || 'https://devnode.telegraphprotocol.com';
const TEST_USDC = '0xcc194e1a843B658526D0D5C431f670028582Ae17';

function decodeB64Json(v) {
  if (!v) return null;
  try {
    return JSON.parse(Buffer.from(String(v), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function isLiveTelegraphMode(explicitLive = false) {
  if (explicitLive) return true;
  if (String(process.env.TELEGRAPH_MODE || '').toLowerCase() === 'live') return true;
  if (process.argv.includes('--live')) return true;
  return false;
}

function resolveBuyerWallet() {
  const pk = process.env.CONTRIBUTOR_PRIVATE_KEY || process.env.PRIVATE_KEY || '';
  if (pk && /^0x[0-9a-fA-F]{64}$/.test(pk.trim())) {
    const account = privateKeyToAccount(pk.trim());
    return { account, address: account.address };
  }
  try {
    return loadOrCreateWallet();
  } catch {
    return null;
  }
}

/**
 * Purchases a single intelligence signal via Devnode `/engine/v1/ask` (or `/engine/v1/ask/:minerId`).
 */
export async function purchaseTelegraphSignal({
  intent,
  query,
  params = null,
  minerId = null,
  live = false,
  timeoutMs = 25000
}) {
  const wantLive = isLiveTelegraphMode(live);
  if (!wantLive) {
    return {
      ok: false,
      settled: false,
      mode: 'SIMULATED_OFFLINE',
      simulated_offline: true,
      intent: intent || null,
      minerId: minerId || null,
      costUsdc: 0,
      receiptHash: null,
      signalHash: null,
      note: 'Executed in keyless CI/offline mode. Set TELEGRAPH_MODE=live or pass --live with a funded contributor wallet for real Devnode 402 settlement.'
    };
  }

  const wallet = resolveBuyerWallet();
  if (!wallet?.account) {
    return {
      ok: false,
      settled: false,
      mode: 'LIVE_FAILED_NO_WALLET',
      simulated_offline: false,
      error: 'No CONTRIBUTOR_PRIVATE_KEY or local wallet.json available for live 402 payment signing.'
    };
  }

  const { account, address } = wallet;
  const endpoint = minerId ? `${NODE_URL}/engine/v1/ask/${minerId}` : `${NODE_URL}/engine/v1/ask`;
  const effectiveQuery = query || (intent ? `[${intent}] Verify request` : 'Verify counterparty');
  const askBody = params
    ? { intent, params }
    : (minerId && intent ? { intent, params: { question: effectiveQuery, query: effectiveQuery } } : { query: effectiveQuery });

  const startTs = Date.now();
  let res1;
  try {
    res1 = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(askBody),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (err) {
    return {
      ok: false,
      settled: false,
      mode: 'LIVE_NETWORK_TIMEOUT',
      error: err.message,
      durationMs: Date.now() - startTs
    };
  }

  if (res1.status !== 402) {
    const errText = await res1.text().catch(() => '');
    return {
      ok: false,
      settled: false,
      mode: 'LIVE_HTTP_ERROR',
      status: res1.status,
      error: errText.slice(0, 300),
      durationMs: Date.now() - startTs
    };
  }

  const reqHeader = res1.headers.get('PAYMENT-REQUIRED') || res1.headers.get('payment-required');
  const challenge = decodeB64Json(reqHeader);
  const esc = challenge?.accepts?.find(a => a.scheme === 'escrow' && a.network === 'eip155:11155111');

  if (esc?.extra?.message) {
    const m = esc.extra.message.match(/Amount:\s*(\d+)\s*uUSDC/);
    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: address.toLowerCase(),
      to: esc.payTo,
      value: m ? m[1] : '10000',
      validAfter: String(now - 5),
      validBefore: String(now + 100),
      nonce: crypto.randomUUID()
    };

    const message = esc.extra.message
      .replace('{from}', authorization.from)
      .replace('{nonce}', authorization.nonce)
      .replace('{validAfter}', authorization.validAfter)
      .replace('{validBefore}', authorization.validBefore);

    const signature = await account.signMessage({ message });
    const payment = Buffer.from(JSON.stringify({
      x402Version: 2,
      scheme: 'escrow',
      network: esc.network,
      payload: { signature, authorization }
    })).toString('base64');

    try {
      const res2 = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': payment,
          'PAYMENT-SIGNATURE': payment
        },
        body: JSON.stringify(askBody),
        signal: AbortSignal.timeout(timeoutMs)
      });

      const payHdr = decodeB64Json(res2.headers.get('payment-response') || res2.headers.get('x-payment-response'));
      const recHdr = decodeB64Json(res2.headers.get('x-telegraph-receipt'));
      const parsed = await res2.json().catch(() => null);
      const signalHash = parsed?.signal_hash || recHdr?.signal_hash || null;
      const receiptHash = payHdr?.receipt_hash || payHdr?.transactionHash || recHdr?.receipt_hash || signalHash || null;

      return {
        ok: res2.ok,
        settled: Boolean(res2.ok && (receiptHash || signalHash)),
        mode: 'LIVE_TELEGRAPH_PAID',
        simulated_offline: false,
        rail: 'escrow',
        status: res2.status,
        buyer: address,
        minerId: parsed?.miner_id || minerId || null,
        minerName: parsed?.miner_name || null,
        intent: parsed?.intent || intent || null,
        costUsdc: Number(authorization.value) / 1e6,
        signalHash,
        receiptHash,
        txHash: payHdr?.transactionHash || recHdr?.tx_hash || null,
        durationMs: Date.now() - startTs,
        response: parsed
      };
    } catch (err) {
      return {
        ok: false,
        settled: false,
        mode: 'LIVE_NETWORK_ERROR',
        simulated_offline: false,
        rail: 'escrow',
        error: err.message,
        durationMs: Date.now() - startTs
      };
    }
  }

  // Fallback to ExactEvmScheme x402 when escrow scheme is not offered
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [{ network: 'eip155:11155111', client: new ExactEvmScheme(account) }],
    spendControls: {
      allowedAssets: [{ network: 'eip155:11155111', asset: TEST_USDC, maxAmountPerPayment: '100000' }]
    }
  });
  const resExact = await fetchWithPayment(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(askBody),
    signal: AbortSignal.timeout(timeoutMs)
  });
  const payExact = decodeB64Json(resExact.headers.get('payment-response') || resExact.headers.get('x-payment-response'));
  const recExact = decodeB64Json(resExact.headers.get('x-telegraph-receipt'));
  const parsedExact = await resExact.json().catch(() => null);
  const txHash = payExact?.transactionHash || recExact?.tx_hash || recExact?.transactionHash || null;

  return {
    ok: resExact.ok,
    settled: Boolean(resExact.ok && txHash),
    mode: 'LIVE_TELEGRAPH_PAID',
    simulated_offline: false,
    rail: 'exact',
    status: resExact.status,
    buyer: address,
    minerId: parsedExact?.miner_id || minerId || null,
    minerName: parsedExact?.miner_name || null,
    intent: parsedExact?.intent || intent || null,
    costUsdc: 0.01,
    signalHash: parsedExact?.signal_hash || null,
    receiptHash: payExact?.receipt_hash || txHash || null,
    txHash,
    durationMs: Date.now() - startTs,
    response: parsedExact
  };
}
