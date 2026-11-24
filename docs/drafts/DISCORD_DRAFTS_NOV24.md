# Discord drafts — Nov 24, 2026 (review before posting; nothing posted yet)

## 1. Alibaba forum channel (reply under Ahmed's Trade Assurance use-case)

> @Ahmed Ali Following up on your point about extending independent resolution across commercial scenarios — we did exactly that this week. Praman's Trade Assurance desk now resolves five evidence dispositions on the same $100k rail: halt on a receipt shortfall (circuit breaker), reconciled partial release, hold when the goods-received note is missing, Takar arbitration when inspection reports conflict, and full refund on zero conforming units. Each verdict runs the 15-stage WASM pipeline locally (<20 ms), anchors an EAS attestation on Sepolia, and prints a statutory certificate. Working demo: https://praman-desk.vercel.app — Desk 0, cases A–E in the scenario selector. If the Alibaba investment conversation is still open, we're ready to walk through it.

## 2. Showcase / general channel (progress post)

> Shipped today in Praman Desk —
> • 5-way Trade Assurance evidence dispositions (halt / release / hold / arbitrate / refund), all with on-chain receipts
> • Autonomous Spend Guard: pre-signature interception on Solana + EVM policy matrix, OFAC SDN screening in <25 ms
> • 30 paid Sepolia settlements from 14 independent miners, verifiable in-app
> • Full UI rebuild: self-hosted variable fonts, glass chrome, count-up stats, reduced-motion support
> Try it without signing anything: https://praman-desk.vercel.app/api/verify/mine-dossier?siteNo=494270

## 3. Reply to Ahmed's DM (he chased us about the package — answer with delivery, not promises)

> Sorry for the slow reply — the package is ready now. Three things: (1) the live desk at https://praman-desk.vercel.app with five Trade Assurance dispositions and 30 settled Sepolia transactions, (2) the benchmark file showing the $79k catch vs. frontier LLMs, (3) upstream PRs #217–#222 already on telegraphprotocol/bounties. Happy to do a walkthrough with the Alibaba investments team any day this week — Dec 1 submission is also locked on our side.

## 4. Reply to Chrysolite494's multi-repo question thread (adds our decision, helps others)

> Confirmed with the form: multiple repos are fine, one per track, judged independently. We're keeping one monorepo but splitting the demo entry points per track (Trade Assurance / Spend Guard / Mining Registry) so each judge lands directly on what their track scores.

## 5. Short X post (for the visibility gap — pair with a 20s screen capture of Case A halting)

> Most trade-finance "verification" is a human reading PDFs. Praman runs 15 deterministic stages in 19 ms, halts a $100k overbilling at the circuit breaker, and settles the disposition on-chain. Live, no signup: https://praman-desk.vercel.app
