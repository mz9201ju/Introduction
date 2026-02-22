# Game Agent Contract (`src/features/game`)

## Scope
- This agent works **only** in `src/features/game` unless a change outside this folder is required to keep the game functional.
- If a cross-folder change is needed, keep it minimal and explain why.

## Core Objectives
- Keep game business logic in dedicated game logic files/folders, separated from UI/rendering code.
- Eliminate duplication and keep single sources of truth for config, constants, and helpers.
- Maintain strong runtime performance on desktop and mobile.
- Ensure full playability on both desktop and mobile input systems.
- Use modern, stable JavaScript patterns and avoid legacy/fragile approaches.

## Architecture Rules
- Business rules go in `gameScripts/` (engine, entities, rules, config, utilities).
- Rendering-specific logic stays in renderer/component boundaries (`components/` and rendering modules).
- Page/container files (such as `pages/`) should orchestrate state and wiring, not hold deep game logic.
- Reuse existing modules before creating new ones.
- Avoid duplicate constants and magic numbers; centralize in config files.

## Duplication Prevention
- Before adding code, search for existing helpers/utilities that already solve the same task.
- If two code paths perform the same logic, extract shared logic to one function/module.
- Keep naming consistent across game files for discoverability.

## Performance Guardrails
- Keep hot-path code minimal in animation loops and per-frame updates.
- Avoid unnecessary React re-renders; prefer refs/callback stability where appropriate.
- Always clean up `requestAnimationFrame`, event listeners, intervals, and timeouts in effects.
- Use efficient collision, spawn, and update logic; avoid expensive allocations in tight loops.
- Test that new features do not degrade responsiveness on low/mid devices.

## Desktop + Mobile Compatibility
- Preserve and validate both desktop controls (mouse/keyboard/click) and mobile controls (touch/joystick).
- Ensure controls, hit detection, and UI overlays work on different viewport sizes.
- Keep touch interactions reliable and avoid desktop-only assumptions.

## JavaScript Standards
- Use latest stable ECMAScript features supported by the project toolchain (Vite + current browser targets).
- Prefer clear functions, `const`/`let`, array/object methods, and readable modular code.
- Avoid outdated patterns, implicit globals, and brittle side effects.

## Quality Checklist for Every Game Change
- No duplicated logic introduced.
- Business logic remains separated from rendering/UI files.
- Desktop and mobile interactions both verified.
- Cleanup of listeners/frames/timers confirmed.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes for production safety.

## Recurring Feature Delivery (Operational Rule)
- Maintain a rolling feature cadence aligned with the current automation schedule.
- Each cycle must include:
  1. One gameplay feature (new mechanic/enemy/power-up/challenge),
  2. One stability/performance improvement,
  3. One desktop/mobile UX polish item,
  4. Validation via lint + build.
- Keep updates incremental, testable, and backward compatible.

## Feature Backlog Protocol
- Keep and update a prioritized backlog at the end of this file under `### Feature Backlog`.
- Each entry should use:
  - `id`, `title`, `type`, `priority`, `status` (`todo|doing|done`), `created`, `completed`.
- Always pick from the highest-priority `todo` item first.
- If no backlog item exists, add one before implementing.

## Feature Type Rotation
- Rotate feature type each cycle to keep game evolution balanced:
  1. Enemy/encounter feature,
  2. Player ability/power-up,
  3. Progression/difficulty polish,
  4. Boss/wave behavior enhancement,
  then repeat.

## Definition of Done (Per Cycle)
- Business logic implemented in `gameScripts/` (or extracted there if introduced in UI code).
- No duplicate logic introduced.
- Desktop and mobile behavior verified.
- No leaked listeners/frames/timers.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Release summary added using the required template below.

## Change Budget (Anti-Overreach)
- Maximum per cycle:
  - 1 gameplay feature,
  - 1 performance/stability improvement,
  - 1 UX polish item.
- Defer extra ideas to backlog; do not batch large risky refactors.

## Required Release Summary
- For every delivered cycle, provide:
  - `Feature:` what was added,
  - `Why:` player or gameplay value,
  - `Tech:` files/modules changed,
  - `Validation:` desktop/mobile + lint/build results,
  - `Follow-ups:` backlog IDs created or updated.

## Change Control
- Make focused, minimal diffs.
- Do not refactor unrelated areas.
- Document non-obvious decisions in PR notes or commit message summary (not inline code comments unless requested).

### Feature Backlog
- id: G-001 | title: Add elite enemy pattern | type: enemy | priority: high | status: done | created: 2026-02-21 | completed: 2026-02-21
- id: G-002 | title: Add temporary shield power-up | type: player-ability | priority: high | status: todo | created: 2026-02-21 | completed:
- id: G-003 | title: Tune wave scaling curve | type: progression | priority: medium | status: todo | created: 2026-02-21 | completed:
- id: G-004 | title: Boss burst fire stagger (delay-free multi-bullet) | type: stability | priority: medium | status: done | created: 2026-02-21 | completed: 2026-02-21
- id: G-005 | title: Player-hit screen flash UX | type: ux-polish | priority: medium | status: done | created: 2026-02-21 | completed: 2026-02-21
