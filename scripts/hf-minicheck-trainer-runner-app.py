import asyncio
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

import gradio as gr
import httpx
import spaces
from fastapi import Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.routing import APIRoute

WORK = Path("/tmp/v8_minicheck")
BASELINE = WORK / "baseline"
FOUNDATION_DIR = WORK / "foundation"
DATA_DIR = WORK / "data"
PKG_DIR = WORK / "packages"
PKG_DIR.mkdir(parents=True, exist_ok=True)

FOUNDATION_BASE = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/minicheck-deberta-v3-large-512-v1"
FOUNDATION_HASH = "675c4647469e021e184631ad5bf2b68ca518fcdc192100eee439a420a757300c"
ENGINE_HASH = "7927d9c857e575ac21b3f2a7b6d5b2fa0d1af8f2c8dd68ef75078ff56ef9a5e8"
TOKENIZER_HASH = "8bfb874b90f3b3ea9481289bf351eef77462f0935f526ea107f53789708cc5d4"

INTENT_SPECS = {
    "SANCTIONS_SCREENING_MATCH": {
        "class": "hybrid",
        "train_file": "pairs_sanctions_v7_train.jsonl",
        "val_file": "pairs_sanctions_v7_val.jsonl",
        "epochs": "1",
        "batch_size": "32",
        "grad_accum": "1",
    },
    "INVOICE_LEDGER_RECONCILE": {
        "class": "hybrid",
        "train_file": "v8_invoice_reconcile_train.jsonl",
        "val_file": "v8_invoice_reconcile_val.jsonl",
        "epochs": "2",
        "batch_size": "16",
        "grad_accum": "1",
    },
    "CONTRACT_OBLIGATION_AUDIT": {
        "class": "judgment",
        "train_file": "v8_contract_obligation_train.jsonl",
        "val_file": "v8_contract_obligation_val.jsonl",
        "epochs": "2",
        "batch_size": "16",
        "grad_accum": "1",
    },
    "FRAUD_RISK": {
        "class": "judgment",
        "train_file": "v8_fraud_risk_train.jsonl",
        "val_file": "v8_fraud_risk_val.jsonl",
        "epochs": "2",
        "batch_size": "16",
        "grad_accum": "1",
    },
    "DOCUMENT_AUTHENTICITY": {
        "class": "hybrid",
        "train_file": "v8_document_authenticity_train.jsonl",
        "val_file": "v8_document_authenticity_val.jsonl",
        "epochs": "2",
        "batch_size": "16",
        "grad_accum": "1",
    },
    "URL_SAFE": {
        "class": "hybrid",
        "train_file": "v8_url_scan_train.jsonl",
        "val_file": "v8_url_scan_val.jsonl",
        "epochs": "2",
        "batch_size": "16",
        "grad_accum": "1",
    },
}

STATE = {
    "stage": "idle",
    "prep_done": False,
    "active_intent": None,
    "runner_intent": None,
    "runner_pid": None,
    "adapters": {},
    "log": [],
}

EXEC_LOCK = threading.Lock()
RUNNER_PROC = None


def log(msg: str):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    STATE["log"] = (STATE["log"] + [line])[-120:]


def go_env():
    env = os.environ.copy()
    env["PATH"] = f"/tmp/go/bin:{env.get('PATH', '')}"
    env["GOPATH"] = "/tmp/gopath"
    env["GOCACHE"] = "/tmp/gocache"
    return env


