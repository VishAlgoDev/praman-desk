#!/usr/bin/env python3
"""Colab fast v6 trainer, Stage-1 verifier, and cross-format unseen stress tester for SANCTIONS_SCREENING_MATCH."""
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
DATA_DIR = BASE_DIR / "sanctions_v6_data"
RUN_DIR = BASELINE_DIR / "runs" / "SANCTIONS_SCREENING_MATCH_v6"


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

    sh(f"node '{PRAMAN_DIR}/scripts/build-sanctions-v6-dataset.mjs' '{DATA_DIR}'")
    train_jsonl = DATA_DIR / "pairs_sanctions_v6_train.jsonl"
    val_jsonl = DATA_DIR / "pairs_sanctions_v6_val.jsonl"

    sh(
        f"python -m float_runtime.train_adapter --intent SANCTIONS_SCREENING_MATCH "
        f"--data '{train_jsonl}' --val-data '{val_jsonl}' --out '{RUN_DIR}' --check-data"
    )

    import torch
    print("CUDA available:", torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU")
    sh(
        f"TORCH_COMPILE_DISABLE=1 python -m float_runtime.train_adapter --intent SANCTIONS_SCREENING_MATCH "
        f"--data '{train_jsonl}' --val-data '{val_jsonl}' --out '{RUN_DIR}' "
        f"--no-grad-checkpointing --batch-size 16 --grad-accum 8 --lora-rank 8 --lora-alpha 32 --epochs 3 --lr 5e-4"
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
    print("\n=== V6 TRAINING & STAGE-1 SUMMARY ===")
    print("Val pairwise_accuracy:", res.get("pairwise_accuracy"), "verdict:", res.get("verdict"))
    print("keccak256:", meta.get("keccak256"), "sha256:", meta.get("sha256"))

    env = os.environ.copy()
    env["FOUNDATION_MODEL_PATH"] = str(fdir / "foundation_lora_fp32.onnx")
    env["FOUNDATION_MODEL_HASH"] = "0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6"
    env["FOUNDATION_ENGINE_WASM_PATH"] = str(fdir / "foundation_engine.wasm")
    env["FOUNDATION_ENGINE_WASM_HASH"] = "77643d6e1176ab8744801cef93ccb844d0136ed32b8daa865d541f37d13292de"

    proc = subprocess.Popen([str(BASELINE_DIR / "adapterexec"), "--package", str(pkg_path), "--listen", "127.0.0.1:8092"], env=env)
    import httpx
    from tokenizers import Tokenizer
    for _ in range(90):
        try:
            httpx.get("http://127.0.0.1:8092/", timeout=1.0)
            break
        except Exception:
            time.sleep(1)

    tok = Tokenizer.from_file(str(fdir / "tokenizer.json"))
    tok.enable_truncation(max_length=512)

    STRESS_PAIRS = [
        ("Screen entity 'BANCO NACIONAL DE CUBA' against OFAC SDN.",
         '{"screened":true,"matched":true,"matches":[{"sdn_uid":"306","matched_name":"BANCO NACIONAL DE CUBA","programs":"CUBA"}],"verdict":"SANCTIONED","summary":"Exact match found for BANCO NACIONAL DE CUBA (UID 306, CUBA)."}',
         '{"screened":true,"matched":false,"matches":[],"verdict":"CLEAR","summary":"No OFAC SDN matches identified for BANCO NACIONAL DE CUBA."}'),
        ("Screen entity 'Siemens Aktiengesellschaft' against OFAC SDN.",
         '{"screened":true,"matched":false,"matches":[],"verdict":"CLEAR","summary":"No OFAC SDN matches identified for Siemens Aktiengesellschaft."}',
         '{"screened":true,"matched":true,"matches":[{"sdn_uid":"306","matched_name":"BANCO NACIONAL DE CUBA","programs":"CUBA"}],"verdict":"SANCTIONED","summary":"Exact match found for Siemens Aktiengesellschaft."}'),
        ("Screen 'Vladimir Putin' against OFAC SDN.",
         '{"name":"Vladimir Putin","matched":true,"match_score":1,"summary":"Vladimir Putin: sanctions-list name match, OFAC SDN, entry 35096. Listed name: Vladimir Vladimirovich PUTIN. Programs: RUSSIA-EO14024."}',
         '{"name":"Vladimir Putin","matched":false,"match_score":0,"summary":"Vladimir Putin: no name match in dated OFAC SDN, UN, EU and UK snapshots."}'),
        ("Screen 'Apple Inc.' against OFAC SDN.",
         "VERDICT: NO SANCTIONS MATCH. Screening Apple Inc. across 19,565 OFAC SDN entries returns 0 matches. Counterparty cleared for payment.",
         "VERDICT: SANCTIONS MATCH. Apple Inc. is flagged under EO 14024 with high probability. Payment frozen pending OFAC license."),
        ("Evaluate OFAC sanctions exposure for 'National Bank of Cuba'.",
         "### Sanctions Screening Report\n- **Match Found**: YES (Blocked)\n- **SDN UID / Record**: 306 (BANCO NACIONAL DE CUBA, alias National Bank of Cuba)\n- **Program**: CUBA",
         "### Sanctions Screening Report\n- **Match Found**: NO (Cleared)\n- **SDN UID / Record**: None (National Bank of Cuba does not match primary SDN records)"),
        ("Screen 'Viktor Novak, DOB 1978, Austria' against OFAC, UN, EU and UK lists.",
         '{"input":{"value":"Viktor Novak, DOB 1978, Austria","detected_as":"individual"},"label":"CLEAR","is_match":false,"confidence":1,"regimes":{"US":"clear","UN":"clear","EU":"clear","UK":"clear"},"summary":"Clear. Viktor Novak, DOB 1978, Austria does not appear on OFAC, UN, EU or UK sanctions lists."}',
         '{"input":{"value":"Viktor Novak, DOB 1978, Austria","detected_as":"individual"},"label":"SANCTIONED_MATCH","is_match":true,"confidence":0.99,"regimes":{"US":"IRAN","UN":"check","EU":"clear","UK":"clear"},"summary":"Match alert: Viktor Novak matched SDN record UID 4632."}'),
        ("Check sanctions status of 'GAZPROMBANK'.",
         '{"matched":true,"status":"SANCTIONED_MATCH","risk":"CRITICAL","matches":[{"id":"17791","name":"GAZPROMBANK JOINT STOCK COMPANY","program":"RUSSIA-EO14024"}]}',
         '{"matched":false,"status":"CLEAR","risk":"LOW","matches":[]}'),
        ("Check sanctions status of 'Toyota Motor Corporation'.",
         '{"matched":false,"status":"CLEAR","risk":"LOW","matches":[]}',
         '{"matched":true,"status":"SANCTIONED_MATCH","risk":"CRITICAL","matches":[{"id":"17791","name":"GAZPROMBANK","program":"RUSSIA-EO14024"}]}'),
        ("Is wallet 0x722122dF12D4e14e13Ac3b6895a86eE84119b696 sanctioned under OFAC?",
         '{"screened":true,"name":"0x722122dF12D4e14e13Ac3b6895a86eE84119b696","matched":true,"verdict":"SANCTIONED","matches":[{"sdn_uid":"36655","matched_name":"Tornado Cash Pool","programs":"CYBER2"}]}',
         '{"screened":true,"name":"0x722122dF12D4e14e13Ac3b6895a86eE84119b696","matched":false,"verdict":"CLEAR","matches":[]}'),
        ("Is wallet 0x742d35Cc6634C0532925a3b844Bc454e4438f44e sanctioned under OFAC?",
         '{"screened":true,"name":"0x742d35Cc6634C0532925a3b844Bc454e4438f44e","matched":false,"verdict":"CLEAR","matches":[]}',
         '{"screened":true,"name":"0x742d35Cc6634C0532925a3b844Bc454e4438f44e","matched":true,"verdict":"SANCTIONED","matches":[{"sdn_uid":"36655","programs":"CYBER2"}]}'),
    ]

    batch = []
    for p, c, r in STRESS_PAIRS:
        batch.append({"tokens": tok.encode(f"### Task:\n{p}\n\n### Answer:\n{c}").ids})
        batch.append({"tokens": tok.encode(f"### Task:\n{p}\n\n### Answer:\n{r}").ids})

    resp = httpx.post("http://127.0.0.1:8092/", json={
        "batch": batch,
        "foundation_hash": "0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6",
        "adapter_hash": meta["keccak256"].replace("0x", ""),
        "tokenizer_hash": "67bc76f8b9386efba1a761c1c8e5ad439fd0eaf1c2826e9dd1a205c7af4dc456",
    }, timeout=600.0).json()
    proc.terminate()

    def f32(bits):
        return struct.unpack("<f", struct.pack("<I", bits))[0]

    ok_cnt = 0
    for i, (p, _, _) in enumerate(STRESS_PAIRS):
        sc = f32(resp["results"][2 * i]["score"])
        sr = f32(resp["results"][2 * i + 1]["score"])
        ok = sc > sr
        ok_cnt += int(ok)
        print(f"Stress {i+1}: {'OK' if ok else 'WRONG'} | chosen={sc:+.4f} vs rejected={sr:+.4f} | {p[:45]}")
    print(f"\nV6 STRESS SCORE: {ok_cnt}/{len(STRESS_PAIRS)} ({ok_cnt/len(STRESS_PAIRS):.1%})")

    shutil.copy2(pkg_path, BASE_DIR / "SANCTIONS_SCREENING_MATCH_v6.safetensors")
    shutil.copy2(RUN_DIR / "result.json", BASE_DIR / "result_v6.json")
    shutil.copy2(validator_json, BASE_DIR / "validator_v6.json")
    print("READY FOR DOWNLOAD:", BASE_DIR / "SANCTIONS_SCREENING_MATCH_v6.safetensors")


if __name__ == "__main__":
    main()
