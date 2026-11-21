import os
import json
import soundfile as sf
import numpy as np
from kokoro_onnx import Kokoro
import subprocess

model_path = r'C:\Users\visha\.cache\kokoro\kokoro-v1.0.onnx'
voices_path = r'C:\Users\visha\.cache\kokoro\voices-v1.0.bin'
output_dir = r'C:\Users\Public\My Agent\telegraph-h2\public\audio\kokoro'
os.makedirs(output_dir, exist_ok=True)

kokoro = Kokoro(model_path, voices_path)

sections = [
    {
        "id": "section_1_problem",
        "title": "The Vulnerability in Agentic Finance",
        "text": (
            "When you give an autonomous AI agent an Ethereum wallet, you are effectively handing it a blank check. "
            "In 2026, agents are negotiating deals, buying API compute, and paying suppliers directly on-chain. "
            "But language models are probabilistic. If an agent encounters a prompt injection, a hallucinated invoice, "
            "or a lookalike vendor domain, funds move irreversibly in seconds. "
            "You cannot rely on another probabilistic language model to catch financial fraud. "
            "What you need is deterministic, mathematical, and cryptographic verification before a single transaction is signed."
        ),
        "post_pause": 0.8
    },
    {
        "id": "section_2_architecture",
        "title": "Praman Desk Architecture & Live Telemetry",
        "text": (
            "That is why we built Praman Desk. Praman Desk is an autonomous pre-payment spend firewall and counterparty "
            "clearing desk built on the Telegraph Protocol. It intercepts agent payment requests before the wallet signs, "
            "executing pre-flight checks in under twenty-five milliseconds. "
            "In the header here, you can see our live deployment: connected to the Sepolia Diamond contract, "
            "routing queries through Telegraph Protocol Miner Node fifty-two eighty-one, and executing our "
            "six hundred and fifty-one byte standalone WebAssembly arithmetic engine. "
            "Praman Desk enforces three layers of defense: authoritative legal identity verification through the GLEIF Global LEI registry, "
            "sanctions screening against the US Treasury OFAC Specially Designated Nationals list, and bit-exact integer math."
        ),
        "post_pause": 0.8
    },
    {
        "id": "section_3_threat_simulator",
        "title": "Threat Simulator: Lazarus Intercept & Arithmetic Drift",
        "text": (
            "Let us look at how this works in real time through our threat simulator. "
            "Here in Scenario One, a compromised autonomous agent is attempting to settle a forty-two hundred dollar infrastructure bill, "
            "but the payee address belongs to the Lazarus Group, who were responsible for the Ronin Bridge exploit. "
            "The moment the agent initiates payment, Praman Desk intercepts the transaction. The OFAC screening engine matches "
            "the digital currency address in eighteen milliseconds, triggers an immediate halt and freeze, "
            "and stops the outbound transfer before a single cent leaves the treasury. "
            "In Scenario Two, an agent receives a GPU cloud invoice claiming four hundred and fifty dollars. "
            "However, when our WebAssembly engine sums the individual GPU compute hours with integer precision, "
            "it calculates the true total as three hundred and fifty dollars. The firewall catches the one hundred dollar phantom markup, "
            "flags an arithmetic mismatch, and safely holds the funds."
        ),
        "post_pause": 0.8
    },
    {
        "id": "section_4_two_minds_and_compliant",
        "title": "Animoca Minds Spend Guard & Compliant Settlement",
        "text": (
            "Now let us examine Scenario Seven, our Two-Mind Spend Guard built for Animoca Brands Minds. "
            "Here, an agent is processing a cross-border SaaS payment to Stripe for ten thousand five hundred USDC, using an inverted exchange rate. "
            "The Diligence Mind analyzes the invoice and detects a thirteen hundred and seventy-three dollar phantom foreign exchange overcharge, "
            "while the Reviewer Mind verifies that the total exceeds the agent's five hundred dollar delegation cap. "
            "Both minds coordinate through Telegraph to lock down the escrow. "
            "On the other hand, look at Scenario Three. This is a legitimate two hundred and fifty dollar invoice from Anthropic. "
            "The counterparty is verified in the GLEIF corporate registry, the address passes sanctions screening, "
            "the math reconciles to the penny, and the spend is within delegation limits. "
            "The firewall generates a cryptographic clearance certificate, and authorizes the transaction for live on-chain settlement over the x402 protocol."
        ),
        "post_pause": 0.8
    },
    {
        "id": "section_5_bridges_and_mcp",
        "title": "Ecosystem Bridges & Model Context Protocol Server",
        "text": (
            "Beyond our native checks, Praman Desk establishes reciprocal bridges across the Telegraph ecosystem. "
            "We integrate with FakeWatch to catch phishing lookalike domains, and RugReceipt to audit smart contract deployer addresses before funds are committed. "
            "But Praman Desk is not just a web dashboard. For developers, it runs as an open-standard Model Context Protocol server called praman-spend-guard, "
            "featuring eighteen native tools. Any agent built with the Vercel AI SDK, LangChain, or Claude Code can call clear_spend, "
            "screen_sanctions, or verify_counterparty natively in their tool chain. "
            "Furthermore, our Universal Multi-Miner Discrepancy Arbitrator queries independent Telegraph specialists, "
            "detecting numerical variances and temporal contradictions to reach deterministic consensus."
        ),
        "post_pause": 0.8
    },
    {
        "id": "section_6_ledger_and_closing",
        "title": "On-Chain Ledger & Empirical Benchmark Verification",
        "text": (
            "Finally, if we switch over to the Telegraph Network and On-Chain Ledger tab, you can inspect the actual cryptographic record. "
            "Here are fifty-seven verified micro-settlement receipts executed on Ethereum Sepolia, proving that every single evaluation is recorded transparently on-chain. "
            "In our empirical benchmarks across real-world adversarial attacks, Praman Desk achieved a one hundred percent catch rate, "
            "averting over seventy-nine thousand dollars in capital loss with a two hundred and fifty thousand to one protection ratio. "
            "As autonomous agents take over global finance, Praman Desk ensures they do so safely, deterministically, and with zero unverified spend."
        ),
        "post_pause": 1.2
    }
]

