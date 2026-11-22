---
name: telegraph-hackathon
description: Master strategic playbook, technical architecture, and winning execution rules for Telegraph Protocol Hackathon Season II. Guides end-to-end development, judging criteria alignment, zero-slop verification, and organic developer distribution across Track 1 (Apps & Agents), Track 2 (Miners), Track 3 (Evaluators), and Developer Activation.
---

# Telegraph Protocol Hackathon Season II — Master Winning Playbook

## 1. What Telegraph Protocol Is (First Principles)
Telegraph is an open decentralized intelligence network on Ethereum connecting three core participants:
1. **Consumers (Apps & Agents)**: Autonomous agents, DAOs, or applications that buy decentralized intelligence before making high-stakes decisions (spending money, approving listings, resolving disputes).
2. **Miners / Providers**: Services bonded on the Sepolia Diamond contract (`0x3624EB012B5E998BB57B6bE6C9Cfc9c4bc5eb99b` / `0x72a70e94...`) that answer task requests ("Intents") and compete on quality and latency.
3. **Evaluators**: Benchmarking modules and ground-truth truth sources that test miner quality and score performance across epochs.
4. **The Settlement Rail**: HTTP 402 (x402) micropayments settling in test USDC on Ethereum Sepolia.

---

## 2. The Core Mission of Hackathon Season II
> *"Season II is about building something people can use. Apps need intelligence. Providers supply it. Evaluators test its quality. Together, they turn working ideas into products and make Telegraph more useful for the next builder."* — Official Rules Section 07

### What Disqualifies or Repels Judges ("The AI Slop Failure Mode"):
- **Mission Hoarding Without Depth**: Claiming missions without meaningful, testable results. Section 02 states: *"An app can complete several missions, but each one needs its own meaningful, testable result. Merely attaching several mission labels to the same trivial action does not count. A single app completing three missions is still one app."*
- **Vanity Volume Inflation**: Bragging about 50+ self-routed $0.01 testnet receipts. Section 05 states: *"Accurate claims: Say which network you used and what was actually verified. Testnet, production, internal testing, and real customer demand are different things. Testnet use is not presented as paying production usage."*
- **Rubric-Recitation Theater**: Announcing "100/100 points" in videos or UI headers.
- **Form & Tab Sprawl**: Building an internal ERP dashboard with 9 tabs and 15 inputs per form, expecting users to paste 64-character SHA-256 digests.
- **Fake UI Theater**: Using `setTimeout` loops to pretend an agent is running.

---

## 3. The 100-Point Scoring Rubric (Track 01: Apps & Agents)

| Category | Points | What Judges Look For |
| :--- | :---: | :--- |
| **Technical Quality & Mainnet Readiness** | **35** | Minimum 24/35. Clean, deterministic, crash-safe code, proper error handling, safe key management, zero client-side private key leakage. |
| **Commercial Viability** | **25** | Clear user or buyer, genuine problem, useful result, sensible costs, believable path to adoption. |
| **Genuine Independent Adoption & Retention** | **10** | Verified third-party use, external builder testing, integrations into other developer stacks. |
| **Telegraph Network Integration & Usage** | **5** | Genuine x402 requests, receipt verification, valid Sepolia transaction hashes. |
| **Reproducibility & Verifiable Proof** | **5** | Working demo, clear quickstart, reproducible failure case. |
| **Organic Growth, Education & Activation** | **20** | 5 pts content/education; 5 pts ease of adoption (MCP/API); 5 pts updates across dates; 5 pts evidence an independent developer acted/tested. |

---

## 4. Master Strategy: The Sovereign Circuit Breaker & Truth Arbitrator

