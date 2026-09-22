# PROGRESS

## Current authoritative state

This repository contains the completed documentation baseline and merged Phase 2–8 engineering work. Phase 3–8 were fast-forwarded to `main` on 2026-09-22 after sequential local verification; GitHub Actions `Lint, typecheck, test and build` succeeded for integrated SHA `5db4390`. No database, approved numeric KD record or experimental record exists yet. V1 scientific decisions B01–B04 remain governed by the Project Owner: fixed 25 °C, default-KD product direction with value/provenance still open, metric-only validation with no PASS/FAIL threshold, and SOP construction/review/approval before scientific validation.

## Phase ledger

| Phase | Status | Evidence / reason |
|---|---|---|
| 0 Documentation hardening | DONE | authority map, browser-first correction, implementation-ready contracts and second-pass checks completed |
| 1 Scientific readiness | IN PROGRESS | B01 and B03 resolved; SCI-001 default-KD evidence and SOP-001 review/approval remain open |
| 2 Engineering foundation | DONE | PR #1 merged as `046c6a9`; foundation CI check passed on GitHub |
| 3 Domain models/input | DONE | merged to `main` as `2c2e927`; 48 local tests and integrated CI at `5db4390` passed |
| 4 Pure calculation engine | DONE | merged to `main` as `a65e432`; 55 local tests and integrated CI at `5db4390` passed |
| 5 Engine verification | DONE | merged to `main` as `ddda2ad`; 66 local tests and integrated CI at `5db4390` passed |
| 6 Application shell/input UI | DONE | merged to `main` as `59381ec`; 72 local tests and integrated CI at `5db4390` passed |
| 7 SVG visualization | DONE | merged to `main` as `7984508`; 83 local tests, 9/9 E2E and integrated CI at `5db4390` passed |
| 8 Playback state machine | DONE | merged to `main` as `5db4390`; 92 local tests, 9/9 E2E and integrated CI passed |
| 9 Results/table/charts | IN PROGRESS | current-stage fields, final-state summary, Stage 0…N table and three immutable engine-dataset charts implemented locally; review/CI pending |
| 10 Scenario comparison | IN PROGRESS | named immutable in-memory snapshots, basis mismatch warnings and accessible comparison table implemented locally; review/CI pending |
| 11 Experimental capture/analytics | IN PROGRESS | local immutable manual/CSV capture and metric-only analytics implemented; review/CI and scientific evidence gates pending |
| 12 Firebase persistence | NOT STARTED | optional gate not approved/implemented |
| 13 Responsive/accessibility | NOT STARTED | phase-wide hardening and assistive review remain pending |
| 14 QA/release | NOT STARTED | release gate has not been executed |

## Hardening session evidence — 2026-09-19

- Audited root, Git branch/remote/history, Markdown, README and `assets/reference/`.
- Read the 2188-line Owner hardening instruction and all current repository Markdown before editing.
- Corrected architecture: pure browser engine is authority; no required calculation backend/API; Firebase is Hosting/optional persistence.
- Added authority map, architecture, technology, chemistry, input, calculation engine, state machine, results/charts, error, experimental and testing contracts; expanded README and execution backlog.
- Existing pre-session worktree deletion `Documentation_Dot1_Five_Core_Specifications.zip` remains unstaged and untouched.
- Checks performed: 31 Markdown files (README + 30 docs), required-doc assertions, internal-link scan (0 broken), duplicate TODO-ID scan (0), contradiction/field-name scan and `git diff --check` all pass. No automated tests exist yet because no package/test scaffold exists.

## Repository publication follow-up — 2026-09-19

- Project Owner explicitly authorized publishing the remaining worktree state. The obsolete legacy source ZIP deletion is included so the repository has one canonical documentation tree under `docs/` rather than a duplicate archive.

## Owner decision synchronization — 2026-09-20

- B01 recorded as fixed V1 temperature `25 °C`; temperature is no longer a pending blocker.
- B02 product decision recorded: V1 supports a default KD, but no numeric value/provenance was invented; `SCI-001` remains open.
- B03 recorded as metric-only V1 behavior; no PASS/FAIL threshold or acceptance classification is defined.
- B04 recorded as an SOP strategy decision; `SOP-001` remains open until a versioned SOP is reviewed and approved.
- Phase 0 remains `DONE`; Phase 1 is `IN PROGRESS`. Phase 1 no longer blocks engineering phases 2–10.

## Engineering foundation — 2026-09-20 (uncommitted branch evidence)