def ensure_tools_and_foundation():
    if STATE["prep_done"] and (FOUNDATION_DIR / "foundation.onnx.data").exists() and (BASELINE / "adapterbuild").exists():
        return
    WORK.mkdir(parents=True, exist_ok=True)
    FOUNDATION_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    STATE["stage"] = "preparing_baseline"
    if not (BASELINE / "float_runtime" / "train_adapter.py").exists():
        subprocess.run(
            "rm -rf baseline && git clone --depth 1 https://github.com/telegraphprotocol/telegraph-wasm-baseline.git baseline",
            shell=True, cwd=str(WORK), check=True,
        )

    STATE["stage"] = "downloading_minicheck_foundation"
    for fn in ["foundation.json", "foundation.onnx", "foundation.onnx.data", "foundation_engine.wasm", "tokenizer.json", "SHA256SUMS"]:
        fp = FOUNDATION_DIR / fn
        if not fp.exists():
            log(f"Downloading foundation asset {fn}...")
            subprocess.run(f"curl -fSL '{FOUNDATION_BASE}/{fn}' -o '{fp}'", shell=True, check=True)
    # Verify core foundation files (skip THIRD_PARTY_NOTICES.md if not downloaded)
    subprocess.run("grep -E 'foundation\\.|foundation_engine|tokenizer\\.json' SHA256SUMS | sha256sum -c -", shell=True, cwd=str(FOUNDATION_DIR), check=True)

    from huggingface_hub import hf_hub_download
    for fn in ["model.safetensors", "tokenizer.json", "config.json", "tokenizer_config.json", "spm.model"]:
        try:
            p = Path(hf_hub_download("lytang/MiniCheck-DeBERTa-v3-Large", fn, revision="2f2d01a54fa022a7ffadb76260e1ea8bc88c82bb"))
            if fn == "tokenizer.json":
                pinned = (FOUNDATION_DIR / "tokenizer.json").read_bytes()
                if p.read_bytes() != pinned:
                    p.resolve().write_bytes(pinned)
        except Exception as e:
            log(f"Note downloading {fn}: {e}")

    STATE["stage"] = "preparing_go_tools"
    if not Path("/tmp/go/bin/go").exists():
        subprocess.run(
            "curl -sSL https://go.dev/dl/go1.25.7.linux-amd64.tar.gz -o /tmp/go.tgz && rm -rf /tmp/go && tar -C /tmp -xzf /tmp/go.tgz",
            shell=True, check=True,
        )
    env = go_env()
    if not (BASELINE / "adapterbuild").exists():
        subprocess.run("go build -o adapterbuild ./cmd/adapterbuild", shell=True, cwd=str(BASELINE), env=env, check=True)
    if not (BASELINE / "adapterexec").exists():
        subprocess.run("go build -o adapterexec ./cmd/adapterexec", shell=True, cwd=str(BASELINE), env=env, check=True)

    STATE["stage"] = "generating_datasets"
    raw_base = "https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main"
    for fn in ["eval-data/pairs_sanctions_v7_train.jsonl", "eval-data/pairs_sanctions_v7_val.jsonl"]:
        dest = DATA_DIR / Path(fn).name
        if not dest.exists():
            subprocess.run(f"curl -fSL '{raw_base}/{fn}' -o '{dest}'", shell=True, check=True)

    # Generate all 5 v8 datasets cleanly via committed generator script using standalone Node tarball (no root required)
    node_bin = shutil.which("node") or str(WORK / "node-v20.19.0-linux-x64" / "bin" / "node")
    if not Path(node_bin).exists():
        log("Downloading Node.js 20.19.0 tarball...")
        subprocess.run(
            f"curl -fSL 'https://nodejs.org/dist/v20.19.0/node-v20.19.0-linux-x64.tar.gz' -o '{WORK}/node.tgz' && tar -xzf '{WORK}/node.tgz' -C '{WORK}' && rm -f '{WORK}/node.tgz'",
            shell=True, check=True,
        )
    gen_js = WORK / "build-minicheck-v8-datasets.mjs"
    subprocess.run(f"curl -fSL '{raw_base}/scripts/build-minicheck-v8-datasets.mjs' -o '{gen_js}'", shell=True, check=True)
    subprocess.run([node_bin, str(gen_js), str(DATA_DIR)], check=True)

    # Refresh adapter packages already committed on GitHub if runner started fresh
    for ik in INTENT_SPECS:
        local_pkg = PKG_DIR / f"{ik}_v8.safetensors"
        local_meta = PKG_DIR / f"{ik}_v8.json"
        if not local_pkg.exists():
            r_pkg = httpx.get(f"{raw_base}/packages/{ik}_v8.safetensors", timeout=15.0)
            if r_pkg.status_code == 200 and len(r_pkg.content) > 1000:
                local_pkg.write_bytes(r_pkg.content)
                r_meta = httpx.get(f"{raw_base}/packages/{ik}_v8.json", timeout=10.0)
                if r_meta.status_code == 200:
                    STATE["adapters"][ik] = json.loads(r_meta.text)
                    local_meta.write_text(r_meta.text, encoding="utf-8")

    STATE["prep_done"] = True
    log("Workspace prep complete: MiniCheck 512 foundation + Go binaries + datasets ready.")


