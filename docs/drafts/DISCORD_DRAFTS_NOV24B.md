# Discord drafts — Nov 24, 2026, round B (review before posting; nothing posted)

Facts checked against live production before writing:
- https://praman-desk.vercel.app/api/status → ok:true, WASM loaded, 19,565 SDN entries, 127 EVM addresses, live signing available.
- Ledger snapshot: 30 paid settlements, 14 miners.
- Deadline: Dec 1, 23:59 UTC (7 days).

---

## 1. Reply to Ahmed's DM (he chased twice — answer with delivery, not promises)

> Hi Ahmed — sorry for the slow reply. Everything you asked for is ready:
> 1. Live app: https://praman-desk.vercel.app — Trade Assurance desk runs five evidence dispositions on the same $100k escrow rail: halt on receipt shortfall (circuit breaker, <3 ms), reconciled partial release, hold on missing goods-received note, Takar arbitration on conflicting inspection reports, full refund on zero conforming units. Every verdict prints its receipt, cert hash and EAS attestation.
> 2. Business impact in one line, per your ask: a $100,000.00 incorrect payment was HELD, the independently computed payable amount was $80,000.00, and the reconciled disposition (release $80k / refund $20k) settled on TakarSettle v4 on Sepolia — receipts in-app, tx anchored.
> 3. Evidence pack: upstream PRs #217–#222 on telegraphprotocol/bounties (31/31 unit tests), benchmark where the deterministic engine catches the $79k shortfall that frontier LLMs miss, and a 2-minute recorded walkthrough.
> Happy to put this in front of Alibaba's US Head of Investments any day this week — just say when.



---

## 2. Alibaba forum channel — reply under Ahmed's use-case 2 (he publicly named Praman + Takar)

> @Ahmed Ali Taking your use case 2 forward: Praman + Takar now cover all four dispositions you listed, not just incorrect-payment. Same canonical $100k commitment, five scenarios:
> - billed full, receipt shows shortfall → circuit breaker HALT ($100k vs $80k computed)
> - reconciled inspection → partial release $80k, buyer refunded $20k, settled on TakarSettle v4
> - goods-received note missing → escrow HOLD, funds never move
> - two conflicting inspection reports → Takar 2-of-3 panel ARBITRATION with unit variance computed by WASM
> - zero conforming units → FULL REFUND to buyer
> Each verdict: 15 deterministic WASM stages (<20 ms), EAS attestation on Sepolia, printable statutory certificate. Live at https://praman-desk.vercel.app (Desk 0, scenario selector, no signup). @Bangdrop — our resolver seat is already seconding on both Takar panels, so arbitration cases route through live infrastructure, not a mock.

---

## 3. Reply to Countersign (Anthony) — he asked what shipment evidence our Trade Assurance needs

> Hi Anthony — from our side (https://praman-desk.vercel.app, Desk 0): the pipeline decides on four evidence classes, so what we'd consume from a Countersign flow is:
> 1. Purchase order / commercial terms — quantities, unit prices, totals (we recompute qty×price deterministically — this is exactly where we caught the $20k overbilling).
> 2. Goods-received note — presence decides hold vs. proceed; counts of conforming vs damaged units drive release / refund / arbitration.
> 3. Independent inspection report — two conflicting reports route to Takar arbitration; one clean report with GRN match releases.
> 4. Pier-pass / logistics receipt — ties shipped quantity to the carrier leg.
> If Countersign can emit any of these as signed, hash-addressable documents we can anchor them in the EAS attestation, so the counterparty verifies the evidence itself, not our word. Happy to spec the exact JSON shape together — that would make your flow the evidence source for a live disposition case.

---

## 4. Reply to ace[ILY]'s Anjoman receipt question (asked twice in channel, still open — answer technically, helps everyone and shows our differentiator)

> @ace[ILY] on verifiable per-call receipts — that's exactly how Praman works on Telegraph rails: every paid verification returns a receipt object with (a) the request's canonical input hash, (b) a cert hash over the full 15-stage result, (c) an EAS attestation id anchored on Sepolia, and (d) the settlement tx (we have 30 paid settlements from 14 miners, each clickable on Etherscan — see Desk 2 at https://praman-desk.vercel.app). You verify the receipt against the on-chain attestation, not against the miner's own API. If Anjoman's billing API doesn't expose an equivalent receipt_hash yet, it should — happy to show Ahmed the pattern; it's the difference between "trust the miner" and "verify the chain".

---

## 5. Showcase channel — progress post (with the video attached when ready)

> Praman Desk — 7 days to submission, here's what stands:
> • Trade Assurance: 5 evidence dispositions (halt / reconciled release / hold / arbitration / refund) on one $100k rail, all with on-chain receipts and EAS attestations
> • Autonomous Spend Guard: pre-signature interception on Solana (Transaction + VersionedTransaction), OFAC SDN screening of 19,565 entries in <25 ms, session spend caps for SOL and USDC
> • Settlement Ledger: 30 paid Sepolia settlements across 14 independent miners, verifiable in-app
> • Deterministic WASM engine: catches the $79k invoice shortfall that frontier LLMs approve; 46/46 SDK tests green
> • Judges can reproduce everything without signup: https://praman-desk.vercel.app — also on the Anjoman dashboard.
> Feedback welcome — especially from anyone building commerce flows that need an independent verification layer.

---

## 6. Short X post (visibility gap — attach a 15–20s capture of Case A halting)

> A $100,000 invoice. Billed full. Receipt says $80,000.
> Frontier LLMs approve it. A 651b WASM engine halts it in 19 ms, computes the payable, and settles $80k release / $20k refund on-chain.
> Live, no signup: https://praman-desk.vercel.app

---

## Do-not-say guardrails (accuracy)
- Don't claim "mainnet" — settlements are Sepolia; mainnet is Dec–Jan per Ahmed.
- Don't claim "AI" anywhere in Trade Assurance — it's deterministic WASM; that's the selling point.
- Don't quote Brilliant Lode 6.6M oz as ours — scope mixing was called out; only claim the mine-dossier verification pipeline.
- Only promise a walkthrough/demo, never "partnership with Alibaba".
