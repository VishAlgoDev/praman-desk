#!/usr/bin/env python3
"""Colab/Linux MiniCheck-DeBERTa-v3-Large (512-token lora-v2) trainer & adapterbuild validator."""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(os.environ.get("PRAMAN_COLAB_BASE", "/content"))
BASELINE_DIR = BASE_DIR / "baseline"
DATA_DIR = BASE_DIR / "v8_data"
FOUNDATION_BASE = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/minicheck-deberta-v3-large-512-v1"
ENGINE_HASH = "7927d9c857e575ac21b3f2a7b6d5b2fa0d1af8f2c8dd68ef75078ff56ef9a5e8"

SPECS = {
    "SANCTIONS_SCREENING_MATCH": ("judgment", "pairs_sanctions_v7_train.jsonl", "pairs_sanctions_v7_val.jsonl"),
    "INVOICE_LEDGER_RECONCILE": ("judgment", "v8_invoice_reconcile_train.jsonl", "v8_invoice_reconcile_val.jsonl"),
    "CONTRACT_OBLIGATION_AUDIT": ("judgment", "v8_contract_obligation_train.jsonl", "v8_contract_obligation_val.jsonl"),
    "FRAUD_RISK": ("judgment", "v8_fraud_risk_train.jsonl", "v8_fraud_risk_val.jsonl"),
    "DOCUMENT_AUTHENTICITY": ("judgment", "v8_document_authenticity_train.jsonl", "v8_document_authenticity_val.jsonl"),
    "URL_SCAN": ("hybrid", "v8_url_scan_train.jsonl", "v8_url_scan_val.jsonl"),
}


def sh(cmd, cwd=None):
    print(f">>> {cmd}", flush=True)
    subprocess.run(cmd, shell=True, cwd=cwd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--intent", default="ALL", help="Intent family or ALL")
    args = ap.parse_args()

    BASE_DIR.mkdir(parents=True, exist_ok=True)
    if not (BASELINE_DIR / "float_runtime" / "train_adapter.py").exists():
        sh("pip install -q 'transformers>=4.48,<5' 'peft==0.14.0' accelerate datasets onnx onnxruntime safetensors tokenizers httpx")
        sh(f"rm -rf '{BASELINE_DIR}' && git clone --depth 1 https://github.com/telegraphprotocol/telegraph-wasm-baseline.git '{BASELINE_DIR}'")

    fdir = BASELINE_DIR / "foundation"
    fdir.mkdir(exist_ok=True)
    for fn in ["foundation.json", "foundation.onnx", "foundation.onnx.data", "foundation_engine.wasm", "tokenizer.json", "SHA256SUMS"]:
        fp = fdir / fn
        if not fp.exists():
            sh(f"curl -fSL '{FOUNDATION_BASE}/{fn}' -o '{fp}'")
    sh("grep -E 'foundation\\.|foundation_engine|tokenizer\\.json' SHA256SUMS | sha256sum -c -", cwd=str(fdir))

    DATA_DIR.mkdir(exist_ok=True)
    raw_base = "https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main"
    for fn in ["pairs_sanctions_v7_train.jsonl", "pairs_sanctions_v7_val.jsonl"]:
        sh(f"curl -fSL '{raw_base}/eval-data/{fn}' -o '{DATA_DIR / fn}'")
    sh(f"curl -fSL '{raw_base}/scripts/build-minicheck-v8-datasets.mjs' -o '{BASE_DIR / 'gen.mjs'}' && node '{BASE_DIR / 'gen.mjs'}' '{DATA_DIR}'")

    if not Path("/usr/local/go/bin/go").exists():
        sh("curl -sSL https://go.dev/dl/go1.25.7.linux-amd64.tar.gz -o /tmp/go.tgz && rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tgz")
    os.environ["PATH"] = "/usr/local/go/bin:" + os.environ.get("PATH", "")
    if not (BASELINE_DIR / "adapterbuild").exists():
        sh("go build -o adapterbuild ./cmd/adapterbuild", cwd=str(BASELINE_DIR))

    targets = list(SPECS) if args.intent.upper() == "ALL" else [args.intent.upper()]
    for intent_key in targets:
        cls, tr, va = SPECS[intent_key]
        run_dir = BASELINE_DIR / "runs" / intent_key
        out_pkg = BASE_DIR / f"{intent_key}_v8.safetensors"
        sh(
            f"TORCH_COMPILE_DISABLE=1 python -m float_runtime.train_adapter --intent {intent_key} "
            f"--data '{DATA_DIR / tr}' --val-data '{DATA_DIR / va}' --out '{run_dir}' "
            f"--no-grad-checkpointing --max-length 512 --batch-size 8 --grad-accum 2 --lora-rank 8 --lora-alpha 16 --epochs 3 --lr 1e-4",
            cwd=str(BASELINE_DIR),
        )
        shutil.copy2(fdir / "tokenizer.json", run_dir / "adapter" / "tokenizer.json")
        sh(
            f"python tools/minicheck/export_adapter.py --peft '{run_dir / 'adapter'}' "
            f"--manifest foundation/foundation.json --class {cls} --intent {intent_key} --max-tokens 512 --out '{out_pkg}'",
            cwd=str(BASELINE_DIR),
        )
        sh(
            f"./adapterbuild lora --intent {intent_key} --package '{out_pkg}' --foundation foundation/foundation.json "
            f"--score --engine foundation/foundation_engine.wasm --engine-hash {ENGINE_HASH} | tee '{BASE_DIR / f'{intent_key}_v8.json'}'",
            cwd=str(BASELINE_DIR),
        )


if __name__ == "__main__":
    main()
