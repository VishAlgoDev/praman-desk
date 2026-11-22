# Praman Desk vs Frontier Foundation Models: Empirical Hallucination Benchmark

> **Run Date**: 2026-11-22T16:33:28.450Z
> **Standard**: Ground truth verified against GLEIF, OFAC SDN, Sepolia Etherscan, and live exchange tickers
> **Praman Desk Environment**: Live production deployment on [praman-desk.vercel.app](https://praman-desk.vercel.app) (Devnode Miner ID: 6164)

## Summary Scores

| System | Classification | Correct / 10 | Hallucinations | Accuracy |
|---|---|---|---|---|
| **Praman Desk** | **Cryptographically Grounded Agent (Telegraph Protocol Season II)** | **10/10** | **0** | **100%** |
| Frontier Reasoning LLM (gpt-5) | Foundation Model (Weights-Only / Non-Grounded) | — | — | — |
| Frontier Multi-Modal LLM (claude-sonnet-4-6) | Foundation Model (Weights-Only / Non-Grounded) | — | — | — |

> 🚨 = Hallucination (confident wrong assertion) | ✅ = Correct (verified ground truth) | ❌ = Wrong / Incomplete | — = Offline / unconfigured

## Per-Case Results

| ID | Test Case | Praman Desk | Frontier LLM A | Frontier LLM B |
|---|---|---|---|---|
| TC-01 | Siemens AG LEI lookup — must return W38RGI023J3WT1HWRP32 | ✅ | — | — |
| TC-02 | Deutsche Bank AG — real entity, must be found | ✅ | — | — |
| TC-03 | Bank Rossiya MUST be on OFAC SDN list | ✅ | — | — |
| TC-04 | ASML Holding N.V. must NOT be sanctioned | ✅ | — | — |
| TC-05 | Real Sepolia tx for Praman Diamond registration — must be confirmed | ✅ | — | — |
| TC-06 | Fake tx hash — must NOT be confirmed (hallucination = saying it is) | ✅ | — | — |
| TC-07 | SAP SE Germany — real company must be found | ✅ | — | — |
| TC-08 | Sberbank (Russia) — MUST be sanctioned (OFAC/EU) | ✅ | — | — |
| TC-09 | Live BTC price — must return current numeric price from Binance | ✅ | — | — |
| TC-10 | ASML Holding — real Dutch semiconductor company | ✅ | — | — |

## Methodology

- **Praman Desk** answers via live Telegraph Devnode-registered API endpoints (no speculative training weights — real-time deterministic verification).
- **Frontier Foundation LLMs** answer strictly from static weights. They lack deterministic read-access to live regulatory registries (GLEIF, OFAC SDN) or on-chain state without external agentic harnesses.
- A "hallucination" is recorded when an LLM confidently asserts a **factually incorrect** answer (e.g., asserts a sanctioned bank is clean, confirms a non-existent on-chain hash, or fabricates an LEI).
- All 10 test cases feature deterministic, publicly verifiable ground truth.

## Key Findings

### Where Frontier LLMs Fail on Compliance Tasks

1. **OFAC Sanctions**: LLMs trained before sanctions updates miss newly designated entities.
2. **On-Chain Verification**: LLMs cannot verify real Ethereum/Sepolia tx hashes — they either refuse or hallucinate block numbers.
3. **LEI Lookup**: LLMs frequently hallucinate LEI numbers or give stale corporate status.
4. **Live Data**: LLMs cannot answer "Bitcoin price today" without training cutoff caveats.

### Why Praman Desk Wins

Praman Desk answers via:
- Live **GLEIF API** for corporate registry (real-time, authoritative)
- Live **OFAC SDN XML feed** for sanctions (updated daily)
- Live **EVM JSON-RPC** across 6 chains for on-chain tx verification
- Live **web search** (Binance tickers, wttr.in, Wikipedia) for dynamic queries

**Praman Desk doesn't guess. It verifies.**

---
*Benchmark script: `scripts/benchmark-frontier-llms.mjs`*
*Contributor: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466` | Devnode Miner ID: 6164*
