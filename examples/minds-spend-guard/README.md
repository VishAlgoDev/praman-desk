# 🧠 Praman Desk: Collaborative Two-Mind Spend Guard Architecture

> Built for **Animoca Brands Minds (`hellominds.ai`)** & **Telegraph Protocol Season II Hackathon**  
> Primary Missions: **Mission 04 (Legal)** & **Mission 03 (Institutional Markets)**  
> Protocol Intelligence Layer: **Telegraph Protocol via Anjoman Skill (`telegraphprotocol/telegraph-mcp`)**

---

## Overview

Following architectural guidance from Telegraph Protocol Co-Founder **Ahmed Ali (`1xahmed`)**, Praman Desk implements a collaborative **Two-Mind Spend Guard** pattern:

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

1. **Mind 1: Diligence Investigator Agent** (`investigator-mind.mjs`):
   - Ingests invoices, vendor details, and purchase orders.
   - Dispatches multi-source queries across ranked Telegraph miners via the **Anjoman Skill**.
   - Gathers evidence across 4 independent dimensions:
     - Corporate existence & statutory status via **GLEIF Primary Registry**.
     - Sanctions screening against **US Treasury OFAC SDN** in-memory dataset (<25ms).
     - Domain reputation & counterparty phishing shields via **FakeWatch Miner #42420**.
     - Foreign exchange rate parity & inverted-rate detection via Telegraph FX feeds.
   - Compiles a tamper-evident, SHA-256 digested **Diligence Case File**.

2. **Mind 2: Escrow Reviewer & Spend Gate Agent** (`reviewer-mind.mjs`):
   - Ingests the case file and verifies its cryptographic digest.
   - Runs a **651-byte compiled WebAssembly deterministic comparator** (`comparator/comparator.wasm`) to audit arithmetic down to the sub-cent.
   - Cross-evaluates multi-miner consensus across independent providers.
   - Issues an authoritative, fail-closed spend decision:
     - `APPROVE_PAYMENT`: Releases on-chain escrow via Sepolia Diamond Port `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` with an EIP-191 authorized signature.
     - `HELD_FOR_MANUAL_REVIEW`: Fails closed on any anomaly (inverted FX, lapsed LEI, math drift, unrated domain), protecting 100% of capital.
     - `REJECT_PAYMENT`: Hard-blocks sanctions collisions and phishing attacks.

---

## Quickstart & Verification

Run the automated end-to-end test suite:

```bash
node examples/minds-spend-guard/test-two-minds.mjs
```

### Expected Output
```text
========================================================================
 🧠 Praman Desk: Collaborative Two-Mind Spend Guard Verification Suite
 Animoca Brands Minds (hellominds.ai) + Telegraph Protocol Intelligence
========================================================================

--- TEST 1: Clean Enterprise Procurement (Siemens AG €8,400) ---
[Mind 1] Investigator completed Case: CASE-... (Digest: 0x...)
[Mind 1] GLEIF: FOUND | Sanctions: CLEAN | Domain: SAFE
[Mind 2] Reviewer Verdict: APPROVE_PAYMENT
[Mind 2] WASM Math Score: 10000/10000 (Exact Match: true)
[Mind 2] Escrow Authorization: ESCROW_RELEASE_AUTHORIZED (Diamond Port: 0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b)
✅ TEST 1 PASSED: Clean enterprise invoice approved and escrow authorized.

--- TEST 2: Adversarial Inverted FX Rate (Claimed 0.92 USD/EUR instead of 1.085) ---
[Mind 1] Investigator flagged anomalies: INVERTED_OR_ABNORMAL_FX_RATE
[Mind 2] Reviewer Verdict: HELD_FOR_MANUAL_REVIEW
[Mind 2] Blocking Flags: INVERTED_FX_OVERCHARGE_PREVENTED
[Mind 2] Loss Averted: $8,500
✅ TEST 2 PASSED: Inverted FX rate caught, funds safely held with 0 loss.

--- TEST 3: Phishing Domain Attack (unisvvap.org / clone portal) ---
[Mind 1] Investigator FakeWatch Domain Verdict: PHISHING
[Mind 2] Reviewer Verdict: REJECT_PAYMENT
[Mind 2] Blocking Flags: PHISHING_DOMAIN_HARD_BLOCK
✅ TEST 3 PASSED: Phishing domain hard-blocked, 0 funds released.

--- TEST 4: Mathematical Line-Item Drift (WASM sub-cent audit) ---
[Mind 2] Reviewer WASM Score: 0/10000 (Drift: 5000 cents)
[Mind 2] Reviewer Verdict: HELD_FOR_MANUAL_REVIEW
✅ TEST 4 PASSED: WASM engine identified stealth invoice inflation.

========================================================================
🎉 ALL 4/4 TESTS PASSED! Two-Mind Collaborative Architecture is 100% verified.
========================================================================
```

---

## Programmatic API Usage

```javascript
import { investigateProcurement } from './investigator-mind.mjs';
import { reviewAndGateSpend } from './reviewer-mind.mjs';

// 1. Submit procurement details
const request = {
  invoiceNumber: 'INV-2026-001',
  vendor: 'Siemens Aktiengesellschaft',
  country: 'DE',
  domain: 'siemens.com',
  items: [{ description: 'PLC Controller', quantity: 12, unitPrice: 700.0, lineTotal: 8400.0 }],
  currency: 'EUR',
  totalAmount: 8400.0
};

// 2. Mind 1 queries Telegraph specialists via Anjoman
const caseFile = await investigateProcurement(request);

// 3. Mind 2 independently audits math & multi-miner consensus
const verdict = await reviewAndGateSpend(caseFile);

if (verdict.approved) {
  console.log('Escrow authorized:', verdict.escrowReceipt.settlementId);
} else {
  console.log('Payment held safely:', verdict.primaryReason);
}
```

---

## Live Telegraph Network Coordinates

- **Devnode Miner ID**: `#6127` (Route `#5281`)
- **Sepolia Diamond Registration**: `#6128`
- **Diamond Escrow Port**: `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`
- **Rank Standings**:
  - `CONTRACT_OBLIGATION_AUDIT_GENERAL`: **Rank #1**
  - `PURCHASE_ORDER_VERIFY_GENERAL`: **Rank #1**
  - `SANCTIONS_SCREENING_MATCH_GENERAL`: **Rank #2**
