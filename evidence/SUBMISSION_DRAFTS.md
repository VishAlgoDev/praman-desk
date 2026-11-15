# Praman Desk — Ready-to-Post Submission & Community Drafts

> [!IMPORTANT]
> All claims below strictly match live verified system state. Never post `#461` as an active champion (`#461` scored `7/15 = 46.7%` and is `rejected` on Devnode until retrained on GPU with multi-format v4 pairs). Ensure `https://github.com/telegraphprotocol/bounties` is starred from `@VishAlgoDev` before submitting.

---

## 1. GitHub Issue `#1` Resolution Reply (`VishAlgoDev/praman-desk#1`)

Thanks for catching and documenting both edge cases cleanly (`@epistemedeus`)! We reproduced the exact defects:
1. Bare reference strings (`Document reference 48291` vs `Receipt reference 48291`) previously matched `48291` via the last-number fallback and returned `reconciled: true`.
2. Suffix currency amounts & zero-paid ledgers (`Invoice total 102660.00 INR; reference ID 48291` vs `Ledger paid 0.00 INR; reference ID 48291`) needed explicit suffix currency parsing (`102660.00 INR`) and `0.00` financial total preservation without letting `reference ID 48291` alter the variance.
3. The buyer comparator (`evaluateMinerAgreement`) previously accepted omitted booleans or mismatched discrepancy values.

**Fixed in `src/handlers.mjs` and deployed live to `https://praman-desk.vercel.app`:**
- `extractAmountList()` now strips invoice/PO/reference identifiers, `#refs`, ISO dates, and years before fallback amount parsing, removes the silent `100 * 250` fallback, accepts both prefix and suffix currency tags (including explicit `0.00` paid totals), and returns HTTP `200` with `reconciled: null, discrepancy: null, status: "insufficient_evidence"` when monetary evidence is absent.
- `evaluateMinerAgreement()` now uses strict numeric parsing (`parseStrictNumber`), requires `typeof result.reconciled === 'boolean'`, a present finite numeric `discrepancy` (not boolean), `wasmScore >= 5000`, and blocks `'confirmed'` whenever `field_status.reconciled` or `field_status.discrepancy` is `'missing' | 'rejected' | 'unavailable'` — rejecting `{discrepancy: 102660}`, `{reconciled: 0, discrepancy: 102660}`, `{reconciled: false, discrepancy: 102660}` with `field_status.reconciled: "missing"`, `{reconciled: true}`, and `{reconciled: true, discrepancy: 102660}` while confirming exact and mismatch controls.
- Expanded `scripts/test-endpoints-local.mjs` and `scripts/deep-audit.mjs` to assert all 5 comparator release checks alongside both live HTTP bare-reference and `102660.00 INR` vs `0.00 INR` + `; reference ID 48291` cases.

Re-verify live:
```bash
# 1. Bare references stay inconclusive
curl -sS https://praman-desk.vercel.app/api/miner/invoice-reconcile \
  -H 'Content-Type: application/json' \
  --data '{"params":{"invoice":"Document reference 48291","ledger":"Receipt reference 48291"}}'

# 2. Appending reference ID preserves exact 102660 variance
curl -sS https://praman-desk.vercel.app/api/miner/invoice-reconcile \
  -H 'Content-Type: application/json' \
  --data '{"params":{"invoice":"Invoice total 102660.00 INR; reference ID 48291","ledger":"Ledger paid 0.00 INR; reference ID 48291"}}'
```

---

## 2. Discord `#showcase` Post (Track 1 + Track 2 + Track 3 — Nov 20 Checkpoint)

**Praman Desk — Pre-Payment Spend Guard & Cross-Border Entity Clearing (Missions 02 & 04)**

Live app (no wallet needed): https://praman-desk.vercel.app  
Repo & verification scripts: https://github.com/VishAlgoDev/praman-desk  
Active Miner on Sepolia Diamond: `#5289` (`praman-compliance-miner`, updated from `#5281`)

