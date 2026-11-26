# Praman Desk Spend Guard — ElizaOS Plugin

> **Autonomous Pre-Payment Firewall & Policy Action for ElizaOS Agents (`@elizaos/core`)**  
> Intercepts outbound wallet payouts before on-chain execution to protect agent treasuries.

---

## 🎯 The Problem Solved

ElizaOS autonomous agents are frequently granted execution keys to execute transfers, swap assets, and pay bounties across Solana, EVM, and Base. When exposed to adversarial prompts, spoofed invoices, or arithmetic rounding errors, funds drain irreversibly in seconds.

**Praman Desk** provides a native ElizaOS plugin action (`EVALUATE_SPEND_POLICY`):
1. **19,565 OFAC SDN Sanctions Blacklist**: Screens recipient addresses against US Treasury sanctions (e.g. Lazarus Group).
2. **Global LEI Statutory Verification**: Validates vendor legal status in the GLEIF registry.
3. **651-byte WASM Arithmetic Engine**: Proves bit-exact invoice reconciliation with zero floating-point drift.
4. **Autonomous Spend Ceilings**: Enforces single-agent caps ($500 limit) requiring supervisor co-signatures.
5. **Cryptographic Attestation Seal**: Appends a SHA-256 clearance proof to the agent's action context.

---

## 🚀 Quickstart

### 1. Requirements
- Node.js 18+
- Zero external dependencies for testing (uses native `fetch`).

### 2. Run the Verification Suite
```bash
node examples/elizaos-spend-guard/test-eliza-guard.mjs
```

### 3. Output
```text
===========================================================================
PRAMAN DESK — ELIZAOS AUTONOMOUS AGENT PRE-PAYMENT FIREWALL
Evaluating 3 Outbound Payout Scenarios through Eliza Action Handler
Plugin: praman-spend-guard | Actions: 1
===========================================================================

[Scenario 1] Injected Prompt / Spoofed Cloudflare Bill targeting Lazarus Address
Eliza Agent Callback Received:
  Action: HALT_AND_FREEZE
  Output: 🛑 [PRAMAN FIREWALL HALT] Outbound transfer halted!
[+] SUCCESS: ElizaOS Action intercepted malicious transfer!

[Scenario 2] Prompt Infiltration / Sub-Cent Floating Point Arithmetic Exploit
Eliza Agent Callback Received:
  Action: HALT_AND_FREEZE
  Output: 🛑 [PRAMAN FIREWALL HALT] Outbound transfer halted!
[+] SUCCESS: ElizaOS Action caught arithmetic overcharge!

[Scenario 3] Legitimate Agent Outbound Payout to Registered Vendor (Anthropic, PBC)
Eliza Agent Callback Received:
  Action: PROCEED_WITH_SIGNING
  Output: ✅ [PRAMAN FIREWALL CLEARED] Payment approved for execution.
[+] SUCCESS: ElizaOS Action CLEARED and APPROVED compliant transaction!

===========================================================================
ALL 3 ELIZAOS ACTION SCENARIOS PASSED WITH 100% DETERMINISM ✅
```

---

## 💻 Integration with Eliza Character

Add `pramanSpendGuardPlugin` to your Eliza character or agent runtime:

```typescript
import { pramanSpendGuardPlugin } from './spendGuardPlugin.mjs';

export const agentConfig = {
  name: "TreasuryAgent",
  plugins: [
    pramanSpendGuardPlugin
  ]
};
```

---

## Network Verification
- **Live Endpoint**: `https://praman-desk.vercel.app/api/spend-guard/evaluate`
- **Telegraph Protocol Devnode Miner**: `#6164` (`praman-compliance-miner`)
- **Ethereum Sepolia Diamond**: [`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`](https://sepolia.etherscan.io/address/0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b) (Registration `#6201`)
