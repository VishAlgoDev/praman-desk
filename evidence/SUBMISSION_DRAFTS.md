# Praman Desk — Ready-to-Post Submission & Community Drafts

> [!IMPORTANT]
> All claims below strictly match live verified system state. Never post `#461` as an active champion (`#461` scored `7/15 = 46.7%` and is `rejected` on Devnode until retrained on GPU with multi-format v4 pairs). Ensure `https://github.com/telegraphprotocol/bounties` is starred from `@VishAlgoDev` before submitting.

---

## 1. GitHub Issue `#1` Resolution Reply (`VishAlgoDev/praman-desk#1`)

Thanks for catching and documenting both edge cases cleanly! We reproduced the exact defect on `/api/miner/invoice-reconcile?invoice_id=INV-2026-081&po_number=PO-2026-7741` (and bare-reference NL queries): numeric fragments inside identifier strings (`2026`, `081`, `7741`) plus a missing-input fallback previously produced a false `reconciled: true`.

**Fixed in the latest commit + live Vercel deployment:**
1. Stripped invoice/PO identifiers, ISO dates, and reference numbers prior to fallback amount extraction, and removed the default synthetic `100 * 250` fallback in `reconcileInvoicePrimary` when line-item/amount evidence is absent. Bare references now deterministically return HTTP 200 with `reconciled: null` and `status: "insufficient_evidence"`.
2. Tightened `evaluateMinerAgreement` (`INVOICE_LEDGER_RECONCILE_GENERAL`), `/api/miner/doc-authenticity` (`signedQrAmount` without `pdfFaceAmount` returning HTTP 200 `insufficient_evidence` instead of 500, plus blocking public/localhost SSRF targets), and OFAC SDN false-positive guards (`"AIA Group Limited"` and `"Ali"` now return `matched: false`, while comma-reversed SDNs like `"Viktor Bout"` -> `"BOUT, Viktor Anatolijevitch"` match cleanly).
3. Expanded `scripts/test-endpoints-local.mjs` and `scripts/deep-audit.mjs` to continuously assert these regression cases against live production (`https://praman-desk.vercel.app`).

Re-verify live:
```bash
curl -s "https://praman-desk.vercel.app/api/miner/invoice-reconcile?invoice_id=INV-2026-081&po_number=PO-2026-7741"
```

---

## 2. Discord `#showcase` Post (Track 1 + Track 2 + Track 3 — Nov 20 Checkpoint)

**Praman Desk — Pre-Payment Spend Guard & Cross-Border Entity Clearing (Missions 02 & 04)**

Live app (no wallet needed): https://praman-desk.vercel.app  
Repo & verification scripts: https://github.com/VishAlgoDev/praman-desk  
Active Miner on Sepolia Diamond: `#5281` (`praman-compliance-miner`)

What we fixed after our brutal self-audit + external issue reports:
- **Miner reliability (`#5281`)**: Fixed NL question stripping across `CORPORATE_REGISTRY_LOOKUP_GENERAL` (GLEIF + UK Companies House fallback), `REGULATORY_FILING_MONITOR_GENERAL` (CIK-resolved SEC EDGAR Submissions API + compliant UA header + Federal Register separation — e.g. Tesla 2025 `10-K` now returns exact count `1` instead of 151 third-party mentions), `VENDOR_VERIFY_GENERAL` (cross-jurisdiction VAT/GLEIF mismatch + Indian GSTIN Mod-36 checksum), and `SANCTIONS_SCREENING_MATCH_GENERAL` (`BOUT, Viktor` comma-name alignment while blocking `"AIA Group Limited"` false positives).
- **Mission 02 & Mission 04 workflows**: Added a dedicated Mission 02 **Stablecoin Gate** tab (`/api/mission/stablecoin-gate` + MCP tool `screen_stablecoin_settlement`) enforcing live Sepolia RPC chain state, USDC balance sufficiency, FATF Travel Rule (`>=$1,000`), delegation caps, ERC-20 `Transfer` WASM verification, and OFAC `REJECT_AND_FREEZE` alongside Mission 04's 5-jurisdiction diligence pack.
- **Honest Track 2 post-mortem**: Our `#461` ModernBERT LoRA challenger passed Stage 1 bit-exact WASM determinism (`0xbfd4f50b`) via Docker, but failed Stage 2 OOD evaluation on Devnode (`7/15 = 46.7%` vs `70%` floor) because single-template synthetic JSON didn't generalize to heterogeneous miner outputs. We've updated the UI/README to document the rejection transparently and built a 5-format `pairs_sanctions_v4.jsonl` dataset pipeline ahead of GPU retraining.

