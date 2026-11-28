# Technical X Thread Draft (Praman Desk — Telegraph Season II)

*Tone: Authentic, technical, engineer-to-engineer. Zero marketing fluff. Grounded entirely in real Devnode metrics, contract receipts, and code architecture.*

---

### Tweet 1 (The Mission)
When autonomous AI agents manage real treasury balances, the biggest risk isn't hallucinated text—it's paying the wrong counterparty or clearing tampered invoice math.

Today we're shipping the final sprint for Praman Desk for @TelegraphProto Season II: an autonomous pre-payment spend guard & counterparty clearing desk live on Ethereum Sepolia and Vercel.

Here is what we built across Track 1, Track 3, and a 651-byte pure WebAssembly engine. 🧵👇

---

### Tweet 2 (Track 1: Devnode Miner Standing — Epoch 16)
On the live Telegraph Devnode network, Miner #6127 (Route #5281) holds verified podium standings across registered miners:

• DOCUMENT_AUTHENTICITY_GENERAL: 0.9993 (Rank #1 Globally)
• SANCTIONS_SCREENING_MATCH_GENERAL: 1.0000 (Rank #3 Globally, 19,629 OFAC records)
• CORPORATE_REGISTRY_LOOKUP_GENERAL: 1.0000 (Rank #6 Globally, 200+ jurisdictions)
• INVOICE_LEDGER_RECONCILE_GENERAL: 651-byte WASM engine (Prior Rank #2)
• PURCHASE_ORDER_VERIFY_GENERAL: DOA breach verification (Prior Rank #1)

Zero synthetic benchmark claims—every score is evaluated directly on Devnode.

---

### Tweet 3 (The Math: 651-Byte Pure WASM Comparator)
Why did we write a custom WebAssembly comparator?

Because legacy ERPs and AI agent tool calls frequently fail on floating-point rounding. When evaluating line items at Wei scale ($10^{18}$) or multi-currency conversions, standard JavaScript numbers drift.

Our comparator (`comparator.wasm`):
• Exactly 651 bytes binary
• 0 external imports, 0 host dependencies, 0 memory allocators
• 128-bit restoring division with quotient saturation
• 1,043 / 1,043 unit test vectors passing with 100% bitwise determinism

It catches 1-cent variance and unit-price drift before money moves.

---

### Tweet 4 (Dual-Mission Compliance: Missions 02 & 04)
Rather than building a single-purpose toy, Praman Desk satisfies multiple hackathon missions simultaneously:

1. Mission 02 (Spend Guard & Stablecoin Gate):
Real-time scan against 19,629 US Treasury OFAC SDN records & 127 EVM addresses. Feed it the Lazarus Ronin exploiter address (`0x098B...2f96`) and it triggers an immediate `REJECT_AND_FREEZE`. Enforces the FATF Travel Rule on transfers ≥ $1,000, and executes automated test USDC settlement for verified invoices.

2. Mission 04 (Legal Diligence Pack):
Queries 5 primary statutory registries directly (UK Companies House, German Handelsregister, GLEIF, US Federal Register, and SEC EDGAR). Generates a complete diligence pack in 3.2 seconds ($0.16 query fee) vs a $4,250 law firm retainer, sealed with a canonical SHA-256 digest.

---

### Tweet 5 (Developer Quickstart & Live Verification)
Any agent or developer can test Praman Desk right now with zero setup:

Streamable HTTP MCP (works out of the box in Cursor, Claude Code, and Antigravity):
`https://praman-desk.vercel.app/api/mcp` (29 tools)

Local Stdio CLI:
`npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp`

Or probe health and threat evaluation with curl:
`curl -s https://praman-desk.vercel.app/api/health`

• Live App: https://praman-desk.vercel.app
• GitHub: https://github.com/VishAlgoDev/praman-desk
• Active Sepolia Diamond Port: 0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b (Diamond registration #6217, 28 bonded intents / 30 capabilities)
• Contributor Wallet: 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466

Huge thanks to the @TelegraphProto team and fellow builders on the Devnode leaderboard. Feedback and adversarial test queries welcome!
