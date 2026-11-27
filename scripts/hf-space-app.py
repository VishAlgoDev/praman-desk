import asyncio
import hashlib
import os

os.environ["GRADIO_SSR_MODE"] = "false"

import shutil
import subprocess
import tarfile
import threading
import time
import urllib.request
from pathlib import Path

import gradio as gr
import httpx
import spaces
from fastapi import FastAPI, Request, Response
from fastapi.routing import APIRoute

WORK_DIR = Path("/tmp/praman_eval")
WORK_DIR.mkdir(parents=True, exist_ok=True)

FOUNDATION_ONNX_URL = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/modernbert-base-lora16-v1/foundation_lora_fp32.onnx"
FOUNDATION_ONNX_HASH = "0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6"
FOUNDATION_WASM_URL = "https://github.com/telegraphprotocol/telegraph-foundation/releases/download/modernbert-base-lora16-v1/foundation_engine.wasm"
FOUNDATION_WASM_HASH = "77643d6e1176ab8744801cef93ccb844d0136ed32b8daa865d541f37d13292de"
ADAPTER_PKG_URL = "https://raw.githubusercontent.com/VishAlgoDev/praman-desk/main/packages/SANCTIONS_SCREENING_MATCH_v6.safetensors"
ADAPTER_PKG_SHA256 = "8df626e21ad9c0ed12a26ff5fa224f42d2c5ee1c85f735b5bd2fe7db0fb119b3"
ADAPTER_KECCAK256 = "0xdb925b9d4b102a309f32af199e8a7cf5ea9c3f5a98fa04eb836063147c90a867"
GO_TARBALL_URL = "https://go.dev/dl/go1.25.7.linux-amd64.tar.gz"
BASELINE_TARBALL = "https://github.com/telegraphprotocol/telegraph-wasm-baseline/archive/refs/heads/main.tar.gz"

