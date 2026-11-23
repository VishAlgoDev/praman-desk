### Summary of Changes
Supports Mission Issue #202

Adds `5` curated, schema-compliant `preference_pair` evaluation rows for **`OPTIMAL_EXECUTION_ROUTE_GENERAL`**.

### Devnode Consensus & Verification Telemetry
- **Intent**: `OPTIMAL_EXECUTION_ROUTE_GENERAL`
- **Contributor Payer Wallet**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **Devnode EvalPool Standing**:
  - Eligible Submitters: `8`
  - Active Consensual Rows: `312`
  - Consensus Gate Status: **ACTIVE CONSENSUS MET**

### Ground-Truth Provenance & Methodology
Each pair provides unambiguous separation between the ground-truth **chosen** settlement and the mathematically / factually flawed **rejected** counter-factual.
Primary authoritative sources:
- Uniswap v3 Subgraph & Math Specification
- Curve Finance Stableswap Invariant Documentation
- L2Beat Cross-Chain Rollup & Bridge Telemetry

### Reproduction & Validation
```bash
# Validate schema and formatting locally
npm run test
```
