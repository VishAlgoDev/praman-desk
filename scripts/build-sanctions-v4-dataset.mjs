import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sdnPath = path.join(rootDir, 'data', 'sdn-snapshot.json');
const outDir = path.join(rootDir, 'eval-data');
const outPath = path.join(outDir, 'pairs_sanctions_v4.jsonl');

fs.mkdirSync(outDir, { recursive: true });

const CLEAN_ENTITIES_TRAIN = [
  'Apple Inc.', 'SAP SE', 'Siemens Aktiengesellschaft', 'HSBC Holdings plc', 'AIA Group Limited',
  'Monzo Bank Limited', 'Infosys Limited', 'Stripe, LLC', 'Microsoft Corporation', 'Alphabet Inc.',
  'Volkswagen AG', 'Toyota Motor Corporation', 'Roche Holding AG', 'Novartis AG', 'BNP Paribas SA',
  'Nestle S.A.', 'ASML Holding N.V.', 'Taiwan Semiconductor Manufacturing Company', 'Shopify Inc.',
  'Airbus SE', 'Honeywell International Inc.', 'Caterpillar Inc.', 'Deere & Company', 'AstraZeneca PLC',
  'Unilever PLC', 'LVMH Moet Hennessy Louis Vuitton', 'Costco Wholesale Corporation', 'Starbucks Corporation',
  'Accenture plc', 'Adobe Inc.', 'Salesforce, Inc.', 'Oracle Corporation', 'Cisco Systems, Inc.',
  'Intel Corporation', 'Qualcomm Incorporated', 'Texas Instruments Incorporated', 'Broadcom Inc.',
  'Reliance Industries Limited', 'Tata Consultancy Services Limited', 'DBS Group Holdings Ltd',
  'Oversea-Chinese Banking Corporation', 'Commonwealth Bank of Australia', 'Royal Bank of Canada',
  'Toronto-Dominion Bank', 'AliExpress Logistics Services Ltd', 'Muhammad Ali Memorial Foundation',
  'Kieran Patel', 'Bank of Nova Scotia', 'Standard Chartered PLC'
];

const CLEAN_ENTITIES_VAL = [
  'Sony Group Corporation', 'Zurich Insurance Group AG', 'Allianz SE', 'Munich Reinsurance Company',
  'Deutsche Post AG', 'Maersk A/S', 'Elena Rostova-Miller', 'David Chen', 'Banco Santander SA',
  'Alibaba Group Holding Limited', 'AliPay US Corp', 'Cuba Libre Hospitality Group Inc',
  'Schneider Electric SE', 'ABB Ltd', 'Hermes International SCA', 'Nintendo Co., Ltd.'
];

const QUERY_TEMPLATES = [
  (name) => `Screen entity '${name}' against the US Treasury OFAC SDN list.`,
  (name) => `Is '${name}' currently designated on US Treasury OFAC sanctions lists?`,
  (name) => `Perform sanctions compliance screening for counterparty: ${name}`,
  (name) => `Check whether '${name}' appears on OFAC SDN or primary alias registries.`,
  (name) => `Evaluate OFAC sanctions exposure before releasing payment to ${name}.`,
  (name) => `Does '${name}' match any Specially Designated National (SDN) entry?`
];

const PROGRAMS = ['SDGT', 'RUSSIA-EO14024', 'CUBA', 'IRAN', 'DPRK2', 'CYBER2', 'BALKANS', 'SDNTK', 'VENEZUELA', 'SYRIA'];

function cleanProgram(raw, fallback = 'SDGT') {
  const p = String(raw || '').split(';')[0].replace(/[\[\]]/g, '').trim();
  return p && p !== 'None' ? p : fallback;
}

