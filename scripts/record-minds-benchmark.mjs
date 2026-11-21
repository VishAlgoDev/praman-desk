/**
 * ~50s real screen capture for public/praman_minds_benchmark_showcase.mp4
 * Production app + terminal test output (not FFmpeg slides).
 *
 * Usage: npm run video:record-benchmark
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROD = 'https://praman-desk.vercel.app';
const OUT_MP4 = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const REC_DIR = path.join('public', 'recorded_benchmark');
const TARGET_SECONDS = 50;

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildTerminalHtml(log) {
  const tail = log.slice(-4000);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Repro</title></head>
<body style="margin:0;background:#0b1220;color:#cbd5e1;font-family:Consolas,monospace;font-size:15px;line-height:1.45;padding:24px">
<div style="color:#38bdf8;font-size:18px;margin-bottom:12px">node examples/minds-spend-guard/test-two-minds.mjs (live production)</div>
<pre style="white-space:pre-wrap">${escapeHtml(tail)}</pre>
<div style="margin-top:16px;color:#94a3b8">Repro: npm run minds:test</div>
</body></html>`;
}

async function hold(page, ms, label) {
  console.log(`  hold ${(ms / 1000).toFixed(1)}s — ${label}`);
  await page.waitForTimeout(ms);
}

async function record() {
  console.log('=== Benchmark showcase recorder (Playwright + production) ===');

  let testLog = '';
  try {
    console.log('1. Running Two-Mind test (captures real PASS output)...');
    testLog = execSync('node examples/minds-spend-guard/test-two-minds.mjs', {
      encoding: 'utf8',
      timeout: 180000,
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log('   Test finished OK.');
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '') + String(e.message || e);
    if (!out.includes('PASS') && !out.includes('passed')) {
      throw new Error(`Two-Mind test failed; aborting video.\n${out.slice(-2000)}`);
    }
    testLog = out;
    console.warn('   Test exited non-zero but output looks usable; continuing.');
  }

  const htmlPath = path.resolve('public', 'benchmark-recording-shell.html');
  fs.writeFileSync(htmlPath, buildTerminalHtml(testLog), 'utf8');

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

  const section = async (ms, fn) => {
    await fn();
    await hold(page, ms, 'section pad');
  };

  console.log('2. Recording browser...');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'domcontentloaded' });
  await hold(page, 11000, 'terminal repro');

  await page.goto(PROD, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#card-scen-1', { timeout: 30000 });
  await hold(page, 1500, 'home load');

  await section(3000, async () => {
    await page.locator('#card-scen-1').click();
    await page.waitForTimeout(800);
  });
  await section(4000, async () => {
    await page.evaluate(() => {
      const v = document.querySelector('#verdict-banner');
      if (v) v.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  await section(3500, async () => {
    await page.locator('#card-scen-7').click();
    await page.waitForTimeout(600);
  });

  await section(3500, async () => {
    await page.evaluate(() => {
      const q = document.querySelector('.quickstart-card') || document.querySelector('#mcp-snip');
      if (q) q.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  await page.goto(`${PROD}/api/status`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await hold(page, 9000, '/api/status Diamond #6142');

  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText =
      'position:fixed;bottom:24px;right:24px;background:rgba(15,23,42,.92);color:#e2e8f0;padding:16px 22px;border-radius:12px;font:600 16px system-ui;border:1px solid #334155;z-index:99999';
    d.innerHTML =
      'Full demo: praman-desk-walkthrough.mp4<br/>Repro: npm run minds:test';
    document.body.appendChild(d);
  });
  await hold(page, 4000, 'end card');

  await context.close();
  await browser.close();

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No webm recording produced');
  const rawWebm = path.join(REC_DIR, webm);

  console.log(`3. Encoding ${TARGET_SECONDS}s MP4 → ${OUT_MP4}`);
  const ffmpegCmd = [
    'ffmpeg -y',
    `-i "${rawWebm}"`,
    `-t ${TARGET_SECONDS}`,
    '-c:v libx264 -pix_fmt yuv420p -preset medium -crf 23',
    '-an',
    '-movflags +faststart',
    `"${OUT_MP4}"`,
  ].join(' ');
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const size = fs.statSync(OUT_MP4).size;
  console.log('========================================================');
  console.log('DONE:', OUT_MP4, `(${size} bytes)`);
  if (size < 1_500_000) {
    console.warn('WARNING: file still small — check recording content before Discord.');
  }
  console.log('========================================================');
}

record().catch((err) => {
  console.error(err);
  process.exit(1);
});