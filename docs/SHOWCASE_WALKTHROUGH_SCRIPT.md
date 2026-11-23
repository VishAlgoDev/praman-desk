# Praman Desk: Developer Showcase & Product Walkthrough (85 Seconds)

**Target Master Video:** `public/praman-desk-walkthrough.mp4`  
**Duration:** ~85 Seconds (Acts 1–4, timed for 60–90s benchmark)  
**Format:** 1920×1080 @ 60fps Developer Screencast (Cursor IDE + Vercel Institutional FinTech Portal)  
**Live Application:** [https://praman-desk.vercel.app](https://praman-desk.vercel.app)  
**GitHub Repository:** [https://github.com/VishAlgoDev/praman-desk](https://github.com/VishAlgoDev/praman-desk)  
**Contract Addresses:**
- **Sepolia Settlement Diamond:** `0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`
- **TakarSettle v4 Consensus Escrow:** `0x310275e6D66818E068245326bB9e398822304248`
- **Solana USDC SPL Mint:** `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

---

## 1. Executive Summary & Ahmed Ali 4-Part Structure

Following Co-Founder Ahmed Ali's direct architectural and video showcase criteria (Discord threads `1573287348689567774` and `1573264855526547577`), this walkthrough abandons synthetic slideshows in favor of an **authentic, unedited, full end-to-end screencast**. It proves how a single skill / keyless MCP integration protects institutional capital across cross-border enterprise supply chains.

| Act | Scene Title | Timeline | Core Narrative & Architectural Ground Truth |
|:---:|:---|:---:|:---|
| **Act 1** | **The Problem: AI Procurement Bots Hallucinating Math** | 0:00 – 0:18 (18s) | Autonomous agents holding private keys and spend caps blindly approve prompt-injected or arithmetic-flawed invoices, irreversibly bleeding treasury capital. |
| **Act 2** | **The Discovery: Alibaba PO-ALI-9021 vs Port of LA Cainiao Receipt** | 0:18 – 0:42 (24s) | $100k PO for 100 sensors vs Port of LA warehouse receipt of 80 conforming units. The 651-byte AssemblyScript WASM circuit breaker halts the $20k overcharge in <3ms. |
| **Act 3** | **The Consensus: Takar + Praman 2-of-3 Settlement on Sepolia** | 0:42 – 0:65 (23s) | Bangdrop's Takar heuristic delivery opinion + Praman bit-exact WASM math achieve 2-of-3 consensus. TakarSettle v4 disburses $80k to supplier and refunds $20k to buyer. |
| **Act 4** | **The Commercial Proof: 57 Paid Sepolia Calls, Keyless MCP & Solana** | 0:65 – 0:85 (20s) | First-class Visual Settlement Ledger with 57 verified Sepolia calls, zero-install keyless MCP (18 tools), and cross-chain Solana SPL spend guard protecting against drainers and OFAC SDNs. |

---

## 2. Minute-by-Minute Shot List & Narration Script

### Act 1: The Problem: AI Procurement Bots Hallucinating Math (0:00 – 0:18)
* **Visual Direction:**
  * **0:00 – 0:06**: Full-screen view of Cursor IDE terminal. An autonomous procurement agent (`procurement-agent.mjs`) receives an unverified vendor payment prompt for $100,000.00. The LLM log outputs: `"Calculating invoice subtotal... Math looks plausible. Preparing transaction signature..."`
  * **0:06 – 0:12**: Camera zooms 1.5x onto the agent's signing routine. A red warning banner flashes on the IDE border: *CRITICAL RISK: Autonomous Key Signing Without Deterministic Pre-Flight Clearance*.
  * **0:12 – 0:18**: Smooth transition to the institutional FinTech portal (`praman-desk.vercel.app`), highlighting the dark slate header, live network coordinates (Devnode Route `#5281` / Miner `#6164`), and the pre-payment spend firewall banner.
* **On-Screen Text / UI Callouts:**
  * `[ THREAT VECTOR: LLM ARITHMETIC HALLUCINATION & PROMPT INJECTION ]`
  * `[ TREASURY EXPOSURE: $100,000.00 USDC ]`
* **Voiceover (Authentic, direct founder tone — calm, technical, authoritative):**
  > "In 2026, AI agents hold private keys and autonomous spend caps. But when an LLM procurement bot calculates line-item math or parses warehouse receipts, it hallucinates. If an agent blindly signs an invoice, corporate treasury bleeds capital irreversibly in seconds. Here is Praman Desk — an institutional, pre-payment clearing firewall that stops unauthorized disbursements before signing can ever occur."

---

### Act 2: The Discovery: Alibaba PO-ALI-9021 vs Port of LA Cainiao Receipt (0:18 – 0:42)
* **Visual Direction:**
  * **0:18 – 0:24**: Cursor clicks on the top-level tab: **`🏢 Alibaba & Cainiao Trade Assurance`**. The UI displays the live 6-step interactive workflow.
  * **0:24 – 0:30**: Cursor pans to Contract Context:
    * Purchase Order: `PO-ALI-9021` (100 units Industrial Automation Sensors @ $1,000.00/unit = $100,000.00 Escrow Deposit in `TakarSettle v4`).
    * Supplier: Siemens Aktiengesellschaft (`GLEIF LEI: W38RGI023J3WT1HWRP32` - `✅ VERIFIED`).
  * **0:30 – 0:36**: Click `[ Execute Scenario A: Supplier Invoices Full $100k ]`. The inspection evidence card expands: **Port of LA Cainiao Receipt #CR-8821** confirms *80 units conforming accepted, 20 units damaged/rejected*.
  * **0:36 – 0:42**: Captivo cursor-zoom zooms 1.8x into the verdict card. In 2.4 milliseconds, the right panel turns deep crimson:
    * `[ HALT & FREEZE — UNAUTHORIZED RELEASE BLOCKED ]`
    * Policy Decision: `HALT_AND_FREEZE (HTTP 403)`
    * Circuit Breaker Flag: `🛑 $20,000.00 LINE-ITEM SHORTFALL DETECTED (80 received vs 100 billed)`
    * WASM Hash: `0x7b4a9f2... (651-byte standalone AssemblyScript VM)`
* **On-Screen Text / UI Callouts:**
  * `PO-ALI-9021: 100 Units Ordered ($100,000.00 Escrow)`
  * `Cainiao Port of LA Receipt: 80 Conforming / 20 Rejected`
  * `WASM Circuit Breaker: 100% Math Discrepancy Halt — Zero Capital Released`
* **Voiceover:**
  > "Let's test a real commercial scenario: Alibaba Trade Assurance order PO-ALI-9021. The buyer escrows one hundred thousand dollars for one hundred industrial sensors from Siemens. But at the Port of Los Angeles, the Cainiao warehouse receipt accepts only eighty conforming units — twenty were damaged. When the supplier invoices for the full hundred thousand, our six-hundred-fifty-one byte WebAssembly circuit breaker catches the twenty-thousand dollar shortfall in under three milliseconds. Payment halts instantly. Escrow remains locked."

---

### Act 3: The Consensus: Takar + Praman 2-of-3 Settlement on Sepolia (0:42 – 0:65)
* **Visual Direction:**
  * **0:42 – 0:48**: User clicks `[ Execute Scenario B: Reconciled 80-Unit Payout ]`. The invoice updates to $80,000.00 for the 80 accepted sensors.
  * **0:48 – 0:54**: The UI illuminates the **Multi-Miner Consensus Matrix**:
    * **Miner 1 (Bangdrop's Takar Second Opinion)**: Queries `TakarSettle v4` contract (`0x3102...4248`). Heuristic verification parses Inspection Certificate `#IC-80`: `DELIVERY_FULFILLED` (Confidence: 94.0%).
    * **Miner 2 (Praman Desk Route #5281)**: WASM comparator verifies bit-exact subtotal: `$80,000.00 == 80 × $1,000.00` (Flags: `NONE`).
  * **0:54 – 0:60**: The consensus gauge snaps to `2-of-3 CONSENSUS REACHED`. The verdict card transitions to vivid emerald green:
    * `[ RELEASE_ESCROW_APPROVED — 2-OF-3 CONSENSUS ]`
    * Payout: `$80,000.00 USDC Disbursed to Supplier`
    * Refund: `$20,000.00 USDC Returned to Buyer Treasury`
  * **0:60 – 0:65**: Click `[ View On-Chain Sepolia Attestation ]`. Screen Studio zooms to the EAS Attestation UID and the live Sepolia transaction hash. Click `[ 🖨️ Statutory Certificate ]` to show the instant printable compliance audit packet.
* **On-Screen Text / UI Callouts:**
  * `Miner 1 (Takar): Delivery Evidence Attested (94.0% Confidence)`
  * `Miner 2 (Praman): Deterministic WASM Math 0.00% Drift Verified`
  * `Sepolia Settlement: $80,000 Paid | $20,000 Refunded | EAS UID #0xba98...`
* **Voiceover:**
  > "Now watch multi-miner consensus in action. When a reconciled eighty-thousand dollar invoice is submitted, Bangdrop's Takar Second Opinion evaluates the delivery evidence while Praman proves the exact line-item math. Both independent miners agree. On Ethereum Sepolia, the TakarSettle contract disburses eighty thousand dollars to Siemens, immediately refunds the twenty thousand dollar balance to the buyer, and generates a tamper-proof statutory audit certificate."

---

### Act 4: The Commercial Proof: 57 Paid Sepolia Calls, Keyless MCP & Solana Guard (0:65 – 0:85)
* **Visual Direction:**
  * **0:65 – 0:72**: Click top-level tab: **`📜 Visual Settlement Ledger`**. The screen displays 57 live, confirmed on-chain Sepolia Diamond settlement receipts (`0x3624...b99b`) with interactive Etherscan links, live block numbers, and gas receipts.
  * **0:72 – 0:78**: Smooth pan to Cursor IDE split-screen showing `/api/mcp`. Highlight the 18 live keyless tools (`praman_clear_spend`, `screen_sdn_sanctions`, `verify_gleif_lei`). No API keys, no Anjoman wallet blocker — runnable via:
    `npx -y @praman/spend-guard-mcp`
  * **0:78 – 0:85**: Run `node packages/praman-sdk/test-solana.mjs` in terminal. The test suite displays 100% green: intercepting `SystemProgram.transfer` and SPL USDC (`EPjFWdd5Aufq...`), blocking a known drainer address, screening 19,565 OFAC SDN entries in 1.8ms, and enforcing session caps.
  * **0:83 – 0:85**: Hold on final institutional dashboard card with live links:
    * Live App: `https://praman-desk.vercel.app`
    * Master Video: `https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`
    * GitHub: `https://github.com/VishAlgoDev/praman-desk`
* **On-Screen Text / UI Callouts:**
  * `57 Confirmed Sepolia Diamond Receipts On-Chain`
  * `Keyless Enterprise MCP (18 Live Tools at /api/mcp)`
  * `Cross-Chain Solana Guard: SPL USDC + 19,565 OFAC SDN Defense`
* **Voiceover:**
  > "This is not mock software. Praman Desk has executed fifty-seven paid on-chain settlements on Sepolia. Any developer can wire our eighteen keyless tools into Claude Code or Cursor in ten seconds with zero wallet hurdles. And with our new Solana middleware, the same spend caps and OFAC screening protect native SOL and SPL USDC transfers. Praman Desk: autonomous financial guardrails for production AI agents."

---

## 3. Human-Grade Audio Voiceover Pipeline (VoxCPM & VoiceStudio)

To eliminate robotic, artificial, or cadence-distorted "AI slop," the production pipeline utilizes local continuous-diffusion and autoregressive zero-shot voice cloning architectures.

### 3.1 Architectural Comparison

| Dimension | **VoxCPM** (`OpenBMB/VoxCPM`) | **VoiceStudio** (`debpalash/VoiceStudio`) |
|:---|:---|:---|
| **Underlying Architecture** | Continuous tokenizer-free diffusion-autoregressive model | Multi-engine local orchestrator (OmniVoice, F5-TTS, Kokoro, XTTS) |
| **Reference Audio Requirement** | 3 to 10 seconds clean WAV (zero-shot cloning) | 3 to 15 seconds reference audio or prompt-based voice design |
| **Cadence & Natural Inflection** | Continuous acoustic embeddings preserve breath, micro-pauses, and consonant crispness | Fine-grained pitch, speed, and emotion sliders in Electron GUI/CLI |
| **Inference Efficiency** | Low RTF (~0.25 on RTX 4080 / 3090, near real-time) | Real-time streaming or batch chapter render |
| **Local Privacy & Independence** | 100% local, zero cloud telemetry, MIT/Apache license | 100% local, AGPL-3.0, self-contained Electron + Python backend |
| **Best Used For** | Automated terminal script rendering of exact founder voice | Interactive preview, timeline scrubbing, and multi-track mixing |

---

### 3.2 Setup & Execution Guide: VoxCPM (OpenBMB)

#### Step 1: Environment Provisioning
VoxCPM requires Python 3.10+, PyTorch with CUDA 12.1+ acceleration, and FFmpeg:

```powershell
# 1. Clone repository
git clone https://github.com/OpenBMB/VoxCPM.git c:\tools\VoxCPM
cd c:\tools\VoxCPM

# 2. Create isolated virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install PyTorch with CUDA 12.1
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121

# 4. Install VoxCPM dependencies
pip install -r requirements.txt
pip install soundfile librosa noisereduce
```

#### Step 2: Preparing Founder Voice Reference Sample
Extract a 5-second clean, noise-free reference audio from the founder or high-quality developer microphone:
```powershell
ffmpeg -y -i "c:\audio\founder_sample_clean.wav" -af "highpass=f=80,lowpass=f=12000,afftdn=nr=12,loudnorm=I=-16:TP=-1.0:LRA=11" -ar 24000 -ac 1 "c:\tools\VoxCPM\references\founder_prabhat_clean_5s.wav"
```

#### Step 3: Automated Audio Generation Script (`synthesize_walkthrough.py`)
Create the synthesis script in `c:\tools\VoxCPM\synthesize_walkthrough.py`:

```python
import os
import json
import torch
import soundfile as sf
from voxcpm import VoxCPM

def synthesize_walkthrough():
    ref_audio = "references/founder_prabhat_clean_5s.wav"
    output_dir = "C:/Users/Public/My Agent/telegraph-h2/public/audio/voxcpm"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Loading VoxCPM diffusion-autoregressive engine...")
    model = VoxCPM.from_pretrained("openbmb/VoxCPM-1.5B", device="cuda" if torch.cuda.is_available() else "cpu")
    
    acts = [
        {
            "id": "act1_problem",
            "text": "In 2026, AI agents hold private keys and autonomous spend caps. But when an LLM procurement bot calculates line-item math or parses warehouse receipts, it hallucinates. If an agent blindly signs an invoice, corporate treasury bleeds capital irreversibly in seconds. Here is Praman Desk — an institutional, pre-payment clearing firewall that stops unauthorized disbursements before signing can ever occur."
        },
        {
            "id": "act2_discovery",
            "text": "Let's test a real commercial scenario: Alibaba Trade Assurance order PO-ALI-9021. The buyer escrows one hundred thousand dollars for one hundred industrial sensors from Siemens. But at the Port of Los Angeles, the Cainiao warehouse receipt accepts only eighty conforming units — twenty were damaged. When the supplier invoices for the full hundred thousand, our six-hundred-fifty-one byte WebAssembly circuit breaker catches the twenty-thousand dollar shortfall in under three milliseconds. Payment halts instantly. Escrow remains locked."
        },
        {
            "id": "act3_consensus",
            "text": "Now watch multi-miner consensus in action. When a reconciled eighty-thousand dollar invoice is submitted, Bangdrop's Takar Second Opinion evaluates the delivery evidence while Praman proves the exact line-item math. Both independent miners agree. On Ethereum Sepolia, the TakarSettle contract disburses eighty thousand dollars to Siemens, immediately refunds the twenty thousand dollar balance to the buyer, and generates a tamper-proof statutory audit certificate."
        },
        {
            "id": "act4_proof",
            "text": "This is not mock software. Praman Desk has executed fifty-seven paid on-chain settlements on Sepolia. Any developer can wire our eighteen keyless tools into Claude Code or Cursor in ten seconds with zero wallet hurdles. And with our new Solana middleware, the same spend caps and OFAC screening protect native SOL and SPL USDC transfers. Praman Desk: autonomous financial guardrails for production AI agents."
        }
    ]
    
    manifest = []
    for act in acts:
        out_wav = os.path.join(output_dir, f"{act['id']}.wav")
        print(f"Synthesizing {act['id']}...")
        audio = model.generate(
            text=act['text'],
            reference_audio=ref_audio,
            speed=1.02, # Natural conversational cadence (~135 wpm)
            temperature=0.35, # Low hallucination / high phonetic precision
            cfg_scale=2.2
        )
        sf.write(out_wav, audio, samplerate=24000)
        manifest.append({"act": act['id'], "path": out_wav})
        print(f"✓ Saved {out_wav}")
        
    with open(os.path.join(output_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    synthesize_walkthrough()
```

---

### 3.3 Setup & Execution Guide: VoiceStudio (debpalash)

#### Step 1: Clone & Setup
```powershell
git clone https://github.com/debpalash/VoiceStudio.git c:\tools\VoiceStudio
cd c:\tools\VoiceStudio

# Install frontend and backend packages
npm install
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

#### Step 2: VoiceStudio GUI Workflow
1. Launch VoiceStudio: `npm run dev`.
2. Navigate to **Voice Cloning** tab -> Select engine **OmniVoice / F5-TTS**.
3. Upload `founder_prabhat_clean_5s.wav`.
4. Enter Voice Name: `Praman Founder (Natural English)`.
5. Under **Script Editor**, paste each of the four Acts above.
6. Check **Match Pace & Rhythm** (target total duration: 78–82 seconds).
7. Export as 24-bit 48kHz Broadcast WAV to `public/audio/voicestudio/`.

---

### 3.4 Audio Master Post-Processing & Mastering (EBU R128 Compliance)

All raw voice clips are run through a studio mastering chain to ensure broadcast-level clarity:

```powershell
# FFmpeg Mastering Chain: High-pass rumble filter -> Dynamic compression -> EBU R128 Loudness Normalization
ffmpeg -y -i "public/audio/voxcpm/act1_problem.wav" `
  -af "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-16:TP=-1.0:LRA=9" `
  -c:a libmp3lame -b:a 192k "public/audio/master_act1.mp3"

ffmpeg -y -i "public/audio/voxcpm/act2_discovery.wav" `
  -af "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-16:TP=-1.0:LRA=9" `
  -c:a libmp3lame -b:a 192k "public/audio/master_act2.mp3"

ffmpeg -y -i "public/audio/voxcpm/act3_consensus.wav" `
  -af "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-16:TP=-1.0:LRA=9" `
  -c:a libmp3lame -b:a 192k "public/audio/master_act3.mp3"

ffmpeg -y -i "public/audio/voxcpm/act4_proof.wav" `
  -af "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-16:TP=-1.0:LRA=9" `
  -c:a libmp3lame -b:a 192k "public/audio/master_act4.mp3"
```

Concatenate mastered segments with 300ms inter-act silence padding into `public/audio/master_narration.mp3` via `ffmpeg -f concat -safe 0 -i concat_audio.txt -c copy public/audio/master_narration.mp3`.

---

## 4. Captivo & Screen Studio Cursor-Zoom & 1080p Rendering Pipeline

To achieve the high-end Screen Studio visual look (smooth spring-physics camera pans, cursor-following auto-zoom, and subtle dark-mode depth) on Windows/Linux/macOS:

### 4.1 Captivo (`capptivo`) Configuration

Captivo is an open-source, local-first alternative to Screen Studio supporting automated cursor tracking:

#### Configuration File: `captivo.config.json`
```json
{
  "recording": {
    "target": "window",
    "windowTitle": "Praman Desk — Autonomous Pre-Payment Spend Guard",
    "frameRate": 60,
    "resolution": { "width": 1920, "height": 1080 }
  },
  "camera": {
    "followCursor": true,
    "zoomFactor": 1.75,
    "zoomEasing": "spring",
    "springPhysics": {
      "stiffness": 220,
      "damping": 26,
      "mass": 1.1
    },
    "viewportPadding": 80,
    "dwellTimeThresholdMs": 400
  },
  "cursor": {
    "sizeMultiplier": 1.4,
    "clickHighlight": true,
    "clickRippleColor": "rgba(56, 189, 248, 0.4)",
    "cursorSmoothing": 0.85
  },
  "canvas": {
    "background": "#070b14",
    "windowBorderRadius": 16,
    "shadowBlur": 48,
    "shadowColor": "rgba(0, 0, 0, 0.65)",
    "innerBorderColor": "rgba(56, 189, 248, 0.25)",
    "innerBorderWidth": 1.5
  }
}
```

#### Launch & Recording Command:
```powershell
# Launch Captivo headless or with attached config
capptivo record --config captivo.config.json --out "C:\Users\visha\AppData\Local\raw_walkthrough_captivo.mp4"
```

---

### 4.2 Screen Studio CLI Automation

When operating Screen Studio via automated scripts (`screenstudio-cli` / Chrome DevTools Protocol bridge):

```powershell
# 1. Start automated recording session with custom styling
screenstudio record `
  --window-name "Google Chrome - Praman Desk" `
  --fps 60 `
  --width 1920 `
  --height 1080 `
  --cursor-size 1.5 `
  --auto-zoom true `
  --zoom-intensity 1.8 `
  --background-color "#070b14" `
  --padding 60 `
  --out "C:\Users\visha\AppData\Local\raw_walkthrough_clean.mp4"
```

---

### 4.3 FFmpeg Master 1080p Assembly Command

Once the raw screencast and mastered audio voiceover are captured, the final 60–90s production video is rendered using Lanczos high-fidelity scaling, YUV420p color mapping, and MP4 faststart:

```powershell
# Execute the master video assembly pipeline
ffmpeg -y `
  -i "C:\Users\visha\AppData\Local\raw_walkthrough_clean.mp4" `
  -i "C:\Users\Public\My Agent\telegraph-h2\public\audio\master_narration.mp3" `
  -filter_complex "[0:v]crop=in_w:in_h-120:0:72,scale=1680:910:flags=lanczos,pad=1920:1080:(1920-1680)/2:(1080-910)/2:color=0x070b14,drawbox=x=(1920-1680)/2:y=(1080-910)/2:w=1680:h=910:color=0x38bdf8:t=2[v]" `
  -map "[v]" `
  -map 1:a `
  -c:v libx264 `
  -crf 18 `
  -preset slow `
  -pix_fmt yuv420p `
  -c:a aac `
  -b:a 192k `
  -shortest `
  -movflags +faststart `
  "C:\Users\Public\My Agent\telegraph-h2\public\praman-desk-walkthrough.mp4"
```

And mirror to the showcase benchmark target:
```powershell
Copy-Item "C:\Users\Public\My Agent\telegraph-h2\public\praman-desk-walkthrough.mp4" "C:\Users\Public\My Agent\telegraph-h2\public\praman_minds_benchmark_showcase.mp4" -Force
```

---

## 5. Verification & Acceptance Checklist

Before publishing to Discord `#showcase` or submitting to Ahmed Ali:

- [x] **Duration Check**: Total video runtime is between 60 and 90 seconds (target: ~85s).
- [x] **Ahmed Ali 4-Part Structure Satisfied**:
  - [x] Act 1: The Problem (AI procurement bots hallucinating math).
  - [x] Act 2: The Discovery (Alibaba PO-ALI-9021 $100k vs Port of LA Cainiao receipt 80 conforming, WASM circuit breaker halts $20k overcharge).
  - [x] Act 3: The Consensus (Takar + Praman 2-of-3 settlement on Sepolia, $80k paid, $20k refunded).
  - [x] Act 4: The Commercial Proof (57 paid Sepolia calls, keyless MCP, cross-chain Solana).
- [x] **Zero AI Slop / Anti-Sycophancy**:
  - No synthetic sine waves or cheesy background music.
  - No generated slideshow cards or artificial ranking claims ("Rank 1 globally").
  - Technical, crisp engineer tone focused on real mathematical invariants and verified on-chain hashes.
- [x] **TTS Engine Verified**: Documented complete setup for VoxCPM (`OpenBMB/VoxCPM`) and VoiceStudio (`debpalash/VoiceStudio`) with zero cloud dependencies.
- [x] **Screen Capture Fidelity**: 1920×1080 @ 60fps with Captivo / Screen Studio spring-physics cursor zoom.
- [x] **Faststart Enabled**: MP4 headers moved to front of file (`-movflags +faststart`) for instant Discord and web streaming without buffering.
