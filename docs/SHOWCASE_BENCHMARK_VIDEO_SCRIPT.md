# Praman Desk — Minds “Benchmark Showcase” Re-Record Script (replaces FFmpeg slideshow)

**Replaces:** `public/praman_minds_benchmark_showcase.mp4` (current file = `scripts/render-minds-benchmark-video.mjs` drawtext slides — **do not promote**).  
**Keep as primary long demo:** `public/praman-desk-walkthrough.mp4` + `docs/SHOWCASE_WALKTHROUGH_SCRIPT.md`.  
**Target output:** `public/praman_minds_benchmark_showcase.mp4` (same URL, new content) — **~45–55s**, **1920×1080**, **real screen capture + optional human voiceover**.  
**Ahmed criterion #5:** Show workflow, evidence, limitations, and reproduction — not marketing cards.

---

## Recording method

**Default (no OBS):** `npm run video:record-benchmark` — Playwright captures real test output + live **praman-desk.vercel.app** + `/api/status`.

| Fallback | When |
|----------|------|
| Xbox Game Bar / phone screen record | Only if Playwright fails on your machine |
| Legacy slideshow | `npm run video:render` — **do not use for judges** |

**Audio:** Human voiceover from lines below **or** quiet room + on-screen text only (no synthetic sine bed).

**Post:** `ffmpeg -movflags +faststart` after export (already in walkthrough pipeline).

---

## Shot list (45–55 seconds total)

### Act 1 — Dashboard first (0:00–0:12)

**Rule:** First frame = **praman-desk.vercel.app** (or local dashboard). **Never** open with terminal, fake script HTML, or raw JSON.

| Time | Visual | On-screen / VO |
|------|--------|----------------|
| 0:00–0:05 | Praman Desk header, badges (#6142 / #5281), hero line | VO: “This is the live spend firewall — not a slide deck.” |
| 0:05–0:12 | Scroll scenario cards; land on **Scenario 7 Two-Mind** | VO: “Two-Mind spend guard for Minds + Telegraph.” |

**Do not** show Epoch 18 rank claims or “#1 network-wide” text. **Repro command** only in the **site footer / quickstart** section, not a terminal window.

---

### Act 2 — With vs without (0:12–0:28) “Ahmed #2”

| Time | Visual | On-screen / VO |
|------|--------|----------------|
| 0:12–0:18 | Browser: open `praman-desk.vercel.app` → spend-guard / playground → run **one** scenario that **blocks** (sanctions or math mismatch) — red halt UI | VO: “Without Telegraph, agents approve. With Praman, this payment is held or rejected before broadcast.” |
| 0:18–0:28 | Quick cut: open `docs/WITH_VS_WITHOUT_TELEGRAPH_REPORT.md` or terminal tail of `node benchmark/with-vs-without-telegraph.mjs` showing **100% catch** line — **no** full $79k voice hype; on-screen caption: “5 scenarios, reproducible” | VO: “Benchmark is in the repo; numbers come from the script, not the video.” |

---

### Act 3 — Two-Mind + MCP (0:28–0:40) “Ahmed #1 & #4”

| Time | Visual | On-screen / VO |
|------|--------|----------------|
| 0:28–0:35 | Browser: `/api/mcp` or site section “18 tools” + expand one tool call (sanctions or clear_spend) — **network tab optional** showing 200 | VO: “Keyless MCP — eighteen tools — no Anjoman wallet required for this path.” |
| 0:35–0:40 | Optional: 3-line diagram from README or `examples/minds-spend-guard/` folder in editor (Investigator → Reviewer) — **screenshot of real code**, not FFmpeg diagram | VO: “Investigator gathers; Reviewer gates spend.” |

---

### Act 4 — Honest limits + CTA (0:40–0:50)

| Time | Visual | On-screen / VO |
|------|--------|----------------|
| 0:40–0:45 | Browser: `/api/status` JSON — highlight `http_only_intents: MINING_INTELLIGENCE_GENERAL` and `devnode_scored_index_note` | VO: “Limitations: Devnode index may lag on-chain bonds; mining intent is off-chain until Diamond supports it.” |
| 0:45–0:50 | End card **in browser** (Vercel app footer or simple Notion/MD): **Walkthrough** `praman-desk-walkthrough.mp4` · **Repo** · **Repro commands** | VO: “Full ninety-second product walkthrough is separate; this clip is benchmark plus reproduction only.” |

**End card must list:**

- `https://praman-desk.vercel.app/praman-desk-walkthrough.mp4` (main demo)
- `https://github.com/VishAlgoDev/praman-desk`
- `node examples/minds-spend-guard/test-two-minds.mjs`

---

## What NOT to include

- No `render-minds-benchmark-video.mjs` slide scenes.
- No “Rank #1 globally” / 164 requests / scoreboard wallpaper.
- No `praman_minds_benchmark_showcase.mp4` self-reference as the only demo.
- No fake Anjoman wallet UX unless you show it **failing** then keyless fallback (honest).

---

## After re-record

1. Replace file at `public/praman_minds_benchmark_showcase.mp4`.
2. `vercel --prod --yes` (or rely on git deploy).
3. Update Discord **Minds** reply (do not edit old posts to hide history — **add correction**):

   > The earlier 43s link was a static benchmark summary animation, not the product demo. **Primary demo:** walkthrough MP4. **Short benchmark clip:** re-recorded screencast (this message). Repro: `test-two-minds.mjs`.

4. Change `docs/MINDS_SHOWCASE_POST.md` line 18 to walkthrough first; benchmark second with label “repro clip”.

---

## Acceptance checklist (before linking in Discord again)

- [ ] Every frame is **screen recording** or **terminal output** (no generated title cards).
- [ ] At least one **failed payment** and one **repro command** visible.
- [ ] **Limitations** segment ≥ 5 seconds.
- [ ] Walkthrough URL mentioned verbally or in end card.
- [ ] File duration 45–55s; size typically **3–15 MB** (if ~800 KB again, it’s probably still slides).