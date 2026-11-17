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

  // Load local split-screen firewall dashboard
  console.log('2. Loading local dashboard on http://127.0.0.1:3402/...');
  await page.goto('http://127.0.0.1:3402/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#card-scen-1', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Inject sleek virtual cursor and smooth animation helpers
  await page.evaluate(() => {
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

  const audioManifest = JSON.parse(fs.readFileSync(path.join('public', 'audio', 'manifest.json'), 'utf8'));
  const dur = (id, fallback) => {
    const item = audioManifest.find(x => x.id === id);
    return item ? (item.duration + 1.2) : fallback;
  };
  const totalAudioDur = parseFloat(execSync('ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/narration.mp3').toString().trim());

  // ==========================================
  // SECTION 1: THREAT & PHISHING/SANCTIONS HALT
  // ==========================================
  await runSection('Section 1: Intro & Scenario 1 OFAC Halt', dur(1, 24.0), async () => {
    await page.evaluate(() => window.glideCursor(420, 70));
    await page.waitForTimeout(1800);
    await glideTo('.header-badges', 0, 0, 2200);
    await glideTo('.hero-banner', -100, 0, 2500);
    await glideTo('.hero-stats', 0, 0, 2200);

    await smoothScrollTo('#card-scen-1', 'center', 700);
    await clickAt('#card-scen-1', 1800);
    await glideTo('#disp-recipient', 0, 0, 2200);
    await glideTo('#verdict-banner', 0, 0, 2800);
    await glideTo('#badge-ofac', 0, 0, 2400);
  });

  // ==========================================
  // SECTION 2: ARITHMETIC OVERCHARGE & IN-BROWSER 651B WASM
  // ==========================================
  await runSection('Section 2: Scenario 2 WASM Discrepancy & Browser Proof', dur(2, 23.0), async () => {
    await smoothScrollTo('#card-scen-2', 'center', 600);
    await clickAt('#card-scen-2', 2200);
    await glideTo('#disp-vendor', 0, 0, 1800);
    await glideTo('#verdict-banner', 0, 0, 2400);
    await glideTo('#badge-gleif', 0, 0, 1800);
    await glideTo('#badge-wasm', 0, 0, 2400);
    await smoothScrollTo('#btn-wasm-verify', 'center', 600);
    await clickAt('#btn-wasm-verify', 1800);
    await glideTo('#wasm-browser-result', 0, 0, 2800);
  });

  // ==========================================
  // SECTION 3: VERIFIED COMPLIANT PAYOUT (ANTHROPIC PBC)
  // ==========================================
  await runSection('Section 3: Scenario 3 Compliant Agent Payout', dur(3, 18.0), async () => {
    await smoothScrollTo('#card-scen-3', 'center', 600);
    await clickAt('#card-scen-3', 2400);
    await glideTo('#verdict-banner', 0, 0, 2600);
    await glideTo('#sub-gleif', 0, 0, 2600);
    await glideTo('#badge-ofac', 0, 0, 1600);
    await glideTo('#badge-wasm', 0, 0, 1800);
    await glideTo('#badge-delegation', 0, 0, 2000);
  });

  // ==========================================
  // SECTION 4: UNIT ECONOMICS, MCP QUICKSTART & SEPOLIA LEDGER
  // ==========================================
  await runSection('Section 4: Economics, Quickstart & On-Chain Ledger', dur(4, 21.0), async () => {
    await smoothScrollTo('.viability-grid', 'center', 800);
    await glideTo('.viability-card.bad', 0, 0, 2200);
    await glideTo('.viability-card.good', 0, 0, 2600);
    await smoothScrollTo('.quickstart-card', 'center', 800);
    await glideTo('#mcp-snip', 0, 0, 2600);
    await smoothScrollTo('#ledger-accordion', 'center', 800);
    await clickAt('#ledger-accordion > summary', 1500);
    await glideTo('#receipts-tbody', 0, 0, 3200);
    await page.evaluate(() => window.glideCursor(960, 400));
    await page.waitForTimeout(1500);
  });

  console.log('=== All 4 Sections Successfully Completed ===');
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

  // Mux with narration audio matching exact audio duration
  const masterAudio = path.join('public', 'narration.mp3');
  const finalMp4 = path.join('public', 'praman-desk-walkthrough.mp4');
  const cutDur = Math.ceil(totalAudioDur + 0.5);

  console.log(`Muxing video with neural narration (${cutDur}s) into ${finalMp4}`);
  const ffmpegCmd = `ffmpeg -y -i "${rawWebm}" -i "${masterAudio}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -c:a aac -b:a 192k -t ${cutDur} -movflags +faststart "${finalMp4}"`;
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
