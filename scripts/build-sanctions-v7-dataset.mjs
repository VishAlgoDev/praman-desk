import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sdnPath = path.join(rootDir, 'data', 'sdn-snapshot.json');
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, 'eval-data');
fs.mkdirSync(outDir, { recursive: true });

const outTrain = path.join(outDir, 'pairs_sanctions_v7_train.jsonl');
const outVal = path.join(outDir, 'pairs_sanctions_v7_val.jsonl');

const sdnRaw = JSON.parse(fs.readFileSync(sdnPath, 'utf8'));
const rawEntries = sdnRaw.entries || [];
const rawEvm = sdnRaw.evm_addresses || [];

// Entities reserved strictly for disjoint validation (never in train)
const VAL_RESERVED = new Set([
  'PUTIN, VLADIMIR VLADIMIROVICH', 'VLADIMIR PUTIN',
  'GAZPROMBANK JOINT STOCK COMPANY', 'GAZPROMBANK',
  'BANK ROSSIYA', 'HYDRA MARKET', 'BANK SADERAT IRAN',
  'LAVROV, SERGEY VIKTOROVICH', 'ABRAMOVICH, ROMAN ARKADYEVICH',
  '0x722122df12d4e14e13ac3b6895a86ee84119b696',
  '0x722122df12d4e14e13ac3b6895a86ee84f8c4928'
]);

const sdnTrainUnique = [];
const sdnValUnique = [];
const seenTrainNames = new Set();

for (const e of rawEntries) {
  const [uid, name, kindRaw, progRaw, aliases] = e;
  if (!uid || !name || name.length < 4 || name.length > 68 || !progRaw || progRaw === 'None') continue;
  const prog = String(progRaw).split(';')[0].replace(/[\[\]]/g, '').trim();
  if (!prog) continue;
  const norm = name.toUpperCase().trim();
  const kind = /individual/i.test(kindRaw) ? 'individual' : /vessel/i.test(kindRaw) ? 'vessel' : 'entity';
  const alias = Array.isArray(aliases) && aliases.length > 0 && aliases[0].length >= 4 && aliases[0].length <= 68 ? aliases[0] : null;
  const rec = { q: name, uid: String(uid), matched: name, prog, kind, alias };
  if (VAL_RESERVED.has(norm) || uid === '35096' || uid === '17791' || uid === '16902' || uid === '36199' || uid === '4705') {
    sdnValUnique.push(rec);
  } else if (!seenTrainNames.has(norm)) {
    seenTrainNames.add(norm);
    sdnTrainUnique.push(rec);
  }
}

// Curated canonical anchors placed once cleanly at front of train pool (no duplicate entity queries)
const CURATED_TRAIN = [
  { q: 'National Bank of Cuba', uid: '306', matched: 'BANCO NACIONAL DE CUBA', prog: 'CUBA', kind: 'entity' },
  { q: 'Tornado.Cash Mixer', uid: '36655', matched: 'TORNADO CASH', prog: 'CYBER2', kind: 'entity' },
  { q: 'Sberbank of Russia', uid: '17782', matched: 'PUBLIC JOINT STOCK COMPANY SBERBANK OF RUSSIA', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'Bank VTB', uid: '17785', matched: 'VTB BANK PUBLIC JOINT STOCK COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'NK Rosneft', uid: '17795', matched: 'ROSNEFT OIL COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'PDVSA Venezuela', uid: '25410', matched: 'PETROLEOS DE VENEZUELA, S.A.', prog: 'VENEZUELA', kind: 'entity' },
  { q: 'Garantex Exchange', uid: '36201', matched: 'GARANTEX EUROPE OU', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'HIDDEN COBRA', uid: '27307', matched: 'LAZARUS GROUP', prog: 'DPRK2', kind: 'entity' },
  { q: 'ChVK Wagner', uid: '22749', matched: 'PMC WAGNER', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'Alfa Bank OJSC', uid: '35840', matched: 'JOINT STOCK COMPANY ALFA-BANK', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'Bank Markazi Iran', uid: '4632', matched: 'CENTRAL BANK OF THE ISLAMIC REPUBLIC OF IRAN', prog: 'IRAN', kind: 'entity' },
  { q: 'Melli Bank plc', uid: '4701', matched: 'BANK MELLI IRAN', prog: 'IRAN', kind: 'entity' },
  { q: 'MADURO MOROS, Nicolas', uid: '22890', matched: 'MADURO MOROS, Nicolas', prog: 'VENEZUELA', kind: 'individual' },
  { q: 'KIM, Jong Un', uid: '20541', matched: 'KIM, Jong Un', prog: 'DPRK3', kind: 'individual' },
  { q: 'AL-ASSAD, Bashar', uid: '12689', matched: 'AL-ASSAD, Bashar', prog: 'SYRIA', kind: 'individual' }
];

