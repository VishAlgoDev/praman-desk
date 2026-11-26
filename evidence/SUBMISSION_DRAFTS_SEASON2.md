# Telegraph Season II Submission & Partner Reproduction Drafts

Status: VERIFIED LOCALLY AND ON PRODUCTION. READY FOR USER REVIEW BEFORE EXTERNAL POSTING.
Posting Policy: Nothing has been posted externally without user approval. Every URL, transaction hash, test count, and limitation below was checked against live code and endpoints.

---

## 0. Completed Pre-Publish Gates & Remaining Manual Actions

### Completed (`Checkpoint B`)
1. **Solana Devnet Funded Settlement (`evidence/solana-devnet-settlement.json`, `evidence/solana-devnet-wallet.json`)**:
   - Treasury `3r428Z8YSgQFJpsyPcQyxmt1faQQBuNRpqz92m9ucbuL` funded (`4.99799 SOL` pre-tx) and executed a guarded `0.001 SOL` settlement on Devnet (`certHash: 0xe3fccaf88769bb2c31d97d0982f0c283ec00aa0c6cc2e35152319a20b402cb3d`).
   - Solscan Devnet tx: `https://solscan.io/tx/E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq?cluster=devnet`
2. **Minds (`hellominds.ai`) Mind & Bazaar Skill Live**:
   - Mind: `Praman.Spend.Guard` (`47b85842-f36b-1410-8467-00039ce7df11`, `https://hellominds.ai/profile/minds/47b85842-f36b-1410-8467-00039ce7df11`)
   - Published Bazaar Skill: `Praman_Spend_Guard` (`skillId: 5BD48D42-F36B-1410-8467-00039CE7DF11`, `artifactId: 58D48D42-F36B-1410-8467-00039CE7DF11`, read-only `HTTP_Execute` wired to `https://praman-desk.vercel.app/api/mcp` and `/api/miner/*`)

### Remaining User-Gated Actions
- Review and manually post any selected updates below on Anjoman, Discord, X, and `telegraphprotocol/bounties` issues (`#189, #190, #191, #192, #196, #199, #200, #201, #202`).
- Optional Nov 27-28 window: decide separately whether to ship a focused ByteDance Ark / Virtuals ACP extension.

---

## 1. Anjoman App Listing Updates (`anjoman.ai/dashboard/apps/mine`)

### A. App 1: `praman-desk` (`AGENTS` track, replace Season 1 `#5165` notes)
- **Tagline**: `Pre-Payment Spend Firewall, Minds Bazaar Skill (Praman_Spend_Guard) & Solana / EVM Settlement Gate`
- **MCP Endpoint**: `https://praman-desk.vercel.app/api/mcp` (`18` tools, no key required)
- **Web App & Walkthrough Video**: `https://praman-desk.vercel.app` | `https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`
- **Summary**:
  `Pre-payment compliance firewall for agent treasuries and cross-border B2B settlement. Combines a Two-Mind Investigator + Reviewer gate, a live Minds Mind (Praman.Spend.Guard, 47b85842-f36b-1410-8467-00039ce7df11) with published Bazaar Skill Praman_Spend_Guard (5BD48D42-F36B-1410-8467-00039CE7DF11), 651-byte WebAssembly arithmetic (1,043/1,043 vectors), EIP-191 supervisor countersign verification, deterministic agent claim checking (/api/agent/verify-output), Solana pre-signature inspection (30 unit + 7 Devnet tests; Devnet tx E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq), and Ethereum Sepolia TakarSettle v4/v5 escrow arbitration (0xba98c51a..., 0x976d78bb..., 0x28d3ff9c...). Paired with bonded 18-intent Devnode Miner #6164 (Sepolia Diamond #6201, warnings: 0). Counterfactual 5-scenario benchmark averted $79,373 in simulated unsafe transfers.`

