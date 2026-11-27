import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sdnPath = path.join(rootDir, 'data', 'sdn-snapshot.json');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, 'eval-data');
fs.mkdirSync(outDir, { recursive: true });

const outTrain = path.join(outDir, 'pairs_sanctions_v5_train.jsonl');
const outVal = path.join(outDir, 'pairs_sanctions_v5_val.jsonl');

const CLEAN_CORPS_TRAIN = [
  'Siemens Aktiengesellschaft', 'SAP SE', 'Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.',
  'Toyota Motor Corporation', 'Roche Holding AG', 'Novartis AG', 'BNP Paribas SA', 'Nestle S.A.',
  'ASML Holding N.V.', 'Taiwan Semiconductor Manufacturing Company', 'Airbus SE', 'Honeywell International Inc.',
  'Caterpillar Inc.', 'Deere & Company', 'AstraZeneca PLC', 'Unilever PLC', 'Costco Wholesale Corporation',
  'Starbucks Corporation', 'Accenture plc', 'Adobe Inc.', 'Salesforce, Inc.', 'Oracle Corporation',
  'Cisco Systems, Inc.', 'Intel Corporation', 'Qualcomm Incorporated', 'Broadcom Inc.',
  'Reliance Industries Limited', 'Tata Consultancy Services Limited', 'DBS Group Holdings Ltd',
  'Commonwealth Bank of Australia', 'Royal Bank of Canada', 'Toronto-Dominion Bank', 'Stripe, LLC',
  'AliExpress Logistics Services Ltd', 'Barclays PLC', 'Volkswagen AG', 'Mercedes-Benz Group AG',
  'Hitachi, Ltd.', 'Texas Instruments Incorporated', 'ING Groep N.V.', 'TotalEnergies SE',
  'Rio Tinto plc', 'Shell plc', 'BMW AG', 'Honda Motor Co., Ltd.', 'Bosch GmbH'
];

const CLEAN_CORPS_VAL = [
  'Sony Group Corporation', 'Zurich Insurance Group AG', 'Allianz SE', 'Munich Reinsurance Company',
  'Deutsche Post AG', 'Maersk A/S', 'Banco Santander SA', 'Alibaba Group Holding Limited',
  'AliPay US Corp', 'Cuba Libre Hospitality Group Inc', 'Schneider Electric SE', 'ABB Ltd',
  'Hermes International SCA', 'Nintendo Co., Ltd.', 'Samsung Electronics Co., Ltd.', 'Sony Interactive Entertainment',
  'Deutsche Telekom AG', 'Philips N.V.', 'Dassault Systemes SE', 'Capgemini SE'
];

const CLEAN_PEOPLE_TRAIN = [
  'Ivan Petrov, DOB 1974, Cyprus', 'Elena Rostova-Miller, DOB 1982, Germany', 'David Chen, DOB 1988, Singapore',
  'Kieran Patel, DOB 1990, UK', 'Muhammad Ali Memorial Foundation', 'Maria Garcia, DOB 1979, Spain',
  'Lukas Weber, DOB 1985, Switzerland', 'Kenji Takahashi, DOB 1976, Japan', 'Amara Okafor, DOB 1991, Nigeria',
  'Claire Dubois, DOB 1983, France', 'Anders Lindqvist, DOB 1971, Sweden', 'Sofia Rossi, DOB 1987, Italy'
];

const CLEAN_PEOPLE_VAL = [
  'Viktor Novak, DOB 1978, Austria', 'Hannah Meyer, DOB 1984, Netherlands', 'Rajesh Sharma, DOB 1980, India',
  'Carlos Mendoza, DOB 1975, Mexico', 'Olga Kowalska, DOB 1989, Poland', 'Omar Hassan, DOB 1981, UAE'
];

const CLEAN_WALLETS_TRAIN = [
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'TVXHp8bMrpRd5HGy3w1yu9f87qwRrMHFp8', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0x514910771AF9Ca656af840dff83E8264EcF986CA'
];

