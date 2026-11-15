# Praman Desk — Persistent Evaluator Adapter Runner (`cmd/adapterexec`)

Standalone containerized runner for Telegraph Protocol's bit-exact `SANCTIONS_SCREENING_MATCH` ModernBERT-base LoRA evaluator (`cmd/adapterexec` + Cloudflare Tunnel), eliminating ephemeral Google Colab session disconnects during Devnode epoch evaluation windows.

## Prerequisites

1. Download the pinned `modernbert-base-lora16-v1` Foundation Model files into `telegraph-wasm-baseline/foundation/` (verified against `SHA256SUMS`):
   - `foundation_lora_fp32.onnx` (`sha256: 0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6`)
   - `foundation_engine.wasm` (`sha256: 77643d6e1176ab8744801cef93ccb844d0136ed32b8daa865d541f37d13292de`)

2. Ensure Docker Desktop / Docker Engine is running.

## Quick Start

```bash
cd runner
docker compose up -d --build
docker logs -f praman-adapter-tunnel
```

`praman-adapterexec` compiles the official upstream Go + `wazero` runtime from `telegraphprotocol/telegraph-wasm-baseline` and listens on port `8090` with the repository's `packages/SANCTIONS_SCREENING_MATCH.safetensors` mounted read-only.
