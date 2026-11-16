import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function recordLiveWalkthrough() {
  console.log('--- Starting Real Live Dashboard Screen Recording ---');
  
  const recDir = path.join('public', 'recorded_walkthrough');
  if (!fs.existsSync(recDir)) {
    fs.mkdirSync(recDir, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: recDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log('1. Navigating to https://praman-desk.vercel.app/#audit...');
  await page.goto('https://praman-desk.vercel.app/#audit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // SECTION 1: INTRO (0 - 21s)
  console.log('Section 1: Intro Overview...');
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
  await page.waitForTimeout(8000);

  // SECTION 2: GLEIF COUNTERPARTY LOOKUP (21s - 48s)
  console.log('Section 2: Testing GLEIF Live Counterparty Lookup...');
  await page.click('button[data-quick="STRIPE, LLC"]');
  await page.waitForTimeout(1500);
  await page.click('#btn-quick-verify');
  await page.waitForTimeout(5000);

  await page.click('button[data-quick="SAP SE"]');
  await page.waitForTimeout(1500);
  await page.click('#btn-quick-verify');
  await page.waitForTimeout(8000);

  // SECTION 3: 1-CLICK AUTONOMOUS AGENT PIPELINE (48s - 71s)
  console.log('Section 3: Running 1-Click Autonomous Agent Spend Pipeline...');
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  
  if (await page.isVisible('#btn-agent-sim')) {
    await page.click('#btn-agent-sim');
    // Wait for the simulation to progress and stream logs
    await page.waitForTimeout(12000);
  } else {
    await page.waitForTimeout(8000);
  }

  // SECTION 4: MISSION 02 - TAMPER & RECONCILIATION AUDIT (71s - 98s)
  console.log('Section 4: Testing 3-Way Reconciliation & Tamper Detection...');
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  // Click Case 4 preset
  const case4Btn = page.locator('button[data-preset="tamper"]');
  if (await case4Btn.count() > 0) {
    await case4Btn.click();
    await page.waitForTimeout(3000);
    // Click free primary check
    await page.click('#btn-run-free');
    await page.waitForTimeout(8000);
  } else {
    await page.waitForTimeout(8000);
  }

  // SECTION 5: MISSION 04 - COMPLIANCE SUITE & DILIGENCE PACK (98s - 122s)
  console.log('Section 5: Switching to Compliance Suite Tab (Mission 04)...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
  await page.click('button[data-tab="compliance"]');
  await page.waitForTimeout(3000);

  // Click run complete diligence audit
  const runDiligenceBtn = page.locator('#btn-run-diligence');
  if (await runDiligenceBtn.count() > 0) {
    await runDiligenceBtn.click();
    await page.waitForTimeout(10000);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(6000);
  } else {
    await page.waitForTimeout(8000);
  }

  // SECTION 6: ON-CHAIN LEDGER & MINER #5289 (122s - 150s)
  console.log('Section 6: Showing On-Chain Receipt Ledger & Miner #5289...');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(2000);

  // Ledger tab
  await page.click('#tab-btn-ledger');
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await page.waitForTimeout(4000);

  // Miner tab
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);
  await page.click('button[data-tab="miner"]');
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(6000);

  console.log('Finished timeline actions. Closing context...');
  await context.close();
  await browser.close();

  // Find recorded webm file
  const files = fs.readdirSync(recDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No webm video recorded by Playwright');
  }
  const rawWebm = path.join(recDir, files[0]);
  console.log(`Raw screen recording saved at: ${rawWebm}`);

  // Mux video and narration with ffmpeg
  const finalMp4 = path.join('public', 'praman-desk-walkthrough.mp4');
  console.log(`Muxing real dashboard video + neural voiceover into ${finalMp4}...`);

  // Video duration vs Audio duration
  const cmd = `ffmpeg -y -i "${rawWebm}" -i "public/narration.mp3" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "${finalMp4}"`;
  execSync(cmd, { stdio: 'inherit' });

  // Cleanup temp recording folder
  try {
    fs.rmSync(recDir, { recursive: true, force: true });
  } catch (_) {}

  console.log(`\n========================================================`);
  console.log(`SUCCESS! Real dashboard walkthrough with voice created!`);
  console.log(`Saved at: ${finalMp4}`);
  console.log(`========================================================\n`);
}

recordLiveWalkthrough().catch(err => {
  console.error('Fatal error during live screen recording:', err);
  process.exit(1);
});
