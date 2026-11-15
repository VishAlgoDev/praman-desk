import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sdnPath = path.join(rootDir, 'data', 'sdn-snapshot.json');
const outDir = path.join(rootDir, 'eval-data');
const outPath = path.join(outDir, 'pairs_sanctions_v4.jsonl');

// Deterministic PRNG (Mulberry32) for exact reproducibility
function createRng(seed = 20261115) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLEAN_ENTITIES = [
  'Apple Inc.',
  'SAP SE',
  'Siemens Aktiengesellschaft',
  'HSBC Holdings plc',
  'AIA Group Limited',
  'Monzo Bank Limited',
  'Infosys Limited',
  'Stripe, LLC',
  'Microsoft Corporation',
  'Alphabet Inc.',
  'Volkswagen AG',
  'Toyota Motor Corporation',
  'Roche Holding AG',
  'Novartis AG',
  'BNP Paribas SA',
  'Nestle S.A.',
  'Sony Group Corporation',
  'ASML Holding N.V.',
  'Taiwan Semiconductor Manufacturing Company',
  'Shopify Inc.',
  'Airbus SE',
  'Honeywell International Inc.',
  'Caterpillar Inc.',
  'Deere & Company',
  'AstraZeneca PLC',
  'Unilever PLC',
  'LVMH Moet Hennessy Louis Vuitton',
  'Costco Wholesale Corporation',
  'Starbucks Corporation',
  'Accenture plc',
  'Adobe Inc.',
  'Salesforce, Inc.',
  'Oracle Corporation',
  'Cisco Systems, Inc.',
  'Intel Corporation',
  'Qualcomm Incorporated',
  'Texas Instruments Incorporated',
  'Broadcom Inc.',
  'Reliance Industries Limited',
  'Tata Consultancy Services Limited',
  'DBS Group Holdings Ltd',
  'Oversea-Chinese Banking Corporation',
  'Commonwealth Bank of Australia',
  'Royal Bank of Canada',
  'Toronto-Dominion Bank',
  'Zurich Insurance Group AG',
  'Allianz SE',
  'Munich Reinsurance Company',
  'Deutsche Post AG',
  'Maersk A/S',
  'AliExpress Logistics Services Ltd',
  'Muhammad Ali Memorial Foundation',
  'Kieran Patel',
  'Elena Rostova-Miller',
  'David Chen'
];

const QUERY_TEMPLATES = [
  (name) => `Screen entity '${name}' against the US Treasury OFAC SDN list.`,
  (name) => `Is '${name}' currently designated on US Treasury OFAC sanctions lists?`,
  (name) => `Perform sanctions compliance screening for counterparty: ${name}`,
  (name) => `Check whether '${name}' appears on OFAC SDN or primary alias registries.`,
  (name) => `Evaluate OFAC sanctions exposure before releasing payment to ${name}.`,
  (name) => `Does '${name}' match any Specially Designated National (SDN) entry?`
];

const PROGRAMS = ['SDGT', 'RUSSIA-EO14024', 'CUBA', 'IRAN', 'DPRK2', 'CYBER2', 'BALKANS', 'SDNTK', 'VENEZUELA'];

function flipCommaName(name) {
  const parts = name.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) return name;
  return `${parts[1]} ${parts[0]}`.replace(/\s+/g, ' ').trim();
}

