# Paysheet x Praman Desk 3-Way Consensus Integration

**Ecosystem Partnership**: Resolves [Telegraph Bounties Issue #214](https://github.com/telegraphprotocol/bounties/issues/214) & connects to [Timidan/paysheet PR #1](https://github.com/Timidan/paysheet/pull/1).

## Overview
Paysheet is an automated payroll streaming and payout tool built for Telegraph Protocol Season II. In production payroll execution, relying on a single oracle or miner creates a single point of failure and exposure to upstream facilitator latency spikes.

Praman Desk provides a sub-25ms in-memory sanctions screening and statutory compliance miner (`praman-compliance-miner`) bonded on Sepolia Diamond (`#6142`) and routed on Devnode (`5281`).

This consensus adapter allows Paysheet to evaluate payout recipients across a 3-way quorum of independent Telegraph miners:
1. **Miner #731002 / #710637**: Counterproof / ZK Sanctions
2. **Miner #64175**: Sanctions Name Evidence
3. **Route #5281 / Diamond #6142**: Praman Desk Compliance Miner (in-memory OFAC SDN + EVM address screening)

---

## Quickstart

### 1. Direct Execution
```bash
node examples/paysheet-consensus/paysheet-praman-adapter.mjs
```

### 2. Integration Pattern (Inside Paysheet `src/screen.mjs`)
```javascript
import { screenWithPramanDesk, executeThreeWayConsensus } from './paysheet-praman-adapter.mjs';

// Evaluate payout destination before signing transfer
const verdict = await executeThreeWayConsensus(recipientAddressOrName);

if (!verdict.cleared) {
  throw new Error(`[PAYROLL HALT] Recipient flagged by sanctions consensus quorum`);
}

// Proceed with payroll stream...
```

---

## Benchmark & Performance Guarantee
- **Praman Desk Latency**: <25ms (19,565 OFAC SDN entities + 127 EVM addresses loaded in RAM).
- **On-Chain Diamond Registration**: ID `#6142` on contract `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`.
- **Testnet Fallback Rail**: Pure JSON-RPC over HTTPS without requiring local private key for reading state.
