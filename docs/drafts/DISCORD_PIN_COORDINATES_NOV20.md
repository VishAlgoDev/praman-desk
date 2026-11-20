# Discord showcase pin — verified facts only (Nov 20, 2026)

📌 **Canonical network coordinates (fact-checked before post)**

**Live app:** https://praman-desk.vercel.app  
**Repo:** https://github.com/VishAlgoDev/praman-desk  

| Layer | Verified source |
|--------|-----------------|
| Devnode engine route | **#5281** — production `/api/status` → `devnodeMiner.route_id` |
| Devnode scored miner index | **#6127** — same coordinates as this thread title; engine ask path `/engine/v1/ask/5281` in repo |
| Sepolia Diamond registration | **#6142** — `/api/status` → `onchainDiamond.active_registration_id` |
| Diamond contract | `0x72a70e949362670Bf8bceAd24eFC5b8f950aa08b` |

**Latest on-chain `miner.yaml` pin (Sepolia, success):**  
https://sepolia.etherscan.io/tx/0x31f127785ae58f6b9a71b6816ef3005531a7af527d6f490be446a2ba84b62619  
• Block **12175886** • Git pin **`59454bd`** • Wallet `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`  

**Bonded on Diamond today:** **9** intents (includes `GRID_POWER_PRICE_GENERAL`). Confirm: https://praman-desk.vercel.app/api/status → `onchainDiamond.bonded_intents`.

**Judge notes (transparent):**  
• `MINING_INTELLIGENCE_GENERAL` is live on HTTP/MCP but **not** bondable on Diamond yet (`unsupported intent` on Sepolia).  
• Pinned yaml at `59454bd` shows `id: 6137` in-file; active registration after pin is **#6142** (normal `updateMiner` increment).  
• Devnode router index may still list **7** scored capabilities vs **9** on-chain bonds — compare `devnodeMiner` vs `onchainDiamond` on `/api/status`.  

**Ledger:** **57** paid Sepolia receipts → `/api/ledger`