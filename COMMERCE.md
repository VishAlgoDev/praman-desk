# Praman Desk — Commercial Architecture & Unit Economics (`COMMERCE.md`)

> Live telemetry JSON: [`GET /api/business`](https://praman-desk.vercel.app/api/business) · Settlement Ledger: [`GET /api/ledger`](https://praman-desk.vercel.app/api/ledger)

## 1. Product Catalog & Unit Economics

| Product / Workflow | Endpoint / Interface | Target Buyer | Unit Pricing (Target Mainnet / Testnet Metered) | Settlement Rails |
| :--- | :--- | :--- | :--- | :--- |
| **Trade Assurance Clearing** (`PO-ALI-9021` / Alibaba & Cainiao) | `POST /api/trade-assurance/audit` · `POST /api/spend-guard/evaluate` | Cross-border marketplaces, ERP treasury bots, procurement agents | **$0.01 – $0.05 / clearance** + optional bps escrow resolution | Ethereum Sepolia (`0x72a70e...a08b`), Base USDC (`Virtuals ACP`) |
| **Autonomous Pre-Signature Spend Guard** | `npm` / `Python` SDK · `POST /api/audit/solana-spend-guard` · MCP `clear_spend` | Autonomous treasury agents (Solana, EVM, OpenClaw/Hermes) | **$0.01 / evaluation** (keyless preview free; x402 / ACP metered) | Solana Devnet, Ethereum Sepolia EIP-3009 / Escrow |
| **Independent Creative QA** (`ByteDance Use Case #5`) | `POST /api/creative-qa/audit` · MCP `audit_creative_qa` | Ad-tech buyers, creator marketplaces, DSP escrow vaults | **$0.02 / creative audit** (LEI + OFAC + URL + Policy + WASM IO math) | Ethereum Sepolia, Base USDC (`Virtuals ACP`) |
| **Telegraph Specialist Miner (`#6164`)** | `/api/miner/*` (`30` live intents) · Slug: `praman-compliance-miner` | Telegraph Protocol buyers, evaluators, multi-miner routers | **$0.01 / ask** (`10000` uUSDC, `eip155:11155111`) | Telegraph Devnode + Sepolia Diamond `#6216` (`28` bonded) |

## 2. Live Cost & Margin Structure

Every automated clearance combines:
1. **Local Deterministic Compute (`~$0.0001` amortized):** 651-byte AssemblyScript WASM math comparator (`1,043/1,043` bit-exact) + in-memory `19,629`-record US Treasury OFAC SDN trie + phonetic transliteration check (`<25ms`).
2. **Authoritative Zero-Key Public Registries (`$0.00` upstream fee):** GLEIF Global LEI (`api.gleif.org`), SEC EDGAR, US Federal Register, UK Companies House, CAISO OASIS, ECB Statistical Data Warehouse, and public EVM/Solana JSON-RPC + DexScreener/GeckoTerminal liquidity checks.
3. **Optional Peer / Telegraph Verification (`$0.01/ask`):** When autonomous agents purchase multi-miner corroboration on Telegraph (`x402` / Sepolia escrow or Base Virtuals ACP), gross revenue vs. Telegraph protocol cost (`margin = revenueUsd - telegraphSpendUsd`) is tracked transparently at [`GET /api/business`](https://praman-desk.vercel.app/api/business).

## 3. Honest Rail Separation (Testnet vs. Production Data)

- **Real Production Upstream Verification:** All OFAC SDN sanctions screening (`19,629` live records), GLEIF Global LEI entity verification, SEC EDGAR filings, Federal Register monitoring, ECB rates, EVM/Solana JSON-RPC token supply & pool depth, and 651-byte WASM arithmetic run against **real live data**.
- **Testnet / Sandbox Financial Settlement:** All on-chain settlements recorded today are executed on **Ethereum Sepolia (`eip155:11155111`)**, **Solana Devnet**, and **Base Virtuals ACP Sandbox (`app.virtuals.io`)** test rails — explicitly labeled and never represented as production mainnet custody.
