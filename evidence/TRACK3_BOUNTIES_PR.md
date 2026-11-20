### Track 3 Contribution: Ground-Truth Evaluation Suites & Truth Sources

**Submitter**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`  
**Network**: `Telegraph Protocol Season II Devnode (Chain ID 11155111)`  
**Submission Timestamp**: `2026-11-20T01:20:43.099Z`

#### Summary of Datasets Submitted


- **Intent**: `CONTRACT_OBLIGATION_AUDIT_GENERAL` (Bounty #192)
  - **Title**: Statutory & FIDIC Commercial Contract Obligation Ground Truths
  - **Rows**: 6 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `ff9976d383ccb5dbad1ffeb7672820ff0b8bd83bb852a1fa29af2f166093080c`
  - **Domain Coverage**: Legal & Construction Procurement (Mission 04)
  - **Key Edge Cases Covered**:
    - MahaRERA Section 18 statutory delay interest vs ordinary force majeure claims
    - FIDIC Silver Book Sub-Clause 20.1 28-day notice time-bars on EOT claims
    - MEP turnkey 50/50 retention money bank guarantee validity windows
    - Statutory delay interest overrides and cross-jurisdictional contractual penalties


- **Intent**: `PURCHASE_ORDER_VERIFY_GENERAL` (Bounty #122)
  - **Title**: Enterprise Multi-Tax & Currency Split Purchase Order Truths
  - **Rows**: 8 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0`
  - **Domain Coverage**: Enterprise AP / Procurement (Mission 03 & 04)
  - **Key Edge Cases Covered**:
    - 2-way vs 3-way line item price and quantity tolerance thresholds (100 bps)
    - Cross-currency PO matching with European VAT and Indian GST split-rate structures
    - Detection of unapproved line-item quantity inflation vs original authorized PO
    - Encumbered vendor accounts and altered payment disbursement instructions


- **Intent**: `INVOICE_LEDGER_RECONCILE_GENERAL` (Bounty #120)
  - **Title**: 3-Way Invoice vs ERP General Ledger Reconciliation Ground Truths
  - **Rows**: 10 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7`
  - **Domain Coverage**: Treasury & Financial Clearing (Mission 03)
  - **Key Edge Cases Covered**:
    - Sub-cent floating point rounding drift in fractional tax allocations
    - Inverted foreign exchange cross-rates in international supplier settlements
    - Duplicate invoice submission with minor variance in alphanumeric numbering
    - Unmatched credit notes and unapplied retention offsets in general ledger postings


- **Intent**: `MINING_INTELLIGENCE_GENERAL` (Bounty #218)
  - **Title**: Authoritative Geological Survey Historical Mining Ground Truths
  - **Rows**: 6 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `26bc22c0fb90db04a9d061b4e6f1de79df5ef979b46b2ee4a9e76b459b79dda1`
  - **Domain Coverage**: Gold Rush Challenge / Deep Geological Intelligence (Track 3 Evaluator)
  - **Key Edge Cases Covered**:
    - Conflicting historical yield estimates between colonial gazettes and modern resource audits (alluvial vs lode mining yields)
    - Inconsistent deposit classifications (e.g. VHMS replacement vs epithermal quartz reef vs mesothermal shear zones)
    - Historical discoverer and syndicate attribution disputes across statutory tenement gazettes
    - Unit conversion discrepancies (long tons vs short tons vs metric tonnes; troy ounces vs avoirdupois ounces)
    - Historical flooding, mundic sulfide refractory treatment crises, and tailings retreatment yields
    - Distinguishing active exploration tenements from historical heritage-listed reserves in open data portals


#### Cryptographic EvalPool Evidence

All datasets have been cryptographically signed with EIP-191 personal signatures and uploaded to the live Telegraph Season II EvalPool at `https://devnode.telegraphprotocol.com`.

```json
[
  {
    "intentId": "CONTRACT_OBLIGATION_AUDIT_GENERAL",
    "sha256": "ff9976d383ccb5dbad1ffeb7672820ff0b8bd83bb852a1fa29af2f166093080c",
    "signature": "0x5c7b3a3243ff4c8c1b...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "PURCHASE_ORDER_VERIFY_GENERAL",
    "sha256": "3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0",
    "signature": "0x35f180a50376e6a459...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "INVOICE_LEDGER_RECONCILE_GENERAL",
    "sha256": "450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7",
    "signature": "0x892a019485bb34892c...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "MINING_INTELLIGENCE_GENERAL",
    "sha256": "26bc22c0fb90db04a9d061b4e6f1de79df5ef979b46b2ee4a9e76b459b79dda1",
    "signature": "0x6f9175d710d80c0587...",
    "uploadStatus": "accepted"
  }
]
```

#### Reproducible Evaluation Runner

```bash
# Execute deterministic evaluation adapter across ground-truth suite
node examples/gold-rush-evaluator/gold-rush-evaluator-adapter.mjs

# Run cross-miner discrepancy arbitrator
node examples/gold-rush-aggregator/gold-rush-aggregator.mjs
```
