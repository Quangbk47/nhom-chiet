# CALCULATION ENGINE — PURE DOMAIN IMPLEMENTATION CONTRACT

## 1. Authority and service boundary

The pure calculation engine is the scientific source of truth for V1. It runs in the browser but is not part of React, Firebase or an animation timer. The required entry point is:

```ts
calculateSimulation(
  input: NormalizedSimulationInput,
  options: EngineOptions,
): CalculationResult
```

It performs no I/O, no clock lookup, no random generation, no database query and no display rounding. A future server or worker may call the same pure module, but no duplicate algorithm may exist there. `ALGORITHM_SPEC.md` is a compact compatibility reference; this file is the implementation hand-off.

## 2. Canonical types and software constants

- Concentration: `mol/L`.
- Phase/feed volume: `L`.
- AcOH amount: `mol`.
- KD: dimensionless, finite and `> 0`.
- Stages: integer `1…10`.
- `numericTolerance`: named engineering tolerance for floating-point invariant checks, not scientific validation acceptance.
- `allocationToleranceL = max(1e-12, 1e-9 * totalSolventVolumeL)` for custom split sum comparison. This is a software boundary tolerance, not a Project Owner threshold.
- `engineVersion`: explicit string such as `constant-kd-engine@0.1.0`; never inferred from current date.

No numeric default KD, concentration domain or validation acceptance threshold is defined here. V1 input temperature is the Owner-approved fixed standard 25 °C; this engine does not model temperature dependence.

## 3. Input precondition

`calculateSimulation` accepts only normalized numbers from `INPUT_SPECIFICATION.md`. It rechecks defensive invariants so direct callers cannot bypass validation:

```text
finite(C0), C0 >= 0
finite(VR), VR > 0
finite(VS,total), VS,total > 0
integer(N), 1 <= N <= 10
finite(KD), KD > 0
temperature.status == declared and temperature.valueC == 25
all VS,i finite and > 0
sum(VS,i) matches total within allocationToleranceL
modelId == constant-kd-v1
provenance contract is structurally complete
```

The engine returns typed errors instead of throwing for expected invalid input. An unexpected invariant failure is a `NUMERIC_ERROR` and creates no result.

## 4. Stage derivation

At stage `i`, `nInputMol` is the previous aqueous raffinate amount. With fresh solvent:

```text
denominator = VR + KD * VS,i
CR           = nInputMol / denominator
CE           = KD * CR
nR           = CR * VR
nE           = CE * VS,i
residual     = nInputMol - (nR + nE)
```

Derived fields:

```text
fractionRemaining = nInputMol == 0 ? 0 : nR / nInputMol
fractionExtracted = nInputMol == 0 ? 0 : nE / nInputMol
cumulativeExtractedMol = n0 - nR
cumulativeRecoveryPercent = n0 == 0 ? 0 : 100 * cumulativeExtractedMol / n0
stageRecoveryPercent = nInputMol == 0 ? 0 : 100 * nE / nInputMol
massBalance.relativePercent = nInputMol == 0
  ? 0
  : 100 * abs(residual) / abs(nInputMol)
```

Do not calculate a displayed rounded CR and reuse it. Stage `i+1` receives full-precision `nR` from stage `i`.

## 5. Equal and custom allocation

Equal split builds exactly N volumes:

```text
VS,i = totalSolventVolumeL / N
```

Custom split uses the supplied ordered list unchanged after positive/count/sum checks. The sum may differ only within `allocationToleranceL`; the engine preserves the supplied values and records the canonical total. No zero-volume dummy stage is allowed.

## 6. Required stage 0

Stage 0 is a real result record, not a placeholder omitted from charts:

```text
nInputMol = n0 = C0 * VR
crMolPerL = C0
ceMolPerL = 0
nRaffinateMol = n0
nExtractedMol = 0
cumulativeExtractedMol = 0
cumulativeRecoveryPercent = 0
stageRecoveryPercent = 0
solventVolumeL = 0 or null by the serialized contract
mass balance = 0 residual / 0 percent
```

