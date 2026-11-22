# Praman Desk

**The Autonomous Pre-Payment Spend Firewall for AI Agents, DAOs & Treasuries**

[![Live Hosted App](https://img.shields.io/badge/Live%20Firewall-praman--desk.vercel.app-0284c7?style=for-the-badge&logo=vercel)](https://praman-desk.vercel.app)
[![Active Sepolia Diamond](https://img.shields.io/badge/Sepolia%20Diamond-Reg%20%236164%20(Miner%20%236127)-10b981?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
[![Sepolia EAS Attested](https://img.shields.io/badge/Sepolia%20EAS-UID%200x33d85bed...-8b5cf6?style=for-the-badge&logo=ethereum)](https://sepolia.easscan.org/attestation/view/0x33d85bed90eb3164c5124a7c26ca79be386003205265044d1425cea9b714e115)
[![Multi-Miner Truth Matrix](https://img.shields.io/badge/Truth%20Matrix-Live%20Arbitrator-ec4899?style=for-the-badge)](https://praman-desk.vercel.app/#matrix)
[![WASM Comparator](https://img.shields.io/badge/WASM%20Engine-651%20Bytes%20Pure%20Binary-f59e0b?style=for-the-badge)](https://praman-desk.vercel.app/comparator.wasm)
[![MCP Server](https://img.shields.io/badge/MCP-18%20Tools%20Streamable%20HTTP-6366f1?style=for-the-badge)](https://github.com/VishAlgoDev/praman-desk#10-second-developer-quickstart)

- **Live Split-Screen Interactive Playground:** <https://praman-desk.vercel.app>
- **Universal Multi-Miner Contradiction & Truth Matrix:** <https://praman-desk.vercel.app/#matrix>
- **Zero-Install Keyless MCP Server for Cursor, Claude & Minds:** [CONNECT_YOUR_AGENT.md](CONNECT_YOUR_AGENT.md) (`https://praman-desk.vercel.app/api/mcp`)
- **Official Master Walkthrough (Full Deep Dive):** [praman-desk-walkthrough.mp4](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) (5.23 min, Screen Studio + Founder narration).
- **Fast-Track Executive Demo (47s Video):** [praman_minds_benchmark_showcase.mp4](https://praman-desk.vercel.app/praman_minds_benchmark_showcase.mp4) (47s Two-Mind Threat Interception demo).
- **Two-Mind Spend Guard Architecture:** [Reference Implementation of the Animoca Brands Minds Specification](examples/minds-spend-guard/) (Diligence Investigator + Escrow Reviewer Minds)
- **Empirical Benchmark Report:** [With vs Without Telegraph ($79,373 Averted)](docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md)
- **Active Telegraph Miner:** Devnode Miner `#6164` (Route `5281` / Sepolia Diamond registration `#6164`, **15 capabilities**) on [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Devnode Global Leaderboard Standing (Live Epoch 38 & 39):**
  - 🥈 **Rank #2 Globally:** `INVOICE_LEDGER_RECONCILE_GENERAL` (Score: `0.9979` in Epoch 39)
  - 🏆 **Rank #1 Globally:** `CONTRACT_OBLIGATION_AUDIT_GENERAL` (Score: `0.500`)
  - 🏆 **Rank #1 Globally:** `PURCHASE_ORDER_VERIFY_GENERAL` (Score: `0.000`, top seed)
  - 🏆 **Rank #1 Globally:** `CORPORATE_REGISTRY_LOOKUP_GENERAL` (Score: `0.998`, 200+ jurisdictions GLEIF)
  - 🥈 **Rank #2 Globally:** `SANCTIONS_SCREENING_MATCH_GENERAL` (Score: `1.000`, 19,599 OFAC records + 127 EVM digital currency addresses)
  - 🏆 **Rank #1 Globally:** `GRID_POWER_PRICE_GENERAL` (CAISO / ERCOT Locational Marginal Pricing)
  - 🏆 **Rank #1 Globally:** `REGULATORY_FILING_MONITOR_GENERAL` (SEC EDGAR / Federal Register)
- **Total Requests Served on Devnode:** **275+** live paid network requests served via native EIP-191 escrow signatures (100% HTTP 200)
- **Live Multi-Operator Consensus on Sepolia:** Verified Seat 3 Resolver on TakarSettle v4 (`0x310275e6D66818E068245326bB9e398822304248`). Evaluated Deal 0 (Siemens AG) and broadcasted decisive on-chain `second()` transaction:
  - **Tx**: [`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`](https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75) (Block `12190408`)
  - **Result**: 3/3 approvals reached, Deal 0 finalized on Ethereum Sepolia.
- **Telegraph Hackathon Season II Tracks Covered:**
  - **Track 01 (Apps & Agents):** Praman Desk Collaborative Two-Mind Spend Guard + Zero-Install MCP Spend Gate
  - **Track 02 (Miners/Providers):** Miner `#6164` holding Rank 1/Rank 2 standings across active commercial intents
  - **Track 03 (Evaluators/Truth Sources):** 68 eligible rows across 9 intents in Devnode EvalPool satisfying `min_submitters >= 3` consensus + Upstream Ground-Truth PRs #217-#222
- **Anjoman App Submission IDs:** `9ae7025e-65be-490b-8e59-2aa598f16992` (Category: Agents, Status: In review) & `c7c1adbb-304d-42ec-91df-5811f5e7f49e` (Category: Security, Status: In review)
- **Contributor / Payer Wallet:** [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466)

---

## For Judges: Official Season II Rubric Mapping

This table maps directly to the Hackathon Judging Criteria from Section 6 of the official rules:

| Judging Criterion (100 pts) | Implementation & Verifiable Proof | Key Links |
|---|---|---|
| **1. Technical Quality & Mainnet Readiness** | 15 production specialist endpoints on Vercel with <600ms latency. Standalone 651-byte compiled WebAssembly arithmetic engine (`comparator.wasm`) guaranteeing bit-exact IEEE-754 3-way invoice reconciliation. Decisive Seat 3 Resolver on Sepolia TakarSettle v4 escrow contract. | [WASM Binary](https://praman-desk.vercel.app/comparator.wasm) • [Sepolia Settle Tx](https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75) • [Offline Verifier](scripts/verify-bundle-offline.mjs) |
| **2. Commercial Viability & Real Utility** | Solves the critical security vulnerability of autonomous agent wallets: prompt-injected payments to sanctioned addresses and fraudulent invoices. Directly serves CFOs, DAOs, and autonomous agent runtimes. $79,373 capital loss averted in empirical testing. | [Commercial Dossier](#anjoman-season-ii-hackathon-rubric-dossier-the-5-mandatory-questions) • [Benchmark Report](docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md) |
| **3. Genuine Independent Adoption & Retention** | Public, zero-install, keyless MCP endpoint (`/api/mcp`) running in any Cursor, Claude Code, Windsurf, or Minds agent in 30 seconds. Co-opetition partnership with Bangdrop's Takar: Takar uses Praman Desk as Seat 3 Resolver. | [CONNECT_YOUR_AGENT.md](CONNECT_YOUR_AGENT.md) • [Live MCP](https://praman-desk.vercel.app/api/mcp) • [Minds Specification](examples/minds-spend-guard/) |
| **4. Telegraph Network Integration & Quality** | Devnode Miner #6164 (Route 5281) has served **275+ live verified network requests** (100% HTTP 200). Holds Rank 1 across 5 commercial intents (Ep 38) and Rank 2 on `INVOICE_LEDGER_RECONCILE` (0.9979 score in Ep 39). 68 eligible EvalPool rows. | [Sepolia Diamond #6164](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) • [Leaderboard](https://devnode.telegraphprotocol.com) |
| **5. Reproducibility, Demo & Verifiable Proof** | Live interactive split-screen web app. 5.23m full master walkthrough video + 47s executive threat demo. Complete offline test suite (`npm run offline:test`, 29 test vectors). Confirmed on-chain EAS attestation and Etherscan transaction receipts. | [Live App](https://praman-desk.vercel.app) • [Demo Video (5.23m)](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) • [EAS Attestation](https://sepolia.easscan.org/attestation/view/0x33d85bed90eb3164c5124a7c26ca79be386003205265044d1425cea9b714e115) |
| **6. Organic Growth, Education & Dev Activation** | Published 30-second developer onboarding guide for Cursor, Claude Code, and Minds. Public updates and verified on-chain proofs shared in Discord `#hackathon`, `#showcase`, and on X tagging `@Telegraphprotoc`. | [Developer Guide](CONNECT_YOUR_AGENT.md) • [X Broadcast](https://x.com/vishal_karad) • [Discord Showcase](https://discord.com/channels/1438396125609463881) |

---

## Anjoman Season II Hackathon Rubric Dossier (The 5 Mandatory Questions)

### Q1: Who is it for?
- **Target Users & Buyers**:
  - **Treasury Operations Managers & CFOs**: Web3 DAOs, protocol foundations, and tech enterprises executing automated multi-currency or crypto payroll, vendor payouts, and grants.
  - **Autonomous AI Agents & Coding Harnesses** (Antigravity, OpenCode, Eliza, CrewAI): Agentic runtimes granted wallet private keys and automated spend caps for hiring compute, paying API vendors, and settling invoices.
  - **Procurement & Accounts Payable Desks**: Enterprise desks processing high-volume recurring vendor invoices subject to statutory reporting and OFAC compliance.
- **Problem Frequency**:
  - **Continuous & Real-Time**: Autonomous agents disburse transactions 24/7 without human intervention. In Web3, transactions are mathematically final and irreversible. A single unverified payment to a sanctioned address or a fraudulent invoice results in permanent capital loss and severe regulatory liability.

### Q2: What does it improve?
- **Measurable Improvement Over Current Alternatives**:
  - **Replaces Blind LLM Hallucinations with Deterministic Cryptography**: Standard LLMs hallucinate arithmetic and cannot verify whether an address belongs to an OFAC-sanctioned entity. Praman Desk provides a zero-slop pre-payment barrier backed by 19,599 OFAC SDN records, 127 EVM digital currency addresses, 200+ jurisdictions GLEIF official registry, and a 651-byte WASM arithmetic comparator.
  - **56% to 72% Query Spend Reduction (Golden Challenge)**: Rather than blasting monolithic, expensive multi-miner queries, Praman Desk deconstructs invoice claims into a dependency graph and dynamically queries only the cheapest missing corroboration on Telegraph, saving 56%–72% in protocol fees.
  - **$79,373 in Capital Loss Averted**: In empirical benchmarks, Praman Desk intercepted fraudulent invoices, phantom overcharges, and sanctioned transfers before `signer.sendTransaction()` was ever broadcast.

### Q3: What does it do today?
- **Live Concrete Capabilities in Production**:
  1. **15 Production Specialist Intents**: Deployed at `https://praman-desk.vercel.app`, serving sub-second queries across corporate registries, OFAC sanctions, SEC filings, invoice reconciliation, PO verification, power pricing, multi-chain EVM transactions, and multi-miner arbitration.
  2. **EIP-191 Escrow Payment Integration**: Native client for Telegraph Devnode x402 / escrow scheme on Sepolia Diamond (`0x72a7...aa08b`), executing paid asks with sub-penny efficiency.
  3. **WASM Arithmetic Comparator**: 651-byte standalone binary compiled from Rust (`comparator.wasm`), executing bit-exact floating and fixed-point line-item reconciliation in zero memory overhead.
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
  2. **Run 90-Second Benchmark Presentation**:
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
   │ Diligence Investigator│                                       • GLEIF Registry (Miner #6127)
   └───────────────────────┘                                       • OFAC SDN Screening (Miner #6127)
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

## Empirical Benchmark: With vs Without Telegraph ($79,373 Averted)

We benchmarked identical adversarial scenarios across two agent architectures:
1. **Without Telegraph (Raw LLM / Generic Agent)**: Unassisted model relying on prompt weights and loose floating-point math.
2. **With Telegraph (Praman Desk Two-Mind Architecture)**: Powered by Devnode Miner #6127, FakeWatch Miner #42420, and 651-byte WASM engine.

| Benchmark Metric | Without Telegraph (Raw LLM) | With Telegraph (Praman Desk) | Advantage |
|---|:---:|:---:|:---:|
| **Adversarial Error Catch Rate** | **0.0%** (0 / 5) | **100.0%** (5 / 5) | **+100.0% Protection** |
| **Direct Capital Loss** | **-$79,373.00 USD** | **$0.00 USD** | **$79,373 Averted (100%)** |
| **Arithmetic Precision** | Loose / Approximate | **Deterministic 651-byte WASM** | **0 Drift down to sub-cent** |
| **Auditability & Receipts** | None (Opaque Text) | **EIP-191 & Sepolia Diamond** | **100% Cryptographic Proof** |
| **Average Decision Latency** | 1,250 ms | 775 ms | **Enterprise Real-Time (<2.5s)** |

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
node examples/vercel-ai-sdk-guard/test-ai-sdk.mjs
```

### 8. FakeWatch Phishing Shield & RugReceipt Screens
Cross-project threat intelligence adapters in [`examples/fakewatch-shield/`](examples/fakewatch-shield/) and [`examples/rugreceipt-screen/`](examples/rugreceipt-screen/):
```bash
node examples/fakewatch-shield/test-fakewatch-shield.mjs
node examples/rugreceipt-screen/test-rugreceipt-screen.mjs
```

---

## Telegraph Protocol Closed-Loop Architecture

Praman Desk bridges Track 01, Track 02, and Track 03 into a self-reinforcing flywheel:

1. **Active Miner (Track 02):** Bonded on active Sepolia Diamond [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) (Diamond registration `#6164`, Devnode miner `#6127`, Route `5281`). **14** intents on-chain; mining intelligence live on HTTP/MCP pending Diamond bond support.
2. **Evaluator Pool (Track 03):** 62 attested bounties scoring external miners against primary registers (SEC EDGAR, GLEIF, OFAC).
3. **Praman Spend Guard (Track 01):** The user-facing application that consumes high-reputation network miners to verify counterparty parameters before on-chain payment.
4. **WASM Math Engine:** 651-byte zero-import binary compiled from AssemblyScript with 1,043/1,043 test vectors passing with zero discrepancies.
5. **18 Streamable MCP Tools:** Fully compliant with MCP specification 2025-03-26 via SSE/JSON-RPC 2.0 at `/api/mcp`.

---

## Testnet Disclosure

Every paid check spends `$0.01` in free Sepolia test USDC from contributor wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`. All transactions are recorded on the Ethereum Sepolia blockchain and verified via Etherscan.
