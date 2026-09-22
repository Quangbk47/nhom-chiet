# ROADMAP — IMPLEMENTATION AND EVIDENCE PLAN

Allowed status values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`. A phase is DONE only with the listed evidence; writing a document or creating a screen is not enough.

## Phase 0 — Documentation hardening

- **Objective:** make a fresh clone implementable without chat history.
- **Prerequisites:** repository audit and Owner architecture amendment.
- **Tasks:** authority map, browser-first correction, detailed domain/UI/state/output/testing contracts, cross-links.
- **Expected files:** README, `DOCUMENT_AUTHORITY_MAP.md`, all docs referenced there.
- **Tests/evidence:** full Markdown inventory, link scan, contradiction scan, `git diff --check`, student second-pass checklist.
- **Exit:** no backend-authority wording remains; every next task names files/tests/acceptance; progress/handover updated.
- **Dependencies/risks:** Scientific readiness is tracked separately in Phase 1; stale links.
- **Status:** DONE.

## Phase 1 — Scientific readiness (in progress)

- **Objective:** establish provenance-complete reference data and lab governance for scientific use.
- **Prerequisites:** Owner decisions B01–B04 are recorded; remaining evidence is still required.
- **Tasks:** establish/approve a default KD at 25 °C or explicitly retain no populated default; review convention/system/unit/domain; draft/review/approve the laboratory SOP; collect experimental data under that SOP.
- **Expected files:** `REFERENCE_DATA.md`, `TODO.md`, approved records (future data directory only if authorized).
- **Tests/evidence:** provenance checklist, reviewer/Owner identity/date, fixed-temperature match, SOP version/reviewer/approval evidence and raw experimental records. V1 validation remains metric-only; no threshold evidence is required.
- **Exit:** a versioned Project Owner Approved KD record or an explicit documented no-default state, plus a reviewed/approved SOP and reproducible experimental evidence.
- **Dependencies/risks:** default KD evidence and SOP approval remain open; no engineering task may invent values or claim scientific validation.
- **Status:** IN PROGRESS.

## Phase 2 — Engineering foundation

- **Objective:** create reproducible Vite/React/TypeScript baseline.
- **Prerequisites:** `TECH_STACK.md`, Node 22 LTS and pnpm available.
- **Tasks:** scaffold, scripts, strict TS, ESLint/Prettier, Vitest, CI, source folders.
- **Expected files:** `package.json`, lockfile, `src/`, `tests/`, configs, `.github/workflows/ci.yml`.
- **Tests/evidence:** fresh clone install/lint/typecheck/test/build.
- **Exit:** ENG-001/002 acceptance in TODO.
- **Dependencies/risks:** package/version availability; no chemistry code yet.
- **Status:** DONE.

## Phase 3 — Domain models and input boundary

- **Objective:** implement stable types, parser, normalizer and error taxonomy.
- **Prerequisites:** Phase 2, `DATA_MODEL.md`, `INPUT_SPECIFICATION.md`, `ERROR_HANDLING.md`.
- **Tasks:** DOM-001, VAL-001…; unit conversion; provenance warnings; equal/custom allocation.
- **Expected files:** `src/domain/models/`, `src/domain/validation/`, tests/fixtures.
- **Tests/evidence:** T04–T08, parsing/locale edge cases.
- **Exit:** normalized input contract is tested and no UI component owns normalization.
- **Dependencies/risks:** ambiguous locale input; no scientific defaults.
- **Status:** DONE.

## Phase 4 — Pure calculation engine

- **Objective:** implement one-stage and sequential simulation functions.
- **Prerequisites:** Phase 3, `CHEMISTRY_MODEL.md`, `CALCULATION_ENGINE.md`.
- **Tasks:** CALC-001 stage; CALC-002 simulation; CALC-003 invariants/MB; chart/visual plan.
- **Expected files:** `src/domain/calculation/`, engine fixtures.
- **Tests/evidence:** T01–T10, worked reference case, deterministic snapshot.
- **Exit:** engine imports without DOM/React/Firebase/network and returns complete result.
- **Dependencies/risks:** floating precision; regression in field naming.
- **Status:** DONE.

## Phase 5 — Engine verification and contract tests

- **Objective:** prove equations and schema against fixtures.
- **Prerequisites:** Phase 4.
- **Tasks:** property/invariant tests, schema serialization, zero and boundary cases, review against formulas.
- **Expected files:** `tests/domain/`, contract fixture JSON, evidence record.
- **Tests/evidence:** T01–T11 and `TESTING_STRATEGY.md` matrix.
- **Exit:** all domain gates pass; no unapproved constants in source.
- **Dependencies/risks:** numericTolerance misrepresented as validation threshold.
- **Status:** DONE.

## Phase 6 — Application shell and input UI

- **Objective:** create mode shell and accessible InputPanel.
- **Prerequisites:** Phase 2–3; `UI_UX_SPEC.md`.
- **Tasks:** APP-001, UI-001/002; three regions, field errors, split editor, stale state.
- **Expected files:** `src/app/`, `src/pages/`, `src/components/input/`.
- **Tests/evidence:** labels, keyboard, responsive and T18.
- **Exit:** form can produce normalized input but does not calculate locally.
- **Dependencies/risks:** UI drift from input contract.
- **Status:** DONE.

## Phase 7 — Static and dynamic funnel visualization

- **Objective:** implement deterministic SVG geometry and symbolic particles.
- **Prerequisites:** engine result shape, `SIMULATION_VISUAL_SPEC.md`.
- **Tasks:** VIS-001 funnel layers; VIS-002 volume mapping; VIS-003 particle mapping/disclaimers.
- **Expected files:** `src/simulation/visualization/`, SVG tests.
- **Tests/evidence:** T16/T17, zero volume, clipping, reduced motion.
- **Exit:** every visual number maps to a result field; no molecule/physical-time claim.
- **Dependencies/risks:** accessibility and conventional phase interpretation.
- **Status:** DONE.

## Phase 8 — Playback state machine and integration

- **Objective:** render complete result in locked stage sequence.
- **Prerequisites:** Phase 4, 6, 7; `SIMULATION_STATE_MACHINE.md`.
- **Tasks:** SIM-001 reducer; SIM-002 scheduler; controls/timeline; stale/replay integration.
- **Expected files:** `src/simulation/playback/`, playback controls, hooks and reducer tests.
- **Tests/evidence:** T14–T18, transition coverage and result-reference equality.
- **Exit:** Start calculates before animation; pause/speed/restart/reset cannot mutate snapshot.
- **Dependencies/risks:** timer race; reduced-motion behavior.
- **Status:** DONE.

## Phase 9 — Results, table and charts

- **Objective:** expose exact stage/final fields and three accessible charts.
- **Prerequisites:** Phase 4, 6, 8; `RESULTS_AND_CHARTS.md`.
- **Tasks:** OUT-001 ResultPanel; OUT-002 StageTable; OUT-003 three charts/export labels.
- **Expected files:** `src/components/results/`, `src/components/charts/`.
- **Tests/evidence:** T12, chart length/Stage 0 checks, table alternative.
- **Exit:** no chart derives chemistry; units/provenance/warnings visible.
- **Dependencies/risks:** rounding and tooltip mismatch.
- **Status:** NOT STARTED.

## Phase 10 — Scenario comparison

- **Objective:** compare named immutable snapshots on a common basis.
- **Prerequisites:** Phase 9; persistence may remain in memory.
- **Tasks:** COMP-001 names/snapshots; basis mismatch warnings; comparison table/export.
- **Expected files:** `src/pages/ScenarioComparison/`, compare utilities/tests.
- **Tests/evidence:** common/different basis, no “optimal” claim.
- **Exit:** deterministic comparison without recalculation or experimental superiority claim.
- **Dependencies/risks:** version/provenance mismatch.
- **Status:** NOT STARTED.

## Phase 11 — Experimental capture and validation analytics

- **Objective:** manual/CSV capture, audit and metric computation.
- **Prerequisites:** Phase 9; approved SOP/data governance for scientific use.
- **Tasks:** VAL-001 records; CSV preview/atomic import; mean/SD/error metrics; n<3 handling; metric-only report with no PASS/FAIL classification.
- **Expected files:** `src/domain/validation/`, `src/pages/ExperimentalValidation/`, optional adapter.
- **Tests/evidence:** T19–T27 and raw immutability audit.
- **Exit:** reproducible metric-only report under the approved SOP and data governance; no PASS/FAIL classification in V1.
- **Dependencies/risks:** provenance/condition mismatch, approved SOP and privacy; implementation can proceed, but scientific execution waits for those evidence gates.
- **Status:** NOT STARTED.

## Phase 12 — Firebase persistence (optional gate)

- **Objective:** save/load studies only if user need and security review approve.
- **Prerequisites:** Phase 11, Firebase rules/privacy decision.
- **Tasks:** PERSIST-001 converters; rules/emulator; snapshot/audit retention; offline errors.
- **Expected files:** `src/firebase/`, `firestore.rules`, config docs/tests.
- **Tests/evidence:** converter roundtrip, deny-by-default, adapter failure behavior.
- **Exit:** no engine import from Firebase; core works offline.
- **Dependencies/risks:** auth/security/PII; can be deferred.
- **Status:** NOT STARTED.

## Phase 13 — Responsive/accessibility hardening

- **Objective:** verify desktop/tablet/mobile and assistive interaction.
- **Prerequisites:** UI/features complete.
- **Tasks:** keyboard, focus, reduced motion, chart tables, contrast, responsive review.
- **Expected files:** component tests, accessibility checklist/evidence.
- **Tests/evidence:** Playwright viewport runs, manual screen-reader-oriented review.
- **Exit:** no hidden scientific content, no color-only meaning.
- **Dependencies/risks:** chart/funnel complexity.
- **Status:** NOT STARTED.

## Phase 14 — QA and release

- **Objective:** complete regression and deployment readiness.
- **Prerequisites:** phases 5–13 as applicable.
- **Tasks:** full matrix, performance smoke, security review, documentation/progress/handover.
- **Expected files:** CI artifacts, release checklist, updated `PROGRESS.md`.
- **Tests/evidence:** all applicable tests and `git diff --check`; no unapproved constants.
- **Exit:** reproducible clone/build, limitations visible, release claim scoped.
- **Dependencies/risks:** scientific blockers prevent validation claim.
- **Status:** NOT STARTED.

## Critical path

Engineering: `0 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 13 → 14`.

Optional research persistence: `9 → 11 → 12`. Scientific validation: `1 → 11` and remains gated by KD provenance, SOP approval and experimental evidence. Phase 1 does not block engineering phases 2–10; a phase cannot skip its evidence because a later phase has a screen.
