import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'data', 'sdn-snapshot.json');

const SDN_CSV_URL = 'https://www.treasury.gov/ofac/downloads/sdn.csv';
const ALT_CSV_URL = 'https://www.treasury.gov/ofac/downloads/alt.csv';

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
  console.log('Downloading official OFAC SDN & ALT lists...');
  const [sdnRes, altRes] = await Promise.all([
    fetch(SDN_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) }),
    fetch(ALT_CSV_URL, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) })
  ]);

  if (!sdnRes.ok) throw new Error(`SDN download failed: ${sdnRes.status}`);

  const sdnText = await sdnRes.text();
  const entriesMap = new Map();

  for (const line of sdnText.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const uid = f[0];
    const name = f[1] || '';
    const sdnType = f[2] === '-0-' ? 'Entity' : (f[2] || 'Entity');
    const program = f[3] === '-0-' ? '' : (f[3] || '');
    if (uid && name) {
      entriesMap.set(uid, { uid, name, type: sdnType, programs: program, aliases: [] });
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

  const entriesArray = Array.from(entriesMap.values());
  const snapshot = {
    generated_at: new Date().toISOString(),
    count: entriesArray.length,
    source: 'US Department of the Treasury OFAC Specially Designated Nationals List',
    entries: entriesArray.map(e => [e.uid, e.name, e.type, e.programs, e.aliases])
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