// Sanctioned EVM wallets (unique addresses)
const sdnWalletsTrain = [];
const sdnWalletsVal = [];
const seenEvm = new Set();
for (const [addr, uid] of rawEvm) {
  const low = String(addr).toLowerCase();
  if (seenEvm.has(low)) continue;
  seenEvm.add(low);
  const isTornado = low.startsWith('0x722122df') || low.startsWith('0x85894273') || low.startsWith('0xd90e2f92');
  const rec = {
    q: addr,
    uid: String(uid),
    matched: isTornado ? 'Tornado Cash' : `OFAC SDN Wallet ${uid}`,
    prog: uid === '27307' ? 'DPRK2' : 'CYBER2',
    kind: 'wallet'
  };
  if (low.startsWith('0x722122df')) sdnWalletsVal.push(rec);
  else sdnWalletsTrain.push(rec);
}
sdnWalletsVal.push({ q: '0x722122dF12D4e14e13Ac3b6895a86eE84f8c4928', uid: '36019', matched: 'Tornado Cash', prog: 'CYBER2', kind: 'wallet' });

function createRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build 1,200+ strictly unique clean corporate/individual/vessel/wallet targets for Train
function buildUniqueCleanPool(rng, targetCount, walletCount) {
  const pool = [];
  const MAJOR = [
    'Siemens Aktiengesellschaft', 'SAP SE', 'Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.',
    'Roche Holding AG', 'Novartis AG', 'BNP Paribas SA', 'Nestle S.A.', 'ASML Holding N.V.',
    'Airbus SE', 'Honeywell International Inc.', 'Caterpillar Inc.', 'AstraZeneca PLC', 'Unilever PLC',
    'Costco Wholesale Corporation', 'Accenture plc', 'Adobe Inc.', 'Salesforce, Inc.', 'Oracle Corporation',
    'Cisco Systems, Inc.', 'Intel Corporation', 'Reliance Industries Limited', 'Tata Consultancy Services Limited',
    'DBS Group Holdings Ltd', 'STRIPE, LLC', 'Barclays PLC', 'Volkswagen AG', 'Mercedes-Benz Group AG',
    'Hitachi, Ltd.', 'Bosch GmbH', 'Deere & Company', 'Broadcom Inc.', 'Qualcomm Incorporated',
    'Texas Instruments Incorporated', 'ING Groep N.V.', 'TotalEnergies SE', 'Rio Tinto plc', 'Shell plc',
    'BMW AG', 'Honda Motor Co., Ltd.', 'BP p.l.c.', 'ABB Ltd', 'Capgemini SE', 'Philips N.V.',
    'Deutsche Telekom AG', 'Siemens Healthineers AG', 'Infineon Technologies AG', 'Merck KGaA',
    'Commonwealth Bank of Australia', 'Royal Bank of Canada', 'Toronto-Dominion Bank', 'Bank of Montreal',
    'Muhammad Ali Memorial Foundation', 'Alpha Consulting Group GmbH', 'Banco Comercial do Norte SA',
    'Iranian Heritage Museum London', 'Cuba Street Coffee Roasters Ltd', 'Russian River Brewing Company',
    'Tehran Bakery & Cafe Inc.', 'Belarusian Cultural Center Toronto'
  ];
  for (const name of MAJOR) pool.push({ q: name, kind: 'entity' });

  const PREFIXES = ['Apex', 'Beacon', 'Crest', 'Delta', 'Echo', 'Frontier', 'Horizon', 'Integrity', 'Jupiter', 'Keystone', 'Lumina', 'Meridian', 'Nexus', 'Omega', 'Pinnacle', 'Quantum', 'Radiant', 'Summit', 'Titan', 'Unity', 'Vanguard', 'Westlake', 'Zenith', 'Alpine', 'Boreal', 'Cascade', 'Dover', 'Evergreen', 'Falcon', 'Glacier', 'Helios', 'Kestrel', 'Monarch', 'Nordic', 'Pacific', 'Sierra', 'Sterling', 'Vortex'];
  const MIDS = ['Industrial', 'Global', 'Precision', 'Maritime', 'Digital', 'Cloud', 'Bio', 'Energy', 'Aero', 'Freight', 'Capital', 'Micro', 'Health', 'Grid', 'Core', 'Quant'];
  const SUFFIXES = ['Technologies', 'Logistics', 'Solutions', 'Holdings', 'Industries', 'Systems', 'Networks', 'Pharmaceuticals', 'Manufacturing', 'Services', 'Partners', 'Ventures'];
  const LEGAL = ['AG', 'GmbH', 'Inc.', 'Corp.', 'Ltd.', 'PLC', 'SE', 'N.V.', 'S.A.', 'LLC'];

  let idx = 0;
  for (const p of PREFIXES) {
    for (const m of MIDS) {
      for (const s of SUFFIXES) {
        if (pool.length >= targetCount - walletCount - 120) break;
        const leg = LEGAL[(idx++) % LEGAL.length];
        pool.push({ q: `${p} ${m} ${s} ${leg}`, kind: 'entity' });
      }
      if (pool.length >= targetCount - walletCount - 120) break;
    }
    if (pool.length >= targetCount - walletCount - 120) break;
  }

  const FIRST = ['Ivan', 'Elena', 'David', 'Kieran', 'Maria', 'Lukas', 'Kenji', 'Amara', 'Claire', 'Anders', 'Sofia', 'Liam', 'Nadia', 'Tomas', 'Priya', 'Marcus'];
  const LAST = ['Petrov', 'Miller', 'Chen', 'Patel', 'Garcia', 'Weber', 'Takahashi', 'Okafor', 'Dubois', 'Lindqvist', 'Rossi', 'Murphy', 'Kowalski', 'Novotny', 'Mehta', 'Hansen'];
  const CTRY = ['Cyprus', 'Germany', 'Singapore', 'UK', 'Spain', 'Switzerland', 'Japan', 'France', 'Sweden', 'Italy', 'Ireland', 'Canada', 'Australia', 'Austria'];
  for (let i = 0; i < 120 && pool.length < targetCount - walletCount; i++) {
    const f = FIRST[i % FIRST.length];
    const l = LAST[Math.floor(i / FIRST.length) % LAST.length];
    const dob = 1965 + (i % 32);
    const c = CTRY[(i * 5) % CTRY.length];
    pool.push({ q: `${f} ${l}, DOB ${dob}, ${c}`, kind: 'individual' });
  }

  // Exact matching count of clean EVM wallets (deterministic pseudo-EVM clean addresses)
  const WELL_KNOWN_CLEAN = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  ];
  for (const w of WELL_KNOWN_CLEAN) pool.push({ q: w, kind: 'wallet' });
  for (let i = WELL_KNOWN_CLEAN.length; i < walletCount; i++) {
    let hex = '0x';
    for (let j = 0; j < 40; j++) hex += Math.floor(rng() * 16).toString(16);
    pool.push({ q: hex, kind: 'wallet' });
  }
  return pool.slice(0, targetCount);
}

