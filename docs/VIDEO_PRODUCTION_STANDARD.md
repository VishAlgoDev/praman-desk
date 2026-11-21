# Praman Desk — Video production standard (research-backed, anti–AI-slop)

**Audience:** Hackathon judges (Ahmed / Minds), Discord, submission forms.  
**Rule:** One narration script + one honest product capture. Short URLs are **ffmpeg cuts**, never duplicate full masters or second TTS tracks.

---

## 1. What counts as slop (never ship)

| Slop pattern | Why judges hate it |
|--------------|-------------------|
| FFmpeg `drawtext` / colored slides (`video:render`) | Not the product; looks generated |
| Fake terminal / JSON B-roll | Not reproducible |
| **Second** narrator on a **different** screen recording | Lip-sync lie |
| Scenario A on screen + voice describes scenario B | Trust killer |
| `praman_minds_benchmark_showcase.mp4` identical to full walkthrough | Misleading “short” link |
| Sine-bed / rank #1 voice without matching UI | Marketing robot |

---

## 2. Canonical pipeline (current)

| Step | Tool | Output |
|------|------|--------|
| Script | `docs/MASTER_TECHNICAL_WALKTHROUGH_SCRIPT.md` | Acts 1–6 |
| Voice | `scripts/generate-indian-audio.py` → `public/audio/master_narration.mp3` | Prabhat (`en-IN-PrabhatNeural`) |
| Screen | Screen Studio → `%LOCALAPPDATA%\raw_walkthrough_prabhat_clean.mp4` | Real browser |
| Mux | `scripts/postprocess-walkthrough-prabhat.mjs` | `public/praman-desk-walkthrough.mp4` |
| **Act 4 sync fix** | `npm run video:fix-act4` | Replaces ~180–230s **video** with Playwright patch (Scenario 7 + 3); **audio unchanged** |
| Minds clip | `npm run video:record-benchmark` | ~42s cut from Act 4 (`public/audio/prabhat/timeline.json`) |

Choreography reference (live replay in console): `scripts/choreography-clean-indian.js`.

---

## 3. Official URLs

| URL | Content |
|-----|---------|
| `praman-desk-walkthrough.mp4` | **Submit to forms** (~314s, Prabhat + product UI) |
| `praman_minds_benchmark_showcase.mp4` | **Act 4 highlight only** — same narrator, not a separate script |

---

## 4. Commands

```bash
# Full rebuild (needs local raw Screen Studio file + master_narration.mp3)
npm run video:postprocess

# Fix voice/UI mismatch on Two-Mind segment only (recommended after any new Screen Studio take)
npm run video:fix-act4
npm run video:record-benchmark

# One-shot after patch exists
npm run video:publish

# Forbidden for public links
# npm run video:render
```

---

## 5. Script rules

- Show → tell: click scenario, wait for verdict, then narrate.
- No superlatives without on-screen proof.
- Scenario 7 must show **HALT** and **$9,127 vs $10,500** while Act 4 audio runs.

---

## 6. Human voice

Optional only — see `docs/RECORD_30SEC_HUMAN_VOICE.md`. Default submission remains Prabhat walkthrough MP4.