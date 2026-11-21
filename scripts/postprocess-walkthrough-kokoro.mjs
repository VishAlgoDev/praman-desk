import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rawVideo = 'C:\\Users\\visha\\AppData\\Local\\raw_walkthrough_kokoro_clean.mp4';
const narration = 'C:\\Users\\Public\\My Agent\\telegraph-h2\\public\\audio\\master_narration.mp3';
const outMaster = 'C:\\Users\\Public\\My Agent\\telegraph-h2\\public\\praman-desk-walkthrough.mp4';
const outShowcase = 'C:\\Users\\Public\\My Agent\\telegraph-h2\\public\\praman_minds_benchmark_showcase.mp4';

console.log('=== VERIFYING INPUTS ===');
if (!fs.existsSync(rawVideo)) {
  console.error('Raw video missing:', rawVideo);
  process.exit(1);
}
if (!fs.existsSync(narration)) {
  console.error('Narration missing:', narration);
  process.exit(1);
}

const rawStats = fs.statSync(rawVideo);
const narrationStats = fs.statSync(narration);
console.log(`Raw video: ${rawStats.size} bytes`);
console.log(`Narration: ${narrationStats.size} bytes`);

console.log('=== RENDERING 1080P SCREEN STUDIO WALKTHROUGH WITH KOKORO AUDIO ===');
const filterGraph = [
  'crop=in_w:in_h-120:0:72',
  'scale=1680:910:flags=lanczos',
  'pad=1920:1080:(1920-1680)/2:(1080-910)/2:color=0x070b14',
  'drawbox=x=(1920-1680)/2:y=(1080-910)/2:w=1680:h=910:color=0x38bdf8:t=2'
].join(',');

const cmd = [
  'ffmpeg', '-y',
  '-i', `"${rawVideo}"`,
  '-i', `"${narration}"`,
  '-filter_complex', `"[0:v]${filterGraph}[v]"`,
  '-map', '"[v]"',
  '-map', '1:a',
  '-c:v', 'libx264',
  '-crf', '19',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-shortest',
  '-movflags', '+faststart',
  `"${outMaster}"`
].join(' ');

console.log('Running FFmpeg rendering command...');
execSync(cmd, { stdio: 'inherit', shell: 'cmd.exe' });

console.log('=== MINDS SHORT CLIP ===');
execSync('node scripts/excerpt-walkthrough-benchmark.mjs', { stdio: 'inherit' });

const masterStats = fs.statSync(outMaster);
const showcaseStats = fs.statSync(outShowcase);
console.log(`Master walkthrough: ${outMaster} (${masterStats.size} bytes)`);
console.log(`Showcase video: ${outShowcase} (${showcaseStats.size} bytes)`);
console.log('=== RENDER COMPLETE ===');
