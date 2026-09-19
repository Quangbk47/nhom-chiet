# TODO — EXECUTION BACKLOG

Status values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`. Each task below is intentionally executable by a student without chat history.

## Scientific blockers

| ID | Decision | Blocker/evidence needed |
|---|---|---|
| B01 | Fixed V1 temperature | Owner approves literature/lab temperature or explicitly keeps user-KD-only |
| B02 | Default KD/source/domain | Complete Approved reference or explicit no-default decision |
| B03 | Validation threshold/rule | Owner sets scope, value/unit and undefined RE handling |
| B04 | Lab SOP/safety | Lab approves apparatus, titration endpoint, contact/settling, PPE/waste |

## ENG — foundation

### ENG-001 — Scaffold Vite React TypeScript

- **Phase/Priority/Status:** 2 / P0 / NOT STARTED.
- **Dependencies:** none; read `TECH_STACK.md`, preserve pre-existing ZIP deletion.
- **Objective:** create a minimal browser app with reproducible install/build scripts, not chemistry.
- **Create:** `package.json`, lockfile, `index.html`, `src/app/App.tsx`, `src/main.tsx`, `src/styles/`, `.nvmrc` or tool-version file.
- **Modify:** `README.md` only if actual commands differ; `PROGRESS.md`.
- **Instructions:** Node 22 LTS, pnpm, strict TypeScript, Vite, simple shell page. Do not add backend server/Firebase Auth.
- **Tests:** install, lint, typecheck, Vitest placeholder, build on fresh clone.
- **Acceptance:** all scripts in TECH_STACK run; domain folder can be imported without React; no scientific constants.
- **DoD/evidence:** commit, CI log, command output linked in progress.

### ENG-002 — Configure lint, format, test and CI

- **Phase/Priority/Status:** 2 / P0 / NOT STARTED.
- **Dependencies:** ENG-001.
- **Objective:** enforce strict, readable changes.
- **Create:** ESLint flat config, Prettier config, Vitest config, `.github/workflows/ci.yml`.
- **Modify:** `package.json`, `TECH_STACK.md` if commands change.
- **Tests:** lint/typecheck/test/build in CI on pull request; no Firebase credentials.
- **Acceptance:** CI fails on type/lint/test/build failure; format check is deterministic; no Docker requirement.

## DOM — domain contracts

### DOM-001 — Implement canonical TypeScript models

- **Phase/Priority/Status:** 3 / P0 / NOT STARTED.
- **Dependencies:** ENG-001.
- **Create:** `src/domain/models/input.ts`, `result.ts`, `errors.ts`, `provenance.ts`.
- **Instructions:** copy names/nullability from `DATA_MODEL.md`; `StageResult` has one canonical extracted-amount field; use readonly result arrays.
- **Tests:** compile fixture, schema shape, stage/chart lengths.
- **Acceptance:** no UI/Firebase import; versioned field names match docs exactly.

### VAL-001 — Parse and normalize input

- **Phase/Priority/Status:** 3 / P0 / NOT STARTED.
- **Dependencies:** DOM-001, `INPUT_SPECIFICATION.md`.
- **Create:** `src/domain/validation/parseInput.ts`, `normalizeInput.ts`, `validateInput.ts`.
- **Instructions:** trim/reject empty, finite numbers only, allow scientific notation, handle unambiguous decimal separator, convert mL once, validate provenance and equal/custom split.
- **Tests:** T04–T08, locale/copy-paste/Infinity/NaN cases.
- **Acceptance:** returns typed errors/warnings; never invents KD/temp/default or silently drops custom rows.

## CALC — pure engine

### CALC-001 — Implement `calculateStage`

- **Phase/Priority/Status:** 4 / P0 / NOT STARTED.
- **Dependencies:** DOM-001, VAL-001, `CHEMISTRY_MODEL.md`, `CALCULATION_ENGINE.md`.
- **Create:** `src/domain/calculation/calculateStage.ts`.
- **Inputs:** stage index, incoming amount, VR, VS,i, KD, n0; all canonical numbers.
- **Output:** complete `StageResult` including fractions, recovery and mass balance.
- **Tests:** one-stage equation, zero incoming, KD ratio and conservation.
- **Acceptance:** pure deterministic function; no rounding/clamping/React/Firebase.

### CALC-002 — Implement `calculateSimulation`

- **Phase/Priority/Status:** 4 / P0 / NOT STARTED.
- **Dependencies:** CALC-001, DOM-001.
- **Create:** `src/domain/calculation/calculateSimulation.ts`, `charts.ts`, `visualPlan.ts`.
- **Instructions:** create stage 0, generate/evaluate split, loop 1…N with full-precision prior nR, derive final/charts/visual plan and freeze result.
- **Tests:** T01–T04, T07, T09, T10; reference table.
- **Acceptance:** stages exactly N+1; chart arrays exact lengths; warnings/provenance retained; no network.

### CALC-003 — Invariant and numeric diagnostics

- **Phase/Priority/Status:** 4 / P0 / NOT STARTED.
- **Dependencies:** CALC-002.
- **Create:** `src/domain/calculation/assertInvariants.ts`, numeric tolerance constants.
- **Instructions:** use named engineering tolerance; report stage index/details; never present tolerance as validation threshold.
- **Tests:** conservation, nonnegative/monotonic/range, overflow fault.
- **Acceptance:** valid result never silently clamped; fault has no animation result.

## UI / visual / state

### UI-001 — Build three-region application shell

- **Phase/Priority/Status:** 6 / P1 / NOT STARTED.
- **Dependencies:** ENG-001, `UI_UX_SPEC.md`.
- **Create:** `src/pages/SingleSimulation/`, layout CSS, mode tabs.
- **Tests:** responsive order, labels, empty/error/stale states.
- **Acceptance:** desktop 3-column and tablet/mobile stacking match spec; no chemistry code in components.

### UI-002 — Build InputPanel and split editor

- **Phase/Priority/Status:** 6 / P1 / NOT STARTED.
- **Dependencies:** VAL-001, UI-001.
- **Create:** `src/components/input/InputPanel.tsx`, `SplitEditor.tsx`, error summary.
- **Tests:** keyboard, unit labels/converter, custom N rows, provenance warnings.
- **Acceptance:** Start invokes boundary only; edits mark result stale; exact Vietnamese error copy.

### VIS-001 — Implement funnel SVG layers

- **Phase/Priority/Status:** 7 / P1 / NOT STARTED.
- **Dependencies:** DOM-001, `SIMULATION_VISUAL_SPEC.md`.
- **Create:** `src/simulation/visualization/FunnelSVG.tsx`, geometry helpers and tests.
- **Instructions:** defs/clipPath/outline/neck/layers/interface/particles/stopcock/labels/overlay; viewBox 640×720.
- **Tests:** clipping, responsive viewBox, conventional labels and reduced motion.
- **Acceptance:** no physical color/interface claim; all labels use props from result/state.

### VIS-002 — Implement volume and particle mappings

- **Phase/Priority/Status:** 7 / P1 / NOT STARTED.
- **Dependencies:** VIS-001, CALC-002.
- **Create:** `volumeToHeight.ts`, `particleMapping.ts`.
- **Algorithm:** normalize by max(VR,VS), clamp; `round(P*fractionExtracted)` and complement; deterministic positions.
- **Edge cases/tests:** zero/large volume, clipping, C0=0, counts sum capacity, monotonic height.
- **Acceptance:** uses this-stage fraction, never cumulative recovery or rounded labels.

### SIM-001 — Implement playback reducer

- **Phase/Priority/Status:** 8 / P1 / NOT STARTED.
- **Dependencies:** CALC-002, VIS-001, `SIMULATION_STATE_MACHINE.md`.
- **Create:** `src/simulation/state-machine/reducer.ts`, events/types/transition tests.
- **Tests:** T14/T15/T18, every state/guard, stale/error, cursor range.
- **Acceptance:** all results precomputed before START; pause/speed/restart/reset preserve result reference.

### SIM-002 — Connect controls, timeline and scheduler

- **Phase/Priority/Status:** 8 / P1 / NOT STARTED.
- **Dependencies:** SIM-001, UI-001.
- **Create:** controls hook/components and timeline.
- **Tests:** keyboard controls, reduced motion, Next Stage skips visuals without recalculation.
- **Acceptance:** exact stage order, visible status text and disabled control rules.

## OUT — results

### OUT-001 — Build result panel/final card

- **Phase/Priority/Status:** 9 / P1 / NOT STARTED.
- **Dependencies:** CALC-002, UI-001, `RESULTS_AND_CHARTS.md`.
- **Create:** `CurrentResult.tsx`, `FinalResultCard.tsx`, warning/status components.
- **Tests:** field mapping, units, stage 0, provenance/stale/final states.
- **Acceptance:** no independently computed scientific number.

### OUT-002 — Build stage table

- **Phase/Priority/Status:** 9 / P1 / NOT STARTED.
- **Dependencies:** OUT-001.
- **Create:** `StageTable.tsx`, export/accessibility alternative.
- **Tests:** exact columns/order, stage 0, canonical precision/units.
- **Acceptance:** every row maps one StageResult; zeros not hidden.

### OUT-003 — Build three charts

- **Phase/Priority/Status:** 9 / P1 / NOT STARTED.
- **Dependencies:** CALC-002, OUT-002.
- **Create:** `src/components/charts/` Recharts wrappers.
- **Tests:** T12/chart lengths/tooltip units/empty state/table alternative.
- **Acceptance:** CR and recovery N+1 points; extracted N points; no chemistry formulas.

## COMP / VAL / PERSIST

### COMP-001 — Named scenario comparison

- **Phase/Priority/Status:** 10 / P2 / NOT STARTED.
- **Dependencies:** OUT-003.
- **Create:** comparison page/store and common-basis checker.
- **Tests:** equal/different basis, immutable snapshots, warning/no “optimal” wording.
- **Acceptance:** comparison reads stored results only.

### EXP-001 — Experimental manual/CSV capture

- **Phase/Priority/Status:** 11 / P2 / NOT STARTED.
- **Dependencies:** DOM-001, OUT-002, `EXPERIMENTAL_VALIDATION.md`.
- **Create:** validation page, CSV parser/preview, normalized record functions.
- **Tests:** T19–T21, duplicate/all-or-nothing/raw audit.
- **Acceptance:** ≥3 independent replicate warning; selected run/provenance visible.

### EXP-002 — Validation analytics

- **Phase/Priority/Status:** 11 / P2 / NOT STARTED.
- **Dependencies:** EXP-001.
- **Create:** mean/SD/error functions and report components.
- **Tests:** T22–T25, zero denominator and threshold pending.
- **Acceptance:** metric-only report, exact NOT EVALUATED wording, no KD fitting.

### PERSIST-001 — Optional Firestore adapter

- **Phase/Priority/Status:** 12 / P3 / NOT STARTED (GATED).
- **Dependencies:** EXP-001/EXP-002, security/privacy decision B04 or Owner approval.
- **Create:** `src/firebase/` converters, rules/emulator config only after gate.
- **Tests:** snapshot roundtrip, raw append-only, offline/error, deny-by-default.
- **Acceptance:** engine remains importable/offline; no animation-frame writes.

## QA / release

### QA-001 — Full accessibility, responsive and release gate

- **Phase/Priority/Status:** 13–14 / P1 / NOT STARTED.
- **Dependencies:** feature tasks applicable to MVP.
- **Create/modify:** CI artifacts, release checklist, `PROGRESS.md`, `HANDOVER.md`.
- **Tests:** full T01–T27, Playwright viewports, keyboard/reduced-motion/manual review, `git diff --check`.
- **Acceptance:** fresh clone commands work, no unapproved constants, limitations/provenance visible, evidence linked.

## Definition of Done for every task

Implementation and tests exist; authoritative docs are unchanged or updated consistently; no unrelated worktree file is staged; `git diff --check` passes; progress includes evidence and blocker; commit is reviewable. Scientific claims require the Owner gates above.
