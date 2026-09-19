# HANDOVER
## What exists
The repository documentation defines V1 of AcOH–water–ethyl acetate batch cross-current extraction. All canonical specifications are in the root `docs/` directory; `EXPERT_DECISIONS.md` is authoritative. Formulas/algorithm/API/visual/UI/protocol/test/roadmap documents are implementation contracts. Read `NEXT_SESSION_PROMPT.md` first.

## What a developer may do now
Build architecture, pure constant-KD engine, API, UI, visual playback, persistence and tests using explicitly labelled **user-supplied KD**. All calculation results must be backend-authoritative and precomputed before animation.

## What a developer may not claim/do
Do not invent default KD, temperature, citation/domain, experimental/equilibrium data or threshold. Do not implement frontend science, CFD, physical-time animation, V2 equilibrium curve, optimization, or PASS/FAIL validation. Do not delete/overwrite raw experiment data.

## Source reconciliation
Legacy concept examples and suggestions are background only. Superseded: frontend-only calculation; 1–4 stage framing; two-graph/MVP framing; example numerical values. Current V1 is 1–10 stages, three charts, database, validation mode and backend/API authority.

The retained `assets/reference/legacy-ui-concept.png` is background reference material, not a requirements source. In particular, its example KD, displayed condition values, and physical-time wording must not be copied into implementation.

## First handover check
Before editing code: inspect repository, read all docs, locate existing changes, choose next unblocked TODO, run baseline tests, then follow IMPLEMENT→TEST→DOCS→COMMIT→PUSH. Update PROGRESS before declaring done.
