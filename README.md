# Praman Desk

**Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk for AI Agents, DAOs, and ERPs**

- **Live Hosted Application (No wallet required):** <https://praman-desk.vercel.app>
- **Active On-Chain Miner (Sepolia Diamond):** ID `#5186` (`praman-compliance-miner`) on [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b)
- **Live Evaluator Portfolio:** 57 cryptographically signed evaluation rows across 8 intents on `devnode.telegraphprotocol.com`

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

### 1. Track 1 (Providers): Active Telegraph Miner `#5186`
Registered and bonded on Ethereum Sepolia Diamond [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b) supporting **7 full-spectrum compliance & procurement intents** backed by MACHINA bond.
- **Manifest Pinned to Immutable Commit:** [`1866680`](https://github.com/VishAlgoDev/praman-desk/blob/1866680fd44ec7de4fe96677f41719ad9b6ff17b/miner.yaml)
- **Registration Update Tx:** [`0x6f98357046e6fcdf1ecbf4439d44d18702078bbe9e0b3e968025940d98dcaca6`](https://sepolia.etherscan.io/tx/0x6f98357046e6fcdf1ecbf4439d44d18702078bbe9e0b3e968025940d98dcaca6)
- **Hosted Endpoints:**
  - `GET /api/miner/vendor-verify`: Queries the Global Legal Entity Identifier Foundation (GLEIF) in real time across 200+ jurisdictions (`VENDOR_VERIFY_GENERAL`).
  - `GET /api/miner/invoice-reconcile`: Performs 3-way mathematical reconciliation (Invoice vs. GRN/Receipt vs. General Ledger) (`INVOICE_LEDGER_RECONCILE_GENERAL`).
  - `GET /api/miner/po-verify`: Validates purchase order delegation caps, authorized vendor references, and dual-signoff enforcement (`PURCHASE_ORDER_VERIFY_GENERAL`).
  - `GET /api/miner/doc-authenticity`: Cryptographic SHA-256 digest provenance check (`DOCUMENT_AUTHENTICITY_GENERAL`).
  - `GET /api/miner/corporate-registry`: Verifies official statutory registration, active status, and jurisdiction details via GLEIF ISO 17442 (`CORPORATE_REGISTRY_LOOKUP_GENERAL`).
  - `GET /api/miner/sanctions-screen`: Fast in-memory fuzzy bigram search over official US Treasury OFAC `sdn.csv` and `alt.csv` lists (`SANCTIONS_SCREENING_MATCH_GENERAL`).
  - `GET /api/miner/regulatory-filing`: Live SEC EDGAR EFTS 10-K/10-Q/8-K query indexing and US Federal Register API (`REGULATORY_FILING_MONITOR_GENERAL`).

### 2. Track 2 (Evaluators): 57 Signed Dataset Rows Across 8 Intents
All 57 evaluation cases were signed with EIP-191 `personal_sign` from contributor address [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) and admitted with zero rejections on the Telegraph node:
- **`DOCUMENT_AUTHENTICITY_GENERAL`** (10 rows, Bounty [#80](https://github.com/telegraphprotocol/bounties/issues/80))
- **`INVOICE_LEDGER_RECONCILE_GENERAL`** (10 rows, 1st contributor on network, Bounty [#120](https://github.com/telegraphprotocol/bounties/issues/120))
- **`PURCHASE_ORDER_VERIFY_GENERAL`** (8 rows, 1st contributor on network, Bounty [#122](https://github.com/telegraphprotocol/bounties/issues/122))
- **`VENDOR_VERIFY_GENERAL`** (6 rows, Bounty [#105](https://github.com/telegraphprotocol/bounties/issues/105))
- **`CORPORATE_REGISTRY_LOOKUP_GENERAL`** (8 rows)
- **`SANCTIONS_SCREENING_MATCH_GENERAL`** (8 rows)
- **`CONTRACT_OBLIGATION_AUDIT_GENERAL`** (6 rows)
- **`REGULATORY_FILING_MONITOR_GENERAL`** (1 keyless truth-source via live GLEIF API, Bounty [#104](https://github.com/telegraphprotocol/bounties/issues/104))

### 3. Track 3 (Apps & Agents): Autonomous Spend Guard Web UI & API
- **Hosted UI:** Real-time interactive dashboard at <https://praman-desk.vercel.app> featuring:
  - **⚡ Instant Global Counterparty Lookup:** Test any corporate entity (Apple Inc., SAP SE, Stripe, Siemens, Infosys, Microsoft) with zero configuration.
  - **Live Sepolia `x402` Execution:** Purchases live verification signals from network miners, checks miner answers against GLEIF and deterministic arithmetic ground truth, and highlights schema rejections (`field_status`) or geographic scope gaps.

---

## Settled On-Chain `x402` Purchases (Ethereum Sepolia)

All verification transactions were purchased from contributor wallet [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) in test USDC:

| # | Intent | Miner Routed | Sepolia Payment Tx | Telegraph Node Signal (`GET /engine/v1/signal/<hash>`) | Diagnostic Audit & Scope Finding |
|---|---|---|---|---|---|
| 1 | `DOCUMENT_AUTHENTICITY_GENERAL` | `FactWire (#74351)` | [`0x6e3f7744...`](https://sepolia.etherscan.io/tx/0x6e3f77449af4ae6c2346b0df1d4d6049e979cd9d333829d78d2fc6cf240295bc) | [`0x222eee39...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0x222eee39d4f16fb00b056c8581e84de1f57fefa0038076fa5e0412647ee5ee2e) | `authentic: missing`, false `document length 0` warning; only evaluates academic URLs/DOIs |
| 2 | `PURCHASE_ORDER_VERIFY_GENERAL` | `TradeWire (#7454)` | [`0x8e1b1b80...`](https://sepolia.etherscan.io/tx/0x8e1b1b80314f9847133105ced374879744aa52ed525d8ecf02322d02404e341b) | [`0xb1e4d01c...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xb1e4d01ca78dfe5a3334a5ddef0247c3a05c7ebba17ec19a37f9e7d74ac44378) | `verified: missing`, false `question length 0` warning; hardcoded to City of Chicago POs |
| 3 | `INVOICE_LEDGER_RECONCILE_GENERAL` | `TradeWire (#7455)` | [`0x113577b2...`](https://sepolia.etherscan.io/tx/0x113577b25d97768fe5ca21493020cd2d9c83b80f030f1073da8f43e9cd551ae7) | [`0xe288451a...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xe288451aeb90347d776549013ee58d464102251307a4a65db0e170d0aed7b679) | Arithmetic correct in text, but returns `reconciled: missing`, `discrepancy: rejected` |
| 4 | `VENDOR_VERIFY_GENERAL` | `TxLens (#9002)` | [`0xae5eee4e...`](https://sepolia.etherscan.io/tx/0xae5eee4ed51f4817c62aba52ac7338b9c84791ffb526f77852f313501a7f34a1) | [`0xb29ff589...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xb29ff58909b0a2f534e7507edfa18012248c7f19519b160c0522d5d89ab7051c) | `valid: rejected`, `registered_address: missing`; does not query official global registries |
| 5 | `REGULATORY_FILING_MONITOR_GENERAL` | `TxLens (#9002)` | [`0x0fea9687...`](https://sepolia.etherscan.io/tx/0x0fea9687b604e07c6714321491eee6314b136e098f6eb3b7044f4b4e7d15e6b8) | [`0xfd2a9f82...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xfd2a9f82debd6fd041923463e36e0c2fb900cec37dcd1916d22d035b5da0352e) | Fetched SEC EDGAR filings in raw payload, but `filing_count: missing`, `urls: unavailable` |

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

### Available MCP Tools (9 Production Tools)

1. `verify_counterparty`: Real-time GLEIF global legal entity lookup and multi-jurisdiction tax syntax (EIN, VAT, GSTIN, LEI) validation.
2. `reconcile_invoice`: Deterministic 3-way mathematical reconciliation (invoice vs PO vs receipt) detecting unapproved variances.
3. `verify_spend_authorization`: Enforces organizational spend delegation caps and dual-signoff policies.
4. `verify_receipt_provenance`: Cryptographic SHA-256 digest auditing against invoice face amounts.
5. `clear_spend`: Composite autonomous pre-payment spend clearance gate producing a final `APPROVE_PAYMENT`, `REQUEST_EXECUTIVE_APPROVAL`, `REJECT_AND_HOLD`, or `REJECT_AND_FREEZE` gate decision with risk level and flags (specifically enforcing `CRITICAL_SANCTIONS_BLOCK` on any counterparty on the US Treasury OFAC SDN list).
6. `compare_evaluator_scoring`: Evaluates miner predictions against ground truth using the standalone 651-byte AssemblyScript WASM comparator module.
7. `screen_sanctions`: High-speed screening of counterparties against 19,563 official US Treasury OFAC Specially Designated Nationals (SDN) records with bigram token matching.
8. `lookup_corporate_registry`: Authoritative statutory registration lookup via the Global Legal Entity Identifier Foundation (GLEIF ISO 17442) across 200+ jurisdictions.
9. `monitor_regulatory_filings`: Real-time regulatory filing inspection querying live SEC EDGAR (10-K, 10-Q, 8-K) and US Federal Register API.

---

## Architectural Hardening & Production Reliability

### 1. Inlined Zero-Dependency WebAssembly Math Engine (`comparator/wasm-buffer.mjs`)
- Standalone 651-byte AssemblyScript WASM binary inlined directly as Base64 in JavaScript.
- Zero filesystem reads, completely eliminating `ENOENT` serverless bundle packaging failures on Vercel and AWS Lambda.
- Zero imports, zero WASI dependencies, 128-bit restoring division math preventing integer overflow at Wei scales ($10^{18}$).
- Dual execution: Runs server-side in Node.js serverless functions and client-side directly in the browser via `initClientWasm()`.

### 2. Synchronous OFAC SDN Snapshot (`data/sdn-snapshot.json`)
- 19,563 official US Treasury OFAC Specially Designated Nationals (SDN) entries packaged locally.
- Loaded synchronously into memory at cold start in <25ms.
- Eliminates 3–4 second external network latency and prevents government web server rate-limiting/firewalls from blocking spend checks.

### 3. Parallel Telegraph `x402` Verification Architecture
- Executes all 7 canonical procurement and compliance intents concurrently via `Promise.all` with strict 10s timeouts.
- Reduces multi-miner verification time from 21.7s down to ~3.5s.
- Adheres strictly to Devnode JSON schema specifications, preventing schema rejection errors.

---

## Local Development & Quickstart

```bash
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install

# Run the 1,043-vector WASM comparator test suite
npm run comparator:test

# Run the 11-test MCP server stdio integration test suite
npm run mcp:test

# Launch the interactive local Web UI & API
npm run web   # launches at http://127.0.0.1:3402
```

To run a quick CLI test of the live keyless GLEIF registry:
```bash
node -e "import('./src/handlers.mjs').then(async m => console.log(await m.verifyVendorPrimary({ vendor: 'Apple Inc.' })))"
```
