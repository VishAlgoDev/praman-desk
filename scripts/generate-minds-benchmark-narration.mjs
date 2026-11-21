/**
 * Voice track for praman_minds_benchmark_showcase.mp4 (same voice as walkthrough).
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const voice = 'en-IN-NeerjaExpressiveNeural';
const rate = '-3%';
const OUT = path.join('public', 'audio', 'minds_benchmark_narration.mp3');

const text =
  'Praman Desk is a pre-payment firewall for AI agents on Telegraph. ' +
  'Scenario seven is the Two-Mind spend guard for Minds: an investigator gathers evidence, a reviewer halts spend. ' +
  'Here an inverted euro-dollar rate on a Stripe payout is caught, and ten thousand five hundred dollars stays frozen before release. ' +
  'Our benchmark shows seventy-nine thousand three hundred seventy-three dollars in simulated losses averted across five adversarial tests. ' +
  'For the full narrated product tour, open the ninety-second walkthrough on praman-desk dot vercel dot app.';

if (!fs.existsSync('public/audio')) fs.mkdirSync('public/audio', { recursive: true });

const raw = path.join('public', 'audio', 'minds_benchmark_narration_raw.mp3');
console.log('Generating Minds benchmark narration (edge-tts)...');
execSync(
  `edge-tts --voice ${voice} --rate="${rate}" --text "${text.replace(/"/g, '\\"')}" --write-media "${raw}"`,
  { stdio: 'inherit' }
);
execSync(
  `ffmpeg -y -i "${raw}" -af "highpass=f=80,equalizer=f=250:t=q:w=1.5:g=2.2,equalizer=f=3500:t=q:w=1.5:g=1.8,lowpass=f=12000,acompressor=threshold=-18dB:ratio=3:attack=5:release=50" "${OUT}"`,
  { stdio: 'pipe' }
);
if (fs.existsSync(raw)) fs.unlinkSync(raw);

const dur = parseFloat(
  execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${OUT}"`
  )
    .toString()
    .trim()
);
console.log(`Wrote ${OUT} (${dur.toFixed(2)}s)`);