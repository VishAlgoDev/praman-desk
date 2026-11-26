# Telegraph Season II Submission & Partner Reproduction Drafts

Status: READY FOR USER REVIEW AND APPROVAL BEFORE EXTERNAL POSTING.
Constraint check: Zero em dashes used anywhere; video referenced strictly as "walkthrough video".

---

## 0. Manual User Gates Before Publishing (`Checkpoint B`)

1. **Solana Devnet Web Faucet (Manual Browser Action)**:
   - Visit `https://faucet.solana.com`, select `Devnet`, paste address `3r428Z8YSgQFJpsyPcQyxmt1faQQBuNRpqz92m9ucbuL`, claim `1-2 Devnet SOL` (automated RPC `requestAirdrop` returns HTTP `410` on Devnet).
   - Once funded, run `npm run solana:test` in `telegraph-h2/` to broadcast a live guarded Devnet settlement transaction (`TEST 7`).
2. **Minds (`hellominds.ai`) Live Publish (Manual Browser Action)**:
   - On `https://hellominds.ai`, connect `https://praman-desk.vercel.app/api/mcp` (`18` Streamable HTTP tools) and HTTP tool endpoints (`/api/miner/*`, `/api/agent/verify-output`) to your Two-Mind / General-Purpose Mind agents and publish the live listing link.
3. **Post-Core Scope Decision (Nov 27-28 Window)**:
   - Phases 1 to 3 and Sepolia Diamond `#6201` are complete and verified. Decide separately whether to add a minimal ByteDance Ark / Virtuals ACP adapter only if time remains after Checkpoint B publish steps.

---

## 1. Anjoman App Listing Update (`praman-desk-2`, ID `9ae7025e-65be-490b-8e59-2aa598f16992`)

**Short Tagline:**
Autonomous Pre-Payment Spend Firewall, Alibaba/Takar Escrow Arbiter & 18-Intent Compliance Miner for AI Agents

**Updated Description / Release Notes:**
Praman Desk is an institutional pre-payment spend firewall and deterministic verification node built across all three Telegraph Season II tracks (Apps/Agents, Miners/Providers, and Evaluators/Truth Sources).

What is live and independently reproducible today:
- Live Portal & Zero-Install MCP (18 tools): https://praman-desk.vercel.app and https://praman-desk.vercel.app/api/mcp
- Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
- Active Track 2 Miner: Devnode Route `#6164` (`praman-compliance-miner`) bonded on Sepolia Diamond Registration `#6201` (`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`, tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, Devnode `/api/miners/6201` status `active` with zero warnings) serving 18 bonded intents across procurement math, GLEIF corporate registry, OFAC SDN screening (19,565 entries), SEC EDGAR, CAISO OASIS grid pricing (honoring exact `interval_start` hours), Ethereum/Sepolia/Solana RPCs (native balances, SPL tokens, live transactions, Uniswap v3 TVL + DexScreener pools), RDAP B2B identity enrichment, fraud risk scoring (`subject` + `risk_score`), and Luhn/BIN/ABA/IBAN payment verification.
- Tencent #01 / #03 Enterprise Agent Output Claim Verifier (`POST /api/agent/verify-output` & `POST /api/mission/tencent-assurance`, plus interactive Desk 5 card): Decomposes agent outputs across OFAC SDN, GLEIF/RDAP/FakeWatch, 651-byte WASM + live ECB Frankfurter FX math, and payment checksums, blocking false `"GO"` / `"ready to settle"` claims before disbursement.
- Deterministic 651-Byte WebAssembly Arithmetic Engine: https://praman-desk.vercel.app/comparator.wasm (`1,043/1,043` fixed-point vectors verified with zero rounding drift).
- Alibaba Trade Assurance & Takar On-Chain Settlements (Ethereum Sepolia):
  - `TakarSettle v4` (`0x310275e6D66818E068245326bB9e398822304248`) Deal 0 (`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`, Block `12190408`) and Case 1 (`0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13`, Block `12200598`).
  - `TakarSettle5` (`0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B`) Case 2 (`0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de`, Block `12200597`).
