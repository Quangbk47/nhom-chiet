# EXPERIMENTAL VALIDATION — APPLICATION CONTRACT

## Purpose and separation

Software validation asks whether the engine preserves equations, invariants and deterministic snapshots. Scientific/experimental validation asks whether measured raffinate AcOH concentrations agree with a model under the same declared condition. Passing software tests never proves the chemistry model.

## Condition and run matching

A validation condition links one saved `SimulationResult` to a condition record containing system identity, C0, VR, N, ordered VS list, temperature metadata, KD value/source/domain, protocol version and deviations. A comparison is valid only when those fields match or the UI explicitly flags a mismatch. No condition is pooled silently.

## Measured data schema

One independent complete extraction run has one `replicateId` and one `CR` observation per stage. Repeat titrations from one raffinate are supporting raw observations, not independent extraction replicates. Required fields are in `DATA_MODEL.md`; manual and CSV input normalize to the same schema. Raw burette/dilution/standardization records should be retained when available.

## Metrics

For model prediction `p` and included experimental mean `o` at one stage:

```text
AE = abs(p - o)                         [mol/L]
RE% = 100*AE/abs(o) when o != 0
RE% = 0 when o == 0 and p == 0
RE% = undefined/null when o == 0 and p != 0
MAE = sum(AE)/m                         [mol/L]
RMSE = sqrt(sum((p-o)^2)/m)             [mol/L]
```

`m` counts valid included pairs only. Report excluded/undefined pairs. Sample SD is `sqrt(sum((x-mean)^2)/(n-1))` and is null when n<2. Compliance requires at least 3 independent replicates per condition; n<3 is `INSUFFICIENT_INDEPENDENT_REPLICATES`, not scientific failure.

## UI/report outputs

Per condition/stage: model CR, raw values, included/excluded IDs, n, mean, sample SD, AE, RE and notes. Overall: m, MAE, RMSE, engine/schema version, KD reference/status, fixed 25 °C status, mismatch warnings and metric-only evaluation mode. Plot model line against experimental mean with SD error bars only where valid.

V1 has no acceptance threshold by design. Show exactly `V1 METRIC-ONLY — no PASS/FAIL acceptance threshold is defined.`; never derive PASS/FAIL, “đạt” or “không đạt” from MAE/RMSE or mass-balance tolerance.

## Integrity and investigation

Raw observations are append-only. Corrections supersede with reason/actor/time; exclusions remain visible. Do not tune KD to lower current error. Investigate mismatch in this order: condition identity, units, fixed 25 °C condition, provenance domain, solvent handling, titration/standardization, phase handling, constant-KD limitation and transcription. A split-solvent conclusion requires both simulation and independent experiment under the approved SOP and remains metric-only.
