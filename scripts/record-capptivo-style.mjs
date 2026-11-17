import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function recordCapptivoStyle() {
  console.log('=== Starting Praman Desk Autonomous Walkthrough Recording ===');

  // 1. Start local web server
  console.log('1. Spawning local server on port 3402...');
  const serverProcess = spawn('node', ['web/server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '3402' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stderr.on('data', data => console.error('[Server Error]:', data.toString()));
  serverProcess.stdout.on('data', data => console.log('[Server]:', data.toString().trim()));

  // Wait for server to become responsive
  await new Promise(resolve => setTimeout(resolve, 2500));

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

  // Load local dashboard
  console.log('2. Loading local dashboard on http://127.0.0.1:3402/#audit...');
  await page.goto('http://127.0.0.1:3402/#audit', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('nav[role="tablist"]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Inject sleek virtual cursor and smooth animation helpers
  await page.evaluate(() => {
    // Hide video tab button and panel so they do not show in the walkthrough video
    const tabVideoBtn = document.getElementById('tab-btn-video');
    if (tabVideoBtn) tabVideoBtn.style.display = 'none';
    const videoPanel = document.getElementById('showcase-video-panel');
    if (videoPanel) videoPanel.style.display = 'none';
    const videoTab = document.getElementById('tab-video');
    if (videoTab) videoTab.style.display = 'none';

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
        background: radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(56,189,248,0) 70%);
        pointer-events: none;
        z-index: 9999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: capptivo-rip 0.55s ease-out forwards;
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
    window.cursorPos = { x: 960, y: 250 };
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
      setTimeout(() => rip.remove(), 600);
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

  const recordingStart = Date.now();

  const runSection = async (name, targetDurationSeconds, actionFn) => {
    const sectionStart = Date.now();
    const globalElapsed = ((sectionStart - recordingStart) / 1000).toFixed(1);
    console.log(`[${globalElapsed}s] Starting ${name} (target duration: ${targetDurationSeconds}s)...`);
    await actionFn();
    const actionElapsed = (Date.now() - sectionStart) / 1000;
    const remaining = targetDurationSeconds - actionElapsed;
    if (remaining > 0) {
      console.log(`  -> ${name} visual actions took ${actionElapsed.toFixed(2)}s. Holding for ${remaining.toFixed(2)}s to match audio.`);
      await page.waitForTimeout(Math.round(remaining * 1000));
    } else {
      console.warn(`  -> ${name} visual actions took ${actionElapsed.toFixed(2)}s, slightly over target by ${(-remaining).toFixed(2)}s`);
    }
  };

  // ==========================================
  // SECTION 1: HERO & ARCHITECTURE (0s - 25.27s)
  // Audio: 24.072s + 1.2s silence = 25.272s
  // ==========================================
  await runSection('Section 1: Intro Overview', 25.27, async () => {
    await page.evaluate(() => window.glideCursor(420, 80));
    await page.waitForTimeout(2500);

    // Glide across header title & subtitle
    await page.evaluate(() => window.glideCursor(720, 80));
    await page.waitForTimeout(3000);

    // Glide to Sepolia wallet status
    await glideTo('#wallet-box', 0, 0, 4000);

    // Glide across nav tabs
    await glideTo('button[data-tab="audit"]', 0, 0, 1500);
    await glideTo('button[data-tab="compliance"]', 0, 0, 1500);
    await glideTo('button[data-tab="stablecoin"]', 0, 0, 1500);
    await glideTo('button[data-tab="ledger"]', 0, 0, 1500);
    await glideTo('button[data-tab="miner"]', 0, 0, 1800);

    // Glide to Spend Guard presets
    await glideTo('button[data-preset="legit"]', 0, 0, 1500);
    await glideTo('button[data-preset="tampered"]', 0, 0, 1500);

    // Glide down to GLEIF lookup panel
    await smoothScrollTo('#quick-vendor-input', 'center');
    await glideTo('#quick-vendor-input', 0, 0, 2000);
  });

  // ==========================================
  // SECTION 2: GLEIF LOOKUP (25.27s - 54.00s)
  // Audio: 27.528s + 1.2s silence = 28.728s
  // ==========================================
  await runSection('Section 2: GLEIF Live Lookups', 28.73, async () => {
    await glideTo('button[data-quick="STRIPE, LLC"]', 0, 0, 1800);
    await clickAt('button[data-quick="STRIPE, LLC"]', 1500);
    await glideTo('#btn-quick-verify', 0, 0, 1200);
    await clickAt('#btn-quick-verify', 4000);

    // Highlight verified Stripe result
    await glideTo('#quick-vendor-result', 0, -20, 2500);
    await glideTo('#quick-vendor-result', 0, 20, 2500);

    // Click SAP SE preset
    await glideTo('button[data-quick="SAP SE"]', 0, 0, 1800);
    await clickAt('button[data-quick="SAP SE"]', 1500);
    await glideTo('#btn-quick-verify', 0, 0, 1200);
    await clickAt('#btn-quick-verify', 4500);

    // Highlight German jurisdiction and VIES EU VAT validation
    await glideTo('#quick-vendor-result', 0, -15, 2500);
    await glideTo('#quick-vendor-result', 0, 15, 2500);
    await glideTo('#btn-apply-vendor', 0, 0, 1500);
  });

  // ==========================================
  // SECTION 3: 1-CLICK AUTONOMOUS SPEND (54.00s - 80.81s)
  // Audio: 25.608s + 1.2s silence = 26.808s
  // ==========================================
  await runSection('Section 3: 1-Click Spend Pipeline', 26.81, async () => {
    await smoothScrollTo('#btn-agent-sim', 'center');
    await glideTo('#btn-agent-sim', 0, 0, 1500);
    await clickAt('#btn-agent-sim', 1500);

    // Watch simulation steps progress in live terminal
    await smoothScrollTo('#sim-progress-box', 'center');
    await page.waitForTimeout(1500);

    // Trace the 4 steps in the live terminal
    await glideTo('#sim-terminal', 0, -40, 3000);
    await glideTo('#sim-terminal', 0, -10, 3000);
    await glideTo('#sim-terminal', 0, 20, 3500);
    await glideTo('#sim-terminal', 0, 50, 3500);

    // Linger on final green clearance receipt
    await glideTo('#sim-result', 0, 0, 4500);
  });

  // ==========================================
  // SECTION 4: MISSION 02 - LAZARUS FREEZE (80.81s - 110.26s)
  // Audio: 28.248s + 1.2s silence = 29.448s
  // ==========================================
  await runSection('Section 4: Mission 02 Stablecoin Treasury Guard', 29.45, async () => {
    await smoothScrollTo('nav[role="tablist"]', 'start');
    await glideTo('button[data-tab="stablecoin"]', 0, 0, 1500);
    await clickAt('button[data-tab="stablecoin"]', 2000);

    // Scroll to presets and select sanctioned exploiter
    await smoothScrollTo('button[data-m2-preset="sanctioned"]', 'center');
    await glideTo('button[data-m2-preset="sanctioned"]', 0, 0, 1500);
    await clickAt('button[data-m2-preset="sanctioned"]', 2500);

    // Click Pre-Transfer Spend Gate
    await smoothScrollTo('#btn-m2-gate', 'center');
    await glideTo('#btn-m2-gate', 0, 0, 1500);
    await clickAt('#btn-m2-gate', 3000);

    // Show massive Red Reject & Freeze Box
    await smoothScrollTo('#m2-output', 'center');
    await glideTo('#m2-output', 0, -25, 4500);

    // Highlight OFAC match and FATF Travel Rule compliance
    await glideTo('#m2-output', 0, 20, 4000);
    await glideTo('#m2-output', 0, 50, 4000);
  });

  // ==========================================
  // SECTION 5: MISSION 04 - DILIGENCE PACK & WASM (110.26s - 136.30s)
  // Audio: 24.840s + 1.2s silence = 26.040s
  // ==========================================
  await runSection('Section 5: Mission 04 Diligence Pack & WASM', 26.04, async () => {
    await smoothScrollTo('nav[role="tablist"]', 'start');
    await glideTo('button[data-tab="compliance"]', 0, 0, 1200);
    await clickAt('button[data-tab="compliance"]', 1800);

    // Click Run Diligence Pack
    await smoothScrollTo('#btn-run-diligence-pack', 'center');
    await glideTo('#btn-run-diligence-pack', 0, 0, 1200);
    await clickAt('#btn-run-diligence-pack', 4000);

    // Show 5-jurisdiction table
    await smoothScrollTo('#diligence-pack-output', 'center');
    await glideTo('#diligence-pack-output', 0, 30, 4000);

    // Switch to Spend Guard for Case 4 WASM tamper check
    await smoothScrollTo('nav[role="tablist"]', 'start');
    await glideTo('button[data-tab="audit"]', 0, 0, 1200);
    await clickAt('button[data-tab="audit"]', 1500);

    // Select Case 4 tampered math preset
    await smoothScrollTo('button[data-preset="tampered"]', 'center');
    await glideTo('button[data-preset="tampered"]', 0, 0, 1200);
    await clickAt('button[data-preset="tampered"]', 1500);

    // Run verification
    await smoothScrollTo('#btn-primary', 'center');
    await glideTo('#btn-primary', 0, 0, 1200);
    await clickAt('#btn-primary', 3000);

    // Highlight WASM rejection for 1-cent variance
    await glideTo('#result-box', 0, 0, 2500);
  });

  // ==========================================
  // SECTION 6: LEDGER, MINER #5289 & CLOSE (136.30s - 167.10s)
  // Audio: 28.296s + 2.5s hold = 30.796s
  // ==========================================
  await runSection('Section 6: On-Chain Ledger & Miner #5289', 30.80, async () => {
    await smoothScrollTo('nav[role="tablist"]', 'start');
    await glideTo('button[data-tab="ledger"]', 0, 0, 1200);
    await clickAt('button[data-tab="ledger"]', 1800);

    // Show ledger rows
    await smoothScrollTo('#ledger-results', 'center');
    await glideTo('#ledger-results', 0, 0, 4500);

    // Switch to active miner tab
    await smoothScrollTo('nav[role="tablist"]', 'start');
    await glideTo('button[data-tab="miner"]', 0, 0, 1200);
    await clickAt('button[data-tab="miner"]', 2000);

    // Show active miner details and Epoch 2107 ranking
    await smoothScrollTo('#tab-miner', 'center');
    await glideTo('#tab-miner', 0, -20, 3500);
    await glideTo('#tab-miner', 0, 20, 3500);

    // Glide down to MCP command block
    await smoothScrollTo('#tab-miner pre', 'center');
    await glideTo('#tab-miner pre', 0, 0, 3500);

    // Final serene hold
    await page.evaluate(() => window.glideCursor(960, 400));
    await page.waitForTimeout(2000);
  });

  console.log('=== All 6 Sections Successfully Completed ===');
  console.log('Closing browser context...');
  await context.close();
  await browser.close();

  // Shut down local server
  console.log('Shutting down local server...');
  serverProcess.kill('SIGTERM');

  // Find generated webm
  const files = fs.readdirSync(recDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No webm video recorded!');
  }
  const rawWebm = path.join(recDir, files[0]);
  console.log('Raw recording saved at:', rawWebm);

  // Mux with narration audio (exact 165s cutoff matching audio duration)
  const masterAudio = path.join('public', 'narration.mp3');
  const finalMp4 = path.join('public', 'praman-desk-walkthrough.mp4');

  console.log('Muxing video with neural narration into', finalMp4);
  const ffmpegCmd = `ffmpeg -y -i "${rawWebm}" -i "${masterAudio}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -c:a aac -b:a 192k -t 165 -movflags +faststart "${finalMp4}"`;
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
