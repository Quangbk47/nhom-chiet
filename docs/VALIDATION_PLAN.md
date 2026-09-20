# VALIDATION PLAN

## Objective and comparison population

Primary comparison is pure-engine predicted `CR,i` against experimental mean `CR̄,i` at the same condition/stage. A valid pair matches system, stage, C0, VR, ordered solvent allocation, temperature metadata, KD provenance/model and inclusion status. Do not pool incompatible conditions. Recovery is secondary and must document its experimental derivation.

## Replicate summary

For included independent values `xj`:

```text
mean = sum(xj)/n
sample SD = sqrt(sum((xj-mean)^2)/(n-1)), n>=2 only
```

Store n, included/excluded IDs, mean, SD and raw records. n<3 is `INSUFFICIENT_INDEPENDENT_REPLICATES`; it can be explored but cannot meet the V1 design.

## Error metrics

```text
AE = abs(prediction - mean) [mol/L]
RE% = 100*AE/abs(mean) when mean != 0
RE% = 0 when mean == 0 and prediction == 0
RE% = undefined when mean == 0 and prediction != 0
MAE = sum(AE)/m
RMSE = sqrt(sum((prediction-mean)^2)/m)
```

Report which pairs are undefined/excluded; never substitute an arbitrary denominator.

## Required outputs

Per condition/stage table: model CR, raw values, n, mean, SD, AE, RE, inclusion flag and notes. Overall: m, MAE, RMSE, condition metadata, engine/schema version, KD status, fixed-temperature status and metric-only evaluation mode. Graph model line vs mean with SD error bars where valid.

## V1 metric-only governance

V1 deliberately has no validation acceptance threshold or PASS/FAIL classification. Show `V1 METRIC-ONLY — no PASS/FAIL acceptance threshold is defined.` alongside the reported AE, RE, MAE and RMSE. Never derive an acceptance claim from MAE/RMSE or floating-point mass-balance tolerance. A future product version would require a new Owner decision and specification before adding any classification.

## Investigation

Preserve snapshots and raw points. Check condition mismatch, unit conversion, the fixed 25 °C condition, KD convention/domain, phase-volume assumption, solvent/raffinate handling, titration standardization and constant-KD limitations. Do not tune KD just to lower current error. A split comparison needs both simulation and independent experiment under the approved SOP; it remains a metric comparison, not a PASS/FAIL decision.
