import zlib from 'node:zlib';

/**
 * Wholesale Grid Power & LMP Pricing Module
 * Queries live keyless CAISO OASIS SingleZip CSV API for CAISO nodes (NP15/SP15/ZP26).
 * Fails closed / reports `live_feed_unavailable` for blocked or unsupported ISOs (e.g., ERCOT 403)
 * rather than stamping static fallback numbers with current timestamps.
 */

const CAISO_NODE_MAP = {
  NP15: { node: 'TH_NP15_GEN-APND', hub: 'NP15 (North of Path 15)' },
  SP15: { node: 'TH_SP15_GEN-APND', hub: 'SP15 (South of Path 15)' },
  ZP26: { node: 'TH_ZP26_GEN-APND', hub: 'ZP26 (Central Valley)' },
  PGAE: { node: 'DLAP_PGAE-APND', hub: 'PG&E Default Load Aggregation Point' },
  SCE: { node: 'DLAP_SCE-APND', hub: 'SCE Default Load Aggregation Point' },
  SDGE: { node: 'DLAP_SDGE-APND', hub: 'SDG&E Default Load Aggregation Point' },
  VEA: { node: 'DLAP_VEA-APND', hub: 'Valley Electric Association DLAP' }
};

const caisoLiveCache = new Map();

function inflateZipSingleCsv(buf) {
  return new Promise((resolve, reject) => {
    if (!buf || buf.length < 30 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
      return reject(new Error('Invalid CAISO OASIS ZIP payload'));
    }
    const fnLen = buf.readUInt16LE(26);
    const exLen = buf.readUInt16LE(28);
    const compMethod = buf.readUInt16LE(8);
    const start = 30 + fnLen + exLen;
    const cdIdx = buf.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    const compData = buf.subarray(start, cdIdx > start ? cdIdx : buf.length);

    if (compMethod === 0) return resolve(compData.toString('utf8'));
    if (compMethod !== 8) return reject(new Error(`Unsupported ZIP method ${compMethod}`));

    const inf = new zlib.InflateRaw();
    const chunks = [];
    inf.on('data', c => chunks.push(c));
    inf.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    inf.on('error', () => {
      if (chunks.length > 0) resolve(Buffer.concat(chunks).toString('utf8'));
      else reject(new Error('Failed to inflate CAISO OASIS CSV'));
    });
    inf.end(compData);
  });
}

function parseCaisoCsvLmp(csvText, preferredStartMs = null) {
  const lines = String(csvText || '').trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const headers = lines[0].split(',').map(s => s.trim());
  const idxItem = headers.indexOf('LMP_TYPE');
  let idxMw = headers.indexOf('MW');
  if (idxMw === -1) idxMw = headers.indexOf('VALUE');
  const idxStart = headers.indexOf('INTERVALSTARTTIME_GMT');
  let idxNode = headers.indexOf('NODE');
  if (idxNode === -1) idxNode = headers.indexOf('NODE_ID');
  if (idxItem === -1 || idxMw === -1) return null;

  const byInterval = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length <= Math.max(idxItem, idxMw)) continue;
    const lmpType = (cols[idxItem] || '').trim();
    const mw = Number((cols[idxMw] || '').trim());
    if (!Number.isFinite(mw)) continue;
    const startKey = (idxStart !== -1 && cols[idxStart]) ? cols[idxStart].trim() : 'default';
    if (!byInterval.has(startKey)) {
      byInterval.set(startKey, {
        intervalStart: startKey === 'default' ? null : startKey,
        node: (idxNode !== -1 && cols[idxNode]) ? cols[idxNode].trim() : null
      });
    }
    const bucket = byInterval.get(startKey);
    bucket[lmpType] = mw;
    if (!bucket.node && idxNode !== -1 && cols[idxNode]) bucket.node = cols[idxNode].trim();
  }

  const validBuckets = [...byInterval.values()].filter(b => typeof b.LMP === 'number');
  if (!validBuckets.length) return null;
  if (validBuckets.length === 1) return validBuckets[0];

  validBuckets.sort((a, b) => Date.parse(a.intervalStart || '') - Date.parse(b.intervalStart || ''));
  if (Number.isFinite(preferredStartMs)) {
    let best = validBuckets[0];
    let bestDiff = Infinity;
    for (const b of validBuckets) {
      const t = Date.parse(b.intervalStart || '');
      if (Number.isFinite(t)) {
        const diff = Math.abs(t - preferredStartMs);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = b;
        }
      }
    }
    return best;
  }
  return validBuckets[validBuckets.length - 1];
}

