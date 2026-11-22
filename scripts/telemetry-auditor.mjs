import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const auditLogPath = path.join(rootDir, 'evidence', 'organic-workflow-audit-log.json');
const PROD_BASE = 'https://praman-desk.vercel.app';
const DEVNODE_API = 'https://devnode.telegraphprotocol.com/api/miners';
const TARGET_MINER_ID = '6137';
const NEW_REGISTRATION_ID = '6162';

async function fetchDevnodeMiners() {
  const res = await fetch(DEVNODE_API);
  if (!res.ok) {
    throw new Error(`Failed to fetch Devnode miners: HTTP ${res.status}`);
  }
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.miners || [];

  const epochs = list.map(m => m.last_scored_epoch).filter(x => typeof x === 'number');
  const maxEpoch = Math.max(...epochs);
  const inMaxEpoch = list.filter(m => m.last_scored_epoch === maxEpoch);

  // Also query direct miner endpoints for exact status
  let direct6137 = null;
  let direct6162 = null;
  try {
    const r6137 = await fetch(`${DEVNODE_API}/${TARGET_MINER_ID}`);
    if (r6137.ok) {
      const d = await r6137.json();
      direct6137 = d.miner || d;
    }
  } catch {}

  try {
    const r6162 = await fetch(`${DEVNODE_API}/${NEW_REGISTRATION_ID}`);
    if (r6162.ok) {
      const d = await r6162.json();
      direct6162 = d.miner || d;
    }
  } catch {}

  return {
    totalMinersInNetwork: list.length,
    maxEpochNetwork: maxEpoch,
    minersInMaxEpoch: inMaxEpoch.length,
    miner6137: direct6137,
    miner6162: direct6162
  };
}

async function probeWarmEndpoints() {
  const probes = [
    { name: 'Root Landing Page', path: '/' },
    { name: 'Health Endpoint', path: '/api/health' },
    { name: 'Status Endpoint', path: '/api/status' },
    { name: 'Corporate Registry (GLEIF)', path: '/api/miner/corporate-registry?company=Apple%20Inc.&jurisdiction=US-CA' },
    { name: 'OFAC Sanctions Screen', path: '/api/miner/sanctions-screen?name=Banco%20Nacional%20de%20Cuba' },
    { name: 'Purchase Order Verify', path: '/api/miner/po-verify?query=PO-ERP-2026-7741%20Apex%20Geotech%20Tower-B' },
    { name: 'Grid Power Settlement', path: '/api/miner/grid-power-price?hub=Houston&iso=ERCOT' },
    { name: 'Regulatory Filing Monitor', path: '/api/miner/regulatory-filing?company=The%20Boeing%20Company' },
    { name: 'Meta-Arbiter Consensus', path: '/api/miner/arbitrate?query=Siemens%20AG%20Corporate%20LEI' },
    { name: 'Web Search Intelligence', path: '/api/miner/web-search?query=Telegraph%20Protocol%20Decentralized%20Oracle' }
  ];

  const results = [];
  for (const p of probes) {
    const url = `${PROD_BASE}${p.path}`;
    const t0 = performance.now();
    let status = 0;
    let ok = false;
    let error = null;
    let xVercelId = null;
    let xVercelCache = null;
    let cfRay = null;
    let bodyLen = 0;

    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'PramanDeskTelemetryAuditor/2.0' } });
      const elapsed = performance.now() - t0;
      status = res.status;
      ok = res.ok;
      xVercelId = res.headers.get('x-vercel-id');
      xVercelCache = res.headers.get('x-vercel-cache') || res.headers.get('cache-control');
      cfRay = res.headers.get('cf-ray');
      const text = await res.text();
      bodyLen = text.length;

      const is429 = status === 429;
      const isWaf = status === 403 || text.includes('cf-browser-verification') || text.includes('Attention Required! | Cloudflare') || text.includes('Just a moment...');

      results.push({
        name: p.name,
        path: p.path,
        status,
        durationMs: Math.round(elapsed),
        bytes: bodyLen,
        xVercelId,
        xVercelCache,
        cfRay,
        is429,
        isWaf,
        success: ok && !is429 && !isWaf
      });
    } catch (e) {
      const elapsed = performance.now() - t0;
      results.push({
        name: p.name,
        path: p.path,
        status: 0,
        durationMs: Math.round(elapsed),
        bytes: 0,
        xVercelId: null,
        cfRay: null,
        is429: false,
        isWaf: false,
        success: false,
        error: e.message
      });
    }
  }
  return results;
}

function parseAuditLog() {
  if (!fs.existsSync(auditLogPath)) {
    return { exists: false, total_executed: 0, successful_requests: 0, failed_requests: 0, latencies_ms: [] };
  }
  const content = fs.readFileSync(auditLogPath, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return { exists: true, ...parsed };
  } catch (err) {
    return { exists: true, error: err.message, total_executed: 0, successful_requests: 0, failed_requests: 0, latencies_ms: [] };
  }
}

function computeLatencyPercentiles(latencies) {
  if (!latencies || latencies.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = Math.round((sum / sorted.length) * 10) / 10;

  const getPercentile = (pct) => {
    const idx = Math.min(Math.floor(sorted.length * pct), sorted.length - 1);
    return sorted[idx];
  };

  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    p50: getPercentile(0.50),
    p90: getPercentile(0.90),
    p95: getPercentile(0.95),
    p99: getPercentile(0.99)
  };
}