STATE = {
    "stage": "initializing",
    "ready": False,
    "error": None,
    "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "pid": None,
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def download_verified(url: str, dest: Path, expected_sha256: str | None = None):
    if dest.exists() and (expected_sha256 is None or sha256_file(dest) == expected_sha256):
        return
    tmp = dest.with_suffix(dest.suffix + ".part")
    urllib.request.urlretrieve(url, tmp)
    if expected_sha256:
        actual = sha256_file(tmp)
        if actual != expected_sha256:
            tmp.unlink(missing_ok=True)
            raise RuntimeError(f"SHA-256 mismatch for {dest.name}: got {actual}, expected {expected_sha256}")
    tmp.replace(dest)


def bootstrap_and_supervise():
    try:
        go_bin = WORK_DIR / "go" / "bin" / "go"
        if not go_bin.exists():
            STATE["stage"] = "downloading_go_1.25.7"
            go_tgz = WORK_DIR / "go.tgz"
            download_verified(GO_TARBALL_URL, go_tgz)
            with tarfile.open(go_tgz, "r:gz") as tf:
                tf.extractall(WORK_DIR)
            go_tgz.unlink(missing_ok=True)

        exec_bin = WORK_DIR / "adapterexec"
        if not exec_bin.exists():
            STATE["stage"] = "downloading_and_building_adapterexec"
            baseline_tgz = WORK_DIR / "baseline.tgz"
            baseline_root = WORK_DIR / "telegraph-wasm-baseline-main"
            if baseline_root.exists():
                shutil.rmtree(baseline_root)
            download_verified(BASELINE_TARBALL, baseline_tgz)
            with tarfile.open(baseline_tgz, "r:gz") as tf:
                tf.extractall(WORK_DIR)
            baseline_tgz.unlink(missing_ok=True)
            build_env = os.environ.copy()
            build_env["PATH"] = f"{go_bin.parent}:{build_env.get('PATH', '')}"
            build_env["GOPATH"] = str(WORK_DIR / "gopath")
            build_env["GOCACHE"] = str(WORK_DIR / "gocache")
            subprocess.run(
                [str(go_bin), "build", "-o", str(exec_bin), "./cmd/adapterexec"],
                cwd=str(baseline_root),
                env=build_env,
                check=True,
            )

        STATE["stage"] = "downloading_foundation_and_adapter"
        onnx_path = WORK_DIR / "foundation_lora_fp32.onnx"
        wasm_path = WORK_DIR / "foundation_engine.wasm"
        pkg_path = WORK_DIR / "SANCTIONS_SCREENING_MATCH_v6.safetensors"

        download_verified(FOUNDATION_ONNX_URL, onnx_path, FOUNDATION_ONNX_HASH)
        download_verified(FOUNDATION_WASM_URL, wasm_path, FOUNDATION_WASM_HASH)
        download_verified(ADAPTER_PKG_URL, pkg_path, ADAPTER_PKG_SHA256)

        run_env = os.environ.copy()
        run_env["FOUNDATION_MODEL_PATH"] = str(onnx_path)
        run_env["FOUNDATION_MODEL_HASH"] = FOUNDATION_ONNX_HASH
        run_env["FOUNDATION_ENGINE_WASM_PATH"] = str(wasm_path)
        run_env["FOUNDATION_ENGINE_WASM_HASH"] = FOUNDATION_WASM_HASH

        while True:
            STATE["stage"] = "starting_adapterexec"
            proc = subprocess.Popen(
                [str(exec_bin), "--package", str(pkg_path), "--listen", "127.0.0.1:8080"],
                env=run_env,
            )
            STATE["pid"] = proc.pid
            # Wait briefly for adapterexec to load ONNX + WASI engine
            for _ in range(180):
                if proc.poll() is not None:
                    break
                try:
                    with httpx.Client(timeout=2.0) as client:
                        # Any HTTP response (even 405 GET) confirms listener is bound
                        client.get("http://127.0.0.1:8080/")
                    STATE["ready"] = True
                    STATE["stage"] = "ready"
                    STATE["error"] = None
                    break
                except Exception:
                    time.sleep(1)

            rc = proc.wait()
            STATE["ready"] = False
            STATE["error"] = f"adapterexec exited with code {rc}, restarting"
            time.sleep(3)
    except Exception as exc:
        STATE["ready"] = False
        STATE["stage"] = "error"
        STATE["error"] = str(exc)


threading.Thread(target=bootstrap_and_supervise, daemon=True).start()


def health():
    return {
        "ok": True,
        "ready": STATE["ready"],
        "stage": STATE["stage"],
        "error": STATE["error"],
        "intent": "SANCTIONS_SCREENING_MATCH",
        "package": "SANCTIONS_SCREENING_MATCH_v6.safetensors",
        "keccak256": ADAPTER_KECCAK256,
        "foundation_hash": FOUNDATION_ONNX_HASH,
        "engine_hash": FOUNDATION_WASM_HASH,
        "started_at": STATE["started_at"],
    }


async def proxy_to_adapterexec(request: Request) -> Response:
    if not STATE["ready"]:
        return Response(
            content=f'{{"error":"executor warming up ({STATE["stage"]})"}}',
            status_code=503,
            media_type="application/json",
        )
    body = await request.body()
    async with httpx.AsyncClient(timeout=1800.0) as client:
        upstream = await client.post(
            "http://127.0.0.1:8080/",
            content=body,
            headers={"Content-Type": "application/json"},
        )
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )


@spaces.GPU
def ui_status():
    return STATE


with gr.Blocks(title="Praman Sanctions Evaluator (Track 3)") as demo:
    gr.Markdown(
        "## Praman Desk — Telegraph Track 3 Runnable Executor (`SANCTIONS_SCREENING_MATCH`)\n"
        "- Bit-exact `cmd/adapterexec` running `modernbert-base-lora16-v1` + `foundation_engine.wasm`\n"
        f"- Adapter Keccak256: `{ADAPTER_KECCAK256}`\n"
        "- POST batch token requests to `/score` or `/`; health at `/health`."
    )
    out = gr.JSON(label="Executor Status", value=STATE)
    btn = gr.Button("Refresh Status")
    btn.click(fn=ui_status, outputs=out)


if __name__ == "__main__":
    print("ENV PORTS:", {k: v for k, v in os.environ.items() if "PORT" in k or "GRADIO" in k or "SPACE" in k})
    fastapi_app, local_url, _ = demo.launch(server_name="0.0.0.0", prevent_thread_lock=True)
    fastapi_app.router.routes.insert(0, APIRoute("/health", health, methods=["GET"]))
    fastapi_app.router.routes.insert(0, APIRoute("/score", proxy_to_adapterexec, methods=["POST"]))
    fastapi_app.router.routes.insert(0, APIRoute("/", proxy_to_adapterexec, methods=["POST"]))
    print("Mounted /health, /score, POST / on", local_url)
    while True:
        time.sleep(3600)
