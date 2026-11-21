/**
 * @deprecated Separate Playwright + edge-tts benchmark recorder — sounded like AI slop.
 * Use: node scripts/excerpt-walkthrough-benchmark.mjs
 */
import { spawnSync } from 'child_process';

console.warn('record-minds-benchmark.mjs is deprecated (no separate TTS).');
const r = spawnSync('node', ['scripts/excerpt-walkthrough-benchmark.mjs'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});
process.exit(r.status ?? 1);