# Praman Desk: Production Walkthrough & Developer Showcase

**Canonical Master Video:** `public/praman-desk-walkthrough.mp4` (`1920x1080` @ `60fps` H.264 + AAC `192kbps` EBU R128 `-14 LUFS`, `+faststart`, WebVTT captions at `public/captions/walkthrough.en.vtt`)  
**Capture Pipeline:** `scripts/record-unified-walkthrough.mjs` (real Chrome capture against live `https://praman-desk.vercel.app`)  
**Live Application:** [https://praman-desk.vercel.app](https://praman-desk.vercel.app)  
**GitHub Repository:** [https://github.com/VishAlgoDev/praman-desk](https://github.com/VishAlgoDev/praman-desk)  

**Core Verified Infrastructure Coordinates:**
- **Sovereign Escrow (`PramanEscrow.sol`, Ethereum Sepolia):** `0x202f3a3ae0dfb60c11f81b6ca82a18a6bbc7342c` (`Deal #0` split: `0xbfc22464...`, `Deal #1` halt: `0xc69358c2...`)
- **Telegraph Diamond Miner (`Route #6164` / `RegID #6216`, `28` bonded / `30` intents):** `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` (`tx: 0x669772e6...`, Block `12227468`)
- **Solana Devnet Settlement (`0.001 SOL` Spend-Guarded):** `E3qVPMwcssFhxQuZyCgJ47yzZAk7UAUUgtxRwUAYtyD8pFZjnRrHcC91MLwMWxLixhb3YRMjWB8ifkk4cJjNEQq`
- **651-Byte WASM Comparator:** `https://praman-desk.vercel.app/comparator.wasm` (`1,043/1,043` deterministic test vectors)
- **Keyless Streamable HTTP MCP (`29` Tools):** `https://praman-desk.vercel.app/api/mcp`

---

## 4-Act Script (Executed & Synchronized in `scripts/record-unified-walkthrough.mjs`)

| Act | Scene Title | Live Pages & Controls Shown |
|---|---|---|
| **Act 1** | **Problem & Counterfactual Benchmark** | `https://praman-desk.vercel.app/` hero (`$79,373` counterfactual loss averted across 5 vectors), signed clearing memo switcher (`po-ali-9021`, `solana-token2022-halt`) |
| **Act 2** | **Alibaba Trade Assurance & PramanEscrow Split** | `/desks#trade-assurance` (Case A `alibaba_trade` `$20k` WASM halt -> Case B `alibaba_reconciled` `$80k/$20k` split) -> `/verify?case=po-ali-9021` WebCrypto SHA-256 + EIP-191 live browser check |
| **Act 3** | **Solana Pre-Signature Guard, Ledger & Fail-Closed Mining** | `/desks#spend-guard` (`token2022_permanent_delegate` TLV 12 halt) -> `/desks#settlement-ledger` (`32` indexed Sepolia settlements) -> `/desks#mining-registry` (GSQ verification + `999999` `UNVERIFIED_PROSPECT` at `0.20` confidence) |
| **Act 4** | **Live Desk 5, 29-Tool Keyless MCP & Track 3 Evaluators** | `/desks#verification-labs` (live invoice reconcile `1000 x $12.40`, `19,629`-record OFAC SDN screening, client `651B` WASM comparator) -> `/docs#mcp-integration` (`29` MCP tools + SDKs) -> `/roadmap` (Track 3 MiniCheck LoRA-v2 evaluators & commercial roadmap) |

---

## EBU R128 Narration Master (`en-IN-PrabhatNeural`, `48kHz`, `-14 LUFS`)

1. **Act 1:** "Give an AI agent a payment wallet, and a hallucinated invoice, a phishing domain, or a stale sanctions list can drain funds in seconds. Pramaan Desk verifies every dollar before keys ever sign. Across five adversarial failure modes on our homepage benchmark, an ungrounded agent lost seventy-nine thousand three hundred seventy-three dollars, while Pramaan caught all five with a one-hundred-percent block rate."
2. **Act 2:** "In Trade Assurance, Purchase Order ninety-twenty-one models a one-hundred-thousand-USDC commitment anchored to our sovereign PramanEscrow contract on Ethereum Sepolia against a Cainiao Port of Los Angeles inspection confirming eighty conforming units and twenty damaged. Submitting a full hundred-thousand claim trips our six-hundred-fifty-one-byte WebAssembly comparator in under three milliseconds. Reconciling releases eighty thousand USDC to Siemens Aktiengesellschaft under its verified German LEI, refunds twenty thousand USDC to the buyer, and issues an EIP-one-ninety-one memo verifiable directly inside the browser."
3. **Act 3:** "The same firewall guards Solana wallets before bytes reach an RPC node, halting compromised web3 hooks, known drainers, and Token-Twenty-Twenty traps like PermanentDelegate TLV Twelve, backed by a live guarded Solana Devnet settlement. Our Settlement Ledger indexes thirty-two Ethereum Sepolia proofs across fifteen Telegraph miners and PramanEscrow deals. And our Mining Registry cross-checks Queensland Government records while failing closed to Unverified Prospect at twenty percent confidence on unknown sites."
4. **Act 4:** "Inside Operator Desk Five, live reconciliation verifies a thousand units times twelve dollars forty cents with zero discrepancy, while nineteen thousand six hundred twenty-nine OFAC SDN records updated daily flag phonetic near-misses like Viktor But at seventy-eight percent similarity. Pramaan exposes twenty-nine keyless tools over Streamable HTTP MCP, TypeScript and Python SDKs, Track Three MiniCheck LoRA evaluators, and thirty capabilities on Telegraph Diamond six-two-one-six, verifying every dollar before keys sign."
