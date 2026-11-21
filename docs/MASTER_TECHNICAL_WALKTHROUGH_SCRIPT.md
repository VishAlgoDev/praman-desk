# Praman Desk: Master Technical Founder Walkthrough Script

**Speaker Persona**: Indian Engineering Founder (`en-IN-PrabhatNeural`)  
**Tone**: Technical, authoritative, clear, zero marketing fluff, zero AI-slop  
**Target Duration**: ~3.5 – 4.0 minutes  
**Focus**: Autonomous AI Agent Treasury Spend Security, Deterministic WASM, Telegraph Protocol x402, Animoca Minds Two-Mind Guard, Sepolia On-Chain Ledger

---

### Act 1: The Thesis — Unchecked Autonomous Spending (00:00 - 00:35)

In decentralized networks, autonomous AI agents now hold private keys and sign on-chain transactions directly. But what happens when an agent is prompt-injected, receives a manipulated invoice, or encounters a malicious smart contract?

On public blockchains, transactions are irreversible. Once private keys sign, treasury funds are permanently lost.

Praman Desk is a deterministic pre-transaction spend gate that intercepts transactions before cryptographic signing. It verifies counterparties, audits line-item arithmetic, screens sanctions, and enforces organizational delegation caps before funds can move.

---

### Act 2: Architecture & Deterministic Policy Gate (00:35 - 01:15)

Our architecture is built on deterministic WebAssembly. At the core is a 651-byte AssemblyScript math engine with zero external runtime imports. The firewall executes in under twenty-five milliseconds directly within an agent's tool-calling loop.

Counterparties are resolved against the official GLEIF Global Legal Entity Identifier index across two hundred jurisdictions, and recipient addresses are screened in-memory against the US Treasury OFAC Specially Designated Nationals list.

Every pre-flight check settles via the Telegraph Protocol x402 micropayment rail for one cent on Sepolia, generating an EIP-191 cryptographic attestation seal.

---

### Act 3: Live Threat Simulator — Scenarios 1, 2 & 5 (01:15 - 02:15)

Let us examine this in action on the live dashboard.

In Scenario One, an autonomous infrastructure agent receives a spoofed vendor invoice directing a forty-two hundred dollar payment to a Lazarus Group exploit address. The agent calls our pre-flight gate. The firewall matches the destination EVM address against the OFAC sanctions index and immediately halts signing. Zero funds move.

Next, in Scenario Two: a cloud GPU provider submits a four hundred and fifty dollar invoice, but the line items calculate to three hundred and fifty dollars. Our 651-byte WASM engine detects the one hundred dollar arithmetic discrepancy in three milliseconds and blocks the payment.

In Scenario Five, an agent attempts an unauthorized thirteen thousand eight hundred and sixty dollar treasury grant. Our delegation policy intercepts the transfer for exceeding the five hundred dollar single-agent ceiling without supervisor multisig co-signatures.

---

### Act 4: Animoca Minds Two-Mind Spend Guard (02:15 - 03:00)

Praman Desk natively powers the Animoca Minds architecture through a two-mind spend guard.

In Scenario Seven, an agent processes an international SaaS settlement with an inverted Euro-to-Dollar exchange rate. The Diligence Mind detects a fifteen percent divergence from official European Central Bank reference rates, averting a thirteen hundred dollar overcharge. The Reviewer Mind verifies the discrepancy and withholds signing authority before on-chain Sepolia Diamond release.

Conversely, in Scenario Three, a verified Anthropic API invoice clears all four policy checks and is authorized for instant x402 settlement.

---

### Act 5: Reciprocal Ecosystem Bridges & Developer SDKs (03:00 - 03:40)

Praman Desk integrates bi-directionally across the Telegraph ecosystem.

Our FakeWatch bridge checks payment destinations against real-time threat intelligence to block typosquatted phishing domains like unisvvap.org. The RugReceipt bridge screens smart contract bytecode verification and deployer history. And our Paysheet adapter validates recurring contributor payroll across a three-miner validator quorum.

Developers can integrate Praman Desk in seconds: through our eighteen-tool remote Model Context Protocol server for Cursor and Claude Code, or using our lightweight Python and TypeScript SDKs.

---

### Act 6: On-Chain Settlement Ledger & Benchmark Verification (03:40 - 04:15)

Every verification is permanently recorded on the Sepolia Diamond contract at Route 5281. The live ledger displays fifty-seven testnet verification settlements generated across fifteen independent miners.

Our complete test suite of one thousand forty-three deterministic test vectors passes with zero discrepancies.

Praman Desk delivers production-grade financial safety for autonomous agents: verifiable, deterministic, and non-custodial.
