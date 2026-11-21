import asyncio
import os
import json
import subprocess
import edge_tts

ACTS = [
    {
        "id": "act_1_thesis",
        "title": "Act 1: Thesis — Unchecked Autonomous Spending",
        "text": """In decentralized networks, autonomous AI agents now hold private keys and sign on-chain transactions directly. But what happens when an agent is prompt-injected, receives a manipulated invoice, or encounters a malicious smart contract?

On public blockchains, transactions are irreversible. Once private keys sign, treasury funds are permanently lost.

Praman Desk is a deterministic pre-transaction spend gate that intercepts transactions before cryptographic signing. It verifies counterparties, audits line-item arithmetic, screens sanctions, and enforces organizational delegation caps before funds can move."""
    },
    {
        "id": "act_2_architecture",
        "title": "Act 2: Architecture & Deterministic Policy Gate",
        "text": """Our architecture is built on deterministic WebAssembly. At the core is a 651-byte AssemblyScript math engine with zero external runtime imports. The firewall executes in under twenty-five milliseconds directly within an agent's tool-calling loop.

Counterparties are resolved against the official GLEIF Global Legal Entity Identifier index across two hundred jurisdictions, and recipient addresses are screened in-memory against the US Treasury OFAC Specially Designated Nationals list.

Every pre-flight check settles via the Telegraph Protocol x402 micropayment rail for one cent on Sepolia, generating an EIP-191 cryptographic attestation seal."""
    },
    {
        "id": "act_3_threat_simulator",
        "title": "Act 3: Live Threat Simulator — Scenarios 1, 2 & 5",
        "text": """Let us examine this in action on the live dashboard.

In Scenario One, an autonomous infrastructure agent receives a spoofed vendor invoice directing a forty-two hundred dollar payment to a Lazarus Group exploit address. The agent calls our pre-flight gate. The firewall matches the destination EVM address against the OFAC sanctions index and immediately halts signing. Zero funds move.

Next, in Scenario Two: a cloud GPU provider submits a four hundred and fifty dollar invoice, but the line items calculate to three hundred and fifty dollars. Our 651-byte WASM engine detects the one hundred dollar arithmetic discrepancy in three milliseconds and blocks the payment.

In Scenario Five, an agent attempts an unauthorized thirteen thousand eight hundred and sixty dollar treasury grant. Our delegation policy intercepts the transfer for exceeding the five hundred dollar single-agent ceiling without supervisor multisig co-signatures."""
    },
    {
        "id": "act_4_two_minds",
        "title": "Act 4: Animoca Minds Two-Mind Spend Guard",
        "text": """Praman Desk natively powers the Animoca Minds architecture through a two-mind spend guard.

In Scenario Seven, an agent processes an international SaaS settlement with an inverted Euro-to-Dollar exchange rate. The Diligence Mind detects a fifteen percent divergence from official European Central Bank reference rates, averting a thirteen hundred dollar overcharge. The Reviewer Mind verifies the discrepancy and withholds signing authority before on-chain Sepolia Diamond release.

Conversely, in Scenario Three, a verified Anthropic API invoice clears all four policy checks and is authorized for instant x402 settlement."""
    },
    {
        "id": "act_5_bridges_mcp",
        "title": "Act 5: Reciprocal Bridges & Developer SDKs",
        "text": """Praman Desk integrates bi-directionally across the Telegraph ecosystem.

Our FakeWatch bridge checks payment destinations against real-time threat intelligence to block typosquatted phishing domains like unisvvap.org. The RugReceipt bridge screens smart contract bytecode verification and deployer history. And our Paysheet adapter validates recurring contributor payroll across a three-miner validator quorum.

Developers can integrate Praman Desk in seconds: through our eighteen-tool remote Model Context Protocol server for Cursor and Claude Code, or using our lightweight Python and TypeScript SDKs."""
    },
    {
        "id": "act_6_ledger_closing",
        "title": "Act 6: On-Chain Settlement Ledger & Benchmark Verification",
        "text": """Every verification is permanently recorded on the Sepolia Diamond contract at Route 5281. The live ledger displays fifty-seven testnet verification settlements generated across fifteen independent miners.

Our complete test suite of one thousand forty-three deterministic test vectors passes with zero discrepancies.

Praman Desk delivers production-grade financial safety for autonomous agents: verifiable, deterministic, and non-custodial."""
    }
]

