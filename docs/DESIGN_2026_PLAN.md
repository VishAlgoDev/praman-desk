# Praman Desk — 2026 Design Upgrade Plan

**Status**: Proposed. Target file: `public/index.html` (single-page, zero-dependency static site served by `web/server.mjs`).
**Positioning decision**: Treat this as the public face of a real high-tech startup, not a hackathon portal. No marketing jargon, no rubric recitation, no "100/100 points" headers (Telegraph's own rules call rubric-recitation theater and form sprawl a disqualifier — `.agents/skills/telegraph-hackathon/SKILL.md`). The product is a pre-payment circuit breaker for autonomous agent spend; the UI should read like Linear/Vercel-grade infrastructure tooling.

---

## 1. Why it currently feels sluggish and "2015"

| # | Problem | Evidence in current page |
|---|---------|--------------------------|
| 1 | Flat, dense, single-color surface. Everything sits on the same `#0C1210` plane with 1px borders — no layering, no depth, no material distinction between chrome and content. Reads as a 2015 admin theme. | `--surface` = `#111A16` used everywhere |
| 2 | Generic easing. All transitions use `ease`/`ease-out` at 120–180ms with no spring or expo curves, so interactions feel mechanical rather than responsive. | 5 `transition` declarations, all `ease` variants |
| 3 | No hover dimensionality. 8 hover states, all background-color swaps. No specular borders, no lift, no cursor-following light — the details that make dark UIs feel alive. | `tbody tr:hover td{background:...}` |
| 4 | System fallback fonts. Google Fonts is blocked in the sandboxed browser (`net::ERR_FAILED`), so the page renders in Menlo/system — it looks like a terminal, not a product. | `<link href="https://fonts.googleapis.com/...">` |
| 5 | Type scale too uniform. 11–38px range with no oversized display moment; the hero headline is the same mono voice as body text. No variable font, no optical sizing. | `h1` = clamp(24,4.4vw,38) |
| 6 | No view transitions or spatial continuity. Tab switches are a hard `display:none` swap with a 180ms fade. | `section.desk.active{animation:fadein}` |
| 7 | Static header. The sticky bar has `backdrop-filter` but no scroll edge effect, no specular rim, no adaptive behavior. | `header{backdrop-filter:blur(12px)}` |
| 8 | Skeletons are functional but charmless — flat gray bars instead of layout-matching ghosts. | `.skeleton` shimmer |

## 2. What 2026-era design actually is (researched, with sources)

**Apple — Liquid Glass (iOS 26 / macOS Tahoe, WWDC25)**
- A translucent, specular material for the interactive layer only (controls, nav), floating above content. Two variants: *regular* (blurs + dims for legibility) and *clear* (for media-rich backgrounds, needs a 35% dimming layer).
- Key rule: glass communicates hierarchy, not decoration. Content layer uses standard opaque materials. Specular highlights react to movement in real time.
- Sources: developer.apple.com/design/human-interface-guidelines/materials.md; apple.com/newsroom (June 2025); WWDC25 sessions 102/112/284.

**Google — Material 3 Expressive (I/O 2026)**
- Expressive layout system with an 8dp spacing token scale that adapts per device/density; physics-based motion; tonal elevation (color overlays) alongside shadow elevation; typography simplifed to display/headline/title/body/label.
- Sources: m3.material.io/blog/whats-new-at-io26 (May 2026); developer.android.com Material 3.

**Microsoft — Fluent 2 / Windows 11**
- Elevation and layering as the foundation of hierarchy; "mica"/acrylic materials that connect the UI to its environment; softer geometry; motion described as "reactive, direct, context appropriate."
- Sources: learn.microsoft.com/windows/apps/design; microsoft.design Windows 11 principles (Oct 2025).

**The 2026 web consensus (Figma, Envato, BuiltUX teardowns)**
1. **Kinetic/variable typography** — type shifts weight and optical size; oversized headlines used as layout elements.
2. **Glassmorphism, done properly** — Apple's Liquid Glass made it mature: translucent panels for hierarchy, not Dribbble decoration. The counter-trend matters too: Linear deliberately removed refraction that hurts legibility in dense screens. In a data-heavy dashboard, glass belongs on chrome, never on data cells.
3. **Micro-interactions that earn their place** — a deliberate 150–250ms feedback beat reads as reliability; instant response can read as "nothing happened."
4. **Raw/structural aesthetics** — visible grids, monospaced type, wireframe logic for products where accuracy beats charm. This validates the instrument-panel direction; it needs execution polish, not a different direction.
5. **Fluid typography** — `clamp()` per style, not media-query steps.
6. **Accessibility with user control** — `prefers-reduced-motion` is baseline; a visible motion toggle is the 2026 signal of care.
7. **CSS platform capabilities now baseline**: View Transitions (93% support — Chrome 111+, Safari 18+, Firefox 144+), scroll-driven `animation-timeline` (Chrome/Edge 115+, Safari 26, Firefox 159 — ~89%), `@property` for animating custom props, `color-mix()`, `light-dark()`.

**What Linear and Vercel actually do (design teardowns, 2026)**
- Linear: Inter Variable self-hosted, 7 weights incl. fractional (450/550); dark surface `#08090a`; separation via 8% white borders + 20–32px backdrop blur, **one** drop shadow in the whole system; motion is spring-dominant, hover at 100–150ms, `ease-out-expo` signature easing; staggered list cascade ~20ms/item.
- Vercel: 150–250ms durations, `ease-out`, no springs, "silence is the system" — state changes signal, they don't celebrate. Restraint as confidence.
- Common: color as meaning only (danger/success/brand), six distinct button states, physical metaphor (menus grow from trigger, modals enter with weight), obsession with the specific case over generic rules.

## 3. The upgrade — concrete changes

### 3.1 Typography (fixes: generic fonts, flat scale)
- Self-host **Inter Variable** (one `woff2`, `font-weight: 100 900`) for UI + **JetBrains Mono Variable** for data. No Google Fonts request at all. Local fallback: `system-ui` / `ui-monospace`.
- Add a display moment: hero headline at `clamp(40px, 7vw, 88px)`, weight 650, `letter-spacing: -0.045em`, `font-optical-sizing: auto`. Body stays 15px/1.6.
- Mono voice reserved for data, hashes, labels, and the eyebrow — not headlines. This single change kills the "2015 admin theme" read.

### 3.2 Depth & lighting (fixes: flat surfaces, static header)
- Three-layer material system: `--surface-base` (opaque), `--surface-raised` (panels), `--chrome-glass` (header/nav/drawer only — Liquid Glass rule: glass is for chrome, never for data cells).
- Specular top rim on raised panels: `box-shadow: inset 0 1px 0 rgba(255,255,255,.08)` — the Liquid Glass signature, cheap and dramatic.
- Header scroll edge effect: blur increases 12→24px and border fades in as the page scrolls (scroll-driven `animation-timeline`, falls back to static blur).
- One ambient light source: a fixed radial gradient anchored top-center (`radial-gradient(60% 40% at 50% 0%, rgba(91,228,155,.06), transparent)`) so dark surfaces don't read as flat black.
- Elevation ladder: two shadow levels only (`0 1px 2px` for panels, `0 8px 32px` for floats) — Linear's rule.

### 3.3 Motion (fixes: generic easing, no view transitions)
- Signature easing tokens: `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)` for enters, `--ease-in-out: cubic-bezier(0.65,0,0.35,1)` for moves. Hover at 120ms, micro-feedback at 150–250ms, view transitions at 300ms.
- `@view-transition` + `view-transition-name` on desks: tab switches morph instead of swap (93% support; graceful fallback to instant swap).
- Hover dimensionality: rows lift with `translateY(-1px)` + border-brighten; buttons get a specular sweep (::after gradient translating across, 400ms); the pipeline stage bars animate with a spring feel (`linear()` or tuned cubic-bezier with slight overshoot).
- Staggered entrance on list/table render: 20ms/item cascade via `animation-delay: calc(var(--i) * 20ms)`.
- Counter/number transitions on stat band (`@property --n` + `counter-set`), so the "$100,000.00" counts up in 600ms on first paint.
- All motion gated inside `@media (prefers-reduced-motion: no-preference)`, plus a visible motion toggle in the footer (sets `data-motion="off"` on `<html>`).

### 3.4 Micro-interactions & states
- Every control gets six states: default/hover/active/focus-visible/disabled/loading (Linear's standard).
- Pipeline stages: hover shows the stage name in a tooltip; passing stages fill left-to-right with the amber→green transition retained.
- Table rows: click-anywhere opens the drawer (not just the hash link); the drawer enters with weight (`scale(0.98)→1` + fade, 250ms ease-out-expo).
- Form validation inline with `color-mix()` for the error tint; inputs keep typed values (already true).

### 3.5 Layout & rhythm
- Keep the instrument-panel direction (validated by 2026's raw/structural trend) but vary page rhythm: full-bleed hero → stat band → split (form + pipeline) → full-width verdict → table. Already close; tighten vertical rhythm to an 8px scale.
- Phone: tab bar becomes a bottom-fixed Liquid Glass bar (Android/iOS pattern, thumb-reachable) below 719px; content gets safe-area padding (`env(safe-area-inset-bottom)`).

### 3.6 Performance (perceived speed)
- Inline the two variable fonts as preloaded `woff2` (≤90KB total, `font-display: swap`).
- Replace the ledger's full-table render with `content-visibility: auto` on rows past the fold.
- Zero layout shift: reserve heights for stat band and pipeline strip (CLS already 0; keep it).

## 4. Telegraph expectations (checked)

- Judging: Commercial Viability 25 / Developer Activation 20 / Adoption 10 / Integration 5 / Reproducibility 5. Nothing rewards visual polish directly — but the disqualifiers do: "Rubric-Recitation Theater," "Form & Tab Sprawl," and "Fake UI Theater" are all named as AI-slop failure modes. A real-product-grade UI directly de-risks the "would a treasury team actually use this?" commercial-viability question.
- The skill's guidance (`#showcase` thread, demo video cues) implies screenshots/video of the portal. Every frame of that video is judged on craft.
- Competitor context: peer bounty submissions are API-first with minimal UI; a Linear-grade portal is a genuine differentiator, not table stakes, in this field.

## 5. Non-goals
- No framework migration (React/Next) — the zero-dependency single file is a feature (instant load, no build).
- No WebGL/3D — the product's credibility is precision, not spectacle.
- No glass on data cells, ever (Linear's legibility rule).

## 6. Rollout order
1. Self-host variable fonts + type scale overhaul (biggest visual win, zero risk).
2. Material depth system + specular rims + ambient light.
3. Motion tokens + view transitions + hover dimensionality.
4. Micro-states + staggered entrances + counter animations.
5. Bottom tab bar on mobile + motion toggle.
6. Full browser pass at 390/768/1280 + reduced-motion + dark-only (this product is dark-native).

## 7. Sources
- Apple Liquid Glass HIG: https://developer.apple.com/design/human-interface-guidelines/materials.md
- Apple newsroom (Liquid Glass intro): https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- Material 3 Expressive (I/O 26): https://m3.material.io/blog/whats-new-at-io26
- Windows 11 design: https://learn.microsoft.com/en-us/windows/apps/design/guidelines-overview ; https://microsoft.design/articles/windows-11-design-principles-tenets/
- 2026 web trends: https://www.figma.com/resource-library/web-design-trends/ ; https://elements.envato.com/learn/web-design-trends
- Linear/Vercel teardowns: https://builtux.com/b2b-saas-developer-dashboard-ui-architecture-2026/ ; https://www.designmd.co/blog/linear-vs-vercel-motion ; https://akash-m.com/blogs/2026-10-linear
- View Transitions support: https://caniuse.com/wf-view-transitions ; scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
