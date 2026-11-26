# Telegraph Season II Submission & Partner Reproduction Drafts

Status: READY FOR USER REVIEW AND APPROVAL BEFORE POSTING.
Constraint check: Zero em dashes used anywhere; video referenced strictly as "walkthrough video".

---

## 1. Anjoman App Listing Update (`praman-desk-2`, ID `9ae7025e-65be-490b-8e59-2aa598f16992`)

**Short Tagline:**
Autonomous Pre-Payment Spend Firewall, Alibaba/Takar Escrow Arbiter & 18-Intent Compliance Miner for AI Agents

**Updated Description / Release Notes:**
Praman Desk is an institutional pre-payment spend firewall and deterministic verification node built across all three Telegraph Season II tracks (Apps/Agents, Miners/Providers, and Evaluators/Truth Sources).

What is live and independently reproducible today:
- Live Portal & Zero-Install MCP (18 tools): https://praman-desk.vercel.app and https://praman-desk.vercel.app/api/mcp
- Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
- Active Track 2 Miner: Devnode Route `#6164` (`praman-compliance-miner`) bonded on Sepolia Diamond Registration `#6200` (`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`, tx `0x2ce4e556f2960d0eaf38eeecf49a6158d940225264198e956da03e3b56c12b97`, Block `12213939`) serving 18 bonded intents across procurement math, GLEIF corporate registry, OFAC SDN screening (19,565 entries), SEC EDGAR, CAISO OASIS grid pricing, Uniswap v3 / DexScreener on-chain liquidity, RDAP B2B identity enrichment, fraud risk scoring, and Luhn/BIN/ABA/IBAN payment verification.
- Deterministic 651-Byte WebAssembly Arithmetic Engine: https://praman-desk.vercel.app/comparator.wasm (1,043/1,043 fixed-point vectors verified with zero rounding drift).
- Alibaba Trade Assurance & Takar On-Chain Settlements (Ethereum Sepolia):
  - `TakarSettle v4` (`0x310275e6D66818E068245326bB9e398822304248`) Deal 0 (`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`, Block `12190408`) and Case 1 (`0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13`, Block `12200598`).
  - `TakarSettle5` (`0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B`) Case 2 (`0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de`, Block `12200597`).
- Track 1 Live Autonomous Telegraph Purchases: Recorded genuine `402 -> X-PAYMENT` Devnode escrow receipts (`0x86e237a059ba253f1db3d0bc021d4b2251ab9e2a501b914dfc1fe406f6218f05` direct miner `#6164`, `0x78960519a95283385ea287f106f3bb7412b29ced3e5fbfeec93853f0348e3d87`, `0x624c9be9df7f9d7c7d60e9f1e264265f7bef6a6b6bbb2b3e2e961a31e9be9179`, `0xdf1f4371e66aaf70bb4780aa26709598b53466758d37df6ab435681d64efaa98`, `0x34173ff2faadf56df51e00c2174a19230714a649fa2e37b6350ee20f753ed619`).
- Track 3 EvalPool Provenance: 8 newly signed `attested` evaluation rows submitted across commercial trust and compliance intents (`309` total contributor rows tracked).
- Solana Pre-Signature Spend Guard SDK: Intercepts hijacked `@solana/web3.js` (`1.95.6`/`1.95.7`), drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` TLV extensions, unresolved Address Lookup Tables, and OFAC addresses before signing.

---

## 2. Discord Partner Reproduction Messages

### A. For Anthony (EIP-191 Countersign + PO-ALI-9021 Case Reproduction)
Hey @anthony, sharing two quick reproduction endpoints on Praman Desk so you can test our deterministic countersign guard and shareable case permalink directly:

1. **Real EIP-191 Countersign Verification (`POST https://praman-desk.vercel.app/api/spend-guard/evaluate`)**:
   - Submitting invalid countersign payloads or mismatched `countersignReportHash` / `countersignSignature` now fails closed with `COUNTERSIGN_SIGNATURE_INVALID` and `HOLD_FOR_MANUAL_REVIEW` via viem `recoverMessageAddress`.
   - Non-numeric `spendAmountUsdc` / `statedTotal` inputs reject cleanly with HTTP `400` (`INVALID_NUMERIC_INPUT`) instead of entering WASM scoring.
2. **Shareable Trade Assurance Case (`GET https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html`)**:
   - Renders the reconciled `$80,000` release / `$20,000` refund arbitration result cleanly with the green `RECONCILED_PARTIAL_SETTLEMENT` badge and direct Sepolia TakarSettle v4 + EAS links (`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`).
