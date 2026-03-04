# Contributing Guide

## Scope
This repository uses React + Vite and is maintained primarily on Windows PowerShell environments.

## Command Standard (Windows-safe)
Use `npm.cmd` for all npm scripts in PowerShell to avoid execution policy issues.

Examples:
- `npm.cmd install`
- `npm.cmd run dev`
- `npm.cmd run lint`
- `npm.cmd run build`

## Required Verification Before PR/Deploy
Run lint and build in one command:

```powershell
npm.cmd run lint; npm.cmd run build
```

If PowerShell execution policy blocks scripts, use:

```powershell
powershell -ExecutionPolicy Bypass -Command "npm.cmd run lint; npm.cmd run build"
```

For non-production-impacting changes, lint-only is acceptable:

```powershell
npm.cmd run lint
```

## E2E (when requested)
- `npm.cmd run test:e2e`

## Change Guidelines
- Keep diffs focused and minimal.
- Do not refactor unrelated areas.
- Prefer existing path aliases and project structure.
- Do not add dependencies unless required.

## Deployment Readiness Checklist
- Lint passes.
- Build passes.
- SEO and route metadata changes validated when relevant.
- Any unrelated failures are documented clearly.
