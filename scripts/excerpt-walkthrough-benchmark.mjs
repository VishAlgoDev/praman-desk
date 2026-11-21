/**
 * Builds public/praman_minds_benchmark_showcase.mp4 as a straight cut from
 * praman-desk-walkthrough.mp4 — same voice, same script (no second TTS).
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = path.join('public', 'praman-desk-walkthrough.mp4');
const OUT = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const START = '0';
const DURATION = '52';

if (!fs.existsSync(SRC)) {
  console.error('Missing walkthrough:', SRC, '— run npm run video:walkthrough or record-capptivo-style first.');
  process.exit(1);
}

console.log(`Cutting ${DURATION}s from walkthrough → ${OUT}`);
execSync(
  [
    'ffmpeg -y',
    `-ss ${START}`,
    `-i "${SRC}"`,
    `-t ${DURATION}`,
    '-c:v libx264 -pix_fmt yuv420p -preset medium -crf 22',
    '-c:a aac -b:a 192k',
    '-movflags +faststart',
    `"${OUT}"`,
  ].join(' '),
  { stdio: 'inherit' }
);
console.log('OK', OUT, fs.statSync(OUT).size, 'bytes — audio is from walkthrough only.');