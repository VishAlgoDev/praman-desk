import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Indian English Woman (Expressive Neural)
const voice = 'en-IN-NeerjaExpressiveNeural';
const rate = '-3%';

const sections = [
  {
    id: 1,
    name: 'intro',
    text: "Welcome to Praman Desk, an autonomous pre-payment spend guard and clearing desk for AI agents on Telegraph Protocol. When autonomous agents manage real treasury balances, paying an unverified vendor or clearing tampered invoice math can drain funds in seconds. Here is how Praman Desk stops that on Ethereum Sepolia."
  },
  {
    id: 2,
    name: 'gleif',
    text: "First, instant counterparty verification. Before money moves, Praman Desk queries the official GLEIF registry across over two hundred jurisdictions in real time. Clicking Stripe, LLC validates its active corporate status and returns its official LEI. We can also verify German companies like SAP SE with direct Handelsregister and VIES EU VAT validation."
  },
  {
    id: 3,
    name: 'pipeline',
    text: "Next, our one-click autonomous agent spend pipeline. Watch it probe the signer, execute multi-source primary audits, query Telegraph miners over x402 micropayments, and run client-side WebAssembly scoring. The live terminal displays each verification step as it happens, enforcing full settlement clearance before signing."
  },
  {
    id: 4,
    name: 'mission02',
    text: "Here is Mission 02 in action: unapproved exploit detection. When an agent is prompted with an address associated with the Lazarus Group Ronin bridge exploit, Praman Desk scans nineteen thousand OFAC SDN records and EVM addresses, immediately halting the transaction with a REJECT AND FREEZE decision. On transactions over one thousand dollars, the FATF Travel Rule is strictly enforced."
  },
  {
    id: 5,
    name: 'mission04',
    text: "For Mission 04, we generate an overnight five-jurisdiction legal diligence pack across the UK, Germany, GLEIF, Federal Register, and SEC EDGAR in three point two seconds. Our six hundred and fifty-one byte standalone WebAssembly comparator performs deterministic three-way reconciliation, catching one-cent variances without floating-point drift."
  },
  {
    id: 6,
    name: 'miner_closing',
    text: "All verifications are recorded in our on-chain receipt ledger. And on Devnode Epoch 2107, our Miner 5289 achieved Rank 2 network-wide on invoice reconciliation and Rank 3 on regulatory filings. Developers can install our ten-tool MCP server today with npx at praman slash spend guard mcp. Zero slop, verified on chain."
  }
];

if (!fs.existsSync('public/audio')) {
  fs.mkdirSync('public/audio', { recursive: true });
}

console.log(`Generating humanized voiceover clips with edge-tts (${voice}, rate=${rate})...`);

const audioFiles = [];
for (const s of sections) {
  const rawFile = path.join('public', 'audio', `raw_${s.id}_${s.name}.mp3`);
  const outFile = path.join('public', 'audio', `section_${s.id}_${s.name}.mp3`);
  console.log(`Generating clip ${s.id}: ${s.name}...`);
  const cmd = `edge-tts --voice ${voice} --rate="${rate}" --text "${s.text.replace(/"/g, '\\"')}" --write-media "${rawFile}"`;
  execSync(cmd, { stdio: 'inherit' });
  
  // Apply studio warmth, de-essing and gentle compression to remove AI digital harshness
  const filterCmd = `ffmpeg -y -i "${rawFile}" -af "highpass=f=80,equalizer=f=250:t=q:w=1.5:g=2.2,equalizer=f=3500:t=q:w=1.5:g=1.8,lowpass=f=12000,acompressor=threshold=-18dB:ratio=3:attack=5:release=50" "${outFile}"`;
  execSync(filterCmd, { stdio: 'pipe' });
  if (fs.existsSync(rawFile)) fs.unlinkSync(rawFile);

  // Get duration via ffprobe
  const probe = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outFile}"`).toString().trim();
  const dur = parseFloat(probe);
  console.log(`  -> Duration: ${dur.toFixed(2)}s`);
  audioFiles.push({ ...s, file: outFile, duration: dur });
}

fs.writeFileSync('public/audio/manifest.json', JSON.stringify(audioFiles, null, 2));

// Concatenate all audio files with 1.2s silence between sections for natural human breathing room
console.log('\nConcatenating audio with natural pauses...');
execSync('ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t 1.2 -c:a libmp3lame -q:a 2 public/audio/silence.mp3', { stdio: 'pipe' });

const concatList = [];
for (let i = 0; i < audioFiles.length; i++) {
  concatList.push(`file '${path.resolve(audioFiles[i].file).replace(/\\/g, '/')}'`);
  if (i < audioFiles.length - 1) {
    concatList.push(`file '${path.resolve('public/audio/silence.mp3').replace(/\\/g, '/')}'`);
  }
}

fs.writeFileSync('public/audio/concat_audio.txt', concatList.join('\n'));
execSync('ffmpeg -y -f concat -safe 0 -i public/audio/concat_audio.txt -c:a libmp3lame -q:a 2 public/narration.mp3', { stdio: 'inherit' });

const totalAudioDur = parseFloat(execSync('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/narration.mp3').toString().trim());
console.log(`\nMaster Humanized Narration Audio generated: public/narration.mp3 (${totalAudioDur.toFixed(2)}s)`);
