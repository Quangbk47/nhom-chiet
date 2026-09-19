# EXPERT DECISIONS — PROJECT OWNER AUTHORITATIVE BASELINE

This file is the binding V1 baseline. It intentionally distinguishes locked decisions from values still PENDING. A decision locks behavior; it does not authorize inventing missing scientific data.

| ID | Decision | Required implementation behavior |
|---:|---|---|
| 01 | Engine concentration unit is mol/L. | API/result/database use mol/L; conversion is only a labelled boundary feature. |
| 02 | Main V1 equilibrium is constant `KD=CE/CR`. | Use one algebraic stage model, not equilibrium curve/CFD. |
| 03 | Approved default KD plus user override. | Override persists as `user_supplied`; default unavailable until approved. |
| 04 | One fixed study temperature. | Temperature value is PENDING; no 20/25 °C default. |
| 05 | Phase-volume change negligible. | Use `VR=Vfeed`, `VE=VS,i`; exclude contraction/mutual solubility. |
| 06 | Equal and custom solvent allocation. | Equal `VS,total/N`; custom list is validated. |
| 07 | 1–10 stages. | Reject N outside inclusive range. |
| 08 | Calculate all before animation. | Immutable results precede any playback. |
| 09 | “Real-time” means dynamic visual representation. | Never state animation seconds are laboratory duration. |
| 10 | AcOH particles are semi-quantitative. | Map calculated fractions to symbolic particles; no molecule claim. |
| 11 | Specific temperature PENDING until suitable KD source. | Reference gate blocks approved constant. |
| 12 | KD source: literature + experimental verification/adjustment. | Adjustment must be traceable/reviewed; no silent curve fitting. |
| 13 | V1 assay: acid–base titration. | Protocol/data fields support titration-derived CR. |
| 14 | Primary validation: raffinate CR. | Per-stage CR comparison is required; recovery secondary. |
| 15 | Manual and CSV experimental input. | Both normalize to same persisted schema. |
| 16 | Errors: AE, RE, MAE, RMSE. | Define zero-denominator and sample rules. |
| 17 | Threshold supported, value PENDING. | Store/display metrics, do not declare acceptance. |
| 18 | Minimum 3 independent replicates per condition. | Store raw values, mean, sample SD, compliance flag. |
| 19 | Solvent split comparison needs simulation + experiment. | No scientific conclusion from model-only comparison. |
| 20 | Display mass-balance check/error. | Return/visualize each-stage and final diagnostic. |
| 21 | Desktop three-region screen. | Input left, dynamic simulation center, current results right; table/graphs below. |
| 22 | Moderate animation sequence. | Add solvent → mix → redistribute → settle → separate → collect → next. |
| 23 | Playback controls specified. | Start/Pause/Resume/Next/Reset/0.5×/1×/2× are required. |
| 24 | Stage and final results. | Stage 0 through N plus final summary required. |
| 25 | Three main graphs. | CR, cumulative recovery, per-stage extracted AcOH. |
| 26 | Three modes. | Single, scenario comparison, experimental validation. |
| 27 | Backend/API calculation authority. | Client cannot author scientific results. |
| 28 | Database exists; engine independent. | Persistence adapter calls pure engine/result snapshot. |
| 29 | V1 scope fixed; V2 curve; V3 advanced/optimization. | Do not backport V2/V3 capability as V1. |
| 30 | Teaching + Research Simulator. | Do not reduce to animation or claim process-simulator equivalence. |

## Locked cross-file interpretations
Decision 03 does not mean “make up a default so UI can run.” Decision 04/11 means temperature must be shown as PENDING or a user/lab-declared metadata value, not assumed. Decision 17 means a numerical engineering tolerance for floating-point conservation cannot be presented as a scientific validation threshold. Decision 27 makes any frontend duplicate equation a defect.

## Current authoritative unresolved items
`PENDING/BLOCKED`: fixed temperature; default KD; KD citation; KD concentration domain; reviewed equilibrium data; experimental datasets; validation acceptance threshold/rule. Owners and options are maintained in `TODO.md`.
