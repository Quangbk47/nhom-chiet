# EXPERT DECISIONS — PROJECT OWNER AUTHORITATIVE BASELINE

This file binds V1 scientific behavior. A decision locks behavior; it never authorizes inventing missing scientific data. The browser-first architecture addendum at the end supersedes earlier backend wording as a Project Owner software decision.

| ID | Question | Decision | Reason / implementation consequence | Affected docs | Status |
|---:|---|---|---|---|---|
| 01 | Concentration unit? | `mol/L` | API-free browser engine, result and optional database use canonical mol/L; conversion only at boundary. | INPUT_SPECIFICATION, DATA_MODEL | LOCKED |
| 02 | Equilibrium model? | Constant `KD=CE/CR` | One algebraic stage model; no curve/CFD. | CHEMISTRY_MODEL, CALCULATION_ENGINE | LOCKED |
| 03 | Default KD? | V1 supports a project-approved default for the AcOH–water–EtOAc system at 25 °C; user override remains allowed. | The product decision is locked, but no numeric default may be used until a provenance-complete record is reviewed and approved. | REFERENCE_DATA, INPUT_SPECIFICATION | LOCKED / VALUE TASK OPEN |
| 04 | Fixed study temperature? | Fixed `25 °C` | V1 uses 25 °C as its standard condition; do not expand V1 into a temperature-dependent model. | REFERENCE_DATA, INPUT_SPECIFICATION, VALIDATION_PLAN | LOCKED |
| 05 | Phase-volume behavior? | Negligible change | Use `VR=feedVolumeL`, `VE=VS,i`; exclude contraction/mutual solubility. | CHEMISTRY_MODEL, CALCULATION_ENGINE | LOCKED |
| 06 | Solvent allocation? | Equal and custom | Equal is `VS,total/N`; custom has exactly N positive values and a software sum tolerance. | INPUT_SPECIFICATION | LOCKED |
| 07 | Stage count? | Inclusive 1–10 | Reject 0, 11, fractional or non-finite N. | INPUT_SPECIFICATION | LOCKED |
| 08 | When calculate? | Entire result before playback | Freeze `SimulationResult` before any animation. | ARCHITECTURE, STATE_MACHINE | LOCKED |
| 09 | Meaning of real-time? | Dynamic visual representation | Never claim animation seconds equal laboratory extraction time. | SIMULATION_VISUAL_SPEC | LOCKED |
| 10 | Particle semantics? | Semi-quantitative symbols | Map fractions to deterministic particles; never call them molecules. | SIMULATION_VISUAL_SPEC | LOCKED |
| 11 | Temperature gate? | V1 standard is `25 °C` | Every V1 canonical run declares 25 °C. A different temperature is outside the V1 standard/domain and requires a future approved model/data decision. | REFERENCE_DATA, VALIDATION_PLAN | LOCKED |
| 12 | KD source? | Literature plus experimental verification/adjustment | Any adjustment traceable/reviewed; no silent curve fit. | REFERENCE_DATA, VALIDATION_PLAN | LOCKED |
| 13 | V1 assay? | Acid–base titration | Protocol/data fields support titration-derived raffinate CR. | EXPERIMENTAL_PROTOCOL | LOCKED |
| 14 | Primary validation variable? | Raffinate `CR` | Compare per-stage CR; recovery is secondary. | EXPERIMENTAL_VALIDATION | LOCKED |
| 15 | Experiment input? | Manual and CSV | Both normalize to one persisted schema with raw provenance. | DATA_MODEL | LOCKED |
| 16 | Error metrics? | AE, RE, MAE, RMSE | Zero denominator and sample rules are explicit. | EXPERIMENTAL_VALIDATION | LOCKED |
| 17 | Validation threshold? | V1 is metric-only; no PASS/FAIL threshold | Store/display AE, RE, MAE and RMSE. Do not create an acceptance classification from an arbitrary threshold. | VALIDATION_PLAN, EXPERIMENTAL_VALIDATION | LOCKED |
| 18 | Replicates? | ≥3 independent extraction runs/condition | Store raw values, mean, sample SD and compliance flag. | EXPERIMENTAL_PROTOCOL | LOCKED |
| 19 | Split comparison? | Simulation plus experiment | Model-only comparison cannot claim scientific superiority. | VALIDATION_PLAN | LOCKED |
| 20 | Mass balance? | Display every-stage/final diagnostic | Numerical tolerance is an engineering check, not validation threshold. | RESULTS_AND_CHARTS | LOCKED |
| 21 | Main layout? | Desktop three regions | Input left, dynamic simulation center, result right; table/graphs below. | UI_UX_SPEC | LOCKED |
| 22 | Visual sequence? | Add solvent → mix → redistribute → settle → separate → collect → next | Moderate symbolic playback. | SIMULATION_STATE_MACHINE | LOCKED |
| 23 | Playback controls? | Start, Pause, Resume, Next Stage, Restart, Reset, 0.5×/1×/2× | Controls affect visual cursor only. | SIMULATION_STATE_MACHINE | LOCKED |
| 24 | Result levels? | Stage 0 through N plus final | Stage 0 is explicit and chart-compatible. | DATA_MODEL, RESULTS_AND_CHARTS | LOCKED |
| 25 | Main graphs? | CR, cumulative recovery, AcOH extracted/stage | Arrays derive from stage snapshot. | RESULTS_AND_CHARTS | LOCKED |
| 26 | Modes? | Single, Scenario Comparison, Experimental Validation | Shared result/provenance contract. | UI_UX_SPEC | LOCKED |
| 27 | Scientific calculation authority? | Pure deterministic domain engine in browser | React cannot duplicate equations; no server/API calculation service required for MVP. | ARCHITECTURE, CALCULATION_ENGINE | LOCKED — OWNER ARCHITECTURE AMENDMENT |
| 28 | Persistence? | Optional database adapter independent of engine | Firestore may store snapshots/experiments; engine has no database dependency. | ARCHITECTURE, DATA_MODEL | LOCKED |
| 29 | Version boundary? | V1 fixed; curve V2; advanced/optimization V3 | Do not backport later capability. | PROJECT_SCOPE, ROADMAP | LOCKED |
| 30 | Product identity? | Teaching + Research Simulator | Do not reduce to animation or claim process-simulator equivalence. | PROJECT_SCOPE, README | LOCKED |

## Architecture addendum A-01 (Owner instruction, 2026-09-19)

The earlier phrase “backend/API is calculation authority” is superseded for this web MVP. The authority chain is now:

```text
User input -> validation -> normalization -> pure calculation engine
  -> immutable SimulationResult -> visual/table/chart presentation
```

Firebase Hosting is deployment. Firestore is optional persistence. A future server may call the same engine for a separate product need, but it cannot replace or fork the browser engine contract. This addendum changes software placement only; all equations, units, provenance gates and scientific blockers above remain unchanged.

## Owner decision register — 2026-09-20

- **B01 — Resolved:** V1 uses fixed 25 °C.
- **B02 — Product decision resolved; data task open:** V1 supports a default KD, but its numeric value, source, provenance and applicability domain must still be established and Project Owner approved. Until then, no default KD is populated.
- **B03 — Resolved by design:** V1 reports metrics only and has no PASS/FAIL threshold.
- **B04 — Strategy resolved; evidence open:** the project will create a complete AcOH–water–EtOAc SOP and obtain expert/lab review and approval before claiming scientific validation readiness.

## Current unresolved scientific items

The remaining open work is the provenance-complete default KD record at 25 °C, reviewed equilibrium data, experimental datasets, and the SOP draft/review/approval evidence. These items must remain explicit tasks; no value or approval may be invented.
