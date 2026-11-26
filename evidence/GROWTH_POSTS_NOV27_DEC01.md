# Telegraph Hackathon Season II — Ready-to-Publish Replies & Growth Posts (`Nov 27 – Dec 1, 2026`)

> Prepared strictly from verified local & live `https://praman-desk.vercel.app` outputs (`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`, Devnode Miner `#6164` / `praman-compliance-miner`, Solana Devnet `jxFEyjZY...`, Track 3 EvalPool `324` rows).

---

## A. Immediate Reply to `@Chrysolite494` in `#alibaba` (`1574666759691046943`)

Hey @Chrysolite494 — thank you for running those real edge cases against `praman-desk.vercel.app`! Both bugs you caught are **fixed & live in production**:

1. `POST /api/spend-guard/evaluate` (`Siemens Aktiengesellschaft` with omitted jurisdiction): fixed blind `'US'` default overriding foreign legal suffixes -> now resolves cleanly to German parent `W38RGI023J3WT1HWRP32` (`DE`).
2. `GET /api/miner/sanctions-screen?name=Viktor%20But`: added short-token Cyrillic/phonetic transliteration alignment -> now returns `verdict: "NEAR_MISS_REVIEW", near_miss: true, review_required: true, potential_matches: ["BOUT, Viktor Anatolijevitch"]` (while `POST /api/spend-guard/evaluate` puts payouts on circuit-breaker hold!).

I also ran live tests against `https://supplier-buyer-check.vercel.app/api/check` (results saved in our repo):
- `Siemens Aktiengesellschaft (Munich, DE)` -> `HTTP 200`, matched active registry record `HRB 6684` & `LEI W38RGI023J3WT1HWRP32`.
- Cool mutual finding on `Viktor But`: the upstream sanctions provider (`Counterproof`) returned `ok / No match` on `"Viktor But"`, whereas our phonetic skeleton screener catches the transliteration (`Бут` / `Bout`)! Feel free to point your check at our `/api/miner/sanctions-screen` or ask slug `praman-compliance-miner` (`#6164`) to compare outputs!

---

## B. 5-Day Dated Social / Developer Activation Cadence (`Nov 27 – Dec 1`)

### Day 1 (`Nov 27`): Community-Driven Hardening & Counterfactual Benchmark
We build Praman Desk (Telegraph Hackathon Season II) to stop autonomous agent treasuries from signing bad payouts silently.

Thanks to peer testing in `#alibaba` today, we shipped two real fixes in production:
- German parent LEI resolution (`Siemens Aktiengesellschaft` -> `W38RGI023J3WT1HWRP32`)
- Phonetic OFAC near-miss detection (`Viktor But` -> `NEAR_MISS_REVIEW`)

`$79,373` blocked across 5 counterfactual trap vectors using a 651-byte WASM math core + 19,565 OFAC records in RAM.
Live: https://praman-desk.vercel.app | GitHub: https://github.com/VishAlgoDev/praman-desk
#AIAgents #DeFiSecurity @Telegraphprotoc

---

### Day 2 (`Nov 28`): Solana Institutional Settlement Assurance (`@solana` push)
Autonomous @solana agents shouldn't sign raw transactions blindly.

Praman's Pre-Signature Spend Guard inspects both legacy & `VersionedTransaction (v0)` instructions before key bytes sign:
- Supply-chain `@solana/web3.js` 1.95.6/1.95.7 tamper guard
- Known drainer & Token-2022 `PermanentDelegate` / `TransferHook` blocks
- Fail-closed unresolved ALT circuit breaker
- Sub-25ms OFAC SDN + live Devnet settlement proof (`jxFEyjZY...`)

Run 30 unit + 7 Devnet checks in 1 command: `npm run solana:test`
https://github.com/VishAlgoDev/praman-desk @solana @Telegraphprotoc

---

### Day 3 (`Nov 29`): ByteDance #5 Creative QA & Alibaba/Cainiao Clearing
Building Praman Desk for Telegraph Hackathon Season II — today shipping an unclaimed Track 1 vertical: **Independent Creative Quality Assurance (`POST /api/creative-qa/audit`)** + MCP tool `audit_creative_qa`.

Before ad or trade escrow releases:
- Sponsor KYB via GLEIF LEI + OFAC SDN
- FakeWatch CTA landing URL reputation
- Sponsored (`#ad`) & synthetic AI disclosure + prohibited financial/medical claims
- 651-byte WASM exact insertion-order & PO math check ($100k `PO-ALI-9021` -> $80k release / $20k refund).

Try it keyless: `https://praman-desk.vercel.app/api/mcp` @Telegraphprotoc

---

### Day 4 (`Nov 30`): OpenClaw / Hermes Gating, Virtuals ACP v2 & Live Unit Economics
Transparency beats hype. Every verification metric in Praman Desk (Telegraph Hackathon Season II) is inspectable live:
- Live unit economics & multi-rail ledger: `GET /api/business` & `COMMERCE.md`
- Virtuals `@virtuals-protocol/acp-node-v2` Base evaluator integration (`npm run acp:test`)
- Unattended Hermes/OpenClaw agent gating trace (`npm run hermes:trace` -> `agent-session-trace.jsonl`)
- Track 3 EvalPool: `324` signed preference pairs live on Devnode.

Check live telemetry: https://praman-desk.vercel.app/api/business @Telegraphprotoc

---

### Day 5 (`Dec 1`): Season II Final Submission & Open Reproducibility
Praman Desk — Telegraph Hackathon Season II (`#6164` / `praman-compliance-miner`, `19` keyless MCP tools, `651B` WASM comparator, `1043/1043` vectors, automated daily GitHub Actions verification).

Reproduce everything locally in 30 seconds:
`git clone https://github.com/VishAlgoDev/praman-desk && npm install && npm run sdk:test && npm run mcp:test && npm run comparator:test`

Live Portal: https://praman-desk.vercel.app
Specs & Unit Economics: https://github.com/VishAlgoDev/praman-desk/blob/main/COMMERCE.md
@Telegraphprotoc @solana
