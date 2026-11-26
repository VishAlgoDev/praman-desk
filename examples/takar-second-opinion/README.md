# Takar-Praman Cross-Miner Escrow Consensus Bridge

> Cooperative Clearing Gate between **Bangdrop's Takar** (Second Opinion Heuristic Protocol, Sepolia: `0x310275e6D66818E068245326bB9e398822304248`) and **Praman Desk** (Deterministic WebAssembly Comparator & OFAC Trie, Devnode Miner `#6164` / Diamond `#6200`).

## Why Multi-Miner Consensus Matters
- **Heuristic LLM opinions alone** can be fooled by prompt injection, miss subtle 1-cent math fraud, or fail to cross-reference OFAC sanctions lists.
- **Deterministic checkers alone** lack semantic context regarding delivery completion or human service attestations.
- **Together**, Takar + Praman form an enterprise-grade Two-Miner Clearing Gate: escrow funds are released **only when both miners independently concur**.

## 30-Second Verification

Run the live cross-miner consensus test suite:

```bash
node examples/takar-second-opinion/takar-praman-escrow-bridge.mjs
```

### Verified Scenarios
1. **Clean Industrial Procurement (Siemens AG $1,250)**: Takar confirms delivery proof (94% confidence) + Praman verifies LEI registration and deterministic math -> **Escrow Released**.
2. **Subtle Math Discrepancy & Unregistered Entity ($10,000.05)**: Takar heuristic passes, but Praman triggers circuit breaker on unverified registry and hard spend cap -> **Escrow Locked ($10,000.05 Saved)**.
3. **Disguised Sanctioned Entity (Lazarus Group $50,000)**: Takar delivery attested, but Praman OFAC Trie triggers instant hard block -> **Escrow Locked (Federal Sanctions Violation Prevented)**.