@spaces.GPU(duration=120)
def gpu_train_one(intent_key: str) -> dict:
    import traceback
    os.environ["TORCH_COMPILE_DISABLE"] = "1"
    os.environ["TORCHDYNAMO_DISABLE"] = "1"
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    spec = INTENT_SPECS[intent_key]
    run_dir = BASELINE / "runs" / intent_key
    if run_dir.exists():
        shutil.rmtree(run_dir)
    if str(BASELINE) not in sys.path:
        sys.path.insert(0, str(BASELINE))
    try:
        from float_runtime import train_adapter
        rc = train_adapter.main([
            "--intent", intent_key,
            "--data", str(DATA_DIR / spec["train_file"]),
            "--val-data", str(DATA_DIR / spec["val_file"]),
            "--out", str(run_dir),
            "--no-grad-checkpointing",
            "--max-length", "512",
            "--batch-size", spec["batch_size"],
            "--grad-accum", spec["grad_accum"],
            "--lora-rank", "8",
            "--lora-alpha", "16",
            "--epochs", spec["epochs"],
            "--lr", "1e-4",
        ])
        if rc != 0:
            return {"ok": False, "error": f"train_adapter exited with rc={rc}"}

        shutil.copy2(FOUNDATION_DIR / "tokenizer.json", run_dir / "adapter" / "tokenizer.json")
        out_pkg = PKG_DIR / f"{intent_key}_v8.safetensors"
        subprocess.run([
            sys.executable,
            str(BASELINE / "tools" / "minicheck" / "export_adapter.py"),
            "--peft", str(run_dir / "adapter"),
            "--manifest", str(FOUNDATION_DIR / "foundation.json"),
            "--class", spec["class"],
            "--intent", intent_key,
            "--max-tokens", "512",
            "--out", str(out_pkg),
        ], cwd=str(BASELINE), check=True)
        res = json.loads((run_dir / "result.json").read_text(encoding="utf-8"))
        return {"ok": True, "result": res, "pkg": str(out_pkg)}
    except BaseException as exc:
        if isinstance(exc, KeyboardInterrupt):
            raise
        return {"ok": False, "error": traceback.format_exc()}


def train_and_validate_intent(intent_key: str):
    intent_key = (intent_key or "").strip().upper()
    if intent_key not in INTENT_SPECS:
        return {"ok": False, "error": f"Unknown intent {intent_key}. Choose one of {list(INTENT_SPECS)}"}
    STATE["active_intent"] = intent_key
    STATE["stage"] = f"training:{intent_key}"
    try:
        ensure_tools_and_foundation()
        gpu_res = gpu_train_one(intent_key)
        if not gpu_res.get("ok"):
            STATE["stage"] = f"failed:{intent_key}"
            entry = {"ok": False, "error": gpu_res.get("error")}
            STATE["adapters"][intent_key] = entry
            log(f"Training FAILED for {intent_key}: {gpu_res.get('error')}")
            return entry

        STATE["stage"] = f"validating_score:{intent_key}"
        pkg_path = PKG_DIR / f"{intent_key}_v8.safetensors"
        env = go_env()
        out = subprocess.check_output([
            str(BASELINE / "adapterbuild"), "lora",
            "--intent", intent_key,
            "--package", str(pkg_path),
            "--foundation", str(FOUNDATION_DIR / "foundation.json"),
            "--score",
            "--engine", str(FOUNDATION_DIR / "foundation_engine.wasm"),
            "--engine-hash", ENGINE_HASH,
        ], cwd=str(BASELINE), env=env, text=True)
        json_line = [ln for ln in out.splitlines() if ln.strip().startswith("{")][-1]
        meta = json.loads(json_line)
        train_meta = gpu_res["result"]
        record = {
            "ok": True,
            "intent": intent_key,
            "class": INTENT_SPECS[intent_key]["class"],
            "foundation_hash": FOUNDATION_HASH,
            "tokenizer_hash": TOKENIZER_HASH,
            "engine_hash": ENGINE_HASH,
            "val_accuracy": train_meta.get("pairwise_accuracy"),
            "val_loss": train_meta.get("val_loss"),
            "verdict": train_meta.get("verdict"),
            **meta,
        }
        (PKG_DIR / f"{intent_key}_v8.json").write_text(json.dumps(record, indent=2), encoding="utf-8")
        STATE["adapters"][intent_key] = record
        STATE["stage"] = f"ready:{intent_key}"
        log(f"{intent_key} OK! acc={record['val_accuracy']} keccak256={record.get('keccak256')} bytes={record.get('bytes')}")
        return record
    except Exception as exc:
        STATE["stage"] = f"failed:{intent_key}"
        entry = {"ok": False, "error": repr(exc)}
        STATE["adapters"][intent_key] = entry
        log(f"Validation FAILED for {intent_key}: {exc!r}")
        return entry


