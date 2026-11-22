import fs from 'node:fs';

const lines = fs.readFileSync('miner.yaml', 'utf8').split('\n');
const missing = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^\s*-\s+name:\s+([a-zA-Z0-9_]+)/);
  if (m) {
    const paramName = m[1];
    let hasIntents = false;
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      if (lines[j].match(/^\s*-\s+name:/)) break;
      if (lines[j].match(/^\s*intents:\s*\[/)) {
        hasIntents = true;
        break;
      }
    }
    if (!hasIntents) {
      missing.push({ line: i + 1, param: paramName, text: line.trim() });
    }
  }
}

console.log('Parameters missing intents count:', missing.length);
if (missing.length > 0) {
  console.log('Missing list:', JSON.stringify(missing, null, 2));
}
