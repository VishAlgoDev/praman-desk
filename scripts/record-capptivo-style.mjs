import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function recordCapptivoStyle() {
  console.log('--- Starting Capptivo-Style Screen Studio Walkthrough Recording ---');

  const recDir = path.join('public', 'recorded_capptivo');
  if (fs.existsSync(recDir)) {
    fs.rmSync(recDir, { recursive: true, force: true });
  }
  fs.mkdirSync(recDir, { recursive: true });

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

  // Load the dashboard
  console.log('1. Loading dashboard...');
  await page.goto('https://praman-desk.vercel.app/#audit', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('nav[role="tablist"]', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Inject sleek virtual cursor and smooth animation helpers
  await page.evaluate(() => {
    // Hide video tab element if it exists in DOM
    const videoPanel = document.getElementById('showcase-video-panel');
    if (videoPanel) videoPanel.style.display = 'none';

    // Inject cursor styles
    const style = document.createElement('style');
    style.innerHTML = `
      #capptivo-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        z-index: 9999999;
        pointer-events: none;
        transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
      }
      .cursor-ripple {
        position: fixed;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(56,189,248,0) 70%);
        pointer-events: none;
        z-index: 9999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: capptivo-rip 0.5s ease-out forwards;
      }
      @keyframes capptivo-rip {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Create cursor SVG element
    const cursor = document.createElement('div');
    cursor.id = 'capptivo-cursor';
    cursor.innerHTML = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M4 3L20 12L12 14L9 21L4 3Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(cursor);

    // Cursor position state
    window.cursorPos = { x: 960, y: 300 };
    cursor.style.transform = `translate(${window.cursorPos.x}px, ${window.cursorPos.y}px)`;

    window.glideCursor = (x, y) => {
      window.cursorPos = { x, y };
      cursor.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.glideToElement = (selector, offsetX = 0, offsetY = 0) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + offsetX;
      const y = rect.top + rect.height / 2 + offsetY;
      window.glideCursor(x, y);
    };

    window.triggerRipple = (x, y) => {
      const rip = document.createElement('div');
      rip.className = 'cursor-ripple';
      rip.style.left = `${x}px`;
      rip.style.top = `${y}px`;
      document.body.appendChild(rip);
      setTimeout(() => rip.remove(), 550);
    };
  });

  // Helper functions
  const glideTo = async (selector, offsetX = 0, offsetY = 0, waitAfter = 700) => {
    await page.evaluate(({ s, ox, oy }) => window.glideToElement(s, ox, oy), { s: selector, ox: offsetX, oy: offsetY });
    await page.waitForTimeout(waitAfter);
  };

  const clickAt = async (selector, waitAfter = 1000) => {
    await glideTo(selector, 0, 0, 400);
    const box = await page.locator(selector).boundingBox();
    if (box) {
      await page.evaluate(({ x, y }) => window.triggerRipple(x, y), { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    }
    await page.click(selector);
    await page.waitForTimeout(waitAfter);
  };

  const smoothScrollTo = async (selector, block = 'center', waitAfter = 800) => {
    await page.evaluate(({ s, b }) => {
      const el = document.querySelector(s);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: b });
    }, { s: selector, b: block });
    await page.waitForTimeout(waitAfter);
  };

  // ==========================================
  // SECTION 1: HERO & ARCHITECTURE (0s - 21s)
  // ==========================================
  console.log('Recording Section 1: Intro Overview...');
  await page.evaluate(() => window.glideCursor(450, 80));
  await page.waitForTimeout(2500);

  // Glide across header title
  await page.evaluate(() => window.glideCursor(700, 80));
  await page.waitForTimeout(3000);

  // Glide to Sepolia wallet status
  await glideTo('#wallet-box', 0, 0, 3500);

  // Glide down over nav tabs
  await glideTo('button[data-tab="audit"]', 0, 0, 1500);
  await glideTo('button[data-tab="compliance"]', 0, 0, 1500);
  await glideTo('button[data-tab="stablecoin"]', 0, 0, 1500);
  await glideTo('button[data-tab="ledger"]', 0, 0, 1500);
  await glideTo('button[data-tab="miner"]', 0, 0, 2000);

  // Glide down to GLEIF lookup panel
  await smoothScrollTo('#quick-vendor-input', 'center');
  await glideTo('#quick-vendor-input', 0, 0, 3500);

  // ==========================================
  // SECTION 2: GLEIF LOOKUP (21s - 47s)
  // ==========================================
  console.log('Recording Section 2: GLEIF Live Lookups...');
  // Click Stripe preset
  await clickAt('button[data-quick="STRIPE, LLC"]', 1200);
  await clickAt('#btn-quick-verify', 4500);

  // Glide across verified Stripe result
  await glideTo('#quick-vendor-result', 0, -20, 3000);

  // Click SAP SE preset
  await clickAt('button[data-quick="SAP SE"]', 1200);
  await clickAt('#btn-quick-verify', 5000);

  // Highlight German jurisdiction and LEI
  await glideTo('#quick-vendor-result', 0, 10, 4000);
  await glideTo('#btn-apply-vendor', 0, 0, 3000);

  // ==========================================
  // SECTION 3: 1-CLICK AUTONOMOUS SPEND (47s - 70s)
  // ==========================================
  console.log('Recording Section 3: 1-Click Spend Pipeline...');
  await smoothScrollTo('#btn-agent-sim', 'center');
  await glideTo('#btn-agent-sim', 0, 0, 2500);

  // Click run agent pipeline
  await clickAt('#btn-agent-sim', 1200);

  // Watch simulation steps progress
  await page.waitForTimeout(4000);
  await smoothScrollTo('#sim-progress-box', 'center');
  await glideTo('#sim-progress-box', 0, 40, 6000);

  // Linger on final green clearance receipt
  await page.waitForTimeout(6500);

  // ==========================================
  // SECTION 4: MISSION 02 - LAZARUS FREEZE (70s - 95s)
  // ==========================================
  console.log('Recording Section 4: Mission 02 Stablecoin Treasury Guard...');
  await smoothScrollTo('nav[role="tablist"]', 'start');
  await clickAt('button[data-tab="stablecoin"]', 1500);

  // Scroll to presets
  await smoothScrollTo('button[data-m2-preset="sanctioned"]', 'center');
  await clickAt('button[data-m2-preset="sanctioned"]', 2000);

  // Glide down to evaluation button
  await smoothScrollTo('#btn-m2-gate', 'center');
  await clickAt('#btn-m2-gate', 2500);

  // Show massive Red Reject & Freeze Box
  await smoothScrollTo('#m2-output', 'center');
  await glideTo('#m2-output', 0, -20, 6000);
  await page.waitForTimeout(7000);

  // ==========================================
  // SECTION 5: MISSION 04 - DILIGENCE PACK (95s - 119s)
  // ==========================================
  console.log('Recording Section 5: Mission 04 Diligence Pack & WASM...');
  await smoothScrollTo('nav[role="tablist"]', 'start');
  await clickAt('button[data-tab="compliance"]', 1500);

  // Click Run Diligence Pack
  await smoothScrollTo('#btn-run-diligence-pack', 'center');
  await clickAt('#btn-run-diligence-pack', 4000);

  // Show 5-jurisdiction table
  await smoothScrollTo('#diligence-pack-output', 'center');
  await glideTo('#diligence-pack-output', 0, 30, 6000);

  // Switch to Spend Guard for Case 4 tamper
  await smoothScrollTo('nav[role="tablist"]', 'start');
  await clickAt('button[data-tab="audit"]', 1200);
  await smoothScrollTo('button[data-preset="tampered"]', 'center');
  await clickAt('button[data-preset="tampered"]', 1200);
  await smoothScrollTo('#btn-primary', 'center');
  await clickAt('#btn-primary', 4000);

  // ==========================================
  // SECTION 6: LEDGER, MINER #5289 & CLOSE (119s - 145s)
  // ==========================================
  console.log('Recording Section 6: On-Chain Ledger & Miner #5289...');
  await smoothScrollTo('nav[role="tablist"]', 'start');
  await clickAt('button[data-tab="ledger"]', 1500);

  // Show ledger rows
  await smoothScrollTo('#ledger-results', 'center');
  await glideTo('#ledger-results', 0, 0, 6000);

  // Switch to active miner tab
  await smoothScrollTo('nav[role="tablist"]', 'start');
  await clickAt('button[data-tab="miner"]', 2000);

  // Show active miner details
  await smoothScrollTo('#tab-miner', 'center');
  await glideTo('#tab-miner', 0, 20, 8000);

  // Finish timeline
  console.log('Timeline actions completed. Closing browser context...');
  await context.close();
  await browser.close();

  // Find generated webm
  const files = fs.readdirSync(recDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No webm video recorded!');
  }
  const rawWebm = path.join(recDir, files[0]);
  console.log('Raw Capptivo-style recording saved at:', rawWebm);

  // Mux with narration audio
  const masterAudio = 'public/narration.mp3';
  const finalMp4 = path.join('public', 'praman-desk-walkthrough.mp4');

  console.log('Muxing video with neural narration into', finalMp4);
  const ffmpegCmd = `ffmpeg -y -i "${rawWebm}" -i "${masterAudio}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -c:a aac -b:a 128k -shortest -movflags +faststart "${finalMp4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log('========================================================');
  console.log('SUCCESS! Real product walkthrough with smooth cursor created!');
  console.log('Saved at:', finalMp4);
  console.log('========================================================');
}

recordCapptivoStyle().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
