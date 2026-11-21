/**
 * Publishes user's Game Bar recording as praman_minds_benchmark_showcase.mp4
 *
 * Input (first found):
 *   public/audio/user_voice_screen_record.mp4
 *   public/audio/user_voice_screen_record.mkv
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const candidates = [
  path.join('public', 'audio', 'user_voice_screen_record.mp4'),
  path.join('public', 'audio', 'user_voice_screen_record.mkv'),
  path.join('public', 'audio', 'user_voice_screen_record.webm'),
];

const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
  console.error('Missing recording. Save your Game Bar clip as:');
  console.error('  public/audio/user_voice_screen_record.mp4');
  console.error('See docs/RECORD_30SEC_HUMAN_VOICE.md');
  process.exit(1);
}

console.log('Publishing human recording:', src);
execSync(
  [
    'ffmpeg -y',
    `-i "${src}"`,
    '-c:v libx264 -pix_fmt yuv420p -preset medium -crf 22',
    '-c:a aac -b:a 192k',
    '-movflags +faststart',
    `"${OUT}"`,
  ].join(' '),
  { stdio: 'inherit' }
);
console.log('OK →', OUT, fs.statSync(OUT).size, 'bytes');
console.log('Next: vercel --prod --yes');