# TEST PLAN

## 1. Evidence standard
Every test records ID, requirement/decision, fixture, expected result, actual result, engine/UI version, executor, date and issue link. Tests below are minimum; failed/blocked is evidence, not deletion.

## 2. Calculation engine tests
| ID | Fixture/action | Expected |
|---|---|---|
| T01 | C0=0 valid inputs | N stages; all amounts/concentrations/recovery zero |
| T02/T03 | N=1/N=10 | accepted exact number stage records |
| T04 | N=0,11,noninteger | field error |
| T05 | KD 0/negative/nonfinite | field error |
| T06 | negative/nonfinite C/volumes | field error |
| T07 | equal vs same custom list | same results within numeric tolerance |
| T08 | wrong custom count/sum/zero | field error |
| T09 | valid fixture every stage | equations, KD ratio and conservation hold |
| T10 | identical re-run | deterministic output |

## 3. Integration/visual tests
T11 API contains stage 0…N and required fields. T12 table/labels/charts equal returned fields. T13 browser has no independent scientific formula path. T14 all results exist before Start. T15 pause/resume/next/reset/speed cannot mutate snapshot. T16 particles sum P and map calculated fraction. T17 disclaimer/accessibility text appears. T18 stale input prevents presentation of old result as current.

## 4. Data/validation tests
T19 manual and valid CSV normalize identically. T20 invalid CSV preview + all-or-nothing save. T21 duplicate replicate rejected. T22 mean/SD/AE/RE/MAE/RMSE hand fixtures match. T23 zero experimental denominator handled as defined. T24 n<3 marked insufficient. T25 threshold pending cannot show PASS/FAIL. T26 raw observation correction audit retained. T27 approved/unapproved KD provenance gate works.

## 5. Release test gate
Run all applicable automated tests plus manual visual/accessibility tests. Confirm all 30 decisions mapped, no pending constant inserted, documentation/progress updated and result exports preserve units/provenance. Scientific validation phase cannot pass until approved conditions, threshold and experiment evidence exist.