- Track 1 Live Autonomous Telegraph Purchases & Ledger (`/api/ledger`): `32` unique verified Sepolia txHashes plus genuine `402 -> X-PAYMENT` Devnode escrow receipts (`0x86e237a059ba253f1db3d0bc021d4b2251ab9e2a501b914dfc1fe406f6218f05` direct miner `#6164`, `0x4dc29b2b788e3feef9aacf95668931e8305d01cd3a8c27289af06d2b95324937` Tencent `#01/#03` live run in `evidence/tencent-live-proof.json`, `0x78960519...`, `0x624c9be9...`, `0xdf1f4371...`).
- Track 3 Stateless Batch Evaluator & Attested EvalPool: `POST /api/evaluator/sanctions-batch` performs deterministic 19,565-entry OFAC SDN batch scoring with precision/recall/F1 metrics (cleanly retiring legacy ephemeral `trycloudflare` `#469` adapter), paired with `309` EvalPool rows and `comparator.wasm`.
- Solana Pre-Signature Spend Guard SDK: Intercepts hijacked `@solana/web3.js` (`1.95.6`/`1.95.7`), drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` TLV extensions, unresolved Address Lookup Tables, and OFAC addresses before signing.

---

## 2. Discord Partner Reproduction Messages

### A. For Anthony (EIP-191 Countersign + PO-ALI-9021 Case + 18-Intent Diamond `#6201`)
Hey @anthony, sharing our updated reproduction endpoints on Praman Desk so you can test our deterministic countersign guard, agent claim verifier, and 18-intent Diamond `#6201` miner directly:

1. **Real EIP-191 Countersign Verification (`POST https://praman-desk.vercel.app/api/spend-guard/evaluate`)**:
   - Submitting mismatched `countersignReportHash` / `countersignSignature` fails closed with `COUNTERSIGN_SIGNATURE_INVALID` and `HOLD_FOR_MANUAL_REVIEW` via viem `recoverMessageAddress`.
   - Non-numeric `spendAmountUsdc` / `statedTotal` inputs reject cleanly with HTTP `400` (`INVALID_NUMERIC_INPUT`) instead of entering WASM scoring.
2. **Shareable Trade Assurance Case (`GET https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html`)**:
   - Renders the reconciled `$80,000` release / `$20,000` refund arbitration result with `RECONCILED_PARTIAL_SETTLEMENT` and direct Sepolia TakarSettle v4 + EAS links (`0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75`).
3. **18-Intent Diamond `#6201` (Zero Warnings) & New Verification Routes**:
   - Sepolia Diamond Registration `#6201` (`0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`) is `active` on Devnode `/api/miners/6201` with zero parameter warnings across all 18 bonded intents (now including live Solana SPL/SOL/tx/DEX liquidity resolution and exact CAISO `interval_start` pricing).
   - Also testable live: `POST /api/agent/verify-output` (`GO` / `NO_GO` claim decomposition) and `POST /api/evaluator/sanctions-batch` (stateless batch F1 evaluator).

### B. For Bangdrop (Takar Escrow Integration & Case 0 / 1 / 2 Sepolia Receipts in Desk 0 & Desk 3)
Hey @bangdrop, confirming full on-chain verification and live ledger integration for all three Takar escrow resolutions settled by Praman Desk (`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`) on Ethereum Sepolia:

- **Deal 0 (Alibaba PO-ALI-9021 Partial Settlement, TakarSettle v4 `0x310275e6D66818E068245326bB9e398822304248`)**:
  - Tx: https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75 (Block `12190408`)
  - Outcome: `$80,000.00` USDC released to supplier / `$20,000.00` USDC refunded for 20 damaged units.
- **Case 1 (Ferry Megastar Dispute, TakarSettle v4 `0x310275e6D66818E068245326bB9e398822304248`)**:
  - Tx: https://sepolia.etherscan.io/tx/0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13 (Block `12200598`, Status: `success`)
- **Case 2 (Quantity Dispute, TakarSettle5 `0xa6D0482cBF29FE43fB644F33f7a020766AF4A42B`)**:
  - Tx: https://sepolia.etherscan.io/tx/0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de (Block `12200597`, Status: `success`, `960 / 1,000` conforming units reconciled).

All 32 verified Sepolia ledger transactions plus both Takar resolver receipts (`takarResolvers`) and Devnode escrow signals (`escrowPurchases`) are now exposed via `GET https://praman-desk.vercel.app/api/ledger` and rendered live in Desk 3 (`Settlement Ledger`).

