# NEXT SESSION PROMPT — SELF-CONTAINED

You are continuing repository `H:\IT\Webchiet` (`https://github.com/Quangbk47/nhom-chiet`) for the Liquid–Liquid Extraction Simulator: a React/TypeScript/Vite browser teaching/research tool for AcOH–water–EtOAc cross-current fresh-solvent extraction.

## Current status

Documentation hardening and the 2026-09-20 Owner-decision synchronization are published; no application source/package/test runner exists. Phase 0 is DONE. Phase 1 is IN PROGRESS: B01 fixed temperature is resolved at 25 °C, B03 is resolved as metric-only with no PASS/FAIL threshold, while SCI-001 default KD/source/domain evidence and SOP-001 review/approval remain open. Do not invent a KD value, provenance, experimental data or SOP approval. The pre-existing deletion of `Documentation_Dot1_Five_Core_Specifications.zip` is unrelated and must remain unstaged unless Owner explicitly asks otherwise.

## Read first

`README.md`, `docs/DOCUMENT_AUTHORITY_MAP.md`, `docs/PROJECT_RULES.md`, `docs/EXPERT_DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/TECH_STACK.md`, `docs/DATA_MODEL.md`, `docs/INPUT_SPECIFICATION.md`, `docs/CHEMISTRY_MODEL.md`, `docs/CALCULATION_ENGINE.md`, `docs/SIMULATION_STATE_MACHINE.md`, `docs/RESULTS_AND_CHARTS.md`, `docs/TESTING_STRATEGY.md`, `docs/TODO.md`, `docs/PROGRESS.md`, `docs/HANDOVER.md`.

## Exact task: ENG-001

Scaffold Vite + React + TypeScript and the reproducible engineering foundation described in `TECH_STACK.md`.

### Create

`package.json`, pnpm lockfile, Node tool-version file, `index.html`, `src/main.tsx`, `src/app/App.tsx`, base CSS, and minimal config needed for strict TypeScript/Vite.

### Do not create yet

No chemistry formula, KD default, temperature, API/backend server, Firebase Auth, Firestore write path, or production simulation UI. A trivial shell page is sufficient.

### Tests and acceptance

Run `corepack enable`, `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Add CI config only if specified by `TECH_STACK.md`. Fresh clone must reproduce the commands; domain imports must remain independent from React/Firebase.

### Workflow

Inspect status/branch/remote first. Preserve unrelated changes. Implement → test → update `PROGRESS.md`/relevant docs → `git diff --check` → review staged diff → commit with scoped message → push `origin main` only when safe and explicitly requested. Report exact commit SHA, tests and blockers. Never force-push.
