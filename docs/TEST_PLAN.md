# TEST PLAN — REQUIRED EVIDENCE IDS

Every evidence row records ID, requirement, fixture/action, expected, actual, code/schema version, executor/date and issue/commit. Failed or blocked cases remain visible.

## Domain engine T01–T10

| ID | Fixture/action | Expected |
|---|---|---|
| T01 | C0=0, valid positive volumes/KD | N+1 records; all amounts/concentrations/recoveries/particles zero |
| T02 | N=1 | exactly stages 0 and 1 |
| T03 | N=10 | exactly 11 records and N chart rules |
| T04 | N=0, 11, noninteger, nonfinite | `INVALID_STAGE_COUNT` |
| T05 | KD 0, negative, NaN, Infinity | `INVALID_KD` |
| T06 | negative/nonfinite C0/volumes | field validation errors |
| T07 | equal vs same custom list | snapshots equal within numeric tolerance |
| T08 | wrong custom count/sum/zero | specific split errors; no partial result |
| T09 | reference software case | equations, KD ratio, conservation, monotonicity hold |
| T10 | identical normalized rerun | deterministic byte-equivalent numeric result |

## UI/visual/state T11–T18

| ID | Action | Expected |
|---|---|---|
| T11 | valid calculation | complete SimulationResult with stages 0…N, final, charts, provenance |
| T12 | inspect table/cards/charts | every value equals returned field; no duplicate formula |
| T13 | static code/import review | React/Firebase do not own chemistry |
| T14 | press Start | all stage results exist before first animation state |
| T15 | pause/resume/next/restart/reset/speed | result JSON unchanged; cursor rules exact |
| T16 | particle mapping | counts sum capacity and use this-stage fraction; C0=0 zero |
| T17 | accessibility | labels, units, disclaimer, keyboard/reduced motion/text captions |
| T18 | edit after success | stale state; old result cannot appear current |

## Data/validation T19–T27

| ID | Action | Expected |
|---|---|---|
| T19 | manual and valid CSV same rows | identical normalized ExperimentalStageData |
| T20 | invalid CSV | preview all row errors; all-or-nothing save |
| T21 | duplicate condition/replicate/stage | rejected without overwrite |
| T22 | metric hand fixtures | mean/sample SD/AE/RE/MAE/RMSE match |
| T23 | measured zero | RE=0 when prediction zero; undefined/null otherwise |
| T24 | n<3 | `INSUFFICIENT_INDEPENDENT_REPLICATES`, not PASS/FAIL |
| T25 | threshold pending | exact NOT EVALUATED message; no PASS/FAIL |
| T26 | correction/exclusion | raw record and audit reason retained |
| T27 | KD provenance | Approved gate rejects missing record; user KD warns |

## Release gate

Run applicable Vitest/Testing Library/Playwright checks, review responsive/accessibility manually, check `git diff --check`, scan source for unapproved constants, verify docs/progress/evidence and confirm no persistence feature bypasses the adapter boundary. Scientific validation cannot be marked complete without approved condition, threshold and experiment evidence.
