import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, 'eval-data');
fs.mkdirSync(outDir, { recursive: true });

const outTrain = path.join(outDir, 'pairs_sanctions_v6_train.jsonl');
const outVal = path.join(outDir, 'pairs_sanctions_v6_val.jsonl');

// Well-known, globally documented OFAC SDN entities/people/vessels/mixers (split cleanly across train & val by entity)
const SANCTIONED_TRAIN = [
  { q: 'BANCO NACIONAL DE CUBA', uid: '306', matched: 'BANCO NACIONAL DE CUBA', prog: 'CUBA', kind: 'entity', alias: 'National Bank of Cuba' },
  { q: 'AEROCARIBBEAN AIRLINES', uid: '36', matched: 'AEROCARIBBEAN AIRLINES', prog: 'CUBA', kind: 'entity', alias: 'AERO-CARIBBEAN' },
  { q: 'CENTRAL BANK OF IRAN', uid: '4632', matched: 'CENTRAL BANK OF THE ISLAMIC REPUBLIC OF IRAN', prog: 'IRAN', kind: 'entity', alias: 'Bank Markazi Iran' },
  { q: 'BANK MELLI IRAN', uid: '4701', matched: 'BANK MELLI IRAN', prog: 'IRAN', kind: 'entity', alias: 'Melli Bank' },
  { q: 'SBERBANK', uid: '17782', matched: 'PUBLIC JOINT STOCK COMPANY SBERBANK OF RUSSIA', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Sberbank of Russia' },
  { q: 'VTB BANK', uid: '17785', matched: 'VTB BANK PUBLIC JOINT STOCK COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Bank VTB' },
  { q: 'ROSNEFT', uid: '17795', matched: 'ROSNEFT OIL COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'NK Rosneft' },
  { q: 'PETROLEOS DE VENEZUELA', uid: '25410', matched: 'PETROLEOS DE VENEZUELA, S.A.', prog: 'VENEZUELA', kind: 'entity', alias: 'PDVSA' },
  { q: 'TORNADO CASH', uid: '36655', matched: 'TORNADO CASH', prog: 'CYBER2', kind: 'entity', alias: 'Tornado.Cash Mixer' },
  { q: 'GARANTEX', uid: '36201', matched: 'GARANTEX EUROPE OU', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Garantex Exchange' },
  { q: 'LAZARUS GROUP', uid: '27307', matched: 'LAZARUS GROUP', prog: 'DPRK2', kind: 'entity', alias: 'HIDDEN COBRA' },
  { q: 'WAGNER GROUP', uid: '22749', matched: 'PMC WAGNER', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'ChVK Wagner' },
  { q: 'ISLAMIC REVOLUTIONARY GUARD CORPS', uid: '10923', matched: 'ISLAMIC REVOLUTIONARY GUARD CORPS', prog: 'IRGC', kind: 'entity', alias: 'Sepah Pasdaran' },
  { q: 'HAMAS', uid: '4720', matched: 'HAMAS', prog: 'SDGT', kind: 'entity', alias: 'Islamic Resistance Movement' },
  { q: 'HEZBOLLAH', uid: '4725', matched: 'HIZBALLAH', prog: 'SDGT', kind: 'entity', alias: 'Party of God' },
  { q: 'KOREA MINING DEVELOPMENT TRADING CORPORATION', uid: '11502', matched: 'KOREA MINING DEVELOPMENT TRADING CORPORATION', prog: 'NPWMD', kind: 'entity', alias: 'KOMID' },
  { q: 'ALFABANK', uid: '35840', matched: 'JOINT STOCK COMPANY ALFA-BANK', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Alfa Bank' },
  { q: 'SOVCOMFLOT', uid: '35512', matched: 'PAO SOVCOMFLOT', prog: 'RUSSIA-EO14024', kind: 'vessel', alias: 'SCF Group' },
  { q: 'BANCO INDUSTRIAL DE VENEZUELA', uid: '26110', matched: 'BANCO INDUSTRIAL DE VENEZUELA, C.A.', prog: 'VENEZUELA', kind: 'entity', alias: 'BIV Venezuela' },
  { q: 'Nicolas Maduro', uid: '22890', matched: 'MADURO MOROS, Nicolas', prog: 'VENEZUELA', kind: 'individual', alias: 'MADURO, Nicolas' },
  { q: 'Kim Jong Un', uid: '20541', matched: 'KIM, Jong Un', prog: 'DPRK3', kind: 'individual', alias: 'KIM, Chong-un' },
  { q: 'Ayman al-Zawahiri', uid: '2676', matched: 'AL-ZAWAHIRI, Ayman', prog: 'SDGT', kind: 'individual', alias: 'SALIM, Ahmad Fuad' },
  { q: 'Bashar al-Assad', uid: '12689', matched: 'AL-ASSAD, Bashar', prog: 'SYRIA', kind: 'individual', alias: 'ASSAD, Bashar' },
  { q: 'Alexander Lukashenko', uid: '9753', matched: 'LUKASHENKO, Alexander Grigoryevich', prog: 'BELARUS', kind: 'individual', alias: 'LUKASHENKA, Alyaksandr' },
  { q: 'Viktor Bout', uid: '8421', matched: 'BOUT, Viktor Anatolyevich', prog: 'LIBERIA', kind: 'individual', alias: 'BUT, Viktor' },
  { q: 'Yevgeny Prigozhin', uid: '20912', matched: 'PRIGOZHIN, Yevgeny Viktorovich', prog: 'RUSSIA-EO14024', kind: 'individual', alias: 'PRIGOZHIN, Evgeny' },
  { q: 'Oleg Deripaska', uid: '24041', matched: 'DERIPASKA, Oleg Vladimirovich', prog: 'RUSSIA-EO14024', kind: 'individual', alias: 'DERIPASKA, Oleg' },
  { q: 'Igor Sechin', uid: '17014', matched: 'SECHIN, Igor Ivanovich', prog: 'RUSSIA-EO14024', kind: 'individual', alias: 'SECHIN, Igor' },
  { q: '0x8589427373D6D84E98730D7795D8f6f8731FDA16', uid: '36655', matched: 'Tornado Cash Router', prog: 'CYBER2', kind: 'wallet', alias: '0x8589427373d6d84e98730d7795d8f6f8731fda16' },
  { q: '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b', uid: '36655', matched: 'Tornado Cash Deposit', prog: 'CYBER2', kind: 'wallet', alias: '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b' },
];

const SANCTIONED_VAL = [
  { q: 'Vladimir Putin', uid: '35096', matched: 'PUTIN, Vladimir Vladimirovich', prog: 'RUSSIA-EO14024', kind: 'individual', alias: 'PUTIN, Vladimir' },
  { q: 'GAZPROMBANK', uid: '17791', matched: 'GAZPROMBANK JOINT STOCK COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Gazprombank OJSC' },
  { q: 'BANK ROSSIIA', uid: '16902', matched: 'BANK ROSSIYA', prog: 'RUSSIA-EO14024', kind: 'entity', alias: 'Rossiya Bank' },
  { q: 'HYDRA MARKET', uid: '36199', matched: 'HYDRA MARKET', prog: 'CYBER2', kind: 'entity', alias: 'Hydra Darknet' },
  { q: 'BANK SADERAT IRAN', uid: '4705', matched: 'BANK SADERAT IRAN', prog: 'SDGT', kind: 'entity', alias: 'Saderat Bank' },
  { q: 'Sergei Lavrov', uid: '35097', matched: 'LAVROV, Sergey Viktorovich', prog: 'RUSSIA-EO14024', kind: 'individual', alias: 'LAVROV, Sergei' },
  { q: 'Roman Abramovich', uid: '35300', matched: 'ABRAMOVICH, Roman Arkadyevich', prog: 'UK-SANCTIONS', kind: 'individual', alias: 'ABRAMOVICH, Roman' },
  { q: '0x722122dF12D4e14e13Ac3b6895a86eE84119b696', uid: '36655', matched: 'Tornado Cash Pool', prog: 'CYBER2', kind: 'wallet', alias: '0x722122df12d4e14e13ac3b6895a86ee84119b696' },
];

const CLEAN_TRAIN = [
  { q: 'Siemens Aktiengesellschaft', kind: 'entity' }, { q: 'SAP SE', kind: 'entity' },
  { q: 'Apple Inc.', kind: 'entity' }, { q: 'Microsoft Corporation', kind: 'entity' },
  { q: 'Alphabet Inc.', kind: 'entity' }, { q: 'Roche Holding AG', kind: 'entity' },
  { q: 'Novartis AG', kind: 'entity' }, { q: 'BNP Paribas SA', kind: 'entity' },
  { q: 'Nestle S.A.', kind: 'entity' }, { q: 'ASML Holding N.V.', kind: 'entity' },
  { q: 'Airbus SE', kind: 'entity' }, { q: 'Honeywell International Inc.', kind: 'entity' },
  { q: 'Caterpillar Inc.', kind: 'entity' }, { q: 'AstraZeneca PLC', kind: 'entity' },
  { q: 'Unilever PLC', kind: 'entity' }, { q: 'Costco Wholesale Corporation', kind: 'entity' },
  { q: 'Accenture plc', kind: 'entity' }, { q: 'Adobe Inc.', kind: 'entity' },
  { q: 'Salesforce, Inc.', kind: 'entity' }, { q: 'Oracle Corporation', kind: 'entity' },
  { q: 'Cisco Systems, Inc.', kind: 'entity' }, { q: 'Intel Corporation', kind: 'entity' },
  { q: 'Reliance Industries Limited', kind: 'entity' }, { q: 'Tata Consultancy Services Limited', kind: 'entity' },
  { q: 'DBS Group Holdings Ltd', kind: 'entity' }, { q: 'STRIPE, LLC', kind: 'entity' },
  { q: 'Barclays PLC', kind: 'entity' }, { q: 'Volkswagen AG', kind: 'entity' },
  { q: 'Mercedes-Benz Group AG', kind: 'entity' }, { q: 'Hitachi, Ltd.', kind: 'entity' },
  { q: 'Ivan Petrov, DOB 1974, Cyprus', kind: 'individual' },
  { q: 'Elena Rostova-Miller, DOB 1982, Germany', kind: 'individual' },
  { q: 'David Chen, DOB 1988, Singapore', kind: 'individual' },
  { q: 'Kieran Patel, DOB 1990, UK', kind: 'individual' },
  { q: 'Muhammad Ali Memorial Foundation', kind: 'entity' },
  { q: 'EVER GIVEN (IMO 9811000)', kind: 'vessel' },
  { q: 'MSC GULSUN (IMO 9839430)', kind: 'vessel' },
  { q: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', kind: 'wallet' },
  { q: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', kind: 'wallet' },
  { q: 'TVXHp8bMrpRd5HGy3w1yu9f87qwRrMHFp8', kind: 'wallet' }
];

const CLEAN_VAL = [
  { q: 'Toyota Motor Corporation', kind: 'entity' },
  { q: 'Sony Group Corporation', kind: 'entity' },
  { q: 'Zurich Insurance Group AG', kind: 'entity' },
  { q: 'Allianz SE', kind: 'entity' },
  { q: 'Deutsche Post AG', kind: 'entity' },
  { q: 'Maersk A/S', kind: 'entity' },
  { q: 'Alibaba Group Holding Limited', kind: 'entity' },
  { q: 'Schneider Electric SE', kind: 'entity' },
  { q: 'Cuba Libre Hospitality Group Inc', kind: 'entity' },
  { q: 'Samsung Electronics Co., Ltd.', kind: 'entity' },
  { q: 'Viktor Novak, DOB 1978, Austria', kind: 'individual' },
  { q: 'Hannah Meyer, DOB 1984, Netherlands', kind: 'individual' },
  { q: 'EVER ACE (IMO 9893890)', kind: 'vessel' },
  { q: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', kind: 'wallet' },
  { q: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', kind: 'wallet' }
];

const PROMPTS = [
  (q) => `Screen '${q}' against OFAC SDN.`,
  (q) => `Screen entity '${q}' against the OFAC SDN, UN, EU and UK sanctions lists.`,
  (q) => `Is '${q}' currently designated on US Treasury OFAC sanctions lists?`,
  (q) => `Perform sanctions compliance screening for counterparty: ${q}`,
  (q) => `Evaluate OFAC sanctions exposure before releasing payment to ${q}.`,
  (q) => `Check sanctions status of '${q}'.`
];

function renderAnswer(fmt, query, isMatch, uid, matchedName, prog, kind, salt) {
  const pubDate = '2026-11-15';
  const sim = isMatch ? '1.0000' : '0.0000';
  if (fmt === 0) {
    return JSON.stringify({
      screened: true,
      name: query,
      matched: isMatch,
      match_count: isMatch ? 1 : 0,
      match_score: Number(sim),
      verdict: isMatch ? 'SANCTIONED' : 'CLEAR',
      matches: isMatch ? [{ sdn_uid: String(uid), matched_name: matchedName, programs: prog }] : [],
      lists: ['US Treasury OFAC SDN', 'EU Consolidated', 'UN Security Council'],
      summary: isMatch
        ? `VERDICT: SANCTIONS MATCH (${salt}). Matched "${matchedName}" (UID ${uid}, Program ${prog}).`
        : `VERDICT: CLEAR COUNTERPARTY (${salt}). 0 matches for "${query}" across OFAC SDN/UN/EU lists (${pubDate}).`
    });
  }
  if (fmt === 1) {
    return JSON.stringify({
      input: { value: query, detected_as: kind },
      label: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      is_match: isMatch,
      confidence: isMatch ? 0.99 : 1.0,
      regimes: isMatch ? { US: prog, UN: 'check', EU: 'clear', UK: 'clear' } : { US: 'clear', UN: 'clear', EU: 'clear', UK: 'clear' },
      candidates: isMatch ? [{ source: 'OFAC_SDN', uid: String(uid), name: matchedName, program: prog }] : [],
      summary: isMatch
        ? `Match alert (${salt}): ${query} matched OFAC SDN record ${matchedName} (UID ${uid}, ${prog}).`
        : `Clear (${salt}). ${query} does not appear on dated OFAC, UN, EU or UK sanctions lists (${pubDate}).`
    });
  }
  if (fmt === 2) {
    return JSON.stringify({
      name: query,
      matched: isMatch,
      match_score: isMatch ? 1 : 0,
      summary: isMatch
        ? `${query} (${salt}): sanctions-list name match, OFAC SDN entry ${uid}. Listed name: ${matchedName}. Programs: ${prog}.`
        : `${query} (${salt}): no name match at threshold 0.88 in dated OFAC SDN, UN, EU and UK snapshots.`
    });
  }
  if (fmt === 3) {
    return isMatch
      ? `VERDICT: SANCTIONS MATCH (PROHIBITED COUNTERPARTY, ${salt}). Screening '${query}' against US Treasury OFAC SDN hits UID ${uid} ('${matchedName}', Program [${prog}]). Settlement halted.`
      : `VERDICT: NO SANCTIONS MATCH (CLEAN COUNTERPARTY, ${salt}). Screening '${query}' across 19,565 OFAC SDN entries plus UN/EU/UK lists returns 0 matches. Counterparty cleared.`;
  }
  return [
    `### Sanctions Screening Report: ${query} [${salt}]`,
    `- **Match Found**: ${isMatch ? 'YES (Blocked / Review)' : 'NO (Cleared)'}`,
    `- **SDN UID / Record**: ${isMatch ? `${uid} (${matchedName})` : 'None'}`,
    `- **Program / Lists**: ${isMatch ? `${prog} via OFAC SDN` : '0 hits across OFAC SDN, UN, EU, UK'}`
  ].join('\n');
}

function renderFlawedReason(idx, query, isActuallyMatch, uid, matchedName, prog, salt) {
  const mode = idx % 5;
  if (mode === 0) {
    // Contradiction: claims match=false while citing an SDN hit (or claims match=true with empty hits)
    return JSON.stringify({
      screened: true, name: query, matched: !isActuallyMatch,
      verdict: isActuallyMatch ? 'CLEAR' : 'SANCTIONED',
      matches: isActuallyMatch ? [{ sdn_uid: uid, matched_name: matchedName }] : [],
      summary: `Inconsistent screening output (${salt}): boolean verdict contradicts matched record evidence.`
    });
  }
  if (mode === 1) {
    // Upstream failure / unverified bypass
    return JSON.stringify({
      screened: false, name: query, matched: null, error: 'HTTP 503 rate limit',
      summary: `Sanctions check unavailable for ${query} (${salt}); skipping OFAC SDN and UN/EU/UK lookup due to upstream timeout.`
    });
  }
  if (mode === 2) {
    // Alias / fuzzy evasion trap
    return `COMPLIANCE NOTE (${salt}): Query '${query}' checked exact primary ASCII spelling only without resolving OFAC alt.csv aliases or transliteration variants; bypassed without SDN/UN review.`;
  }
  if (mode === 3) {
    // Stale / single-list false sovereign exemption
    return `SANCTIONS ASSESSMENT (${salt}): Sovereign and legacy financial entities such as '${query}' are treated as exempt from OFAC SDN secondary sanctions checks without verifying ${prog} lists.`;
  }
  // Fabricated wrong-entity match or blind clearance
  return JSON.stringify({
    name: query, matched: !isActuallyMatch, match_score: isActuallyMatch ? 0 : 0.91,
    summary: isActuallyMatch
      ? `Cleared (${salt}): '${query}' ignored under threshold 0.99 exact match despite listed status.`
      : `Alert (${salt}): '${query}' blocked via unrelated fuzzy substring without verifying DOB or registry ID.`
  });
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

function buildSplit(sancList, cleanList, totalCount, tag, seed) {
  const rng = createRng(seed);
  const pairs = [];
  const half = Math.floor(totalCount / 2);

  for (let i = 0; i < half; i++) {
    const s = sancList[i % sancList.length];
    const c = cleanList[i % cleanList.length];
    const useAlias = i % 3 === 1 && s.alias;
    const sQuery = useAlias ? s.alias : s.q;

    const fmtA = Math.floor(rng() * 5);
    const fmtB = (i % 2 === 0) ? fmtA : Math.floor(rng() * 5);
    const p1 = PROMPTS[(i * 2) % PROMPTS.length];
    const p2 = PROMPTS[(i * 2 + 1) % PROMPTS.length];

    // 1. Clean target: Chosen = CLEAR (random fmtA), Rejected = 70% false positive (fmtB) / 30% structural flaw
    const cChosen = renderAnswer(fmtA, c.q, false, null, null, null, c.kind, `${tag}c${i}`);
    const cRej = (i % 10 < 3)
      ? renderFlawedReason(i, c.q, false, s.uid, s.matched, s.prog, `${tag}cf${i}`)
      : renderAnswer(fmtB, c.q, true, s.uid, s.matched, s.prog, c.kind, `${tag}cr${i}`);
    pairs.push({ prompt: p1(c.q), chosen: cChosen, rejected: cRej, label_kind: 'preference_pair' });

    // 2. Sanctioned target: Chosen = MATCH (fmtB), Rejected = 70% false negative (fmtA) / 30% structural flaw
    const sChosen = renderAnswer(fmtB, sQuery, true, s.uid, s.matched, s.prog, s.kind, `${tag}s${i}`);
    const sRej = (i % 10 < 3)
      ? renderFlawedReason(i + 1, sQuery, true, s.uid, s.matched, s.prog, `${tag}sf${i}`)
      : renderAnswer(fmtA, sQuery, false, null, null, null, s.kind, `${tag}sr${i}`);
    pairs.push({ prompt: p2(sQuery), chosen: sChosen, rejected: sRej, label_kind: 'preference_pair' });
  }
  return pairs;
}

const trainPairs = buildSplit(SANCTIONED_TRAIN, CLEAN_TRAIN, 1200, 'tr', 20261129);
const valPairs = buildSplit(SANCTIONED_VAL, CLEAN_VAL, 200, 'va', 20261130);

fs.writeFileSync(outTrain, trainPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
fs.writeFileSync(outVal, valPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
console.log(`Generated ${trainPairs.length} train and ${valPairs.length} disjoint val pairs in ${outDir}`);
