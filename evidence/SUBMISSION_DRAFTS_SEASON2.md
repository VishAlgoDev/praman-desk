# Telegraph Season II Submission & Partner Reproduction Drafts

Status: READY FOR USER REVIEW AND APPROVAL BEFORE EXTERNAL POSTING.
Constraint check: Zero em dashes used anywhere; video referenced strictly as "walkthrough video".

---

## 0. Manual User Gates Before Publishing (`Checkpoint B`)

1. **Solana Devnet Web Faucet (Manual Browser Action)**:
   - Open `https://faucet.solana.com`, select `Devnet`, paste address `3r428Z8YSgQFJpsyPcQyxmt1faQQBuNRpqz92m9ucbuL`, claim `1-2 Devnet SOL` (automated RPC `requestAirdrop` returns HTTP `410` on Devnet).
   - Once funded, run `npm run solana:test` in `telegraph-h2/` so `TEST 7` broadcasts a live guarded Solana Devnet transaction (`evidence/solana-devnet-proof.json` + Solscan Devnet URL).
2. **Minds (`https://hellominds.ai`) Turnkey Listing Copy-Paste**:
   - **Mind Name**: `Praman Investigator & Spend Guard Mind`
   - **Concise Description**: `Deterministic pre-payment spend firewall and enterprise claim verifier across 18 Telegraph compliance intents (OFAC SDN, GLEIF LEI, 651-byte WASM arithmetic, SEC EDGAR, Solana/EVM RPCs, and CAISO power pricing) plus Solana Token-2022 TLV pre-signature armor.`
   - **Keyless Streamable MCP Endpoint**: `https://praman-desk.vercel.app/api/mcp` (`18` tools, no API key required)
   - **HTTP Tool Base URL (optional fallback)**: `https://praman-desk.vercel.app/api/miner/` (plus `POST https://praman-desk.vercel.app/api/agent/verify-output` & `POST https://praman-desk.vercel.app/api/spend-guard/evaluate`)
   - Publish and paste back your resulting `hellominds.ai` Mind ID so we link it into `README.md` and Season II forms.
3. **Post-Core Scope Decision (Nov 27-28 Window)**:
   - Phases 1 to 3 and Sepolia Diamond `#6201` are complete and verified. Decide separately on Nov 27-28 whether to add a focused ByteDance Ark / Virtuals ACP extension.

---

## 1. Anjoman App Listing Updates (`anjoman.ai/dashboard/apps/mine`)

### A. App 1: `praman-desk` (`AGENTS` track, replace stale Season 1 `#5165` text)
- **Tagline**: `Collaborative Two-Mind Autonomous Spend Guard, Alibaba/Takar Escrow Arbiter & Solana Pre-Signature Firewall`
- **Endpoint / MCP**: `https://praman-desk.vercel.app/api/mcp` (`18` tools) | **Web Portal**: `https://praman-desk.vercel.app` | **Walkthrough Video**: `https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`
- **Summary**: `Autonomous pre-payment firewall for AI agent treasuries and cross-border commerce. Executes Investigator + Reviewer Mind due diligence, real EIP-191 countersign verification, Tencent #01/#03 agent claim decomposition (/api/agent/verify-output), 651-byte WASM line-item reconciliation (1,043/1,043), Solana Token-2022 TLV + web3.js supply-chain pre-signature protection, and live Sepolia escrow arbitration on TakarSettle v4 (0xba98c51a..., 0x976d78bb...) & TakarSettle5 (0x28d3ff9c...). Paired with bonded 18-intent Devnode Miner #6164 (Sepolia Diamond #6201, tx 0x50b34afc..., warnings: 0). Counterfactual simulation averted $79,373 in losses across 5 adversarial vectors.`

