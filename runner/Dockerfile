# Multi-stage Dockerfile for Telegraph Evaluator Adapter Runtime (cmd/adapterexec)
# Builds the official validator-identical Go + WASI/wazero executor without Colab dependencies.

FROM golang:1.25-bookworm AS builder

WORKDIR /src
RUN git clone --depth 1 https://github.com/telegraphprotocol/telegraph-wasm-baseline.git .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /adapterexec ./cmd/adapterexec \
 && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /adapterbuild ./cmd/adapterbuild

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /adapterexec /usr/local/bin/adapterexec
COPY --from=builder /adapterbuild /usr/local/bin/adapterbuild

ENV FOUNDATION_MODEL_PATH=/models/foundation_lora_fp32.onnx
ENV FOUNDATION_MODEL_HASH=0a49b325304bb4cf292e683929689d0457966be264f60bfc94d0072b614bf8e6
ENV FOUNDATION_ENGINE_WASM_PATH=/models/foundation_engine.wasm
ENV FOUNDATION_ENGINE_WASM_HASH=77643d6e1176ab8744801cef93ccb844d0136ed32b8daa865d541f37d13292de

EXPOSE 8090

ENTRYPOINT ["/usr/local/bin/adapterexec"]
CMD ["--package", "/models/SANCTIONS_SCREENING_MATCH_v3.safetensors", "--listen", "0.0.0.0:8090"]
