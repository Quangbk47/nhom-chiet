# HANDOVER

## What the project is

Liquid–Liquid Extraction Simulator is a browser teaching/research tool for AcOH–water–EtOAc cross-current batch extraction. V1 uses fresh solvent per stage, constant `KD=CE/CR`, 1–10 stages and canonical units `mol/L` and `L`.

## Current state

The repository is documentation-only. The browser-first architecture, toolchain target, domain contracts, UI/state/output/test specifications and student backlog are documented. No `package.json`, `src/`, test runner, Firebase project or scientific dataset exists. Scientific readiness is blocked by B01–B04.

## Decided architecture

React/TypeScript/Vite browser app; boundary validation/normalization → pure calculation engine → immutable `SimulationResult` → state machine/SVG/table/charts. Firebase Hosting deploys static output. Firestore is optional persistence only. There is no required custom backend/API calculation server and no network dependency for simulation.

## Must not change

- `EXPERT_DECISIONS.md` scientific decisions and PENDING guards.
- `KD=CE/CR`, canonical units, cross-current fresh solvent and stage 0…N.
- Frontend components must not duplicate chemistry; animation must not mutate results or claim physical time.
- Do not invent default KD/temperature/citation/domain/equilibrium/experimental data/threshold.
- Do not delete or rewrite raw experimental observations; do not tune KD to lower error.

## Completed in hardening pass

- Audited repository and read all Markdown/README/assets.
- Reconciled the earlier backend-authority wording with Owner browser-first architecture.
- Added `DOCUMENT_AUTHORITY_MAP.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `CHEMISTRY_MODEL.md`, `INPUT_SPECIFICATION.md`, `CALCULATION_ENGINE.md`, `SIMULATION_STATE_MACHINE.md`, `RESULTS_AND_CHARTS.md`, `ERROR_HANDLING.md`, `EXPERIMENTAL_VALIDATION.md`, `TESTING_STRATEGY.md`.
- Expanded existing scope, rules, decisions, formula, model, UI, visual, validation, roadmap, TODO and status documents.

## Open decisions and risks

Scientific: B01 temperature, B02 default KD/source/domain, B03 threshold, B04 lab SOP. Engineering risks: locale parsing, floating-point tolerance, chart/StageResult drift, timer races, Firestore privacy/rules. These are tracked in `TODO.md`/`ROADMAP.md`.

## Exact next task

`ENG-001 — Scaffold Vite React TypeScript`.

- Files: `package.json`, lockfile, `index.html`, `src/app/App.tsx`, `src/main.tsx`, base styles and tool-version file.
- Tests: install, lint, typecheck, Vitest placeholder, build from a fresh clone.
- Acceptance: scripts in `TECH_STACK.md` pass; no calculation code, Firebase Auth or server is added.

## How to verify handover

Read `README.md` → `DOCUMENT_AUTHORITY_MAP.md` → `EXPERT_DECISIONS.md` → `TECH_STACK.md` → `DATA_MODEL.md` → `INPUT_SPECIFICATION.md` → `CALCULATION_ENGINE.md` → relevant TODO task. Run the document inventory/link/contradiction checks described in `PROGRESS.md`; after ENG-001 exists, run the committed package scripts.
