# Copilot Instructions for space-nerd-portfolio

This file mirrors the project guidance in `.github/co-pilot-instruction.md` and uses the canonical filename recognized by GitHub Copilot tooling.

## Project Context
- This is a **React 19 + Vite 7** portfolio app with multiple feature areas:
  - Resume pages/components (`src/features/resume`)
  - Ask-Me AI chat (`src/features/askme`)
  - Canvas game (`src/features/game`)
  - App shell/navigation/routes (`src/app`)
- Build target is static hosting (GitHub Pages style), and routing is handled client-side.

## Tech + Tooling Constraints
- Use **JavaScript/JSX** (not TypeScript) unless explicitly requested.
- Follow existing ESLint config (`eslint.config.js`), especially:
  - avoid unused vars
  - React hooks best practices
- Keep imports ESM-style and match current formatting style.

## Path Aliases (Prefer These)
- `@app` -> `src/app`
- `@features` -> `src/features`
- `@game` -> `src/features/game`
- `@resume` -> `src/features/resume`

Prefer alias imports over deep relative imports when possible.

## Coding Conventions
- Keep components as **function components** with hooks.
- Preserve current style conventions in each file (some files are heavily commented, some are minimal).
- Make focused, minimal changes; do not refactor unrelated areas.
- Avoid introducing one-letter variables.
- Do not add inline comments unless requested.

## Separation of Concerns
- Prefer **one responsibility per file**:
  - UI component markup/state wiring in component files
  - Feature styling in colocated CSS files
  - Reusable side-effect logic in custom hooks under the feature folder
  - Shared helpers/constants in dedicated utility files
- For responsive feature work, keep **desktop and cellphone configuration in separate files** (for example `Feature.desktop.css` and `Feature.mobile.css`), and import both from the feature entry component.
- For responsive logic/configuration, keep desktop and cellphone variants in separate modules where practical (for example `utils/desktopConfig.js` and `utils/mobileConfig.js`) to avoid mixed conditional blocks in a single file.
- Avoid long monolithic feature files when logic can be safely extracted without changing behavior.
- For feature work, favor colocated structure such as:
  - `Feature.jsx`
  - `Feature.css`
  - `hooks/` and/or `utils/` within the same feature directory
- Keep performance-sensitive effects isolated and reusable (timers, animation frames, resize/fullscreen listeners).

## Styling Rules
- Reuse theme constants from `src/theme.js` (`COLORS`, `SHADOWS`, `BORDERS`, `ANIMATIONS`, `API_CONFIG`) instead of hardcoding repeated values.
- Keep existing mixed styling approach intact:
  - Some areas use inline style objects
  - Some inject style tags in effects
  - Some use CSS files
- Do not introduce new styling frameworks.

## Routing + App Shell
- Main routes are defined in `src/app/routes/AppRoutes.jsx`.
- App wrapper is in `src/App.jsx` with `BrowserRouter` + `NavBar` + `WarpDriveFX` + route outlet.
- Keep route additions consistent with existing route structure and naming.

## AI/Network Integration
- Centralize AI requests in `src/services/aiApi.js`.
- Prefer extending existing service functions instead of duplicating fetch logic inside UI components.
- Preserve current error handling pattern (throw meaningful errors, catch/log at boundaries).

## Game Feature Guidance
- Game logic is performance-sensitive (Canvas + animation loops).
- For game updates:
  - avoid unnecessary React re-renders
  - clean up event listeners/animation frames/timeouts in effects
  - keep hot-path logic in game scripts/components lean

## Dependency Policy
- Do not add new dependencies unless required for the task.
- If a dependency is necessary, justify it briefly and keep it minimal.

## Validation Before Finalizing
When changing code, run the smallest relevant checks first:
1. `npm run lint`
2. `npm run build` for production-impacting changes

If failures are unrelated, report them without broad unrelated fixes.

## Output Expectations for Copilot
- Provide concise, implementation-ready changes.
- Reference exact files being changed.
- Keep UX changes strictly scoped to the request.
- Avoid adding extra features not asked for.