Use one representation (`0` is recommended for numeric chart mapping) consistently with `DATA_MODEL.md`; tables render an em dash for “not applicable” concentration if desired.

## 7. Pseudocode

```text
function calculateSimulation(input, options):
  defensiveValidate(input)
  volumes = input.splitMode == 'equal'
    ? repeat(input.totalSolventVolumeL / input.stageCount, input.stageCount)
    : copy(input.stageSolventVolumesL)
  n0 = input.c0MolPerL * input.feedVolumeL
  stages = [makeStage0(input, n0)]
  previousNR = n0

  for index from 1 to input.stageCount:
    VS = volumes[index - 1]
    denominator = input.feedVolumeL + input.kd.value * VS
    if not finite(denominator) or denominator <= 0:
      return error(NUMERIC_ERROR, index)
    stage = calculateStage({
      index,
      nInputMol: previousNR,
      feedVolumeL: input.feedVolumeL,
      solventVolumeL: VS,
      kd: input.kd.value,
      initialAmountMol: n0,
    })
    assertStageInvariants(stage, previousNR, options.numericTolerance)
    stages.push(freeze(stage))
    previousNR = stage.nRaffinateMol

  result = makeResult(input, stages, options.engineVersion)
  assertSimulationInvariants(result, options.numericTolerance)
  return freeze(result with warnings, charts, visualPlan)
```

## 8. Invariants and faults

For valid positive inputs, each stage must satisfy:

- `CR, CE, nR, nE >= 0` and finite;
- `abs(nInput - nR - nE)` is within `numericTolerance`-scaled engineering check;
- `nR` never increases;
- cumulative extracted and recovery never decrease and remain `[0, n0]` / `[0,100]`;
- when `CR > 0`, `CE / CR` is approximately KD;
- stage array length is `N + 1`, chart lengths are specified in `RESULTS_AND_CHARTS.md`;
- custom and equal lists preserve total solvent by input contract.

Never clamp a bad result into a plausible range. Return a calculation fault with stage index and diagnostic values. A warning for a small residual may accompany a valid result; the engineering tolerance is not an experimental acceptance threshold or PASS/FAIL classification.

## 9. Worked software reference case

This is a **REFERENCE SOFTWARE TEST**, not experimental evidence:

```text
C0 = 0.50 mol/L, VR = 0.100 L, VS,total = 0.080 L
KD = 2.0 (user supplied), N = 4, equal split VS = 0.020 L
q = 0.100 / (0.100 + 2*0.020) = 5/7
n0 = 0.050 mol
```

| Stage | CR (mol/L) | CE (mol/L) | nR (mol) | nE this stage (mol) | cumulative extracted (mol) | cumulative recovery |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 0.500000000000 | 0 | 0.050000000000 | 0 | 0 | 0% |
| 1 | 0.357142857143 | 0.714285714286 | 0.035714285714 | 0.014285714286 | 0.014285714286 | 28.5714285714% |
| 2 | 0.255102040816 | 0.510204081633 | 0.025510204082 | 0.010204081633 | 0.024489795918 | 48.9795918367% |
| 3 | 0.182215743440 | 0.364431486880 | 0.018221574344 | 0.007288629738 | 0.031778425656 | 63.5568513120% |
| 4 | 0.130154102457 | 0.260308204914 | 0.013015410246 | 0.005206164098 | 0.036984589754 | 73.9691795086% |

Floating-point assertions compare with the named tolerance, while fixtures retain enough digits to catch rounded-reuse bugs. The KD value above is a test fixture only and must never become a project default.

## 10. API wording migration

There is no required `/api/simulations/calculate` endpoint in V1. A future adapter may expose this function, but it must delegate to the same module and cannot become a second authority. UI errors are local typed errors; optional Firestore persistence stores snapshots after calculation.
