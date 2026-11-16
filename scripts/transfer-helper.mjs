import fs from 'fs';

export function appendChunk(jsonPath, outPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  // Extract b64 value using simple indexOf
  const idx = raw.indexOf('"b64":"');
  if (idx === -1) {
    const idx2 = raw.indexOf('"b64": "');
    if (idx2 === -1) throw new Error('b64 not found in ' + jsonPath);
    const start = idx2 + 8;
    const end = raw.indexOf('"', start);
    const b64 = raw.slice(start, end);
    const buf = Buffer.from(b64, 'base64');
    fs.appendFileSync(outPath, buf);
    console.log(`Appended ${buf.length} bytes to ${outPath}`);
    return;
  }
  const start = idx + 7;
  const end = raw.indexOf('"', start);
  const b64 = raw.slice(start, end);
  const buf = Buffer.from(b64, 'base64');
  fs.appendFileSync(outPath, buf);
  console.log(`Appended ${buf.length} bytes to ${outPath}`);
}

const args = process.argv.slice(2);
if (args[0] === 'append') {
  appendChunk(args[1], args[2]);
} else if (args[0] === 'init') {
  fs.writeFileSync(args[1], Buffer.alloc(0));
  console.log(`Initialized empty file at ${args[1]}`);
}
