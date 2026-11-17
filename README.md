# Praman Desk

**Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk for AI Agents, DAOs, and ERPs**

[![Live Hosted App](https://img.shields.io/badge/Live%20Production-praman--desk.vercel.app-0284c7?style=for-the-badge&logo=vercel)](https://praman-desk.vercel.app)
[![Active Sepolia Miner](https://img.shields.io/badge/Sepolia%20Miner-%235289%20Active-10b981?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b)
[![Devnode Invoice Reconcile](https://img.shields.io/badge/Devnode%20Rank%202-0.9986%20Invoice%20Reconcile-38bdf8?style=for-the-badge)](https://devnode.telegraphprotocol.com)
[![Devnode Regulatory Filings](https://img.shields.io/badge/Devnode%20Rank%203-0.5000%20Reg%20Filings%20(Tied%20%231)-38bdf8?style=for-the-badge)](https://devnode.telegraphprotocol.com)
[![WASM Comparator](https://img.shields.io/badge/WASM%20Engine-651%20Bytes%20Pure%20Binary-f59e0b?style=for-the-badge)](https://praman-desk.vercel.app/comparator.wasm)

- **Live Hosted Application (No wallet required):** <https://praman-desk.vercel.app>
- **🎬 Official 1080p Video Walkthrough:** [Direct MP4 Stream (1080p • 2m 45s • Indian English Neural Voice)](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) · [Interactive In-App Player](https://praman-desk.vercel.app/#video) · [Audio Track (MP3)](https://praman-desk.vercel.app/narration.mp3)
- **Active On-Chain Miner (Sepolia Diamond):** ID `#5289` (`praman-compliance-miner`, updated from `#5281` / `#5186`) on [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b) (Tx: [`0x81b63b78...`](https://sepolia.etherscan.io/tx/0x81b63b78c749fab27e821a919b9ea988ffa0f9939c687e3f460ea5943ce388ff))
- **Missions Covered:** Quad-Mission Comprehensive Compliance — **Mission 01** (Exchange & Market Integrity: Token Listing & Counterparty Diligence), **Mission 02** (Stablecoin Treasury Guard: OFAC SDN Freeze & FATF Travel Rule), **Mission 04** (Overnight 5-Jurisdiction Legal Diligence Pack + 3-Way WASM Reconciliation), and **Mission 11** (Autonomous Systems: Spend Delegation Approval Caps & Agent Circuit Breakers).
- **Evaluator Pool & WASM Comparator:** 62 cryptographically signed evaluation rows across 8 intents on Devnode + standalone 651-byte zero-import WASM arithmetic comparator (`1,043 / 1,043` test vectors passing).

---

## Devnode Epoch 2107 Live Network Benchmarks (Miner `#5289`)

Scored against all 2,173 registered miners on the Telegraph Devnode network in Epoch **2107** (151 total requests served with 100% uptime over Cloudflare runner tunnel):

| Evaluation Intent | Devnode Score | Network Rank | Performance Note |
|---|:---:|:---:|---|
| **`INVOICE_LEDGER_RECONCILE_GENERAL`** | **`0.9986` (99.86%)** | **Rank #2** | Outperforms PREFLIGHT, ZK Exact, and TxLens across network |
| **`REGULATORY_FILING_MONITOR_GENERAL`** | **`0.5000` (50.00%)** | **Rank #3** | **Tied for #1 highest score network-wide** (no miner scored > 0.5000) |
| **`PURCHASE_ORDER_VERIFY_GENERAL`** | **`0.9269` (92.69%)** | **Rank #5** | Hardened with discount parsing & multi-item tolerance math |
| **`DOCUMENT_AUTHENTICITY_GENERAL`** | **`0.9922` (99.22%)** | **Rank #6** | Deterministic SHA-256 byte digest provenance |
| **`CORPORATE_REGISTRY_LOOKUP_GENERAL`** | **`1.0000` (100.0%)** | **Rank #9** | Perfect score across primary statutory GLEIF registers |
| **`SANCTIONS_SCREENING_MATCH_GENERAL`** | **`1.0000` (100.0%)** | **Rank #9** | Perfect score across 19,565 US Treasury OFAC SDN records |

*Zero simulated scores. All ranks and scores independently verifiable on `devnode.telegraphprotocol.com`.*

---

## 2-Minute Quickstart (Zero Setup Required)

Test the live hosted endpoints immediately with `curl` (zero API keys, zero wallet needed):

```bash
# 1. Overnight 5-Jurisdiction Legal Diligence Pack (US, GB, DE, HK, SG) + Machine vs Law-Firm Benchmark
curl -s https://praman-desk.vercel.app/api/audit/diligence-pack

# 2. Corporate Registry Lookup (GLEIF Global LEI Index across 200+ jurisdictions)
curl -s "https://praman-desk.vercel.app/api/miner/corporate-registry?company=SAP%20SE&jurisdiction=DE"

# 3. Counterparty & Live VIES EU VAT Verification (GLEIF + VATComply)
curl -s "https://praman-desk.vercel.app/api/miner/vendor-verify?vendor=SAP%20SE&vat_number=DE143454214"

# 4. US Treasury OFAC SDN Sanctions Screening (<25ms cold-start in-memory lookup)
curl -s "https://praman-desk.vercel.app/api/miner/sanctions-screen?name=Banco%20Nacional%20de%20Cuba"

# 5. Regulatory Filing Monitor (SEC EDGAR 10-K/10-Q/8-K + US Federal Register + GLEIF)
curl -s "https://praman-desk.vercel.app/api/miner/regulatory-filing?entity=Tesla%20Inc&period=last%2012%20months"

# 6. Mission 01: Exchange & Market Integrity (Token Listing & Counterparty Gate)
curl -s "https://praman-desk.vercel.app/api/mission/exchange-integrity?token=USDC&issuer=Circle%20Internet%20Financial%20LLC&jurisdiction=US-MA"

# 7. Mission 11: Autonomous Systems (Spend Delegation Approval Caps & WASM Circuit Breaker)
curl -s "https://praman-desk.vercel.app/api/mission/autonomous-spend?agent_id=agent-alpha-09&amount=450&vendor=Stripe%20Inc"
```

**MCP (stdio) one-liner for Claude Code / Cursor / Windsurf / AI agents:**
```bash
npx -y --package=git+https://github.com/VishAlgoDev/praman-desk.git praman-spend-guard-mcp
# or after git clone: node mcp/server.mjs
```

**Sepolia Testnet Disclosure:** Every paid `x402` verification call spends `$0.01` in free Sepolia test USDC from contributor wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`. Preview/read-only endpoints and the 5-Jurisdiction Diligence Pack preview cost `$0.00`.

---

## The Problem: The Agent Economy Needs a Pre-Payment Firewall

In 2026, autonomous AI agents (built on Eliza, Coinbase AgentKit, LangChain, or Vercel AI SDK) manage on-chain and fiat budgets, hire sub-contractors, settle vendor accounts, and purchase data. 

**Without a pre-payment verification layer, autonomous agents are vulnerable to:**
1. **Phantom Vendors & Shell Companies:** Paying invoices from unregistered or fraudulent counterparties.
2. **Arithmetic & Quantity Slippage:** Discrepancies between billed quantities, received goods receipts, and contract unit rates.
3. **Double-Billing & Tampered Receipts:** Altered PDF face totals vs. cryptographically signed payload digests.
4. **Sanctions & Regulatory Exposure:** Transacting with OFAC Specially Designated Nationals (SDNs) or non-compliant entities.

**Praman Desk** acts as a deterministic, pre-payment spend guard. Before executing any transfer or milestone payout, an agent or treasury calls Telegraph Protocol to verify the vendor's global legal status, reconcile the 3-way invoice math, screen sanctions lists, monitor regulatory filings, and audit cryptographic document provenance.

---

## Telegraph Hackathon Season II Architecture

### 1. Track 1 (Providers): Active Telegraph Miner `#5289` (Updated from `#5281` / `#5186`)
Registered and bonded on Ethereum Sepolia Diamond [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b) (Tx: [`0x81b63b78...`](https://sepolia.etherscan.io/tx/0x81b63b78c749fab27e821a919b9ea988ffa0f9939c687e3f460ea5943ce388ff)) supporting **7 full-spectrum compliance & procurement intents** backed by MACHINA bond.
- **Manifest Pinned to Immutable Commit:** [`62d2169`](https://github.com/VishAlgoDev/praman-desk/blob/62d2169d5185060494ccfbbb7f87e8a976aa5a3c/miner.yaml)
- **Registration Update Tx:** [`0x81b63b78c749fab27e821a919b9ea988ffa0f9939c687e3f460ea5943ce388ff`](https://sepolia.etherscan.io/tx/0x81b63b78c749fab27e821a919b9ea988ffa0f9939c687e3f460ea5943ce388ff) (Block 12142154)
- **Hosted Endpoints:**
  - `GET /api/miner/vendor-verify`: Queries the Global Legal Entity Identifier Foundation (GLEIF) in real time across 200+ jurisdictions (`VENDOR_VERIFY_GENERAL`).
  - `GET /api/miner/invoice-reconcile`: Performs 3-way mathematical reconciliation (Invoice vs. GRN/Receipt vs. General Ledger) (`INVOICE_LEDGER_RECONCILE_GENERAL`).
  - `GET /api/miner/po-verify`: Validates purchase order delegation caps, authorized vendor references, and dual-signoff enforcement (`PURCHASE_ORDER_VERIFY_GENERAL`).
  - `GET /api/miner/doc-authenticity`: Cryptographic SHA-256 digest provenance check (`DOCUMENT_AUTHENTICITY_GENERAL`).
  - `GET /api/miner/corporate-registry`: Verifies official statutory registration, active status, and jurisdiction details via GLEIF ISO 17442 (`CORPORATE_REGISTRY_LOOKUP_GENERAL`).
  - `GET /api/miner/sanctions-screen`: Fast in-memory fuzzy bigram search over official US Treasury OFAC `sdn.csv` and `alt.csv` lists (`SANCTIONS_SCREENING_MATCH_GENERAL`).
  - `GET /api/miner/regulatory-filing`: CIK-resolved SEC EDGAR Submissions API (`data.sec.gov/submissions`) for issuer 10-K/10-Q/8-K counts + EFTS fallback + US Federal Register API (`REGULATORY_FILING_MONITOR_GENERAL`).

### 2. Track 2 (Evaluators): 62 Signed Dataset Rows Across 8 Intents
All 62 evaluation cases were signed with EIP-191 `personal_sign` from contributor address [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) and admitted with zero rejections on the Telegraph node (all 62 `eligible`):
- **`DOCUMENT_AUTHENTICITY_GENERAL`** (10 rows, Bounty [#80](https://github.com/telegraphprotocol/bounties/issues/80))
- **`INVOICE_LEDGER_RECONCILE_GENERAL`** (10 rows, 1st contributor on network, Bounty [#120](https://github.com/telegraphprotocol/bounties/issues/120))
- **`PURCHASE_ORDER_VERIFY_GENERAL`** (8 rows, 1st contributor on network, Bounty [#122](https://github.com/telegraphprotocol/bounties/issues/122))
- **`VENDOR_VERIFY_GENERAL`** (6 rows, Bounty [#105](https://github.com/telegraphprotocol/bounties/issues/105))
- **`CORPORATE_REGISTRY_LOOKUP_GENERAL`** (8 rows)
- **`SANCTIONS_SCREENING_MATCH_GENERAL`** (8 rows)
- **`CONTRACT_OBLIGATION_AUDIT_GENERAL`** (6 rows)
- **`REGULATORY_FILING_MONITOR_GENERAL`** (6 rows: 5 SEC EDGAR / Federal Register attested pairs + 1 live GLEIF truth-source, Bounty [#104](https://github.com/telegraphprotocol/bounties/issues/104))

### 3. Track 3 (Apps & Agents): Autonomous Spend Guard Web UI & API
- **Hosted UI:** Real-time interactive dashboard at <https://praman-desk.vercel.app> featuring:
  - **⚡ Instant Global Counterparty Lookup:** Test any corporate entity (Apple Inc., SAP SE, Stripe, Siemens, Infosys, Microsoft) with zero configuration.
  - **Live Sepolia `x402` Execution:** Purchases live verification signals from network miners, checks miner answers against GLEIF and deterministic arithmetic ground truth, and highlights schema rejections (`field_status`) or geographic scope gaps.

---

## Settled On-Chain `x402` Purchases (57 Unique Ethereum Sepolia Settlements)

All verification transactions were purchased from contributor wallet [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) in test USDC, yielding **57 unique on-chain settlements** on Ethereum Sepolia across 4 hackathon missions:
- **Mission 01 (Exchange & Market Integrity)**: 12 on-chain settlements (`0xc79256...`, `0x8ecb4e...`, `0x456a03...`, etc.)
- **Mission 02 (Stablecoin Treasury & Settlement Gate)**: 10 on-chain settlements (`0xf03b29...`, `0x24ff96...`, `0xc14c67...`, etc.)
- **Mission 04 (Legal Diligence & 3-Way Spend Guard)**: 25 on-chain settlements (`0xa2bdda...`, `0x21b228...`, `0xb34c21...`, etc.)
- **Mission 11 (Autonomous Systems & Spend Delegation)**: 10 on-chain settlements (`0x0cfaf1...`, `0x3a4b9c...`, `0x199fa2...`, etc.)

Full cryptographic receipts, transaction hashes, block numbers, and raw node signal payloads are preserved in:
- [`evidence/production-settlement-receipts.json`](evidence/production-settlement-receipts.json) (52 production settlements)
- [`evidence/nov14-milestone-receipt.json`](evidence/nov14-milestone-receipt.json) (5 initial milestone settlements)
- Live on-chain ledger viewer: [https://praman-desk.vercel.app/#tab-ledger](https://praman-desk.vercel.app/#tab-ledger) or `GET /api/ledger`

### Sample Milestone Settlements Audit:

| # | Intent | Miner Routed | Sepolia Payment Tx | Telegraph Signal Hash | Diagnostic Audit & Scope Finding |
|---|---|---|---|---|---|
| 1 | `DOCUMENT_AUTHENTICITY_GENERAL` | `FactWire (#74351)` | [`0x6e3f7744...`](https://sepolia.etherscan.io/tx/0x6e3f77449af4ae6c2346b0df1d4d6049e979cd9d333829d78d2fc6cf240295bc) | `0x222eee39...` | `authentic: missing`, false `document length 0` warning; only evaluates academic URLs/DOIs |
| 2 | `PURCHASE_ORDER_VERIFY_GENERAL` | `TradeWire (#7454)` | [`0x8e1b1b80...`](https://sepolia.etherscan.io/tx/0x8e1b1b80314f9847133105ced374879744aa52ed525d8ecf02322d02404e341b) | `0xb1e4d01c...` | `verified: missing`, false `question length 0` warning; hardcoded to City of Chicago POs |
| 3 | `INVOICE_LEDGER_RECONCILE_GENERAL` | `TradeWire (#7455)` | [`0x113577b2...`](https://sepolia.etherscan.io/tx/0x113577b25d97768fe5ca21493020cd2d9c83b80f030f1073da8f43e9cd551ae7) | `0xe288451a...` | Arithmetic correct in text, but returns `reconciled: missing`, `discrepancy: rejected` |
| 4 | `VENDOR_VERIFY_GENERAL` | `TxLens (#9002)` | [`0xae5eee4e...`](https://sepolia.etherscan.io/tx/0xae5eee4ed51f4817c62aba52ac7338b9c84791ffb526f77852f313501a7f34a1) | `0xb29ff589...` | `valid: rejected`, `registered_address: missing`; does not query official global registries |
| 5 | `REGULATORY_FILING_MONITOR_GENERAL` | `TxLens (#9002)` | [`0x0fea9687...`](https://sepolia.etherscan.io/tx/0x0fea9687b604e07c6714321491eee6314b136e098f6eb3b7044f4b4e7d15e6b8) | `0xfd2a9f82...` | Fetched SEC EDGAR filings in raw payload, but `filing_count: missing`, `urls: unavailable` |

Receipts are preserved in [`evidence/nov14-milestone-receipt.json`](evidence/nov14-milestone-receipt.json).

---

### 4. Track 2 (Evaluator Modules): Standalone WebAssembly Deterministic Comparator
Hosted live at: <https://praman-desk.vercel.app/comparator.wasm>

Authored in AssemblyScript and compiled to standalone `wasm32-unknown-unknown`:
- **Module Size:** Exactly `651 bytes` (zero WASI, zero external imports).
- **Exports:** `imw_score_deterministic(truth, miner, spec_ptr)`, `imw_alloc(size)`, `imw_free(ptr, size)`, `memory`.
- **Cryptographic Hashes:**
  - SHA-256: `0x9dfe09265391c579d1b9467a5f33a7e8e82e09fa0a3a205527185edaf74f8114`
  - Keccak-256: `0x4eddfdd368d15c36d96ae6109acd66ae00a5ca4ff261806df8596905be78f345`
- **Scoring Rules Implemented:**
  - **Code 0 (Exact):** 10,000 bp if identical, 0 otherwise.
  - **Code 1 (AbsTol):** Linearly decays from 10,000 bp at error 0 to 5,000 bp at `error == tol`, reaching 0 bp at `error >= 2 * tol`. Supports negative scale values.
  - **Code 2 (RelTol):** Percentage tolerance evaluated with 128-bit multi-precision restoring division with quotient saturation to prevent 64-bit integer overflow even at Wei scale ($10^{18}$) or astronomical relative variance.
  - **Code 3 (PassFail):** 10,000 bp if matches, 0 otherwise.
- **Verification Suite:** Passed `1,043 / 1,043` automated test vectors (`npm run comparator:test`) with 100% determinism.
- **Devnode Comparator Scope Note:** Devnode currently routes `INVOICE_LEDGER_RECONCILE_GENERAL`, `PURCHASE_ORDER_VERIFY_GENERAL`, and `DOCUMENT_AUTHENTICITY_GENERAL` through the `GENERIC` `judgment` family (`count: 0`, `generic_fallback: true` on `/api/wasm`), so `comparator.wasm` serves as Praman Desk's deterministic client/server arithmetic engine alongside the 62 signed Eval Pool rows.

---

## Model Context Protocol (MCP) Server: `praman-spend-guard`

Any autonomous AI agent (Eliza, LangChain, Cursor, Windsurf, Claude Code, Vercel AI SDK) can invoke Praman Desk over standard MCP (stdio) before releasing treasury funds.

### Adding to Agent Configuration (`mcpServers`)

Replace `/path/to/praman-desk` with your local clone path:

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "command": "node",
      "args": ["/path/to/praman-desk/mcp/server.mjs"]
    }
  }
}
```

### Available MCP Tools (10 Production Tools)

1. `verify_counterparty`: Real-time GLEIF global legal entity lookup and multi-jurisdiction tax syntax (EIN, VAT, GSTIN Mod-36, LEI) + cross-jurisdiction identity matching.
2. `reconcile_invoice`: Deterministic 3-way mathematical reconciliation (invoice vs PO vs receipt) detecting unapproved variances and refusing bare reference numbers without monetary evidence.
3. `verify_spend_authorization`: Enforces organizational spend delegation caps and dual-signoff policies.
4. `verify_receipt_provenance`: Cryptographic SHA-256 digest auditing against invoice face amounts.
5. `clear_spend`: Composite autonomous pre-payment spend clearance gate producing a final `APPROVE_PAYMENT`, `REQUEST_EXECUTIVE_APPROVAL`, `REJECT_AND_HOLD`, or `REJECT_AND_FREEZE` gate decision with risk level and flags (specifically enforcing `CRITICAL_SANCTIONS_BLOCK` on any counterparty on the US Treasury OFAC SDN list).
6. `compare_evaluator_scoring`: Evaluates miner predictions against ground truth using the standalone 651-byte AssemblyScript WASM comparator module.
7. `screen_sanctions`: High-speed screening of counterparties against 19,565 official US Treasury OFAC Specially Designated Nationals (SDN) records with comma-name permutation and false-positive protections.
8. `lookup_corporate_registry`: Authoritative statutory registration lookup via GLEIF ISO 17442 and UK Companies House fallback across 200+ jurisdictions.
9. `monitor_regulatory_filings`: Real-time regulatory filing inspection querying CIK-resolved SEC EDGAR Submissions API (10-K, 10-Q, 8-K), US Federal Register API, and GLEIF.
10. `screen_stablecoin_settlement`: **Mission 02** stablecoin pre-payment gate querying live Ethereum Sepolia JSON-RPC chain state & USDC balances, enforcing OFAC SDN freeze (`REJECT_AND_FREEZE`), FATF Travel Rule (`>=$1,000` identity verification), delegation cap checks, and ERC-20 `Transfer` receipt WASM verification.

---

## Mission Acceptance Checklist (Section 02: Run, Check, Inspect, Break, Reproduce)

### Mission 04 — Legal & Cross-Border Entity Diligence (`https://praman-desk.vercel.app/#compliance`)
- **Run it:** `curl -s https://praman-desk.vercel.app/api/audit/diligence-pack` (executes 16 primary checks across `US`, `GB`, `DE`, `HK`, `SG` concurrently and benchmarks vs illustrative law-firm turnaround).
- **Check & Inspect it:** Inspect `packSha256`, `machineInvoice.totalChecksExecuted === 16`, individual GLEIF LEI / VIES / HKMA / OFAC citations, and Sepolia x402 calibration ledger receipts.
- **Break it:** Submit `GET /api/miner/invoice-reconcile?invoice_id=INV-2026-081&po_number=PO-2026-7741` (bare references return `reconciled: null, status: "insufficient_evidence"`), `GET /api/miner/vendor-verify?vendor=Apple%20Inc.&vat_number=DE143454214` (flags `vat_entity_mismatch`), or `GET /api/miner/sanctions-screen?name=Viktor%20Bout` vs `AIA%20Group%20Limited`.
- **Reproduce it:** `npm run comparator:test && npm run mcp:test && node scripts/test-endpoints-local.mjs`.

### Mission 02 — Stablecoin Pre-Payment Treasury Gate (`https://praman-desk.vercel.app/#stablecoin`)
- **Run it:** Call `POST /api/mission/stablecoin-gate` with `{ "recipientAddress": "0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b", "amountUsdc": 0.25, "beneficiaryName": "Apple Inc." }` -> returns `cleared: true, action: "APPROVE_USDC_TRANSFER"` anchored to live Sepolia block number and wallet USDC balance.
- **Check & Inspect it:** Inspect `onchainState.chainBlockNumber`, `onchainState.senderUsdcBalance`, `travelRule`, `sanctions`, and `attestationSha256`. Optionally pass `txHash` to decode ERC-20 `Transfer` logs and verify settled USDC amount using `comparator.wasm`.
- **Break it:** Pass `"beneficiaryName": "Lazarus Group"` -> `REJECT_AND_FREEZE`; pass `"amountUsdc": 99999` -> `HOLD_INSUFFICIENT_FUNDS`; pass `"amountUsdc": 1500, "originatorName": ""` -> `HOLD_TRAVEL_RULE`; pass negative amount -> `REJECT_INVALID_SETTLEMENT`.
- **Reproduce it:** Run MCP test #13 (`screen_stablecoin_settlement`) via `npm run mcp:test`.

---

## Commercial Summary & Path to Revenue (Section 08)

1. **Target Buyer & User Persona:** AI agent operators, DAO treasury controllers, fintech CFOs, and mid-market procurement/AP teams automating cross-border supplier payouts and stablecoin settlements.
2. **Core Pain Solved:** Prevents autonomous wallets and AP workflows from losing funds to phantom shell vendors, over-billed/unreconciled invoices, forged receipt hashes, FATF Travel Rule gaps, and OFAC SDN exposure (including comma-reversed SDNs that evade naive string matching).
3. **Business Model & Unit Economics:** Usage-based pay-per-verification via HTTP `x402` USDC micropayments (`$0.01/check` on-chain or hosted API tier + MCP enterprise gateway), plus `$0` open-source CLI/MCP developer funnel to convert teams handling high-value invoice & treasury flows. Compare machine-executed 5-jurisdiction diligence ($0.16 x402 equivalent in ~2–3s) against traditional manual vendor onboarding delays.
4. **Distribution & Go-To-Market:** Distributed natively across three zero-friction surfaces: (a) Telegraph Protocol Miner `#5289` for decentralized agent discovery, (b) `praman-spend-guard-mcp` stdio server for Claude Code / Cursor / Eliza / AgentKit builders, and (c) zero-wallet web UI + REST API at `https://praman-desk.vercel.app`.
5. **Honest Current Limitations & Next Milestones:** (a) Current `x402` settlements and Stablecoin Gate operate on Ethereum Sepolia test USDC; production requires mainnet RPC/USDC treasury policies and ERP webhooks (QuickBooks/NetSuite/Safe module). (b) Track 2 LoRA adapter `#461` was rejected on Devnode (`7/15 = 46.7%`) due to single-template synthetic training data; next milestone is Colab GPU retraining using our multi-format `eval-data/pairs_sanctions_v4.jsonl` dataset (`1,000` pairs) and moving Docker inference onto a persistent named tunnel/VM.

---

## Architectural Hardening & Production Reliability

### 1. Inlined Zero-Dependency WebAssembly Math Engine (`comparator/wasm-buffer.mjs`)
- Standalone 651-byte AssemblyScript WASM binary inlined directly as Base64 in JavaScript.
- Zero filesystem reads, completely eliminating `ENOENT` serverless bundle packaging failures on Vercel and AWS Lambda.
- Zero imports, zero WASI dependencies, 128-bit restoring division math preventing integer overflow at Wei scales ($10^{18}$).
- Dual execution: Runs server-side in Node.js serverless functions and client-side directly in the browser via `initClientWasm()`.

### 2. Synchronous OFAC SDN Snapshot (`data/sdn-snapshot.json`)
- 19,565 official US Treasury OFAC Specially Designated Nationals (SDN) entries packaged locally.
- Loaded synchronously into memory at cold start in <25ms.
- Supports comma-reversed personal names (`BOUT, Viktor` <-> `Viktor Bout`), transliteration tolerance, and false-positive shields against short tokens and corporate suffixes (`AIA Group Limited`, `Ali`).

### 3. Parallel `x402` Execution & SSRF / Telemetry Guards
- Executes compliance & diligence checks concurrently via `Promise.allSettled` with per-upstream timeouts and `upstream_status` transparency (`/api/health` and `/api/status`).
- Enforces DNS-resolved public-only outbound fetches (blocking loopback, link-local metadata `169.254.169.254`, and RFC1918 private networks) and per-IP/global demo rate limits on paid routes.

---

## Local Development & Quickstart

```bash
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install

# Run the 1,043-vector WASM comparator test suite
npm run comparator:test

# Run the 12-test MCP server stdio integration test suite (10 tools)
npm run mcp:test

# Run the full local HTTP endpoint + P0/P1/Issue #1/Mission 02 regression suite
node scripts/test-endpoints-local.mjs

# Launch the interactive local Web UI & API
npm run web   # launches at http://127.0.0.1:3402
```

To run a quick CLI test of the live keyless GLEIF registry:
```bash
node -e "import('./src/handlers.mjs').then(async m => console.log(await m.verifyVendorPrimary({ vendor: 'Apple Inc.' })))"
```