export async function getLiveGridPowerPrice({
  node_or_zone = '',
  interval_start = '',
  hub = '',
  iso = '',
  market = 'DAM',
  query = '',
  text = '',
  prompt = ''
} = {}) {
  const nodeOrZone = String(node_or_zone || hub || iso || '').trim();
  const raw = [nodeOrZone, market, query, text, prompt, interval_start].filter(Boolean).join(' ');

  if (/ERCOT|PJM|MISO|NYISO|SPP|houston|pecos|texas/i.test(raw) && !/CAISO|NP15|SP15|ZP26|PGAE|SCE|SDGE|DLAP/i.test(raw)) {
    const requested = nodeOrZone || 'ERCOT/Other ISO';
    const summary = `GRID POWER LIVE FEED UNAVAILABLE: Public keyless JSON endpoint for "${requested}" is blocked or requires authenticated API credentials. No synthetic placeholder price emitted.`;
    return {
      ok: false,
      status: 'live_feed_unavailable',
      lmp_usd_per_mwh: null,
      node_or_zone: requested,
      market: String(market || 'DAM').toUpperCase(),
      interval_start: interval_start || null,
      currency: 'USD',
      verdict: 'LIVE_FEED_UNAVAILABLE',
      summary,
      explanation: summary,
      reason: summary,
      answer: summary,
      results: [summary],
      confidence: 0.0,
      intent: 'GRID_POWER_PRICE_GENERAL',
      as_of: new Date().toISOString()
    };
  }

  let hubKey = 'NP15';
  if (/SP15|south.*path\s*15/i.test(raw)) hubKey = 'SP15';
  else if (/ZP26|central\s*valley/i.test(raw)) hubKey = 'ZP26';
  else if (/PGAE|PG&E/i.test(raw)) hubKey = 'PGAE';
  else if (/\bSCE\b/i.test(raw)) hubKey = 'SCE';
  else if (/SDGE|SDG&E/i.test(raw)) hubKey = 'SDGE';
  else if (/\bVEA\b/i.test(raw)) hubKey = 'VEA';

  const mapped = CAISO_NODE_MAP[hubKey];
  const resolvedNode = /^(?:TH_|DLAP_)/i.test(nodeOrZone) ? nodeOrZone.toUpperCase() : mapped.node;
  const marketRun = /\brtm\b|real[-\s]?time/i.test(raw) ? 'RTM' : 'DAM';

  const explicitIntervalMatch = String(interval_start || raw.match(/\b(20\d{2}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)\b/)?.[1] || '').trim();
  const parsedExplicitMs = explicitIntervalMatch ? Date.parse(explicitIntervalMatch) : NaN;
  const hasExplicitInterval = Number.isFinite(parsedExplicitMs);
  const baseDate = hasExplicitInterval ? new Date(parsedExplicitMs) : new Date(Date.now() - 2 * 3600 * 1000);
  const pad = n => String(n).padStart(2, '0');

  // If explicit interval_start was provided, query strictly that hour; otherwise allow -1h fallback if current operating hour is not yet posted
  const candidateOffsets = hasExplicitInterval ? [0] : [0, -3600 * 1000];
  let lastError = null;

  for (const offsetMs of candidateOffsets) {
    const targetDate = new Date(baseDate.getTime() + offsetMs);
    const ymd = `${targetDate.getUTCFullYear()}${pad(targetDate.getUTCMonth() + 1)}${pad(targetDate.getUTCDate())}`;
    const hr = pad(targetDate.getUTCHours());
    const nextHrDate = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), Number(hr) + 1, 0, 0));
    const ymdEnd = `${nextHrDate.getUTCFullYear()}${pad(nextHrDate.getUTCMonth() + 1)}${pad(nextHrDate.getUTCDate())}`;
    const hrEnd = pad(nextHrDate.getUTCHours());

    const queryName = marketRun === 'RTM' ? 'PRC_INTVL_LMP' : 'PRC_LMP';
    const version = marketRun === 'RTM' ? '3' : '12';
    const oasisUrl = `https://oasis.caiso.com/oasisapi/SingleZip?resultformat=6&queryname=${queryName}&version=${version}&startdatetime=${ymd}T${hr}:00-0000&enddatetime=${ymdEnd}T${hrEnd}:00-0000&market_run_id=${marketRun}&node=${encodeURIComponent(resolvedNode)}`;

    const cacheKey = `${resolvedNode}|${marketRun}|${ymd}${hr}|${hasExplicitInterval ? Math.floor(parsedExplicitMs / 300000) : 'auto'}`;
    const cached = caisoLiveCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 60000) {
      return { ...cached.payload, as_of: new Date().toISOString() };
    }

    try {
      let resp = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          resp = await fetch(oasisUrl, { signal: AbortSignal.timeout(9500) });
          if (resp.ok) break;
        } catch (retryErr) {
          if (attempt === 2) throw retryErr;
        }
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
      if (resp && resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        const csv = await inflateZipSingleCsv(buf);
        const parsed = parseCaisoCsvLmp(csv, hasExplicitInterval ? parsedExplicitMs : null);
        if (parsed && typeof parsed.LMP === 'number') {
          const priceMwh = Math.round(parsed.LMP * 10000) / 10000;
          const energy = parsed.MCE !== undefined ? Math.round(parsed.MCE * 10000) / 10000 : null;
          const cong = parsed.MCC !== undefined ? Math.round(parsed.MCC * 10000) / 10000 : null;
          const loss = parsed.MCL !== undefined ? Math.round(parsed.MCL * 10000) / 10000 : null;
          const intervalOut = parsed.intervalStart || `${targetDate.toISOString().slice(0, 13)}:00:00Z`;
          const summary = `GRID POWER PRICE (LIVE CAISO OASIS): ${mapped.hub} ${marketRun} LMP = $${priceMwh.toFixed(2)}/MWh ($${(priceMwh / 1000).toFixed(4)}/kWh) for interval ${intervalOut}. Node: ${resolvedNode}.${cong !== null ? ` MCC: $${cong.toFixed(2)}.` : ''}`;
          const result = {
            ok: true,
            status: 'confirmed',
            lmp_usd_per_mwh: priceMwh,
            node_or_zone: resolvedNode,
            market: marketRun,
            interval_start: intervalOut,
            currency: 'USD',
            hub: mapped.hub,
            iso: 'CAISO',
            node_id: resolvedNode,
            price_mwh: priceMwh,
            price_kwh: Math.round((priceMwh / 1000) * 1e6) / 1e6,
            energy_component: energy,
            congestion_component: cong,
            loss_component: loss,
            verdict: 'SETTLEMENT_PRICE_VERIFIED',
            summary,
            explanation: summary,
            reason: summary,
            answer: summary,
            results: [summary],
            confidence: 1.0,
            intent: 'GRID_POWER_PRICE_GENERAL',
            provenance: {
              source_kind: 'iso_rto_market_operator',
              source_url: oasisUrl,
              authority: 'California Independent System Operator (CAISO) OASIS Live API'
            },
            as_of: new Date().toISOString()
          };
          caisoLiveCache.set(cacheKey, { ts: Date.now(), payload: result });
          return result;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    const summary = `GRID POWER LIVE FEED UNAVAILABLE: CAISO OASIS query failed (${lastError.message}). No synthetic price emitted.`;
    return {
      ok: false,
      status: 'live_feed_unavailable',
      lmp_usd_per_mwh: null,
      node_or_zone: resolvedNode,
      market: marketRun,
      interval_start: interval_start || null,
      currency: 'USD',
      verdict: 'LIVE_FEED_UNAVAILABLE',
      summary,
      explanation: summary,
      reason: summary,
      answer: summary,
      results: [summary],
      confidence: 0.0,
      intent: 'GRID_POWER_PRICE_GENERAL',
      as_of: new Date().toISOString()
    };
  }

  const summary = `GRID POWER LIVE FEED UNAVAILABLE: CAISO OASIS returned no LMP rows for ${resolvedNode} (${marketRun}).`;
  return {
    ok: false,
    status: 'live_feed_unavailable',
    lmp_usd_per_mwh: null,
    node_or_zone: resolvedNode,
    market: marketRun,
    interval_start: interval_start || null,
    currency: 'USD',
    verdict: 'LIVE_FEED_UNAVAILABLE',
    summary,
    explanation: summary,
    reason: summary,
    answer: summary,
    results: [summary],
    confidence: 0.0,
    intent: 'GRID_POWER_PRICE_GENERAL',
    as_of: new Date().toISOString()
  };
}

/**
 * Synchronous stub deprecated for live telemetry — retained only so legacy callers fail transparently.
 */
export function getGridPowerPrice(params = {}) {
  const hub = String(params.node_or_zone || params.hub || params.iso || 'NP15').trim();
  const summary = `Synchronous static grid pricing disabled for ${hub}. Call async getLiveGridPowerPrice() for live CAISO OASIS telemetry.`;
  return {
    ok: false,
    status: 'deprecated_sync_stub',
    lmp_usd_per_mwh: null,
    node_or_zone: hub,
    verdict: 'DEPRECATED_SYNC_CALL',
    summary,
    explanation: summary,
    confidence: 0.0,
    intent: 'GRID_POWER_PRICE_GENERAL'
  };
}
