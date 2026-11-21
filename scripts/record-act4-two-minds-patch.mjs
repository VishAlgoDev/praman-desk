/**
 * Re-records Act 4 video (~50s): Scenario 7 Two-Mind halt, then Scenario 3 approve.
 * Splices into master walkthrough (audio unchanged) via splice-walkthrough-act4.mjs
 */
import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PATCH_SEC = 50;
const REC_DIR = path.join('public', 'recorded_act4_patch');
const RAW_WEBM = path.join(REC_DIR, 'act4_raw.webm');
const FILTERED_MP4 = path.join(REC_DIR, 'act4_patch.mp4');

const waitScen7Halt = async (page) => {
  await page.waitForFunction(
    () => {
      const active = document.getElementById('card-scen-7')?.classList.contains('active');
      const headline = document.getElementById('verdict-headline')?.textContent || '';
      const t = document.getElementById('verdict-summary')?.textContent || '';
      return (
        active &&
        (headline.includes('HALT') || t.includes('9127') || t.includes('WASM_3WAY') || t.includes('Two-Mind'))
      );
    },
    { timeout: 45000 }
  );
};

const waitScen3Approve = async (page) => {
  await page.waitForFunction(
    () => {
      const active = document.getElementById('card-scen-3')?.classList.contains('active');
      const headline = document.getElementById('verdict-headline')?.textContent || '';
      return active && (headline.includes('APPROVED') || headline.includes('SAFE'));
    },
    { timeout: 45000 }
  );
};

async function main() {
  console.log('=== Act 4 patch record (~50s, Scenarios 7 + 3) ===');

  if (fs.existsSync(REC_DIR)) fs.rmSync(REC_DIR, { recursive: true, force: true });
  fs.mkdirSync(REC_DIR, { recursive: true });

  const server = spawn('node', ['web/server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3402' },
    stdio: 'ignore',
  });
  await new Promise((r) => setTimeout(r, 2800));

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
    await page.goto('http://127.0.0.1:3402/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#card-scen-7');
    await page.waitForTimeout(800);

    await page.locator('#card-scen-7').click();
    await waitScen7Halt(page);
    await page.waitForTimeout(5500);
    await page.evaluate(() => {
      document.getElementById('verdict-banner')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    await page.waitForTimeout(4500);
    await page.locator('#card-scen-3').click();
    await waitScen3Approve(page);
    await page.waitForTimeout(6000);
    await page.evaluate(() => {
      document.getElementById('verdict-banner')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    await page.waitForTimeout(Math.max(0, (PATCH_SEC - 25) * 1000));
  } finally {
    await context.close();
    await browser.close();
    server.kill('SIGTERM');
  }

  const webm = fs.readdirSync(REC_DIR).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('No webm recorded');
  fs.renameSync(path.join(REC_DIR, webm), RAW_WEBM);

  const filterGraph = [
    'crop=in_w:in_h-120:0:72',
    'scale=1680:910:flags=lanczos',
    'pad=1920:1080:(1920-1680)/2:(1080-910)/2:color=0x070b14',
    'drawbox=x=(1920-1680)/2:y=(1080-910)/2:w=1680:h=910:color=0x38bdf8:t=2',
  ].join(',');

  execSync(
    [
      'ffmpeg -y',
      `-i "${RAW_WEBM}"`,
      `-t ${PATCH_SEC}`,
      `-vf "${filterGraph}"`,
      '-c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -an',
      '-movflags +faststart',
      `"${FILTERED_MP4}"`,
    ].join(' '),
    { stdio: 'inherit', shell: 'cmd.exe' }
  );

  console.log('Wrote', FILTERED_MP4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});