What we fixed after our brutal self-audit + external issue reports:
- **Miner reliability (`#5289`)**: Fixed NL question stripping across `CORPORATE_REGISTRY_LOOKUP_GENERAL` (GLEIF + UK Companies House fallback), `REGULATORY_FILING_MONITOR_GENERAL` (CIK-resolved SEC EDGAR Submissions API + compliant UA header + Federal Register separation — e.g. Tesla 2025 `10-K` now returns exact count `1` instead of 151 third-party mentions), `VENDOR_VERIFY_GENERAL` (cross-jurisdiction VAT/GLEIF mismatch + Indian GSTIN Mod-36 checksum), and `SANCTIONS_SCREENING_MATCH_GENERAL` (`BOUT, Viktor` comma-name alignment while blocking `"AIA Group Limited"` false positives).
- **Mission 02 & Mission 04 workflows**: Added a dedicated Mission 02 **Stablecoin Gate** tab (`/api/mission/stablecoin-gate` + MCP tool `screen_stablecoin_settlement`) enforcing live Sepolia RPC chain state, USDC balance sufficiency, FATF Travel Rule (`>=$1,000`), delegation caps, ERC-20 `Transfer` WASM verification, and OFAC `REJECT_AND_FREEZE` alongside Mission 04's 5-jurisdiction diligence pack.
- **Honest Track 2 post-mortem**: Our `#461` ModernBERT LoRA challenger passed Stage 1 bit-exact WASM determinism (`0xbfd4f50b`) via Docker, but failed Stage 2 OOD evaluation on Devnode (`7/15 = 46.7%` vs `70%` floor) because single-template synthetic JSON didn't generalize to heterogeneous miner outputs. We've updated the UI/README to document the rejection transparently and built a 5-format `pairs_sanctions_v4.jsonl` dataset pipeline ahead of GPU retraining.

Would love builders running agents or miners on Devnode to hit our hosted endpoints or `mcp/server.mjs` and tell us what breaks!

---

## 3. X / Twitter Post (`@Telegraphprotoc`)

Built Praman Desk on @Telegraphprotoc — an autonomous pre-payment spend firewall for AI agents & treasuries (Missions 02 + 04).

Live: https://praman-desk.vercel.app
GitHub: https://github.com/VishAlgoDev/praman-desk

- Miner #5289 live across 7 compliance & procurement intents (GLEIF, VIES, SEC EDGAR Submissions, Federal Register, OFAC SDN, 3-way math, SHA-256)
- Mission 02 Sepolia USDC gate + 10-tool stdio MCP server (`REJECT_AND_FREEZE`, FATF >=$1k, WASM ERC-20 verify)
- 62 signed Eval Pool rows admitted on Devnode
- Honest Devnode #461 post-mortem: passed bit-exact Stage 1, failed Stage 2 OOD (46.7%) on single-schema pairs -> rebuilt a 5-format dataset pipeline to fix generalization.

Try breaking `/api/miner/invoice-reconcile`, `/api/mission/stablecoin-gate`, or `/api/audit/diligence-pack` and open an issue!

---

## 4. Nov 20 Demo Day Walkthrough Script (3–4 Minutes)

1. **[0:00–0:45] Problem & Architecture**: Show live dashboard at `https://praman-desk.vercel.app`. Explain how autonomous agents paying vendors or releasing USDC lack a pre-payment firewall (phantom entities, 3-way math drift, OFAC comma-name bypasses). Show Miner `#5289` active on Sepolia Diamond & Devnode.
2. **[0:45–1:45] Mission 04 (5-Jurisdiction Diligence + Agent Spend Guard)**: Click `Generate 5-Jurisdiction Diligence Pack` (`US`, `GB`, `DE`, `HK`, `SG` across Tesla, Inc., HSBC Holdings plc, SAP SE, AIA Group Limited, DBS Group Holdings Ltd — 16 checks in ~2s vs multi-day law-firm benchmark). Then run `Run Agent Pipeline` on the Spend Guard tab and show 7 primary baseline checks + live WASM restoring-division math + Sepolia x402 / clearing gate decision.
3. **[1:45–2:45] Mission 02 (Stablecoin Gate — Verify & Break Live)**: Open the `Stablecoin Gate (Mission 02)` tab. Click Preset #1 (`Clean Transfer $0.25 USDC`) -> `APPROVE_USDC_TRANSFER` showing live Sepolia block & wallet USDC balance. Then break it live with Preset #2 (`Lazarus Group`) -> instant `REJECT_AND_FREEZE`, Preset #3 (`$99,999`) -> `HOLD_INSUFFICIENT_FUNDS`, and Preset #4 (`$1,500` empty originator) -> `HOLD_TRAVEL_RULE`.
4. **[2:45–3:30] MCP Agent Integration + Honest Track 2 Limitations**: Show `npm run mcp:test` passing all 10 tools (`15/15` checks) over stdio MCP, and show the honest `#461` Devnode rejection card (`7/15 = 46.7%` single-template OOD lesson + local 5-format v4 dataset ready for GPU retraining) alongside the 62 admitted Eval Pool rows.
