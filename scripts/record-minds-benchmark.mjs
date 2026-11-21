/**
 * Minds benchmark clip — starts on Praman Desk dashboard only (no terminal / fake script pages).
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const LOCAL = 'http://127.0.0.1:3402/';
const OUT_MP4 = path.join('public', 'praman_minds_benchmark_showcase.mp4');
const REC_DIR = path.join('public', 'recorded_benchmark');
const TARGET_SECONDS = 45;

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

async function record() {
  console.log('=== Minds benchmark (dashboard-first) ===');

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
    await hold(page, 3500, 'dashboard open — header + scenario cards');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('.hero-banner, .header-badges').first().scrollIntoViewIfNeeded().catch(() => {});
    await hold(page, 2500, 'Praman Desk hero');

    await page.locator('#card-scen-7').click();
    await waitTwoMindVerdict(page);
    await hold(page, 6000, 'Scenario 7 — Two-Mind FX halt (verdict)');

    await page.evaluate(() => {
      const v = document.getElementById('verdict-banner');
      if (v) v.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, 4000, 'verdict detail');

    await page.evaluate(() => {
      const h = document.querySelector('h4');
      const nodes = [...document.querySelectorAll('h4')];
      const bench = nodes.find((n) => n.textContent?.includes('79,373'));
      if (bench) bench.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await hold(page, 5000, '$79,373 benchmark table on site');

    await page.evaluate(() => {
      const q = document.querySelector('.quickstart-card') || document.getElementById('mcp-snip');
      if (q) q.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await hold(page, 5000, 'repro commands on page (not terminal)');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await hold(page, 2500, 'end — back to dashboard top');
  } finally {
    await context.close();
    await browser.close();
    server.kill('SIGTERM');
  }

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No recording');
  execSync(
    `ffmpeg -y -i "${path.join(REC_DIR, webm)}" -t ${TARGET_SECONDS} -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -an -movflags +faststart "${OUT_MP4}"`,
    { stdio: 'inherit' }
  );
  console.log('DONE:', OUT_MP4, fs.statSync(OUT_MP4).size);
}

record().catch((e) => {
  console.error(e);
  process.exit(1);
});