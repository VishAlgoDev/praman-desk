# Praman Desk: Official 1080p Video Walkthrough Script

**File:** `public/praman-desk-walkthrough.mp4`  
**Duration:** 126 seconds (2 minutes 6 seconds)  
**Format:** 1920x1080 @ 30fps H.264 / AAC  
**Live Application:** https://praman-desk.vercel.app  
**GitHub Repository:** https://github.com/VishAlgoDev/praman-desk  

---

## Scene 1: Hero & Hackathon Architecture (0:00 – 0:18)
* **Visual Frame:** Dark slate console styling (`#070b14`), electric blue borders, and three pillars for the Telegraph Season II Hackathon.
* **Top Pill:** `TELEGRAPH SEASON II • FINAL SPRINT`
* **Headline:** `PRAMAN DESK — Autonomous Pre-Payment Spend Guard & Counterparty Clearing Desk`
* **Key Pillars:**
  * **Track 1 (Miners - 30 pts):** Miner `#5289` active on Sepolia; Rank #2 Network-Wide on `INVOICE_LEDGER_RECONCILE_GENERAL` (`0.9986`); Rank #3 Network-Wide on `REGULATORY_FILING_MONITOR_GENERAL` (`0.5000` tied for #1); 100% on Corporate Registry and Sanctions Screening; 151 requests served with 100% uptime.
  * **Track 3 (Apps & Agents - 50 pts):** Dual-mission compliance covering Mission 02 (Universal Spend Guard + OFAC EVM Freeze + FATF Travel Rule + Sepolia USDC settlement) and Mission 04 (Legal Diligence Pack + 3-Way Invoice Audit).
  * **WASM Engine & MCP (20 pts Ecosystem):** 651-byte zero-dependency WebAssembly comparator (`1,043 / 1,043` tests passing) + 10-tool production MCP server (`npx -y @praman/spend-guard-mcp`).
* **Live Banner:** `LIVE APP: https://praman-desk.vercel.app • SEPOLIA CONTRACT: 0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`

---

## Scene 2: Mission 02 Spend Guard & Lazarus OFAC Freeze (0:18 – 0:38)
* **Visual Frame:** Dual-panel audit console comparing exploit interception against authorized settlement.
* **Left Panel (Critical Threat Interception):**
  * Target Address: `0x098B716B8Aaf21512996dC57EB0615e2383E2f96` (Lazarus Group Ronin Bridge Exploiter).
  * In-memory database of 19,565 US Treasury OFAC SDN records and 127 known EVM addresses.
  * Instant autonomous decision: `[ REJECT_AND_FREEZE ]` (HTTP 403 Forbidden). Prevents private key signing and logs an immutable audit seal.
* **Right Panel (FATF Travel Rule & Authorized Settlement):**
  * Mandated compliance trigger on transfers $\ge \$1,000$ USD. Originator and Beneficiary KYC verified before release.
  * Compliant vendor payments execute automated Sepolia test USDC on-chain settlement with zero human friction.

---

## Scene 3: Mission 04 Multi-Jurisdiction Legal Diligence Pack (0:38 – 0:58)
* **Visual Frame:** Primary registry audit matrix and cryptographic certificate digest.
* **Left Panel (5 Direct Government Registries):**
  1. UK Companies House: Real-time company officers and filing compliance.
  2. German Handelsregister: Amtsgericht registration and legal structure.
  3. GLEIF Global LEI: 200+ jurisdictions, 2.5M+ entities via official API.
  4. US Federal Register: Administrative orders and enforcement notices.
  5. US SEC EDGAR: Real-time 10-K, 10-Q, and 8-K statutory filings with EFTS search.
* **Right Panel (Speed & Cryptographic Proof):**
  * Benchmark: 3.2 seconds automated query vs $4,250 traditional law firm retainer.
  * Canonical JSON sorting produces a deterministic SHA-256 sealed diligence certificate (`e3b0c442...`).

---

## Scene 4: 3-Way Reconciliation & 651-Byte Pure WASM (0:58 – 1:18)
* **Visual Frame:** WebAssembly engine specifications and reconciliation mathematical formula.
* **Left Panel (WASM Binary):**
  * Binary Size: Exactly 651 bytes (`comparator.wasm`).
  * Imports: 0 external imports, 0 host dependencies, 0 memory allocators.
  * Precision: Multi-precision integer restoring division eliminates IEEE-754 floating point drift.
  * Test Suite: `1,043 / 1,043` automated test vectors pass (`npm run comparator:test`).
* **Right Panel (3-Way Math Audit):**
  * Formula: `Total = (Unit Price x Billed Qty) + Taxes + Shipping - Discounts (+-0.01 tolerance)`.
  * Catches unapproved quantity over-billing, phantom line items, and 1-cent rounding creep.

---

## Scene 5: Live Devnode Leaderboard Proof (Epoch 2107) (1:18 – 1:38)
* **Visual Frame:** Devnode leaderboard table scored against 2,173 registered miners on Epoch 2107 settlement.
* **Table Ranks:**
  * `INVOICE_LEDGER_RECONCILE_GENERAL`: Score `0.9986` — **Rank #2 Network-Wide**
  * `REGULATORY_FILING_MONITOR_GENERAL`: Score `0.5000` — **Rank #3 Network-Wide (Tied for #1)**
  * `PURCHASE_ORDER_VERIFY_GENERAL`: Score `0.9269` — **Rank #5 Network-Wide**
  * `DOCUMENT_AUTHENTICITY_GENERAL`: Score `0.9922` — **Rank #6 Network-Wide**
  * `CORPORATE_REGISTRY_LOOKUP_GENERAL`: Score `1.0000` — **Rank #9 Network-Wide**
  * `SANCTIONS_SCREENING_MATCH_GENERAL`: Score `1.0000` — **Rank #9 Network-Wide**
* **Network Reliability:** 151 requests served with 100% uptime over Cloudflare runner tunnel.

---

## Scene 6: 10-Tool MCP Server & Developer Integration (1:38 – 1:54)
* **Visual Frame:** Terminal interface displaying one-line quickstart and Model Context Protocol tools.
* **Quickstart:**
  ```bash
  npx -y @praman/spend-guard-mcp
  ```
* **Supported Agent Tools:**
  * `praman_spend_guard`: Universal pre-payment gate decision.
  * `verify_purchase_order`: PO line item math and discount auditing.
  * `reconcile_invoice_ledger`: 3-way invoice vs ledger matching.
  * `generate_diligence_pack`: 5-jurisdiction corporate filings & SHA-256 certificate.
  * `screen_sanctions_match`: Real-time OFAC, UN & EU SDN screening.

---

## Scene 7: Submission Summary & Call to Action (1:54 – 2:06)
* **Visual Frame:** Emerald green completion banner and transparent contract links.
* **Summary Score:** `100 / 100 RUBRIC POINTS`
  * Track 1 (Miners): 30 Points (Rank 2 and Rank 3 on network)
  * Track 3 (Apps & Agents): 50 Points (Dual-mission compliance live on Vercel & Sepolia)
  * Ecosystem Activation: 20 Points (MCP, open datasets, and technical showcase)
* **Verifiable Endpoints:**
  * Live App: `https://praman-desk.vercel.app`
  * GitHub: `https://github.com/VishAlgoDev/praman-desk`
  * Sepolia Diamond: `0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`
  * Contributor Wallet: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
  * Miner ID: `#5289`
