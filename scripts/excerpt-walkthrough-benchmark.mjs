/**
 * Minds short URL: cut from Act 4 (Two-Mind / Scenario 7) of praman-desk-walkthrough.mp4
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = path.join('public', 'praman-desk-walkthrough.mp4');
const OUT = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const TIMELINE = path.join('public', 'audio', 'prabhat', 'timeline.json');

if (!fs.existsSync(SRC)) {
  console.error('Missing walkthrough:', SRC);
  process.exit(1);
}

let START = '182';
let DURATION = '42';

if (fs.existsSync(TIMELINE)) {
  const { acts } = JSON.parse(fs.readFileSync(TIMELINE, 'utf8'));
  const act4 = acts.find((a) => a.act === 'act_4_two_minds');
  if (act4) {
    START = (act4.start + 2).toFixed(2);
    DURATION = Math.min(48, act4.duration - 2).toFixed(0);
    console.log(`Minds excerpt: Act 4 Two-Mind @ ${START}s for ${DURATION}s`);
  }
}

console.log(`Cutting → ${OUT}`);
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
  { stdio: 'inherit', shell: 'cmd.exe' }
);
console.log('OK', OUT, fs.statSync(OUT).size, 'bytes');