### C. For QuincyBob (`QUINCY_PROMPT_LAB` / Agent Claim Verification & Batch Evaluator Test)
Hey @quincybob, sharing two adversarial test endpoints on Praman Desk if you want to stress-test prompt/output hallucinations and compliance edge cases:

1. **`POST https://praman-desk.vercel.app/api/agent/verify-output`**: Pass `{ "vendor": "...", "domain": "...", "output": "..." }` containing any raw LLM or procurement agent output; Praman decomposes inline equations (`qty x price = total`), FX claims (via live ECB Frankfurter rates), ABA/IBAN/BIN checksums, corporate legal entity standing (GLEIF/RDAP/SEC EDGAR), and OFAC SDN addresses into a deterministic `GO` / `NO_GO` claim matrix with dollar exposure prevented.
2. **`POST https://praman-desk.vercel.app/api/evaluator/sanctions-batch`**: Pass up to `50` labeled or unlabeled entries in `items[]` for stateless sub-second batch screening across 19,565 OFAC SDN entities + digital currency EVM addresses with precision/recall/F1 metrics.

Happy to test any adversarial prompt suite from `QUINCY_PROMPT_LAB` against these endpoints!

### D. For Ahmed Ali (Season II Final Checklist Before Dec 1)
Hey @Ahmed Ali, sharing our verified Praman Desk Season II update ahead of the Dec 1 deadline across all three tracks:

