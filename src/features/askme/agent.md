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

## Desktop + Cellphone Verification (Required)
For every AskMe change, verify both desktop and cellphone layouts before PR:

1. **Desktop run check**
   - Validate terminal card alignment, chat area scroll, input + send alignment, and fullscreen behavior.
2. **Cellphone run check**
   - Validate viewport fit, safe-area behavior, chat-area fixed height, and no clipping or overflow.
3. **Interaction check**
   - Send message flow does not hide AskMe wrapper.
   - Typewriter response and matrix background run without UI disappearance.
   - Fullscreen toggle works as expected for supported browsers.

## PR Evidence Requirements
- Include a short validation summary in PR description with:
  - `Desktop:` pass/fail + what was checked,
  - `Cellphone:` pass/fail + what was checked,
  - `Known limitations:` browser/platform limitations (if any).
- Include visual evidence (before/after screenshots) for desktop and cellphone when UI/CSS changes are made.

## Validation Commands
Run these before finalizing:
1. `npm.cmd run lint`
2. `npm.cmd run build` (when behavior or production output is impacted)

If failures are unrelated, report them and avoid broad unrelated fixes.

## Definition of Done (AskMe)
- No regressions in desktop/cellphone layout.
- Chat area remains scrollable and non-expanding as intended.
- Fullscreen behavior remains stable for supported environments.
- Separation-of-concerns structure remains intact.
- Lint/build checks pass or unrelated failures are explicitly documented.
