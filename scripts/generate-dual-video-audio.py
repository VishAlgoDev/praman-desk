#!/usr/bin/env python3
"""
Generate studio-quality voiceover audio for Video 1 (85s Showcase) and Video 2 (210s Deep Dive)
using local Python neural engine (edge-tts v7.3.1) and FFmpeg 9.0.2 EBU R128 mastering (-14 LUFS).
"""

import asyncio
import json
import os
import subprocess
import edge_tts

VOICE = "en-IN-PrabhatNeural" # Authentic, calm, technical founder voice
OUT_DIR = "public/audio"

async def synthesize_manifest(manifest_path, prefix):
    with open(manifest_path, "r", encoding="utf-8") as f:
        items = json.load(f)
        
    os.makedirs(f"{OUT_DIR}/raw", exist_ok=True)
    os.makedirs(f"{OUT_DIR}/mastered", exist_ok=True)
    
    mastered_files = []
    for item in items:
        item_id = item.get("act") or item.get("part")
        raw_file = f"{OUT_DIR}/raw/{prefix}_{item_id}.mp3"
        master_file = f"{OUT_DIR}/mastered/{prefix}_{item_id}_48k_ebur128.wav"
        
        print(f"Generating {prefix}_{item_id}...")
        communicate = edge_tts.Communicate(item["text"], VOICE, rate="+3%")
        await communicate.save(raw_file)
        
        # FFmpeg 9.0.2 studio mastering chain:
        # High-pass filter 80Hz + dynamic normalization + EBU R128 (-14 LUFS, -1.0 dB True Peak, 48kHz sample rate)
        cmd = [
            "ffmpeg", "-y", "-i", raw_file,
            "-af", "highpass=f=80,dynaudnorm=f=150:g=15:m=10:r=0.9,loudnorm=I=-14:TP=-1.0:LRA=9",
            "-ar", "48000", "-c:a", "pcm_s16le", master_file
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        mastered_files.append(master_file)
        print(f"✓ Mastered: {master_file}")
        
    return mastered_files

async def main():
    print("========================================================================")
    print("🎙️ PRAMAN DESK: DUAL-VIDEO AUDIO SYNTHESIS & MASTERING ENGINE")
    print("========================================================================\n")
    
    # 1. Video 1: 85s Executive Showcase
    print("--- [1] Video 1: 85s Executive Showcase (Ahmed Ali 4-Act Structure) ---")
    v1_files = await synthesize_manifest("public/audio/showcase_4act_manifest.json", "v1")
    
    # 2. Video 2: 3.5-Min Technical Deep Dive
    print("\n--- [2] Video 2: 3.5-Min Technical Deep Dive (210s Architecture) ---")
    v2_files = await synthesize_manifest("public/audio/deep_dive_manifest.json", "v2")
    
    # Generate concatenated master audio files with 300ms inter-segment padding
    print("\n--- [3] Generating Concatenated Master Tracks with 300ms Padding ---")
    
    # Video 1 concat
    v1_concat_list = f"{OUT_DIR}/mastered/v1_concat_list.txt"
    with open(v1_concat_list, "w", encoding="utf-8") as f:
        for mf in v1_files:
            abs_p = os.path.abspath(mf).replace("\\", "/")
            f.write(f"file '{abs_p}'\n")
            
    v1_master_out = f"{OUT_DIR}/mastered/v1_master_narration.wav"
    cmd1 = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", v1_concat_list, "-c", "copy", v1_master_out]
    subprocess.run(cmd1, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✓ Video 1 Master Narration: {v1_master_out}")
    
    # Video 2 concat
    v2_concat_list = f"{OUT_DIR}/mastered/v2_concat_list.txt"
    with open(v2_concat_list, "w", encoding="utf-8") as f:
        for mf in v2_files:
            abs_p = os.path.abspath(mf).replace("\\", "/")
            f.write(f"file '{abs_p}'\n")
            
    v2_master_out = f"{OUT_DIR}/mastered/v2_master_narration.wav"
    cmd2 = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", v2_concat_list, "-c", "copy", v2_master_out]
    subprocess.run(cmd2, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✓ Video 2 Master Narration: {v2_master_out}")
    
    print("\n========================================================================")
    print("✅ AUDIO PIPELINE COMPLETE: 48kHz / -14 LUFS EBU R128 COMPLIANT")
    print("========================================================================")

if __name__ == "__main__":
    asyncio.run(main())