VOICE = "en-IN-PrabhatNeural"
OUTPUT_DIR = "public/audio/prabhat"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_audio_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

async def generate_act(act, index):
    raw_path = os.path.join(OUTPUT_DIR, f"{act['id']}.mp3")
    print(f"Synthesizing {act['title']} via {VOICE}...")
    communicate = edge_tts.Communicate(act['text'], VOICE, rate="-3%", pitch="-1Hz")
    await communicate.save(raw_path)
    dur = get_audio_duration(raw_path)
    print(f"  -> Generated {act['id']}.mp3: {dur:.2f}s")
    return raw_path, dur

async def main():
    timeline = []
    current_time = 0.0
    file_list = []
    
    # 1.5s silence generator
    silence_path = os.path.join(OUTPUT_DIR, "silence_15.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
        "-t", "1.5", "-b:a", "192k", silence_path
    ], check=True, capture_output=True)

    concat_txt_path = os.path.join(OUTPUT_DIR, "concat.txt")
    with open(concat_txt_path, "w", encoding="utf-8") as concat_file:
        for idx, act in enumerate(ACTS):
            act_file, dur = await generate_act(act, idx)
            timeline.append({
                "act": act["id"],
                "title": act["title"],
                "start": round(current_time, 2),
                "end": round(current_time + dur, 2),
                "duration": round(dur, 2)
            })
            concat_file.write(f"file '{os.path.abspath(act_file).replace(chr(92), '/')}'\n")
            current_time += dur
            
            # Add pause between sections (except last)
            if idx < len(ACTS) - 1:
                concat_file.write(f"file '{os.path.abspath(silence_path).replace(chr(92), '/')}'\n")
                current_time += 1.5

    # Concat raw files
    raw_master = os.path.join(OUTPUT_DIR, "master_raw.mp3")
    print("Concatenating audio chunks...")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_txt_path, "-c", "copy", raw_master
    ], check=True, capture_output=True)

    raw_total_dur = get_audio_duration(raw_master)
    print(f"Raw Master Duration: {raw_total_dur:.2f}s ({raw_total_dur/60:.2f} mins)")

    # Broadcast vocal strip mastering via FFmpeg
    mastered_output = "public/audio/master_narration.mp3"
    print("Applying broadcast vocal strip (highpass 80Hz, presence EQ, dynamic compression, -16 LUFS)...")
    filter_chain = (
        "highpass=f=80,"
        "equalizer=f=2500:t=q:w=1.2:g=2.5,"
        "acompressor=threshold=-18dB:ratio=3:attack=5:release=50,"
        "loudnorm=I=-16:TP=-1.5:LRA=10"
    )
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_master,
        "-af", filter_chain,
        "-b:a", "192k",
        mastered_output
    ], check=True, capture_output=True)

    final_dur = get_audio_duration(mastered_output)
    final_size = os.path.getsize(mastered_output)
    print(f"Master Narration Produced: {mastered_output}")
    print(f"Final Duration: {final_dur:.2f}s | Size: {final_size} bytes")

    # Save timeline
    timeline_meta = {
        "voice": VOICE,
        "persona": "Indian Engineering Founder (Natural Prosody)",
        "total_duration": round(final_dur, 2),
        "file_size": final_size,
        "acts": timeline
    }
    with open(os.path.join(OUTPUT_DIR, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(timeline_meta, f, indent=2)

    with open("public/audio/timeline.json", "w", encoding="utf-8") as f:
        json.dump(timeline_meta, f, indent=2)

    print("Timeline JSON written successfully.")

if __name__ == "__main__":
    asyncio.run(main())