// Identical neutral generators regardless of label (zero surface-tell vocabulary)
function makeResponse(formatIdx, { queryName, isMatch, uid, matchedName, program, refId }) {
  const listLabel = 'US Treasury OFAC SDN';
  const neutralSummary = isMatch
    ? `Screened "${queryName}" against ${listLabel}: matched record "${matchedName}" (UID ${uid}, Program ${program}). Ref #${refId}.`
    : `Screened "${queryName}" against ${listLabel}: 0 active or alias matches identified. Ref #${refId}.`;

  if (formatIdx === 0) {
    return JSON.stringify({
      matched: isMatch,
      match_found: isMatch,
      match_count: isMatch ? 1 : 0,
      matches: isMatch ? [{ sdn_uid: String(uid), matched_name: matchedName, programs: program }] : [],
      lists: [listLabel],
      summary: neutralSummary
    });
  }
  if (formatIdx === 1) {
    return JSON.stringify({
      subject: queryName,
      status: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      risk: isMatch ? 'CRITICAL' : 'LOW',
      hits: isMatch ? [{ source: 'OFAC_SDN', id: Number(uid), name: matchedName, program }] : [],
      notes: neutralSummary
    });
  }
  if (formatIdx === 2) {
    return [
      `### OFAC SDN Screening Result: ${queryName}`,
      `| Field | Determination |`,
      `|---|---|`,
      `| Match Found | ${isMatch ? 'YES (Blocked)' : 'NO (Cleared)'} |`,
      `| SDN UID / Matched Record | ${isMatch ? `${uid} (${matchedName})` : 'None'} |`,
      `| Sanctions Program | ${isMatch ? program : 'N/A'} |`,
      `| Registry Source | ${listLabel} |`,
      `Summary: ${neutralSummary}`
    ].join('\n');
  }
  if (formatIdx === 3) {
    return isMatch
      ? `COMPLIANCE DETERMINATION [HOLD & FREEZE]: ${neutralSummary}`
      : `COMPLIANCE DETERMINATION [CLEARED]: ${neutralSummary}`;
  }
  return [
    `SANCTIONS_SCREENING_REPORT`,
    `- Query Entity: ${queryName}`,
    `- Screening Verdict: ${isMatch ? 'MATCH_DETECTED' : 'NO_MATCH'}`,
    `- Matched SDN Entry: ${isMatch ? `${matchedName} (UID: ${uid}, Program: ${program})` : 'None'}`,
    `- Summary: ${neutralSummary}`
  ].join('\n');
}