const CLEAN_WALLETS_VAL = [
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'So11111111111111111111111111111111111111112', 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
];

const CLEAN_VESSELS_TRAIN = [
  'EVER GIVEN (IMO 9811000)', 'MAERSK MC-KINNEY MOLLER (IMO 9619907)', 'MSC GULSUN (IMO 9839430)',
  'CMA CGM ANTOINE DE SAINT EXUPERY (IMO 9776418)', 'OOCL HONG KONG (IMO 9776171)', 'COSCO SHIPPING UNIVERSE (IMO 9795610)'
];

const CLEAN_VESSELS_VAL = [
  'MSC IRINA (IMO 9929429)', 'EVER ACE (IMO 9893890)', 'HMM ALGECIRAS (IMO 9863297)', 'ONE INNOVATION (IMO 9939137)'
];

const PROMPTS = [
  (q) => `Screen '${q}' against the OFAC SDN, UN, EU and UK sanctions lists.`,
  (q) => `Is '${q}' currently listed on US Treasury OFAC SDN or consolidated sanctions databases?`,
  (q) => `Perform sanctions compliance screening for counterparty: ${q}`,
  (q) => `Check whether '${q}' matches any primary entry or alias on OFAC SDN.`,
  (q) => `Evaluate OFAC sanctions exposure before clearing payment to ${q}.`,
  (q) => `Does '${q}' trigger any Specially Designated National (SDN) or sectoral sanctions match?`
];

const PROGRAMS = ['SDGT', 'RUSSIA-EO14024', 'CUBA', 'IRAN', 'DPRK2', 'CYBER2', 'BALKANS', 'SDNTK', 'VENEZUELA', 'SYRIA'];

function cleanProg(raw, fallback) {
  const p = String(raw || '').split(';')[0].replace(/[\[\]]/g, '').trim();
  return p && p !== 'None' ? p : fallback;
}

