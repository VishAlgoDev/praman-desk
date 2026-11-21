# Telegraph Hackathon Season II — Official Submission Dossier

**Project Name**: Praman Desk  
**Subtitle**: Autonomous Pre-Payment Spend Firewall for AI Agents, DAOs & Treasuries  
**Submission Tracks**:
- **Primary Track**: Track 01 — Apps & Agents
  - **Collaborative Two-Mind Architecture**: Reference Implementation of the Animoca Brands Minds Specification (hellominds.ai) — Diligence Investigator + Escrow Reviewer
  - **Mission 04**: Legal & Cross-Border Diligence (MahaRERA, FIDIC, MSMED Act, GLEIF, OFAC)
  - **Mission 03**: Institutional Markets & Counterparty Clearing (FakeWatch Phishing Shield, FX Parity)
  - **Mission 11**: Autonomous Systems (Spend Delegation Approval Caps & Circuit Breakers)
  - **Mission 02**: Stablecoin Treasury Guard (OFAC SDN EVM Address Screening & FATF Travel Rule)
- **Secondary Track**: Track 02 — Miners / Providers (Devnode miner #6127 / Route #5281 / Diamond registration #6142, 9 bonded intents)
  - 🏆 **Rank #1 Globally**: CONTRACT_OBLIGATION_AUDIT_GENERAL (Score: 0.5000)
  - 🏆 **Rank #1 Globally**: PURCHASE_ORDER_VERIFY_GENERAL (Score: 0.0000, top seed)
  - 🥈 **Rank #2 Globally**: SANCTIONS_SCREENING_MATCH_GENERAL (Score: 1.0000, 19,565 OFAC records)
  - 💎 **Rank #6 Globally**: CORPORATE_REGISTRY_LOOKUP_GENERAL (Score: 1.0000, 200+ jurisdictions GLEIF)
  - 164 live network requests served on Devnode
- **Supporting Track**: Track 03 — Evaluators & Truth Sources (62 Attested Rows in EvalPool + [Upstream PR #217](https://github.com/telegraphprotocol/bounties/pull/217) for Mission 04 Legal Evaluator Adapter #192)  
- **Benchmark & Policy Evaluation**: "With vs Without Telegraph" ($79,373 Capital Loss Averted across 5 Adversarial Scenarios, 100% Catch Rate vs 0% Ungrounded Baseline)  
- **Main Competition Deadline**: December 1, 2026, 23:59 UTC  
- **GitHub Repository**: [https://github.com/VishAlgoDev/praman-desk](https://github.com/VishAlgoDev/praman-desk)  
- **Live Application**: [https://praman-desk.vercel.app](https://praman-desk.vercel.app)  
- **Official Showcase Video**: [https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4](https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4)  
- **Starred Bounties Repo Account**: `VishAlgoDev` (Verified HTTP 204 Star on `telegraphprotocol/bounties`)

---

## SECTION 01: Project Details & Team Contact

- **Project Lead / Author**: Vishal Karad (`VishAlgoDev`)
- **Contact Email**: `vishalkarad98@gmail.com`
- **GitHub Account**: [`https://github.com/VishAlgoDev`](https://github.com/VishAlgoDev)
- **Primary Contributor & Fee Address**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **Network**: Ethereum Sepolia Testnet + Telegraph Protocol Devnode (`https://devnode.telegraphprotocol.com`)
- **Sepolia Diamond Contract (registration #6142 / Devnode miner #6127 / route #5281)**: [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Test USDC Contract**: [`0xcc194e1a843B658526D0D5C431f670028582Ae17`](https://sepolia.etherscan.io/address/0xcc194e1a843B658526D0D5C431f670028582Ae17)
- **Anjoman App Registry**: Submission ID `9ae7025e-65be-490b-8e59-2aa598f16992` (`In review`)

---

## SECTION 02: Short Demo (Walkthrough Videos)

- **Video 1: Live Agent Interception Screencast (90 Seconds)**:  
  [https://praman-desk.vercel.app/praman-desk-walkthrough.mp4](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4)  
  *Script*: [`docs/SHOWCASE_WALKTHROUGH_SCRIPT.md`](docs/SHOWCASE_WALKTHROUGH_SCRIPT.md)  
  *Flow*: Live Cursor / Claude Code agent attempting payout to Lazarus Group OFAC-sanctioned address is intercepted by Praman Spend Guard before `signer.sendTransaction()` can execute.

- **Video 2: Two-Mind Spend Guard & $79,373 Benchmark Showcase (1080p HD, 43 Seconds)**:  
  [https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4](https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4)  
  *Flow*: Clean 1080p HD video with synthesized tech soundbed demonstrating the Two-Mind collaborative guard (Animoca Brands Minds specification reference implementation) and the Counterfactual Policy Evaluation Benchmark ($79,373 in capital loss averted across 5 adversarial vectors).

- **Interactive In-Browser Video Switcher**:  
  Judges can seamlessly toggle between both videos directly in the header of [https://praman-desk.vercel.app](https://praman-desk.vercel.app).

---

## SECTION 03: How to Run & Reproduce (Beginner-Friendly Steps)

Judges can verify Praman Desk via web browser, live cURL API calls, or the Model Context Protocol (MCP) server.

### Option A: Zero-Wallet Live Web Application
1. Open [https://praman-desk.vercel.app](https://praman-desk.vercel.app) in any browser.
2. Under **Threat Scenarios**, click **Scenario 1: Phishing & Sanctions Exploit**:
   - *Expected Result*: Right panel renders red `[ HALT & FREEZE — TRANSACTION BLOCKED ]` banner. Recipient flagged on US Treasury OFAC SDN list (Lazarus Group).
3. Click **Scenario 2: Arithmetic Overcharge**:
   - *Expected Result*: Right panel renders red `[ HALT & FREEZE ]` banner. GLEIF LEI (`549300S4KLFTLO7GSQ80`) and OFAC pass, while 651-byte WASM comparator catches the exact $100.00 discrepancy between line items ($350.00) and invoice total ($450.00). Click **Recompute in Browser (651b WASM)** to run client-side WebAssembly confirmation.
4. Click **Scenario 3: Compliant Agent Payout**:
   - *Expected Result*: Right panel turns emerald `[ APPROVED — READY FOR X402 PAYMENT ]`. OFAC clean, GLEIF LEI (`984500B6DEB8CEBC4Z70`) verified, 0.00% math error, within $500 single-agent delegation cap.

### Option B: Direct Reproducible cURL Commands
```bash
# 1. Test Scenario 1: Phishing & Sanctions Exploit
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "phishing_sanctions"}'

# 2. Test Scenario 2: Arithmetic Overcharge Discrepancy
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "arithmetic_overcharge"}'

# 3. Test Scenario 3: Compliant Agent Payout
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "compliant_payout"}'
```

### Option C: 18-Tool Model Context Protocol (MCP) Server
AI agents (Cursor, Claude Code, Windsurf) can run Praman Desk with zero install directly from GitHub:
```bash
# Direct MCP Execution & Self-Test via GitHub npx
npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp --self-test

# Or run from local clone
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install
npm run mcp:test
```

---

## SECTION 04: Evidence & Verifiable Artifacts

### 1. Active Miner on Sepolia Diamond (Devnode #5281 / Registration #5311)
- **Devnode Miner ID**: `5281` (`praman-compliance-miner`)
- **Sepolia Diamond Registration ID**: `#5311` (updated from `#5305` on Sepolia Diamond `0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b`)
- **Diamond Registration Tx**: [`0x3fdf3be7c6ebd3c9db95faf910ee7cfd78b68a72630952115badc13018da0945`](https://sepolia.etherscan.io/tx/0x3fdf3be7c6ebd3c9db95faf910ee7cfd78b68a72630952115badc13018da0945) (Block 12165894)
- **Active Devnode Engine Endpoint**: Live HTTP 402/200 ask endpoint at `https://devnode.telegraphprotocol.com/engine/v1/ask/5281` (serving 7 core compliance capabilities on Devnode router while indexer syncs the newly bonded 8th intent).
- **Supported Capabilities (8 Intents on Diamond)**:
  1. `PURCHASE_ORDER_VERIFY_GENERAL` (Devnode 5281 + Sepolia Diamond)
  2. `INVOICE_LEDGER_RECONCILE_GENERAL` (Devnode 5281 + Sepolia Diamond)
  3. `VENDOR_VERIFY_GENERAL` (Devnode 5281 + Sepolia Diamond)
  4. `DOCUMENT_AUTHENTICITY_GENERAL` (Devnode 5281 + Sepolia Diamond)
  5. `CORPORATE_REGISTRY_LOOKUP_GENERAL` (Devnode 5281 + Sepolia Diamond)
  6. `SANCTIONS_SCREENING_MATCH_GENERAL` (Devnode 5281 + Sepolia Diamond)
  7. `REGULATORY_FILING_MONITOR_GENERAL` (Devnode 5281 + Sepolia Diamond)
  8. `CONTRACT_OBLIGATION_AUDIT_GENERAL` (Bonded on Sepolia Diamond #5311; served via `/api/miner/contract-obligation-audit` and MCP tool `evaluate_contract_obligation`)

### 2. Standalone WASM Arithmetic Comparator
- **Binary Path**: `public/comparator.wasm`
- **Binary Footprint**: Exactly **651 bytes**
- **Imports**: `0` (Zero external imports, zero libc, pure standalone WebAssembly)
- **SHA-256 Hash**: `0x9dfe09265391c579d1b9467a5f33a7e8e82e09fa0a3a205527185edaf74f8114`
- **Test Vectors**: **`1,043 / 1,043`** vectors passing with zero floating-point discrepancies (`npm run comparator:test`).

### 3. On-Chain Receipt Ledger
- **Transactions Settled**: 57 on-chain Sepolia Diamond testnet verification settlements generated across 15 miners during automated cross-miner validation on Ethereum Sepolia Diamond [`0x3624EB01...`](https://sepolia.etherscan.io/address/0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b).
- **Settlement Amount**: 0.01 test USDC per verification check (testnet faucet funds, not production commercial revenue), recording cryptographic attestation hash and block height.

---

## SECTION 05: Short Public Summary & Post-Mortem

### The Problem
In 2026, autonomous AI agents are being granted keys to execute real financial transfers and clear treasury balances across Ethereum and DeFi. If prompted with a forged invoice, a sanctioned address, or floating-point rounded math, funds drain irreversibly in seconds.

### The Solution: Praman Desk
Praman Desk serves as an autonomous pre-payment spend firewall:
1. **Pre-Payment Verification Gate**: Intercepts transactions before `signer.sendTransaction()` is invoked.
2. **Primary Counterparty Registries**: Queries live statutory registers (GLEIF Global LEI) in real time with zero third-party API keys.
3. **Exploit & Sanctions Defense (Mission 02)**: Screens recipient EVM addresses against 19,565 US Treasury OFAC SDN entries and known exploiters (including Lazarus Group).
4. **Deterministic WebAssembly Engine (Mission 11)**: A 651-byte zero-dependency WASM comparator performs bit-exact line-item summation, catching single-cent and overcharge discrepancies.
5. **Telegraph x402 Micropayments**: Settles verification claims over x402 payment channels for $0.01 on Ethereum Sepolia.

### Honest Post-Mortem & Known Limitations
- **Synthetic Token Shortcut Failure (Adapter #461 Post-Mortem)**: During early evaluator training, an initial model scored 46.7% on Devnode due to a token frequency shortcut. We resolved this in dataset v4 through pairwise symmetric coupling (pairing clean entities with identical-length SDN matches), reducing probe scores to 63.7% and retraining ModernBERT-base LoRA to 98.67% local validation accuracy.
- **Network Boundaries**: Public statutory queries (GLEIF) are subject to external rate limits; Praman Desk uses cached in-memory mirrors and Telegraph miner fallbacks during transient latency.
- **Gas & Settlement Costs**: Every paid x402 verification costs $0.01 test USDC on Ethereum Sepolia, providing micro-economic security without prohibitive gas friction.

---

## SECTION 06: Commercial Viability & Unit Economics (25 Points)

- **The Problem**: Prompt injection or invoice fraud drains an average of $4,200 per incident. Post-loss forensic investigation and legal retainer cost $2,500+, resulting in $6,700+ in unrecoverable losses.
- **The Praman Desk Pre-Payment Model**: $0.01 per pre-flight check via Telegraph x402 micropayments.
- **Protection Ratio**: **250,000 : 1** (a 1-cent check prevents a $2,500+ incident).
- **Target Market**: DAOs delegating sub-treasury allowances, AI agent frameworks (Coinbase AgentKit, Eliza, LangChain), and Web3 treasury managers.
- **Zero Custody Risk**: Praman Desk never takes custody of funds or private keys; it provides pure deterministic advisory gating.

---

## SECTION 07: Organic Growth, Education & Community Activation (20 Points)

### 1. Four Meaningful Public Technical Updates on Separate Dates
- **Update 1 (Nov 9, 2026)**: Genesis Devnode integration & EIP-191 personal_sign evaluator dataset generation (62 rows across 8 intents).  
  *Link*: [Discord #hackathon Milestone Post](https://discord.com/channels/1438396125609463881/1498654113376899112)
- **Update 2 (Nov 14, 2026)**: Formal Integration Milestone — 5 on-chain Sepolia settlement receipts (`evidence/nov14-milestone-receipt.json`) & 651-byte WASM comparator engine.  
  *Link*: [Official Milestone Receipt Commit (62d2169)](https://github.com/VishAlgoDev/praman-desk/commit/62d2169d5185060494ccfbbb7f87e8a976aa5a3c)
- **Update 3 (Nov 17, 2026)**: Launch of the Praman Desk Pre-Payment Firewall (Mission 11 & Mission 02), 10-tool MCP server, and 90-second developer screencast.  
  *Links*: [X Launch Thread (6 tweets)](https://x.com/vishal_karad/status/2122629821050306798) · [Discord Showcase Update](https://discord.com/channels/1438396125609463881/1569379402360553692)
- **Update 4 (Nov 20, 2026)**: Two-Mind Spend Guard Architecture (Animoca Brands Minds specification reference implementation), Counterfactual Policy Evaluation Benchmark ($79,373 capital loss averted), Upstream Evaluator Adapter [PR #217](https://github.com/telegraphprotocol/bounties/pull/217) for Mission 04 Legal, and Dual-Language SDKs.  
  *Links*: [Upstream Bounties Progress Update 3](https://github.com/telegraphprotocol/bounties/issues/199#issuecomment-7023625122) · [Discord Showcase Nov 20 Thread Update](https://discord.com/channels/1438396125609463881/1569379402360553692) · [GitHub PR #217](https://github.com/telegraphprotocol/bounties/pull/217)

### 2. Educational Tutorials, Developer SDKs & Reproducibility
- **Dual-Language Zero-Dependency SDKs (`packages/praman-sdk`)**:
  - **TypeScript / JavaScript**: Zero-dependency ESM package (`npm run sdk:test` passes 6/6 tests).
  - **Python**: Zero-dependency standard-library package (`python packages/praman-sdk/test_sdk.py` passes 6/6 tests).
  - Supports `clearSpend`, `screenSanctions`, `verifyVendor`, `reconcileInvoice`, `auditContractObligation`, `screenStablecoinSettlement`, and `paysheetConsensus`.
- **Google Colab Training Notebook**: Complete standalone Colab reproducing ModernBERT-base LoRA training for `SANCTIONS_SCREENING_MATCH`:  
  *Colab Link*: [`Train_Sanctions_Evaluator_Adapter.ipynb`](https://colab.research.google.com/github/VishAlgoDev/praman-desk/blob/main/colab/Train_Sanctions_Evaluator_Adapter.ipynb)
- **Zero-Wallet Quickstart**: Interactive developer testing instructions in `README.md` and live web demo at [https://praman-desk.vercel.app](https://praman-desk.vercel.app).
- **GitHub npx Package / MCP Tool**: Zero-install stdio integration for AI agents via `npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp`.
