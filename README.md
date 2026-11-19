# Praman Desk

**The Autonomous Pre-Payment Spend Firewall for AI Agents, DAOs & Treasuries**

[![Live Hosted App](https://img.shields.io/badge/Live%20Firewall-praman--desk.vercel.app-0284c7?style=for-the-badge&logo=vercel)](https://praman-desk.vercel.app)
[![Active Sepolia Diamond](https://img.shields.io/badge/Sepolia%20Diamond-Port%20%236128%20(Miner%20%236127)-10b981?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
[![Global Rank #1](https://img.shields.io/badge/Devnode%20Rank-%231%20Document%20Authenticity-059669?style=for-the-badge)](https://devnode.telegraphprotocol.com)
[![WASM Comparator](https://img.shields.io/badge/WASM%20Engine-651%20Bytes%20Pure%20Binary-f59e0b?style=for-the-badge)](https://praman-desk.vercel.app/comparator.wasm)
[![MCP Server](https://img.shields.io/badge/MCP-15%20Tools%20Streamable%20HTTP-6366f1?style=for-the-badge)](https://github.com/VishAlgoDev/praman-desk#10-second-developer-quickstart)

- **Live Split-Screen Interactive Playground:** <https://praman-desk.vercel.app>
- **Official Screencast Walkthrough (90s):** [Direct MP4 Stream](https://praman-desk.vercel.app/praman-desk-walkthrough.mp4) · [Developer Script](docs/SHOWCASE_WALKTHROUGH_SCRIPT.md)
- **Active Telegraph Miner:** Devnode Miner `#6127` (Route `5281` / Sepolia Diamond Registration `#6128`) on [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
- **Devnode Global Leaderboard Standing (Epoch 16):**
  - 🏆 **Rank #1 Globally:** `DOCUMENT_AUTHENTICITY_GENERAL` (Score: `0.9993`)
  - 🥈 **Rank #3 Globally:** `SANCTIONS_SCREENING_MATCH_GENERAL` (Score: `1.0000`, 19,565 OFAC records)
  - 💎 **Rank #6 Globally:** `CORPORATE_REGISTRY_LOOKUP_GENERAL` (Score: `1.0000`, 200+ jurisdictions GLEIF)
  - 💎 **Prior Rank #1:** `PURCHASE_ORDER_VERIFY_GENERAL`
- **Telegraph Hackathon Season II Track:** Track 01 — Apps & Agents
  - **Mission 11:** Autonomous Systems (Spend Delegation Approval Caps & Agent Circuit Breakers)
  - **Mission 02:** Stablecoin Treasury Guard (OFAC SDN EVM Address Screening & FATF Travel Rule)
  - **Mission 01:** Exchange Pre-Listing Counterparty Integrity Screening
  - **Mission 04:** Legal & Cross-Border Diligence (5 Statutory Registers + 651-byte WASM)
- **Anjoman App Submission ID:** `9ae7025e-65be-490b-8e59-2aa598f16992`
- **Contributor / Payer Wallet:** [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466)

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

## Interactive Split-Screen Playground

Visit [https://praman-desk.vercel.app](https://praman-desk.vercel.app) to test six realistic enterprise threat scenarios with one click:

| Threat Scenario | Challenge | Firewall Verdict | Policy Enforcement |
|---|---|:---:|---|
| **1. Phishing & Sanctions Exploit** | Prompt-injected agent attempts $4,200 payout to Lazarus Group OFAC address (`0x098B...2f96`) spoofing a Cloudflare edge bill | **`[ HALT & FREEZE ]`** | Intercepted in <3ms. Recipient flagged on US Treasury SDN list. Zero funds moved. |
| **2. Arithmetic Overcharge** | NVIDIA Corporation GPU compute invoice claims $450.00, but line items sum to $350.00 (phantom markup) | **`[ HALT & FREEZE ]`** | GLEIF LEI verified (`549300S4KLFTLO7GSQ80`); 651-byte WASM engine catches exact $100.00 (10,000 cents) discrepancy. |
| **3. Compliant Agent Payout** | Legitimate Anthropic API compute invoice ($250.00 USDC) within $500 single-agent cap | **`[ APPROVED ]`** | OFAC clean, GLEIF LEI verified (`984500B6DEB8CEBC4Z70`), 0.00% math error. Ready for Telegraph x402 settlement. |
| **4. Dual-Auth Delegation Cap** | High-value infrastructure payout ($2,400 USDC) exceeding $500 single-agent ceiling | **`[ HELD FOR REVIEW ]`** | HELD pending multi-signature supervisor threshold signoff. Protects DAO treasuries from agent overrun. |
| **5. Contract Obligation Audit** | Commercial escrow release with delayed statutory milestone (MahaRERA Section 18 delayed possession) | **`[ HALT & FREEZE ]`** | 11% p.a. interest penalty liability triggered ($11,550 accrued penalty); disbursement frozen until statutory compliance. |
| **6. FakeWatch Phishing Shield** | Prompt-injected agent prompted to approve transfer to lookalike phishing domain (`unisvvap.org`) | **`[ HALT & FREEZE ]`** | Intercepted via FakeWatch threat intelligence bridge (bounty #42420); blacklisted spoof domain frozen before signing. |

---

## Commercial Viability & Unit Economics

Why DAOs and agent frameworks integrate Praman Desk:

- **The Cost of Agent Failure:** An exploited agent draining $4,200 requires an average forensic audit and legal retainer of $2,500+, totaling $6,700+ in irreversible losses.
- **The Cost of Praman Desk:** $0.01 per pre-flight inspection settled via Telegraph's x402 micro-payment rail.
- **Protection Ratio:** **250,000 : 1** (a 1-cent check prevents a $2,500+ incident).
- **Zero Custody Risk:** Praman Desk never holds user or treasury keys. It only acts as an advisory pre-flight gate.

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

1. **Active Miner (Track 02):** Bonded on active Sepolia Diamond Port [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) (Diamond Registration `#6128`, Devnode Miner `#6127`, Route `5281`). Serves 8 compliance capabilities on Devnode router including verified Rank #1 Global Document Authenticity and Rank #3 Global Sanctions Screening.
2. **Evaluator Pool (Track 03):** 62 attested bounties scoring external miners against primary registers (SEC EDGAR, GLEIF, OFAC).
3. **Praman Spend Guard (Track 01):** The user-facing application that consumes high-reputation network miners to verify counterparty parameters before on-chain payment.
4. **WASM Math Engine:** 651-byte zero-import binary compiled from AssemblyScript with 1,043/1,043 test vectors passing with zero discrepancies.
5. **15 Streamable MCP Tools:** Fully compliant with MCP specification 2025-03-26 via SSE/JSON-RPC 2.0 at `/api/mcp`.

---

## Testnet Disclosure

Every paid check spends `$0.01` in free Sepolia test USDC from contributor wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`. All transactions are recorded on the Ethereum Sepolia blockchain and verified via Etherscan.
