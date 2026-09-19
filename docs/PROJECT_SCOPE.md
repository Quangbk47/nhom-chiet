# PROJECT SCOPE — V1

## 1. Product definition

Liquid–Liquid Extraction Simulator is a browser teaching and research-support application for equilibrium material balance of multistage, cross-current batch extraction of AcOH from water with fresh EtOAc. A user changes canonical inputs, the browser validates/normalizes them, the pure engine computes a complete immutable stage sequence, and the UI visualizes that exact snapshot.

```text
validated input -> normalized domain input -> pure engine
  -> SimulationResult -> SVG/state machine/table/three charts
  -> optional experimental comparison and persistence
```

## 2. MVP in scope

### Science and calculation

- Components: AcOH solute, water nominal carrier/raffinate, EtOAc nominal extract solvent.
- Cross-current topology: aqueous raffinate retained; fresh solvent at each stage; extracts removed.
- Constant `KD=CE/CR`, concentration unit `mol/L`, volume unit `L`.
- `N=1…10`, equal split or custom positive ordered split.
- Stage 0 and every stage 1…N, per-stage/cumulative quantities and material-balance diagnostic.
- Deterministic reference fixtures and invariant tests.

### Product

- Desktop three-region workspace and responsive stack.
- Single Simulation, Scenario Comparison, Experimental Validation modes.
- Calculation-driven symbolic funnel/SVG animation with start/pause/resume/next stage/restart/reset and 0.5×/1×/2× playback speed.
- Stage table, final summary and three charts: raffinate `CR` by stage, cumulative recovery by stage, AcOH extracted in each stage.
- Accessible textual/table alternatives and warnings.
- Manual entry and all-or-nothing CSV import of experimental stage `CR`; raw replicate/audit semantics.
- Firebase Hosting deployment target; optional Firestore persistence only after the persistence gate.

## 3. MVP is not

- A REST/backend calculation service, CFD package, kinetic/mass-transfer simulator, droplet simulator, molecular-dynamics model, or Aspen/HYSYS replacement.
- A promise that colors, interface height, particle count or animation seconds are physical observations.
- A complete ternary equilibrium model, `KD(C)`, activity coefficient model, pH/speciation model, solvent-loss/density/phase-contraction model.
- Automatic fitting/optimization/recommended stage count.
- A validation PASS/FAIL system while Owner threshold/aggregation is pending.

## 4. Assumptions and constraints

1. Equilibrium is assumed at every stage.
2. KD is constant in one declared run and must carry source/status/domain note.
3. Fresh organic solvent enters with zero AcOH.
4. Nominal `VR` and each `VS,i` remain unchanged.
5. No loss outside phases; `nIn ≈ nR+nE` is an engineering invariant.
6. Canonical inputs are finite; `C0≥0`, volumes/KD positive and N within bounds.
7. Temperature is stored as `pending` or explicitly declared; no project default is invented.
8. User-supplied KD calculations are exploratory and warn that they are not an Approved project default.

## 5. Future scope gates

| Candidate capability | Gate before implementation |
|---|---|
| `CE=f(CR)` curve/V2 | Approved data, equation, solver bounds/convergence and validation plan |
| Approved default KD | Complete Reference Data record and Owner approval |
| Scientific validation PASS/FAIL | Owner threshold scope/value/undefined-RE rule/version |
| Saved studies/experiments | Firestore schema/rules/privacy review |
| Optimization | Objective, constraints, approved model and user-facing claim review |
| Lab execution | Approved SOP, SDS, supervision, apparatus and waste controls |

## 6. Success criteria

V1 is successful only when:

- a fresh clone can run documented checks;
- pure engine T01–T10 equivalents pass without React/Firebase/network;
- validation and normalization reject invalid units/fields without silent guessing;
- result stages/charts/table are all sourced from one `SimulationResult`;
- playback can pause/replay without changing result bytes;
- UI explicitly shows assumptions, warnings, limitations and stale state;
- manual and valid CSV experimental records normalize identically;
- n<3 and threshold pending are visible as non-compliant/not evaluated;
- roadmap evidence and progress are updated;
- no unapproved scientific constant is present in source.

## 7. Ownership and evidence

Scientific decisions belong to the Project Owner; software decisions may be made by the implementation team when documented in `TECH_STACK.md`/`ARCHITECTURE.md`. The authoritative mapping is `DOCUMENT_AUTHORITY_MAP.md`; task-level acceptance is in `TODO.md` and `TESTING_STRATEGY.md`.
