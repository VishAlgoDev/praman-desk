# Conventions

## Guards (added after a mistake repeated)
- Fix overflow, clipped text, overlap and low contrast that the browser check reports before calling UI work done.
- Before finishing, stop the servers and background commands you started; long-lived work goes in a job or the preview.
- Report a test, build or fix as passing only after running it in the same task; quote the command and its result, and write "Not verified:" otherwise.
- If you announce a checkpoint file, write it in the same turn. Announcing without writing (`docs/PORTAL_TRANSFORMATION_MASTER_PLAN.md` was promised 3x over several turns) is how trust in this project was lost; the deliverable, not the announcement, is the work.

## Portal transformation (active)
- `docs/PORTAL_TRANSFORMATION_MASTER_PLAN.md` is the governing plan for the full-portal rebuild: preservation-first, honesty labels (LIVE / WORKED EXAMPLE / RECORDED), no deletion of desks, demos, SDKs or datasets.
- The static preview host has no Node backend: `/api/ledger` and other APIs 404 there. Verify APIs with `node scripts/test-endpoints-local.mjs`, and expect that 404 in browser checks against the static preview.
