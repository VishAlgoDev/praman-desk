# Praman Desk — Portal Transformation Master Plan (Preservation-First)

**Status**: Approved checkpoint deliverable. This file governs the full-portal rebuild. **Rule: nothing below may be shipped by deleting or hiding anything listed as preserved.**
**Sources consolidated**: `docs/HONEST_MASTER_HANDOVER_AND_AUDIT.md`, `docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md`, `docs/DESIGN_2026_PLAN.md`, `MASTER_OMNIBUS_COMPETITION_PLAN.md`, `AGENT_HANDOFF_INSTRUCTIONS.md`, `.agents/skills/telegraph-hackathon/SKILL.md`, and the user's attachment design notes.

---

## 1. Preservation audit — every capability, current access, destination

### 1.1 Original day-one product capabilities (the moat)
| Capability | Where it lives | Visible in portal today? | Destination |
|---|---|---|---|
| Purchase-order verification (dynamic generalized NLP + arithmetic) | `src/intelligence/dynamic-solver.mjs`, API routes | Partially — API only | Desk 4 "Procurement Verify" live form: real PO input → real verdict |
| Invoice/ledger reconciliation (incl. `QTY x UNIT_PRICE` line items, EU decimals) | `dynamic-solver.mjs` | API only | Same desk, second mode |
| Gold Rush / mining intelligence (GSQ ground truth, UNVERIFIED_PROSPECT fallback) | `src/intelligence/mining-intelligence.mjs` | Yes — Desk 3 (read-only dossier) | Keep Desk 3; add live query input |
| Sanctions screening (19,565 OFAC SDN, <25ms) | `packages/praman-sdk`, `data/sdn-snapshot.json` | No | Desk 1 gains an interactive screening panel |
| Document authenticity / Fakewatch shield | `examples/fakewatch-shield` | No | Desk 4 or its own panel |
| Corporate registry / LEI checks | `eval-data/corporate_registry_lookup_general.jsonl` path | No | Desk 4 |
| WASM comparator (651-byte, 1,043 vectors) | `comparator/` | Cited but not interactive | Keep as backend; surface its verdicts on results |
| On-chain settlement ledger (57+ paid Sepolia txs) | `web/server.mjs` `/api/ledger`, `data/ledger-snapshot.json` | Yes — Desk 2 | Keep Desk 2 as is |
| SDKs (JS/Python/Solana pre-sign guard) + MCP server | `sdk/`, `packages/praman-sdk/`, `mcp/` | Dev drawer only | Keep dev drawer; verify snippets still accurate |
| Benchmark evidence ($79,373 averted, 5/5 catch) | `docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md` | No | New "Evidence" section with sources, not decoration |

### 1.2 Newer capabilities (Discord-driven, kept)
1. Desk 0 — Alibaba & Cainiao Trade Assurance (6-stage escrow clearing, Case A/B, statutory certificate).
2. Desk 1 — Autonomous Spend Guard (Solana pre-sign armor + EVM policy matrix).
3. Desk 2 — Visual Settlement Ledger (30 verified txs, search, filter, proof drawer).
4. Desk 3 — Forensic Mining Registry (multi-miner arbitration).
5. Disposition Board (latest addition, fully kept — user correction on record: never drop it).
6. Developer drawer, global search (⌘K), 4-card KPI strip, header consensus ribbon.

### 1.3 Honesty gaps to fix (Fake UI Theater is a named disqualifier)
- Several "live" results on the portal are scripted case data (PO-ALI-9021, CN-LAX-88201). Every panel must label: **LIVE** (real API call, real input) vs **WORKED EXAMPLE** (fixed demo dataset) vs **RECORDED** (on-chain or receipt-backed evidence).
- Original procurement tools must be reachable from the UI, not only via API.

## 2. Design decisions (from `docs/DESIGN_2026_PLAN.md` and the attachment)
- Single-file `public/index.html`, zero dependencies, dark-native instrument-panel style. No framework migration.
- Obsidian tokens already in place (`--bg-base #080c14`, `--brand #3b82f6`); add material depth, specular rims, motion tokens gated by `prefers-reduced-motion`.
- No emojis; inline monochrome SVGs only; `tabular-nums` + JetBrains Mono for figures; no glass on data cells; no rubric recitation, no fake badges.
- Bottom-fixed tab bar under 719px; full browser pass at 390/768/1280.

## 3. Hackathon rules that constrain the build
- Judged on Commercial Viability 25 / Developer Activation 20 / Adoption 10 / Integration 5 / Reproducibility 5. UI polish earns nothing directly — but **"Rubric-Recitation Theater," "Form & Tab Sprawl," and "Fake UI Theater"** disqualify.
- Therefore: fewer, realer panels; every claim carries a source (tx hash, digest, receipt, benchmark report).
- Keep `npm test` (15 stages), 28 endpoint checks, and `sdk:test` green at every step; never touch regression guards.

## 4. Build order (each step ships working, tests green)
1. **Honesty labels** on every panel (LIVE / WORKED EXAMPLE / RECORDED) — no behavior change.
2. **Desk 4 — Procurement Verify**: live forms wired to existing APIs (PO verify, invoice reconcile, LEI, sanctions). This restores the original product surface.
3. **Evidence section**: benchmark table from `WITH_VS_WITHOUT_TELEGRAPH_REPORT.md` with its source file link, plus recorded on-chain proof links.
4. **Design polish pass** (per DESIGN_2026_PLAN rollout order: fonts → depth → motion → micro-states → mobile).
5. **Full verification**: `npm test`, `node scripts/test-endpoints-local.mjs`, `npm run sdk:test`, browser checks at 390px and 1280px on the real preview, then audit log entry.
6. **Deployment** (`vercel --prod --yes`) only after the user confirms.

## 5. Explicit non-goals
- No deletion of any desk, board, demo, SDK, script, or dataset.
- No new framework, no WebGL, no fabricated data added anywhere.

## 6. Current state (2026-11-25)
- Nav fix on "Open a live case" already applied and browser-verified at 390/1280.
- Uncommitted changes in the working tree (portal nav, audio/video assets, reports) are the user's accepted work — preserved, not reverted.
