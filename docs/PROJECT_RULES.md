# PROJECT RULES

## 1. Authority order

1. Written Project Owner approval, including the browser-first architecture decision in the documentation-hardening brief.
2. `EXPERT_DECISIONS.md` for scientific behavior.
3. The document named authoritative for the concern in `DOCUMENT_AUTHORITY_MAP.md`.
4. Original concept images/examples for background only.
5. Developer assumptions never become scientific constants.

If documents conflict, stop, preserve the higher authority, record the conflict in `TODO.md`/`HANDOVER.md`, and update the lower document. Never average conflicting decisions.

## 2. Completion workflow

Every implementation, data, documentation or configuration change follows:

```text
IMPLEMENT -> TEST -> UPDATE DOCUMENTATION/PROGRESS -> REVIEW DIFF -> COMMIT -> PUSH
```

`TASK DONE` is not `PHASE DONE`. Phase states are exactly `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`. A phase is `DONE` only when its roadmap exit evidence exists.

## 3. Browser-first calculation integrity

1. `src/domain/calculation/` is a deterministic pure module: no React, DOM, Firebase, network, clock, randomness, animation timer or display rounding.
2. Browser boundary validation normalizes to `L` and `mol/L` once, then invokes the pure engine.
3. React components may format, animate and render returned fields, but may not independently calculate `CR`, `CE`, recovery, `KD`, phase amounts or mass balance.
4. The state machine owns playback state only; pause/speed/replay must not mutate `SimulationResult`.
5. Firebase is hosting/persistence infrastructure, never the calculation authority. Core simulation must run without network.
6. A saved run stores canonical input, complete immutable result, engine version and scientific-reference provenance. New engine versions create new snapshots.

## 4. Scientific data governance

| Status | Meaning | Allowed use |
|---|---|---|
| Candidate | Located but not technically verified | Discussion/review only |
| Reviewed | Identity, unit, convention, temperature/domain checked by named reviewer | Review support; not a project constant |
| Project Owner Approved | Explicit scope/version approval | Selectable project constant/default |

No implementation may invent a default KD, KD citation/domain, equilibrium data, experimental data or SOP approval. V1 temperature is the fixed Owner-approved 25 °C standard. User-supplied KD is permitted only with `sourceType=user_supplied`, note/provenance, and UI warning. A missing KD domain is a visible exploratory warning; a non-25 °C V1 input is rejected.

## 5. Validation and data integrity

Raw replicate/titration observations are append-only. Corrections create a superseding audit record with reason, actor and time. Exclusions remain visible. No KD may be tuned solely to lower error without a separately reviewed model change. V1 validation status is metric-only and never PASS/FAIL; any future acceptance classification requires a new Owner decision.

## 6. Scientific model boundary

V1 is cross-current equilibrium material balance with constant `KD=CE/CR`, fresh EtOAc each stage, nominal unchanged phase volumes and 1–10 stages. It is not CFD, kinetic extraction, physical-time prediction, molecular simulation, phase-equilibrium curve, optimization or Aspen/HYSYS equivalence. See `CHEMISTRY_MODEL.md` and `PROJECT_SCOPE.md`.

## 7. Documentation obligations

Changes to TypeScript fields update `DATA_MODEL.md`, `INPUT_SPECIFICATION.md` and relevant tests. Equation changes update `CALCULATION_FORMULAS.md`, `CHEMISTRY_MODEL.md`, `CALCULATION_ENGINE.md` and reference fixtures. UI/state changes update `UI_UX_SPEC.md`, `SIMULATION_VISUAL_SPEC.md` and `SIMULATION_STATE_MACHINE.md`. Scientific scope/provenance changes update `EXPERT_DECISIONS.md`, `REFERENCE_DATA.md`, `TODO.md` and `PROGRESS.md`.

## 8. Git/contributor rules

Work on a task branch when possible; direct `main` push is allowed only when the Project Owner explicitly requests it and no concurrent change is at risk. Never force-push. Preserve unrelated worktree changes, especially a pre-existing legacy ZIP deletion. Before push run applicable tests, `git diff --check`, inspect the staged diff and update progress with evidence/commit SHA after publication.