const cleanValItems = [
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
  { q: 'Banco Santander SA', kind: 'entity' },
  { q: 'Taiwan Semiconductor Manufacturing Company', kind: 'entity' },
  { q: 'Munich Reinsurance Company', kind: 'entity' },
  { q: 'Heidelberg Materials AG', kind: 'entity' },
  { q: 'Nordic Shipping Holdings ASA', kind: 'entity' },
  { q: 'Continental Aktiengesellschaft', kind: 'entity' },
  { q: 'Fujitsu Limited', kind: 'entity' },
  { q: 'Viktor Novak, DOB 1978, Austria', kind: 'individual' },
  { q: 'Hannah Meyer, DOB 1984, Netherlands', kind: 'individual' },
  { q: 'Rajesh Sharma, DOB 1980, India', kind: 'individual' },
  { q: 'Carlos Mendoza, DOB 1975, Mexico', kind: 'individual' },
  { q: 'EVER ACE (IMO 9893890)', kind: 'vessel' },
  { q: 'HMM ALGECIRAS (IMO 9863297)', kind: 'vessel' },
  { q: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', kind: 'wallet' },
  { q: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', kind: 'wallet' }
];

const CURATED_VAL = [
  { q: 'Vladimir Putin', uid: '35096', matched: 'PUTIN, Vladimir Vladimirovich', prog: 'RUSSIA-EO14024', kind: 'individual' },
  { q: 'GAZPROMBANK', uid: '17791', matched: 'GAZPROMBANK JOINT STOCK COMPANY', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'BANK ROSSIIA', uid: '16902', matched: 'BANK ROSSIYA', prog: 'RUSSIA-EO14024', kind: 'entity' },
  { q: 'HYDRA MARKET', uid: '36199', matched: 'HYDRA MARKET', prog: 'CYBER2', kind: 'entity' },
  { q: 'BANK SADERAT IRAN', uid: '4705', matched: 'BANK SADERAT IRAN', prog: 'SDGT', kind: 'entity' },
  { q: 'Sergei Lavrov', uid: '35097', matched: 'LAVROV, Sergey Viktorovich', prog: 'RUSSIA-EO14024', kind: 'individual' },
  { q: 'Roman Abramovich', uid: '35300', matched: 'ABRAMOVICH, Roman Arkadyevich', prog: 'UK-SANCTIONS', kind: 'individual' }
];

const PROMPTS = [
  (q) => `Screen '${q}' against OFAC SDN.`,
  (q) => `Screen entity '${q}' against the OFAC SDN, UN, EU and UK sanctions lists.`,
  (q) => `Is '${q}' currently designated on US Treasury OFAC sanctions lists?`,
  (q) => `Perform sanctions compliance screening for counterparty: ${q}`,
  (q) => `Evaluate OFAC sanctions exposure before releasing payment to ${q}.`,
  (q) => `Check sanctions status of '${q}'.`,
  (q) => `Is wallet ${q} sanctioned by OFAC?`
];

function renderResponse(fmt, query, isMatch, uid, matchedName, prog, kind) {
  if (fmt === 0) {
    return JSON.stringify({
      screened: true,
      name: query,
      matched: isMatch,
      match_score: isMatch ? 1.0 : 0.0,
      verdict: isMatch ? 'SANCTIONED' : 'CLEAR',
      matches: isMatch ? [{ sdn_uid: String(uid), matched_name: matchedName, programs: prog }] : [],
      summary: isMatch
        ? `OFAC SDN match found for ${query}: ${matchedName} (UID ${uid}, Program ${prog}).`
        : `No OFAC SDN matches found for ${query} across OFAC SDN, UN, EU, UK lists.`
    });
  }
  if (fmt === 1) {
    return JSON.stringify({
      query,
      matched: isMatch,
      status: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      risk: isMatch ? 'CRITICAL' : 'LOW',
      matches: isMatch ? [{ id: String(uid), name: matchedName, program: prog }] : []
    });
  }
  if (fmt === 2) {
    return JSON.stringify({
      target: query,
      sanctioned: isMatch,
      entity: isMatch ? matchedName : null,
      program: isMatch ? prog : null,
      uid: isMatch ? String(uid) : null,
      verdict: isMatch ? 'BLOCK' : 'ALLOW'
    });
  }
  if (fmt === 3) {
    return JSON.stringify({
      input: { value: query, detected_as: kind },
      label: isMatch ? 'SANCTIONED_MATCH' : 'CLEAR',
      is_match: isMatch,
      candidates: isMatch ? [{ source: 'OFAC_SDN', uid: String(uid), name: matchedName, program: prog }] : [],
      summary: isMatch
        ? `Match alert: ${query} matched OFAC SDN record ${matchedName} (UID ${uid}, ${prog}).`
        : `Counterparty ${query} cleared with 0 hits across 19,565 OFAC SDN entries and aliases.`
    });
  }
  if (fmt === 4) {
    return isMatch
      ? `VERDICT: SANCTIONS MATCH. Screening '${query}' against US Treasury OFAC SDN identifies UID ${uid} ('${matchedName}', Program [${prog}]). Transfer blocked.`
      : `VERDICT: NO SANCTIONS MATCH. Screening '${query}' across 19,565 US Treasury OFAC SDN entries and UN/EU lists returns 0 hits. Transfer cleared.`;
  }
  return [
    `### OFAC SDN Screening Result`,
    `- Query: ${query}`,
    `- Match Found: ${isMatch ? `YES (${matchedName}, UID ${uid}, ${prog})` : `NO (0 matches across OFAC SDN, UN, EU, UK)`}`
  ].join('\n');
}

// Exact character-length balance using trailing whitespace (zero bag-of-words token bias, matches baseline test_symmetry.py)
function balanceExact(a, b) {
  const diff = a.length - b.length;
  if (diff > 0) return [a, b + ' '.repeat(diff)];
  if (diff < 0) return [a + ' '.repeat(-diff), b];
  return [a, b];
}

const sdnTrainSlice = sdnTrainUnique.slice(0, Math.max(0, sdnTrainUnique.length - 150));
const sdnValOverflow = sdnTrainUnique.slice(Math.max(0, sdnTrainUnique.length - 150));

const rngTrain = createRng(20261141);
// Sample 1,200 strictly unique sanctioned items for Train
const sancTrainPool = [...CURATED_TRAIN, ...sdnWalletsTrain];
const stepTrain = Math.max(1, Math.floor(sdnTrainSlice.length / (1250 - sancTrainPool.length)));
for (let i = 0; i < sdnTrainSlice.length && sancTrainPool.length < 1200; i += stepTrain) {
  const rec = sdnTrainSlice[i];
  const useAlias = (i % 4 === 1) && rec.alias;
  sancTrainPool.push({ ...rec, q: useAlias ? rec.alias : rec.q });
}
const cleanTrainPool = buildUniqueCleanPool(rngTrain, sancTrainPool.length, sdnWalletsTrain.length);
const progDistTrain = sancTrainPool.map(x => x.prog);

function buildPairsFromPools(sancList, cleanList, progDist, rng, isVal = false) {
  const n = Math.min(sancList.length, cleanList.length);
  const pairs = [];
  for (let i = 0; i < n; i++) {
    const s = sancList[i];
    const c = cleanList[i];
    const fmtClean = c.kind === 'wallet' && (i % 2 === 0) ? 2 : Math.floor(rng() * 6);
    const fmtSanc = s.kind === 'wallet' && (i % 2 === 0) ? 2 : Math.floor(rng() * 6);
    // Keep same format between chosen & rejected 85% of the time so schema doesn't correlate with class!
    const fmtCleanRej = (rng() < 0.85) ? fmtClean : Math.floor(rng() * 6);
    const fmtSancRej = (rng() < 0.85) ? fmtSanc : Math.floor(rng() * 6);

    const pClean = c.kind === 'wallet' ? PROMPTS[6](c.q) : PROMPTS[(i * 3) % 6](c.q);
    const pSanc = s.kind === 'wallet' ? PROMPTS[6](s.q) : PROMPTS[(i * 3 + 1) % 6](s.q);

    // 1. Clean pair: Chosen = CLEAR, Rejected = false positive using identical program distribution!
    const bogusProg = progDist[Math.floor(rng() * progDist.length)];
    const bogusUid = String(10000 + Math.floor(rng() * 35000));
    let cChosen = renderResponse(fmtClean, c.q, false, null, null, null, c.kind);
    let cRej = renderResponse(fmtCleanRej, c.q, true, bogusUid, c.q, bogusProg, c.kind);
    if (isVal && cRej.includes('null') === false && fmtCleanRej === 2) {
      // keep format 2 entity explicit for val readability
    }
    [cChosen, cRej] = balanceExact(cChosen, cRej);
    pairs.push({ prompt: pClean, chosen: cChosen, rejected: cRej, label_kind: 'preference_pair' });

    // 2. Sanctioned pair: Chosen = MATCH, Rejected = false negative
    let sChosen = renderResponse(fmtSanc, s.q, true, s.uid, s.matched, s.prog, s.kind);
    let sRej = renderResponse(fmtSancRej, s.q, false, null, null, null, s.kind);
    [sChosen, sRej] = balanceExact(sChosen, sRej);
    pairs.push({ prompt: pSanc, chosen: sChosen, rejected: sRej, label_kind: 'preference_pair' });
  }
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

const trainPairs = buildPairsFromPools(sancTrainPool, cleanTrainPool, progDistTrain, rngTrain, false);

// Build strictly disjoint 200-pair validation set
const rngVal = createRng(20261142);
const sancValPool = [...CURATED_VAL, ...sdnWalletsVal, ...sdnValUnique, ...sdnValOverflow].slice(0, 100);
const cleanValPool = [...cleanValItems];
for (let i = 0; cleanValPool.length < sancValPool.length; i++) {
  cleanValPool.push({ q: `ValHoldout Corp ${1000 + i} GmbH`, kind: 'entity' });
}
const valPairs = buildPairsFromPools(sancValPool, cleanValPool, sancValPool.map(x => x.prog), rngVal, true);

fs.writeFileSync(outTrain, trainPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
fs.writeFileSync(outVal, valPairs.map(p => JSON.stringify(p)).join('\n') + '\n', 'utf8');
console.log(`Generated v7: ${trainPairs.length} train and ${valPairs.length} disjoint val pairs in ${outDir}`);
