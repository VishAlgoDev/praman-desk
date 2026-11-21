import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const voice = 'en-IN-NeerjaExpressiveNeural';
const rate = '-2%';

const sections = [
  {
    id: 1,
    name: 'intro_state',
    text: "Welcome to Praman Desk, the autonomous pre-payment spend firewall for AI agents and DAOs on Telegraph Protocol. Operating live on Devnode Miner sixty-one twenty-seven, bonded on Sepolia Diamond sixty-one forty-two with eighteen active tools.",
    holdAfterSec: 1.5
  },
  {
    id: 2,
    name: 'two_minds_scen_7',
    text: "Here is Scenario Seven: the Two-Mind spend guard on hellominds dot ai. An agent attempts a ten thousand five hundred dollar payout with an inverted exchange rate. The firewall reconciles the transaction in our six-hundred-fifty-one byte WebAssembly engine, catches the thirteen hundred seventy-three dollar discrepancy, and halts execution before signing.",
    holdAfterSec: 2.0
  },
  {
    id: 3,
    name: 'sanctions_and_payout',
    text: "Scenario One screens counterparty addresses against US Treasury OFAC records, catching a Lazarus Group match in three milliseconds. Scenario Three clears a compliant payout to Anthropic, validating legal entity identifiers in GLEIF and authorizing instant settlement.",
    holdAfterSec: 2.0
  },
  {
    id: 4,
    name: 'ledger_closing',
    text: "Every verified transaction commits to our immutable Sepolia Diamond ledger. Fifty-seven on-chain receipts are published with verifiable Etherscan transaction hashes. Praman Desk prevents catastrophic capital loss before any wallet signs.",
    holdAfterSec: 2.5
  }
];

const audioDir = path.resolve('public/audio/path_a');
if (fs.existsSync(audioDir)) {
  fs.rmSync(audioDir, { recursive: true, force: true });
}
fs.mkdirSync(audioDir, { recursive: true });

console.log(`Generating Path A voiceover clips with ${voice}...`);
const manifest = [];
let accumulatedTime = 0;

for (const s of sections) {
  const rawFile = path.join(audioDir, `raw_${s.id}_${s.name}.mp3`);
  const cleanFile = path.join(audioDir, `section_${s.id}_${s.name}.mp3`);
  
  const cmd = `edge-tts --voice ${voice} --rate="${rate}" --text "${s.text.replace(/"/g, '\\"')}" --write-media "${rawFile}"`;
  execSync(cmd, { stdio: 'inherit' });
  
  // Warm studio audio filter
  const filterCmd = `ffmpeg -y -i "${rawFile}" -af "highpass=f=80,equalizer=f=250:t=q:w=1.5:g=2.2,equalizer=f=3500:t=q:w=1.5:g=1.8,lowpass=f=12000,acompressor=threshold=-18dB:ratio=3:attack=5:release=50" "${cleanFile}"`;
  execSync(filterCmd, { stdio: 'pipe' });
  if (fs.existsSync(rawFile)) fs.unlinkSync(rawFile);
  
  const durProbe = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${cleanFile}"`).toString().trim());
  
  // Generate exact silence padding after this section
  const silenceFile = path.join(audioDir, `silence_${s.id}.mp3`);
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${s.holdAfterSec} -c:a libmp3lame -q:a 2 "${silenceFile}"`, { stdio: 'pipe' });
  
  const startTime = accumulatedTime;
  const sectionTotal = durProbe + s.holdAfterSec;
  accumulatedTime += sectionTotal;
  
  manifest.push({
    ...s,
    audioFile: cleanFile,
    silenceFile: silenceFile,
    audioDuration: durProbe,
    holdDuration: s.holdAfterSec,
    totalDuration: sectionTotal,
    startTime: startTime,
    endTime: accumulatedTime
  });
  
  console.log(`  Section ${s.id} (${s.name}): audio=${durProbe.toFixed(2)}s + hold=${s.holdAfterSec}s = ${sectionTotal.toFixed(2)}s (starts at ${startTime.toFixed(2)}s)`);
}

// Concat audio files into single master audio track
const concatList = path.join(audioDir, 'concat.txt');
const lines = [];
manifest.forEach(m => {
  lines.push(`file '${m.audioFile.replace(/\\/g, '/')}'`);
  lines.push(`file '${m.silenceFile.replace(/\\/g, '/')}'`);
});
fs.writeFileSync(concatList, lines.join('\n'));

const masterAudio = path.join(audioDir, 'master_narration.mp3');
execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c:a libmp3lame -q:a 2 "${masterAudio}"`, { stdio: 'inherit' });

const totalDuration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${masterAudio}"`).toString().trim());
console.log(`\nMaster Narration Track Generated: ${masterAudio} (${totalDuration.toFixed(2)}s)`);

fs.writeFileSync(path.join(audioDir, 'timeline.json'), JSON.stringify({ totalDuration, manifest }, null, 2));
