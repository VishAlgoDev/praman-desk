import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Indian English Woman (Expressive Neural)
const voice = 'en-IN-NeerjaExpressiveNeural';
const rate = '-3%';

const sections = [
  {
    id: 1,
    name: 'intro_threat',
    text: "In 2026, AI agents and DAOs hold private keys with spend caps. If an agent gets prompt-injected or fed a spoofed invoice, funds move irreversibly in seconds. Here is Praman Desk, a pre-payment firewall on Telegraph Protocol. Scenario one screens the counterparty EVM address against US Treasury OFAC SDN records, catches a Lazarus Group match in under three milliseconds, and blocks the four-thousand-two-hundred-dollar payout before signing."
  },
  {
    id: 2,
    name: 'wasm_overcharge',
    text: "Scenario two tests phantom invoice markup against NVIDIA Corporation. Identity and delegation caps pass cleanly, yet the invoice demands four hundred fifty dollars while ten H100 compute hours total three hundred fifty. Our six-hundred-fifty-one byte standalone WebAssembly engine catches the exact hundred-dollar discrepancy, and anyone can verify the WASM binary directly in the browser with SHA-256 confirmation."
  },
  {
    id: 3,
    name: 'compliant_payout',
    text: "Scenario three validates a clean two-hundred-fifty-dollar payout to Anthropic PBC. Praman Desk resolves the live GLEIF legal entity identifier, verifies clean OFAC sanctions status, confirms zero-percent arithmetic variance in WebAssembly, and authorizes settlement within the five-hundred-dollar autonomous limit."
  },
  {
    id: 4,
    name: 'economics_quickstart',
    text: "A one-cent check on Telegraph prevents a twenty-five-hundred-dollar forensic legal loss, a two-hundred-fifty-thousand-to-one protection ratio. Every verification receipt in our fifty-seven-transaction ledger links directly to Sepolia Etherscan, and any engineer can plug the ten-tool firewall into Cursor or Claude Code in ten seconds via GitHub npx."
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
