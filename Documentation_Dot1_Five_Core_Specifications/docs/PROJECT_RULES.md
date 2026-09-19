# PROJECT RULES

## 1. Rule of completion
**NO WORK IS COMPLETE UNTIL PROGRESS IS UPDATED.**

Required sequence for every code, data, documentation, or configuration task:

`IMPLEMENT → TEST → UPDATE PROJECT DOCUMENTATION → COMMIT → PUSH`

`TASK DONE ≠ PHASE DONE`. A task can be DONE only when its evidence is linked in the task/commit/progress record. A phase is DONE only when every exit criterion in `ROADMAP.md` has evidence. Allowed phase states are exactly: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `DONE`.

## 2. Authority and conflict resolution

| Priority | Source | Use |
|---:|---|---|
| 1 | Written Project Owner approval | Can change an authoritative decision. |
| 2 | `EXPERT_DECISIONS.md` | Binding V1 behavior. |
| 3 | This documentation set | Implementation contract. |
| 4 | Original concept/design document | Background only. |
| 5 | Developer assumption/example | Never a scientific constant. |

When two sources conflict: stop using the lower-priority instruction, record the conflict in `HANDOVER.md`/`TODO.md`, and preserve the higher-priority decision. Do not “split the difference.”

## 3. Scientific-data governance
Every reference datum uses exactly one status:

| Status | Meaning | Allowed use |
|---|---|---|
| Candidate | Located/collected, not verified. | Discussion only; not calculation default. |
| Reviewed | Technically checked for unit/system/context. | May support review; not a constant. |
| Project Owner Approved | Explicitly accepted with scope/version. | Versioned selectable project constant. |

An approved KD record must contain: identity of the ternary system, `KD=CE/CR` convention, numeric value/unit, temperature, concentration range/domain, method, full source/raw data pointer, review/approval identity and date. A missing field means it cannot become the default.

## 4. Calculation integrity rules
1. Calculation engine is a deterministic pure module: no database query, HTTP, UI state, local clock, random values, or display rounding.
2. Backend/API validates input, invokes engine, and owns the scientific result.
3. Frontend may sort, format, animate, and render returned values, but must not independently calculate CR, CE, recovery, KD or mass balance.
4. A saved study stores canonical input, full result snapshot, engine version and scientific-data reference version. Recalculation with a new engine never overwrites the old snapshot.
5. Display rounding is applied only after result calculation. Export must label displayed precision and canonical unit.

## 5. Validation and experiment integrity
Raw replicate values are append-only. Corrections create an audit event; exclusions remain visible with reason, person and time. An experiment may be compared only to a model run with recorded condition/provenance. No developer or student may alter KD solely to lower error without recording a proposed scientific-model change and obtaining review. A threshold may be calculated/stored only after Project Owner approval; before that UI status is `NOT EVALUATED`, never PASS/FAIL.

## 6. Documentation obligations
Any implementation that changes an API field updates `DATA_MODEL.md`; any equation changes `CALCULATION_FORMULAS.md` and engine tests; UI behavior changes `UI_UX_SPEC.md`/`SIMULATION_VISUAL_SPEC.md`; scientific scope changes `EXPERT_DECISIONS.md`, `REFERENCE_DATA.md`, and `TODO.md`. A pull request/review must reject mismatched changes.

## 7. Branch/commit minimum
Use a task branch. Commit message identifies area and outcome, e.g. `feat(engine): calculate constant-KD stage results` or `docs(validation): add zero-denominator rule`. Before push: run applicable tests, inspect changed files, update `PROGRESS.md`, and keep unrelated user changes untouched.
