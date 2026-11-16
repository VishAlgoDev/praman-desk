# Technical X Thread Draft (Praman Desk — Telegraph Season II)

*Tone: Authentic, technical, engineer-to-engineer. Zero marketing fluff. Grounded entirely in real Devnode metrics, contract receipts, and code architecture.*

---

### Tweet 1 (The Mission)
When autonomous AI agents manage real treasury balances, the biggest risk isn't hallucinated text—it's paying the wrong counterparty or clearing tampered invoice math.

Today we're shipping the final sprint for Praman Desk for @TelegraphProto Season II: an autonomous pre-payment spend guard & counterparty clearing desk live on Ethereum Sepolia and Vercel.

Here is what we built across Track 1, Track 3, and a 651-byte pure WebAssembly engine. 🧵👇

---

### Tweet 2 (Track 1: Devnode Miner #5289 Performance)
In Devnode Epoch 2107, Miner #5289 served 151 live network requests over our Cloudflare runner tunnel, securing top podium spots across 2,173 registered miners:

• INVOICE_LEDGER_RECONCILE_GENERAL: 0.9986 (Rank #2 Network-Wide)
• REGULATORY_FILING_MONITOR_GENERAL: 0.5000 (Rank #3 Network-Wide, tied for the #1 highest score)
• PURCHASE_ORDER_VERIFY_GENERAL: 0.9269 (Rank #5)
• DOCUMENT_AUTHENTICITY_GENERAL: 0.9922 (Rank #6)
• CORPORATE_REGISTRY_LOOKUP: 1.0000 (Rank #9, 100%)
• SANCTIONS_SCREENING_MATCH: 1.0000 (Rank #9, 100%)

Zero synthetic benchmark claims—every score is settled on the Devnode network.

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
Rather than building a single-purpose toy, Praman Desk satisfies two hackathon missions simultaneously:

1. Mission 02 (Spend Guard & Stablecoin Gate):
Real-time scan against 19,565 US Treasury OFAC SDN records & 127 EVM addresses. Feed it the Lazarus Ronin exploiter address (`0x098B...2f96`) and it triggers an immediate `REJECT_AND_FREEZE`. Enforces the FATF Travel Rule on transfers ≥ $1,000, and executes automated test USDC settlement for verified invoices.

2. Mission 04 (Legal Diligence Pack):
Queries 5 primary statutory registries directly (UK Companies House, German Handelsregister, GLEIF, US Federal Register, and SEC EDGAR). Generates a complete diligence pack in 3.2 seconds ($0.16 query fee) vs a $4,250 law firm retainer, sealed with a canonical SHA-256 digest.

---

### Tweet 5 (Developer Quickstart & Live Verification)
Any agent or developer can test Praman Desk right now with zero setup:

MCP stdio (works out of the box in Claude Desktop, Cursor, and Antigravity):
`npx -y @praman/spend-guard-mcp`

Or test the live production endpoints with curl:
`curl -s https://praman-desk.vercel.app/api/audit/diligence-pack`

• Live App: https://praman-desk.vercel.app
• GitHub: https://github.com/VishAlgoDev/praman-desk
• Sepolia Diamond: 0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b
• Contributor Wallet: 0x98021b20Efdb7ae2C57366010a6E0fDE207b4466

Huge thanks to the @TelegraphProto team and fellow builders on the Devnode leaderboard. Feedback and adversarial test queries welcome!