function buildPairs() {
  const sdnRaw = JSON.parse(fs.readFileSync(sdnPath, 'utf8'));
  const entries = (sdnRaw.entries || []).filter(
    (e) => Array.isArray(e) && e.length >= 4 && e[1] && e[1].length >= 5 && e[1].length <= 65 && /^[A-Za-z0-9 ,.'-]+$/.test(e[1])
  );
  const commaEntries = entries.filter((e) => e[1].includes(','));
  const rng = createRng(20261115);

  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const pairs = [];
  const usedWorse = new Set();

  // Balanced 5-format distribution with balanced class polarity (~50% clean better, ~50% match better):
  // - 45% (450): clean_vs_false_positive (better = CLEAR, worse = false MATCH)
  // - 25% (250): sdn_vs_false_negative (better = MATCH, worse = false CLEAR)
  // - 20% (200): comma_name_vs_miss (better = MATCH, worse = false CLEAR)
  // - 10% (100): sdn_vs_wrong_metadata (better = true UID/program, worse = wrong UID/entity/program)
  for (let i = 0; i < 1000; i++) {
    const betterFormat = Math.floor(rng() * 5);
    const worseFormat = Math.floor(rng() * 5);
    const template = QUERY_TEMPLATES[i % QUERY_TEMPLATES.length];
    const mod = i % 20;

    if (mod < 9) {
      // clean_vs_false_positive (450 pairs)
      const cleanName = CLEAN_ENTITIES[i % CLEAN_ENTITIES.length];
      const decoy = pick(entries);
      const decoyUid = String(decoy[0]);
      const decoyName = decoy[1];
      const decoyProg = (decoy[3] || pick(PROGRAMS)).split(';')[0].trim() || 'SDGT';
      const q = template(cleanName);

      const better = makeResponse(betterFormat, {
        queryName: cleanName,
        isMatch: false,
        uid: null,
        matchedName: null,
        program: null,
        refId: i
      });
      const worse = makeResponse(worseFormat, {
        queryName: cleanName,
        isMatch: true,
        uid: decoyUid,
        matchedName: decoyName,
        program: decoyProg,
        refId: i
      });
      if (!usedWorse.has(worse)) {
        usedWorse.add(worse);
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split: i < 850 ? 'train' : 'val', format_pair: `${betterFormat}->${worseFormat}`, archetype: 'clean_vs_false_positive', input: q, better, worse });
      }
      continue;
    }

    if (mod < 14) {
      // sdn_vs_false_negative (250 pairs)
      const rec = entries[(i * 7 + Math.floor(rng() * 13)) % entries.length];
      const [uid, sdnName, , prog] = rec;
      const cleanProg = (prog || 'SDGT').split(';')[0].trim() || 'SDGT';
      const q = template(sdnName);

      const better = makeResponse(betterFormat, {
        queryName: sdnName,
        isMatch: true,
        uid: String(uid),
        matchedName: sdnName,
        program: cleanProg,
        refId: i
      });
      const worse = makeResponse(worseFormat, {
        queryName: sdnName,
        isMatch: false,
        uid: null,
        matchedName: null,
        program: null,
        refId: i
      });
      if (!usedWorse.has(worse)) {
        usedWorse.add(worse);
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split: i < 850 ? 'train' : 'val', format_pair: `${betterFormat}->${worseFormat}`, archetype: 'sdn_vs_false_negative', input: q, better, worse });
      }
      continue;
    }

    if (mod < 18) {
      // comma_name_vs_miss (200 pairs)
      const rec = commaEntries[(i * 5 + 1) % commaEntries.length];
      const [uid, sdnName, , prog] = rec;
      const cleanProg = (prog || 'SDGT').split(';')[0].trim() || 'SDGT';
      const naturalName = flipCommaName(sdnName);
      const q = template(naturalName);

      const better = makeResponse(betterFormat, {
        queryName: naturalName,
        isMatch: true,
        uid: String(uid),
        matchedName: sdnName,
        program: cleanProg,
        refId: i
      });
      const worse = makeResponse(worseFormat, {
        queryName: naturalName,
        isMatch: false,
        uid: null,
        matchedName: null,
        program: null,
        refId: i
      });
      if (!usedWorse.has(worse)) {
        usedWorse.add(worse);
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split: i < 850 ? 'train' : 'val', format_pair: `${betterFormat}->${worseFormat}`, archetype: 'comma_name_vs_miss', input: q, better, worse });
      }
      continue;
    }

    // sdn_vs_wrong_metadata (100 pairs)
    const rec = entries[(i * 11 + 3) % entries.length];
    const decoy = entries[(i * 29 + 17) % entries.length];
    const [uid, sdnName, , prog] = rec;
    const cleanProg = (prog || 'SDGT').split(';')[0].trim() || 'SDGT';
    const wrongProg = PROGRAMS.find((p) => p !== cleanProg) || 'CUBA';
    const wrongUid = String(Number(uid) + 137 + (i % 50));
    const q = template(sdnName);

    const better = makeResponse(betterFormat, {
      queryName: sdnName,
      isMatch: true,
      uid: String(uid),
      matchedName: sdnName,
      program: cleanProg,
      refId: i
    });
    const worse = makeResponse(worseFormat, {
      queryName: sdnName,
      isMatch: true,
      uid: wrongUid,
      matchedName: decoy[1],
      program: wrongProg,
      refId: i
    });
    if (!usedWorse.has(worse)) {
      usedWorse.add(worse);
      pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split: i < 850 ? 'train' : 'val', format_pair: `${betterFormat}->${worseFormat}`, archetype: 'sdn_vs_wrong_metadata', input: q, better, worse });
    }
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, pairs.map((p) => JSON.stringify(p)).join('\n') + '\n', 'utf8');

  const worseCounts = new Map();
  let betterLonger = 0;
  let totalBetterLen = 0;
  let totalWorseLen = 0;
  for (const p of pairs) {
    worseCounts.set(p.worse, (worseCounts.get(p.worse) || 0) + 1);
    totalBetterLen += p.better.length;
    totalWorseLen += p.worse.length;
    if (p.better.length > p.worse.length) betterLonger++;
  }
  const uniqueWorsePct = (worseCounts.size / pairs.length) * 100;
  const maxRepeatPct = (Math.max(...worseCounts.values()) / pairs.length) * 100;
  const lenShortcutPct = (betterLonger / pairs.length) * 100;

  console.log(`Wrote ${pairs.length} multi-format pairs to ${outPath}`);
  console.log(`Anti-shortcut checks:`);
  console.log(`- Unique worse: ${uniqueWorsePct.toFixed(1)}% (target >= 80%)`);
  console.log(`- Max worse repeat: ${maxRepeatPct.toFixed(2)}% (target <= 2%)`);
  console.log(`- Length shortcut (better > worse): ${lenShortcutPct.toFixed(1)}% (target <= 65%)`);
  console.log(`- Mean char len: better=${(totalBetterLen / pairs.length).toFixed(1)}, worse=${(totalWorseLen / pairs.length).toFixed(1)}`);
}

buildPairs();
