import { performance } from 'node:perf_hooks';

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

async function testMemory() {
  const memBefore = process.memoryUsage();
  console.log('Heap Before Load: ' + Math.round(memBefore.heapUsed / 1024 / 1024) + ' MB');

  const start = performance.now();
  const [sdnRes, altRes] = await Promise.all([
    fetch(SDN_CSV_URL),
    fetch(ALT_CSV_URL)
  ]);
  const [sdnText, altText] = await Promise.all([sdnRes.text(), altRes.text()]);
  const fetchTime = performance.now() - start;

  console.log('SDN CSV Raw Size: ' + (sdnText.length / 1024 / 1024).toFixed(2) + ' MB');
  console.log('ALT CSV Raw Size: ' + (altText.length / 1024 / 1024).toFixed(2) + ' MB');
  console.log('Fetch Duration:   ' + fetchTime.toFixed(1) + ' ms');

  const parseStart = performance.now();
  const entries = new Map();
  for (const line of sdnText.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const uid = f[0];
    const name = f[1] || '';
    const sdnType = f[2] === '-0-' ? 'Entity' : f[2];
    const program = f[3] === '-0-' ? '' : (f[3] || '');
    if (uid && name) entries.set(uid, { name, type: sdnType, programs: program });
  }

  const aliases = new Map();
  for (const line of altText.split('\n')) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    const sdnUid = f[0];
    const aliasName = f[3] || '';
    if (sdnUid && aliasName) {
      if (!aliases.has(sdnUid)) aliases.set(sdnUid, []);
      aliases.get(sdnUid).push(aliasName);
    }
  }
  const parseTime = performance.now() - parseStart;
  console.log('Parse Duration:   ' + parseTime.toFixed(1) + ' ms');
  console.log('SDN Entries:      ' + entries.size);
  console.log('SDN Aliased UIDs: ' + aliases.size);

  const memAfter = process.memoryUsage();
  console.log('Heap After Load:  ' + Math.round(memAfter.heapUsed / 1024 / 1024) + ' MB');
  console.log('Net Heap Added:   ' + Math.round((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024) + ' MB');
  console.log('RSS Memory:       ' + Math.round(memAfter.rss / 1024 / 1024) + ' MB');
}

testMemory().catch(console.error);
