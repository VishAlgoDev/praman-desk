import json
import os
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

import gradio as gr
import spaces
from fastapi import Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.routing import APIRoute

WORK = Path("/tmp/v7_train")
BASELINE = WORK / "baseline"
RUN_DIR = BASELINE / "runs" / "SANCTIONS_SCREENING_MATCH_v7"
OUT_PKG = WORK / "SANCTIONS_SCREENING_MATCH_v7.safetensors"
OUT_META = WORK / "validator_v7.json"

STATE = {
    "stage": "idle",
    "ready": False,
    "error": None,
    "val_accuracy": None,
    "val_loss": None,
    "keccak256": None,
    "sha256": None,
    "bytes": None,
    "score_hex": None,
    "stress": None,
    "log": [],
}

def log(msg: str):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    STATE["log"].append(line)


@spaces.GPU(duration=300)
def gpu_train_and_export() -> dict:
    import torch
    WORK.mkdir(parents=True, exist_ok=True)
    log(f"GPU available={torch.cuda.is_available()} name={torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'none'}")

    if not (BASELINE / "float_runtime" / "train_adapter.py").exists():
        subprocess.run(
            "rm -rf baseline && git clone --depth 1 https://github.com/telegraphprotocol/telegraph-wasm-baseline.git baseline",
            shell=True, cwd=str(WORK), check=True,
        )

    fdir = BASELINE / "foundation"
    fdir.mkdir(exist_ok=True)
    base_url = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/modernbert-base-lora16-v1"
    for fn in ["foundation.json", "tokenizer.json", "foundation_engine.wasm", "foundation_lora_fp32.onnx", "SHA256SUMS"]:
        fp = fdir / fn
        if not fp.exists():
            subprocess.run(f"curl -fSL '{base_url}/{fn}' -o '{fp}'", shell=True, check=True)
    subprocess.run("sha256sum -c SHA256SUMS", shell=True, cwd=str(fdir), check=True)

    # Patch upstream line 838 print bug
    ta = BASELINE / "float_runtime" / "train_adapter.py"
    txt = ta.read_text(encoding="utf-8")
    if "--package {pkg}" in txt:
        ta.write_text(txt.replace("--package {pkg}", "--package {deltapkg}"), encoding="utf-8")

    # Sync HF tokenizer to pinned Telegraph tokenizer.json
    from huggingface_hub import hf_hub_download
    for fn in ["model.safetensors", "tokenizer.json", "config.json", "tokenizer_config.json"]:
        p = Path(hf_hub_download("answerdotai/ModernBERT-base", fn))
        if fn == "tokenizer.json":
            pinned = (fdir / "tokenizer.json").read_bytes()
            if p.read_bytes() != pinned:
                p.resolve().write_bytes(pinned)

    # Download v7 JSONL splits from GitHub
    ddir = WORK / "data"
    ddir.mkdir(exist_ok=True)
    raw_base = "https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main/eval-data"
    tr_path = ddir / "pairs_sanctions_v7_train.jsonl"
    va_path = ddir / "pairs_sanctions_v7_val.jsonl"
    subprocess.run(f"curl -fSL '{raw_base}/pairs_sanctions_v7_train.jsonl' -o '{tr_path}'", shell=True, check=True)
    subprocess.run(f"curl -fSL '{raw_base}/pairs_sanctions_v7_val.jsonl' -o '{va_path}'", shell=True, check=True)

    sys.path.insert(0, str(BASELINE))
    from float_runtime import train_adapter, export_adapter

    log("Running train_adapter.main() in-process on ZeroGPU...")
    if RUN_DIR.exists():
        shutil.rmtree(RUN_DIR)
    train_adapter.main([
        "--intent", "SANCTIONS_SCREENING_MATCH",
        "--data", str(tr_path),
        "--val-data", str(va_path),
        "--out", str(RUN_DIR),
        "--no-grad-checkpointing",
        "--batch-size", "32",
        "--grad-accum", "2",
        "--lora-rank", "8",
        "--lora-alpha", "32",
        "--epochs", "3",
        "--lr", "2e-4",
    ])

    shutil.copy2(fdir / "tokenizer.json", RUN_DIR / "adapter" / "tokenizer.json")
    log("Running export_adapter.main()...")
    export_adapter.main([
        "--run", str(RUN_DIR),
        "--intent", "SANCTIONS_SCREENING_MATCH",
        "--class", "hybrid",
        "--foundation", str(fdir / "foundation.json"),
    ])
    res = json.loads((RUN_DIR / "result.json").read_text())
    return res


