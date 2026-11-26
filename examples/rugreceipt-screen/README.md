# RugReceipt x Praman Desk Smart Contract & Deployer Shield

Reciprocal smart contract safety screening integrating **RugReceipt (Issue #208)** with **Praman Desk compliance verification (Devnode #6164 / Diamond #6201)**.

---

## Overview
DeFi protocols and automated listing agents must verify that new token contracts and their deployers are not associated with known exploiters or sanctioned state actors.

This adapter screens:
1. **Contract Bytecode & Address:** Evaluated against 19,565 US Treasury OFAC SDN records (Remarks column digital currency entries).
2. **Deployer / Owner Address:** Checked against Lazarus Group, Ronin Bridge, and Tornado Cash sanctioned addresses.
3. **Verdict & Score:** Generates a deterministic safety score (0 to 100) and actionable decision: `APPROVE_CONTRACT_INTERACTION` or `REJECT_AND_FREEZE`.

---

## 10-Second Quickstart

```bash
# Run the self-contained verification suite
node examples/rugreceipt-screen/rugreceipt-praman-screen.mjs
```

### Expected Output
```
Testing RugReceipt x Praman Desk Smart Contract Screen...

1. Sanctioned Lazarus Exploit Address Test:
   Cleared: false | Action: REJECT_AND_FREEZE | Score: 0/100 | Verdict: CRITICAL_RISK
   Reasons: Contract address flagged: Lazarus Group (Ronin Bridge Exploit)
   PASS ✅

2. Sanctioned Deployer Address Test (Tornado Cash):
   Cleared: false | Action: REJECT_AND_FREEZE | Score: 0/100 | Verdict: CRITICAL_RISK
   Reasons: Deployer address flagged: Tornado Cash Router
   PASS ✅

3. Clean Sepolia Diamond Port Contract Test:
   Cleared: true | Action: APPROVE_CONTRACT_INTERACTION | Score: 100/100 | Verdict: VERIFIED_SAFE
   Reasons: Address cleared against OFAC SDN and known exploit index.
   PASS ✅

RugReceipt x Praman Desk Screen Verified 100% Deterministic.
```

---

## MCP Integration
Call tool `rugreceipt_contract_screen` via Streamable HTTP MCP at `https://praman-desk.vercel.app/api/mcp` or stdio CLI:
```json
{
  "name": "rugreceipt_contract_screen",
  "arguments": {
    "contract_address": "0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b",
    "token_symbol": "DIAMOND"
  }
}
```
