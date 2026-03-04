# Root Agent Contract (`/agent.md`)

## Purpose
- This is the **project-level coordinator agent**.
- It defines global standards and routes feature-specific work to local agent files.

## Delegation Rules
- If task path is under `src/features/game`, apply rules from:
  - `src/features/game/agent.md`
- If task path is under `src/features/askme`, apply rules from:
  - `src/features/askme/agent.md`
- For AskMe tasks, treat the cellphone keyboard/layout rules in `src/features/askme/agent.md` as **non-negotiable regressions**:
  - keep input visible when keyboard opens,
  - prevent wrapper/top-area vertical drift,
  - preserve mobile viewport anchoring + guardrail E2E assertions.
- For game tasks, execution is mandatory via the game agent protocol:
  - pick work from `### Feature Backlog` by highest-priority `todo`,
  - follow `Feature Type Rotation`,
  - satisfy `Definition of Done (Per Cycle)`,
  - produce the `Required Release Summary`.
- If no local agent exists for a folder, follow this root file only.
- When both root and local agent rules apply, use:
  1. Safety and correctness first,
  2. Local feature agent for domain behavior,
  3. Root rules for global conventions.

## Global Project Standards
- Keep changes focused and minimal.
- Use JavaScript/JSX and existing project patterns.
- Prefer configured path aliases (`@app`, `@features`, `@game`, `@resume`) where practical.
- Do not add dependencies unless required.
- Do not refactor unrelated areas.

## Validation Requirements
- Run:
  1. `npm.cmd run lint; npm.cmd run build`
  2. If execution policy blocks scripts, use:
     - `powershell -ExecutionPolicy Bypass -Command "npm.cmd run lint; npm.cmd run build"`
- For browser end-to-end coverage when requested, run:
  3. `npm.cmd run test:e2e`
- If unrelated failures exist, report them without broad unrelated fixes.

## Testing & E2E Principles
- **Never add test-specific code to source files** (no `__E2E_TEST__` flags, test modes, hardcoded logic)
- Tests must work against unmodified application code using Playwright capabilities
- Use network mocking, route interception, and page evaluation for test isolation
- Test failures should drive feature improvements, not source code workarounds

## CI Agent E2E Entry Points
- GitHub Actions workflow: `.github/workflows/playwright-live.yml`
- Supports `workflow_dispatch` with optional `target_url` input for live-site testing.
- If `target_url` is empty, workflow runs Playwright against local Vite preview.

## SEO + Identity Consistency
- Keep personal/site identity consistent as **Omer Zahid** across metadata and profile references unless explicitly asked otherwise.
- Enforce sitemap freshness automatically: if `public/sitemap.xml` uses weekly cadence, CI must run a scheduled weekly validation and fail on missing or stale critical routes.
- Prefer no-touch maintenance: use GitHub Actions to validate (and optionally regenerate) sitemap entries so manual sitemap edits are not required.

## Change Quality
- Avoid duplicate logic; reuse existing modules/helpers.
- Preserve current architecture boundaries and file responsibilities.
- Keep behavior stable unless behavior change is explicitly requested.

---

## Implementation Log

### 2026-02-28 — About Page ProjectCard Hover Animations

**Date:** 2026-02-28

**Files changed:**
- `src/features/resume/data/projects.js` — added `animKey` field to each project entry
- `src/features/resume/utils/animationProfiles.js` — new file; animation profile registry mapping `animKey` to Canvas particle config (symbols, velocity ranges, size, opacity, count)
- `src/features/resume/hooks/useCardHover.js` — new file; minimal `useCardHover` hook exposing `isHovered` + mouse/focus event handlers
- `src/features/resume/components/CardHoverBackground.jsx` — new file; Canvas component that runs a `requestAnimationFrame` particle loop when `isActive`, cleans up on deactivation/unmount
- `src/features/resume/pages/About.jsx` — `ProjectCard` now accepts `animKey`, wires `useCardHover`, renders `<CardHoverBackground>`; `CARD_STYLE` gains `position:relative` and `overflow:hidden`
- `src/features/resume/pages/About.css` — added `.card-hover-bg-canvas` (absolute fill, `pointer-events:none`, `z-index:0`) and `~ *` sibling rule (`z-index:1`) to keep content above the canvas
- `README.md` — new section documenting the feature, profile table, how to add profiles, a11y/reduced-motion
- `agent.md` — this implementation log

**Design decisions and trade-offs:**
- **Canvas + RAF** chosen over CSS-only keyframes because it allows per-particle randomization (speed, position, size, opacity) for a natural, non-repeating feel — CSS alone would require many fixed keyframes.
- **Emoji glyphs** (`ctx.fillText`) used for themed symbols: zero extra assets, vectorized appearance, easy to change per project.
- **`animKey` in `projects.js`** is the single source of truth linking a project to its profile. New projects only need `animKey` added; the profile registry handles the rest.
- **`useCardHover` hook** is kept minimal (mouse + focus/blur only) to avoid unnecessary re-renders. No throttle needed — state toggles are infrequent.
- **`position:relative` + `overflow:hidden`** on the card ensures particles are visually clipped to the card boundary without JS measurement.
- Canvas dimensions are read from `container.clientWidth/Height` at activation time; no ResizeObserver needed since card layout is stable.
- **`prefers-reduced-motion`** is checked inside the effect: when active, canvas is cleared and RAF never starts — clean static fallback with no extra component complexity.

**Validation results:**
- `npm.cmd run lint; npm.cmd run build` — ✅ no warnings/errors, clean build; About chunk size increased by ~3 KB (expected for new Canvas component)
- Manual Playwright verification — animation confirmed visible on hover (cars visible in NYC LUX RIDE card screenshot)

**Known limitations / future improvements:**
- Canvas is sized once at hover activation. If the card resizes (e.g., window resize while hovering), particles may run outside the logical canvas area until next activation. A ResizeObserver could fix this if needed.
- Emoji rendering on Canvas is font-dependent; on some Linux headless environments emoji may render as boxes. This is a platform/font limitation, not a code issue.
- Particle count and speed are fixed per profile. Future work could make them responsive to card size.