function renderAnswer(fmt, query, isMatch, uid, matchedName, prog, ref, extra = {}) {
  const pubDate = extra.pubDate || '2026-11-15';
  const sim = extra.sim || (isMatch ? '1.0000' : '0.0000');
  const regimes = isMatch ? `{US:"match",UN:"review",EU:"clear",UK:"clear"}` : `{US:"clear",UN:"clear",EU:"clear",UK:"clear"}`;

  if (fmt === 0) {
    return JSON.stringify({
      screened: true,
      name: query,
      matched: isMatch,
      match_count: isMatch ? 1 : 0,
      match_score: Number(sim),
      verdict: isMatch ? 'SANCTIONED' : 'CLEAR',
      matches: isMatch ? [{ sdn_uid: String(uid), matched_name: matchedName, programs: prog, similarity_score: Number(sim) }] : [],
      lists: ['US Treasury OFAC SDN', 'EU Consolidated', 'UN Security Council'],
      summary: isMatch
        ? `VERDICT: SANCTIONS MATCH. Matched "${matchedName}" (UID ${uid}, Program ${prog}, Score ${sim}). Ref ${ref}.`
        : `VERDICT: CLEAR COUNTERPARTY. 0 matches for "${query}" across OFAC SDN/UN/EU lists (${pubDate}). Ref ${ref}.`
    });
  }
  if (fmt === 1) {
    return JSON.stringify({
      input: { value: query, detected_as: extra.kind || 'entity' },
      label: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      is_match: isMatch,
      confidence: isMatch ? 0.99 : 1.0,
      regimes: isMatch ? { US: prog, UN: 'check', EU: 'clear', UK: 'clear' } : { US: 'clear', UN: 'clear', EU: 'clear', UK: 'clear' },
      candidates: isMatch ? [{ source: 'OFAC_SDN', uid: String(uid), name: matchedName, program: prog }] : [],
      summary: isMatch
        ? `Match alert: ${query} matched OFAC SDN record ${matchedName} (UID ${uid}, ${prog}). Ref ${ref}.`
        : `Clear. ${query} does not appear on dated OFAC, UN, EU or UK sanctions lists (${pubDate}). Ref ${ref}.`
    });
  }
  if (fmt === 2) {
    return JSON.stringify({
      name: query,
      matched: isMatch,
      match_score: isMatch ? 1 : 0,
      summary: isMatch
        ? `${query}: sanctions-list match, OFAC SDN entry ${uid} (published ${pubDate}). Listed name: ${matchedName}. Programs: ${prog}. Similarity ${sim}; review required. Ref ${ref}.`
        : `${query}: no name match at threshold 0.88 in dated OFAC SDN, UN, EU and UK snapshots (${pubDate}). Ref ${ref}.`
    });
  }
  if (fmt === 3) {
    return isMatch
      ? `VERDICT: SANCTIONS MATCH (PROHIBITED COUNTERPARTY). Screening '${query}' against US Treasury OFAC SDN (${pubDate}) hits UID ${uid} ('${matchedName}', Program [${prog}], similarity ${sim}). Settlement must be halted pending compliance review. Ref ${ref}.`
      : `VERDICT: NO SANCTIONS MATCH (CLEAN COUNTERPARTY). Screening '${query}' across 19,565 OFAC SDN entries plus UN/EU/UK lists (${pubDate}) returns 0 primary or alias matches (${regimes}). Cleared for settlement. Ref ${ref}.`;
  }
  return [
    `### Sanctions Screening Report: ${query} (${ref})`,
    `- **Match Found**: ${isMatch ? 'YES (Blocked / Review)' : 'NO (Cleared)'}`,
    `- **SDN UID / Record**: ${isMatch ? `${uid} (${matchedName})` : 'None'}`,
    `- **Program / Lists**: ${isMatch ? `${prog} via OFAC SDN` : '0 hits across OFAC SDN, UN, EU, UK'}`,
    `- **Snapshot Date**: ${pubDate} | Similarity: ${sim}`
  ].join('\n');
}

function renderErrorOrHallucinated(fmt, query, ref, kind) {
  if (fmt === 0) {
    return JSON.stringify({
      screened: false,
      name: query,
      matched: null,
      verdict: 'UNAVAILABLE',
      error: `Upstream sanctions database HTTP 503 timeout while querying "${query}" (${kind}); unable to evaluate lists. Ref ${ref}.`
    });
  }
  return `SCREENING_ERROR [${ref}]: Sanctions registry check for "${query}" (${kind}) aborted due to stale index / rate-limit 429; defaulting to unverified bypass without SDN or EU/UN verification.`;
}

