# PROGRESS

## Current authoritative state

This repository contains the completed documentation baseline and the merged Phase 2 engineering foundation. Phase 3 domain/input work, Phase 4 calculation engine and Phase 5 contract verification exist on their descendant review branches; none is merged or marked complete before review/CI. No production UI, database, approved numeric KD record or experimental record exists yet. V1 scientific decisions B01–B04 remain governed by the Project Owner: fixed 25 °C, default-KD product direction with value/provenance still open, metric-only validation with no PASS/FAIL threshold, and SOP construction/review/approval before scientific validation.

## Phase ledger

| Phase | Status | Evidence / reason |
|---|---|---|
| 0 Documentation hardening | DONE | authority map, browser-first correction, implementation-ready contracts and second-pass checks completed |
| 1 Scientific readiness | IN PROGRESS | B01 and B03 resolved; SCI-001 default-KD evidence and SOP-001 review/approval remain open |
| 2 Engineering foundation | DONE | PR #1 merged as `046c6a9`; foundation CI check passed on GitHub |
| 3 Domain models/input | IN PROGRESS | canonical models, parser, normalization, typed validation, fixtures and tests implemented locally; review/CI pending |
| 4 Pure calculation engine | IN PROGRESS | pure deterministic engine and T01–T10 unit coverage implemented on Phase 4 branch; review/CI pending |
| 5 Engine verification | IN PROGRESS | serialized contract/regression suite passes locally; review/CI pending |
| 6 Application shell/input UI | NOT STARTED | no source code |
| 7 SVG visualization | NOT STARTED | no source code |
| 8 Playback state machine | NOT STARTED | no source code |
| 9 Results/table/charts | NOT STARTED | no source code |
| 10 Scenario comparison | NOT STARTED | no source code |
| 11 Experimental capture/analytics | NOT STARTED | engineering can proceed; scientific execution awaits approved SOP, KD provenance and experiment evidence |
| 12 Firebase persistence | NOT STARTED | optional gate not approved/implemented |
| 13 Responsive/accessibility | NOT STARTED | no UI |
| 14 QA/release | NOT STARTED | no app to release |

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

Review the Phase 3 domain/input-boundary diff on `codex/phase-3-domain-input`. Phase 4 is permitted on its descendant branch but neither Phase 3 nor Phase 4 is `DONE` before review/CI evidence.

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

## Update protocol

At session end record changed task/phase, evidence links, tests/checks, unresolved blockers, next action and publication commit SHA. Never change a phase to DONE because a document or screen merely exists.
