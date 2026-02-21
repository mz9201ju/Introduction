# Root Agent Contract (`/agent.md`)

## Purpose
- This is the **project-level coordinator agent**.
- It defines global standards and routes feature-specific work to local agent files.

## Delegation Rules
- If task path is under `src/features/game`, apply rules from:
  - `src/features/game/agent.md`
- If task path is under `src/features/askme`, apply rules from:
  - `src/features/askme/agent.md`
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
  1. `npm.cmd run lint`
  2. `npm.cmd run build` (for production-impacting changes)
- If unrelated failures exist, report them without broad unrelated fixes.

## SEO + Identity Consistency
- Keep personal/site identity consistent as **Omer Zahid** across metadata and profile references unless explicitly asked otherwise.

## Change Quality
- Avoid duplicate logic; reuse existing modules/helpers.
- Preserve current architecture boundaries and file responsibilities.
- Keep behavior stable unless behavior change is explicitly requested.
