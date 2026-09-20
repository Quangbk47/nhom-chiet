# ALGORITHM SPECIFICATION — PURE BROWSER CALCULATION

## 1. Service boundary

`calculateSimulation(normalizedInput, engineOptions)` is a pure deterministic domain function. It is the V1 scientific authority and can run in a browser with no network. React, Firebase and playback timers consume its immutable result but never reproduce its equations. See `CALCULATION_ENGINE.md` for the full implementation contract.

## 2. Validation sequence

1. Reject missing, empty, nonnumeric, `NaN`, infinite or unknown fields at the boundary.
2. Require finite `C0≥0`, `VR>0`, `VS,total>0`, `KD>0`, integer `N∈[1,10]`.
3. Require `splitMode` equal/custom.
4. Equal mode generates exactly N `VS,total/N` values.
5. Custom mode requires exactly N finite positive values and sum within `allocationToleranceL`.
6. Validate KD/temperature provenance contract and produce warnings where allowed.
7. Convert mL to L before entering this function; no units are guessed here.

Expected field errors are `{ code, field, message }`; errors prevent result creation. Warnings travel with a valid result.

## 3. Sequential calculation

```text
create stage 0: nInput=nR=n0=C0*VR; CR=C0; CE=0; nE=0; recovery=0
previousNR = n0
for i = 1..N:
  nInput = previousNR
  VS = stageSolventVolumes[i]
  CR = nInput / (VR + KD*VS)
  CE = KD*CR
  nR = CR*VR
  nE = CE*VS
  cumulativeExtracted = n0-nR
  cumulativeRecovery = n0==0 ? 0 : 100*cumulativeExtracted/n0
  stageRecovery = nInput==0 ? 0 : 100*nE/nInput
  residual = nInput-(nR+nE)
  append StageResult and assert invariants
  previousNR = nR
derive final, chart arrays and visualPlan from stages only
freeze result
```

## 4. Result shape requirements

Stage order is exactly `0…N`. Stage 0 has zero extraction. `final` is a read-only summary derived from the last stage. `charts.cr` and `charts.recovery` have N+1 points including stage 0; `charts.extracted` has N points for stages 1…N. Every result contains warnings, engine version, canonical input, provenance and named numeric tolerance.

## 5. Error/warning behavior

Errors: invalid input, unsupported model, numeric overflow/non-finite intermediate, or failed invariant. Never return a partial result. Warnings: user-supplied KD, missing domain note, or a small numerical residual within the engineering tolerance. The result is metric-only and a warning is never an experimental acceptance classification.

## 6. Determinism

Same normalized JSON and engine version produce identical stage order and values within the language's deterministic floating-point behavior. No current time, random ID, locale formatting or database state enters the result. Formatting/export occurs outside the engine.

## 7. Future adapter rule

A worker, server endpoint or Firestore persistence adapter may call this function but must not implement another algorithm or become a required network dependency. Any such adapter is an integration detail and must be covered by equality tests against pure-engine output.
