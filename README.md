# Praman Desk

Procurement, invoice reconciliation, and document provenance verification bought from [Telegraph](https://anjoman.ai/docs) miners (`x402`, Ethereum Sepolia) and cross-checked against the official GLEIF LEI registry and deterministic 3-way arithmetic.

Built for **Telegraph Hackathon Season II** across:
- **Track 3 (Apps & Agents — Mission 04: Legal & Compliance Automation)**: Autonomous procurement & compliance audit desk (`x402` on Ethereum Sepolia, chain `11155111`) that treats every paid miner answer as a claim, compares it with official/deterministic ground truth, and flags schema rejections (`field_status`) and scope gaps.
- **Track 2 (Evaluators)**: **41 EIP-191 signed evaluation cases** admitted (`0` rejected) across 6 Legal & Compliance Intents from contributor wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`, submitted on bounties [#80](https://github.com/telegraphprotocol/bounties/issues/80#issuecomment-6733168110), [#104](https://github.com/telegraphprotocol/bounties/issues/104#issuecomment-6733169440), [#105](https://github.com/telegraphprotocol/bounties/issues/105#issuecomment-6733169054), [#120](https://github.com/telegraphprotocol/bounties/issues/120#issuecomment-6733168350), and [#122](https://github.com/telegraphprotocol/bounties/issues/122#issuecomment-6733168701).
- **Track 1 (Providers / Miner Endpoints)**: Schema-compliant compliance verification endpoints (`/api/miner/invoice-reconcile`, `/api/miner/vendor-verify`, `/api/miner/po-verify`, `/api/miner/doc-authenticity`) addressing the `field_status` rejections and Chicago-only scope limits documented in [telegraphprotocol/bounties#182](https://github.com/telegraphprotocol/bounties/issues/182).

## Quickstart

```bash
git clone https://github.com/VishAlgoDev/praman-desk.git
cd praman-desk
npm install
npm run web   # starts http://127.0.0.1:3402
```

## Settled On-Chain `x402` Purchases (Ethereum Sepolia)

All payments were executed from contributor/buyer wallet [`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`](https://sepolia.etherscan.io/address/0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) in test USDC (`0xcc194e1a843B658526D0D5C431f670028582Ae17`, mint tx [`0xe3cd664f...`](https://sepolia.etherscan.io/tx/0xe3cd664f19587d7d56ba19a365d5be316a8b03b7cfbe5524508bc34689098f88)):

| # | Intent | Miner Routed | Sepolia Payment Tx | Telegraph Node Signal (`GET /engine/v1/signal/<hash>`) | Primary Comparison & Schema Audit |
|---|---|---|---|---|---|
| 1 | `DOCUMENT_AUTHENTICITY_GENERAL` | `FactWire Public Document Provenance (#74351)` | [`0x6e3f7744...`](https://sepolia.etherscan.io/tx/0x6e3f77449af4ae6c2346b0df1d4d6049e979cd9d333829d78d2fc6cf240295bc) | [`0x222eee39...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0x222eee39d4f16fb00b056c8581e84de1f57fefa0038076fa5e0412647ee5ee2e) | `authentic: missing`, false `document length 0` warning; DOI/URL scope only |
| 2 | `PURCHASE_ORDER_VERIFY_GENERAL` | `TradeWire Purchase Order Verify (#7454)` | [`0x8e1b1b80...`](https://sepolia.etherscan.io/tx/0x8e1b1b80314f9847133105ced374879744aa52ed525d8ecf02322d02404e341b) | [`0xb1e4d01c...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xb1e4d01ca78dfe5a3334a5ddef0247c3a05c7ebba17ec19a37f9e7d74ac44378) | `verified: missing`, false `question length 0` warning; hardcoded to City of Chicago POs |
| 3 | `INVOICE_LEDGER_RECONCILE_GENERAL` | `TradeWire Invoice Ledger Reconcile (#7455)` | [`0x113577b2...`](https://sepolia.etherscan.io/tx/0x113577b25d97768fe5ca21493020cd2d9c83b80f030f1073da8f43e9cd551ae7) | [`0xe288451a...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xe288451aeb90347d776549013ee58d464102251307a4a65db0e170d0aed7b679) | Math correct in prose (`INR 1,02,660`), but `reconciled: missing`, `discrepancy: rejected` |
| 4 | `VENDOR_VERIFY_GENERAL` | `TxLens (#9002)` | [`0xae5eee4e...`](https://sepolia.etherscan.io/tx/0xae5eee4ed51f4817c62aba52ac7338b9c84791ffb526f77852f313501a7f34a1) | [`0xb29ff589...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xb29ff58909b0a2f534e7507edfa18012248c7f19519b160c0522d5d89ab7051c) | `valid: rejected`, `registered_address: missing`; no GLEIF/VIES registry query |
| 5 | `REGULATORY_FILING_MONITOR_GENERAL` | `TxLens (#9002)` | [`0x0fea9687...`](https://sepolia.etherscan.io/tx/0x0fea9687b604e07c6714321491eee6314b136e098f6eb3b7044f4b4e7d15e6b8) | [`0xfd2a9f82...`](https://devnode.telegraphprotocol.com/engine/v1/signal/0xfd2a9f82debd6fd041923463e36e0c2fb900cec37dcd1916d22d035b5da0352e) | Fetched 5 SEC EDGAR filings in raw payload, but `filing_count: missing`, `urls: unavailable` |

Full receipts and `GET /engine/v1/signal/<hash>` payloads are in [`evidence/nov14-milestone-receipt.json`](evidence/nov14-milestone-receipt.json).

## Evaluator Pool Contributions (`41` Rows Across `6` Intents)

All datasets in [`eval-data/`](eval-data/) were signed with EIP-191 `personal_sign` (`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`) and admitted to `https://devnode.telegraphprotocol.com/api/evalpool/submissions`:
- `DOCUMENT_AUTHENTICITY_GENERAL` (`10` attested rows — Bounty [#80](https://github.com/telegraphprotocol/bounties/issues/80))
- `INVOICE_LEDGER_RECONCILE_GENERAL` (`10` attested rows, 1st contributor on network — Bounty [#120](https://github.com/telegraphprotocol/bounties/issues/120))
- `PURCHASE_ORDER_VERIFY_GENERAL` (`8` attested rows, 1st contributor on network — Bounty [#122](https://github.com/telegraphprotocol/bounties/issues/122))
- `VENDOR_VERIFY_GENERAL` (`6` attested rows — Bounty [#105](https://github.com/telegraphprotocol/bounties/issues/105))
- `CONTRACT_OBLIGATION_AUDIT_GENERAL` (`6` attested rows)
- `REGULATORY_FILING_MONITOR_GENERAL` (`1` keyless `truth_source` via GLEIF API — Bounty [#104](https://github.com/telegraphprotocol/bounties/issues/104))
