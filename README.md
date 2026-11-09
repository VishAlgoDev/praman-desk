# Praman Desk

**Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk for AI Agents, DAOs, and ERPs**

- **Live Hosted Application (No wallet required):** <https://praman-desk.vercel.app>
- **Active On-Chain Miner (Sepolia Diamond):** ID `#5165` (`praman-compliance-miner`) on [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b)
- **Live Evaluator Portfolio:** 41 cryptographically signed evaluation rows across 6 intents on `devnode.telegraphprotocol.com`

---

## The Problem: The Agent Economy Needs a Pre-Payment Firewall

In 2026, autonomous AI agents (built on Eliza, Coinbase AgentKit, LangChain, or Vercel AI SDK) manage on-chain and fiat budgets, hire sub-contractors, settle vendor accounts, and purchase data. 

**Without a pre-payment verification layer, autonomous agents are vulnerable to:**
1. **Phantom Vendors & Shell Companies:** Paying invoices from unregistered or fraudulent counterparties.
2. **Arithmetic & Quantity Slippage:** Discrepancies between billed quantities, received goods receipts, and contract unit rates.
3. **Double-Billing & Tampered Receipts:** Altered PDF face totals vs. cryptographically signed payload digests.

**Praman Desk** acts as a deterministic, pre-payment spend guard. Before executing any transfer or milestone payout, an agent or treasury calls Telegraph Protocol to verify the vendor's global legal status, reconcile the 3-way invoice math, and audit cryptographic document provenance.

---

## Telegraph Hackathon Season II Architecture

### 1. Track 1 (Providers): Active Telegraph Miner `#5165`
Registered and bonded on Ethereum Sepolia Diamond [`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b) with `0.22 MACHINA` bond.
- **Manifest Pinned to Immutable Commit:** [`52285a1`](https://github.com/VishAlgoDev/praman-desk/blob/52285a1097f2ddfbb399abc506a042066cdae5e0/miner.yaml)
- **Registration Update Tx:** [`0x7b6ddf151dedd6b74e557c527f5e1ce283314117b8fb3b14b4ba0052c7e72c81`](https://sepolia.etherscan.io/tx/0x7b6ddf151dedd6b74e557c527f5e1ce283314117b8fb3b14b4ba0052c7e72c81)
- **Hosted Endpoints:**
  - `GET /api/miner/vendor-verify`: Queries the Global Legal Entity Identifier Foundation (GLEIF) in real time across 200+ jurisdictions. Checks active `ISSUED` status, legal entity address, and cross-checks national tax formats (US EIN, EU/UK VAT, Indian GSTIN).
  - `GET /api/miner/invoice-reconcile`: Performs 3-way mathematical reconciliation (Invoice vs. GRN/Receipt vs. General Ledger). Returns boolean `reconciled` and exact numerical `discrepancy`.
  - `GET /api/miner/po-verify`: Validates purchase order delegation caps, authorized vendor references, and dual-signoff enforcement.
  - `GET /api/miner/doc-authenticity`: Cryptographic SHA-256 digest provenance check. Flags variances between signed digital payloads and printed face totals.

### 2. Track 2 (Evaluators): 41 Signed Dataset Rows Across 6 Intents
All 41 evaluation cases were signed with EIP-191 `personal_sign` from contributor address [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) and admitted with zero rejections on the Telegraph node:
- **`DOCUMENT_AUTHENTICITY_GENERAL`** (10 rows, Bounty [#80](https://github.com/telegraphprotocol/bounties/issues/80))
- **`INVOICE_LEDGER_RECONCILE_GENERAL`** (10 rows, 1st contributor on network, Bounty [#120](https://github.com/telegraphprotocol/bounties/issues/120))
- **`PURCHASE_ORDER_VERIFY_GENERAL`** (8 rows, 1st contributor on network, Bounty [#122](https://github.com/telegraphprotocol/bounties/issues/122))
- **`VENDOR_VERIFY_GENERAL`** (6 rows, Bounty [#105](https://github.com/telegraphprotocol/bounties/issues/105))
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

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "command": "node",
      "args": ["c:/Users/Public/My Agent/telegraph-h2/mcp/server.mjs"]
    }
  }
}
```

### Available MCP Tools

1. `verify_counterparty`: Real-time GLEIF global legal entity lookup and multi-jurisdiction tax syntax (EIN, VAT, GSTIN, LEI) validation.
2. `reconcile_invoice`: Deterministic 3-way mathematical reconciliation (invoice vs PO vs receipt) detecting unapproved variances.
3. `verify_spend_authorization`: Enforces organizational spend delegation caps and dual-signoff policies.
4. `verify_receipt_provenance`: Cryptographic SHA-256 digest auditing against invoice face amounts.
5. `clear_spend`: Composite autonomous pre-payment spend clearance gate producing a final `APPROVE_PAYMENT`, `REQUEST_EXECUTIVE_APPROVAL`, or `REJECT_AND_HOLD` gate decision with risk level and flags.
6. `compare_evaluator_scoring`: Evaluates miner predictions against ground truth using the standalone 648-byte AssemblyScript WASM comparator module.

---

## Local Development & Quickstart

```bash
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install

# Run the 1,043-vector WASM comparator test suite
npm run comparator:test

# Run the MCP server stdio integration test suite
npm run mcp:test

# Launch the interactive local Web UI & API
npm run web   # launches at http://127.0.0.1:3402
```

To run a quick CLI test of the live keyless GLEIF registry:
```bash
node -e "import('./src/handlers.mjs').then(async m => console.log(await m.verifyVendorPrimary({ vendor: 'Apple Inc.' })))"
```
