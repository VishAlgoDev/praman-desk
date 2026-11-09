# Ready-to-Paste Discord `#hackathon` Post (Nov 14 Integration Milestone)

Copy and paste the block below into the **`#hackathon`** channel on the Telegraph Protocol Discord server:

```markdown
**Season II (H2) — First Integration Milestone & Evaluator Admissions (Mission #04: Legal & Enterprise Compliance)**

- **Contributor / Payer Wallet (`Sepolia`)**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **GitHub**: `@VishAlgoDev`

**1. Live Paid `x402` Purchase Evidence (`POST /engine/v1/ask`)**
- **Call #1 — `DOCUMENT_AUTHENTICITY_GENERAL` (`FactWire Public Document Provenance #74351`)**
  - **On-Chain Sepolia Settlement Tx**: `0x6e3f77449af4ae6c2346b0df1d4d6049e979cd9d333829d78d2fc6cf240295bc`
  - **Telegraph Receipt Hash**: `0x1a02b7861243e49ecd9d9e6f20559158bd00bff3a58ba26bfca8c81a418b9865`
  - **Signal Hash (`keccak256` verified)**: `0x222eee39d4f16fb00b056c8581e84de1f57fefa0038076fa5e0412647ee5ee2e`
  - **Request**: `{"query": "[DOCUMENT_AUTHENTICITY_GENERAL] Verify document authenticity for GST NIC e-Invoice IRN 64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012 where signed QR payload states InvoiceValue INR 14,16,000 but PDF face states INR 18,88,000."}`
  - **Response**: `HTTP 200` (`result_id: c221bd5f-e41b-4aac-bfab-8e5896ee211a`, `cost_usd: 0.01`, `duration_ms: 118`)

- **Call #2 — `PURCHASE_ORDER_VERIFY_GENERAL` (`TradeWire Purchase Order Verify #7454`)**
  - **On-Chain Sepolia Settlement Tx**: `0x8e1b1b80314f9847133105ced374879744aa52ed525d8ecf02322d02404e341b`
  - **Telegraph Receipt Hash**: `0x147965552e6bb29aae62bacb7cdfcee00b659c4f023c229cb368926efec2b07a`
  - **Signal Hash (`keccak256` verified)**: `0xb1e4d01ca78dfe5a3334a5ddef0247c3a05c7ebba17ec19a37f9e7d74ac44378`
  - **Request**: `{"query": "[PURCHASE_ORDER_VERIFY_GENERAL] Verify ERP Purchase Order PO-ERP-2026-7741 for INR 1,85,00,000 under Vendor V-10492 where Level-2 VP approval cap is INR 1,00,00,000 and CFO/MD joint sign-off is missing."}`
  - **Response**: `HTTP 200` (`result_id: cafdd09c-ade6-4cb0-bb64-5c1794549d8b`, `cost_usd: 0.01`, `duration_ms: 58`)

**2. Track 2 (Evaluators) — 41 Admitted Rows Across 6 Legal/Enterprise Intents (`0` Rejected)**
- `DOCUMENT_AUTHENTICITY_GENERAL` ([Bounty #80](https://github.com/telegraphprotocol/bounties/issues/80#issuecomment-6733168110)): `10` attested `preference_pair` rows admitted
- `INVOICE_LEDGER_RECONCILE_GENERAL` ([Bounty #120](https://github.com/telegraphprotocol/bounties/issues/120#issuecomment-6733168350)): `10` attested `preference_pair` rows admitted (1st contributor in pool)
- `PURCHASE_ORDER_VERIFY_GENERAL` ([Bounty #122](https://github.com/telegraphprotocol/bounties/issues/122#issuecomment-6733168701)): `8` attested `preference_pair` rows admitted (1st contributor in pool)
- `VENDOR_VERIFY_GENERAL` ([Bounty #105](https://github.com/telegraphprotocol/bounties/issues/105#issuecomment-6733169054)): `6` attested `preference_pair` rows admitted
- `CONTRACT_OBLIGATION_AUDIT_GENERAL`: `6` attested `preference_pair` rows admitted
- `REGULATORY_FILING_MONITOR_GENERAL` ([Bounty #104](https://github.com/telegraphprotocol/bounties/issues/104#issuecomment-6733169440)): `1` keyless public `truth_source` (GLEIF API) admitted
```