### B. App 2: `praman-desk-2` (`SECURITY` track, ID `9ae7025e-65be-490b-8e59-2aa598f16992`)
- **Short Tagline**: `Autonomous Pre-Payment Spend Firewall, Alibaba/Takar Escrow Arbiter & 18-Intent Compliance Miner for AI Agents`
- **Updated Description / Release Notes**:
  - Live Portal & Zero-Install MCP (18 tools): https://praman-desk.vercel.app and https://praman-desk.vercel.app/api/mcp
  - Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
  - Active Track 2 Miner: Devnode Route `#6164` (`praman-compliance-miner`) bonded on Sepolia Diamond Registration `#6201` (`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`, tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, Devnode `/api/miners/6201` `active`, zero warnings) serving 18 bonded intents across procurement math, GLEIF corporate registry, OFAC SDN screening (19,565 entries), SEC EDGAR, CAISO OASIS grid pricing, Ethereum/Sepolia/Solana RPCs (native SOL/SPL balances, SPL supplies, Base58 transactions, Uniswap v3 TVL + DexScreener pools), RDAP B2B identity enrichment, fraud risk scoring (`subject` + `risk_score`), and Luhn/BIN/ABA/IBAN verification.
  - Tencent #01 / #03 Enterprise Agent Output Claim Verifier (`POST /api/agent/verify-output` & `POST /api/mission/tencent-assurance`, plus interactive Desk 5 verifier): Decomposes agent outputs across OFAC SDN, GLEIF/RDAP/FakeWatch, 651-byte WASM + live ECB Frankfurter FX math, and payment checksums.
  - Deterministic 651-Byte WASM Binary: https://praman-desk.vercel.app/comparator.wasm (`1,043/1,043` fixed-point vectors verified).
  - Track 1 Live Sepolia & Devnode Escrow Proofs (`/api/ledger`): `32` unique Sepolia txHashes plus TakarSettle v4/v5 resolutions (`0xba98c51a...`, `0x976d78bb...`, `0x28d3ff9c...`) and live `402 -> X-PAYMENT` escrow receipts (`0x86e237a0...` direct `#6164`, `0x4dc29b2b...` Tencent `#01/#03` in `evidence/tencent-live-proof.json`).
  - Track 3 Stateless Batch Evaluator & Attested EvalPool: `POST /api/evaluator/sanctions-batch` (precision/recall/F1 across 19,565 OFAC SDN entries, cleanly retiring legacy ephemeral `trycloudflare` `#469` adapter) paired with `309` Devnode EvalPool rows.
  - Solana Pre-Signature Spend Guard SDK: Intercepts hijacked `@solana/web3.js` (`1.95.6`/`1.95.7`), drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` TLV extensions, unresolved ALTs, and OFAC addresses before signing.

---

## 2. Discord Showcase, Track Channels & Partner Reproduction Messages

### A. Discord `#showcase` Thread Update (`1569379402360553692`)
- **Updated Thread Title**: `Praman Desk | Devnode #6164 / Diamond #6201 (18 Intents) | Solana + EVM Spend Guard | Tencent #01/#03 | TakarSettle`
- **Updated Body**:
  `Updated Praman Desk for Telegraph Season II (GitHub HEAD + Vercel https://praman-desk.vercel.app):`
  `- Track 01 (Apps & Agents): Two-Mind Spend Guard, Alibaba PO-ALI-9021 arbitration (settled on TakarSettle v4 0xba98c51a... / v5 0x28d3ff9c...), Tencent #01/#03 Agent Output Claim Verifier (POST /api/agent/verify-output & /api/mission/tencent-assurance + Desk 5 UI), Solana Token-2022 TLV pre-signature guard, and 18-tool keyless MCP (/api/mcp). Counterfactual benchmark: $79,373 averted across 5 adversarial attack vectors.`
  `- Track 02 (Miner #6164 / Sepolia Diamond #6201): tx 0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65 (Block 12214472), active on Devnode /api/miners/6201 with zero schema warnings across 18 intents including full Ethereum/Sepolia/Solana RPC coverage, exact CAISO OASIS intervals, GLEIF/SEC EDGAR, and 19,565 OFAC SDN entries.`
  `- Track 03 (Evaluators / Truth Sources): 651-byte WebAssembly comparator (1,043/1,043 bit-exact), stateless batch evaluator POST /api/evaluator/sanctions-batch (retiring legacy #469 trycloudflare), and 309 Devnode EvalPool rows (8 signed attested submissions).`
  `- Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`

### B. Discord Alibaba Channel Reply (`Alibaba - Commercial AI, Trade & Autonomous Commerce`, to Ahmed Ali)
`Hi @Ahmed Ali, posting the clean reproduction summary for our Alibaba & Cainiao Trade Assurance integration on Praman Desk:`
`- PO-ALI-9021 ($100,000 USDC escrow in TakarSettle v4 0x310275e6D66818E068245326bB9e398822304248 vs Port of LA receipt CN-LAX-88201, 80 conforming / 20 damaged units): deterministic 651-byte WASM circuit breaker halts the $20,000 overbilling discrepancy (Case A), while authorized reconciled settlement (Case B) splits $80,000 USDC to supplier / $20,000 USDC refund to buyer.`
`- Reproducible shareable HTML & JSON case view: https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html`
`- On-chain Sepolia TakarSettle v4 & v5 settlement receipts: 0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75 (Block 12190408), 0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13 (Block 12200598), and 0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de (Block 12200597).`
`- Interactive Desk 0 & walkthrough video: https://praman-desk.vercel.app and https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`

