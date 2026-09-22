# HANDOVER

## What the project is

Liquid–Liquid Extraction Simulator is a browser teaching/research tool for AcOH–water–EtOAc cross-current batch extraction. V1 uses fresh solvent per stage, constant `KD=CE/CR`, 1–10 stages and canonical units `mol/L` and `L`.

## Current state

The browser application through Phase 8 is merged on `main`: React/TypeScript/Vite, input boundary, pure engine, verification, app shell, SVG visualization and playback. Local verification and GitHub Actions passed for integrated SHA `5db4390`; Phase 3–8 are `DONE`. Do not infer a scientific validation claim. No Firebase project or scientific dataset exists. B01–B04 are recorded; Phase 1 remains in progress for the unapproved KD reference and SOP review/approval.

## Decided architecture

React/TypeScript/Vite browser app; boundary validation/normalization → pure calculation engine → immutable `SimulationResult` → state machine/SVG/table/charts. Firebase Hosting deploys static output. Firestore is optional persistence only. There is no required custom backend/API calculation server and no network dependency for simulation.

## Must not change

- `EXPERT_DECISIONS.md` scientific decisions and provenance guards.
- `KD=CE/CR`, canonical units, cross-current fresh solvent and stage 0…N.
- Frontend components must not duplicate chemistry; animation must not mutate results or claim physical time.
- Do not invent default KD/citation/domain/equilibrium/experimental data or SOP approval. V1 temperature is fixed at 25 °C and validation is metric-only with no PASS/FAIL threshold.
- Do not delete or rewrite raw experimental observations; do not tune KD to lower error.

## Completed in hardening pass

- Audited repository and read all Markdown/README/assets.
- Reconciled the earlier backend-authority wording with Owner browser-first architecture.
- Added `DOCUMENT_AUTHORITY_MAP.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `CHEMISTRY_MODEL.md`, `INPUT_SPECIFICATION.md`, `CALCULATION_ENGINE.md`, `SIMULATION_STATE_MACHINE.md`, `RESULTS_AND_CHARTS.md`, `ERROR_HANDLING.md`, `EXPERIMENTAL_VALIDATION.md`, `TESTING_STRATEGY.md`.
- Expanded existing scope, rules, decisions, formula, model, UI, visual, validation, roadmap, TODO and status documents.

## Open decisions and risks

Scientific: SCI-001 default KD/source/domain and SOP-001 draft/review/approval; experimental data remains future evidence. Engineering risks: locale parsing, floating-point tolerance, chart/StageResult drift, timer races, Firestore privacy/rules. These are tracked in `TODO.md`/`ROADMAP.md`.

## Exact next task

Phase 9 is the next planned engineering phase, but remains `NOT STARTED` and is out of scope for the Phase 3–8 integration session. Any future work must first read the result/chart contracts and preserve all scientific gates.

## How to verify handover

Read `README.md` → `DOCUMENT_AUTHORITY_MAP.md` → `EXPERT_DECISIONS.md` → `TECH_STACK.md` → `DATA_MODEL.md` → `INPUT_SPECIFICATION.md` → `CALCULATION_ENGINE.md` → relevant TODO task. Run `pnpm install --frozen-lockfile`, `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `git diff --check` and relevant Playwright checks.