- **Repo & Live Deployment**: https://github.com/VishAlgoDev/praman-desk and https://praman-desk.vercel.app (zero-install MCP at `/api/mcp` with 18 tools, plus walkthrough video at https://praman-desk.vercel.app/praman-desk-walkthrough.mp4).
- **Track 01 (Apps & Agents)**: Two-Mind Spend Guard, Alibaba/Takar Escrow Arbiter, Tencent `#01/#03` Enterprise Agent Output Verifier (`POST /api/agent/verify-output` & `POST /api/mission/tencent-assurance` with live Devnode receipt `0x4dc29b2b...` / `0x6f61d31d...`), Solana Pre-Signature Spend Guard (including Token-2022 TLV extensions & unresolved ALT guards), and live `402 -> X-PAYMENT` escrow receipts (`0x86e237a0...` direct `#6164`).
- **Track 02 (Miner `#6164` / Sepolia Diamond `#6201`)**: Active on Devnode `/api/miners/6201` (`activation_status: "active"`, zero warnings; tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`) across all 18 bonded intents, with full Solana RPC coverage (`wallet-balance`, `token-supply`, `onchain-tx`, `liquidity-depth`), `FRAUD_RISK` `subject` + `risk_score`, `GRID_POWER_PRICE` explicit `interval_start`, `CONTRACT_OBLIGATION` clause extraction, and fail-closed `PO-2231` handling.
- **Track 03 (Evaluators / Truth Sources)**: Stateless batch evaluator `POST /api/evaluator/sanctions-batch` (retiring legacy ephemeral `#469` tunnel cleanly), `309` Devnode EvalPool rows (`8` newly attested rows, raw JSONL excluded from Git), and `651-byte` WebAssembly comparator (`1,043/1,043`).

Could you confirm everything looks clean for `praman-desk-2` (`9ae7025e-65be-490b-8e59-2aa598f16992`) and Diamond `#6201`?

---

## 3. Three Technical X Posts (`@vishal_karad` tagging `@Telegraphprotoc`)

### Post 1 (Track 01, Takar On-Chain Arbitration & Tencent #01/#03 Output Verifier)
Autonomous AI agents fail expensively when payment math drifts by 1 cent or an LLM prints `"all checks passed"` on bad numbers.

We built Praman Desk on @Telegraphprotoc: a 651-byte WASM arithmetic firewall, Tencent #01/#03 claim verifier, EIP-191 countersigning, and live Sepolia Takar escrow settlements (`$80k` settled / `$20k` refunded).

Watch our walkthrough video and test the live console:
https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75

### Post 2 (Track 02 18-Intent Diamond `#6201` Active With Zero Warnings + Solana & EVM Live Data)
Praman Desk Miner `#6164` just upgraded live on @Telegraphprotoc Sepolia Diamond to Registration `#6201` (`activation_status: active`, zero warnings, Block `12214472`).

Serving keyless deterministic verification across 18 bonded intents: GLEIF, OFAC SDN (19,565 entries), SEC EDGAR, CAISO OASIS, Ethereum/Sepolia/Solana RPCs, Uniswap v3 / DexScreener liquidity, RDAP B2B identity, fraud risk, and Luhn/BIN/ABA/IBAN checks.

Live Diamond tx & verified settlement ledger:
https://sepolia.etherscan.io/tx/0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65
https://praman-desk.vercel.app

### Post 3 (Solana Pre-Signature Spend Guard & Track 03 Stateless Batch Evaluator)
Supply-chain backdoors like `@solana/web3.js` 1.95.6 and malicious Token-2022 extensions drain agent wallets before RPC sees a tx.

Our Solana Pre-Signature Spend Guard stops hijacked queues, drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` mints, unresolved ALTs, and OFAC targets before Ed25519 signing, paired with `/api/evaluator/sanctions-batch` (`309` EvalPool rows) on @Telegraphprotoc.

Open-source SDK, 18-tool MCP (`/api/mcp`), and reproducible tests:
https://github.com/VishAlgoDev/praman-desk
https://praman-desk.vercel.app

---

## 4. Final Hackathon Season II Track Blurbs (Before Dec 1, 2026 23:59 UTC)

### Track 01: Apps & Agents (`Praman Desk`)
Praman Desk (`praman-desk-2`, Anjoman ID `9ae7025e-65be-490b-8e59-2aa598f16992`) is a pre-payment spend firewall and cross-border escrow arbiter for autonomous AI agents. It combines a collaborative Two-Mind Spend Guard (Investigator Mind + Reviewer Mind), a Tencent `#01/#03` Enterprise Agent Output Claim Verifier (`/api/agent/verify-output` & `/api/mission/tencent-assurance`), an Alibaba & Cainiao Trade Assurance arbiter settling live disputes on Ethereum Sepolia (`TakarSettle v4` & `TakarSettle5`), a Solana Pre-Signature Spend Guard protecting legacy and `v0` transactions against `web3.js` supply-chain hooks and Token-2022 TLV exploits, and an 18-tool Streamable HTTP MCP server (`/api/mcp`). Across counterfactual benchmarks it averted `$79,373` in bad disbursements, and its live Node/SDK demos settle real Devnode `402 -> X-PAYMENT` purchases (`0x86e237a0...` direct `#6164`, `0x4dc29b2b...` Tencent `#01/#03`).

### Track 02: Miners / Providers (`Praman Desk Compliance & Procurement Auditor`)
Bonded on Ethereum Sepolia Diamond `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` under active Devnode Route `#6164` (`praman-compliance-miner`) and Diamond Registration `#6201` (tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, pinned SHA-256 `0x75e46b7985e14e970648c914a7ae463ff919a25fd868db3224999fc34a827719`, Devnode `/api/miners/6201` `active` with zero warnings), Praman serves 18 deterministic intents across procurement WASM math, GLEIF LEI across 200+ jurisdictions, 19,565-entry OFAC SDN screening, SEC EDGAR / Federal Register monitoring, CAISO OASIS LMP with exact `interval_start` support, multi-chain Ethereum/Sepolia/Solana RPCs + Uniswap v3 / DexScreener depth, RDAP B2B enrichment, `subject` fraud risk scoring, and Luhn/BIN/ABA/IBAN verification, all failing closed when any upstream feed is unavailable.

### Track 03: Evaluators / Truth Sources (`Praman 651-Byte WASM Comparator, Stateless Batch Evaluator & Attested EvalPool`)
Praman anchors deterministic commercial verification via a standalone `651-byte` zero-import WebAssembly binary (`comparator.wasm`, `1,043/1,043` bit-exact fixed-point test cases), a stateless deterministic OFAC batch evaluator (`POST /api/evaluator/sanctions-batch` with F1 metrics, cleanly retiring the legacy ephemeral `trycloudflare` `#469` adapter), and `309` contributor rows on Devnode EvalPool including `8` signed `provenance_class: "attested"` rows. Raw ground-truth `.jsonl` files remain excluded from Git (`eval-data/` in `.gitignore`) so benchmark vectors stay uncontaminated.
