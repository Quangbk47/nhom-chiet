# ROADMAP
## Phase 0 — Documentation baseline (DONE)
Deliverables: authoritative decisions, calculation/process/API/UI/data/validation/test specs, handover. Exit: all required docs reviewed; PENDING values not invented; progress updated.

## Phase 1 — Scientific readiness (BLOCKED)
Tasks: identify KD literature candidates; review convention/system/units/temperature/domain; Owner approves fixed temperature, default KD/citation/domain/version or explicitly keeps default unavailable; Owner approves validation threshold/aggregation; laboratory approves detailed SOP/safety. Exit: versioned Approved reference records and threshold rule. Software may still use labelled user KD before this phase.

## Phase 2 — Engineering foundation (NOT STARTED)
Tasks: inspect repository; select documented stack (do not assume Firebase); configure formatting/lint/tests/CI; define engine/API/schema versioning; contributor workflow. Exit: fresh clone setup/test command and architecture decision record.

## Phase 3 — Pure calculation engine (NOT STARTED)
Tasks: canonical input types; validation; equal/custom split; stage 0 and sequential constant-KD calculation; result/chart/visual-plan output; invariant checks; T01–T10 fixtures. Exit: deterministic database-free engine, all T01–T10 pass, no default KD/temperature in source.

## Phase 4 — Backend/API authority (NOT STARTED)
Tasks: calculate endpoint; field errors; provenance/reference gate; immutable result response; correlation logging; compare API and pure-engine outputs. Dependency: Phase 3. Exit: complete stage JSON; unapproved constant rejected/user KD warned; T11 pass.

## Phase 5 — Single simulation UI (NOT STARTED)
Tasks: three-region desktop/stacked mobile; input/unit/split editor; API submission/loading/error/stale states; stage table/final card; 3 graphs/accessibility alternatives; warnings. Dependency: Phase 4. Exit: T12/T13/T18; no browser science calculation.

## Phase 6 — Visual simulation (NOT STARTED)
Tasks: SVG/funnel; immutable playback state machine; result-bound labels/particles/heights; controls; reduced motion/keyboard; replay tests. Dependency: Phase 5. Exit: T14–T17; no animation-time scientific claim.

## Phase 7 — Scenario comparison (NOT STARTED)
Tasks: named snapshots, common-basis checks, comparison tables/charts/export, mismatch warning. Exit: reproducible scenarios; no “optimal” claim.

## Phase 8 — Persistence/experimental capture (NOT STARTED)
Tasks: migrations; immutable runs/references/conditions/replicates; manual data; CSV preview/all-or-nothing import; correction/exclusion audit. Exit: T19–T21/T26 and retained raw data.

## Phase 9 — Validation analytics (NOT STARTED)
Tasks: mean/sample SD/AE/RE/MAE/RMSE; zero handling; n<3 rule; model-vs-mean±SD; threshold status. Dependency: Phase 8. Exit: T22–T25; PENDING rule shows NOT EVALUATED.

## Phase 10 — Experimental validation (BLOCKED)
Tasks: execute approved SOP; ≥3 independent extraction replicates per condition; verify solvent split experimentally; import/audit; investigate deviations without KD fitting. Dependencies: Phase 1, 8, 9. Exit: reproducible raw dataset, report and Owner review (negative result is valid).

## Phase 11 — Release/handover (NOT STARTED)
Tasks: full regression; security/deployment review after stack selection; update all docs/progress/TODO/handover; commit/push/tag. Exit: evidence complete; fresh contributor setup works; release makes no unapproved validation claim.

## Critical path
Engineering: 0→2→3→4→5→6→8→9→11. Scientific validation: 1→10→11. A phase is DONE only with exit evidence; a completed task does not auto-complete its phase.