### The Founder's Strategic Posture (Collaborative Meta-Layer & Protocol Mergability):
We do not engage in petty zero-sum mud fights with specialized miners. Instead, we execute the winning meta-layer strategy:
1. **On the Surface (The Ecosystem Benefactor)**:
   - Publicly ingest, cite, and corroborate peer miners (Takar, FakeWatch, ChainSight, OathCast).
   - Publish free on-chain EAS Sepolia cross-attestations on shared schemas (e.g., Schema UID `0x351b...`, Attestation UID `0x33d85bed...`).
   - Offer open zero-install MCP tools (`/api/mcp`) to all builders in the network.
2. **Underneath (The Sovereign Layer Above All)**:
   - Because single miners hallucinate (Issue #208 sanctions misses, Issue #226 phishing false negatives) or crash on float math (Issue #227), Praman Desk acts as the **fail-closed pre-payment circuit breaker**.
   - If a miner hallucinates, Praman catches the error and freezes funds. If a miner is right, Praman seals it with an EAS receipt.
   - We maintain sovereign in-memory engines (19,599 OFAC records, ISO 7064 LEI Mod 97-10 check, 651-byte WASM comparator) that never fail on 504s.
3. **Post-Hackathon Protocol Mergability**:
   - Because Praman Desk is natively built on Telegraph's exact stack (x402 micropayments, Diamond contracts, EAS schemas, and AssemblyScript WASM), it serves as the turn-key pre-payment safety layer that Telegraph core can directly merge or adopt.

### The 3 Judging Traps & Calibrated Antidotes:
- **Trap 1: "Vampire Middleware"**: Judges reject a pure aggregator that takes credit for underlying scrapers.
  - *Antidote*: Frame as the **Sovereign Circuit Breaker & Truth Arbitrator** that brings sovereign data (OFAC, GLEIF, WASM) and catches miner bugs that would otherwise drain treasuries.
- **Trap 2: "Evaluator PR Merge Deadlock"**: Relying on upstream maintainer PR merges (#217–#222) before deadline.
  - *Antidote*: Anchor on **68/68 active eligible rows in the live Sepolia EvalPool** (`/api/evalpool/submissions/mine`), which proves on-chain evaluation contribution regardless of GitHub queues.
- **Trap 3: "Synthetic ERP Theater"**: Abstract invoice dashboards perceived as boring or fake.
  - *Antidote*: Ground in the **$79,373 counterfactual capital loss prevented** across real attacks (Lazarus address in #208, invoice phishing in #226, float rounding drift in #227).

---

## 5. Technical Specifications: Praman Desk Execution Standard

### Triple-Track Full-Spectrum Footprint:
- **Track 1 (Apps & Agents - 40%)**: Two-Mind Autonomous Pre-Payment Firewall (Investigator Mind + Reviewer Mind fulfilling Co-Founder Ahmed Ali's Golden Challenge). Live on `https://praman-desk.vercel.app` with sub-500ms latency.
- **Track 2 (Miners - 25%)**: Devnode Diamond Registration **#6142 (ACTIVE)** with 9 bonded intents, commit `59454bd`. Rank #1 in `INVOICE_LEDGER_RECONCILE` (0.9996) and Rank #3 in `DOCUMENT_AUTHENTICITY` (0.9969).
- **Track 3 (Evaluators - 25%)**: 68/68 eligible rows on Sepolia EvalPool, solving the protocol-wide evaluator drought exposed by Issue #227 with a 651-byte zero-libc AssemblyScript WASM comparator.
- **Developer Activation (20 Points)**: Dual-door MCP server, mutual EAS Sepolia cross-attestation with Takar/Bangdrop, and documented SDK quickstarts.

### All 18 Deterministic MCP Tools:
Both keyless **Streamable HTTP JSON-RPC 2.0** (`https://praman-desk.vercel.app/api/mcp`) and **stdio CLI** (`npx -y --package=github:VishAlgoDev/praman-desk praman-spend-guard-mcp`) expose all 18 tools:
1. `verify_counterparty`: Verify counterparty legal identity, LEI status, and jurisdiction.
2. `reconcile_invoice`: Deterministic 3-way line item match via 651-byte zero-libc WASM comparator.
3. `verify_spend_authorization`: Validate spend against organizational approval delegation caps.
4. `verify_receipt_provenance`: Audit 64-hex SHA-256 cryptographic invoice/receipt digests against ledger.
5. `clear_spend`: Composite pre-flight execution gate across all policy checks.
6. `compare_evaluator_scoring`: Deterministic WASM evaluation comparator scoring ground-truth vs candidate.
7. `screen_sanctions`: In-memory screening against 19,599 OFAC SDN records + 127 EVM addresses (<25ms).
8. `lookup_corporate_registry`: Query official GLEIF Global LEI Index across 200+ jurisdictions.
9. `monitor_regulatory_filings`: Authoritative regulatory filings across SEC EDGAR (10-K, 8-K) and registers.
10. `screen_stablecoin_settlement`: Mission 02 Stablecoin Pre-Payment & On-Chain Settlement Gate (FATF Travel Rule).
11. `get_compliance_certificate`: Generates a bank-grade cryptographic compliance audit certificate.
12. `fakewatch_counterparty_shield`: Reciprocal counterparty shield with FakeWatch (Miner #42420) for phishing detection.
13. `rugreceipt_contract_screen`: Reciprocal smart contract safety screen with RugReceipt (Issue #208 / Miner #302).
14. `paysheet_consensus_screen`: 3-Way Consensus Payroll Shield with Paysheet (Issue #214 / PR #182).
15. `audit_contract_obligation`: Mission 04 & CONTRACT_OBLIGATION_AUDIT: Audits statutory delay interest & retention.
16. `query_mining_intelligence`: Mission 12 & MINING_INTELLIGENCE: Queries verified geological deposit records.
17. `arbitrate_mining_discrepancies`: Universal Multi-Miner Aggregator resolving scope variance (shaft vs reef vs field).
18. `query_grid_power_price`: Mission 12 & GRID_POWER_PRICE: Wholesale settlement LMP power pricing (CAISO NP15/ERCOT).

---

## 6. Autonomous Wakeup & Self-Healing Protocol (30-Minute Loop)
On every scheduled `*/30 * * * *` daemon wakeup (or manual audit invocation), execute this exact loop:
1. **Run Telemetry, Cross-Epoch & Endpoint Audit**:
   - Execute `node scripts/autonomous-cycle.mjs` inside `c:\Users\Public\My Agent\telegraph-h2`.
   - Inspect live probe failures, latency (<500ms), cross-epoch score/rank regressions on Diamond #6142, and GitHub repository activity (`VishAlgoDev/praman-desk`).
2. **Inspect Community Channels & Bounties (Zero-Spam Rule)**:
   - Check `telegraphprotocol/bounties` open issues and `anjoman.ai/dashboard/apps` epoch state.
   - Inspect Telegraph Discord `#showcase`, `#gold-rush`, `#hackathon`, and our showcase thread (`1569379402360553692`) for replies from judges, maintainers, or peer builders.
3. **Self-Repair First, Automated Push-to-Deploy**:
   - Fix any probe failure, regression, or reported bug immediately.
   - Verify locally with `npm run comparator:test`, `npm run mcp:test`, and `node scripts/test-endpoints-local.mjs`.
   - Commit cleanly and push to `origin/main` (`.github/workflows/vercel-deploy.yml` auto-promotes to production; verify with `gh run watch` until success).
4. **Constructive Community Engagement & Bounties**:
   - Only post when there is verifiable technical progress, an honest limitation, a benchmark release, or a targeted collaboration proposal. Never post empty hype.
   - Before pasting in Discord, clear ghost nodes (`Control+A` twice -> `Backspace`) to avoid UI errors.
5. **Mandatory Audit Logging**:
   - Summarize what changed, what was repaired, and what remains healthy in `c:\Users\Public\My Agent\audit\AUDIT_LOG.md` and distill any new lessons in `c:\Users\Public\My Agent\memory\EXPERIENCE.md`.
