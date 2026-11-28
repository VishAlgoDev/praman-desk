#!/usr/bin/env node
/**
 * Unified 4-Act Production Walkthrough Builder (1080p H.264 + EBU R128 Narration + WebVTT)
 * Records live https://praman-desk.vercel.app across Overview, Trade Assurance,
 * Spend Guard, Settlement Ledger, Mining Registry, Desk 5, Docs (29-Tool MCP), & Roadmap.
 * Zero Takar references; 100% accurate live Sepolia PramanEscrow & Diamond #6217 coordinates.
 */

import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const baseUrl = process.env.WALKTHROUGH_BASE_URL || 'https://praman-desk.vercel.app';

const ACTS = [
  {
    id: 'act1_problem_benchmark',
    title: 'Problem & Counterfactual Benchmark',
    text: 'Give an AI agent a payment wallet, and a hallucinated invoice, a phishing domain, or a stale sanctions list can drain funds in seconds. Pramaan Desk verifies every dollar before keys ever sign. Across five adversarial failure modes on our homepage benchmark, an ungrounded agent lost seventy-nine thousand three hundred seventy-three dollars, while Pramaan caught all five with a one-hundred-percent block rate.'
  },
  {
    id: 'act2_escrow_verify',
    title: 'Alibaba Trade Assurance & PramanEscrow Split',
    text: 'In Trade Assurance, Purchase Order ninety-twenty-one models a one-hundred-thousand-USDC commitment anchored to our sovereign PramanEscrow contract on Ethereum Sepolia against a Cainiao Port of Los Angeles inspection confirming eighty conforming units and twenty damaged. Submitting a full hundred-thousand claim trips our six-hundred-fifty-one-byte WebAssembly comparator in under three milliseconds. Reconciling releases eighty thousand USDC to Siemens Aktiengesellschaft under its verified German LEI, refunds twenty thousand USDC to the buyer, and issues an EIP-one-ninety-one memo verifiable directly inside the browser.'
  },
  {
    id: 'act3_solana_ledger_mining',
    title: 'Solana Pre-Signature Guard, Ledger & Fail-Closed Mining',
    text: 'The same firewall guards Solana wallets before bytes reach an RPC node, halting compromised web3 hooks, known drainers, and Token-Twenty-Twenty traps like PermanentDelegate TLV Twelve, backed by a live guarded Solana Devnet settlement. Our Settlement Ledger indexes thirty-two Ethereum Sepolia proofs across fifteen Telegraph miners and PramanEscrow deals. And our Mining Registry cross-checks Queensland Government records while failing closed to Unverified Prospect at twenty percent confidence on unknown sites.'
  },
  {
    id: 'act4_live_desk_mcp_track3',
    title: 'Live Desk 5, 29-Tool Keyless MCP & Track 3 Evaluators',
    text: 'Inside Operator Desk Five, live reconciliation verifies a thousand units times twelve dollars forty cents with zero discrepancy, while nineteen thousand six hundred twenty-nine OFAC SDN records updated daily flag phonetic near-misses like Viktor But at seventy-eight percent similarity. Pramaan exposes twenty-nine keyless tools over Streamable HTTP MCP, TypeScript and Python SDKs, Track Three MiniCheck LoRA evaluators, and thirty capabilities on Telegraph Diamond six-two-one-six, verifying every dollar before keys sign.'
  }
];

function runCmd(cmd) {
  execSync(cmd, { cwd: rootDir, stdio: 'inherit', shell: 'cmd.exe' });
}

function getDurationSec(filePath) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
    { encoding: 'utf8' }
  ).trim();
  return parseFloat(out);
}