- On `codex/phase-2-engineering-foundation`, added the React 19/TypeScript/Vite shell, Node 22 `.nvmrc`, pnpm lockfile/workspace settings, strict TypeScript, ESLint flat config, Prettier, Vitest/Testing Library smoke test, Playwright configuration/smoke test, and GitHub Actions CI.
- The shell is intentionally neutral and contains no calculation, scientific input, Firebase/Firestore integration, default KD, scientific dataset, or PASS/FAIL behavior.
- Local verification passed: `pnpm install --frozen-lockfile`, `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- CI is configured with Node `22.16.0` and pnpm `10.27.0`; it runs frozen install, format, lint, typecheck, unit tests, and build without Firebase credentials. CI execution and review remain required before Phase 2 can be marked `DONE`.

## Engineering foundation publication — 2026-09-21

- Phase 2 commit `0984da2` was merged by PR #1 into `main` as merge commit `046c6a9`.
- The GitHub CI check passed; Phase 2 is now `DONE`.

## Domain/input boundary — 2026-09-21 (uncommitted branch evidence)

- Added canonical readonly TypeScript contracts for input, provenance, errors/warnings, result snapshots, UI state and experimental records under `src/domain/models/`.
- Added finite-number parsing with dot/comma/scientific-notation handling, explicit mL-to-L boundary conversion, equal/custom solvent allocation, provenance gates, fixed-V1-temperature validation and immutable normalized input under `src/domain/validation/`.
- Added software-only fixtures and tests for typed schema shape, stage/chart lengths, parsing, stage-count 1–10 boundaries, invalid/non-finite input, custom split count/value/sum, warnings and approved-reference gating.
- Local evidence: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (48/48) and `pnpm build` all pass.
- No calculation algorithm, production UI, Firebase/deploy integration, numeric default KD, reference data, validation threshold or SOP approval was added. DOM-001 and VAL-001 remain `IN PROGRESS` pending review/CI.

## Next action

Phase 3–8 are complete. Phase 9 remains `NOT STARTED` and is out of scope for this integration session.

## Pure calculation engine — 2026-09-21 (uncommitted branch evidence)

- On `codex/phase-4-calculation-engine`, added a pure deterministic calculation entry point under `src/domain/calculation/`. It consumes the Phase 3 normalized-input contract, defensively rejects invalid direct callers, creates immutable Stage 0…N, final summary, chart contracts and visual-plan inputs, and retains validation warnings/provenance in a valid result.
- Unit coverage maps T01–T10: zero solute, 1/10 stages, defensive invalid-stage/KD paths, boundary validation, equal/custom equivalence, the documented software reference fixture, mass-balance/KD-ratio invariants, determinism and input immutability.
- The documented fixture KD remains software-test-only. V1 temperature is validated as the Owner-declared `25 °C` condition; no numeric KD default, reference dataset, validation threshold, SOP approval, PASS/FAIL classification, React/UI, Firebase, network or deployment code was added.
- Local verification passed: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (55/55) and `pnpm build`. CALC-001 through CALC-003 and Phase 4 remain `IN PROGRESS` pending review/CI; this evidence does not mark them `DONE`.

## Engine verification — 2026-09-21 (uncommitted branch evidence)

- Added `tests/domain/engineContract.test.ts` and enabled `tests/**/*.test.{ts,tsx}` in Vitest/TypeScript discovery. The suite verifies serialized Stage 0…N shape, final/chart derivation, concentration/amount/fraction/mass-balance relationships, zero and 1/10-stage boundaries, ordered custom split/product oracle, warning/provenance propagation, byte determinism, caller-input isolation and deep immutable result containers.
- Regression review found and fixed two defensive gaps: a direct caller could forge an unsupported `splitMode` or KD `sourceType` and still calculate. The engine now rejects unsupported split modes, KD provenance source types and malformed validity-domain notes before arithmetic.
- Local verification passed: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (66/66) and `pnpm build`. `git diff --check` remains part of the pre-commit gate.
- No equation, unit, numeric KD default, reference dataset, scientific threshold, experimental classification, React/UI, Firebase, network or deployment behavior changed. Phase 5 remains `IN PROGRESS` pending review/CI.

## Application shell and input UI — 2026-09-21 (uncommitted branch evidence)

- Added a responsive single-simulation shell with desktop/tablet/mobile grid order, semantic regions, visible focus styles and reduced-motion CSS. SVG visualization, playback, result tables and charts remain explicitly deferred.
- Added an accessible Vietnamese input panel for C0, feed/solvent volumes with L/mL selectors, stage count 1–10, equal/custom split rows, KD value/source/provenance, optional validity domain and the read-only Owner-declared 25 °C V1 condition. No KD value or source is prefilled.
- Added `applyVolumeUnitsAtBoundary` so displayed mL values are parsed and converted to L exactly once inside domain validation. React passes raw form values to this boundary and invokes the existing pure calculation entry point; it contains no chemistry equation.
- Added component tests for semantic rendering, keyboard submit, field errors/focus, boundary warnings, mL conversion, stage boundaries, equal/custom split, valid/invalid/stale/reset states. Local verification passes: format, lint, typecheck, 72/72 unit/component tests and production build.
- Playwright smoke test was updated for the Phase 6 shell, but Chromium is not installed in the local Playwright cache, so E2E execution is not Phase 6 failure evidence. UI-001, UI-002 and Phase 6 remain `IN PROGRESS` pending review/CI and later visual QA.
- No Firebase, deploy, SVG funnel, playback state machine, result charts, numeric KD default, reference data, scientific threshold, PASS/FAIL or “real-time” claim was added.

## SVG visualization — 2026-09-21 (uncommitted branch evidence)

- Added a responsive `640×720` SVG separatory-funnel renderer with clip path, outline/stopcock, patterned and labelled nominal aqueous/organic phases, stage caption and deterministic symbolic AcOH particles. The component receives only an immutable `SimulationResult` plus selected stage; it contains no chemistry equation and performs no recalculation.
- Added software-only volume-to-height, particle allocation and deterministic-position mappings under `src/simulation/visualization/`. Stage fractions and capacity come from `VisualPlan`; zero solute creates zero particles, Stage 0 has no organic layer, and nonzero allocations sum to the plan capacity.
- Added keyboard-focusable accessible naming, persistent scientific disclaimers, a text legend, a per-stage table alternative, contrast patterns and reduced-motion CSS. Phase 7 provides static stage selection only; playback/state machine remains deferred.
- Unit/component evidence covers monotonic/zero volume mapping, phase bounds, particle allocation, deterministic coordinates, clipping, stage mapping, invalid stage and zero-solute behavior. Local checks pass with 83/83 unit/component tests and production build.
- Playwright Chromium was installed to the user cache only. Desktop Chrome, Pixel 5 and reduced-motion projects pass the shell and valid-input visualization smoke tests, including visible SVG/table alternative, responsive width and no horizontal page overflow. Browser binaries and generated test artefacts are not repository files.
- Manual desktop browser inspection found phase labels clipped at the SVG right edge; the labels were anchored inside the viewBox with a contrast stroke and rechecked visually with no clipping or text/particle overlap.
- No timeline, playback controls, charts, scenario comparison, Firebase/deploy, numeric KD default, reference data, scientific threshold, PASS/FAIL or “real-time” claim was added. VIS-001/VIS-002 and Phase 7 remain `IN PROGRESS` pending review/CI and broader visual QA.

## Playback integration — 2026-09-21 (uncommitted branch evidence)

- Added a serializable pure playback reducer for IDLE/READY, the documented stage choreography, PAUSED, COMPLETED, STALE and ERROR. `CALCULATION_READY` validates Stage 0…N before storing the immutable result; playback events retain the same result reference and never invoke chemistry calculations.
- Added a controlled one-shot scheduler, presentation-speed controls (0.5×/1×/2×), Start/Pause/Resume/Next Stage/Restart controls, live status text, keyboard-native buttons and reduced-motion handling. Input edits mark the prior result stale and remove the visualization/playback until recalculation.
- Reducer/component coverage maps T14–T18, including the transition matrix, 1/10-stage boundaries, zero-concentration traversal, fake-timer pause behavior, result-reference equality, numerical snapshot immutability and invalid/stale guards.
- Local verification passed: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (92/92), `pnpm build` and `git diff --check`. Playwright passed 9/9 checks across desktop Chromium, Pixel 5 and reduced-motion projects, covering keyboard focus, controls, stale invalidation, responsive SVG width and page overflow. Phase 8 and SIM-001/SIM-002 remain `IN PROGRESS` pending review/CI.
- No chart, scenario comparison, Firebase/deploy, numeric KD default, reference dataset, threshold, PASS/FAIL classification or additional scientific assumption was added.

## Phase 3–8 integration audit — 2026-09-22

- Confirmed the chain is linear and each phase branch contains `origin/main` Phase 2 plus its immediate predecessor: `2c2e927` → `a65e432` → `ddda2ad` → `59381ec` → `7984508` → `5db4390`.
- Ran `pnpm install --frozen-lockfile`, `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `git diff --check` at each phase SHA. Test totals were 48, 55, 66, 72, 83 and 92 respectively; all passed.
- Fast-forwarded each verified phase into `main`, ran regression tests after every merge, and pushed `main` from `046c6a9` to `5db4390`. Phase 8 Playwright passed 9/9 across desktop Chromium, Pixel 5 and reduced-motion projects.
- The public GitHub Actions check `Lint, typecheck, test and build` for `5db4390` completed with `success`: https://github.com/Quangbk47/nhom-chiet/actions/runs/35698086793/job/106649359498. Phase 3–8 are therefore `DONE`.

