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

const CLEAN_ENTITIES_TRAIN = [
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
  'AliExpress Logistics Services Ltd',
  'Muhammad Ali Memorial Foundation',
  'Kieran Patel',
  'Bank of Nova Scotia',
  'Standard Chartered PLC'
];

const CLEAN_ENTITIES_VAL = [
  'Sony Group Corporation',
  'Zurich Insurance Group AG',
  'Allianz SE',
  'Munich Reinsurance Company',
  'Deutsche Post AG',
  'Maersk A/S',
  'Elena Rostova-Miller',
  'David Chen',
  'Banco Santander SA',
  'Alibaba Group Holding Limited',
  'AliPay US Corp',
  'Cuba Libre Hospitality Group Inc',
  'Schneider Electric SE',
  'ABB Ltd',
  'Hermes International SCA',
  'Nintendo Co., Ltd.'
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

function cleanProgramTag(rawProg, fallback = 'SDGT') {
  const cleaned = String(rawProg || '')
    .split(';')[0]
    .replace(/[\[\]]/g, '')
    .trim();
  return cleaned || fallback;
}

function buildPairs() {
  const sdnRaw = JSON.parse(fs.readFileSync(sdnPath, 'utf8'));
  const entries = (sdnRaw.entries || []).filter(
    (e) => Array.isArray(e) && e.length >= 4 && e[1] && e[1].length >= 5 && e[1].length <= 65 && /^[A-Za-z0-9 ,.'-]+$/.test(e[1])
  );
  // Disjoint partition across entries BEFORE filtering comma/alias subsets so train and val share zero SDN UIDs
  const splitIdx = Math.floor(entries.length * 0.85);
  const trainEntries = entries.slice(0, splitIdx);
  const valEntries = entries.slice(splitIdx);
  const trainComma = trainEntries.filter((e) => e[1].includes(','));
  const valComma = valEntries.filter((e) => e[1].includes(','));
  const extractAliasPool = (list) => list.flatMap((e) => {
    const validAliases = (Array.isArray(e[4]) ? e[4] : []).filter((a) => a && a.length >= 5 && a.length <= 65 && /^[A-Za-z0-9 ,.'-]+$/.test(a) && a !== e[1]);
    return validAliases.length ? [{ entry: e, alias: validAliases[0] }] : [];
  });
  const trainAlias = extractAliasPool(trainEntries);
  const valAlias = extractAliasPool(valEntries);

  const rng = createRng(20261115);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const pairs = [];
  const usedWorse = new Set();

  // Balanced 5-format distribution with disjoint train/val entity sets (zero leakage):
  // - 45% (450): clean_vs_false_positive (better = CLEAR, worse = false MATCH)
  // - 20% (200): sdn_vs_false_negative (better = MATCH, worse = false CLEAR)
  // - 15% (150): comma_name_vs_miss (better = MATCH, worse = false CLEAR)
  // - 10% (100): alias_vs_miss (better = MATCH via alt.csv alias, worse = false CLEAR)
  // - 10% (100): sdn_vs_wrong_metadata (better = true UID/program, worse = wrong UID/entity/program)
  for (let i = 0; i < 1000; i++) {
    const split = i < 850 ? 'train' : 'val';
    const splitClean = split === 'train' ? CLEAN_ENTITIES_TRAIN : CLEAN_ENTITIES_VAL;
    const splitEntries = split === 'train' ? trainEntries : valEntries;
    const splitComma = split === 'train' ? trainComma : valComma;
    const splitAlias = split === 'train' ? trainAlias : valAlias;

    const betterFormat = Math.floor(rng() * 5);
    const worseFormat = Math.floor(rng() * 5);
    const template = QUERY_TEMPLATES[i % QUERY_TEMPLATES.length];
    const mod = i % 20;

    if (mod < 9) {
      // clean_vs_false_positive (45%)
      const cleanName = splitClean[i % splitClean.length];
      const decoy = pick(splitEntries);
      const decoyUid = String(decoy[0]);
      const decoyName = decoy[1];
      const decoyProg = cleanProgramTag(decoy[3], pick(PROGRAMS));
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
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split, entity_key: cleanName, format_pair: `${betterFormat}->${worseFormat}`, archetype: 'clean_vs_false_positive', input: q, better, worse });
      }
      continue;
    }

    if (mod < 13) {
      // sdn_vs_false_negative (20%)
      const rec = splitEntries[(i * 7 + Math.floor(rng() * 13)) % splitEntries.length];
      const [uid, sdnName, , prog] = rec;
      const cleanProg = cleanProgramTag(prog, 'SDGT');
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
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split, entity_key: `UID:${uid}`, format_pair: `${betterFormat}->${worseFormat}`, archetype: 'sdn_vs_false_negative', input: q, better, worse });
      }
      continue;
    }

    if (mod < 16) {
      // comma_name_vs_miss (15%)
      const rec = splitComma[(i * 5 + 1) % splitComma.length];
      const [uid, sdnName, , prog] = rec;
      const cleanProg = cleanProgramTag(prog, 'SDGT');
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
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split, entity_key: `UID:${uid}`, format_pair: `${betterFormat}->${worseFormat}`, archetype: 'comma_name_vs_miss', input: q, better, worse });
      }
      continue;
    }

    if (mod < 18 && splitAlias.length > 0) {
      // alias_vs_miss (10%)
      const item = splitAlias[(i * 3 + 5) % splitAlias.length];
      const [uid, sdnName, , prog] = item.entry;
      const aliasName = item.alias;
      const cleanProg = cleanProgramTag(prog, 'SDGT');
      const q = template(aliasName);

      const better = makeResponse(betterFormat, {
        queryName: aliasName,
        isMatch: true,
        uid: String(uid),
        matchedName: sdnName,
        program: cleanProg,
        refId: i
      });
      const worse = makeResponse(worseFormat, {
        queryName: aliasName,
        isMatch: false,
        uid: null,
        matchedName: null,
        program: null,
        refId: i
      });
      if (!usedWorse.has(worse)) {
        usedWorse.add(worse);
        pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split, entity_key: `UID:${uid}`, format_pair: `${betterFormat}->${worseFormat}`, archetype: 'alias_vs_miss', input: q, better, worse });
      }
      continue;
    }

    // sdn_vs_wrong_metadata (10%)
    const rec = splitEntries[(i * 11 + 3) % splitEntries.length];
    const decoy = splitEntries[(i * 29 + 17) % splitEntries.length];
    const [uid, sdnName, , prog] = rec;
    const cleanProg = cleanProgramTag(prog, 'SDGT');
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
      pairs.push({ intent: 'SANCTIONS_SCREENING_MATCH', split, entity_key: `UID:${uid}`, format_pair: `${betterFormat}->${worseFormat}`, archetype: 'sdn_vs_wrong_metadata', input: q, better, worse });
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
