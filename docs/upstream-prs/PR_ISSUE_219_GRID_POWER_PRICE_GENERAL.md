### Summary of Changes
Closes #219

Adds `6` curated, schema-compliant `preference_pair` evaluation rows for **`GRID_POWER_PRICE_GENERAL`**.

### Devnode Consensus & Verification Telemetry
- **Intent**: `GRID_POWER_PRICE_GENERAL`
- **Contributor Payer Wallet**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **Devnode EvalPool Standing**:
  - Eligible Submitters: `7`
  - Active Consensual Rows: `229`
  - Consensus Gate Status: **ACTIVE CONSENSUS MET**

### Ground-Truth Provenance & Methodology
Each pair provides unambiguous separation between the ground-truth **chosen** settlement and the mathematically / factually flawed **rejected** counter-factual.
Primary authoritative sources:
- CAISO Open Access Same-time Information System (OASIS): http://oasis.caiso.com/
- ERCOT Market Information & Settlement Prices: https://www.ercot.com/mktinfo/prices
- PJM Data Miner 2: https://dataminer2.pjm.com/

### Reproduction & Validation
```bash
# Validate schema and formatting locally
npm run test
```
