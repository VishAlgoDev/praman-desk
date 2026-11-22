### Track 3 Contribution: Ground-Truth Evaluation Suites & Truth Sources

**Submitter**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`  
**Network**: `Telegraph Protocol Season II Devnode (Chain ID 11155111)`  
**Submission Timestamp**: `2026-11-22T16:47:45.114Z`

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
    - Multi-jurisdictional tax rounding, cross-currency payment tolerances, and statutory interest overrides


- **Intent**: `PURCHASE_ORDER_VERIFY_GENERAL` (Bounty #122)
  - **Title**: Enterprise Multi-Tax & Currency Split Purchase Order Truths
  - **Rows**: 8 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0`
  - **Domain Coverage**: Enterprise AP / Procurement (Mission 03 & 04)
  - **Key Edge Cases Covered**:
    - Line item quantity x unit price arithmetic discrepancy vs PO header subtotal
    - Dual-signoff thresholds exceeded for single-approver delegation caps ($50,000 threshold)
    - Multi-jurisdiction VAT/GST split calculations and reverse-charge mechanisms
    - Freight, customs tariff, and insurance variance reconciliation against stated grand totals


- **Intent**: `INVOICE_LEDGER_RECONCILE_GENERAL` (Bounty #120)
  - **Title**: 3-Way Invoice vs ERP General Ledger Reconciliation Ground Truths
  - **Rows**: 10 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7`
  - **Domain Coverage**: Treasury & Financial Clearing (Mission 03)
  - **Key Edge Cases Covered**:
    - 3-way match variances: invoice billing gross delivery vs GRN net accepted quantity
    - ERP general ledger clearing account reconciliation and unapplied credit note offsets
    - Partial milestone payment tie-outs across multi-stage procurement deliveries
    - Foreign exchange rate variance between purchase order commitment date and invoice payment date


- **Intent**: `MINING_INTELLIGENCE_GENERAL` (Bounty #218)
  - **Title**: Geological Survey of Queensland (GSQ) Historical Mining Ground Truths
  - **Rows**: 11 high-fidelity preference pairs (`chosen` vs `rejected`)
  - **SHA-256**: `399a56d534f64dcbe0def62201c118a710b0eb3db80245599d0cd303c018f850`
  - **Domain Coverage**: Gold Rush Challenge / Historical Mining Intelligence (Track 3 Evaluator)
  - **Key Edge Cases Covered**:
    - Geological Survey of Queensland (GSQ) exploration tenement permits and tenure boundary verification
    - Palmer River historical gold/copper production figures, alluvial yield, and CR open-file report cross-referencing
    - Assay laboratory drill-core PPM grade verification vs reported drill intercepts
    - Abandoned shaft hazard clearance, environmental authority compliance, and rehabilitation liability reserves


#### Cryptographic EvalPool Evidence

All datasets have been cryptographically signed with EIP-191 personal signatures and uploaded to the live Telegraph Season II EvalPool at `https://devnode.telegraphprotocol.com`.

```json
[
  {
    "intentId": "CONTRACT_OBLIGATION_AUDIT_GENERAL",
    "sha256": "ff9976d383ccb5dbad1ffeb7672820ff0b8bd83bb852a1fa29af2f166093080c",
    "signature": "0x5b9ce2a2bafc7f1895...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "PURCHASE_ORDER_VERIFY_GENERAL",
    "sha256": "3ad30696e1e21be2a5c54a8717018e29be12a10575259f6c49759ed23596fea0",
    "signature": "0x9cc708008c596910f7...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "INVOICE_LEDGER_RECONCILE_GENERAL",
    "sha256": "450a9208f632d54f9fc3e0af0fb4fe981f2887ce0b1db3a48ea8efe30d84bce7",
    "signature": "0x130906a1eb397a66c4...",
    "uploadStatus": "accepted"
  },
  {
    "intentId": "MINING_INTELLIGENCE_GENERAL",
    "sha256": "399a56d534f64dcbe0def62201c118a710b0eb3db80245599d0cd303c018f850",
    "signature": "0x972a18f6c74a06dca5...",
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