3. **18-Intent Miner & Live Paid Flow**:
   - Devnode route `#6164` (`praman-compliance-miner`) is now pinned on Sepolia Diamond `#6200` (`0x2ce4e556f2960d0eaf38eeecf49a6158d940225264198e956da03e3b56c12b97`), expanding from 15 to 18 bonded intents with live RDAP B2B identity enrichment, fraud risk scoring, and Luhn/BIN/ABA/IBAN verification.

Let me know if you want a custom EIP-191 payload test vector or MCP config snippet!

### B. For Bangdrop (Takar Escrow Integration & Case 0 / 1 / 2 Sepolia Receipts)
Hey @bangdrop, confirming full on-chain verification for all three Takar escrow resolutions settled by Praman Desk (`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`) on Ethereum Sepolia:

- **Deal 0 (Alibaba PO-ALI-9021 Partial Settlement, TakarSettle v4 `0x310275e6D66818E068245326bB9e398822304248`)**:
  - Tx: https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75 (Block `12190408`)
  - Outcome: `$80,000.00` USDC released to supplier / `$20,000.00` USDC refunded for 20 damaged units, with matching `/api/audit/case?case=po-ali-9021` proof endpoint.
- **Case 1 (Ferry Megastar Dispute, TakarSettle v4 `0x310275e6D66818E068245326bB9e398822304248`)**:
  - Tx: https://sepolia.etherscan.io/tx/0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13 (Block `12200598`, Status: `success`)
- **Case 2 (Quantity Dispute, TakarSettle5 `0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B`)**:
  - Tx: https://sepolia.etherscan.io/tx/0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de (Block `12200597`, Status: `success`)
  - Outcome: `960 / 1,000` conforming units reconciled (`96%` supplier / `4%` refund).

All three receipts are indexed inside Desk 0 & Desk 3 of https://praman-desk.vercel.app. Happy to coordinate any final Season II Takar resolver test cases before Dec 1!

### C. For Ahmed Ali (Season II Submission & Verification Status Check)
Hey @Ahmed Ali, sharing our updated Praman Desk Season II verification checklist ahead of the Dec 1 deadline across all three tracks:

