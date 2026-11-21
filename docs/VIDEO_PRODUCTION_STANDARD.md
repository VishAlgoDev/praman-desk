# Praman Desk — Video production standard (research-backed, anti–AI-slop)

**Audience:** Hackathon judges (Ahmed / Minds), Discord, submission forms.  
**Rule:** One honest product capture + one script. Never stack a second robot narrator on a different recording.

---

## 1. What counts as slop (never ship)

| Slop pattern | Why judges hate it |
|--------------|-------------------|
| FFmpeg `drawtext` / colored slides (`video:render`) | Not the product; looks generated |
| Fake “terminal” HTML opening the video | Not reproducible; feels staged |
| Raw `/api/status` JSON as B-roll | No story |
| Voice says rank #1, 164 requests, $79k without matching UI | Numbers without proof |
| **Second** TTS script on a **different** screen capture | Lip-sync lie; “marketing robot” |
| Spelling every digit in voice (“seventy-nine thousand…”) | Essay narration, not demo |
| Scenario A on screen + voice describes scenario B | Caught by scroll (we did this once) |
| Sine-bed / card summary “benchmark video” | Already burned trust |

**Allowed:** Real browser on `praman-desk.vercel.app` (or local `web/server.mjs` for recording), actions you can replay, voice that describes **only what is visible**.

---

## 2. What good looks like (Minds + Ahmed)

From your **working** artifact (`SHOWCASE_WALKTHROUGH_SCRIPT.md` + `record-capptivo-style.mjs`):

1. **First frame** = dashboard (header, badges, scenario cards).
2. **Show, then tell** — click scenario → wait for verdict → then narrate that scenario.
3. **Tone** — one engineer explaining to another; no “dominance”, no rubric checklist read aloud.
4. **Length** — main demo ~90s; optional clip = **cut from the same file**, not a new script.
5. **Repro** — point to on-page commands or GitHub, not a fake shell.

Ahmed’s criteria reward **workflow + limitations + reproduction**, not animation.

---

## 3. Open-source stack (what to use / not use)

### Capture (pick one pipeline; don’t mix)

| Tool | Role | Fit for Praman |
|------|------|----------------|
| **`record-capptivo-style.mjs`** (in repo) | Playwright + cursor + local dashboard | ✅ **Canonical** — already powers walkthrough |
| [ScriptReel](https://github.com/99proteam/scriptreel) | YAML → deterministic Playwright capture + captions + zoom | ✅ Good next step for Minds 45s **if** we add `demo.yml` |
| [Demowright](https://github.com/matte97p/demowright) / [Demoloom](https://github.com/YossifNassar/demoloom) | Scripted Playwright + compositor | ✅ Same class as ScriptReel |
| [Screenstage](https://github.com/jodonnell24/screenstage) | Scripted or headed record + FFmpeg | ✅ If we want human headed session later |
| Playwright raw + `-an` + separate TTS | What failed twice | ❌ Avoid |
| `render-minds-benchmark-video.mjs` | FFmpeg slides | ❌ Deprecated |

### Voice (if not human)

| Engine | Notes |
|--------|--------|
| **`generate-narration.mjs` + edge-tts** (`en-IN-NeerjaExpressiveNeural`) | Already used on walkthrough; **keep one master script only** |
| [Piper](https://github.com/rhasspy/piper) | Offline, fast, more robotic — OK for CI, not “hero” demo |
| Coqui XTTS / cloud APIs | Heavy or paid; not needed if walkthrough is canonical |

**Do not** generate a **second** edge-tts monologue for the short URL.

### Encode

- **ffmpeg** — `-movflags +faststart`, H.264, AAC; match duration to **video actions**, not TTS length.

---

## 4. Official URLs (policy)

| URL | Content |
|-----|---------|
| `praman-desk-walkthrough.mp4` | **Submit this** to forms, Ahmed, dossier |
| `praman_minds_benchmark_showcase.mp4` | **~24s cut from Act 5 / Scenario 7** in walkthrough (`excerpt-walkthrough-benchmark.mjs` + `video_section_timestamps.json`) |

**Do not** submit the short URL alone as the only demo unless excerpt is clearly labeled “clip from main walkthrough”.

---

## 5. How to add a real Minds / Scenario 7 clip (no slop, no your voice required)

**Right fix (engineering, not another hack):**

1. Extend `SHOWCASE_WALKTHROUGH_SCRIPT.md` with **Act 5** (~15s): Scenario 7, Two-Mind FX halt (voice matches on-screen text).
2. Add matching beats in `generate-narration.mjs` (one paragraph, short sentences).
3. Extend `record-capptivo-style.mjs` to click `#card-scen-7`, **wait for verdict** (`Two-Mind` / `inverted FX`), hold banner.
4. Re-run full walkthrough → new `praman-desk-walkthrough.mp4` (~105s).
5. Re-cut excerpt for legacy short URL if needed.

**Optional upgrade:** ScriptReel `demo.yml` mirroring Acts 1–5 for CI-regenerable demos.

---

## 6. Script writing rules (voice or captions)

- **Max ~15 words per sentence** on short beats.
- **No** superlatives: dominance, #1, undisputed.
- **Numbers on screen** — voice says “scenario seven” / “ten thousand five hundred on screen”, not spelled-out marketing totals unless the table is visible.
- **One scenario per beat** — never cut before verdict loads.
- **End** — “Repo on GitHub, live app on Vercel” (show footer or quickstart on page).

---

## 7. Commands

```bash
# Canonical long demo (only narrated source to regenerate)
node scripts/generate-narration.mjs
node scripts/record-capptivo-style.mjs

# Legacy short URL (excerpt only — no new script)
npm run video:record-benchmark

# Forbidden for public links
# npm run video:render
```

---

## 8. Human voice

Optional polish, **not required**. If recorded, mux with `npm run video:mux-user` — see `docs/RECORD_30SEC_HUMAN_VOICE.md`.