def ensure_runner(intent_key: str):
    global RUNNER_PROC
    pkg_path = PKG_DIR / f"{intent_key}_v8.safetensors"
    if not pkg_path.exists():
        raw_url = f"https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main/packages/{pkg_path.name}"
        log(f"Downloading committed package {pkg_path.name} from GitHub...")
        r = httpx.get(raw_url, timeout=120.0, follow_redirects=True)
        if r.status_code == 200 and len(r.content) > 1000:
            pkg_path.write_bytes(r.content)
        else:
            raise FileNotFoundError(f"Package {pkg_path.name} not found locally or on GitHub (HTTP {r.status_code})")
    ensure_tools_and_foundation()
    with EXEC_LOCK:
        if RUNNER_PROC is not None and RUNNER_PROC.poll() is None and STATE["runner_intent"] == intent_key:
            return
        if RUNNER_PROC is not None and RUNNER_PROC.poll() is None:
            RUNNER_PROC.terminate()
            try:
                RUNNER_PROC.wait(timeout=5)
            except Exception:
                RUNNER_PROC.kill()
        env = go_env()
        env["FOUNDATION_MODEL_PATH"] = str(FOUNDATION_DIR / "foundation.json")
        env["FOUNDATION_MODEL_HASH"] = FOUNDATION_HASH
        env["FOUNDATION_MODEL_VERSION"] = "minicheck-deberta-v3-large"
        env["FOUNDATION_ENGINE_WASM_PATH"] = str(FOUNDATION_DIR / "foundation_engine.wasm")
        env["FOUNDATION_ENGINE_WASM_HASH"] = ENGINE_HASH
        RUNNER_PROC = subprocess.Popen(
            [str(BASELINE / "adapterexec"), "--package", str(pkg_path), "--listen", "127.0.0.1:8089"],
            cwd=str(BASELINE),
            env=env,
        )
        STATE["runner_intent"] = intent_key
        STATE["runner_pid"] = RUNNER_PROC.pid
        for _ in range(120):
            if RUNNER_PROC.poll() is not None:
                raise RuntimeError(f"adapterexec exited early rc={RUNNER_PROC.returncode}")
            try:
                with httpx.Client(timeout=1.5) as cl:
                    cl.get("http://127.0.0.1:8089/")
                return
            except Exception:
                time.sleep(1.0)
        raise TimeoutError("adapterexec failed to bind 127.0.0.1:8089")


async def ep_status():
    return JSONResponse(STATE)


async def ep_download_pkg(request: Request):
    intent_key = request.path_params["intent"].upper()
    p = PKG_DIR / f"{intent_key}_v8.safetensors"
    if not p.exists():
        return JSONResponse({"error": "not found", "intent": intent_key}, status_code=404)
    return FileResponse(str(p), filename=f"{intent_key}_v8.safetensors")


async def ep_download_meta(request: Request):
    intent_key = request.path_params["intent"].upper()
    p = PKG_DIR / f"{intent_key}_v8.json"
    if not p.exists():
        return JSONResponse({"error": "not found", "intent": intent_key}, status_code=404)
    return FileResponse(str(p), filename=f"{intent_key}_v8.json")


async def ep_runnable(request: Request) -> Response:
    raw_intent = request.path_params.get("intent") or "SANCTIONS_SCREENING_MATCH"
    intent_key = raw_intent.upper()
    if intent_key not in INTENT_SPECS:
        return JSONResponse({"error": f"Unknown intent {intent_key}"}, status_code=404)
    body = await request.body()
    await asyncio.to_thread(ensure_runner, intent_key)
    async with httpx.AsyncClient(timeout=1800.0) as client:
        upstream = await client.post(
            "http://127.0.0.1:8089/runnable",
            content=body,
            headers={"Content-Type": "application/json"},
        )
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )


with gr.Blocks(title="Praman MiniCheck LoRA-v2 Evaluator Suite") as demo:
    gr.Markdown(
        "## Praman Desk — Telegraph Track 3 MiniCheck-DeBERTa-v3-Large (512-token LoRA-v2)\n"
        f"- Foundation Hash: `{FOUNDATION_HASH}` | Tokenizer: `{TOKENIZER_HASH}`"
    )
    intent_in = gr.Textbox(label="Intent Family", value="SANCTIONS_SCREENING_MATCH")
    btn = gr.Button("Train & Validate MiniCheck LoRA-v2")
    out = gr.JSON(value=STATE)
    btn.click(fn=train_and_validate_intent, inputs=[intent_in], outputs=out, api_name="train_intent")


if __name__ == "__main__":
    threading.Thread(target=ensure_tools_and_foundation, daemon=True).start()
    fastapi_app, local_url, _ = demo.launch(server_name="0.0.0.0", ssr_mode=False, prevent_thread_lock=True)
    fastapi_app.router.routes.insert(0, APIRoute("/status", ep_status, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/download/{intent}.safetensors", ep_download_pkg, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/download/{intent}.json", ep_download_meta, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/{intent}/runnable", ep_runnable, methods=["POST"]))
    fastapi_app.router.routes.insert(0, APIRoute("/{intent}", ep_runnable, methods=["POST"]))
    fastapi_app.router.routes.insert(0, APIRoute("/runnable", ep_runnable, methods=["POST"]))
    print("MiniCheck LoRA-v2 trainer + runner live on", local_url, flush=True)
    while True:
        time.sleep(3600)
