# PROGRESS

## Current authoritative state

This repository contains a completed documentation baseline and a published documentation-hardening pass. No production application source, package manifest, calculation engine, UI, database, approved numeric KD record or experimental record exists yet. V1 scientific decisions B01–B04 are recorded: fixed 25 °C, default-KD product direction with value/provenance still open, metric-only validation with no PASS/FAIL threshold, and SOP construction/review/approval before scientific validation. Documentation completion does not mean application completion.

## Phase ledger

| Phase | Status | Evidence / reason |
|---|---|---|
| 0 Documentation hardening | DONE | authority map, browser-first correction, implementation-ready contracts and second-pass checks completed |
| 1 Scientific readiness | IN PROGRESS | B01 and B03 resolved; SCI-001 default-KD evidence and SOP-001 review/approval remain open |
| 2 Engineering foundation | NOT STARTED | stack documented; no `package.json`/CI/scaffold |
| 3 Domain models/input | NOT STARTED | no source code |
| 4 Pure calculation engine | NOT STARTED | no source code |
| 5 Engine verification | NOT STARTED | no test runner/fixtures |
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

## Next action

Next engineering action remains `ENG-001` only: Vite/React/TypeScript scaffold and CI/tooling; do not implement chemistry in that task. The publication commit for this decision-sync change is recorded after the final commit is created.

## Update protocol

At session end record changed task/phase, evidence links, tests/checks, unresolved blockers, next action and publication commit SHA. Never change a phase to DONE because a document or screen merely exists.
