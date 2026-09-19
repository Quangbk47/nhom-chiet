# VALIDATION PLAN

## 1. Objective and comparison population
The primary comparison is model-predicted `CR,i` against experimental mean `CRbar,i` at the same condition and stage. A valid pair requires matching system, stage number, C0, VR, solvent allocation, temperature metadata, model/KD provenance and inclusion status. Do not pool incompatible conditions. Secondary recovery comparison must state how experimental recovery was calculated.

## 2. Replicate summary
For n included independent CR observations `xj` at one condition/stage:

`mean = Σxj/n`

`sample SD = sqrt(Σ(xj−mean)^2/(n−1))`, valid only n≥2.

Compliance requires n≥3. UI stores n, included/excluded IDs, mean, SD and raw records. A condition with n<3 can be explored but carries `INSUFFICIENT_INDEPENDENT_REPLICATES` and cannot meet V1 validation design.

## 3. Error metrics
For prediction p and experimental mean o: `AE=abs(p−o)` mol/L. `RE%=100×AE/abs(o)` when o≠0. If o=0 and p=0, RE=0; if o=0 and p≠0, RE is undefined—not Infinity, not a substituted denominator. Across m valid pairs: `MAE=ΣAE/m`; `RMSE=sqrt(Σ(p−o)^2/m)`. Report which pairs were excluded/undefined.

## 4. Required validation outputs
Per condition/stage table: model CR, raw replicate values, n, mean, SD, AE, RE, inclusion flag and notes. Overall: count m, MAE, RMSE, condition metadata, engine version, KD reference/status, temperature status, and threshold status. Graph uses stage x-axis and model line plus experimental mean and SD error bars where valid.

## 5. Acceptance governance
Decision 17 intentionally leaves numerical threshold and aggregation rule PENDING. Until Owner approval, app reports `NOT EVALUATED — acceptance threshold pending`; it may never derive PASS/FAIL from MAE/RMSE or a floating-point mass-balance tolerance. Owner must choose threshold scope (per-stage, per-condition aggregate, both), value/unit, handling of undefined RE, and approval/version date.

## 6. Investigation workflow
When discrepancy exists, preserve result then assess: condition mismatch; temperature; KD source/domain; constant-KD limitation; phase-volume assumption; solvent/raffinate handling; titration method/standardization; transcription/unit conversion. Do not erase points because they are inconvenient. Split-solvent comparisons require both simulation and independently executed experiment before scientific conclusion.
