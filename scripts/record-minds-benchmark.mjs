/**
 * Accurate ~45s Minds benchmark clip: real test log + live Two-Mind scenario only.
 * No fake cards, no raw /api/status, no scenario mismatch.
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const LOCAL = 'http://127.0.0.1:3402/';
const OUT_MP4 = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const REC_DIR = path.join('public', 'recorded_benchmark');
const TARGET_SECONDS = 48;

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildLogPage(log) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>minds:test output</title>
<style>
body{margin:0;background:#0a0f1a;color:#e2e8f0;font:15px/1.5 Consolas,monospace;padding:28px}
h1{font:600 20px system-ui;color:#7dd3fc;margin:0 0 8px}
.sub{color:#94a3b8;font:13px system-ui;margin-bottom:16px}
pre{white-space:pre-wrap;margin:0;max-height:920px;overflow:hidden}
</style></head><body>
<h1>npm run minds:test</h1>
<div class="sub">Live command output (not simulated). Same test judges can run from the repo.</div>
<pre id="log">${escapeHtml(log)}</pre>
</body></html>`;
}

async function hold(page, ms, label) {
  console.log(`  ${(ms / 1000).toFixed(1)}s — ${label}`);
  await page.waitForTimeout(ms);
}

async function waitTwoMindVerdict(page, timeoutMs = 25000) {
  await page.waitForFunction(
    () => {
      const s = document.getElementById('verdict-summary');
      const p = document.getElementById('active-scenario-pill');
      const t = `${s?.textContent || ''} ${p?.textContent || ''}`;
      return (
        t.includes('Two-Mind Spend Guard') ||
        t.includes('INVERTED_FX') ||
        t.includes('inverted FX')
      );
    },
    { timeout: timeoutMs }
  );
}

async function record() {
  console.log('=== Accurate Minds benchmark recorder ===');

  const testLog = execSync('node examples/minds-spend-guard/test-two-minds.mjs', {
    encoding: 'utf8',
    timeout: 180000,
    cwd: process.cwd(),
  });
  if (!testLog.includes('ALL 4/4 TESTS PASSED')) {
    throw new Error('Two-Mind test did not pass — refusing to record misleading video.');
  }

  const logHtml = path.resolve('public', 'benchmark-recording-shell.html');
  fs.writeFileSync(logHtml, buildLogPage(testLog), 'utf8');

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
    await page.goto(`file:///${logHtml.replace(/\\/g, '/')}`, { waitUntil: 'domcontentloaded' });
    await hold(page, 4000, 'test output — header + TEST 1');
    await page.evaluate(() => {
      const pre = document.getElementById('log');
      if (pre) pre.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
    await hold(page, 5000, 'test output — scroll to 4/4 PASS');

    await page.goto(LOCAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#card-scen-7', { timeout: 20000 });

    await page.locator('#card-scen-7').click();
    await waitTwoMindVerdict(page);
    await hold(page, 5500, 'Two-Mind halt UI (Stripe FX) — matches test 2');

    await page.evaluate(() => {
      const el = document.querySelector('.bench-block, #benchmark-section, .benchmark-panel');
      const alt = document.querySelector('[class*="benchmark"]');
      const target = el || alt;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else document.getElementById('verdict-banner')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, 4500, 'benchmark metrics block');

    await page.evaluate(() => {
      const pill = document.getElementById('active-scenario-pill');
      if (pill) pill.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, 3000, 'scenario title hold');
  } finally {
    await context.close();
    await browser.close();
    server.kill('SIGTERM');
  }

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No recording');
  const rawWebm = path.join(REC_DIR, webm);

  execSync(
    `ffmpeg -y -i "${rawWebm}" -t ${TARGET_SECONDS} -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -an -movflags +faststart "${OUT_MP4}"`,
    { stdio: 'inherit' }
  );

  console.log('DONE:', OUT_MP4, fs.statSync(OUT_MP4).size, 'bytes');
}

record().catch((e) => {
  console.error(e);
  process.exit(1);
});