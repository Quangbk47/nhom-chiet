# NEXT SESSION PROMPT — SELF-CONTAINED

You are continuing repository `H:\IT\Webchiet` (`https://github.com/Quangbk47/nhom-chiet`) for the Liquid–Liquid Extraction Simulator: a React/TypeScript/Vite browser teaching/research tool for AcOH–water–EtOAc cross-current fresh-solvent extraction.

## Current status

Documentation hardening is complete or awaiting final commit review; no application source/package/test runner exists. Phase 1 scientific readiness is BLOCKED by B01 fixed temperature, B02 default KD/source/domain, B03 validation threshold and B04 approved lab SOP. Do not invent any of them. The pre-existing deletion of `Documentation_Dot1_Five_Core_Specifications.zip` is unrelated and must remain unstaged unless Owner explicitly asks otherwise.

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
