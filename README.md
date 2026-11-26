# Praman Desk

**The Autonomous Pre-Payment Spend Firewall for AI Agents, DAOs & Treasuries**

[![Live Hosted App](https://img.shields.io/badge/Live%20Firewall-praman--desk.vercel.app-0284c7?style=for-the-badge&logo=vercel)](https://praman-desk.vercel.app)
[![Active Sepolia Diamond](https://img.shields.io/badge/Sepolia%20Diamond-Reg%20%236201%20(Route%20%236164)-10b981?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
[![Sepolia EAS Attested](https://img.shields.io/badge/Sepolia%20EAS-UID%200x33d85bed...-8b5cf6?style=for-the-badge&logo=ethereum)](https://sepolia.easscan.org/attestation/view/0x33d85bed90eb3164c5124a7c26ca79be386003205265044d1425cea9b714e115)
[![WASM Comparator](https://img.shields.io/badge/WASM%20Engine-651%20Bytes%20Pure%20Binary-f59e0b?style=for-the-badge)](https://praman-desk.vercel.app/comparator.wasm)
[![MCP Server](https://img.shields.io/badge/MCP-18%20Tools%20Streamable%20HTTP-6366f1?style=for-the-badge)](https://github.com/VishAlgoDev/praman-desk#10-second-developer-quickstart)

---

## Judges Start Here: 5-Step Independent Verification

| Step | Action | Exact Command or Live URL | Expected Result |
|---|---|---|---|
| **1. Run it** | Run the full core, Alibaba Trade Assurance, Solana Token-2022 + Devnet, Two-Mind, Tencent/Visa/OpenClaw, and WASM suites | `npm run sdk:test && npm run tencent-visa:test && npm run alibaba:demo && npm run comparator:test` | Zero failures across JS, Python, Solana, Token-2022, Tencent, Visa, OpenClaw/Hermes, and 1,043 WASM vectors |
| **2. Check it** | Hit live production API or shareable signed audit case permalink | [PO-ALI-9021 Case Permalink](https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021) | Returns JSON verdict (`RECONCILED_PARTIAL_SETTLEMENT`, `$80,000` released, `$20,000` refunded, Sepolia tx + EAS links) |
| **3. Inspect receipt** | Verify on-chain Sepolia TakarSettle resolutions, Diamond #6201, and Solana Devnet settlement | [TakarSettle v4 Deal 0](https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75) • [Deal 1](https://sepolia.etherscan.io/tx/0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13) • [Deal 2](https://sepolia.etherscan.io/tx/0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de) • [Solana Devnet Settlement](https://solscan.io/tx/E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq?cluster=devnet) | Confirmed Ethereum Sepolia transactions, EAS attestation `0x33d85bed...`, and guarded `0.001 SOL` Devnet settlement |
| **4. Break it** | Trigger deterministic pre-payment & Token-2022 circuit breakers | `npm run solana:demo` | Halts hijacked `@solana/web3.js` 1.95.6/1.95.7, drainer `FnvLGtucz4...`, Token-2022 `PermanentDelegate`/`TransferHook`, and OFAC entities with zero key exposure |
| **5. Reproduce it** | Connect headless via zero-install MCP (18 tools) or read the walkthrough | [Live MCP](https://praman-desk.vercel.app/api/mcp) • [OpenClaw/Hermes Skill](examples/tencent-visa-commercial/openclaw-hermes-skill/SKILL.md) • [Walkthrough Video](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) | Direct headless tool calls & complete end-to-end visual walkthrough |

---

## Judge & Developer 30-Second Quickstart

Evaluate Praman Desk locally with zero external keys in under 30 seconds:

```bash
# 1. Clone repository
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install

# 2. Run the core compliance gate demo & Alibaba Trade Assurance arbitration
npm run gate -- demo
npm run alibaba:demo

# 3. Run Solana Pre-Signature Spend Guard unit & Devnet suite (30 unit + 7 Devnet tests)
npm run solana:test

# 4. Run the Animoca Minds two-agent loss-prevention & WASM comparator suites
npm run minds:test
npm run comparator:test
```

- **Live Web Console:** [https://praman-desk.vercel.app](https://praman-desk.vercel.app) *(Alibaba Trade Assurance Desk, Disposition Board, Live Solana Pre-Signature Spend Guard, Procurement Verifier, Multi-Miner Settlement Ledger)*
- **Verified Live Walkthrough Video:** [praman-desk-walkthrough.mp4](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) *(Live UI + narrated 4-act proof covering PO-ALI-9021, Disposition Board, Live Solana Spend Guard, Settlement Ledger, and MCP/SDK integration)*
- **Zero-Install Keyless MCP Server:** Add `https://praman-desk.vercel.app/api/mcp` to Cursor, Claude Code, or Minds ([Setup Guide](CONNECT_YOUR_AGENT.md))
- **NPM / GitHub SDK Integration:** `npm install github:VishAlgoDev/praman-desk` or import from `packages/praman-sdk` (`index.js`, `solana.js`, `praman.py`)
- **Minds (`hellominds.ai`) Mind & Bazaar Skill:** [Praman.Spend.Guard](https://hellominds.ai/profile/minds/47b85842-f36b-1410-8467-00039ce7df11) (`Mind ID: 47b85842-f36b-1410-8467-00039ce7df11`) & published Bazaar Skill `Praman_Spend_Guard` (`5BD48D42-F36B-1410-8467-00039CE7DF11`) • [Two-Mind Local Spec](examples/minds-spend-guard/)
- **Counterfactual Policy Benchmark:** [With vs Without Telegraph ($79,373 Averted in Deterministic Counterfactual Simulation)](docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md)
- **Active Telegraph Miner Coordinates:** Sepolia Diamond Registration `#6201` (18 bonded intents, tx `0x50b34afc...`) / Devnode Route `#6164` on [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Verified Live Specialist Signals:**
  - `INVOICE_LEDGER_RECONCILE_GENERAL`, `CONTRACT_OBLIGATION_AUDIT_GENERAL`, `PURCHASE_ORDER_VERIFY_GENERAL`, `VENDOR_VERIFY_GENERAL`, `DOCUMENT_AUTHENTICITY_GENERAL` (651-byte pure WebAssembly fixed-point arithmetic + SHA-256)
  - `CORPORATE_REGISTRY_LOOKUP_GENERAL` (Live GLEIF Global LEI Index across 200+ jurisdictions)
  - `SANCTIONS_SCREENING_MATCH_GENERAL` (19,565 OFAC SDN entities + digital currency/EVM addresses screened in-memory in <25ms)
  - `REGULATORY_FILING_MONITOR_GENERAL` (Live SEC EDGAR & US Federal Register)
  - `GRID_POWER_PRICE_GENERAL` (Live CAISO OASIS `PRC_LMP` / `PRC_INTVL_LMP` SingleZip feed; fails closed to `live_feed_unavailable` when an ISO blocks unauthenticated access)
  - `LIQUIDITY_DEPTH_VERIFY_GENERAL`, `TOKEN_TOTAL_SUPPLY_VERIFY_GENERAL`, `ONCHAIN_TX_LOOKUP_GENERAL`, `WALLET_BALANCE_CHECK_GENERAL` (Live Ethereum, Sepolia, Base, Arbitrum, & Solana RPCs + DexScreener TVL/pool resolution)
  - `B2B_IDENTITY_ENRICHMENT_GENERAL`, `FRAUD_RISK_GENERAL`, `PAYMENT_METHOD_VERIFY_GENERAL` (Live RDAP + DNS MX/GLEIF corporate enrichment, deterministic signup/IP/fingerprint fraud risk scoring with `subject` + `risk_score`, and Luhn/BIN + ABA routing mod-10 + IBAN mod-97 verification)
  - **Tencent #01 / #03 Agent Output Claim Verifier** (`POST /api/agent/verify-output` & `POST /api/mission/tencent-assurance`): Decomposes enterprise AI agent responses across OFAC SDN, GLEIF LEI/FakeWatch, 651-byte WASM + live ECB Frankfurter FX math, and payment checksums, blocking false `"GO"` / `"ready to settle"` claims before disbursement.
- **Verified On-Chain Takar Escrow Settlements (Ethereum Sepolia):**
  - `TakarSettle v4` (`0x310275e6D66818E068245326bB9e398822304248`) Deal 0: [`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`](https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75) (Block `12190408`) & Case 1: [`0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13`](https://sepolia.etherscan.io/tx/0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13) (Block `12200598`)
  - `TakarSettle5` (`0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B`) Case 2: [`0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de`](https://sepolia.etherscan.io/tx/0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de) (Block `12200597`)
- **Telegraph Hackathon Season II Tracks Covered:**
  - **Track 01 (Apps & Agents):** Praman Desk Collaborative Two-Mind Spend Guard, Alibaba & Cainiao Trade Assurance Clearing Desk, Tencent #01/#03 Enterprise Output Verifier (`/api/agent/verify-output`, `/api/mission/tencent-assurance`), Solana Pre-Signature Spend Guard SDK (`packages/praman-sdk/solana.js`), & Zero-Install MCP Spend Gate (`/api/mcp`)
  - **Track 02 (Miners/Providers):** Sepolia Diamond RegID `#6201` / Devnode Route `#6164`
  - **Track 03 (Evaluators/Truth Sources):** Stateless batch sanctions evaluator (`POST /api/evaluator/sanctions-batch`, superseding retired ephemeral `#469` tunnel), deterministic 651-byte WASM Comparator (`1,043/1,043`), and private attested `truth_source` suites (`301+` attested EvalPool pairs)
- **Anjoman App Listings:** `praman-desk` (`AGENTS`, live & approved: `9ae7025e-65be-490b-8e59-2aa598f16992`) • `praman-desk-2` (`SECURITY`, `In review`: `c7c1adbb-304d-42ec-91df-5811f5e7f49e`)
- **Contributor / Payer Wallet:** [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466)

---

## For Judges: Official Season II Rubric Mapping

| Judging Criterion (100 pts) | Implementation & Verifiable Proof | Key Links |
|---|---|---|
| **1. Technical Quality & Mainnet Readiness** | Standalone 651-byte compiled WebAssembly arithmetic engine (`comparator.wasm`, 1,043/1,043 bit-exact test cases). Solana `SolanaSpendGuard` middleware (`legacy` + `v0` VersionedTransaction, supply-chain `web3.js` 1.95.6/1.95.7 detection, drainer wallet interception, ALT fail-closed guard). On-chain Resolver on Sepolia `TakarSettle v4` & `TakarSettle5`. | [WASM Binary](https://praman-desk.vercel.app/comparator.wasm) • [Sepolia Settle Tx](https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75) • [Solana SDK](packages/praman-sdk/solana.js) |
| **2. Commercial Viability & Real Utility** | Prevents autonomous treasury loss from overbilling (`PO-ALI-9021` 80 vs 100 units), OFAC SDN sanctions exposure, phishing domains (`FakeWatch`), exploit contracts (`RugReceipt`), and hijacked Solana `web3.js` signing hooks before capital leaves escrow or wallet keys touch bytes. | [Commercial Dossier](#anjoman-season-ii-hackathon-rubric-dossier-the-5-mandatory-questions) • [Benchmark Report](docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md) |
| **3. Genuine Independent Adoption & Retention** | Keyless Streamable HTTP MCP (`/api/mcp`, 18 tools) + JS/TS/Python SDKs (`packages/praman-sdk`) + cross-project integrations with Takar (`Bangdrop`), FakeWatch (`#42420`), RugReceipt (`#208`), and Paysheet (`#214`). | [CONNECT_YOUR_AGENT.md](CONNECT_YOUR_AGENT.md) • [Live MCP](https://praman-desk.vercel.app/api/mcp) • [Minds Specification](examples/minds-spend-guard/) |
| **4. Telegraph Network Integration & Quality** | Devnode Route `#6164` / Sepolia Diamond RegID `#6201` (18 bonded intents) serving real live upstream data (GLEIF, SEC EDGAR, OFAC SDN, CAISO OASIS, Ethereum/Sepolia JSON-RPC, RDAP, BIN/IBAN/ABA) with `30` paid `$0.01` Sepolia queries (`$0.30`) + `2` TakarSettle entries (`32` `calls[]` rows on `/api/ledger`) + `4` live Devnode escrow signals (`$0.04`) and fail-closed transparency (`confidence: 0` when an upstream feed is unreachable). | [Sepolia Diamond #6201](https://sepolia.etherscan.io/tx/0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65) • [Live Ledger](https://praman-desk.vercel.app/#ledger) |
| **5. Reproducibility, Demo & Verifiable Proof** | Interactive browser portal (`Trade Assurance`, `Disposition Board`, `Solana Spend Guard` wired to `/api/audit/solana-spend-guard`, `Procurement Verify`, `Settlement Ledger`), full unit + integration + Devnet test suites, verified walkthrough video, and Sepolia Etherscan + EAS receipts. | [Live App](https://praman-desk.vercel.app) • [Walkthrough Video](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) • [EAS Attestation](https://sepolia.easscan.org/attestation/view/0x33d85bed90eb3164c5124a7c26ca79be386003205265044d1425cea9b714e115) |
| **6. Organic Growth, Education & Dev Activation** | Zero-install developer guide (`CONNECT_YOUR_AGENT.md`), CLI runner (`npm run gate solana-demo` / `npm run alibaba:demo`), and interactive SDK playground. | [Developer Guide](CONNECT_YOUR_AGENT.md) • [Discord Showcase](https://discord.com/channels/1438396125609463881) |

---

## Anjoman Season II Hackathon Rubric Dossier (The 5 Mandatory Questions)

### Q1: Who is it for?
- **Target Users & Buyers**:
  - **Treasury Operations Managers & CFOs**: Web3 DAOs, protocol foundations, and tech enterprises executing automated multi-currency or crypto payroll, vendor payouts, and trade escrow.
  - **Autonomous AI Agents & Coding Harnesses** (Antigravity, OpenCode, Eliza, CrewAI): Agentic runtimes granted wallet signing capabilities or Solana/EVM spend caps.
  - **Procurement & Accounts Payable Desks**: Cross-border supply chain and B2B desks (e.g., Alibaba & Cainiao Trade Assurance) reconciling POs against warehouse receipts before releasing escrow.
- **Problem Frequency**:
  - **Continuous & Real-Time**: Autonomous agents disburse transactions 24/7 without human intervention. In Web3, transactions are mathematically final and irreversible. A single unverified payment to a sanctioned address or an overbilled invoice results in permanent capital loss and regulatory liability.

### Q2: What does it improve?
- **Measurable Improvement Over Current Alternatives**:
  - **Replaces Blind LLM Hallucinations with Deterministic Cryptography**: Standard LLMs hallucinate arithmetic and cannot verify whether an address belongs to an OFAC-sanctioned entity. Praman Desk provides a fail-closed pre-payment barrier backed by `19,565` OFAC SDN records, GLEIF Global LEI verification across 200+ jurisdictions, Solana pre-signature transaction inspection, and a `651`-byte WASM arithmetic comparator.
  - **56% to 72% Query Spend Reduction (Golden Challenge)**: Rather than blasting monolithic multi-miner queries, Praman Desk deconstructs invoice claims into a dependency graph and queries only the cheapest missing corroboration.
  - **$79,373 Capital Exposure Averted in Counterfactual Simulation**: Against an ungrounded parameter pass-through baseline, Praman Desk intercepted inverted FX overcharges, lapsed LEIs, phishing domains, sub-cent arithmetic drift, and OFAC collisions before signing.

### Q3: What does it do today?
- **Live Concrete Capabilities in Production**:
  1. **18 Bonded Specialist Intents (+ `MINING_INTELLIGENCE_GENERAL`)**: Deployed at `https://praman-desk.vercel.app`, serving live queries across corporate registries, OFAC sanctions, SEC filings, invoice reconciliation, PO verification, power pricing, multi-chain EVM transactions, B2B identity enrichment, fraud risk scoring, payment method validation, and multi-miner arbitration.
  2. **EIP-191 Escrow Payment Integration**: Native client for Telegraph Devnode x402 / escrow scheme on Sepolia Diamond (`0x72a7...aa08b`), executing paid asks with sub-penny efficiency.
  3. **WASM Arithmetic Comparator**: 651-byte standalone binary compiled from AssemblyScript (`comparator.wasm`), executing bit-exact floating and fixed-point line-item reconciliation with zero imports.
  4. **Two-Mind Spend Guard Architecture**: Fully implemented Animoca Brands Minds specification (`examples/minds-spend-guard/`) with Diligence Investigator and Escrow Reviewer minds.
  5. **Zero-Network Offline Verifier**: Audits SHA-256 proof bundles completely disconnected from the internet (`verify-bundle-offline.mjs`), validating cryptographic signatures, hashes, and mathematical savings across 29 test vectors.
  6. **On-Chain Attestations**: Sepolia EAS attestations linking verified evaluation runs to immutable on-chain receipts.

### Q4: Why would someone adopt it?
- **Compelling Adoption Rationale**:
  - **10-Second Turnkey MCP Integration**: Drop-in Model Context Protocol (MCP) server `praman-spend-guard` allows any agent harness to install pre-payment protection instantly with zero code rewrites.
  - **Zero Gas Overhead for Verification**: Pre-clearing runs off-chain via deterministic WASM and Telegraph intelligence; gas is only spent when the pre-cleared settlement transaction is executed on-chain.
  - **Statutory Audit Ready**: Outputs tamper-proof JSON-LD and EAS cryptographic receipts for auditor review, tax reporting, and corporate governance.
  - **Overwhelming ROI**: Averting a single fraudulent payment or compliance penalty pays for years of operation.

### Q5: How can someone try it?
- **Step-by-Step Reproduction & Verification**:
  1. **Live Interactive Playground**: Visit [https://praman-desk.vercel.app](https://praman-desk.vercel.app) to interactively test 3-way invoice reconciliation, OFAC SDN screening, and multi-miner truth arbitration.
  2. **Run CLI Benchmark Presentation**:
     ```bash
     cd telegraph-h2
     node examples/minds-spend-guard/demo-benchmark-presentation.mjs
     ```
  3. **Verify Proof Bundles Offline (Zero-Network Audit)**:
     ```bash
     node examples/minds-spend-guard/verify-bundle-offline.mjs
     ```
  4. **Run Live Devnode Escrow Ask**:
     ```bash
     node scripts/test-canonical-escrow-ask.mjs
     ```
  5. **Execute Schema Conformance Suite**:
     ```bash
     node scripts/verify-schema-conformance.mjs
     ```

---

## The Problem: AI Agents Hold Private Keys

In 2026, autonomous AI coding agents, DevOps bots, and DAO delegates hold private keys with spend caps. They hire compute instances, pay vendor APIs, and settle on-chain milestones.

**The vulnerability:** If an agent is prompt-injected or fed an altered invoice, crypto funds move irreversibly in seconds. Blockchains have zero chargebacks and zero recourse.

**Praman Desk is the pre-payment firewall.** Before `signer.sendTransaction()` is executed, the agent's runtime intercepts the transfer to run four deterministic checks:
1. **US Treasury OFAC Sanctions Screening:** Screens recipient entity and EVM addresses against 19,565 SDN records and known digital currency wallets (including Lazarus Group).
2. **Authoritative Legal Entity Identification (GLEIF):** Validates counterparty registration in the official Global LEI Index across 200+ jurisdictions.
3. **Deterministic Arithmetic (651-byte WASM):** Reconciles line items against stated totals bit-for-bit to catch phantom overcharges or calculation drift.
4. **Autonomous Delegation Caps:** Enforces single-agent caps ($500) and dual-authorization ceilings ($5,000) with cryptographic supervisor signoff.

If any check fails, the transaction is **frozen before signing**.

---

## Animoca Brands Minds (`hellominds.ai`): Collaborative Two-Mind Spend Guard

Following public guidance from Telegraph Protocol Co-Founder **Ahmed Ali (`1xahmed`)**, Praman Desk implements a collaborative two-agent workflow connecting Animoca Brands Minds with the Telegraph Protocol network via the **Anjoman Skill**:

```
[Enterprise Procurement Request]
               │
               ▼
   ┌───────────────────────┐
   │        MIND 1         │ ──(Anjoman Skill / telegraph-mcp)──► Telegraph Network Specialists
   │ Diligence Investigator│                                       • GLEIF Registry (Devnode #6164)
   └───────────────────────┘                                       • OFAC SDN Screening (Devnode #6164)
               │                                                   • FakeWatch Domain Safety (#42420)
       (Signed Case File)                                          • Cross-Currency Parity (FX_NOW)
               │
               ▼
   ┌───────────────────────┐
   │        MIND 2         │ ──► 651-byte WebAssembly Deterministic Comparator (0 drift)
   │ Escrow Reviewer & Gate│ ──► Multi-Miner Consensus Verifier
   └───────────────────────┘ ──► On-Chain Sepolia Diamond Escrow (0x72a7...a08b)
               │
       ┌───────┴────────┐
       ▼                ▼
[APPROVE_PAYMENT]  [HELD / REJECT]
 (EIP-191 Escrow    (Zero Funds Lost,
    Release)         CFO Audit Queue)
```

1. **Mind 1: Diligence Investigator Agent** ([`examples/minds-spend-guard/investigator-mind.mjs`](examples/minds-spend-guard/investigator-mind.mjs)):
   - Audits vendor dossiers and line items.
   - Queries ranked Telegraph specialists (OFAC, GLEIF, FakeWatch, FX) via Anjoman.
   - Compiles a tamper-evident, SHA-256 digested **Diligence Case File**.

2. **Mind 2: Escrow Reviewer & Spend Gate Agent** ([`examples/minds-spend-guard/reviewer-mind.mjs`](examples/minds-spend-guard/reviewer-mind.mjs)):
   - Audits invoice math down to the sub-cent via the **651-byte WebAssembly comparator**.
   - Verifies multi-miner consensus thresholds.
   - Emits `APPROVE_PAYMENT` with an on-chain Sepolia Diamond escrow receipt, or fails closed (`HELD_FOR_MANUAL_REVIEW`) with **zero capital lost**.

Test it locally in one command:
```bash
node examples/minds-spend-guard/test-two-minds.mjs
```

---

## Counterfactual Benchmark: With vs Without Telegraph ($79,373 Averted)

We evaluated five adversarial scenarios under a deterministic counterfactual baseline:
1. **Without Telegraph (Ungrounded Parameter Pass-Through Baseline)**: Simulated unassisted pass-through with no live oracle verification or deterministic math checks.
2. **With Telegraph (Praman Desk Two-Mind Architecture)**: Powered by Devnode Miner `#6164`, FakeWatch Miner `#42420`, and the 651-byte WASM engine. Also supports live autonomous `402 -> X-PAYMENT` Devnode escrow purchases via [`examples/lib/telegraph-live-buyer.mjs`](examples/lib/telegraph-live-buyer.mjs) (`evidence/autonomous-purchases-live.json`).

| Benchmark Metric | Without Telegraph (Counterfactual Baseline) | With Telegraph (Praman Desk) | Advantage |
|---|:---:|:---:|:---:|
| **Adversarial Error Catch Rate** | **0.0%** (0 / 5) | **100.0%** (5 / 5) | **+100.0% Protection** |
| **Direct Capital Exposure** | **-$79,373.00 USD** | **$0.00 USD** | **$79,373 Averted (100%)** |
| **Arithmetic Precision** | Loose / Unchecked | **Deterministic 651-byte WASM** | **0 Drift down to sub-cent** |
| **Auditability & Receipts** | None (Opaque Text) | **EIP-191 & Sepolia Diamond** | **100% Cryptographic Proof** |
| **Average Decision Latency** | N/A (No Live Verification) | ~1.1 s (live upstream queries) | **Real-Time Verification** |

Detailed findings, reproduction steps, and full report: [`docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md`](docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md).

Run the reproducible benchmark locally:
```bash
node benchmark/with-vs-without-telegraph.mjs
```

---

## Interactive Split-Screen Playground

Visit [https://praman-desk.vercel.app](https://praman-desk.vercel.app) to test six realistic enterprise threat scenarios with one click:

| Threat Scenario | Challenge | Firewall Verdict | Policy Enforcement |
|---|---|:---:|---|
| **1. Phishing & Sanctions Exploit** | Prompt-injected agent attempts $4,200 payout to Lazarus Group OFAC address (`0x098B...2f96`) spoofing a Cloudflare edge bill | **`[ HALT & FREEZE ]`** | Intercepted in <3ms. Recipient flagged on US Treasury SDN list. Zero funds moved. |
| **2. Arithmetic Overcharge** | NVIDIA Corporation GPU compute invoice claims $450.00, but line items sum to $350.00 (phantom markup) | **`[ HALT & FREEZE ]`** | GLEIF LEI verified (`549300S4KLFTLO7GSQ80`); 651-byte WASM engine catches exact $100.00 (10,000 cents) discrepancy. |
| **3. Compliant Agent Payout** | Legitimate Anthropic API compute invoice ($250.00 USDC) within $500 single-agent cap | **`[ APPROVED ]`** | OFAC clean, GLEIF LEI verified (`984500B6DEB8CEBC4Z70`), 0.00% math error. Ready for Telegraph x402 settlement. |
| **4. Dual-Auth Delegation Cap** | High-value infrastructure payout ($2,400 USDC) exceeding $500 single-agent ceiling | **`[ HELD FOR REVIEW ]`** | HELD pending multi-signature supervisor threshold signoff. Protects DAO treasuries from agent overrun. |
| **5. Treasury Delegation Cap & Multisig Halt** | Autonomous agent attempting $13,860.00 infrastructure grant exceeding $500 single-agent delegation cap | **`[ HALT & FREEZE ]`** | Intercepted for delegation limit breach without supervisor multisig authorization; disbursement frozen before key signing. |
| **6. FakeWatch Phishing Shield** | Prompt-injected agent prompted to approve transfer to lookalike phishing domain (`unisvvap.org`) | **`[ HALT & FREEZE ]`** | Intercepted via FakeWatch threat intelligence bridge (bounty #42420); blacklisted spoof domain frozen before signing. |

---

## Operational Economics & Risk Metrics

Why DAOs and agent frameworks integrate Praman Desk:

- **The Cost of Agent Exploits:** Unverified autonomous agent transactions risk catastrophic treasury drain, rogue smart contract interactions, and regulatory sanctions violations.
- **The Cost of Praman Desk:** $0.01 per pre-flight verification settled via Telegraph's x402 micro-payment rail.
- **Deterministic Latency:** Sub-25 ms pre-flight policy evaluation with zero cloud dependency using our compiled 651-byte WebAssembly arithmetic engine.
- **Zero Custody Risk:** Praman Desk never touches private keys or custody. It operates purely as an advisory pre-transaction gate before on-chain signing.

---

## 10-Second Developer Quickstart

### 1. Dual MCP Integration (Remote Streamable HTTP or Local Stdio CLI)

#### Option A: Keyless Streamable HTTP MCP (Recommended for Cursor, Claude Code, & Remote Agents)
Add Praman Desk to your agent's MCP configuration (`claude_desktop_config.json` or Cursor settings) with zero local installations:

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "url": "https://praman-desk.vercel.app/api/mcp"
    }
  }
}
```

#### Option B: Zero-Install Stdio CLI (via GitHub npx)
Run as a local process via standard I/O:

```json
{
  "mcpServers": {
    "praman-spend-guard": {
      "command": "npx",
      "args": ["-y", "--package=github:VishAlgoDev/praman-desk", "praman-spend-guard-mcp"]
    }
  }
}
```

Or verify directly from your terminal:
```bash
npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp --self-test
```

### 2. Direct HTTP API via cURL (Zero Setup)
Test any proposed transaction with cURL:

```bash
# Test Scenario 1: Phishing & Sanctions Exploit
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "phishing_sanctions"}'

# Test Scenario 2: Arithmetic Overcharge Discrepancy
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "arithmetic_overcharge"}'

# Test Custom Proposed Spend
curl -X POST https://praman-desk.vercel.app/api/spend-guard/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "procure-bot-01",
    "recipientAddress": "0x5462D6334F333C8D0662D8a291F04bE5b736b71b",
    "vendorName": "Anthropic PBC",
    "spendAmountUsdc": 250.00,
    "lineItems": [{"desc": "API Tokens", "qty": 10, "unitPrice": 25.0, "amount": 250.0}]
  }'
```

### 3. Python / LangChain Autonomous Agent Spend Guard
Run the zero-dependency Python guard directly from [`examples/langchain-agent-guard/`](examples/langchain-agent-guard/):

```python
from spend_guard_agent import PramanSpendGuard, SpendGuardException

guard = PramanSpendGuard()

try:
    # 1. Pre-flight check before signing web3.eth.send_transaction()
    verdict = guard.inspect_spend(
        agent_id="procurement-bot-01",
        recipient_address="0x5462D6334F333C8D0662D8a291F04bE5b736b71b",
        vendor_name="Anthropic PBC",
        amount_usdc=250.00,
        line_items=[{"desc": "Inference Tokens", "qty": 10, "unitPrice": 25.00, "amount": 250.00}]
    )
    print(f"✅ Approved! Attestation Seal: {verdict['attestationSha256']}")
except SpendGuardException as e:
    print(f"🛑 Blocked: {e}")
```

### 4. Coinbase AgentKit Spend Guard Integration
Intercepts `transfer()` and `send_transaction()` in Coinbase AgentKit (`cdp-agentkit-core`):
```bash
python examples/coinbase-agentkit-guard/agentkit_spend_guard.py
```
```python
from agentkit_spend_guard import GuardedWalletProvider

guarded_wallet = GuardedWalletProvider(raw_wallet_provider=cdp_wallet)
# Automatically screens against OFAC SDN, GLEIF LEI, and WASM math before signing
res = guarded_wallet.guarded_transfer(
    agent_id="treasury-bot-01",
    to_address="0x1111111111111111111111111111111111111111",
    amount_usdc=500.00,
    vendor_name="Anthropic, PBC",
    line_items=[{"desc": "Inference Tokens", "qty": 5, "unitPrice": 100.0, "amount": 500.0}]
)
```

### 5. ElizaOS Autonomous Agent Spend Guard Plugin
Native ElizaOS (`@elizaos/core`) action plugin for autonomous treasury defense:
```bash
node examples/elizaos-spend-guard/test-eliza-guard.mjs
```
```typescript
import { pramanSpendGuardPlugin } from './spendGuardPlugin.mjs';

export const agentConfig = {
  name: "TreasuryAgent",
  plugins: [pramanSpendGuardPlugin]
};
```

### 6. Paysheet 3-Way Consensus Integration (Issue #214)
Runnable consensus adapter for [Timidan/paysheet](https://github.com/Timidan/paysheet/pull/1) in [`examples/paysheet-consensus/`](examples/paysheet-consensus/):
```bash
node examples/paysheet-consensus/paysheet-praman-adapter.mjs
```

### 7. Vercel AI SDK Tool-Calling Spend Guard
Native tool declaration for Vercel AI SDK (`ai` package) in [`examples/vercel-ai-sdk-guard/`](examples/vercel-ai-sdk-guard/):
```bash
node examples/vercel-ai-sdk-guard/ai-sdk-agent-guard.mjs
```

### 8. FakeWatch Phishing Shield & RugReceipt Screens
Cross-project threat intelligence adapters in [`examples/fakewatch-shield/`](examples/fakewatch-shield/) and [`examples/rugreceipt-screen/`](examples/rugreceipt-screen/):
```bash
node examples/fakewatch-shield/fakewatch-praman-shield.mjs
node examples/rugreceipt-screen/rugreceipt-praman-screen.mjs
```

---

## Telegraph Protocol Closed-Loop Architecture

Praman Desk spans Track 01, Track 02, and Track 03 across one shared verification core:

1. **Active Miner (Track 02):** Bonded on active Sepolia Diamond [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) (Diamond registration `#6201`, 18 bonded intents, Devnode Route `#6164`) backed by live GLEIF, SEC EDGAR, OFAC SDN (`19,565` entries), CAISO OASIS, RDAP/DNS MX, and Ethereum/Sepolia/Solana RPCs (`30` paid `$0.01` Sepolia signal queries + `2` `TakarSettle` resolver entries = `32` `calls[]` rows on `/api/ledger` + `4` live Devnode escrow signals).
2. **Evaluators & Truth Sources (Track 03):** Stateless batch sanctions evaluator (`POST /api/evaluator/sanctions-batch`, superseding retired ephemeral tunnel `#469`), `301` primary attested EvalPool pairs (`+ 22` attested on secondary wallet `0x497FF1bE8cc0C95A7a14165A4999768C47fc0109`) kept uncontaminated outside the public repo, and deterministic WASM verification.
3. **Praman Spend Guard (Track 01):** Pre-payment application, Tencent #01/#03 Agent Output Claim Verifier, Alibaba Trade Assurance escrow arbiter (`TakarSettle v4` & `TakarSettle5`), and Solana Pre-Signature Spend Guard (`packages/praman-sdk/solana.js`).
4. **WASM Math Engine:** 651-byte zero-import binary compiled from AssemblyScript with 1,043/1,043 test vectors passing with zero discrepancies.
5. **18 Streamable MCP Tools:** Compliant with MCP specification 2025-03-26 via SSE/JSON-RPC 2.0 at `/api/mcp`.

---

## Testnet Disclosure

Every paid check spends `$0.01` in free Sepolia test USDC from contributor wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`. All transactions are recorded on the Ethereum Sepolia blockchain and verified via Etherscan.
