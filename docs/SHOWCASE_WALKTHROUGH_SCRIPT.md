# Praman Desk: Production Walkthrough & Developer Showcase

**Canonical Master Video:** `public/praman-desk-walkthrough.mp4` (`1920x1080` @ `24fps` H.264 + AAC `48000Hz` stereo EBU R128 `-16 LUFS`, `+faststart`, `72,616,432` bytes / `188.04s`, WebVTT captions at `public/captions/walkthrough.en.vtt`)  
**Production Studio Pipeline:** ElevenLabs `Viraj - Rich and Soft` (`P1bg08DkjqiVEzOn76yG`, `Eleven v4`) + Chrome CDP smooth-Bezier cursor capture + HyperFrames (`0.9.103`) dynamic zoom composition against live `https://praman-desk.vercel.app`  
**Live Application:** [https://praman-desk.vercel.app](https://praman-desk.vercel.app)  
**GitHub Repository:** [https://github.com/VishAlgoDev/praman-desk](https://github.com/VishAlgoDev/praman-desk)  

**Core Verified Infrastructure Coordinates:**
- **Sovereign Escrow (`PramanEscrow.sol`, Ethereum Sepolia):** `0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c` (`Deal #0` split: `0xbfc22464...`, `Deal #1` halt: `0xc69358c2...`)
- **Telegraph Diamond Miner (`Route #6164` / `RegID #6217`, `28` bonded / `30` intents):** `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` (`tx: 0x38998dd4...`)
- **Track 3 MiniCheck LoRA Evaluators (`#295–#300`):** `15`-epoch EvalPool adapters (`EvalPool` Sepolia)
- **Solana Devnet Settlement (`0.001 SOL` Spend-Guarded):** `E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq`
- **651-Byte WASM Comparator:** `https://praman-desk.vercel.app/comparator/comparator.wasm` (`1,043/1,043` deterministic test vectors)
- **Keyless Streamable HTTP MCP (`29` Tools):** `https://praman-desk.vercel.app/api/mcp`

---

## 6-Scene Studio Walkthrough Breakdown (`188.04s` / `3m 08s`)

| Scene | Timestamp | Title | Live Pages & Controls Shown |
|---|---|---|---|
| **Scene 1** | `00:00.0 – 00:30.4` | **Overview & Counterfactual Benchmark** | `https://praman-desk.vercel.app/` hero (`$79,373` counterfactual loss averted across `5` adversarial vectors at `100%` block rate), signed clearing memo switcher (`po-ali-9021`, `solana-token2022-halt`), `5` operator desk preview grid |
| **Scene 2** | `00:30.4 – 01:05.3` | **Trade Assurance Case A Halt, Case B Split & Browser Verify** | `/desks#trade-assurance` (`PO-ALI-9021` on sovereign `PramanEscrow`, Case A `$100k` claim halted at `Stage 13` `<3ms` -> Case B `$80k / $20k` split to Siemens) -> `/verify?case=po-ali-9021` WebCrypto `SHA-256` + `EIP-191` signature verification |
| **Scene 3** | `01:05.3 – 01:37.2` | **Pre-Signature Solana Token-2022 Armor & Policy Gate** | `/desks#spend-guard` (`token2022_permanent_delegate` `TLV 12` `~2ms` local intercept, compliant Devnet release proof `E3qVPMwc`, `30` unit + `7` Devnet checks, custom server-side vendor spend gate) |
| **Scene 4** | `01:37.2 – 02:04.9` | **Sepolia Settlement Ledger & Fail-Closed GSQ Mining Registry** | `/desks#settlement-ledger` (`32` Ethereum Sepolia proofs across `15` registered Telegraph miners + Devnode escrow signals) -> `/desks#mining-registry` (GSQ Mount Morgan `44t` reconciliation + `999999` fail-closed `UNVERIFIED_PROSPECT` at `0.20` confidence) |
| **Scene 5** | `02:04.9 – 02:34.2` | **Live Desk 5, Daily 19,629 OFAC RAM, Claim Verifier & In-Browser WASM** | `/desks#verification-labs` (`PO-7781` `1000 x $12.40` zero-drift tie-out, `19,629`-record daily-refreshed OFAC SDN RAM flagging `Viktor But` at `78%`, Agent Claim Verifier, Track 3 sanctions batch evaluator, client-side `651B` WASM comparator) |
| **Scene 6** | `02:34.2 – 03:08.0` | **29-Tool Keyless MCP, Diamond #6217 & Evaluators #295-#300** | `/docs` (`29` keyless Streamable HTTP MCP tools, TS/Python SDKs, Animoca Minds Bazaar skill) -> `/roadmap` (Live Today vs Planned vs Miner `#6164` / Diamond `#6217` across `28` bonded intents + Track 3 MiniCheck LoRA evaluators `#295–#300`) |

---

## EBU R128 Narration Master (`Viraj - Rich and Soft`, `Eleven v4`, `48kHz`)

1. **Scene 1 (`00:00.0 – 00:30.4`):** "Give an AI agent wallet keys, and one inflated invoice, phishing link, or stale sanctions check drains funds in seconds. Pramaan Desk verifies every dollar before keys sign. On our benchmark across five adversarial vectors — inverted FX, lapsed company registrations, phishing URLs, math drift, and sanctions — an ungrounded baseline lost seventy-nine thousand three hundred seventy-three dollars, while Pramaan caught all five at one-hundred-percent block rate."
2. **Scene 2 (`00:30.4 – 01:05.3`):** "Inside Trade Assurance, Purchase Order ninety-twenty-one anchors a one-hundred-thousand-USDC obligation to our sovereign Pramaan Escrow contract on Ethereum Sepolia against a Cainiao warehouse inspection showing eighty conforming units and twenty damaged. Submitting the full claim trips our six-hundred-fifty-one-byte WebAssembly comparator at Stage Thirteen in under three milliseconds, halting release fail-closed. Reconciling Case B releases eighty thousand USDC to Siemens, refunds twenty thousand, and signs a browser-verifiable EIP-one-ninety-one memo."
3. **Scene 3 (`01:05.3 – 01:37.2`):** "The same firewall guards Solana wallets before a transaction ever reaches an RPC node. Our Solana middleware inspects legacy and versioned transactions locally, blocks compromised web3 hooks, known drainers, and Token-Twenty-Twenty traps like PermanentDelegate TLV Twelve in roughly two milliseconds. Compliant transfers approve alongside live Solana Devnet confirmations, backed by thirty unit tests and seven live Devnet checks, plus a server-side policy gate for custom vendor spend caps."
4. **Scene 4 (`01:37.2 – 02:04.9`):** "Every verification produces an immutable receipt. Our Settlement Ledger indexes thirty-two Ethereum Sepolia proofs across fifteen independent Telegraph miners and Devnode escrow signals — click any row to inspect its signal hash and Etherscan proof. In our Mining Registry, Pramaan cross-checks Queensland Government survey records, reconciling Mount Morgan's forty-four-ton variance while failing closed at twenty percent confidence on unknown sites."
5. **Scene 5 (`02:04.9 – 02:34.2`):** "In Desk Five, live labs test arbitrary inputs end to end. Purchase Order seventy-seven eighty-one ties out one thousand units times twelve dollars forty cents with zero drift. Our daily-refreshed nineteen-thousand-six-hundred-twenty-nine-entry OFAC RAM index flags Viktor But at seventy-eight percent similarity. Below it, our Agent Claim Verifier catches third-party math hallucinations alongside our Track Three evaluator and in-browser WebAssembly comparator."
6. **Scene 6 (`02:34.2 – 03:08.0`):** "Integrating takes a single endpoint. Docs exposes twenty-nine keyless Model Context Protocol tools, TypeScript and Python SDKs, and our Animoca Minds Bazaar skill. Our Roadmap separates today's live testnets and government registries from mainnet custody milestones. Operating live on Telegraph Protocol as Miner six-one-six-four and Diamond six-two-one-seven across twenty-eight bonded intents with Track Three LoRA evaluators two-ninety-five through three-hundred, Pramaan Desk verifies every dollar before keys sign."