### C. Discord Solana Channel Post (`Solana Institutional AI & Commercial Applications`)
`Sharing Praman Desk's Solana Pre-Signature Spend Guard SDK and live Solana RPC parity on Telegraph Miner #6164 (Diamond #6201):`
`- Pre-Signature Spend Guard (packages/praman-sdk/solana.js + Desk 1 live console): inspects legacy Transaction & v0 VersionedTransaction bytes before signing, blocking hijacked @solana/web3.js (1.95.6/1.95.7 addToQueue tampering), drainer wallet FnvLGtucz4..., SPL Token-2022 TLV PermanentDelegate (12) / TransferHook (14) / FreezeAuthority mints, unresolved ALTs, and cumulative session spend-cap breaches.`
`- Live Solana Miner Endpoints on https://praman-desk.vercel.app: /api/miner/wallet-balance (native SOL + SPL getTokenAccountsByOwner), /api/miner/token-supply (SPL getTokenSupply with exact decimals), /api/miner/onchain-tx (Base58 v0/v1 getTransaction), and /api/miner/liquidity-depth (SOL/USDC Solana DEX pools).`
`- Local reproduction: npm run solana:test and npm run solana:demo.`

### D. Discord Use Cases Channel Post (`Use Cases - Apps, Agents & Integrations`)
`Shipping the reproducible code, API, UI, and live paid Telegraph proof for our Tencent #01/#03 Enterprise Agent Decision Assurance workflow:`
`- Endpoint & Interactive UI: POST https://praman-desk.vercel.app/api/agent/verify-output, POST /api/mission/tencent-assurance, and Desk 5 (Procurement Verify -> Agent Output Claim Verifier).`
`- How it works: decomposes raw AI agent text into checkable claims across OFAC SDN (19,565 entries + EVM addresses), GLEIF LEI + RDAP + FakeWatch domain safety, 651-byte WASM arithmetic + live ECB Frankfurter FX rates, and ISO 7812 Luhn / Fedwire ABA Mod-10 / IBAN Mod-97 checksums before emitting GO or NO_GO with dollar exposure prevented.`
`- Reproducible test suite & live Devnode purchase receipt: npm run tencent-visa:test (8/8 pass) and evidence/tencent-live-proof.json (escrow receipt 0x4dc29b2b788e3feef9aacf95668931e8305d01cd3a8c27289af06d2b95324937, signal 0x8d81b53e5c39be8df37d6982e26ac277c51957bc7ae1ba33d9e8f8488355d8ab).`

### E. For Anthony (EIP-191 Countersign + PO-ALI-9021 Case + 18-Intent Diamond `#6201`)
Hey @anthony, sharing our updated reproduction endpoints on Praman Desk so you can test our deterministic countersign guard, agent claim verifier, and 18-intent Diamond `#6201` miner directly:
1. **Real EIP-191 Countersign Verification (`POST https://praman-desk.vercel.app/api/spend-guard/evaluate`)**: Invalid countersign payloads fail closed with `COUNTERSIGN_SIGNATURE_INVALID` and `HOLD_FOR_MANUAL_REVIEW` via viem `recoverMessageAddress`; non-numeric spend fields return HTTP `400` (`INVALID_NUMERIC_INPUT`).
2. **Shareable Trade Assurance Case (`GET https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html`)**: Renders `$80,000` release / `$20,000` refund (`RECONCILED_PARTIAL_SETTLEMENT`) with Sepolia TakarSettle v4 + EAS links.
3. **18-Intent Diamond `#6201` (`warnings: 0`) & Batch/Claim Routes**: Test `POST /api/agent/verify-output`, `POST /api/evaluator/sanctions-batch`, and Solana/EVM `/api/miner/*` endpoints.

### F. For Bangdrop (Takar Escrow Integration & Case 0 / 1 / 2 Sepolia Receipts in Desk 0 & Desk 3)
Hey @bangdrop, confirming full on-chain verification and live ledger integration for all three Takar escrow resolutions settled by Praman Desk (`0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`) on Ethereum Sepolia:
- **Deal 0 (`TakarSettle v4`, Block `12190408`)**: `0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75` (`$80,000` release / `$20,000` refund).
- **Case 1 (`TakarSettle v4`, Block `12200598`)**: `0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13`.
- **Case 2 (`TakarSettle5`, Block `12200597`)**: `0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de` (`960 / 1,000` units reconciled).
All 32 verified Sepolia ledger transactions plus `takarResolvers` and `escrowPurchases` are live in `/api/ledger` and Desk 3 (`https://praman-desk.vercel.app/#ledger`).

