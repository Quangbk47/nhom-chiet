# TESTING STRATEGY — V1

## Test layers and tools

Use Vitest for pure/domain tests, Testing Library for behavior-oriented React tests, and Playwright for a small browser smoke/E2E set. `TECH_STACK.md` defines commands. Tests must use user-supplied fixture KD values explicitly marked as fixtures; they are not project defaults.

## Matrix

| Layer | Scope | Minimum cases | Evidence |
|---|---|---|---|
| Unit: parsing | decimal/scientific/locale text | empty, `0`, `1e-3`, comma ambiguity, NaN/Infinity, units typed | field error assertions |
| Unit: validation | normalized input/provenance | C0 zero, negative volumes, N bounds, KD, split count/sum, pending/declared temp | error code/message table |
| Unit: stage engine | one-stage equations | valid positive, zero solute, small/large KD, low/large solvent | expected fields/tolerance |
| Unit: simulation engine | sequential stages | N=1, N=10, equal/custom equivalence, deterministic rerun | stage/chart lengths |
| Invariant | conservation/monotonicity | CR/CE/nR/nE nonnegative, KD ratio, nR monotonic, recovery range, MB | no silent clamp |
| Contract | data schema | stage 0..N, final/chart/visualPlan fields, warning provenance | serialized fixture |
| Reducer | state machine | transitions, guards, pause/resume, next, restart/reset, stale | result reference equality |
| Visualization | geometry/particles | zero volume, monotonic height, clipping, particle sum, C0=0 | deterministic output |
| Component | UI behavior | labels/units, errors, custom rows, warnings, table/chart binding | Testing Library |
| Accessibility | keyboard/a11y | focus order, error links, live state, reduced motion, chart table | axe/manual checklist |
| Responsive | layout | desktop/tablet/mobile order and no hidden science | Playwright screenshots/checks |
| Persistence (later) | Firestore adapter | converter, offline failure, auth/rules, snapshot roundtrip, raw immutability | emulator evidence |
| E2E | happy path | valid input → result → playback → charts; stale edit; CSV preview | Playwright trace |

## Required reference fixtures

### T01 zero solute

Valid positive volumes/KD and `C0=0` produce N+1 stages, all amounts/concentrations/recoveries zero, zero particles, no NaN/Infinity.

### T02 boundaries

N=1 and N=10 produce exact stage counts; N=0, 11 and non-integer produce `INVALID_STAGE_COUNT`.

### T03 provenance

Positive user KD calculates with `USER_SUPPLIED_KD`; invalid KD rejects; project-approved without matching approved record rejects; pending temperature warns, never invents value.

### T04 split

Equal split and identical custom list compare within numeric tolerance. Wrong custom count, zero/negative row or sum outside allocation tolerance reject.

### T05 reference software case

Use the full C0=.50, VR=.100, VS,total=.080, KD=2, N=4 table in `CALCULATION_ENGINE.md`. This is not experimental data.

### T06 determinism/invariants

Same normalized JSON and engine version produce same snapshot. Every stage conserves amount within named numeric tolerance; nR never rises; cumulative recovery never falls.

## Existing requirement mapping

`TEST_PLAN.md` T01–T10 map to domain; T11–T18 map to UI/state/visual; T19–T27 map to data/validation. Keep those IDs stable in evidence even as test files are created.

## Definition of a passing change

The affected layer tests pass, no unrelated test regresses, `git diff --check` is clean, and documentation/progress/evidence are updated. A failed or blocked test is recorded, not deleted. No green UI snapshot can substitute for a scientific reference or Owner approval.
