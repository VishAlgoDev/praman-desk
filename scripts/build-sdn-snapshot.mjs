import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'data', 'sdn-snapshot.json');

const SDN_CSV_URL = 'https://www.treasury.gov/ofac/downloads/sdn.csv';
const ALT_CSV_URL = 'https://www.treasury.gov/ofac/downloads/alt.csv';
const SDN_COMMENTS_URL = 'https://www.treasury.gov/ofac/downloads/sdn_comments.csv';

function extractEvmAddresses(text = '') {
  return [...new Set((String(text).match(/0x[0-9a-fA-F]{40}/g) || []).map(a => a.toLowerCase()))];
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

async function main() {
  console.log('Downloading official OFAC SDN, ALT & Comments lists...');
  const [sdnRes, altRes, commentsRes] = await Promise.all([
    fetch(SDN_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }),
    fetch(ALT_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }),
    fetch(SDN_COMMENTS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }).catch(() => null)
  ]);

  if (!sdnRes.ok) throw new Error(`SDN download failed: ${sdnRes.status}`);

  const sdnText = await sdnRes.text();
  const entriesMap = new Map();
  const evmAddressMap = new Map();

  for (const line of sdnText.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const uid = f[0];
    const name = f[1] || '';
    const sdnType = f[2] === '-0-' ? 'Entity' : (f[2] || 'Entity');
    const program = f[3] === '-0-' ? '' : (f[3] || '');
    if (uid && name) {
      entriesMap.set(uid, { uid, name, type: sdnType, programs: program, aliases: [] });
      for (const addr of extractEvmAddresses(line)) {
        evmAddressMap.set(addr, uid);
      }
    }
  }

  if (altRes.ok) {
    const altText = await altRes.text();
    for (const line of altText.split('\n')) {
      if (!line.trim()) continue;
      const f = parseCsvLine(line);
      const sdnUid = f[0];
      const aliasName = f[3] || '';
      if (sdnUid && aliasName && entriesMap.has(sdnUid)) {
        const item = entriesMap.get(sdnUid);
        if (item.aliases.length < 5) { // retain top 5 aliases to optimize payload
          item.aliases.push(aliasName);
        }
      }
    }
  }

  if (commentsRes?.ok) {
    const commentsText = await commentsRes.text();
    let currentUid = null;
    for (const line of commentsText.split('\n')) {
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

  const entriesArray = Array.from(entriesMap.values());
  const snapshot = {
    generated_at: new Date().toISOString(),
    count: entriesArray.length,
    evm_address_count: evmAddressMap.size,
    source: 'US Department of the Treasury OFAC Specially Designated Nationals List',
    entries: entriesArray.map(e => [e.uid, e.name, e.type, e.programs, e.aliases]),
    evm_addresses: Array.from(evmAddressMap.entries())
  };

  fs.writeFileSync(outputFile, JSON.stringify(snapshot));
  const stats = fs.statSync(outputFile);
  console.log(`Successfully generated ${outputFile}`);
  console.log(`Total entries: ${entriesArray.length}, Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Error generating SDN snapshot:', err);
  process.exit(1);
});
