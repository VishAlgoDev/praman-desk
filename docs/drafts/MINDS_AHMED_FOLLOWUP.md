# Post to Minds thread — follow-up (Siemens case, ~1,100 chars)

> Paste in **Minds Agents - Development & Collaboration** as a reply under your 6:40 PM post. Fewer raw links than the first post (MEE6).

---

@1xAhmed — quick **reproducible follow-up** on criterion #2 and #3 (with/without Telegraph + unfamiliar case):

**Case: Siemens AG procurement (DE), €8,400 invoice**

| Step | Without Telegraph (LLM-only) | With Praman Two-Mind + live Route #5281 |
|------|-------------------------------|----------------------------------------|
| Outcome | Would approve payout | **APPROVE only after** GLEIF LEI resolved, OFAC clean, WASM line math 10000/10000 |
| Cost | ~$0 API | ~$0 keyless HTTP to our miner + optional Anjoman when wallet provisioned |
| Limitation | No statutory LEI lapse check | Anjoman wallet still flaky for some builders; we document fallback to keyless `/api/mcp` |

**Reproduce (no wallet):**
`node examples/minds-spend-guard/test-two-minds.mjs` — hits **production** specialists, not local imports (commit post Nov 20 sprint).

**What we fixed today:** Investigator + general-purpose Mind orchestration via live `praman-desk.vercel.app` HTTP API (aligns with your “use Anjoman/Telegraph integrations” rule).

Happy to run the same Siemens case side-by-side with Supplier Detective for an apples-to-apples demo if useful.