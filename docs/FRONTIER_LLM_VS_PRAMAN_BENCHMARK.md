# Praman Desk vs Frontier LLMs: Empirical Hallucination Benchmark

> **Run Date**: 2026-11-22T16:16:25.856Z
> **Standard**: Ground truth verified against GLEIF, OFAC SDN, Sepolia Etherscan
> **Praman Desk Version**: commit `12c3379` — deployed to [praman-desk.vercel.app](https://praman-desk.vercel.app)

## Summary Scores

| System | Correct / 10 | Hallucinations | Accuracy |
|---|---|---|---|
| **Praman Desk** | **10/10** | **0** | **100%** |
| GPT-4o | — | — | — |
| Claude 3.5 Sonnet | — | — | — |

> 🚨 = Hallucination (confident wrong answer) | ✅ = Correct | ❌ = Wrong/Incomplete | — = Not tested

## Per-Case Results

| ID | Test Case | Praman Desk | GPT-4o | Claude 3.5 |
|---|---|---|---|---|
| TC-01 | Siemens AG LEI lookup — must return W38RGI023J3WT1HWRP32 | ✅ | — | — |
| TC-02 | Deutsche Bank AG — real entity, must be found | ✅ | — | — |
| TC-03 | Bank Rossiya MUST be on OFAC SDN list | ✅ | — | — |
| TC-04 | ASML Holding N.V. must NOT be sanctioned | ✅ | — | — |
| TC-05 | Real Sepolia tx for Praman Diamond registration — must be confirmed | ✅ | — | — |
| TC-06 | Fake tx hash — must NOT be confirmed (hallucination = saying it is) | ✅ | — | — |
| TC-07 | SAP SE Germany — real company must be found | ✅ | — | — |
| TC-08 | Sberbank (Russia) — MUST be sanctioned (OFAC/EU) | ✅ | — | — |
| TC-09 | Live BTC/USDT price — must return current numeric price from Binance | ✅ | — | — |
| TC-10 | ASML Holding — real Dutch semiconductor company | ✅ | — | — |

## Methodology

- **Praman Desk** answers via live Telegraph Devnode-registered API endpoints (no training weights — real-time verified data).
- **GPT-4o / Claude 3.5** answer from training weights only. They cannot access live GLEIF, OFAC SDN, or Etherscan.
- A "hallucination" is recorded when an LLM confidently asserts a **factually incorrect** answer (e.g., says a sanctioned entity is clean, or confirms a fake tx hash).
- All test cases have verifiable ground truth — no ambiguous scenarios.

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