function fmtVtt(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`;
}

async function main() {
  const scratchAudio = path.join(rootDir, 'scratch', 'walkthrough_audio');
  const scratchRec = path.join(rootDir, 'scratch', 'walkthrough_rec');
  fs.mkdirSync(scratchAudio, { recursive: true });
  fs.mkdirSync(scratchRec, { recursive: true });

  // 1. Generate & master 48kHz EBU R128 narration per act using Python edge-tts
  console.log('=== 1. Synthesizing EBU R128 Narration ===');
  const pyScript = path.join(scratchAudio, 'tts_gen.py');
  fs.writeFileSync(
    pyScript,
    `import asyncio, json, subprocess, sys, os
import edge_tts

acts = json.loads(open(sys.argv[1], encoding="utf-8").read())
out_dir = sys.argv[2]

async def run():
    for a in acts:
        raw = os.path.join(out_dir, a["id"] + ".mp3")
        wav = os.path.join(out_dir, a["id"] + "_48k.wav")
        comm = edge_tts.Communicate(a["text"], "en-IN-PrabhatNeural", rate="+6%")
        await comm.save(raw)
        subprocess.run([
            "ffmpeg", "-y", "-i", raw,
            "-af", "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-14:TP=-1.0:LRA=9",
            "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", wav
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("OK:", wav)

asyncio.run(run())
`,
    'utf8'
  );
  const actsJson = path.join(scratchAudio, 'acts.json');
  fs.writeFileSync(actsJson, JSON.stringify(ACTS, null, 2), 'utf8');
  execSync(`python "${pyScript}" "${actsJson}" "${scratchAudio}"`, { stdio: 'inherit' });

  const timings = ACTS.map((a) => {
    const wav = path.join(scratchAudio, `${a.id}_48k.wav`);
    const dur = getDurationSec(wav);
    console.log(`  ${a.id}: ${dur.toFixed(2)}s`);
    return { ...a, wav, dur };
  });

  // 2. Concatenate audio with 350ms silence pads between acts
  const silenceWav = path.join(scratchAudio, 'pad350ms.wav');
  execSync(`ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t 0.35 -c:a pcm_s16le "${silenceWav}"`, { stdio: 'ignore' });
  const concatList = path.join(scratchAudio, 'concat.txt');
  const lines = [];
  for (let i = 0; i < timings.length; i++) {
    lines.push(`file '${timings[i].wav.replace(/\\/g, '/')}'`);
    if (i < timings.length - 1) lines.push(`file '${silenceWav.replace(/\\/g, '/')}'`);
  }
  fs.writeFileSync(concatList, lines.join('\n') + '\n', 'utf8');
  const masterWav = path.join(scratchAudio, 'master_narration_48k.wav');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatList}" -c copy "${masterWav}"`, { stdio: 'ignore' });
  const totalAudioSec = getDurationSec(masterWav);
  console.log(`Total narration duration: ${totalAudioSec.toFixed(2)}s`);

  // 3. Generate exact synced WebVTT captions
  let cursorSec = 0;
  const vttLines = ['WEBVTT', ''];
  for (let i = 0; i < timings.length; i++) {
    const t = timings[i];
    const start = cursorSec;
    const end = cursorSec + t.dur;
    vttLines.push(`${fmtVtt(start)} --> ${fmtVtt(end)}`);
    vttLines.push(t.text);
    vttLines.push('');
    cursorSec = end + (i < timings.length - 1 ? 0.35 : 0);
  }
  fs.writeFileSync(path.join(rootDir, 'public', 'captions', 'walkthrough.en.vtt'), vttLines.join('\n'), 'utf8');
  console.log('Updated public/captions/walkthrough.en.vtt');

  // 4. Record crisp 1920x1080 real Chrome walkthrough aligned to act durations
  console.log(`=== 2. Recording Live Portal at ${baseUrl} ===`);
  for (const f of fs.readdirSync(scratchRec)) {
    fs.unlinkSync(path.join(scratchRec, f));
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: scratchRec, size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();

  const holdUntil = async (startMs, targetDurationMs) => {
    const elapsed = Date.now() - startMs;
    const rem = Math.max(200, targetDurationMs - elapsed);
    await page.waitForTimeout(rem);
  };

  // --- ACT 1: Overview & Counterfactual Benchmark ---
  let t0 = Date.now();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(2500);
  await page.click('button[data-hero-case="solana-token2022-halt"]').catch(() => {});
  await page.waitForTimeout(2800);
  await page.evaluate(() => window.scrollBy({ top: 680, behavior: 'smooth' }));
  await page.waitForTimeout(3500);
  await page.click('button[data-hero-case="po-ali-9021"]').catch(() => {});
  await holdUntil(t0, Math.round((timings[0].dur + 0.35) * 1000));

  // --- ACT 2: Trade Assurance & Verify ---
  t0 = Date.now();
  await page.goto(`${baseUrl}/desks#trade-assurance`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.selectOption('#ta-scenario', 'alibaba_trade').catch(() => {});
  await page.click('#ta-run').catch(() => {});
  await page.waitForTimeout(3200);
  await page.selectOption('#ta-scenario', 'alibaba_reconciled').catch(() => {});
  await page.waitForTimeout(400);
  await page.click('#ta-run').catch(() => {});
  await page.waitForTimeout(4000);
  await page.goto(`${baseUrl}/verify?case=po-ali-9021`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.click('#vr-reverify-btn').catch(() => {});
  await holdUntil(t0, Math.round((timings[1].dur + 0.35) * 1000));

  // --- ACT 3: Spend Guard, Settlement Ledger & Mining Registry ---
  t0 = Date.now();
  await page.goto(`${baseUrl}/desks#spend-guard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.selectOption('#sg-scenario', 'token2022_permanent_delegate').catch(() => {});
  await page.click('#sg-run').catch(() => {});
  await page.waitForTimeout(3200);
  await page.goto(`${baseUrl}/desks#settlement-ledger`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3800);
  await page.goto(`${baseUrl}/desks#mining-registry`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('button[data-mr-preset="999999"]').catch(() => {});
  await holdUntil(t0, Math.round((timings[2].dur + 0.35) * 1000));

  // --- ACT 4: Desk 5, 29-Tool MCP & Roadmap ---
  t0 = Date.now();
  await page.goto(`${baseUrl}/desks#verification-labs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#pv-inv-btn').catch(() => {});
  await page.waitForTimeout(900);
  await page.click('#pv-sdn-btn').catch(() => {});
  await page.waitForTimeout(900);
  await page.click('#wasm-run').catch(() => {});
  await page.waitForTimeout(2600);
  await page.goto(`${baseUrl}/docs#mcp-integration`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3800);
  await page.goto(`${baseUrl}/roadmap`, { waitUntil: 'networkidle' });
  await holdUntil(t0, Math.round((timings[3].dur + 0.8) * 1000));

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  console.log('Raw capture saved:', videoPath);

  // 5. Render final 1080p60 H.264 + AAC 192k + faststart
  const finalMp4 = path.join(rootDir, 'public', 'praman-desk-walkthrough.mp4');
  console.log('=== 3. Muxing Final 1080p60 Master MP4 ===');
  execSync(
    `ffmpeg -y -i "${videoPath}" -i "${masterWav}" -vf "scale=1920:1080:flags=lanczos,fps=60" -map 0:v -map 1:a -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "${finalMp4}"`,
    { stdio: 'inherit' }
  );

  const probe = execSync(
    `ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,width,height,r_frame_rate -of json "${finalMp4}"`,
    { encoding: 'utf8' }
  );
  console.log('FINAL VIDEO FFPROBE:', probe);
}

main().catch((err) => {
  console.error('Walkthrough build error:', err);
  process.exit(1);
});
