# ALGORITHM SPECIFICATION — BACKEND CALCULATION AUTHORITY

## 1. Service boundary
The calculation engine is a pure deterministic function:

`calculateExtraction(canonicalInput, engineVersion) → SimulationResult | ValidationErrors`

It performs no database I/O, no browser/UI operation, no random generation, no clock lookup, and no display rounding. An API adapter validates identity/provenance, calls the function, saves an optional snapshot, and returns JSON. Frontend never calls formulas itself.

## 2. Input validation sequence
1. Reject missing, nonnumeric, NaN or infinite fields.
2. Require `0≤C0`, `VR>0`, `VS,total>0`, `KD>0`; require integer `N` in [1,10].
3. Validate `splitMode` is `equal` or `custom`.
4. Equal: generate exactly N values `VS,total/N`.
5. Custom: require exactly N finite values each >0 and `abs(sum(VS,i)-VS,total)≤allocationTolerance`.
6. Validate provenance contract from `EQUILIBRIUM_MODEL.md`; emit warnings without changing arithmetic.
7. Convert units only before this function. It receives L and mol/L only.

Errors are an array of `{code, field, message}`. Examples: `INVALID_NUMBER`, `OUT_OF_RANGE`, `INVALID_STAGE_COUNT`, `INVALID_SPLIT_MODE`, `SPLIT_COUNT_MISMATCH`, `SPLIT_TOTAL_MISMATCH`, `INVALID_KD`, `UNAPPROVED_CONSTANT`.

## 3. Calculation pseudocode
```text
create stage[0]: nInput=nR=n0=C0*VR; CR=C0; CE=0; nE=0
previousNR = n0
for i = 1..N:
    VS = stageSolventVolumes[i]
    nInput = previousNR
    denominator = VR + KD*VS
    CR = nInput / denominator
    CE = KD * CR
    nR = CR * VR
    nE = CE * VS
    cumulativeExtracted = n0 - nR
    cumulativeRecovery = n0==0 ? 0 : 100*cumulativeExtracted/n0
    stageRecovery = nInput==0 ? 0 : 100*nE/nInput
    residual = nInput-(nR+nE)
    append immutable stage result
    previousNR = nR
derive final, three chart arrays and visualPlan solely from stage[]
```

Every division denominator is validated positive. Do not reuse formatted output. If an invariant fails after valid inputs, return/record a calculation fault; do not silently clamp values.

## 4. Result construction
Stage array order is 0…N. Stage 0 has no solvent and zero extraction. Each stage i includes canonical input/output quantities, recovery fields and `massBalance{residualMol,relativePercent}`. Final result includes n0, final nR/CR, total extracted amount, final cumulative recovery, N, total solvent, final mass-balance diagnostic. Chart arrays have exactly N+1 points for CR/recovery (including 0) and N points for per-stage extraction.

## 5. Warning/fault behavior
Warnings preserve valid results: user-supplied KD, pending temperature, missing domain, small numeric residual. Errors prevent result creation. A failed result must never be animated. Server logs engine version and a correlation ID, but no personal/external data belongs in the pure result.

## 6. Determinism and precision
Same canonical JSON values and engine version must yield same stage count/order/numbers. `numericTolerance` is a named engineering setting recorded with result metadata and used only for floating point invariants. It is not Decision 17 validation acceptance threshold. Rounding occurs in presentation/export layer only.

## 7. API flow
`POST /api/simulations/calculate`: authenticate/authorize if configured → schema/provenance validation → pure engine → optional snapshot persistence → response. HTTP 422 returns field errors; 200 returns complete scientific snapshot and warnings; unexpected engine fault returns a non-scientific server error with correlation ID. No endpoint should return only a final number because visual/UI require stage data.

## 8. Minimum test fixtures
Cover zero solute; N boundaries 1/10; invalid numbers/KD/N; equal/custom equivalence; wrong custom count/sum; per-stage algebra/conservation; monotonic raffinate; deterministic re-run; complete stage/charts; warning/error separation. Fixture numbers are explicitly user-supplied test data, never default KD evidence.
