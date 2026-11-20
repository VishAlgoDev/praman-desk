# Claude Code Project Guidelines — Praman Desk (Telegraph Season II)

## Commands
- Run Full Test Suite: `npm test` (all 15 stages must pass 100%)
- Run WASM Comparator: `npm run comparator:test` (1,043 vectors)
- Run Novel Prompt Probe: `node scripts/probe-novel-prompts.mjs`
- Deploy to Production: `vercel --prod --yes`
- Inspect Production: `https://praman-desk.vercel.app/api/status`

## Core Architecture & State
- **Live App**: `https://praman-desk.vercel.app`
- **Miner Coordinates**: Devnode `#6127` / Route `#5281` / Diamond `#6128`
- **Contributor Wallet**: `0x98021b20Efdb7ae2C57366010a6E0fDE207b4466`
- **Upstream PRs**: PRs #217–#222 on `telegraphprotocol/bounties` (31/31 unit tests passing)
- **On-Chain Moat**: 57 paid Sepolia settlements recorded in `/api/ledger`

## Non-Negotiable Directives
1. Read `AGENT_HANDOFF_INSTRUCTIONS.md` and `MASTER_OMNIBUS_COMPETITION_PLAN.md` before modifying any files.
2. Zero-Wrong-Work Standard: Never guess IDs, never wipe working code, never break regression guards.
3. The "Score Illusion" is cured via `src/intelligence/dynamic-solver.mjs`. Always preserve dynamic generalized NLP & arithmetic solving.
4. Mandatory Audit Logging: Append significant changes to `../audit/AUDIT_LOG.md` before ending a turn.