### B. App 2: `praman-desk-2` (`SECURITY` track, ID `9ae7025e-65be-490b-8e59-2aa598f16992`)
- **Tagline**: `Pre-Payment Spend Firewall, Alibaba/Takar Escrow Arbiter & 18-Intent Telegraph Compliance Miner`
- **Description / Release Notes**:
  - **Live App, Keyless 18-Tool MCP & Walkthrough Video**: `https://praman-desk.vercel.app`, `https://praman-desk.vercel.app/api/mcp`, `https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`
  - **Minds (`hellominds.ai`) Integration**: Mind `Praman.Spend.Guard` (`47b85842-f36b-1410-8467-00039ce7df11`) + published Bazaar Skill `Praman_Spend_Guard` (`5BD48D42-F36B-1410-8467-00039CE7DF11`, read-only across `api/mcp` & `/api/miner/*`; fails closed on omitted `approval_cap`, omitted `name`, and synthetic doc IDs).
  - **Track 02 Miner (`#6164` / Diamond `#6201`)**: Active on Sepolia Diamond `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` (tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, `/api/miners/6201` `active`, `0` schema warnings across 18 intents: procurement WASM math, GLEIF LEI, 19,565 OFAC SDN entries, SEC EDGAR / Federal Register, CAISO OASIS LMP intervals, Ethereum/Sepolia/Solana RPCs + Uniswap v3/DexScreener depth, RDAP B2B identity, `subject` fraud scoring, Luhn/BIN/ABA/IBAN). Honest Explorer status: currently reflects Epoch 58 (`0.500` avg, best rank `#2`, `390` requests served) awaiting Epoch 59 scoring.
  - **Alibaba / Takar Sepolia Settlements**: `PO-ALI-9021` (`$100,000` USDC vs `CN-LAX-88201`, 80/100 units) halts `$20,000` overbilling or settles `$80k` / `$20k`; 3 confirmed Sepolia txs on `TakarSettle v4` (`0xba98c51a...`, `0x976d78bb...`) & `TakarSettle5` (`0x28d3ff9c...`).
  - **Solana Spend Guard (`packages/praman-sdk/solana.js`)**: `30` unit tests + `7` Devnet tests passing; blocks `@solana/web3.js` `1.95.6`/`1.95.7` tampering, drainer `FnvLGtucz4...`, Token-2022 `PermanentDelegate` (`12`) / `TransferHook` (`14`) / `FreezeAuthority`, unresolved ALTs, and session cap breaches before signing. Live guarded `0.001 SOL` Devnet tx: `E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq`. HTTP gate (`POST /api/audit/solana-spend-guard?chain=solana`) screens caller `recipient`/`sender`/Base58 validity over serialized tx bytes or caller-parameterized transfers (`mode: parameter_transfer_policy_gate`).
  - **Tencent `#01/#03` Claim Verifier (`POST /api/agent/verify-output`, `POST /api/mission/tencent-assurance`, Desk 5)**: Default `deterministic_bundle_audit` decomposes claims across OFAC, GLEIF/RDAP/FakeWatch, 651-byte WASM + ECB FX rates, and BIN/ABA/IBAN checksums (not an external LLM inference call unless configured), paired with live Devnode escrow corroboration (`evidence/tencent-live-proof.json`, receipt `0x4dc29b2b...` on `TxLens #9002`).
  - **Ledger & Escrow Proofs (`/api/ledger`)**: `32` unique Sepolia txHashes (`$0.30` direct miner queries) + `4` live `402 -> X-PAYMENT` Devnode escrow receipts (`$0.04`) + `takarResolvers`.
  - **Track 03 Evaluators & EvalPool**: `651-byte` `comparator.wasm` (`https://praman-desk.vercel.app/comparator.wasm`, `1,043/1,043` vectors), stateless deterministic `POST /api/evaluator/sanctions-batch` (`1` to `50` items with precision/recall/F1, non-neural matching superseding retired legacy `#469` tunnel), and `309` Devnode EvalPool rows (`301` `attested`, `8` earlier `unverified`; test vectors excluded from public git).

