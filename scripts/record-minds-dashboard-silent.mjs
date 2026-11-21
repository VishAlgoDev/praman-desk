/**
 * Silent dashboard clip (Scenario 7) — optional B-roll; primary path is user screen record.
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const LOCAL = 'http://127.0.0.1:3402/';
const REC_DIR = path.join('public', 'recorded_benchmark');
const SILENT_MP4 = path.join(REC_DIR, 'minds_dashboard_silent.mp4');
const TARGET = 35;

async function waitTwoMind(page) {
  await page.waitForFunction(
    () => {
      const t = document.getElementById('verdict-summary')?.textContent || '';
      return t.includes('Two-Mind') || t.includes('inverted');
    },
    { timeout: 30000 }
  );
}

async function main() {
  const server = spawn('node', ['web/server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3402' },
    stdio: 'ignore',
  });
  await new Promise((r) => setTimeout(r, 2800));

  if (fs.existsSync(REC_DIR)) {
    for (const f of fs.readdirSync(REC_DIR)) {
      if (f.endsWith('.webm')) fs.unlinkSync(path.join(REC_DIR, f));
    }
  } else fs.mkdirSync(REC_DIR, { recursive: true });

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
    await page.goto(LOCAL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#card-scen-7');
    await page.waitForTimeout(2000);
    await page.locator('#card-scen-7').click();
    await waitTwoMind(page);
    await page.waitForTimeout(4000);
    await page.evaluate(() =>
      document.getElementById('verdict-banner')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    );
    await page.waitForTimeout(8000);
  } finally {
    await context.close();
    await browser.close();
    server.kill('SIGTERM');
  }

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No webm');
  const raw = path.join(REC_DIR, webm);
  execSync(
    `ffmpeg -y -i "${raw}" -t ${TARGET} -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "${SILENT_MP4}"`,
    { stdio: 'inherit' }
  );
  console.log('Wrote', SILENT_MP4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});