## Result table and charts — 2026-09-22 (uncommitted branch evidence)

- Added `ResultPanel`, `StageTable` and `ResultCharts`. They read direct fields and chart arrays from one immutable `SimulationResult`; React/Recharts do not import or invoke the calculation engine.
- The 11-column table retains Stage 0 and all zero values, labels canonical units and has a keyboard-focusable horizontal-scroll region. Current-stage fields include KD/temperature/model provenance and warnings; the final summary appears only at playback `COMPLETED`.
- The three charts use the engine-owned `raffinateConcentration`, `cumulativeRecovery` and `extractedPerStage` arrays by reference. Animation is disabled; each chart includes axis units, provenance text and a visible table alternative. Stale, invalid and error states do not show a prior result as current.
- Local evidence: `pnpm install --frozen-lockfile`, `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (98/98), `pnpm build` and `git diff --check` pass. The production build reports a non-failing Vite warning that the Recharts bundle exceeds 500 kB after minification; code splitting remains a future optimization decision.
- Playwright evidence and GitHub CI are pending before Phase 9 can be marked `DONE`. No scenario comparison, Firebase/deploy, CSV capture, KD default/reference data, threshold, PASS/FAIL or optimization claim was added.

## Scenario comparison — 2026-09-22 (uncommitted branch evidence)

- Added a local-only named-snapshot store and accessible comparison panel on `codex/phase-10-scenario-comparison`. Each saved entry retains the existing immutable canonical input and `SimulationResult`; renaming/removing creates a new collection and the UI does not invoke the calculation engine.
- The comparison table exposes C0, VR, total solvent, stage count, solvent split, KD source/reference, declared temperature, final concentration/recovery/extracted amount and saved warnings. It warns explicitly when a scenario differs in input basis or KD/temperature provenance, and makes no ranking, `PASS`/`FAIL` or experimental-superiority claim.
- Stale, invalid and error current results cannot be saved; stored snapshots remain identifiable as prior immutable records. Unit/component coverage includes snapshot immutability, add/rename/remove, basis mismatch and stale guards. Browser coverage exercises create, stale guard, comparison warning and delete across desktop, mobile and reduced-motion projects.
- Phase 10 and COMP-001 remain `IN PROGRESS` pending review and CI. No Firebase, CSV capture, deploy, numeric KD default, reference data, threshold or new scientific assumption was added.

## Experimental capture and analytics — 2026-09-22 (uncommitted branch evidence)

- Added immutable local manual/CSV experimental capture on `codex/phase-11-experimental-validation`. CSV requires the documented headers, validates finite nonnegative `mol/L` values, existing simulation stages and duplicate condition/replicate/stage keys; invalid imports return all errors and add no partial rows.
- Added metric-only per-stage mean, sample SD, AE, RE, MAE and RMSE display, including zero-denominator behavior and `INSUFFICIENT_INDEPENDENT_REPLICATES`. The UI displays exactly the validation threshold-pending status and does not state PASS/FAIL, validated or optimal.
- Captures retain source, canonical unit, UTC entry timestamp and notes. A stale/invalid/error simulation cannot accept or present a linked current validation result. Synthetic fixture values are test-only and not experimental evidence.
- Phase 11, EXP-001 and EXP-002 remain `IN PROGRESS` pending review/CI. Scientific validation remains blocked by SOP-001 approval, SCI-001 provenance/default decision and real approved-SOP experimental evidence.

## Update protocol

At session end record changed task/phase, evidence links, tests/checks, unresolved blockers, next action and publication commit SHA. Never change a phase to DONE because a document or screen merely exists.