- **Repo & Live Deployment**: https://github.com/VishAlgoDev/praman-desk and https://praman-desk.vercel.app (zero-install MCP at `/api/mcp` with 18 tools, plus `walkthrough video` at https://praman-desk.vercel.app/praman-desk-walkthrough.mp4).
- **Track 01 (Apps & Agents)**: Two-Mind Spend Guard, Alibaba/Takar Escrow Arbiter, Solana Pre-Signature Spend Guard (including Token-2022 PermanentDelegate / TransferHook / FreezeAuthority TLV detection), plus genuine paid Devnode `402 -> X-PAYMENT` escrow receipts (`0x86e237a059ba253f1db3d0bc021d4b2251ab9e2a501b914dfc1fe406f6218f05` direct on miner `#6164`).
- **Track 02 (Miner #6164 / Diamond #6200)**: Just executed live Sepolia `updateMiner` (`6199 -> 6200`, tx `0x2ce4e556f2960d0eaf38eeecf49a6158d940225264198e956da03e3b56c12b97`, Block `12213939`) expanding our YAML from 15 to 18 bonded intents with live B2B identity, fraud risk, and payment method verification handlers.
- **Track 03 (Evaluators / Truth Sources)**: Submitted `8` newly signed `attested` evaluation rows on Devnode EvalPool (`309` contributor rows tracked, private raw JSONL kept strictly outside the public repo) backed by our `651-byte` WebAssembly deterministic comparator (`1,043/1,043` test cases).

Could you confirm everything looks clean on the Season II indexing side for `praman-desk-2` (`9ae7025e-65be-490b-8e59-2aa598f16992`) and Diamond `#6200`?

---

## 3. Three Technical X Posts (`@vishal_karad` tagging `@Telegraphprotoc`)

### Post 1 (Track 01 & Takar On-Chain Arbitration + Walkthrough Video)
Autonomous AI agents fail expensively when payment math drifts by even 1 cent or an invoice skips inspection.

We built Praman Desk on @Telegraphprotoc: a pre-payment spend firewall with a 651-byte WASM arithmetic engine, real EIP-191 countersigning, and live Sepolia Takar escrow resolutions (`$80k` settled / `$20k` refunded).

Watch our walkthrough video and test the live console:
https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75

### Post 2 (Track 02 18-Intent Diamond `#6200` Upgrade & Real Paid Devnode `402 -> X-PAYMENT` Receipts)
Praman Desk Miner `#6164` just upgraded live on @Telegraphprotoc Sepolia Diamond to Registration `#6200` (18 bonded intents, tx `0x2ce4e556...`, Block `12213939`).

Now serving keyless live intelligence across GLEIF, OFAC SDN (19,565 entities), SEC EDGAR, CAISO OASIS, Uniswap v3 / DexScreener depth, RDAP B2B identity enrichment, fraud risk scoring, and Luhn/BIN/ABA/IBAN verification.

Genuine Devnode paid `402 -> X-PAYMENT` escrow receipt on miner `#6164`: `0x86e237a059ba253f1db3d0bc021d4b2251ab9e2a501b914dfc1fe406f6218f05`
https://sepolia.etherscan.io/tx/0x2ce4e556f2960d0eaf38eeecf49a6158d940225264198e956da03e3b56c12b97

### Post 3 (Solana Pre-Signature Spend Guard & Track 03 Attested EvalPool)
Supply-chain backdoors like `@solana/web3.js` 1.95.6 and malicious Token-2022 extensions drain agent wallets before RPC ever sees a tx.

Our Solana Pre-Signature Spend Guard stops hijacked queues, drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` mints, unresolved ALTs, and OFAC targets before Ed25519 signing, paired with Track 03 attested EvalPool datasets on @Telegraphprotoc.

Open-source SDK, MCP (`/api/mcp`, 18 tools), and reproducible tests:
https://github.com/VishAlgoDev/praman-desk
https://praman-desk.vercel.app

---

## 4. Final Hackathon Season II Track Blurbs (Before Dec 1, 2026 23:59 UTC)

### Track 01: Apps & Agents (`Praman Desk`)
Praman Desk (`praman-desk-2`, Anjoman ID `9ae7025e-65be-490b-8e59-2aa598f16992`) is a pre-payment spend firewall and cross-border escrow arbiter for autonomous AI agents. It combines a collaborative Two-Mind Spend Guard (Investigator Mind + Reviewer Mind), an Alibaba & Cainiao Trade Assurance arbiter settling live disputes on Ethereum Sepolia (`TakarSettle v4` & `TakarSettle5`), a Solana Pre-Signature Spend Guard protecting legacy and `v0` transactions against `web3.js` supply-chain hooks and Token-2022 TLV exploits, and an 18-tool Streamable HTTP MCP server (`/api/mcp`). Across counterfactual simulations it averted `$79,373` in bad disbursements, and its live Node/SDK demos settle real Devnode `402 -> X-PAYMENT` purchases (`0x86e237a059ba253f1db3d0bc021d4b2251ab9e2a501b914dfc1fe406f6218f05`).

### Track 02: Miners / Providers (`Praman Desk Compliance & Procurement Auditor`)
Bonded on Ethereum Sepolia Diamond `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` under active Devnode Route `#6164` (`praman-compliance-miner`) and Diamond Registration `#6200` (tx `0x2ce4e556f2960d0eaf38eeecf49a6158d940225264198e956da03e3b56c12b97`, Block `12213939`, pinned SHA-256 `0x630144505d27712b15ec663c1ec252eeafc8066ee0a822af6c8c9e0d95f11ceb`), Praman serves 18 deterministic compliance, financial, energy, on-chain liquidity, and commercial-trust intents without API keys: 3-way invoice/PO/contract math via 651-byte WASM, GLEIF LEI lookups, 19,565-entry OFAC SDN screening, SEC EDGAR / Federal Register monitoring, CAISO OASIS LMP, Ethereum/Sepolia JSON-RPC + Uniswap v3 / DexScreener depth, RDAP + DNS MX B2B enrichment, fraud risk scoring, and Luhn/BIN/ABA/IBAN verification, all failing closed when any upstream feed is unavailable.

### Track 03: Evaluators / Truth Sources (`Praman 651-Byte WASM Comparator & Attested EvalPool`)
Praman anchors deterministic commercial verification via a standalone `651-byte` zero-import WebAssembly binary (`comparator.wasm`, `1,043/1,043` bit-exact fixed-point test cases) paired with signed `provenance_class: "attested"` EvalPool preference submissions on Devnode (`8` newly admitted attested rows across `B2B_IDENTITY_ENRICHMENT_GENERAL`, `FRAUD_RISK_GENERAL`, `PAYMENT_METHOD_VERIFY_GENERAL`, `CORPORATE_REGISTRY_LOOKUP_GENERAL`, and `REGULATORY_FILING_MONITOR_GENERAL`, totaling `309` contributor rows). Raw ground-truth `.jsonl` files remain excluded from Git (`eval-data/` in `.gitignore`) so benchmark vectors stay uncontaminated.
