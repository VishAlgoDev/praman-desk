import { spawn } from 'node:child_process';

const TUNNEL_URL = 'https://sport-mill-since-link.trycloudflare.com';
const EXPECTED_HASH = '50b30e260e7137728aaa44ea1fd507e77f8eec8062810bb2c8e58d2cbbb82346';
const CHECK_INTERVAL_MS = 60000;

console.log('=== PRAMAN DESK EVALUATOR RUNNER WATCHDOG ===');
console.log(`Target Tunnel: ${TUNNEL_URL}`);
console.log(`Expected Adapter Keccak256: 0x${EXPECTED_HASH}`);
console.log(`Interval: ${CHECK_INTERVAL_MS / 1000}s\n`);

async function checkHealth() {
  const timestamp = new Date().toISOString();
  try {
    const t0 = Date.now();
    const res = await fetch(TUNNEL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: [], adapter_hash: 'watchdog' }),
      signal: AbortSignal.timeout(10000)
    });
    const dur = Date.now() - t0;
    if (!res.ok) {
      console.error(`[${timestamp}] ❌ UNHEALTHY: HTTP ${res.status} (${dur}ms)`);
      return false;
    }
    const data = await res.json();
    if (data.adapter_hash !== EXPECTED_HASH) {
      console.error(`[${timestamp}] ⚠️ HASH MISMATCH: got ${data.adapter_hash}, expected ${EXPECTED_HASH}`);
      return false;
    }
    console.log(`[${timestamp}] ✅ HEALTHY: HTTP 200 (${dur}ms) - Hash: 0x${data.adapter_hash.slice(0, 10)}...`);
    return true;
  } catch (err) {
    console.error(`[${timestamp}] ❌ PROBE FAILED: ${err.message}`);
    return false;
  }
}

// Initial check
checkHealth();
setInterval(checkHealth, CHECK_INTERVAL_MS);
