import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'data', 'sdn-snapshot.json');

const SDN_CSV_URL = 'https://www.treasury.gov/ofac/downloads/sdn.csv';
const ALT_CSV_URL = 'https://www.treasury.gov/ofac/downloads/alt.csv';
const SDN_COMMENTS_URL = 'https://www.treasury.gov/ofac/downloads/sdn_comments.csv';
const CONS_PRIM_URL = 'https://www.treasury.gov/ofac/downloads/consolidated/cons_prim.csv';
const CONS_ALT_URL = 'https://www.treasury.gov/ofac/downloads/consolidated/cons_alt.csv';
const CONS_COMMENTS_URL = 'https://www.treasury.gov/ofac/downloads/consolidated/cons_comments.csv';

function extractEvmAddresses(text = '') {
  return [...new Set((String(text).match(/0x[0-9a-fA-F]{40}/g) || []).map(a => a.toLowerCase()))];
}

function extractRemarkAliases(remarks = '') {
  const out = [];
  const text = String(remarks || '');
  const patterns = [
    /(?:a\.k\.a\.|f\.k\.a\.|n\.k\.a\.)\s*['"]([^'"]{2,100})['"]/gi,
    /(?:alt\.\s+)?Issuer Name\s+([^;\n"]{2,100})/gi
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const candidate = m[1].trim().replace(/[.;,]+$/, '').trim();
      if (candidate && candidate.length >= 2) out.push(candidate);
    }
  }
  return out;
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ',' && !inQuote) { fields.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}

function ingestPrimaryCsv(csvText, listTag, entriesMap, evmAddressMap) {
  let count = 0;
  for (const line of String(csvText || '').split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const uid = f[0];
    const name = f[1] || '';
    const sdnType = f[2] === '-0-' ? 'Entity' : (f[2] || 'Entity');
    const program = (f[3] === '-0-' ? '' : (f[3] || '')).replace(/^\[|\]$/g, '').trim();
    const remarks = f[11] === '-0-' ? '' : (f[11] || '');
    if (!uid || !name) continue;

    const existing = entriesMap.get(uid);
    if (existing) {
      if (program && !existing.programs.includes(program)) {
        existing.programs = existing.programs ? `${existing.programs}; ${program}` : program;
      }
      if (!existing.listType.includes(listTag)) {
        existing.listType = `${existing.listType}+${listTag}`;
      }
    } else {
      entriesMap.set(uid, {
        uid,
        name,
        type: sdnType,
        programs: program || listTag,
        listType: listTag,
        aliases: []
      });
      count++;
    }

    const item = entriesMap.get(uid);
    for (const rAlias of extractRemarkAliases(remarks)) {
      if (item.aliases.length < 8 && !item.aliases.includes(rAlias) && rAlias.toLowerCase() !== name.toLowerCase()) {
        item.aliases.push(rAlias);
      }
    }
    for (const addr of extractEvmAddresses(line)) {
      evmAddressMap.set(addr, uid);
    }
  }
  return count;
}

function ingestAltCsv(csvText, entriesMap) {
  for (const line of String(csvText || '').split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const uid = f[0];
    const aliasName = f[3] || '';
    if (uid && aliasName && entriesMap.has(uid)) {
      const item = entriesMap.get(uid);
      if (item.aliases.length < 8 && !item.aliases.includes(aliasName)) {
        item.aliases.push(aliasName);
      }
    }
  }
}

function ingestCommentsCsv(csvText, entriesMap, evmAddressMap) {
  let currentUid = null;
  for (const line of String(csvText || '').split('\n')) {
    if (!line.trim()) continue;
    const uidMatch = line.match(/^(\d+),/);
    if (uidMatch && entriesMap.has(uidMatch[1])) {
      currentUid = uidMatch[1];
    }
    if (currentUid) {
      for (const addr of extractEvmAddresses(line)) {
        if (!evmAddressMap.has(addr)) evmAddressMap.set(addr, currentUid);
      }
    }
  }
}

async function main() {
  console.log('Downloading official US Treasury OFAC SDN & Consolidated Non-SDN (incl. CMIC) lists...');
  const [sdnRes, altRes, commentsRes, consRes, consAltRes, consCommentsRes] = await Promise.all([
    fetch(SDN_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }),
    fetch(ALT_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }),
    fetch(SDN_COMMENTS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }).catch(() => null),
    fetch(CONS_PRIM_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }).catch(() => null),
    fetch(CONS_ALT_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }).catch(() => null),
    fetch(CONS_COMMENTS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }).catch(() => null)
  ]);

  if (!sdnRes.ok) throw new Error(`SDN download failed: ${sdnRes.status}`);

  const entriesMap = new Map();
  const evmAddressMap = new Map();

  const sdnCount = ingestPrimaryCsv(await sdnRes.text(), 'SDN', entriesMap, evmAddressMap);
  if (altRes.ok) ingestAltCsv(await altRes.text(), entriesMap);
  if (commentsRes?.ok) ingestCommentsCsv(await commentsRes.text(), entriesMap, evmAddressMap);

  let nonSdnCount = 0;
  if (consRes?.ok) {
    nonSdnCount = ingestPrimaryCsv(await consRes.text(), 'NON_SDN_CONSOLIDATED', entriesMap, evmAddressMap);
    if (consAltRes?.ok) ingestAltCsv(await consAltRes.text(), entriesMap);
    if (consCommentsRes?.ok) ingestCommentsCsv(await consCommentsRes.text(), entriesMap, evmAddressMap);
  }

  const entriesArray = Array.from(entriesMap.values());
  const snapshot = {
    generated_at: new Date().toISOString(),
    count: entriesArray.length,
    sdn_count: sdnCount,
    non_sdn_consolidated_count: nonSdnCount,
    evm_address_count: evmAddressMap.size,
    source: 'US Department of the Treasury OFAC SDN & Consolidated Non-SDN Sanctions Lists',
    entries: entriesArray.map(e => [e.uid, e.name, e.type, e.programs, e.aliases, e.listType]),
    evm_addresses: Array.from(evmAddressMap.entries())
  };

  fs.writeFileSync(outputFile, JSON.stringify(snapshot));
  const stats = fs.statSync(outputFile);
  console.log(`Successfully generated ${outputFile}`);
  console.log(`Total entries: ${entriesArray.length} (SDN: ${sdnCount}, Non-SDN Consolidated: ${nonSdnCount}), Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Error generating SDN snapshot:', err);
  process.exit(1);
});
