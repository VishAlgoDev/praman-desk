### Track 3 Contribution: Ground-Truth Evaluation Suites & Truth Sources

**Submitter**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`  
**Network**: `Telegraph Protocol Season II Devnode (Chain ID 11155111)`  
**Submission Timestamp**: `2026-11-23T01:30:27.127Z`

#### Summary of Datasets Submitted


- **Intent**: `CONTRACT_OBLIGATION_AUDIT_GENERAL` (Bounty #192)
  - **Title**: Statutory & FIDIC Commercial Contract Obligation Ground Truths
  - **Rows**: 6 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `ff9976d383ccb5dbad1ffeb7672820ff0b8bd83bb852a1fa29af2f166093080c`
  - **Domain Coverage**: Legal & Construction Procurement (Mission 04)
  - **Key Edge Cases Covered**:
    - FIDIC Silver Book Sub-Clause 20.1 28-day notice time-bars on Contractor claims
    - Delay liquidated damages vs statutory interest rate caps and force majeure exceptions
    - Retention money release preconditions, Defect Liability Period (DLP) milestones, and bank guarantee validity
    - Cross-border governing law clauses, arbitration rules (ICC / LCIA / SIAC), and payment dispute escalation


- **Intent**: `PURCHASE_ORDER_VERIFY_GENERAL` (Bounty #122)
  - **Title**: Enterprise Multi-Tax & Currency Split Purchase Order Truths
  - **Rows**: 8 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0`
  - **Domain Coverage**: Enterprise AP / Procurement (Mission 03 & 04)
  - **Key Edge Cases Covered**:
    - Incoterms 2020 delivery obligations (DAP vs CIF vs FOB risk transfer points)
    - Multi-currency unit price conversions and authorized FX rate fluctuation tolerances (±0.5%)
    - Blanket PO call-off balance depletion and line-item quantity over-shipment tolerances
    - Milestone billing matching: advance payment vs milestone delivery against verified Bill of Lading (BL)


- **Intent**: `INVOICE_LEDGER_RECONCILE_GENERAL` (Bounty #120)
  - **Title**: 3-Way Invoice vs ERP General Ledger Reconciliation Ground Truths
  - **Rows**: 10 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7`
  - **Domain Coverage**: Treasury & Financial Clearing (Mission 03)
  - **Key Edge Cases Covered**:
    - 3-way match reconciliation: Purchase Order vs Vendor Invoice vs Cainiao / Port Receiving Log (shortage detection)
    - Automated prompt-payment discount application (2/10 Net 30) vs late penalty grace periods
    - Multi-jurisdictional VAT/GST statutory withholding, reverse charge rules, and tax invoice rounding
    - Escrow freeze and circuit breaker activation on discrepancies exceeding threshold (> $5,000 variance)


- **Intent**: `MINING_INTELLIGENCE_GENERAL` (Bounty #218)
  - **Title**: Geological Survey of Queensland (GSQ) Historical Mining Ground Truths
  - **Rows**: 11 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `399a56d534f64dcbe0def62201c118a710b0eb3db80245599d0cd303c018f850`
  - **Domain Coverage**: Gold Rush Challenge / Historical Mining Intelligence (Track 3 Evaluator)
  - **Key Edge Cases Covered**:
    - Mount Morgan Mine historical production records (262t Au, 387,000t Cu)
    - Gympie, Charters Towers, and Palmer River goldfield historical yields
    - Open-source GSQ and Queensland DNRME survey record validation


- **Intent**: `GRID_POWER_PRICE_GENERAL` (Bounty #219)
  - **Title**: ISO Wholesale Locational Marginal Power Price Ground Truths
  - **Rows**: 6 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **Domain Coverage**: CAISO, ERCOT, and PJM Wholesale Power Settlement (Track 3 Evaluator)
  - **Devnode EvalPool Consensus**: 7 submitters, 229 eligible consensual rows (ACTIVE)
  - **Key Edge Cases Covered**:
    - CAISO NP15 evening duck curve net load ramp vs day-ahead LMP ($142.80 vs $54.20/MWh)
    - ERCOT Houston Hub vs West Zone negative wind curtailment pricing basis differentials
    - PJM Western Hub peak summer heatwave transmission line thermal de-rates & MCC components


- **Intent**: `OPTIMAL_EXECUTION_ROUTE_GENERAL` (Bounty #220)
  - **Title**: Cross-Chain & DEX Optimal Execution Routing Truths
  - **Rows**: 5 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **Domain Coverage**: EVM DEX Aggregation, Concentrated Liquidity & L2 Bridge Latencies
  - **Devnode EvalPool Consensus**: 8 submitters, 312 eligible consensual rows (ACTIVE)
  - **Key Edge Cases Covered**:
    - Uniswap v3 fee tier tick math (0.05% vs 0.30% vs 1.00%) for deep liquidity pairs
    - Curve Stableswap amplification coefficient dynamic peg invariance
    - Native L2 canonical bridge security vs fast third-party liquidity bridge slippage


- **Intent**: `TASK_EXECUTION_QUALITY_GENERAL` (Bounty #221)
  - **Title**: Autonomous Agent Task Execution & Math Fidelity Ground Truths
  - **Rows**: 5 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **Domain Coverage**: Anti-Hallucination, OFAC SDN Enforcement & Bit-Exact WASM Arithmetic
  - **Devnode EvalPool Consensus**: 13 submitters, 264 eligible consensual rows (ACTIVE)
  - **Key Edge Cases Covered**:
    - Bit-exact IEEE-754 3-way line-item invoice reconciliation via compiled WebAssembly
    - US Treasury OFAC Specially Designated Nationals (SDN) trie enforcement vs evasive typosquats
    - Adversarial prompt injection jailbreak detection and immutable circuit breaker tripping


#### Cryptographic EvalPool Evidence

All datasets have been cryptographically signed with EIP-191 personal signatures and uploaded to the live Telegraph Season II EvalPool at `https://devnode.telegraphprotocol.com`.

```json
[
  {
    "intentId": "CONTRACT_OBLIGATION_AUDIT_GENERAL",
    "sha256": "ff9976d383ccb5dbad1ffeb7672820ff0b8bd83bb852a1fa29af2f166093080c",
    "signature": "0xb9c9c98186d7bf6cf3...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "PURCHASE_ORDER_VERIFY_GENERAL",
    "sha256": "3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0",
    "signature": "0x402acb987c160bab13...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "INVOICE_LEDGER_RECONCILE_GENERAL",
    "sha256": "450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7",
    "signature": "0x51d86b6fd38913918c...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "MINING_INTELLIGENCE_GENERAL",
    "sha256": "399a56d534f64dcbe0def62201c118a710b0eb3db80245599d0cd303c018f850",
    "signature": "0xa2a980332ac81c9d6d...",
    "uploadStatus": "accepted"
  }
]
```

#### Verification Instructions

```bash
# Verify integrity of datasets
node scripts/submit-track3-evaluator-dataset.mjs
# Check live pool status
node scripts/check-eval-status.mjs
```