---

## 2. Discord Showcase, Track Channels & Partner Reproduction Messages

### A. Discord `#showcase` Thread Update (`1569379402360553692`)
- **Thread Title**: `Praman Desk | Miner #6164 / Diamond #6201 (18 Intents) | Minds Bazaar Skill | Solana + EVM Spend Guard | TakarSettle`
- **Body**:
  `Updated Praman Desk for Telegraph Season II (live at https://praman-desk.vercel.app, MCP at https://praman-desk.vercel.app/api/mcp):`
  `- Track 01 (Apps & Agents): Published Minds Bazaar Skill Praman_Spend_Guard (skillId 5BD48D42-F36B-1410-8467-00039CE7DF11 on Mind 47b85842-f36b-1410-8467-00039ce7df11), Two-Mind Spend Guard, Alibaba PO-ALI-9021 arbitration (TakarSettle v4 0xba98c51a... / v5 0x28d3ff9c...), Tencent #01/#03 deterministic claim verifier (/api/agent/verify-output + Desk 5), and Solana Token-2022 TLV pre-signature guard (30 unit + 7 Devnet tests; live Devnet tx E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq). Counterfactual simulation across 5 scenarios averted $79,373.`
  `- Track 02 (Miner #6164 / Sepolia Diamond #6201): Pinned on-chain tx 0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65 (Block 12214472), active on Devnode /api/miners/6201 with 0 warnings across 18 intents (30/30 live endpoint checks passing; Anjoman Explorer reflects Epoch 58 0.500 avg pending Epoch 59 scoring). /api/ledger records 32 Sepolia txs ($0.30) + 4 Devnode escrow purchases ($0.04) + 3 Takar settlements.`
  `- Track 03 (Evaluators / Truth Sources): 651-byte WASM comparator (1,043/1,043 vectors), stateless deterministic batch evaluator POST /api/evaluator/sanctions-batch (superseding legacy #469 trycloudflare), and 309 Devnode EvalPool rows (301 attested, 8 earlier unverified).`
  `- Walkthrough Video: https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`

### B. Discord Alibaba Channel Reply (`Alibaba - Commercial AI, Trade & Autonomous Commerce`, to Ahmed Ali)
`Hi @Ahmed Ali, posting the clean reproduction summary for our Alibaba & Cainiao Trade Assurance integration on Praman Desk:`
`- PO-ALI-9021 ($100,000 USDC escrow in TakarSettle v4 0x310275e6D66818E068245326bB9e398822304248 vs Port of LA receipt CN-LAX-88201, 80 conforming / 20 damaged units): deterministic 651-byte WASM circuit breaker halts the $20,000 overbilling discrepancy (Case A), while authorized reconciled settlement (Case B) splits $80,000 USDC to supplier / $20,000 USDC refund to buyer.`
`- Reproducible shareable HTML & JSON case view: https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html`
`- On-chain Sepolia TakarSettle v4 & v5 settlement receipts: 0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75 (Block 12190408), 0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13 (Block 12200598), and 0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de (Block 12200597). EAS UID: 0x33d85bed90eb3164c5124a7c26ca79be386003205265044d1425cea9b714e115.`
`- Interactive console & walkthrough video: https://praman-desk.vercel.app and https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`