function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSplit(sdnItems, evmAddrs, cleanTargets, count, splitName, seed) {
  const rng = createRng(seed);
  const pairs = [];
  const half = Math.floor(count / 2);

  for (let i = 0; i < half; i++) {
    const useWallet = (i % 7 === 0) && evmAddrs.length > 0;
    const sdn = sdnItems[i % sdnItems.length];
    const clean = cleanTargets[i % cleanTargets.length];

    let sdnQuery, uid, sdnName, prog, sdnKind;
    if (useWallet) {
      const w = evmAddrs[i % evmAddrs.length];
      sdnQuery = w[0];
      uid = String(w[1]);
      sdnName = `SDN Digital Currency Address ${w[0].slice(0, 10)}...`;
      prog = 'CYBER2';
      sdnKind = 'wallet';
    } else {
      uid = String(sdn[0]);
      sdnName = sdn[1];
      const aliases = Array.isArray(sdn[4]) ? sdn[4] : [];
      sdnQuery = (i % 4 === 1 && aliases.length > 0) ? aliases[0] : sdnName;
      prog = cleanProg(sdn[3], PROGRAMS[i % PROGRAMS.length]);
      sdnKind = sdn[2] || 'entity';
    }

    const fmtA = Math.floor(rng() * 5);
    let fmtB = Math.floor(rng() * 5);
    if (i % 3 === 0) fmtB = fmtA;

    const pTpl1 = PROMPTS[(i * 2) % PROMPTS.length];
    const pTpl2 = PROMPTS[(i * 2 + 1) % PROMPTS.length];

    // Pair 1 (Clean target): Chosen = CLEAR, Rejected = FALSE POSITIVE MATCH (or occasional 503/unverified error)
    const c1 = renderAnswer(fmtA, clean.q, false, null, null, null, `${splitName}_c${i}`, { kind: clean.kind });
    const r1 = (i % 10 === 9)
      ? renderErrorOrHallucinated(i % 2, clean.q, `${splitName}_c${i}`, clean.kind)
      : renderAnswer(fmtB, clean.q, true, uid, sdnName, prog, `${splitName}_c${i}`, { kind: clean.kind });
    pairs.push({
      prompt: pTpl1(clean.q),
      chosen: c1,
      rejected: r1,
      label_kind: 'preference_pair'
    });

    // Pair 2 (Sanctioned target): Chosen = MATCH, Rejected = FALSE NEGATIVE CLEAR (or unverified bypass)
    const c2 = renderAnswer(fmtB, sdnQuery, true, uid, sdnName, prog, `${splitName}_s${i}`, { kind: sdnKind });
    const r2 = (i % 10 === 8)
      ? renderErrorOrHallucinated(i % 2, sdnQuery, `${splitName}_s${i}`, sdnKind)
      : renderAnswer(fmtA, sdnQuery, false, null, null, null, `${splitName}_s${i}`, { kind: sdnKind });
    pairs.push({
      prompt: pTpl2(sdnQuery),
      chosen: c2,
      rejected: r2,
      label_kind: 'preference_pair'
    });
  }
  return pairs;
}

const sdnRaw = JSON.parse(fs.readFileSync(sdnPath, 'utf8'));
const entries = (sdnRaw.entries || []).filter(
  (e) => Array.isArray(e) && e.length >= 4 && e[1] && e[1].length >= 5 && e[1].length <= 65 && /^[A-Za-z0-9 ,.'-]+$/.test(e[1])
);
const evmAddrs = sdnRaw.evm_addresses || [];

const splitSdn = Math.floor(entries.length * 0.85);
const splitEvm = Math.floor(evmAddrs.length * 0.85);

const cleanTrain = [
  ...CLEAN_CORPS_TRAIN.map(q => ({ q, kind: 'organization' })),
  ...CLEAN_PEOPLE_TRAIN.map(q => ({ q, kind: 'person' })),
  ...CLEAN_WALLETS_TRAIN.map(q => ({ q, kind: 'wallet' })),
  ...CLEAN_VESSELS_TRAIN.map(q => ({ q, kind: 'vessel' }))
];
const cleanVal = [
  ...CLEAN_CORPS_VAL.map(q => ({ q, kind: 'organization' })),
  ...CLEAN_PEOPLE_VAL.map(q => ({ q, kind: 'person' })),
  ...CLEAN_WALLETS_VAL.map(q => ({ q, kind: 'wallet' })),
  ...CLEAN_VESSELS_VAL.map(q => ({ q, kind: 'vessel' }))
];

const trainPairs = buildSplit(entries.slice(0, splitSdn), evmAddrs.slice(0, splitEvm), cleanTrain, 1400, 'tr5', 20261127);
const valPairs = buildSplit(entries.slice(splitSdn), evmAddrs.slice(splitEvm), cleanVal, 240, 'va5', 20261128);

fs.writeFileSync(outTrain, trainPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
fs.writeFileSync(outVal, valPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
console.log(`Generated ${trainPairs.length} train pairs and ${valPairs.length} disjoint val pairs in ${outDir}`);