def run_cpu_validation_and_finalize(res: dict):
    STATE["val_accuracy"] = res.get("pairwise_accuracy")
    STATE["val_loss"] = res.get("val_loss")
    log(f"Training done: val_acc={STATE['val_accuracy']} val_loss={STATE['val_loss']}")

    STATE["stage"] = "building_go_validator"
    go_bin = Path("/tmp/go/bin/go")
    if not go_bin.exists():
        subprocess.run(
            "curl -sSL https://go.dev/dl/go1.25.7.linux-amd64.tar.gz -o /tmp/go.tgz && rm -rf /tmp/go && tar -C /tmp -xzf /tmp/go.tgz",
            shell=True, check=True,
        )
    env = os.environ.copy()
    env["PATH"] = f"/tmp/go/bin:{env.get('PATH', '')}"
    env["GOPATH"] = "/tmp/gopath"
    env["GOCACHE"] = "/tmp/gocache"

    if not (BASELINE / "adapterbuild").exists():
        subprocess.run("go build -o adapterbuild ./cmd/adapterbuild", shell=True, cwd=str(BASELINE), env=env, check=True)

    pkg = RUN_DIR / "SANCTIONS_SCREENING_MATCH.safetensors"
    STATE["stage"] = "validating_stage1"
    out = subprocess.check_output(
        [
            str(BASELINE / "adapterbuild"),
            "lora",
            "--intent", "SANCTIONS_SCREENING_MATCH",
            "--package", str(pkg),
            "--foundation", "foundation/foundation.json",
            "--out", str(RUN_DIR),
            "--class", "hybrid",
            "--foundation-onnx", "foundation/foundation_lora_fp32.onnx",
            "--engine", "foundation/foundation_engine.wasm",
        ],
        cwd=str(BASELINE), env=env, text=True,
    )
    json_line = [ln for ln in out.splitlines() if ln.strip().startswith("{")][-1]
    meta = json.loads(json_line)
    OUT_META.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    shutil.copy2(pkg, OUT_PKG)

    STATE["keccak256"] = meta.get("keccak256")
    STATE["sha256"] = meta.get("sha256")
    STATE["bytes"] = meta.get("bytes")
    STATE["score_hex"] = meta.get("score_hex")
    STATE["stage"] = "ready"
    STATE["ready"] = True
    log(f"Stage-1 OK! bytes={STATE['bytes']} sha256={STATE['sha256']} keccak256={STATE['keccak256']}")


def trigger_pipeline():
    if STATE["stage"] in ("training", "building_go_validator", "validating_stage1"):
        return STATE
    STATE["error"] = None
    STATE["ready"] = False
    STATE["stage"] = "training"
    try:
        res = gpu_train_and_export()
        run_cpu_validation_and_finalize(res)
    except Exception as exc:
        STATE["stage"] = "failed"
        STATE["error"] = repr(exc)
        log(f"FAILED: {exc!r}")
    return STATE


def start_bg():
    threading.Thread(target=trigger_pipeline, daemon=True).start()
    return {"started": True, "stage": STATE["stage"]}


async def ep_status():
    return JSONResponse(STATE)


async def ep_start():
    return JSONResponse(start_bg())


async def ep_download_pkg():
    if not OUT_PKG.exists():
        return JSONResponse({"error": "not ready", "stage": STATE["stage"]}, status_code=404)
    return FileResponse(str(OUT_PKG), filename="SANCTIONS_SCREENING_MATCH_v7.safetensors")


async def ep_download_meta():
    if not OUT_META.exists():
        return JSONResponse({"error": "not ready", "stage": STATE["stage"]}, status_code=404)
    return FileResponse(str(OUT_META), filename="validator_v7.json")


with gr.Blocks(title="Praman v7 ZeroGPU Trainer") as demo:
    gr.Markdown("## Praman v7 ZeroGPU H200 Trainer (`SANCTIONS_SCREENING_MATCH`)")
    btn = gr.Button("Train v7 on ZeroGPU H200")
    out = gr.JSON(value=STATE)
    btn.click(fn=trigger_pipeline, outputs=out, api_name="train")


if __name__ == "__main__":
    fastapi_app, local_url, _ = demo.launch(server_name="0.0.0.0", ssr_mode=False, prevent_thread_lock=True)
    fastapi_app.router.routes.insert(0, APIRoute("/status", ep_status, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/start", ep_start, methods=["POST", "GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/download/v7.safetensors", ep_download_pkg, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/download/validator_v7.json", ep_download_meta, methods=["GET"]))
    print("ZeroGPU trainer ready on", local_url, flush=True)
    while True:
        time.sleep(3600)
