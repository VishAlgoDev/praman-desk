# Discord #hackathon — MINING_INTELLIGENCE_GENERAL Diamond registration ask

Hey @1xAhmed @muhammadtalha198 — quick **Provider / Diamond** question for Mission 12 (`MINING_INTELLIGENCE_GENERAL`).

**Context:** Praman Desk (route **#5281**, Diamond reg **#6142**, wallet `0x98021b20…`) successfully `updateMiner` with **9** intents incl. `GRID_POWER_PRICE_GENERAL`. Adding **`MINING_INTELLIGENCE_GENERAL`** to the bonded intent list **reverts on Sepolia** with `MinerRegistryFacet: unsupported intent` (sim + broadcast both fail).

**Already live off-chain:**
- `miner.yaml` + HTTP `GET/POST /api/miner/mining-intelligence`
- MCP `query_mining_intelligence` + evaluator PR **#218**

**Ask:** Is `MINING_INTELLIGENCE_GENERAL` registered on the active Sepolia Diamond (`0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b`) yet? If yes, what is the canonical intent string / facet rollout step we're missing? If not, ETA for bondability so we can include it in the next `updateMiner` without a failed tx?

**Evidence:** Pin tx with 9 intents only — https://sepolia.etherscan.io/tx/0x31f127785ae58f6b9a71b6816ef3005531a7af527d6f490be446a2ba84b62619  
**Status:** https://praman-desk.vercel.app/api/status (`http_only_intents` documents mining until chain allows bond).

Thanks — happy to test on staging first if there's a newer Diamond or intent catalog pointer.