### G. For QuincyBob (`QUINCY_PROMPT_LAB` / Agent Claim Verification & Batch Evaluator Test)
Hey @quincybob, sharing two adversarial endpoints on Praman Desk to test against `QUINCY_PROMPT_LAB`:
1. `POST https://praman-desk.vercel.app/api/agent/verify-output` (`GO` / `NO_GO` claim matrix decomposing equations, ECB FX rates, ABA/IBAN/BIN checksums, GLEIF/RDAP entities, and OFAC SDN hits).
2. `POST https://praman-desk.vercel.app/api/evaluator/sanctions-batch` (stateless 1 to 50 item batch OFAC SDN + EVM screening with precision/recall/F1 metrics).

### H. For Ahmed Ali (Season II Final Status Check Before Dec 1)
Hey @Ahmed Ali, sharing our verified Praman Desk Season II summary across all three tracks (`praman-desk-2` `9ae7025e-65be-490b-8e59-2aa598f16992` + `praman-desk` + Miner `#6164` / Diamond `#6201`):
- Live Deployment & Keyless 18-Tool MCP: https://praman-desk.vercel.app and https://praman-desk.vercel.app/api/mcp (`walkthrough video`: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4).
- Track 01: Two-Mind Spend Guard, Alibaba/Takar Escrow Arbiter, Tencent `#01/#03` Agent Output Claim Verifier (`evidence/tencent-live-proof.json`), and Solana Pre-Signature Spend Guard (Token-2022 TLV + ALT fail-closed guards).
- Track 02: Sepolia Diamond `#6201` (`0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`) active on Devnode `/api/miners/6201` with `0` warnings across all 18 bonded intents (including live Solana RPCs, explicit CAISO intervals, clause extraction, and `subject` fraud risk).
- Track 03: Stateless batch evaluator `POST /api/evaluator/sanctions-batch` (retiring legacy `#469` ephemeral tunnel cleanly), `309` Devnode EvalPool rows (`8` newly attested rows), and `651-byte` WebAssembly comparator (`1,043/1,043`).

---

## 3. X Updates (`@vishal_karad`, 3-Date Requirement Tagging `@Telegraphprotoc`)

### Update 1 (Nov 26, Replace/Fix Old `2125698555092553987`, Track 01 + TakarSettle + Walkthrough Video)
Autonomous AI agents fail expensively when payment math drifts by 1 cent or an LLM prints `"all checks passed"` on unverified numbers.

We built Praman Desk on @Telegraphprotoc: a 651-byte WASM arithmetic firewall, Tencent #01/#03 claim verifier, EIP-191 countersigning, and live Sepolia Takar escrow settlements (`$80k` settled / `$20k` refunded).

Watch our walkthrough video and test the live console:
https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75

### Update 2 (Nov 27-28, Track 02 Diamond `#6201` Zero Warnings + Solana Live RPC + Epoch Update)
Praman Desk Miner `#6164` just upgraded live on @Telegraphprotoc Sepolia Diamond to Registration `#6201` (`activation_status: active`, zero warnings, Block `12214472`).

Serving keyless deterministic verification across 18 bonded intents: GLEIF, OFAC SDN (19,565 entries), SEC EDGAR, CAISO OASIS, Ethereum/Sepolia/Solana RPCs, Uniswap v3 / DexScreener liquidity, RDAP B2B identity, fraud risk, and Luhn/BIN/ABA/IBAN checks.

Live Diamond tx & verified settlement ledger:
https://sepolia.etherscan.io/tx/0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65
https://praman-desk.vercel.app

### Update 3 (Nov 29-30, Solana Pre-Signature Guard + Track 03 Batch Evaluator + EvalPool `309` Rows)
Supply-chain backdoors like `@solana/web3.js` 1.95.6 and malicious Token-2022 extensions drain agent wallets before RPC sees a tx.

Our Solana Pre-Signature Spend Guard stops hijacked queues, drainer wallets, Token-2022 `PermanentDelegate` / `TransferHook` / `FreezeAuthority` mints, unresolved ALTs, and OFAC targets before Ed25519 signing, paired with `/api/evaluator/sanctions-batch` (`309` EvalPool rows) on @Telegraphprotoc.

Open-source SDK, 18-tool MCP (`/api/mcp`), and reproducible tests:
https://github.com/VishAlgoDev/praman-desk
https://praman-desk.vercel.app

---

## 4. GitHub Mission `/progress` Update Templates (`telegraphprotocol/bounties` Issues `#189, #190, #191, #192, #196, #199, #200, #201, #202`)

