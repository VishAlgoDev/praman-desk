/progress

**Since last update (Nov 20):** on-chain miner manifest sync + Mission 12 provider hardening.

**Track(s):** Apps & Agents, Miners / Providers, Evaluators

**Provider (live):** https://praman-desk.vercel.app
- **Devnode route #5281** / **Sepolia Diamond reg #6142** (verified `GET /api/status`)
- **9 intents bonded on Diamond** incl. `GRID_POWER_PRICE_GENERAL`
- **Pin tx:** https://sepolia.etherscan.io/tx/0x31f127785ae58f6b9a71b6816ef3005531a7af527d6f490be446a2ba84b62619 (block 12175886, yaml git `59454bd`)
- **`MINING_INTELLIGENCE_GENERAL`:** live HTTP/MCP (`/api/miner/mining-intelligence`); **not yet bondable** on Sepolia Diamond (`unsupported intent` in `updateMiner` sim — transparent)
- **57** paid Sepolia receipts: `/api/ledger`

**Mission 12 endpoints (callable, no keys):**
- Mining: `POST /api/miner/mining-intelligence` (GSQ/USGS/CGS benchmarks)
- Grid: `POST /api/miner/grid-power-price` (CAISO NP15, ERCOT hubs — structured `WHOLESALE POWER SETTLEMENT` verdicts)
- Arbitrator: `POST /api/miner/arbitrate-discrepancies` + MCP `arbitrate_mining_discrepancies`

**Evaluators (awaiting review):**
- PR **#218** `MINING_INTELLIGENCE_GENERAL` — https://github.com/telegraphprotocol/bounties/pull/218
- PR **#222** `GRID_POWER_PRICE_GENERAL` — https://github.com/telegraphprotocol/bounties/pull/222
(Local unit tests passing; MERGEABLE on branch.)

**Failure / edge transparency:**
- Stale grid interval → guarded responses on grid endpoint tests; mining off-chain until Diamond registers intent.
- Devnode scored capability index may still show **7** router-indexed intents vs **9** bonded — see `devnodeMiner` vs `onchainDiamond` on `/api/status`.

**Next milestone:** maintainer merge on #218/#222; optional Devnode re-index after bond expansion.

**Repo:** https://github.com/VishAlgoDev/praman-desk (main, commit `f498344`)