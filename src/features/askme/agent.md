# AskMe Agent Contract (`src/features/askme`)

## Scope
- This agent works primarily in `src/features/askme`.
- Cross-folder changes are allowed only when required for AskMe behavior (for example shared services, app shell integration, or root metadata behavior).

## Objectives
- Keep AskMe stable, responsive, and visually consistent across desktop and cellphone.
- Preserve matrix theme consistency while preventing layout regressions.
- Maintain strict separation of concerns:
  - `AskMe.jsx` for composition and state wiring,
  - `*.desktop.css` and `*.mobile.css` for viewport-specific styles,
  - `hooks/` for reusable side effects and behavior logic.

## Architecture Rules
- Do not reintroduce injected style tags into component files.
- Keep responsive configuration split by platform:
  - desktop config in desktop files,
  - cellphone config in mobile files.
- Do not duplicate logic between hooks; share behavior via focused hook modules.
- Keep AI request flow centralized through `src/services/aiApi.js`.

## Known Bugs Fixed
### Mobile wrapper expansion on textarea focus (fixed)
- **Root cause**: `AskMe.desktop.css` set `min-height: 100svh` on `.askme-wrapper`. The mobile override
  (`AskMe.mobile.css`) used `height: calc(var(--askme-vh, 1vh) * 100)` but never reset `min-height`.
  When the virtual keyboard opened and `--askme-vh` shrank, `min-height: 100svh` forced the wrapper
  to stay at full initial height, causing visible expansion and a scroll region below the keyboard.
- **Fix**: Added `min-height: 0` to `.askme-wrapper` in the `@media (max-width: 640px)` block so the
  declared `height` is the sole authority on mobile.
- **Rule to preserve**: The mobile `.askme-wrapper` override **must** include `min-height: 0` to prevent
  desktop `min-height` values from re-applying.

### Mobile wrapper translateY offset causing downward shift (fixed)
- **Root cause**: The mobile `.askme-wrapper` used `transform: translateY(var(--askme-keyboard-offset, 0px))`.
  For a `position: fixed` element this is incorrect — fixed positioning is already relative to the
  viewport, so adding `offsetTop` as a translate shifted the wrapper **down**, pushing content below
  the visible area and creating an apparent scroll region.
- **Fix**: Removed `transform: translateY(...)` from the mobile `.askme-wrapper`. Removed the
  `--askme-keyboard-offset` CSS variable from `useAskMePageSetup.js` since it is no longer consumed.
- **Rule to preserve**: Do not re-add a `translateY` based on `visualViewport.offsetTop` to a
  `position: fixed` element.

## Desktop + Cellphone Verification (Required)
For every AskMe change, verify both desktop and cellphone layouts before PR:

1. **Desktop run check**
   - Validate terminal card alignment, chat area scroll, input + send alignment, and fullscreen behavior.
2. **Cellphone run check**
   - Validate viewport fit, safe-area behavior, chat-area fixed height, and no clipping or overflow.
   - Tap the textarea and confirm the wrapper does **not** grow or push content off-screen.
   - Confirm the page is **not** scrollable outside the chat-area.
3. **Interaction check**
   - Send message flow does not hide AskMe wrapper.
   - Typewriter response and matrix background run without UI disappearance.
   - Fullscreen toggle works as expected for supported browsers.

## Debugging Guide

### Symptom: wrapper expands when keyboard opens on mobile
1. Open DevTools → Elements → inspect `.askme-wrapper` on mobile emulation.
2. Check computed `min-height`. If it shows a large value (e.g., matching full viewport), the desktop
   `min-height: 100svh` rule is leaking into mobile. Ensure mobile CSS includes `min-height: 0`.
3. Check `--askme-vh` in DevTools → Computed → Custom Properties. It should track `visualViewport.height`.

### Symptom: page is scrollable on mobile / content scrolls away from keyboard
1. Check whether `.askme-wrapper` has `position: fixed; overflow: hidden`. If `overflow` is not
   `hidden`, content can bleed out.
2. Check `document.body.style.overflow` in console — must be `"hidden"` while the AskMe page is mounted.
3. Check `.askme-wrapper` for any `transform: translateY(...)`. A positive translate on a fixed element
   shifts it **down**, making the bottom overflow the viewport. Remove any such translate.
4. Verify that `.ask-omer-page` has `height: 100%` and `min-height: 0` in the mobile media query, so it
   does not grow beyond the wrapper.

### Symptom: input area not visible after keyboard opens
1. The `is-keyboard-active` class should be added to `.askme-wrapper` immediately on `onFocus`.
   Check `AskMe.jsx` `handleInputFocus` — it calls `setIsKeyboardActive(true)`.
2. Inspect whether the `visualViewport` resize listener updates `--askme-vh` quickly enough (within ~300 ms).
3. Ensure `useAskMePageSetup` listens on both `window.visualViewport.resize` and `window.resize`.

### Symptom: fullscreen toggle has no effect on iOS Safari
- iOS Safari does not support the Fullscreen API on non-video elements. `useAskMeFullscreen` falls back
  to a class-based CSS fullscreen (`is-fullscreen`). Verify the CSS class is toggled correctly.

## Test Coverage (`tests/e2e/ask-me.spec.js`)
| Test name | What it validates |
|---|---|
| `ask-me page renders chat UI` | All key UI elements are present on load |
| `ask-me handles mobile keyboard opening without CSS breakage` | Layout survives simulated keyboard open |
| `ask-me viewport meta locks zoom and scroll` | Viewport meta is set correctly |
| `ask-me wrapper height tracks visual viewport height on keyboard open` | `--askme-vh` CSS var updates |
| `ask-me chat-area does not grow beyond wrapper on mobile` | Chat-area is clipped by wrapper |
| `ask-me input section is visible within wrapper when keyboard is active` | Input stays on-screen |
| `ask-me wrapper height does not exceed viewport when textarea focused on mobile` | **Regression** – wrapper must not expand beyond viewport on focus |
| `ask-me locks body scroll while mounted` | **Regression** – `body.style.overflow` is `hidden` |
| `ask-me wrapper has no unexpected vertical translate offset` | **Regression** – wrapper top is near 0 (no translateY mis-alignment) |
| `ask-me terminal-card contains all expected sub-components` | Component structure is intact |
| `ask-me input accepts text and clears on Enter` | Input field accepts text; Shift+Enter does not submit |
| `ask-me chat-area is independently scrollable without moving wrapper` | Chat scroll does not shift wrapper |
| `ask-me viewport meta disables user scaling` | Zoom lock and viewport-fit=cover present |

## PR Evidence Requirements
- Include a short validation summary in PR description with:
  - `Desktop:` pass/fail + what was checked,
  - `Cellphone:` pass/fail + what was checked,
  - `Known limitations:` browser/platform limitations (if any).
- Include visual evidence (before/after screenshots) for desktop and cellphone when UI/CSS changes are made.

## Validation Commands
Run these before finalizing:
1. `npm run lint`
2. `npm run build` (when behavior or production output is impacted)

If failures are unrelated, report them and avoid broad unrelated fixes.

## Definition of Done (AskMe)
- No regressions in desktop/cellphone layout.
- Chat area remains scrollable and non-expanding as intended.
- Fullscreen behavior remains stable for supported environments.
- Separation-of-concerns structure remains intact.
- Lint/build checks pass or unrelated failures are explicitly documented.
