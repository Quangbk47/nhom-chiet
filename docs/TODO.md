# TODO — EXECUTION BACKLOG

Status values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`. Each task below is intentionally executable by a student without chat history.

## Scientific decisions and remaining evidence

| ID | Owner decision | Current status | Remaining evidence |
|---|---|---|---|
| B01 | V1 fixed temperature is 25 °C | DONE | Apply/verify the fixed value in every V1 condition |
| B02 | V1 supports a default KD, with user override | IN PROGRESS | SCI-001 must produce a provenance-complete 25 °C record or document the no-default state |
| B03 | V1 is metric-only; no PASS/FAIL threshold | DONE | Keep all reports metric-only; no threshold may be invented |
| B04 | Build and approve a laboratory SOP before scientific validation | IN PROGRESS | SOP-001 draft, review and approval evidence |

### SCI-001 — Establish default KD at 25 °C

- **Phase/Priority/Status:** 1 / P0 / IN PROGRESS.
- **Dependencies:** system/convention definition, suitable literature or experimental source and Project Owner/scientific reviewer availability.
- **Objective:** create a provenance-complete candidate and review it for the AcOH–water–EtOAc system at 25 °C without inventing a numeric value.
- **Files:** `REFERENCE_DATA.md`, approved reference record only after evidence exists, `EXPERT_DECISIONS.md` if scope changes.
- **Instructions:** record `CE/CR` convention, concentration basis, exact 25 °C condition, domain, method, citation/raw-data pointer, uncertainty, limitations, reviewer and Owner approval. Until approved, keep user-supplied KD only.
- **Tests/evidence:** reference-data checklist; identity/unit/convention/temperature/domain review; reviewer and Owner identity/date; no unapproved KD in source.
- **Acceptance criteria:** either a versioned `Project Owner Approved` record is selectable as the default, or an explicit documented no-default decision is recorded; no unsupported numeric value is added.
- **Definition of Done:** record and provenance review are committed with evidence, or the no-default decision is committed; `git diff --check` is clean.

### SOP-001 — Draft, review and approve the laboratory SOP

- **Phase/Priority/Status:** 1 / P0 / IN PROGRESS.
- **Dependencies:** fixed V1 temperature 25 °C; qualified technical reviewer/lab approver; SDS, safety and local waste requirements.
- **Objective:** produce a versioned SOP for AcOH–water–EtOAc extraction that can govern scientific data collection.
- **Files:** `EXPERIMENTAL_PROTOCOL.md` as the planning contract; a future versioned SOP artifact only when authored and approved.
- **Instructions:** cover chemicals, equipment, sample preparation, phase volumes, contact/mixing, settling/separation, sampling, AcOH assay/titration, independent replicates, raw data/provenance, 25 °C operation, PPE, waste, result forms and deviations. Do not invent unapproved operating parameters.
- **Tests/evidence:** completeness checklist; technical review; Project Owner/lab approval; version/date/approver recorded; pilot or execution evidence only after approval.
- **Acceptance criteria:** the SOP is versioned, reviewed and explicitly approved for the stated scope; approval evidence is linked; Phase 11 can use it without guessing.
- **Definition of Done:** approved SOP and evidence are committed, or the task remains open with each missing review item explicit; no claim of scientific validation is made early.

## ENG — foundation

### ENG-001 — Scaffold Vite React TypeScript

- **Phase/Priority/Status:** 2 / P0 / DONE.
- **Dependencies:** none; read `TECH_STACK.md`, preserve pre-existing ZIP deletion.
- **Objective:** create a minimal browser app with reproducible install/build scripts, not chemistry.
- **Create:** `package.json`, lockfile, `index.html`, `src/app/App.tsx`, `src/main.tsx`, `src/styles/`, `.nvmrc` or tool-version file.
- **Modify:** `README.md` only if actual commands differ; `PROGRESS.md`.
- **Instructions:** Node 22 LTS, pnpm, strict TypeScript, Vite, simple shell page. Do not add backend server/Firebase Auth.
- **Tests:** install, lint, typecheck, Vitest placeholder, build on fresh clone.
- **Acceptance:** all scripts in TECH_STACK run; domain folder can be imported without React; no scientific constants.
- **DoD/evidence:** commit, CI log, command output linked in progress.

### ENG-002 — Configure lint, format, test and CI

- **Phase/Priority/Status:** 2 / P0 / DONE.
- **Dependencies:** ENG-001.
- **Objective:** enforce strict, readable changes.
- **Create:** ESLint flat config, Prettier config, Vitest config, `.github/workflows/ci.yml`.
- **Modify:** `package.json`, `TECH_STACK.md` if commands change.
- **Tests:** lint/typecheck/test/build in CI on pull request; no Firebase credentials.
- **Acceptance:** CI fails on type/lint/test/build failure; format check is deterministic; no Docker requirement.

## DOM — domain contracts

### DOM-001 — Implement canonical TypeScript models

- **Phase/Priority/Status:** 3 / P0 / DONE.
- **Dependencies:** ENG-001.
- **Create:** `src/domain/models/input.ts`, `result.ts`, `errors.ts`, `provenance.ts`.
- **Instructions:** copy names/nullability from `DATA_MODEL.md`; `StageResult` has one canonical extracted-amount field; use readonly result arrays.
- **Tests:** compile fixture, schema shape, stage/chart lengths.
- **Acceptance:** no UI/Firebase import; versioned field names match docs exactly.

### VAL-001 — Parse and normalize input

- **Phase/Priority/Status:** 3 / P0 / DONE.
- **Dependencies:** DOM-001, `INPUT_SPECIFICATION.md`.
- **Create:** `src/domain/validation/parseInput.ts`, `normalizeInput.ts`, `validateInput.ts`.
- **Instructions:** trim/reject empty, finite numbers only, allow scientific notation, handle unambiguous decimal separator, convert mL once, validate provenance and equal/custom split.
- **Tests:** T04–T08, locale/copy-paste/Infinity/NaN cases.
- **Acceptance:** returns typed errors/warnings; never invents KD/temp/default or silently drops custom rows.

## CALC — pure engine

### CALC-001 — Implement `calculateStage`

- **Phase/Priority/Status:** 4 / P0 / DONE.
- **Dependencies:** DOM-001, VAL-001, `CHEMISTRY_MODEL.md`, `CALCULATION_ENGINE.md`.
- **Create:** `src/domain/calculation/calculateStage.ts`.
- **Inputs:** stage index, incoming amount, VR, VS,i, KD, n0; all canonical numbers.
- **Output:** complete `StageResult` including fractions, recovery and mass balance.
- **Tests:** one-stage equation, zero incoming, KD ratio and conservation.
- **Acceptance:** pure deterministic function; no rounding/clamping/React/Firebase.

### CALC-002 — Implement `calculateSimulation`

- **Phase/Priority/Status:** 4 / P0 / DONE.
- **Dependencies:** CALC-001, DOM-001.
- **Create:** `src/domain/calculation/calculateSimulation.ts`, `charts.ts`, `visualPlan.ts`.
- **Instructions:** create stage 0, generate/evaluate split, loop 1…N with full-precision prior nR, derive final/charts/visual plan and freeze result.
- **Tests:** T01–T04, T07, T09, T10; reference table.
- **Acceptance:** stages exactly N+1; chart arrays exact lengths; warnings/provenance retained; no network.

### CALC-003 — Invariant and numeric diagnostics

- **Phase/Priority/Status:** 4 / P0 / DONE.
- **Dependencies:** CALC-002.
- **Create:** `src/domain/calculation/assertInvariants.ts`, numeric tolerance constants.
- **Instructions:** use named engineering tolerance; report stage index/details; never present tolerance as validation threshold.
- **Tests:** conservation, nonnegative/monotonic/range, overflow fault.
- **Acceptance:** valid result never silently clamped; fault has no animation result.

### TEST-001 — Verify engine and serialized result contract

- **Phase/Priority/Status:** 5 / P0 / DONE.
- **Dependencies:** CALC-001 through CALC-003, `TEST_PLAN.md`, `DATA_MODEL.md`.
- **Create/modify:** `tests/domain/engineContract.test.ts`, Vitest/TypeScript test discovery, minimal engine corrections proven by regression tests.
- **Instructions:** verify Stage 0…N, final/chart derivation, serialization, provenance/warnings, equations, mass balance, zero/boundary cases, custom ordering, determinism, deep immutability and defensive direct-call invariants.
- **Tests:** T01–T11 domain-applicable contract coverage; exclude visual/UI assertions until those phases exist.
- **Acceptance:** all domain checks pass; no React/Firebase/network import, unapproved scientific constant, display rounding or experimental PASS/FAIL threshold enters the engine.

## UI / visual / state

### UI-001 — Build three-region application shell

- **Phase/Priority/Status:** 6 / P1 / DONE.
- **Dependencies:** ENG-001, `UI_UX_SPEC.md`.
- **Create:** `src/pages/SingleSimulation/`, layout CSS, mode tabs.
- **Tests:** responsive order, labels, empty/error/stale states.
- **Acceptance:** desktop 3-column and tablet/mobile stacking match spec; no chemistry code in components.

### UI-002 — Build InputPanel and split editor

- **Phase/Priority/Status:** 6 / P1 / DONE.
- **Dependencies:** VAL-001, UI-001.
- **Create:** `src/components/input/InputPanel.tsx`, `SplitEditor.tsx`, error summary.
- **Tests:** keyboard, unit labels/converter, custom N rows, provenance warnings.
- **Acceptance:** Start invokes boundary only; edits mark result stale; exact Vietnamese error copy.

### VIS-001 — Implement funnel SVG layers

- **Phase/Priority/Status:** 7 / P1 / DONE.
- **Dependencies:** DOM-001, `SIMULATION_VISUAL_SPEC.md`.
- **Create:** `src/simulation/visualization/FunnelSVG.tsx`, geometry helpers and tests.
- **Instructions:** defs/clipPath/outline/neck/layers/interface/particles/stopcock/labels/overlay; viewBox 640×720.
- **Tests:** clipping, responsive viewBox, conventional labels and reduced motion.
- **Acceptance:** no physical color/interface claim; all labels use props from result/state.

### VIS-002 — Implement volume and particle mappings

- **Phase/Priority/Status:** 7 / P1 / DONE.
- **Dependencies:** VIS-001, CALC-002.
- **Create:** `volumeToHeight.ts`, `particleMapping.ts`.
- **Algorithm:** normalize by max(VR,VS), clamp; `round(P*fractionExtracted)` and complement; deterministic positions.
- **Edge cases/tests:** zero/large volume, clipping, C0=0, counts sum capacity, monotonic height.
- **Acceptance:** uses this-stage fraction, never cumulative recovery or rounded labels.

### SIM-001 — Implement playback reducer

- **Phase/Priority/Status:** 8 / P1 / DONE.
- **Dependencies:** CALC-002, VIS-001, `SIMULATION_STATE_MACHINE.md`.
- **Create:** `src/simulation/playback/playbackMachine.ts`, events/types/transition tests.
- **Tests:** T14/T15/T18, every state/guard, stale/error, cursor range.
- **Acceptance:** all results precomputed before START; pause/speed/restart/reset preserve result reference.

### SIM-002 — Connect controls, timeline and scheduler

- **Phase/Priority/Status:** 8 / P1 / DONE.
- **Dependencies:** SIM-001, UI-001.
- **Create:** playback scheduler hook and controls; timeline remains part of later result presentation.
- **Tests:** keyboard controls, reduced motion, Next Stage skips visuals without recalculation.
- **Acceptance:** exact stage order, visible status text and disabled control rules.

## OUT — results

### OUT-001 — Build result panel/final card

- **Phase/Priority/Status:** 9 / P1 / IN PROGRESS.
- **Dependencies:** CALC-002, UI-001, `RESULTS_AND_CHARTS.md`.
- **Create:** `CurrentResult.tsx`, `FinalResultCard.tsx`, warning/status components.
- **Tests:** field mapping, units, stage 0, provenance/stale/final states.
- **Acceptance:** no independently computed scientific number.

### OUT-002 — Build stage table

- **Phase/Priority/Status:** 9 / P1 / IN PROGRESS.
- **Dependencies:** OUT-001.
- **Create:** `StageTable.tsx`, export/accessibility alternative.
- **Tests:** exact columns/order, stage 0, canonical precision/units.
- **Acceptance:** every row maps one StageResult; zeros not hidden.

### OUT-003 — Build three charts

- **Phase/Priority/Status:** 9 / P1 / IN PROGRESS.
- **Dependencies:** CALC-002, OUT-002.
- **Create:** `src/components/charts/` Recharts wrappers.
- **Tests:** T12/chart lengths/tooltip units/empty state/table alternative.
- **Acceptance:** CR and recovery N+1 points; extracted N points; no chemistry formulas.

## COMP / VAL / PERSIST

### COMP-001 — Named scenario comparison

- **Phase/Priority/Status:** 10 / P2 / IN PROGRESS.
- **Dependencies:** OUT-003.
- **Create:** comparison page/store and common-basis checker.
- **Tests:** equal/different basis, immutable snapshots, warning/no “optimal” wording.
- **Acceptance:** comparison reads stored results only.

### EXP-001 — Experimental manual/CSV capture

- **Phase/Priority/Status:** 11 / P2 / IN PROGRESS.
- **Dependencies:** DOM-001, OUT-002, `EXPERIMENTAL_VALIDATION.md`.
- **Create:** validation page, CSV parser/preview, normalized record functions.
- **Tests:** T19–T21, duplicate/all-or-nothing/raw audit.
- **Acceptance:** ≥3 independent replicate warning; selected run/provenance visible.

### EXP-002 — Validation analytics

- **Phase/Priority/Status:** 11 / P2 / IN PROGRESS.
- **Dependencies:** EXP-001.
- **Create:** mean/SD/error functions and report components.
- **Tests:** T22–T25, zero denominator and metric-only wording.
- **Acceptance:** metric-only report, exact `V1 METRIC-ONLY` wording, no PASS/FAIL and no KD fitting.

### PERSIST-001 — Optional Firestore adapter

- **Phase/Priority/Status:** 12 / P3 / NOT STARTED (GATED).
- **Dependencies:** EXP-001/EXP-002 and an explicit security/privacy decision or Owner approval.
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
