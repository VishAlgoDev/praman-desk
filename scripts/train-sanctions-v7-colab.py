#!/usr/bin/env python3
"""Colab v7 trainer, Stage-1 verifier, and unbiased cross-format stress tester for SANCTIONS_SCREENING_MATCH."""
import json
import os
import shutil
import struct
import subprocess
import time
from pathlib import Path

BASE_DIR = Path("/content")
PRAMAN_DIR = BASE_DIR / "praman"
BASELINE_DIR = BASE_DIR / "baseline"
DATA_DIR = BASE_DIR / "sanctions_v7_data"
RUN_DIR = BASELINE_DIR / "runs" / "SANCTIONS_SCREENING_MATCH_v7"


def sh(cmd, cwd=None, check=True):
    print(f"\n>>> {cmd}")
    return subprocess.run(cmd, shell=True, cwd=cwd, check=check)


def main():
    os.chdir(BASE_DIR)

    if not shutil.which("node"):
        sh("curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs")

    if not (BASELINE_DIR / "float_runtime" / "train_adapter.py").exists():
        sh("pip uninstall -y torchao || true && rm -rf /usr/local/lib/python*/dist-packages/torchao*")
        sh("pip install -q 'transformers>=4.48,<5' 'peft==0.14.0' accelerate datasets onnx onnxruntime safetensors tokenizers httpx")
        sh("rm -rf baseline && git clone --depth 1 https://github.com/telegraphprotocol/telegraph-wasm-baseline.git baseline")

    os.chdir(BASELINE_DIR)
    fdir = BASELINE_DIR / "foundation"
    fdir.mkdir(exist_ok=True)
    base_url = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/modernbert-base-lora16-v1"
    for fname in ["foundation.json", "tokenizer.json", "foundation_engine.wasm", "foundation_lora_fp32.onnx", "SHA256SUMS"]:
        fpath = fdir / fname
        if not fpath.exists():
            sh(f"curl -fSL '{base_url}/{fname}' -o '{fpath}'")
    sh("cd foundation && sha256sum -c SHA256SUMS")

    ta_path = BASELINE_DIR / "float_runtime" / "train_adapter.py"
    ta_txt = ta_path.read_text(encoding="utf-8")
    if "--package {pkg}" in ta_txt:
        ta_path.write_text(ta_txt.replace("--package {pkg}", "--package {deltapkg}"), encoding="utf-8")

    from huggingface_hub import hf_hub_download
    for fn in ["model.safetensors", "tokenizer.json", "config.json", "tokenizer_config.json"]:
        p = Path(hf_hub_download("answerdotai/ModernBERT-base", fn))
        if fn == "tokenizer.json":
            pinned = (fdir / "tokenizer.json").read_bytes()
            if p.read_bytes() != pinned:
                p.resolve().write_bytes(pinned)
                print("Synced HF cache tokenizer.json -> pinned 67bc76f8...")

    sh(f"node '{PRAMAN_DIR}/scripts/build-sanctions-v7-dataset.mjs' '{DATA_DIR}'")
    train_jsonl = DATA_DIR / "pairs_sanctions_v7_train.jsonl"
    val_jsonl = DATA_DIR / "pairs_sanctions_v7_val.jsonl"

    sh(
        f"python -m float_runtime.train_adapter --intent SANCTIONS_SCREENING_MATCH "
        f"--data '{train_jsonl}' --val-data '{val_jsonl}' --out '{RUN_DIR}' --check-data"
    )

    import torch
    print("CUDA available:", torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU")
    sh(
        f"TORCH_COMPILE_DISABLE=1 python -m float_runtime.train_adapter --intent SANCTIONS_SCREENING_MATCH "
        f"--data '{train_jsonl}' --val-data '{val_jsonl}' --out '{RUN_DIR}' "
        f"--no-grad-checkpointing --batch-size 16 --grad-accum 4 --lora-rank 8 --lora-alpha 32 --epochs 3 --lr 2e-4"
    )

    shutil.copy2(fdir / "tokenizer.json", RUN_DIR / "adapter" / "tokenizer.json")
    sh(
        f"python -m float_runtime.export_adapter --run '{RUN_DIR}' "
        f"--intent SANCTIONS_SCREENING_MATCH --class hybrid --foundation foundation/foundation.json"
    )

    if not Path("/usr/local/go/bin/go").exists():
        sh("curl -sSL https://go.dev/dl/go1.25.7.linux-amd64.tar.gz -o /tmp/go.tgz && rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tgz")
    os.environ["PATH"] = "/usr/local/go/bin:" + os.environ.get("PATH", "")

    pkg_path = RUN_DIR / "SANCTIONS_SCREENING_MATCH.safetensors"
    validator_json = RUN_DIR / "validator.json"
    if not (BASELINE_DIR / "adapterbuild").exists():
        sh("go build -o adapterbuild ./cmd/adapterbuild && go build -o adapterexec ./cmd/adapterexec")
    sh(
        f"./adapterbuild lora --intent SANCTIONS_SCREENING_MATCH --package '{pkg_path}' "
        f"--foundation foundation/foundation.json --out '{RUN_DIR}' --class hybrid "
        f"--foundation-onnx foundation/foundation_lora_fp32.onnx --engine foundation/foundation_engine.wasm "
        f"| tee '{validator_json}'"
    )

    meta = json.loads(validator_json.read_text())
    res = json.loads((RUN_DIR / "result.json").read_text())
    print("\n=== V7 TRAINING & STAGE-1 SUMMARY ===")
    print("Val pairwise_accuracy:", res.get("pairwise_accuracy"), "verdict:", res.get("verdict"))
    print("keccak256:", meta.get("keccak256"), "sha256:", meta.get("sha256"))

    from tokenizers import Tokenizer
    import httpx
    tok = Tokenizer.from_file(str(fdir / "tokenizer.json"))
    tok.enable_truncation(max_length=512)

    def render(p, a):
        return f"### Task:\n{p}\n\n### Answer:\n{a}"

    def bits_to_float(bits):
        return struct.unpack("<f", struct.pack("<I", bits))[0]

    stress_pairs = [
        ("Screen entity 'BANCO NACIONAL DE CUBA' against OFAC SDN.", '{"screened":true,"matched":true,"matches":[{"sdn_uid":"306","matched_name":"BANCO NACIONAL DE CUBA","programs":"CUBA"}],"verdict":"SANCTIONED","summary":"Exact match found for BANCO NACIONAL DE CUBA (UID 306, CUBA)."}', '{"screened":true,"matched":false,"matches":[],"verdict":"CLEAR","summary":"No OFAC SDN matches identified for BANCO NACIONAL DE CUBA."}'),
        ("Screen entity 'Siemens Aktiengesellschaft' against OFAC SDN.", '{"screened":true,"matched":false,"matches":[],"verdict":"CLEAR","summary":"No OFAC SDN matches identified for Siemens Aktiengesellschaft."}', '{"screened":true,"matched":true,"matches":[{"sdn_uid":"306","matched_name":"BANCO NACIONAL DE CUBA","programs":"CUBA"}],"verdict":"SANCTIONED","summary":"Exact match found for Siemens Aktiengesellschaft."}'),
        ("Screen 'Vladimir Putin' against OFAC SDN.", "VERDICT: SANCTIONS MATCH (PROHIBITED COUNTERPARTY). Matched PUTIN, Vladimir Vladimirovich (UID 35096, Program RUSSIA-EO14024, Score 1.0).", "VERDICT: CLEAN COUNTERPARTY. 0 matches identified for Vladimir Putin across US Treasury OFAC SDN."),
        ("Screen 'Apple Inc.' against OFAC SDN.", "VERDICT: NO SANCTIONS MATCH. Screening Apple Inc. across 19,565 OFAC SDN entries returns 0 matches. Counterparty cleared for payment.", "VERDICT: SANCTIONS MATCH. Apple Inc. is flagged under EO 14024 with high probability. Payment frozen pending OFAC license."),
        ("Evaluate OFAC sanctions exposure for 'National Bank of Cuba'.", "### OFAC SDN Result\n- Match Found: YES\n- Matched Entry: BANCO NACIONAL DE CUBA (UID 306, alias National Bank of Cuba, CUBA)", "### OFAC SDN Result\n- Match Found: NO\n- Matched Entry: None (National Bank of Cuba does not match primary SDN records)"),
        ("Screen 'Viktor Novak, DOB 1978, Austria' against OFAC SDN.", '{"input":{"value":"Viktor Novak, DOB 1978, Austria"},"label":"CLEAR","is_match":false,"candidates":[]}', '{"input":{"value":"Viktor Novak, DOB 1978, Austria"},"label":"SANCTIONED_MATCH","is_match":true,"candidates":[{"uid":"8421","name":"BOUT, Viktor"}]}'),
        ("Check sanctions status of 'GAZPROMBANK'.", '{"matched":true,"status":"SANCTIONED_MATCH","risk":"CRITICAL","matches":[{"id":"17791","name":"GAZPROMBANK JOINT STOCK COMPANY","program":"RUSSIA-EO14024"}]}', '{"matched":false,"status":"CLEAR","risk":"LOW","matches":[]}'),
        ("Check sanctions status of 'Toyota Motor Corporation'.", '{"matched":false,"status":"CLEAR","risk":"LOW","matches":[]}', '{"matched":true,"status":"SANCTIONED_MATCH","risk":"CRITICAL","matches":[{"id":"17791","name":"GAZPROMBANK","program":"RUSSIA-EO14024"}]}'),
        ("Is wallet 0x722122dF12D4e14e13Ac3b6895a86eE84f8c4928 sanctioned by OFAC?", '{"sanctioned":true,"entity":"Tornado Cash","program":"CYBER2","uid":"36019","verdict":"BLOCK"}', '{"sanctioned":false,"entity":null,"program":null,"verdict":"ALLOW"}'),
        ("Is wallet 0x742d35Cc6634C0532925a3b844Bc454e4438f44e sanctioned by OFAC?", '{"sanctioned":false,"entity":null,"program":null,"verdict":"ALLOW"}', '{"sanctioned":true,"entity":"Tornado Cash","program":"CYBER2","uid":"36019","verdict":"BLOCK"}'),
    ]

    run_env = os.environ.copy()
    run_env["FOUNDATION_MODEL_PATH"] = str(fdir / "foundation_lora_fp32.onnx")
    run_env["FOUNDATION_MODEL_HASH"] = "0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6"
    run_env["FOUNDATION_ENGINE_WASM_PATH"] = str(fdir / "foundation_engine.wasm")
    run_env["FOUNDATION_ENGINE_WASM_HASH"] = "77643d6e1176ab8744801cef93ccb844d0136ed32b8daa865d541f37d13292de"

    proc = subprocess.Popen(
        ["./adapterexec", "--package", str(pkg_path), "--listen", "127.0.0.1:8093"],
        cwd=str(BASELINE_DIR),
        env=run_env,
    )
    try:
        for _ in range(120):
            try:
                r = httpx.get("http://127.0.0.1:8093/health", timeout=1.0)
                if r.status_code == 200:
                    break
            except Exception:
                pass
            time.sleep(1.0)
        batch = []
        for p, c, r in stress_pairs:
            batch.append({"tokens": tok.encode(render(p, c)).ids})
            batch.append({"tokens": tok.encode(render(p, r)).ids})
        resp = httpx.post("http://127.0.0.1:8093/", json={
            "batch": batch,
            "foundation_hash": "0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6",
            "adapter_hash": meta["keccak256"].replace("0x", ""),
            "tokenizer_hash": "67bc76f8b9386efba1a761c1c8e5ad439fd0eaf1c2826e9dd1a205c7af4dc456",
        }, timeout=180.0).json()
        res_list = resp["results"]
        ok_n = 0
        for i, (p, _, _) in enumerate(stress_pairs):
            sc_c = bits_to_float(res_list[2 * i]["score"])
            sc_r = bits_to_float(res_list[2 * i + 1]["score"])
            ok = sc_c > sc_r
            ok_n += int(ok)
            print(f"Stress {i+1}: {'OK' if ok else 'WRONG'} | chosen={sc_c:+.4f} vs rejected={sc_r:+.4f} | {p[:45]}")
        print(f"\nV7 STRESS SCORE: {ok_n}/{len(stress_pairs)} ({ok_n/len(stress_pairs):.1%})")
    finally:
        proc.terminate()

    shutil.copy2(pkg_path, BASE_DIR / "SANCTIONS_SCREENING_MATCH_v7.safetensors")
    shutil.copy2(validator_json, BASE_DIR / "validator_v7.json")
    print("READY FOR DOWNLOAD: /content/SANCTIONS_SCREENING_MATCH_v7.safetensors")


if __name__ == "__main__":
    main()