print("=== GENERATING KOKORO NEURAL AUDIO SECTIONS ===")
sample_rate = 24000
all_audio = []
timeline = []
current_time = 0.0

for idx, sec in enumerate(sections):
    print(f"Synthesizing [{idx+1}/{len(sections)}] {sec['title']}...")
    samples, sr = kokoro.create(sec["text"], voice="am_adam", speed=1.02, lang="en-us")
    duration = len(samples) / sr
    
    sec_wav_path = os.path.join(output_dir, f"{sec['id']}.wav")
    sf.write(sec_wav_path, samples, sr)
    
    pause_samples = np.zeros(int(sec["post_pause"] * sr), dtype=np.float32)
    
    start_time = current_time
    end_time = start_time + duration
    
    timeline.append({
        "section": sec["id"],
        "title": sec["title"],
        "start": round(start_time, 2),
        "end": round(end_time, 2),
        "duration": round(duration, 2),
        "post_pause": sec["post_pause"]
    })
    
    all_audio.append(samples)
    all_audio.append(pause_samples)
    current_time = end_time + sec["post_pause"]
    print(f" -> Duration: {duration:.2f}s | Cumulative: {current_time:.2f}s")

master_samples = np.concatenate(all_audio)
raw_master_wav = os.path.join(output_dir, "master_raw.wav")
sf.write(raw_master_wav, master_samples, sample_rate)
total_sec = len(master_samples) / sample_rate
print(f"\nRaw master audio generated: {total_sec:.2f} seconds ({total_sec/60:.2f} minutes)")

timeline_file = os.path.join(output_dir, "timeline.json")
with open(timeline_file, "w") as f:
    json.dump(timeline, f, indent=2)
print(f"Timeline written to {timeline_file}")

# Post-processing via FFmpeg broadcast mastering filter
final_mp3 = r"C:\Users\Public\My Agent\telegraph-h2\public\audio\master_narration.mp3"
os.makedirs(os.path.dirname(final_mp3), exist_ok=True)

ffmpeg_cmd = [
    "ffmpeg", "-y", "-i", raw_master_wav,
    "-af", (
        "highpass=f=80,"
        "equalizer=f=200:t=q:w=1.2:g=2.0,"
        "equalizer=f=3500:t=q:w=1.5:g=1.8,"
        "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,"
        "loudnorm=I=-16:TP=-1.5:LRA=11"
    ),
    "-b:a", "192k",
    final_mp3
]

print("Applying FFmpeg studio broadcast vocal filter...")
res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("FFmpeg error:", res.stderr)
else:
    print(f"Master broadcast narration produced: {final_mp3} ({os.path.getsize(final_mp3)} bytes)")

print("\n=== AUDIO GENERATION COMPLETE ===")