### C. Discord Solana Channel Post (`Solana Institutional AI & Commercial Applications`)
`Sharing Praman Desk's Solana Pre-Signature Spend Guard SDK and live Solana RPC coverage on Telegraph Miner #6164 (Diamond #6201):`
`- Pre-Signature Spend Guard (packages/praman-sdk/solana.js + Desk 1 live console): inspects legacy Transaction and v0 VersionedTransaction bytes before signing, blocking hijacked @solana/web3.js (1.95.6/1.95.7 addToQueue tampering), drainer wallet FnvLGtucz4..., SPL Token-2022 TLV PermanentDelegate (12) / TransferHook (14) / FreezeAuthority mints, unresolved ALTs, and cumulative session spend-cap breaches. HTTP policy gate (POST /api/audit/solana-spend-guard?chain=solana) validates Base58 recipient/sender addresses fail-closed.`
`- Live Devnet guarded settlement confirmed (0.001 SOL, certHash 0xe3fccaf8...): https://solscan.io/tx/E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq?cluster=devnet`
`- Live Solana Miner Endpoints on https://praman-desk.vercel.app: /api/miner/wallet-balance, /api/miner/token-supply (exact SPL decimals), /api/miner/onchain-tx (Base58 v0/v1 with as_of), and /api/miner/liquidity-depth?pair=SOL/USDC.`
`- Local reproduction: npm run solana:test (30 unit + 7 Devnet tests) and npm run solana:demo.`

### D. Discord Use Cases Channel Post (`Use Cases - Apps, Agents & Integrations`)
`Shipping the reproducible code, UI, and live Devnode escrow receipt for our Tencent #01/#03 Enterprise Agent Decision Assurance workflow:`
`- Endpoint & UI: POST https://praman-desk.vercel.app/api/agent/verify-output, POST /api/mission/tencent-assurance, and Desk 5 (Procurement Verify -> Agent Output Claim Verifier).`
`- How it works: runs deterministic_bundle_audit to decompose raw agent output across OFAC SDN (19,565 entries + EVM addresses), GLEIF LEI + RDAP + FakeWatch domain checks, 651-byte WASM arithmetic (including comma-thousands and tax-inclusive prose) + live ECB Frankfurter FX rates, and ISO 7812 Luhn / ABA Mod-10 / IBAN Mod-97 checksums before emitting GO, HOLD_FOR_MISSING_EVIDENCE, or NO_GO with prevented dollar exposure.`
`- Local test suite & live Devnode escrow proof: npm run tencent-visa:test (8/8 pass) and evidence/tencent-live-proof.json (escrow receipt 0x4dc29b2b788e3feef9aacf95668931e8305d01cd3a8c27289af06d2b95324937 on TxLens #9002, signal 0x8d81b53e5c39be8df37d6982e26ac277c51957bc7ae1ba33d9e8f8488355d8ab).`

### E. Discord Minds Thread Reply (`Minds Agents - Development & Collaboration`, `1573287348689567774`)
`Hi @Ahmed Ali, sharing our live Animoca Minds integration built for Telegraph Season II:`
`- Mind: Praman.Spend.Guard (47b85842-f36b-1410-8467-00039ce7df11, https://hellominds.ai/profile/minds/47b85842-f36b-1410-8467-00039ce7df11)`
`- Published Bazaar Skill: Praman_Spend_Guard (skillId 5BD48D42-F36B-1410-8467-00039CE7DF11)`
`- How it works: any Mind equipped with Praman_Spend_Guard uses read-only HTTP_Execute calls against https://praman-desk.vercel.app/api/mcp (18 keyless MCP tools) and /api/miner/* to screen OFAC SDN sanctions, verify GLEIF legal entities, reconcile line-item invoice math down to $0.01, check EVM/Solana transactions, and audit other agents' numeric claims without holding keys or fabricating omitted document IDs/caps.`

### F. For Anthony (EIP-191 Countersign + PO-ALI-9021 Case + 18-Intent Diamond `#6201`)
`Hey @anthony, sharing direct endpoints on Praman Desk so you can test our countersign gate, claim verifier, Minds Bazaar skill, and 18-intent Diamond #6201 miner:`
`1. Real EIP-191 Countersign Verification (POST https://praman-desk.vercel.app/api/spend-guard/evaluate): invalid countersign payloads fail closed with COUNTERSIGN_SIGNATURE_INVALID and HOLD_FOR_MANUAL_REVIEW via viem recoverMessageAddress; non-numeric spend fields return HTTP 400 (INVALID_NUMERIC_INPUT).`
`2. Shareable Trade Assurance Case (GET https://praman-desk.vercel.app/api/audit/case?case=po-ali-9021&format=html): renders $80,000 release / $20,000 refund (RECONCILED_PARTIAL_SETTLEMENT) with Sepolia TakarSettle v4 + EAS links.`
`3. Diamond #6201 (warnings: 0) & Agent Verifier: test POST /api/agent/verify-output, POST /api/evaluator/sanctions-batch, Solana/EVM /api/miner/* routes, or equip Praman_Spend_Guard (5BD48D42-F36B-1410-8467-00039CE7DF11) on hellominds.ai.`