Would love builders running agents or miners on Devnode to hit our hosted endpoints or `mcp/server.mjs` and tell us what breaks!

---

## 3. X / Twitter Post (`@Telegraphprotoc`)

Built Praman Desk on @Telegraphprotoc — an autonomous pre-payment spend firewall for AI agents & treasuries (Missions 02 + 04).

Live: https://praman-desk.vercel.app
GitHub: https://github.com/VishAlgoDev/praman-desk

- Miner #5281 live across 7 compliance & procurement intents (GLEIF, VIES, SEC EDGAR Submissions, Federal Register, OFAC SDN, 3-way math, SHA-256)
- Mission 02 Sepolia USDC gate + 10-tool stdio MCP server (`REJECT_AND_FREEZE`, FATF >=$1k, WASM ERC-20 verify)
- 62 signed Eval Pool rows admitted on Devnode
- Honest Devnode #461 post-mortem: passed bit-exact Stage 1, failed Stage 2 OOD (46.7%) on single-schema pairs -> rebuilt a 5-format dataset pipeline to fix generalization.

Try breaking `/api/miner/invoice-reconcile`, `/api/mission/stablecoin-gate`, or `/api/audit/diligence-pack` and open an issue!

---

## 4. Nov 20 Demo Day Walkthrough Script (3–4 Minutes)

1. **[0:00–0:45] Problem & Architecture**: Show live dashboard at `https://praman-desk.vercel.app`. Explain how autonomous agents paying vendors or releasing USDC lack a pre-payment firewall (phantom entities, 3-way math drift, OFAC comma-name bypasses). Show Miner `#5281` active on Sepolia Diamond & Devnode.
2. **[0:45–1:45] Mission 04 (5-Jurisdiction Diligence + Agent Spend Guard)**: Click `Generate 5-Jurisdiction Diligence Pack` (`US`, `GB`, `DE`, `HK`, `SG` across Apple Inc., HSBC Holdings plc, SAP SE, AIA Group Limited, DBS Group — 16 checks in ~2s vs multi-day law-firm benchmark). Then run `Run Agent Pipeline` on the Spend Guard tab and show 7 primary baseline checks + live WASM restoring-division math + Sepolia x402 / clearing gate decision.
3. **[1:45–2:45] Mission 02 (Stablecoin Gate — Verify & Break Live)**: Open the `Stablecoin Gate (Mission 02)` tab. Click Preset #1 (`Clean Transfer $0.25 USDC`) -> `APPROVE_USDC_TRANSFER` showing live Sepolia block & wallet USDC balance. Then break it live with Preset #2 (`Lazarus Group`) -> instant `REJECT_AND_FREEZE`, Preset #3 (`$99,999`) -> `HOLD_INSUFFICIENT_FUNDS`, and Preset #4 (`$1,500` empty originator) -> `HOLD_TRAVEL_RULE`.
4. **[2:45–3:30] MCP Agent Integration + Honest Track 2 Limitations**: Show `npm run mcp:test` passing all 10 tools (`12/12` checks) over stdio MCP, and show the honest `#461` Devnode rejection card (`7/15 = 46.7%` single-template OOD lesson + local 5-format v4 dataset ready for GPU retraining) alongside the 62 admitted Eval Pool rows.
