/**
 * Praman Desk: Official Minds & Benchmark Showcase Video Renderer
 * Built with FFmpeg (1080p @ 30fps) for Season II Hackathon Community Showcase
 * Features:
 * 1. Two-Mind Collaborative Architecture: Reference Implementation of the Minds Spec
 * 2. Mind 1 (Diligence Investigator via Anjoman) + Mind 2 (Escrow Reviewer via 651-byte WASM)
 * 3. Clean Siemens AG Procurement Approval with Sepolia Diamond Escrow Receipt
 * 4. Adversarial Attack Interception: Inverted FX Rate & Phishing Domain
 * 5. Deterministic Policy Evaluation & Empirical Baseline: $79,373 in Capital Loss Averted
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
fs.mkdirSync(publicDir, { recursive: true });

const FONT_TITLE = "C\\:/Windows/Fonts/segoeuib.ttf";
const FONT_BODY = "C\\:/Windows/Fonts/segoeui.ttf";
const FONT_MONO = "C\\:/Windows/Fonts/consola.ttf";

function escapeText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/%/g, ' percent');
}

function renderScene(sceneId, duration, vfCommands, audioFreq = 140) {
  const outFile = path.join(publicDir, `scene_${sceneId}.mp4`);
  const vf = vfCommands.join(',');
  // Ambient synthesized tech chord per scene instead of pure dead silence
  const cmd = `ffmpeg -y -f lavfi -i color=c=0x070b14:s=1920x1080:d=${duration}:r=30 -f lavfi -i "sine=frequency=${audioFreq}:sample_rate=44100,volume=0.04,afade=t=in:ss=0:d=0.5,afade=t=out:st=${duration - 0.5}:d=0.5" -vf "${vf}" -c:v libx264 -pix_fmt yuv420p -t ${duration} -c:a aac -shortest "${outFile}"`;
  
  console.log(`▶ Rendering Scene ${sceneId} (${duration}s)...`);
  execSync(cmd, { stdio: 'pipe' });
  console.log(`  ✓ Scene ${sceneId} ready.`);
  return outFile;
}

// ---------------- SCENE 1: TITLE & COLLABORATIVE MINDS (7s) ----------------
const scene1 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0x0284c7@0.25:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0x38bdf8@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("TELEGRAPH PROTOCOL SEASON II")}':fontsize=18:fontcolor=0x38bdf8:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Praman Desk: Collaborative Two-Mind Spend Guard")}':fontsize=56:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Reference Implementation of Animoca Brands Minds Specification (hellominds.ai)")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,
  
  // Left: Mind 1 Card
  "drawbox=x=140:y=340:w=800:h=480:color=0x1e293b@0.7:t=fill",
  "drawbox=x=140:y=340:w=800:h=480:color=0x38bdf8@0.7:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("MIND 1: DILIGENCE INVESTIGATOR")}':fontsize=24:fontcolor=0x38bdf8:x=170:y=375`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Anjoman Skill Router (telegraphprotocol/telegraph-mcp)")}':fontsize=20:fontcolor=0xe2e8f0:x=170:y=435`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Corporate LEI Registry: GLEIF Live Primary Index")}':fontsize=20:fontcolor=0xe2e8f0:x=170:y=485`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- OFAC SDN Screening: In-Memory <25ms Fuzzy Jaccard Engine")}':fontsize=20:fontcolor=0xe2e8f0:x=170:y=535`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- FakeWatch Phishing Shield: Miner #42420 Domain Reputation")}':fontsize=20:fontcolor=0xe2e8f0:x=170:y=585`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Compiles Tamper-Evident SHA-256 Digested Case File")}':fontsize=20:fontcolor=0x10b981:x=170:y=645`,

  // Right: Mind 2 Card
  "drawbox=x=980:y=340:w=800:h=480:color=0x1e293b@0.7:t=fill",
  "drawbox=x=980:y=340:w=800:h=480:color=0x10b981@0.7:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("MIND 2: ESCROW REVIEWER & SPEND GATE")}':fontsize=24:fontcolor=0x10b981:x=1010:y=375`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- 651-byte WebAssembly Deterministic Comparator")}':fontsize=20:fontcolor=0xe2e8f0:x=1010:y=435`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Zero Arithmetic Drift down to the sub-cent")}':fontsize=20:fontcolor=0xe2e8f0:x=1010:y=485`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Multi-Miner Consensus: Validates 3+ Independent Providers")}':fontsize=20:fontcolor=0xe2e8f0:x=1010:y=535`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- Fail-Closed Protection: Failsafe with 0 Micro-USDC Loss")}':fontsize=20:fontcolor=0xe2e8f0:x=1010:y=585`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("- On-Chain Sepolia Diamond Escrow (0x72a7...a08b)")}':fontsize=20:fontcolor=0x38bdf8:x=1010:y=645`,

  // Bottom Status
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Devnode Miner #6127  |  Rank #1 Contract Obligation  |  Rank #1 Purchase Order Verify")}':fontsize=20:fontcolor=0x64748b:x=140:y=860`
];

// ---------------- SCENE 2: CLEAN ENTERPRISE APPROVAL (7s) ----------------
const scene2 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0x10b981@0.2:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0x10b981@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("SCENARIO 1: CLEAN PROCUREMENT")}':fontsize=18:fontcolor=0x10b981:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Siemens AG Invoice Payment (EUR 8,400 / 12 units @ EUR 700)")}':fontsize=50:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Two Minds execute coordinated investigation and authorize cryptographic escrow release")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,

  "drawbox=x=140:y=340:w=1640:h=480:color=0x1e293b@0.6:t=fill",
  "drawbox=x=140:y=340:w=1640:h=480:color=0x10b981@0.8:t=2",
  
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("[Mind 1] Investigator: GLEIF LEI W38RGI023J3WT1HWRP32 (ACTIVE / ISSUED in Germany)")}':fontsize=22:fontcolor=white:x=180:y=390`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("[Mind 1] Investigator: OFAC SDN Screening: CLEAN (0 matches in 19,565+ records)")}':fontsize=22:fontcolor=white:x=180:y=440`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("[Mind 1] Investigator: FakeWatch Domain Safety: SAFE (siemens.com verified)")}':fontsize=22:fontcolor=white:x=180:y=490`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("[Mind 2] Reviewer: 651-byte WASM Comparator Score: 10000/10000 (0.00c drift)")}':fontsize=22:fontcolor=0x38bdf8:x=180:y=550`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("FINAL VERDICT: APPROVE_PAYMENT  [VERIFIED OK]")}':fontsize=36:fontcolor=0x10b981:x=180:y=620`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Sepolia Diamond Port: 0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b  -  EIP-191 Auth Signed")}':fontsize=20:fontcolor=0x94a3b8:x=180:y=680`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Settlement ID: SETTLE-SEPOLIA-8400-EUR-USDC  -  Authorized by Praman Reviewer Mind")}':fontsize=20:fontcolor=0x64748b:x=180:y=730`
];

// ---------------- SCENE 3: ADVERSARIAL INVERTED FX INTERCEPTION (7s) ----------------
const scene3 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0xf59e0b@0.2:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0xf59e0b@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("SCENARIO 2: ADVERSARIAL FX EXPLOIT")}':fontsize=18:fontcolor=0xf59e0b:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Inverted Rate Attack Caught: Claimed 0.92 USD/EUR vs 1.085 Market")}':fontsize=48:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Raw LLMs approve flipped FX rates causing financial overcharge. Telegraph Minds lock in HELD.")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,

  "drawbox=x=140:y=340:w=1640:h=480:color=0x1e293b@0.6:t=fill",
  "drawbox=x=140:y=340:w=1640:h=480:color=0xf59e0b@0.8:t=2",

  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Invoice: EUR 8,500 settled in USD. Counterparty claims 0.9216 USD/EUR (inverted rate)")}':fontsize=22:fontcolor=white:x=180:y=390`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Without Telegraph: Raw LLM approves parameter pass-through -> $1,373 OVERCHARGE")}':fontsize=22:fontcolor=0xef4444:x=180:y=450`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("With Telegraph: Mind 1 queries FX Specialist -> Identifies 15.06 percent rate deviation")}':fontsize=22:fontcolor=0x38bdf8:x=180:y=510`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("FINAL VERDICT: HELD_FOR_MANUAL_REVIEW  [INVERTED_FX_OVERCHARGE_PREVENTED]")}':fontsize=32:fontcolor=0xf59e0b:x=180:y=580`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("CAPITAL LOSS AVERTED: $1,373.00 USD (Escrow Funds 100 percent Protected)")}':fontsize=32:fontcolor=0x10b981:x=180:y=650`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Action: Case automatically routed to CFO Dual-Sign Queue with flagged rate delta")}':fontsize=20:fontcolor=0x94a3b8:x=180:y=720`
];

// ---------------- SCENE 4: PHISHING DOMAIN INTERCEPTION (7s) ----------------
const scene4 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0xef4444@0.2:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0xef4444@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("SCENARIO 3: PHISHING DRAINER ATTACK")}':fontsize=18:fontcolor=0xef4444:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Typosquatted Domain Intercepted (https://unisvvap.org/pay)")}':fontsize=52:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("FakeWatch Miner #42420 domain reputation shield prevents $15,000 drainer transfer")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,

  "drawbox=x=140:y=340:w=1640:h=480:color=0x1e293b@0.6:t=fill",
  "drawbox=x=140:y=340:w=1640:h=480:color=0xef4444@0.8:t=2",

  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Target URL: https://unisvvap.org/pay ($15,000 Software Grantee Invoice)")}':fontsize=22:fontcolor=white:x=180:y=390`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Without Telegraph: Raw LLM tokenization reads clean uniswap concept -> APPROVES")}':fontsize=22:fontcolor=0xef4444:x=180:y=450`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("With Telegraph: FakeWatch Miner #42420 returns PHISHING (Risk Score: 98)")}':fontsize=22:fontcolor=0x38bdf8:x=180:y=510`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("FINAL VERDICT: REJECT_PAYMENT  [PHISHING_DOMAIN_HARD_BLOCK]")}':fontsize=32:fontcolor=0xef4444:x=180:y=580`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("DIRECT CAPITAL THEFT PREVENTED: $15,000.00 USD (0 Funds Released)")}':fontsize=32:fontcolor=0x10b981:x=180:y=650`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Status: Malicious domain flagged and shared to Telegraph threat intelligence feed")}':fontsize=20:fontcolor=0x94a3b8:x=180:y=720`
];

// ---------------- SCENE 5: EMPIRICAL BENCHMARK TABLE (8s) ----------------
const scene5 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0x38bdf8@0.2:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0x38bdf8@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("WITH VS WITHOUT TELEGRAPH")}':fontsize=18:fontcolor=0x38bdf8:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Policy Benchmark Results: $79,373 Capital Loss Averted")}':fontsize=50:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Tested across 5 High-Stakes Procurement, Legal and Web3 Vectors")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,

  // Table Container
  "drawbox=x=140:y=340:w=1640:h=460:color=0x1e293b@0.6:t=fill",
  "drawbox=x=140:y=340:w=1640:h=460:color=0x334155@0.8:t=2",
  // Table Header
  "drawbox=x=140:y=340:w=1640:h=60:color=0x0f172a@0.9:t=fill",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("BENCHMARK METRIC")}':fontsize=20:fontcolor=0x94a3b8:x=180:y=360`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("WITHOUT TELEGRAPH (UNGROUNDED)")}':fontsize=20:fontcolor=0xef4444:x=700:y=360`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("WITH TELEGRAPH (PRAMAN DESK)")}':fontsize=20:fontcolor=0x10b981:x=1200:y=360`,

  // Row 1
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Adversarial Catch Rate")}':fontsize=22:fontcolor=white:x=180:y=430`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("0.0 percent  (0 / 5 caught)")}':fontsize=24:fontcolor=0xef4444:x=700:y=428`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("100.0 percent  (5 / 5 caught)")}':fontsize=24:fontcolor=0x10b981:x=1200:y=428`,

  // Row 2
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Total Direct Financial Loss")}':fontsize=22:fontcolor=white:x=180:y=500`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("-$79,373.00 USD Loss")}':fontsize=24:fontcolor=0xef4444:x=700:y=498`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("$0.00 Loss  ($79,373 Averted)")}':fontsize=24:fontcolor=0x10b981:x=1200:y=498`,

  // Row 3
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Arithmetic Accuracy")}':fontsize=22:fontcolor=white:x=180:y=570`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Loose / Floating-Point")}':fontsize=24:fontcolor=0xef4444:x=700:y=568`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Deterministic 651-byte WASM")}':fontsize=24:fontcolor=0x10b981:x=1200:y=568`,

  // Row 4
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Cryptographic Verifiability")}':fontsize=22:fontcolor=white:x=180:y=640`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("None (Opaque Strings)")}':fontsize=24:fontcolor=0xef4444:x=700:y=638`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("EIP-191 & Sepolia Diamond")}':fontsize=24:fontcolor=0x10b981:x=1200:y=638`,

  // Bottom note
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Reproducible via: node benchmark/with-vs-without-telegraph.mjs (Zero API keys needed)")}':fontsize=20:fontcolor=0x64748b:x=180:y=740`
];

// ---------------- SCENE 6: PODIUM STANDINGS & OUTRO (7s) ----------------
const scene6 = [
  "drawbox=x=80:y=60:w=1760:h=960:color=0x0f172a@1:t=fill",
  "drawbox=x=80:y=60:w=1760:h=960:color=0x1e293b@1:t=2",
  "drawbox=x=140:y=110:w=440:h=44:color=0x10b981@0.2:t=fill",
  "drawbox=x=140:y=110:w=440:h=44:color=0x10b981@0.8:t=2",
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("COMMUNITY SHOWCASE - NOV 20, 2026")}':fontsize=18:fontcolor=0x10b981:x=160:y=122`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Praman Desk: Ready for Season II Showcase")}':fontsize=56:fontcolor=white:x=140:y=190`,
  `drawtext=fontfile='${FONT_BODY}':text='${escapeText("Live Production Coordinates & Ecosystem Open Source Assets")}':fontsize=26:fontcolor=0x94a3b8:x=140:y=270`,

  "drawbox=x=140:y=340:w=1640:h=480:color=0x1e293b@0.6:t=fill",
  "drawbox=x=140:y=340:w=1640:h=480:color=0x38bdf8@0.8:t=2",

  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("LIVE LEADERBOARD STANDINGS (DEVNODE EPOCH 18 / 164 REQUESTS SERVED):")}':fontsize=24:fontcolor=0x38bdf8:x=180:y=390`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("- CONTRACT_OBLIGATION_AUDIT_GENERAL : RANK #1 NETWORK-WIDE")}':fontsize=24:fontcolor=0x10b981:x=180:y=450`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("- PURCHASE_ORDER_VERIFY_GENERAL      : RANK #1 NETWORK-WIDE")}':fontsize=24:fontcolor=0x10b981:x=180:y=500`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("- SANCTIONS_SCREENING_MATCH_GENERAL    : RANK #2 NETWORK-WIDE (Score 1.0000)")}':fontsize=24:fontcolor=white:x=180:y=550`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("Hosted App: https://praman-desk.vercel.app")}':fontsize=28:fontcolor=white:x=180:y=630`,
  `drawtext=fontfile='${FONT_TITLE}':text='${escapeText("GitHub: https://github.com/VishAlgoDev/praman-desk")}':fontsize=28:fontcolor=0x38bdf8:x=180:y=680`,
  `drawtext=fontfile='${FONT_MONO}':text='${escapeText("Tags: @telegraphprotoc @ysiu @marcmcg  |  Telegraph Protocol Season II")}':fontsize=22:fontcolor=0x94a3b8:x=180:y=750`
];

async function main() {
  console.log('========================================================================');
  console.log(' 🎬 Rendering Official Praman Minds & Benchmark Showcase Video');
  console.log(' 1080p Full HD @ 30fps with Segoe UI Typography & Audio Soundbed');
  console.log('========================================================================\n');

  const scenes = [
    renderScene(1, 7, scene1, 130),
    renderScene(2, 7, scene2, 146),
    renderScene(3, 7, scene3, 164),
    renderScene(4, 7, scene4, 174),
    renderScene(5, 8, scene5, 196),
    renderScene(6, 7, scene6, 220)
  ];

  // Create concat list file
  const listFile = path.join(publicDir, 'concat_list.txt');
  const fileLines = scenes.map(s => `file '${path.resolve(s).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listFile, fileLines, 'utf8');

  const finalVideo = path.join(publicDir, 'praman_minds_benchmark_showcase.mp4');
  console.log('\n▶ Concatenating scenes into final video...');
  const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${finalVideo}"`;
  execSync(concatCmd, { stdio: 'pipe' });

  console.log('\n========================================================================');
  console.log(' 🎉 SHOWCASE VIDEO RENDER COMPLETE!');
  console.log(` • Output File : ${finalVideo}`);
  console.log(` • Duration    : 43 seconds (1080p HD)`);
  console.log(` • Public URL  : https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4`);
  console.log('========================================================================\n');
}

main().catch(err => {
  console.error('Video rendering failed:', err);
  process.exit(1);
});