### G. For Bangdrop (Takar Escrow Integration & Case 0 / 1 / 2 Sepolia Receipts in Desk 0 & Desk 3)
`Hey @bangdrop, confirming full on-chain verification and live ledger indexing for all three Takar escrow resolutions settled by Praman Desk (0x98021b20Efdb7ae2C57366010a6E0fDE207b4466) on Ethereum Sepolia:`
`- Deal 0 (TakarSettle v4, Block 12190408): 0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75 ($80,000 release / $20,000 refund).`
`- Case 1 (TakarSettle v4, Block 12200598): 0x976d78bb84e2f9ff131ae137646f3faa2640a81b7b77c7829feb222f1eb27f13.`
`- Case 2 (TakarSettle5, Block 12200597): 0x28d3ff9c941714af3f15ec1776dec0a218ba23f826359bea4636804035ea67de (960 / 1,000 units reconciled).`
`Live /api/ledger now indexes 32 Sepolia miner txs ($0.30 direct calls) alongside all 4 Devnode escrow purchases ($0.04) and takarResolvers in Desk 3 (https://praman-desk.vercel.app/#ledger).`

### H. For QuincyBob (`QUINCY_PROMPT_LAB` / Adversarial Verifier & Batch Sanctions Test)
`Hey @quincybob, sharing two adversarial endpoints on Praman Desk for testing against QUINCY_PROMPT_LAB:`
`1. POST https://praman-desk.vercel.app/api/agent/verify-output (json {"vendor":"Siemens AG","output":"..."}) -> returns GO / HOLD_FOR_MISSING_EVIDENCE / NO_GO decomposing arithmetic + ECB FX, Luhn/ABA/IBAN checksums, GLEIF/RDAP entities, FakeWatch domains, and OFAC SDN hits.`
`2. POST https://praman-desk.vercel.app/api/evaluator/sanctions-batch (json {"items":[...]}) -> stateless 1 to 50 item deterministic OFAC SDN + EVM batch scoring returning per-item results and precision/recall/F1 when expected_matched labels are supplied.`

### I. For Ahmed Ali (Direct Season II Pre-Deadline Summary Before Dec 1)
`Hey @Ahmed Ali, sharing our concise Season II status across all three tracks (praman-desk-2 9ae7025e-65be-490b-8e59-2aa598f16992 + praman-desk + Miner #6164 / Diamond #6201):`
`- Live App, 18-Tool MCP & Walkthrough Video: https://praman-desk.vercel.app, https://praman-desk.vercel.app/api/mcp, https://praman-desk.vercel.app/praman-desk-walkthrough.mp4`
`- Track 01: Published Minds Bazaar Skill Praman_Spend_Guard (5BD48D42-F36B-1410-8467-00039CE7DF11 on Mind 47b85842-f36b-1410-8467-00039ce7df11), Alibaba/Takar Sepolia settlements (TakarSettle v4 & v5), Tencent #01/#03 deterministic claim verifier (/api/agent/verify-output + evidence/tencent-live-proof.json), and Solana Pre-Signature Spend Guard (30 unit + 7 Devnet tests; live Solscan Devnet settlement E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq).`
`- Track 02: Sepolia Diamond #6201 (tx 0x50b34afc..., Block 12214472) active on /api/miners/6201 with 0 warnings across 18 intents and 30/30 live endpoint checks passing (Explorer currently shows Epoch 58 0.500 avg awaiting Epoch 59 scoring).`
`- Track 03: 651-byte WASM comparator (1,043/1,043), stateless deterministic batch evaluator POST /api/evaluator/sanctions-batch (superseding retired legacy #469 trycloudflare tunnel), and 309 Devnode EvalPool rows (301 attested, 8 earlier unverified).`

