import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const scratchDir = path.join(rootDir, 'scratch');
const statePath = path.join(scratchDir, 'autonomous-state.json');

const PROD_BASE = process.env.PRAMAN_BASE_URL || 'https://praman-desk.vercel.app';
const DEVNODE_BASE = 'https://devnode.telegraphprotocol.com';
const GITHUB_REPO = 'VishAlgoDev/praman-desk';

async function fetchJsonSafe(url, opts = {}) {
  const start = Date.now();
  let lastError = 'Unknown fetch error';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PramanDesk-AutonomousMonitor/1.0',
          ...(opts.headers || {})
        },
        signal: AbortSignal.timeout(opts.timeoutMs || 15000)
      });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      return {
        ok: res.ok,
        status: res.status,
        latencyMs: Date.now() - start,
        json,
        error: res.ok ? null : `HTTP ${res.status}: ${text.slice(0, 200)}`
      };
    } catch (err) {
      lastError = err.message;
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
  }
  return {
    ok: false,
    status: 0,
    latencyMs: Date.now() - start,
    json: null,
    error: lastError
  };
}

async function main() {
  const prevState = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
    : null;

  const probes = {};
  const failures = [];

  // 1. Live Production Health & UI
  const health = await fetchJsonSafe(`${PROD_BASE}/api/health`);
  probes.health = { ok: health.ok && Boolean(health.json?.ok), latencyMs: health.latencyMs, wasmLoaded: health.json?.wasmLoaded, sdnEntries: health.json?.sdnEntriesLoaded };
  if (!probes.health.ok) failures.push(`Health probe failed: ${health.error}`);

  // 2. Spend Guard Firewall Scenarios (1, 2, 3)
  const s1 = await fetchJsonSafe(`${PROD_BASE}/api/spend-guard/evaluate?scenario=phishing_sanctions`);
  const s2 = await fetchJsonSafe(`${PROD_BASE}/api/spend-guard/evaluate?scenario=arithmetic_overcharge`);
  const s3 = await fetchJsonSafe(`${PROD_BASE}/api/spend-guard/evaluate?scenario=compliant_payout`);

  probes.scenario1_phishing = {
    ok: s1.ok && s1.json?.status === 'HALTED' && s1.json?.recipientVerification?.sanctionsScreeningClear === false,
    status: s1.json?.status,
    flag: s1.json?.flags?.[0] || null,
    latencyMs: s1.latencyMs
  };
  if (!probes.scenario1_phishing.ok) failures.push('Scenario 1 phishing_sanctions probe failed');

  probes.scenario2_overcharge = {
    ok: s2.ok && s2.json?.status === 'HALTED' && s2.json?.mathVerification?.wasmScoreBps === 0 && s2.json?.vendorVerification?.gleifVerified === true,
    status: s2.json?.status,
    discrepancyCents: s2.json?.mathVerification?.discrepancyCents,
    wasmScoreBps: s2.json?.mathVerification?.wasmScoreBps,
    lei: s2.json?.vendorVerification?.lei,
    latencyMs: s2.latencyMs
  };
  if (!probes.scenario2_overcharge.ok) failures.push('Scenario 2 arithmetic_overcharge probe failed');

  probes.scenario3_compliant = {
    ok: s3.ok && s3.json?.status === 'APPROVED' && s3.json?.mathVerification?.wasmScoreBps === 10000 && s3.json?.vendorVerification?.gleifVerified === true,
    status: s3.json?.status,
    lei: s3.json?.vendorVerification?.lei,
    wasmScoreBps: s3.json?.mathVerification?.wasmScoreBps,
    latencyMs: s3.latencyMs
  };
  if (!probes.scenario3_compliant.ok) failures.push('Scenario 3 compliant_payout probe failed');

  // 3. Hardened Miner Endpoints (Devnode Parity Checks)
  const mCorp = await fetchJsonSafe(`${PROD_BASE}/api/miner/corporate-registry?company=NVIDIA%20Corporation&jurisdiction=US`);
  probes.miner_corporate = {
    ok: mCorp.ok && mCorp.json?.found === true && Boolean(mCorp.json?.registration_id),
    lei: mCorp.json?.registration_id,
    latencyMs: mCorp.latencyMs
  };
  if (!probes.miner_corporate.ok) failures.push('Miner corporate-registry probe failed');

  const mSanc = await fetchJsonSafe(`${PROD_BASE}/api/miner/sanctions-screen?name=${encodeURIComponent("Screen 'Banco Nacional de Cuba, DOB 1974, Cuba' against the OFAC SDN and EU lists")}`);
  probes.miner_sanctions = {
    ok: mSanc.ok && mSanc.json?.matched === true,
    matched: mSanc.json?.matched,
    top: mSanc.json?.matches?.[0]?.matched_name || null,
    latencyMs: mSanc.latencyMs
  };
  if (!probes.miner_sanctions.ok) failures.push('Miner sanctions-screen NL wrapper probe failed');

  const mFile = await fetchJsonSafe(`${PROD_BASE}/api/miner/regulatory-filing?company=${encodeURIComponent('How many Form 10-Q filings by Tesla, Inc. (CIK 1318605) in calendar 2023 are on SEC EDGAR?')}`);
  probes.miner_filing = {
    ok: mFile.ok && mFile.json?.found === true && mFile.json?.from === '2023-01-01' && mFile.json?.to === '2023-12-31' && mFile.json?.filing_count >= 3,
    entity: mFile.json?.entity,
    from: mFile.json?.from,
    to: mFile.json?.to,
    filingCount: mFile.json?.filing_count,
    latencyMs: mFile.latencyMs
  };
  if (!probes.miner_filing.ok) failures.push('Miner regulatory-filing NL calendar year probe failed');

  const ledger = await fetchJsonSafe(`${PROD_BASE}/api/ledger`);
  probes.ledger = {
    ok: ledger.ok && Array.isArray(ledger.json?.calls) && ledger.json.calls.length > 0,
    totalPaidCalls: ledger.json?.totalPaidCalls || ledger.json?.calls?.length || 0,
    latencyMs: ledger.latencyMs
  };

  const mGoOpt = await fetchJsonSafe(`${PROD_BASE}/api/miner/sanctions-screen?optional=${encodeURIComponent('map[name:Rosneft Oil Company]')}`);
  probes.miner_go_optional = {
    ok: mGoOpt.ok && mGoOpt.json?.matched === true && (mGoOpt.json?.match_count || 0) > 0,
    matched: mGoOpt.json?.matched,
    matchCount: mGoOpt.json?.match_count,
    latencyMs: mGoOpt.latencyMs
  };
  if (!probes.miner_go_optional.ok) failures.push('Miner Go optional=map[...] unpacking probe failed');

  const mcpBatch = await fetchJsonSafe(`${PROD_BASE}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-03-26', clientInfo: { name: 'autonomous-monitor', version: '1.0' } }
      },
      { jsonrpc: '2.0', id: 2, method: 'tools/list' }
    ])
  });
  probes.mcp_http = {
    ok: mcpBatch.ok && Array.isArray(mcpBatch.json) && mcpBatch.json[0]?.result?.serverInfo?.name === 'praman-spend-guard' && mcpBatch.json[1]?.result?.tools?.length === 10,
    protocolVersion: mcpBatch.json?.[0]?.result?.protocolVersion || null,
    toolsCount: mcpBatch.json?.[1]?.result?.tools?.length || 0,
    latencyMs: mcpBatch.latencyMs
  };
  if (!probes.mcp_http.ok) failures.push('Streamable HTTP /api/mcp probe failed');

  // 4. Devnode Miner Telemetry (#5281 / #5289)
  let devMiners = await fetchJsonSafe(`${DEVNODE_BASE}/api/miners`, { timeoutMs: 35000 });
  if (!devMiners.ok) {
    // Retry once on transient network/load timeout (2.7MB payload)
    devMiners = await fetchJsonSafe(`${DEVNODE_BASE}/api/miners`, { timeoutMs: 40000 });
  }
  const minerList = Array.isArray(devMiners.json?.miners) ? devMiners.json.miners : (Array.isArray(devMiners.json) ? devMiners.json : []);
  const ourMiner = minerList.find(m => String(m.id) === '5281' || m.slug === 'praman-compliance-miner') || null;
  const direct5289 = await fetchJsonSafe(`${DEVNODE_BASE}/api/miners/5289`, { timeoutMs: 15000 });

  const prevKnownByIntent = { ...(prevState?.devnode?.lastKnownByIntent || {}) };
  for (const oldScore of (prevState?.devnode?.scores || [])) {
    if (oldScore?.intent && !prevKnownByIntent[oldScore.intent]) {
      prevKnownByIntent[oldScore.intent] = { epoch: oldScore.epoch, rank: oldScore.rank, score: oldScore.score };
    }
  }
  const lastKnownByIntent = { ...prevKnownByIntent };
  const currentScores = Array.isArray(ourMiner?.scores)
    ? ourMiner.scores.map(s => ({ intent: s.intent_id, epoch: s.epoch_id, rank: s.rank, score: s.score }))
    : (devMiners.ok ? [] : (prevState?.devnode?.scores || []));

  // Detect Devnode deltas and cross-epoch regressions against persistent intent watermarks
  const deltas = [];
  const regressions = [];
  if (prevState?.devnode && devMiners.ok && ourMiner) {
    if (prevState.devnode.lastScoredEpoch !== (ourMiner?.last_scored_epoch ?? null)) {
      deltas.push(`Devnode epoch changed: ${prevState.devnode.lastScoredEpoch} -> ${ourMiner?.last_scored_epoch ?? null}`);
    }
    if (prevState.devnode.totalRequestsServed !== (ourMiner?.total_requests_served ?? null)) {
      deltas.push(`Requests served changed: ${prevState.devnode.totalRequestsServed} -> ${ourMiner?.total_requests_served ?? null}`);
    }
  } else if (!devMiners.ok) {
    deltas.push('Devnode miners list fetch transiently timed out; persistent watermarks preserved');
  }

  for (const s of currentScores) {
    const old = prevKnownByIntent[s.intent];
    if (!old || old.score !== s.score || old.rank !== s.rank || old.epoch !== s.epoch) {
      deltas.push(`Score delta [${s.intent}] (e${old?.epoch ?? '?'}->e${s.epoch}): score ${old?.score ?? 'none'}->${s.score}, rank ${old?.rank ?? 'none'}->${s.rank}`);
    }
    if (old) {
      if (typeof old.score === 'number' && typeof s.score === 'number' && s.score < old.score - 0.005) {
        regressions.push(`Score drop [${s.intent}]: ${old.score} (e${old.epoch}) -> ${s.score} (e${s.epoch})`);
      }
      if (typeof old.rank === 'number' && typeof s.rank === 'number' && s.rank > old.rank) {
        regressions.push(`Rank drop [${s.intent}]: #${old.rank} (e${old.epoch}) -> #${s.rank} (e${s.epoch})`);
      }
    }
    lastKnownByIntent[s.intent] = { epoch: s.epoch, rank: s.rank, score: s.score, updatedAt: new Date().toISOString() };
  }

  const devnodeSnapshot = {
    fetchedOk: devMiners.ok,
    miner5281Found: Boolean(ourMiner),
    miner5289Ok: direct5289.ok,
    lastScoredEpoch: ourMiner?.last_scored_epoch ?? (devMiners.ok ? null : (prevState?.devnode?.lastScoredEpoch ?? null)),
    lastScoredAt: ourMiner?.last_scored_at ?? (devMiners.ok ? null : (prevState?.devnode?.lastScoredAt ?? null)),
    totalRequestsServed: ourMiner?.total_requests_served ?? (devMiners.ok ? null : (prevState?.devnode?.totalRequestsServed ?? null)),
    scores: currentScores,
    lastKnownByIntent
  };

  // 5. GitHub Issues & Comments Monitor
  const ghIssues = await fetchJsonSafe(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=10`);
  const githubSummary = {
    ok: ghIssues.ok,
    openIssues: Array.isArray(ghIssues.json) ? ghIssues.json.filter(i => i.state === 'open').length : null,
    latestIssueNumber: Array.isArray(ghIssues.json) && ghIssues.json[0] ? ghIssues.json[0].number : null,
    latestUpdatedAt: Array.isArray(ghIssues.json) && ghIssues.json[0] ? ghIssues.json[0].updated_at : null
  };
  if (prevState?.github && prevState.github.latestUpdatedAt !== githubSummary.latestUpdatedAt) {
    deltas.push(`GitHub activity updated: ${prevState.github.latestUpdatedAt} -> ${githubSummary.latestUpdatedAt}`);
  }

  const nextState = {
    checkedAt: new Date().toISOString(),
    prodBase: PROD_BASE,
    allProbesOk: failures.length === 0,
    failures,
    regressions,
    probes,
    devnode: devnodeSnapshot,
    github: githubSummary,
    deltas
  };

  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(nextState, null, 2));

  console.log('=== Praman Desk Autonomous Monitor Report ===');
  console.log(`Timestamp: ${nextState.checkedAt}`);
  console.log(`Production Base: ${PROD_BASE}`);
  console.log(`Overall Probe Status: ${failures.length === 0 ? 'ALL GREEN (0 FAILURES)' : `DEGRADED (${failures.length} FAILURES)`}`);
  if (failures.length) console.log('Failures:', failures);
  if (regressions.length) console.log('Regressions:', regressions);
  console.log('Devnode #5281/#5289:', JSON.stringify(devnodeSnapshot));
  console.log('GitHub Repo:', JSON.stringify(githubSummary));
  console.log('Deltas:', deltas.length ? deltas : ['No changes since last cycle']);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Fatal autonomous-cycle error:', err);
  process.exit(1);
});