Use the unified template below per issue (`<ISSUE_NUMBER>`) ahead of the `<72h` cadence check (zero stale miner IDs, zero duration tags, zero em dashes):

```markdown
/progress Update (Season II Verification Sync, Nov 26):
- Production App & Keyless 18-Tool MCP: https://praman-desk.vercel.app and https://praman-desk.vercel.app/api/mcp
- Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
- Active Track 2 Miner: Devnode `#6164` / Sepolia Diamond `#6201` (`tx: 0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, Devnode `/api/miners/6201` `active`, `0` warnings across 18 bonded intents).
- New Track 1 Capabilities: Added `/api/agent/verify-output` and `/api/mission/tencent-assurance` (`evidence/tencent-live-proof.json`, escrow receipt `0x4dc29b2b...`), full Solana live RPC parity (`wallet-balance`, `token-supply`, `onchain-tx`, `liquidity-depth`), exact CAISO OASIS interval handling, and `32` verified Sepolia txHashes + Devnode escrow signals in `/api/ledger`.
- Track 3 Verification: Stateless batch OFAC evaluator (`POST /api/evaluator/sanctions-batch`, cleanly superseding retired legacy tunnel `#469`), `309` EvalPool rows (`8` signed attested submissions), and `651-byte` WASM comparator (`1,043/1,043`).
- Reproducible Verification: `npm run sdk:test`, `npm run comparator:test`, `npm run alibaba:demo`, `npm run tencent-visa:test`, `npm run benchmark`, `node scripts/verify-15-miner-endpoints.mjs`, and `node scripts/test-endpoints-local.mjs`.
```

---

## 5. Final Hackathon Season II Track Blurbs (Before Dec 1, 2026 23:59 UTC)

### Track 01: Apps & Agents (`Praman Desk`)
Praman Desk (`praman-desk-2`, Anjoman ID `9ae7025e-65be-490b-8e59-2aa598f16992`) is a pre-payment spend firewall and cross-border escrow arbiter for autonomous AI agents. It combines a collaborative Two-Mind Spend Guard (Investigator Mind + Reviewer Mind), a Tencent `#01/#03` Enterprise Agent Output Claim Verifier (`/api/agent/verify-output` & `/api/mission/tencent-assurance`), an Alibaba & Cainiao Trade Assurance arbiter settling live disputes on Ethereum Sepolia (`TakarSettle v4` & `TakarSettle5`), a Solana Pre-Signature Spend Guard protecting legacy and `v0` transactions against `web3.js` supply-chain hooks and Token-2022 TLV exploits, and an 18-tool Streamable HTTP MCP server (`/api/mcp`). Across counterfactual benchmarks it averted `$79,373` in bad disbursements, and its live Node/SDK demos settle real Devnode `402 -> X-PAYMENT` purchases (`0x86e237a0...` direct `#6164`, `0x4dc29b2b...` Tencent `#01/#03`).

### Track 02: Miners / Providers (`Praman Desk Compliance & Procurement Auditor`)
Bonded on Ethereum Sepolia Diamond `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` under active Devnode Route `#6164` (`praman-compliance-miner`) and Diamond Registration `#6201` (tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, pinned SHA-256 `0x75e46b7985e14e970648c914a7ae463ff919a25fd868db3224999fc34a827719`, Devnode `/api/miners/6201` `active` with zero warnings), Praman serves 18 deterministic intents across procurement WASM math, GLEIF LEI across 200+ jurisdictions, 19,565-entry OFAC SDN screening, SEC EDGAR / Federal Register monitoring, CAISO OASIS LMP with exact `interval_start` support, multi-chain Ethereum/Sepolia/Solana RPCs + Uniswap v3 / DexScreener depth, RDAP B2B enrichment, `subject` fraud risk scoring, and Luhn/BIN/ABA/IBAN verification, all failing closed when any upstream feed is unavailable.

### Track 03: Evaluators / Truth Sources (`Praman 651-Byte WASM Comparator, Stateless Batch Evaluator & Attested EvalPool`)
Praman anchors deterministic commercial verification via a standalone `651-byte` zero-import WebAssembly binary (`comparator.wasm`, `1,043/1,043` bit-exact fixed-point test cases), a stateless deterministic OFAC batch evaluator (`POST /api/evaluator/sanctions-batch` with F1 metrics, cleanly retiring the legacy ephemeral `trycloudflare` `#469` adapter), and `309` contributor rows on Devnode EvalPool including `8` signed `provenance_class: "attested"` rows. Raw ground-truth `.jsonl` files remain excluded from Git (`eval-data/` in `.gitignore`) so benchmark vectors stay uncontaminated.