---

## 3. X Updates (`@vishal_karad`, 3-Date Requirement Tagging `@Telegraphprotoc`)

Keep each post tight and grounded so nothing gets clipped on standard 280-character posts.

### Update 1 (Nov 26, Replace Old `2125698555092553987`, Track 01 + TakarSettle + Walkthrough Video)
```
AI agents lose funds when invoice math drifts $0.01 or LLMs ok unverified claims.

Praman Desk on @Telegraphprotoc adds a 651B WASM gate, EIP-191 countersigns & Sepolia TakarSettle ($80k/$20k).

Walkthrough video & tx:
https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
https://sepolia.etherscan.io/tx/0xba98c51a20860d7019c8331138298fe319b6693002b51a88fc7a606de6891f75
```

### Update 2 (Nov 27-28, Track 02 Diamond `#6201` + Minds Bazaar Skill `Praman_Spend_Guard`)
```
Praman Miner #6164 on @Telegraphprotoc upgraded to Sepolia Diamond #6201 (0 warnings, 18 intents) and ships as Minds Bazaar Skill Praman_Spend_Guard (hellominds.ai) via GLEIF, OFAC SDN, EDGAR, CAISO, and Solana/EVM RPCs:

https://sepolia.etherscan.io/tx/0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65
https://praman-desk.vercel.app
```

### Update 3 (Nov 29-30, Solana Pre-Signature Guard + Live Devnet Tx + Track 03 EvalPool)
```
Praman's Solana Guard blocks hijacked @solana/web3.js queues, drainer wallets, Token-2022 PermanentDelegate/TransferHook mints & OFAC hits before signing, plus 301 attested EvalPool rows on @Telegraphprotoc.

Devnet tx & repo:
https://solscan.io/tx/E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq?cluster=devnet
https://github.com/VishAlgoDev/praman-desk
```

---

## 4. GitHub Mission `/progress` Update Template (`telegraphprotocol/bounties` Issues `#189, #190, #191, #192, #196, #199, #200, #201, #202`)