async function runAudit() {
  console.log('=== STARTING DEVNODE TELEMETRY & UNIVERSAL PERFORMANCE AUDIT ===\n');

  // 1. Devnode Miner Query
  console.log('Fetching miner #6137 and registration #6162 from Devnode API...');
  const devnode = await fetchDevnodeMiners();
  const miner6137 = devnode.miner6137;
  const miner6162 = devnode.miner6162;

  // 2. Audit Evidence Log
  console.log('Reading organic-workflow-audit-log.json...');
  const auditLog = parseAuditLog();
  const latencies = auditLog.latencies_ms || [];
  const percentiles = computeLatencyPercentiles(latencies);

  // Analyze transaction details in audit log
  const transactions = auditLog.recent_transactions || [];
  const rateLimitEvents = transactions.filter(t => t.status === 429);
  const wafEvents = transactions.filter(t => t.status === 403 || (t.summary && t.summary.includes('Cloudflare')));
  const non200Events = transactions.filter(t => t.status !== 200);

  // Count by intent
  const intentCounts = {};
  for (const t of transactions) {
    intentCounts[t.intent] = (intentCounts[t.intent] || 0) + 1;
  }

  // 3. Probe Warm Endpoints
  console.log('Probing warm execution & edge routing on praman-desk.vercel.app across 10 endpoints...');
  const probeResults = await probeWarmEndpoints();
  const probeLatencies = probeResults.filter(p => p.success).map(p => p.durationMs);
  const probePercentiles = computeLatencyPercentiles(probeLatencies);

  const report = {
    timestamp: new Date().toISOString(),
    devnode_network: {
      total_miners: devnode.totalMinersInNetwork,
      network_max_epoch: devnode.maxEpochNetwork,
      miners_in_max_epoch: devnode.minersInMaxEpoch,
      miner_6137: {
        id: TARGET_MINER_ID,
        slug: miner6137?.slug,
        name: miner6137?.name,
        activation_status: miner6137?.activation_status,
        total_requests_served: miner6137?.total_requests_served,
        wallet_address: miner6137?.wallet_address,
        base_url: miner6137?.base_url,
        scored: miner6137?.scored,
        last_scored_epoch: miner6137?.last_scored_epoch,
        last_scored_at: miner6137?.last_scored_at,
        scores_count: miner6137?.scores?.length || 0,
        scores: miner6137?.scores || []
      },
      miner_6162_ingestion: {
        id: NEW_REGISTRATION_ID,
        ingested: miner6162 !== null,
        details: miner6162 ? {
          slug: miner6162.slug,
          status: miner6162.activation_status,
          intents_count: miner6162.supported_intents?.length
        } : 'Pending Devnode cron / indexer sync from Sepolia Diamond tx 0x5566d8c5... (block 12187735)'
      }
    },
    organic_workflow_audit: {
      log_exists: auditLog.exists,
      started_at: auditLog.started_at,
      total_executed: auditLog.total_executed,
      successful_requests: auditLog.successful_requests,
      failed_requests: auditLog.failed_requests,
      success_rate_pct: auditLog.total_executed > 0 
        ? ((auditLog.successful_requests / auditLog.total_executed) * 100).toFixed(1) + '%' 
        : 'N/A',
      rate_limit_429_count: rateLimitEvents.length,
      waf_block_count: wafEvents.length,
      non_200_count: non200Events.length,
      intent_distribution: intentCounts,
      latency_percentiles_ms: percentiles
    },
    warm_execution_probes: {
      probes_executed: probeResults.length,
      probes_successful: probeResults.filter(p => p.success).length,
      probe_latencies_ms: probePercentiles,
      probe_details: probeResults
    }
  };

  console.log('\n=== AUDIT SUMMARY REPORT ===');
  console.log(`Devnode Network: ${report.devnode_network.total_miners} Miners | Network Max Epoch: ${report.devnode_network.network_max_epoch} (${report.devnode_network.miners_in_max_epoch} miners transitioned)`);
  console.log(`Miner #6137: ${report.devnode_network.miner_6137.activation_status} | Requests Served: ${report.devnode_network.miner_6137.total_requests_served}`);
  console.log(`Miner #6137 Scored Intents: ${report.devnode_network.miner_6137.scores_count} intents in Epoch ${report.devnode_network.miner_6137.last_scored_epoch}`);
  console.log(`Miner #6162 Ingestion Status: ${report.devnode_network.miner_6162_ingestion.ingested ? 'INGESTED' : 'PENDING DEVNODE SYNC'}`);
  console.log(`--- Organic Workflow Cumulative Batch ---`);
  console.log(`Total Executed: ${report.organic_workflow_audit.total_executed}`);
  console.log(`Successful: ${report.organic_workflow_audit.successful_requests} | Failed: ${report.organic_workflow_audit.failed_requests} (Success Rate: ${report.organic_workflow_audit.success_rate_pct})`);
  console.log(`Rate-limit 429: ${report.organic_workflow_audit.rate_limit_429_count} | WAF Blocks: ${report.organic_workflow_audit.waf_block_count}`);
  console.log(`Organic Batch Latencies (ms) -> Min: ${percentiles.min}, Avg: ${percentiles.avg}, P50: ${percentiles.p50}, P90: ${percentiles.p90}, P95: ${percentiles.p95}, Max: ${percentiles.max}`);
  console.log(`--- Warm Live Probe Latencies (10 Endpoints) ---`);
  console.log(`Live Probe Latencies (ms) -> Min: ${probePercentiles.min}, Avg: ${probePercentiles.avg}, P50: ${probePercentiles.p50}, P95: ${probePercentiles.p95}, Max: ${probePercentiles.max}`);
  
  return report;
}

runAudit()
  .then(report => {
    const outPath = path.join(rootDir, 'evidence', 'telemetry-audit-report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nAudit report written to: ${outPath}`);
  })
  .catch(err => {
    console.error('Audit run failed:', err);
    process.exit(1);
  });
