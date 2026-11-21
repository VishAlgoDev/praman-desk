/**
 * Minds benchmark clip — dashboard-first + narrated voice (minds_benchmark_narration.mp3).
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const LOCAL = 'http://127.0.0.1:3402/';
const OUT_MP4 = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const REC_DIR = path.join('public', 'recorded_benchmark');
const NARRATION = path.join('public', 'audio', 'minds_benchmark_narration.mp3');

async function hold(page, ms, label) {
  console.log(`  ${(ms / 1000).toFixed(1)}s — ${label}`);
  await page.waitForTimeout(ms);
}

async function waitTwoMindVerdict(page, timeoutMs = 30000) {
  await page.waitForFunction(
    () => {
      const s = document.getElementById('verdict-summary');
      const p = document.getElementById('active-scenario-pill');
      const t = `${s?.textContent || ''} ${p?.textContent || ''}`;
      return t.includes('Two-Mind') || t.includes('inverted FX') || t.includes('INVERTED_FX');
    },
    { timeout: timeoutMs }
  );
}

function narrationDurationSec() {
  if (!fs.existsSync(NARRATION)) {
    execSync('node scripts/generate-minds-benchmark-narration.mjs', { stdio: 'inherit', cwd: process.cwd() });
  }
  return parseFloat(
    execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${NARRATION}"`
    )
      .toString()
      .trim()
  );
}

async function record() {
  const audioSec = narrationDurationSec();
  const targetVideoSec = Math.ceil(audioSec + 0.5);
  console.log(`=== Minds benchmark (dashboard + voice, ~${audioSec.toFixed(1)}s) ===`);

  execSync('node examples/minds-spend-guard/test-two-minds.mjs', {
    encoding: 'utf8',
    timeout: 180000,
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  const server = spawn('node', ['web/server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3402' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((r) => setTimeout(r, 2800));

  if (fs.existsSync(REC_DIR)) fs.rmSync(REC_DIR, { recursive: true, force: true });
  fs.mkdirSync(REC_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: REC_DIR, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();

  try {
    await page.goto(LOCAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#card-scen-7', { timeout: 20000 });
    const ms = (frac) => Math.round(targetVideoSec * 1000 * frac);

    await hold(page, ms(0.12), 'dashboard open');
    await hold(page, ms(0.1), 'hero');

    await page.locator('#card-scen-7').click();
    await waitTwoMindVerdict(page);
    await hold(page, ms(0.28), 'Scenario 7 Two-Mind halt');

    await page.evaluate(() => {
      const v = document.getElementById('verdict-banner');
      if (v) v.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, ms(0.18), 'verdict detail');

    await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('h4')];
      const bench = nodes.find((n) => n.textContent?.includes('79,373'));
      if (bench) bench.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, ms(0.22), 'benchmark table');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await hold(page, ms(0.1), 'close');
  } finally {
    await context.close();
    await browser.close();
    server.kill('SIGTERM');
  }

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No recording');
  const rawWebm = path.join(REC_DIR, webm);

  execSync(
    `ffmpeg -y -i "${rawWebm}" -i "${NARRATION}" -t ${targetVideoSec} -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -c:a aac -b:a 192k -shortest -movflags +faststart "${OUT_MP4}"`,
    { stdio: 'inherit' }
  );
  console.log('DONE:', OUT_MP4, fs.statSync(OUT_MP4).size);
}

record().catch((e) => {
  console.error(e);
  process.exit(1);
});