```markdown
/progress Update (Season II Verification Sync, Nov 26):
- Production App, Keyless 18-Tool MCP & Walkthrough Video: https://praman-desk.vercel.app, https://praman-desk.vercel.app/api/mcp, https://praman-desk.vercel.app/praman-desk-walkthrough.mp4
- Minds (`hellominds.ai`) Mind & Bazaar Skill: Mind `Praman.Spend.Guard` (`47b85842-f36b-1410-8467-00039ce7df11`) with published Skill `Praman_Spend_Guard` (`5BD48D42-F36B-1410-8467-00039CE7DF11`).
- Active Track 2 Miner: Devnode `#6164` / Sepolia Diamond `#6201` (`tx: 0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, `/api/miners/6201` `active`, `0` warnings across 18 intents; 30/30 live checks passing; Explorer currently shows Epoch 58 `0.500` avg awaiting Epoch 59 scoring).
- Live On-Chain & Devnode Proofs: `32` Sepolia txHashes (`$0.30`) + `4` Devnode escrow receipts (`$0.04`, including `evidence/tencent-live-proof.json` `0x4dc29b2b...`) + `3` TakarSettle v4/v5 Sepolia resolutions (`0xba98c51a...`, `0x976d78bb...`, `0x28d3ff9c...`) + Solana Devnet settlement `E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq`.
- Track 3 Verification: `651-byte` WASM comparator (`1,043/1,043`), stateless deterministic evaluator `POST /api/evaluator/sanctions-batch` (superseding retired legacy `#469` tunnel), and `309` Devnode EvalPool rows (`301` `attested`, `8` earlier `unverified`).
- Reproduction Commands: `npm run sdk:test`, `npm run comparator:test`, `npm run alibaba:demo`, `npm run tencent-visa:test`, `npm run benchmark`, `node scripts/verify-15-miner-endpoints.mjs --live`, and `node scripts/test-endpoints-local.mjs`.
```

---

## 5. Final Hackathon Season II Track Blurbs (Before Dec 1, 2026 23:59 UTC)

### Track 01: Apps & Agents (`Praman Desk`)
Praman Desk (`praman-desk-2`, Anjoman ID `9ae7025e-65be-490b-8e59-2aa598f16992`) is a pre-payment spend firewall and cross-border escrow arbiter for automated agents. It combines a Two-Mind Investigator + Reviewer flow (`examples/minds-spend-guard/`), a live Animoca Minds integration (`Praman.Spend.Guard`, `47b85842-f36b-1410-8467-00039ce7df11`, published Bazaar Skill `Praman_Spend_Guard` `5BD48D42-F36B-1410-8467-00039CE7DF11`), a deterministic agent claim verifier (`/api/agent/verify-output`, `/api/mission/tencent-assurance`), an Alibaba & Cainiao Trade Assurance arbiter settling live disputes on Ethereum Sepolia (`TakarSettle v4` & `TakarSettle5`), a Solana Pre-Signature Spend Guard (`30` unit + `7` Devnet tests, Token-2022 TLV & ALT fail-closed checks, confirmed Devnet tx `E3qVPMwc...`), and an 18-tool keyless MCP endpoint (`/api/mcp`). Across a 5-scenario counterfactual benchmark (`benchmark/with-vs-without-telegraph.mjs`), it averted `$79,373` in simulated unsafe transfers while settling real Devnode `402 -> X-PAYMENT` escrow calls (`0x86e237a0...` direct `#6164`, `0x4dc29b2b...` Tencent `#01/#03`).

### Track 02: Miners / Providers (`Praman Desk Compliance & Procurement Auditor`)
Bonded on Ethereum Sepolia Diamond `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` under active Devnode Route `#6164` (`praman-compliance-miner`) and Diamond Registration `#6201` (tx `0x50b34afc2b4044ff23a67eebc7170e3aeb2c276fc3c54ee83edc10b438af9e65`, Block `12214472`, pinned SHA-256 `0x75e46b7985e14e970648c914a7ae463ff919a25fd868db3224999fc34a827719`, Devnode `/api/miners/6201` `active` with `0` warnings), Praman serves 18 intents across WASM procurement math, GLEIF LEI across 200+ jurisdictions, 19,565-entry OFAC SDN screening (failing closed with `matched: null` when unscreened), SEC EDGAR / Federal Register monitoring, CAISO OASIS LMP intervals, Ethereum/Sepolia/Solana RPCs + Uniswap v3 / DexScreener depth, RDAP B2B enrichment, `subject` fraud scoring, and Luhn/BIN/ABA/IBAN validation. Live HTTP probes pass `30/30` on `https://praman-desk.vercel.app`; Anjoman Explorer currently reflects Epoch 58 (`0.500` avg, `#2` best rank, `390` requests served) awaiting Epoch 59 scoring.

### Track 03: Evaluators / Truth Sources (`Praman 651-Byte WASM Comparator, Stateless Batch Evaluator & Attested EvalPool`)
Praman anchors deterministic commercial verification via a standalone `651-byte` zero-import WebAssembly binary (`comparator.wasm`, `1,043/1,043` fixed-point vectors), a stateless deterministic OFAC batch evaluator (`POST /api/evaluator/sanctions-batch`, 1 to 50 items with precision/recall/F1 metrics, non-neural matching cleanly superseding the retired ephemeral `#469` tunnel), and `309` contributor rows on Devnode EvalPool (`301` `provenance_class: "attested"` rows and `8` earlier `unverified` rows; evaluation `.jsonl` files stay excluded from public git so benchmark inputs stay private).