function makeResponse(fmt, queryName, isMatch, uid, matchedName, program, refId) {
  const listLabel = 'US Treasury OFAC SDN';
  const summary = isMatch
    ? `Screened "${queryName}" against ${listLabel}: matched record "${matchedName}" (UID ${uid}, Program ${program}). Ref #${refId}.`
    : `Screened "${queryName}" against ${listLabel}: 0 active or alias matches identified. Ref #${refId}.`;

  if (fmt === 0) {
    return JSON.stringify({
      matched: isMatch,
      match_found: isMatch,
      match_count: isMatch ? 1 : 0,
      matches: isMatch ? [{ sdn_uid: String(uid), matched_name: matchedName, programs: program }] : [],
      lists: [listLabel],
      summary
    });
  }
  if (fmt === 1) {
    return JSON.stringify({
      subject: queryName,
      status: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      risk: isMatch ? 'CRITICAL' : 'LOW',
      hits: isMatch ? [{ source: 'OFAC_SDN', id: Number(uid), name: matchedName, program }] : [],
      notes: summary
    });
  }
  if (fmt === 2) {
    return [
      `### OFAC SDN Screening Result: ${queryName}`,
      `| Field | Determination |`,
      `|---|---|`,
      `| Match Found | ${isMatch ? 'YES (Blocked)' : 'NO (Cleared)'} |`,
      `| SDN UID / Matched Record | ${isMatch ? `${uid} (${matchedName})` : 'None'} |`,
      `| Sanctions Program | ${isMatch ? program : 'N/A'} |`,
      `| Registry Source | ${listLabel} |`,
      `Summary: ${summary}`
    ].join('\n');
  }
  if (fmt === 3) {
    return `COMPLIANCE DETERMINATION [${isMatch ? 'HOLD & FREEZE' : 'CLEARED'}]: ${summary}`;
  }
  return [
    `SANCTIONS_SCREENING_REPORT`,
    `- Query Entity: ${queryName}`,
    `- Screening Verdict: ${isMatch ? 'MATCH_DETECTED' : 'NO_MATCH'}`,
    `- Matched SDN Entry: ${isMatch ? `${matchedName} (UID: ${uid}, Program: ${program})` : 'None'}`,
    `- Summary: ${summary}`
  ].join('\n');
}

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

function buildSymmetricSplit(sdnSubset, cleanSubset, count, splitName, seed) {
  const rng = createRng(seed);
  const pairs = [];
  for (let i = 0; i < count / 2; i++) {
    const sdn = sdnSubset[i % sdnSubset.length];
    const clean = cleanSubset[i % cleanSubset.length];
    const uid = String(sdn[0]);
    const sdnName = sdn[1];
    const prog = cleanProgram(sdn[3], PROGRAMS[i % PROGRAMS.length]);

    const fmt1C = Math.floor(rng() * 5);
    const fmt1R = Math.floor(rng() * 5);
    const fmt2C = fmt1R;
    const fmt2R = fmt1C;

    const tpl1 = QUERY_TEMPLATES[(i * 2) % QUERY_TEMPLATES.length];
    const tpl2 = QUERY_TEMPLATES[(i * 2 + 1) % QUERY_TEMPLATES.length];

    // Clean entity pair: Chosen = CLEAR, Rejected = FALSE MATCH with sdn
    const c1 = makeResponse(fmt1C, clean, false, null, null, null, `${splitName}_c${i}`);
    const r1 = makeResponse(fmt1R, clean, true, uid, sdnName, prog, `${splitName}_c${i}`);
    pairs.push({
      intent: 'SANCTIONS_SCREENING_MATCH',
      split: splitName,
      entity_key: clean,
      format_pair: `${fmt1C}->${fmt1R}`,
      archetype: 'clean_vs_false_positive',
      prompt: tpl1(clean),
      chosen: c1,
      rejected: r1
    });

    // SDN entity pair: Chosen = TRUE MATCH with sdn, Rejected = FALSE CLEAR
    const c2 = makeResponse(fmt2C, sdnName, true, uid, sdnName, prog, `${splitName}_s${i}`);
    const r2 = makeResponse(fmt2R, sdnName, false, null, null, null, `${splitName}_s${i}`);
    pairs.push({
      intent: 'SANCTIONS_SCREENING_MATCH',
      split: splitName,
      entity_key: `UID:${uid}`,
      format_pair: `${fmt2C}->${fmt2R}`,
      archetype: 'sdn_vs_false_negative',
      prompt: tpl2(sdnName),
      chosen: c2,
      rejected: r2
    });
  }
  return pairs;
}

function run() {
  const sdnRaw = JSON.parse(fs.readFileSync(sdnPath, 'utf8'));
  const rawEntries = sdnRaw.entries || [];
  const entries = rawEntries.filter(
    (e) => Array.isArray(e) && e.length >= 4 && e[1] && e[1].length >= 5 && e[1].length <= 65 && /^[A-Za-z0-9 ,.'-]+$/.test(e[1])
  );
  console.log(`Loaded ${entries.length} valid SDN entries.`);

  const splitIdx = Math.floor(entries.length * 0.85);
  const trainSdn = entries.slice(0, splitIdx);
  const valSdn = entries.slice(splitIdx);

  const trainPairs = buildSymmetricSplit(trainSdn, CLEAN_ENTITIES_TRAIN, 850, 'train', 20261115);
  const valPairs = buildSymmetricSplit(valSdn, CLEAN_ENTITIES_VAL, 150, 'val', 20261116);
  const allPairs = [...trainPairs, ...valPairs];

  const lines = allPairs.map((p) => JSON.stringify(p)).join('\n') + '\n';
  fs.writeFileSync(outPath, lines, 'utf8');
  console.log(`Wrote ${allPairs.length} pairs (${trainPairs.length} train + ${valPairs.length} val) to ${outPath}`);
}

run();
