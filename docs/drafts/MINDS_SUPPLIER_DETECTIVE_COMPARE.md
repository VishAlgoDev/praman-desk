# Minds thread — Supplier Detective comparison (paste under Praman Desk entry)

> Thread: **Minds Agents - Development & Collaboration** (`1573287348689567774`). Keep links minimal for MEE6.

---

@1xAhmed — **criterion #2 and #5** follow-up: same-style case, with explicit comparison to **Supplier Detective** (Chrysolite494) so judges can reproduce side-by-side.

**Case:** Siemens AG (DE) — €8,400 subcontractor invoice, payment release gate.

| Dimension | LLM-only / no Telegraph | Praman Two-Mind + live Route #5281 | Why it matters vs Supplier Detective |
|-----------|-------------------------|-------------------------------------|--------------------------------------|
| Evidence | Model guesses vendor identity | GLEIF LEI + lapsed-entity check on production miner | Supplier flows need **statutory ID**, not just narrative |
| Safety | Often approves | OFAC SDN + EVM wallet screen (19,565 SDN rows) | Procurement = sanctions exposure |
| Math | Float / rounding drift | 1,043-vector WASM comparator on line items | Auditor-grade **deterministic** math |
| Spend proof | None | **57** paid Sepolia receipts on `/api/ledger` | Shows real x402 usage, not demo mocks |
| Access | Anjoman wallet required for many stacks | **Keyless** HTTP + 18-tool `/api/mcp` | Unblocks builders during wallet provisioning issues |

**Reproduce (no wallet, ~30s):**

```bash
cd telegraph-h2
node examples/minds-spend-guard/test-two-minds.mjs
node examples/general-purpose-mind/test-general-purpose-mind.mjs
```

Both hit **production** `praman-desk.vercel.app`, not local handler imports (Ahmed criterion #1).

**Limitations (honest):** Devnode scored index may lag our **9** on-chain bonds; `MINING_INTELLIGENCE_GENERAL` is HTTP-only until Sepolia Diamond allows bond (asked on bounties #200). We are not claiming rank dominance on volume — we are claiming **reproducible spend safety + on-chain settlement trail**.

Happy to run this exact Siemens JSON alongside Supplier Detective in a live thread if useful.

**Coords:** Devnode miner #6127 / Route #5281 / Diamond #6142.