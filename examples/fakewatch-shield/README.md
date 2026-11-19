# FakeWatch x Praman Desk Counterparty Shield Adapter

Reciprocal enterprise spend protection combining **FakeWatch domain safety (Miner #42420)** with **Praman Desk compliance verification (Miner #6128 / Devnode #5281)**.

---

## The Problem
When autonomous agents or DAO signers execute disbursements, they face two distinct threat vectors:
1. **Phishing & dApp Spoofing:** Malicious lookalike domains (e.g. `unisvvap.org`) intercepting approvals.
2. **Sanctioned Counterparties:** Destination wallets or entities flagged on OFAC SDN / Lazarus Group watchlists triggering catastrophic regulatory freezing.

Neither threat feed is sufficient alone.

---

## The Combined Shield
This adapter demonstrates a unified pre-flight evaluation pipeline:
- **Phase 1 (FakeWatch):** Checks domain reputation, SSL anomalies, and phishing patterns.
- **Phase 2 (Praman Desk):** Queries in-memory OFAC SDN lists (<25ms lookup) and confirms legal entity standing in the official GLEIF Global LEI Index.
- **Decision Engine:** If the domain is phishing, immediate `REJECT_AND_FREEZE`. If unknown, `HELD_FOR_MANUAL_REVIEW`. If compliant, `APPROVE_PAYMENT` with cryptographic attestation.

---

## 10-Second Quickstart

```bash
# Run the self-contained verification suite
node examples/fakewatch-shield/fakewatch-praman-shield.mjs
```

### Expected Output
```
Testing FakeWatch x Praman Desk Counterparty Shield...

1. Phishing Domain Test (unisvvap.org):
   Cleared: false | Action: REJECT_AND_FREEZE | Verdict: BLOCKED_PHISHING
   Reason: Destination domain (unisvvap.org) flagged as malicious phishing by FakeWatch threat intelligence.
   PASS ✅

2. Sanctioned Counterparty Test (Lazarus EVM / Banco Nacional):
   Cleared: false | Action: REJECT_AND_FREEZE | Verdict: SANCTIONS_BLOCK
   Reason: Counterparty flagged on US Treasury OFAC SDN sanctions list.
   PASS ✅

3. Legitimate Enterprise Test (Stripe, LLC):
   Cleared: true | Action: APPROVE_PAYMENT | Verdict: CLEARED
   Reason: Cleared by Praman Desk
   PASS ✅

FakeWatch x Praman Desk Shield Verified 100% Deterministic.
```

---

## Dual MCP Integration
For agents using MCP (Cursor, Claude Code, ElizaOS), invoke tool:
```json
{
  "name": "fakewatch_counterparty_shield",
  "arguments": {
    "url": "https://stripe.com/pay",
    "vendor": "Stripe, LLC"
  }
}
```
Available on keyless Streamable HTTP MCP at `https://praman-desk.vercel.app/api/mcp`.
