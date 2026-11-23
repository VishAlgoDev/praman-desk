### Summary of Changes
Supports Mission Issue #203

Adds `5` curated, schema-compliant `preference_pair` evaluation rows for **`TASK_EXECUTION_QUALITY_GENERAL`**.

### Devnode Consensus & Verification Telemetry
- **Intent**: `TASK_EXECUTION_QUALITY_GENERAL`
- **Contributor Payer Wallet**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **Devnode EvalPool Standing**:
  - Eligible Submitters: `13`
  - Active Consensual Rows: `264`
  - Consensus Gate Status: **ACTIVE CONSENSUS MET**

### Ground-Truth Provenance & Methodology
Each pair provides unambiguous separation between the ground-truth **chosen** settlement and the mathematically / factually flawed **rejected** counter-factual.
Primary authoritative sources:
- Praman Desk WebAssembly IEEE-754 Comparator Engine
- US Treasury OFAC Specially Designated Nationals (SDN) Database
- GLEIF ISO 17442 Global Legal Entity Identifier Standard

### Reproduction & Validation
```bash
# Validate schema and formatting locally
npm run test
```
