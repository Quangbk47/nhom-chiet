# NEXT SESSION PROMPT
You are taking over the Liquid–Liquid Extraction Simulator repository with no chat history. Read every `docs/*.md`, in this order: `PROJECT_RULES`, `EXPERT_DECISIONS`, `PROJECT_SCOPE`, `PROCESS_MODEL`, `CALCULATION_FORMULAS`, `EQUILIBRIUM_MODEL`, `ALGORITHM_SPEC`, `DATA_MODEL`, `UI_UX_SPEC`, `SIMULATION_VISUAL_SPEC`, `TEST_PLAN`, `TODO`, `PROGRESS`, `ROADMAP`, `HANDOVER`.

Authoritative V1: backend/API is calculation authority; pure engine uses mol/L/L, batch cross-current fresh solvent, N=1–10, constant KD=CE/CR, equal/custom split; it computes all stage results before frontend playback. Frontend only renders snapshot. Animation is symbolic, not physical time/CFD. Preserve stage 0…N, mass balance, 3 charts and provenance.

Never invent fixed temperature, default KD/citation/domain, equilibrium/experimental data or validation threshold. User-supplied KD is allowed with warning. Validation remains NOT EVALUATED until Owner threshold approval. Do not overwrite raw experimental observations.

First inspect repo and existing work, select next unblocked TODO, implement narrowly, run mapped tests, update relevant specs and PROGRESS, then commit/push if repository workflow/credentials permit. TASK DONE is not PHASE DONE; status values are only NOT STARTED, IN PROGRESS, BLOCKED, DONE.
