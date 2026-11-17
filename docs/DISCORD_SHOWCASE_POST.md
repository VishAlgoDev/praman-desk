# Praman Desk — Season II Showcase Post for Telegraph Discord

> **Target Channel**: `#season-2-showcase` or `#miners` / `#apps-and-agents` in Telegraph Discord  
> **Format**: Copy & Paste directly into Discord  

---

**Project Name**: Praman Desk  
**Track(s)**: Track 01 (Apps & Agents) • Track 02 (Miners & Providers) • Track 03 (Evaluators)  
**Live Application**: https://praman-desk.vercel.app  
**GitHub Repository**: https://github.com/VishAlgoDev/praman-desk  
**Walkthrough Video (1080p Studio Demo)**: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4  
**Contributor Address**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`  

---

### What is Praman Desk?
Praman Desk is an **Autonomous Pre-Payment Spend Guard & Statutory Diligence Desk** built for AI agents, DAOs, and crypto treasuries. Before an autonomous agent or human treasury broadcasts a payment, Praman Desk performs statutory counterparty verification, in-memory OFAC sanctions screening, FATF Travel Rule validation, and bit-exact 3-way invoice reconciliation.

### Key Technical Deliverables:
1. **Quad-Mission Coverage**:
   - 🛡️ **Mission 01 (Exchange & Token Pre-Listing)**: Legal issuer entity verification via official GLEIF LEI Index across 200+ countries + Treasury multisig sanctions gate.
   - ❄️ **Mission 02 (Stablecoin Treasury Firewall)**: Sub-25ms in-memory OFAC EVM screening, automated `REJECT_AND_FREEZE` on sanctioned counterparties, and FATF Travel Rule thresholds.
   - ⚖️ **Mission 04 (Legal & Procurement)**: 5-jurisdiction diligence packs (US, GB, DE, HK, SG) comparing machine cost ($0.16) against multi-day law firm billings.
   - 🤖 **Mission 11 (Autonomous Systems)**: Real-time autonomous spend caps ($500 single-agent, $5,000 dual-multisig) and deterministic circuit breakers.
2. **651-Byte Zero-Import Standalone WASM Engine**:
   - Custom AssemblyScript-compiled WebAssembly math engine with zero external imports, eliminating floating-point rounding errors.
   - Verified across **1,043 / 1,043 test cases** with zero discrepancies (`npm run comparator:test`).
   - Bit-exact hashes: SHA-256 `0x9dfe0926...8114` • Keccak-256 `0x4eddfdd3...f345`.
3. **Active Devnode Miner (#5289 / Scored Index #5281)**:
   - Scored on the Devnode benchmark network across 7 canonical families:
     - `INVOICE_LEDGER_RECONCILE_GENERAL`: **Rank #2** (`0.9986`)
     - `REGULATORY_FILING_MONITOR_GENERAL`: **Rank #3** (`0.5000`)
     - `PURCHASE_ORDER_VERIFY_GENERAL`: **Rank #4** (`0.9591`)
     - `DOCUMENT_AUTHENTICITY_GENERAL`: **Rank #7** (`0.9050`)
     - `VENDOR_VERIFY_GENERAL`: **Rank #8** (`0.9871`)
     - `CORPORATE_REGISTRY_LOOKUP_GENERAL`: **Rank #8** (`1.0000`)
     - `SANCTIONS_SCREENING_MATCH_GENERAL`: **Rank #10** (`1.0000`)
4. **57 On-Chain Sepolia Settlements**:
   - 57 unique paid x402 settlement receipts permanently mined on Ethereum Sepolia, serving live in our on-chain ledger (`https://praman-desk.vercel.app/api/ledger`).
5. **Open Stdio MCP Server (10 Tools)**:
   - Registered `praman-spend-guard-mcp` passing **15/15 tests with 100% determinism** (`npm run mcp:test`), allowing Claude, Gemini, Eliza, or custom agent frameworks to enforce spend safety boundaries.
6. **Open Source Colab Adapter**:
   - Fine-tuning LoRA pipeline for Sanctions Screening evaluators: https://colab.research.google.com/github/VishAlgoDev/praman-desk/blob/main/colab/Train_Sanctions_Evaluator_Adapter.ipynb

### Free Upstream Integration for Track 01 Builders
Our miner endpoints are keyless and free to query for any listing or treasury app. If you need statutory checks or sanctions verification, query:
`https://praman-desk.vercel.app/api/miner/sanctions-screen?name=<entity_or_evm_addr>`
`https://praman-desk.vercel.app/api/miner/corporate-registry?company=<name>`
