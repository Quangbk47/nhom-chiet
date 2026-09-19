# SIMULATION VISUAL SPECIFICATION

## 1. Principle
Visual state is a rendering of precomputed `SimulationResult`. Animation neither estimates equilibrium nor writes result values. The runtime owns only playback position; the result snapshot is read-only.

## 2. Stage playback state machine
`IDLE → READY → LOAD_RAFFINATE → ADD_SOLVENT → MIXING → EQUILIBRIUM → SETTLING → SEPARATE → COLLECT → STAGE_COMPLETE → (READY next stage | FINAL)`.

| State | Required visible content | Result fields consumed |
|---|---|---|
| READY | stage number and prior raffinate | prior stage nR/CR |
| LOAD_RAFFINATE | aqueous feed enters funnel | `nInputMol`, VR |
| ADD_SOLVENT | fresh organic stream/label | `solventVolumeL` |
| MIXING | symbolic mixed particles | no new calculation |
| EQUILIBRIUM | distribution caption | CR, CE, nR, nE |
| SETTLING/SEPARATE | two labelled conventional phases | nominal VR, VS; particles |
| COLLECT | Ei collected; Ri retained | nE, nR, recovery, MB |
| FINAL | final summary/table/charts unlocked | final result |

## 3. Control rules
Start is enabled only READY with valid complete result. Pause freezes current visual progress. Resume continues the same state. Next Stage completes remaining substeps without recalculation and advances exactly one stage. Reset clears only playback state and returns stage 0. Speed 0.5×/1×/2× multiplies animation durations only. Controls are disabled when no valid result or while a transition is being committed.

## 4. Calculation-to-visual mappings
Use fixed configurable particle count P. If `nInput>0`: `pExtract=round(P*nE/nInput)`, `pRaffinate=P-pExtract`; otherwise both zero. Particles are labelled `relative AcOH distribution`, not molecules or moles. Nominal liquid heights are normalized from VR and VS against a display maximum chosen for the current run; they must not imply true density/interface physics. Show actual nominal volume as text.

All numerical labels bind directly to stage JSON fields. At visual equilibrium, extract fraction is `nE/nInput`; no independently recomputed fraction from rounded labels is allowed. The chart/table update uses the same indexed stage record after COLLECT.

## 5. Required disclaimers/accessibility
Show persistent text: `Visual representation—not actual liquid colour.` and `Animation time is not actual extraction time.` Phase must be distinguishable with label/pattern/icon, not color alone. State changes have text captions for keyboard/screen-reader users. Reduced-motion preference must show static state transitions while preserving numerical learning content.

## 6. Error/replay behavior
If response is invalid/missing stage fields, do not start animation; show calculation error. If user edits input after calculation, show stale-result state and disable Start until recalculation. Replaying, pausing, speed changing and resetting must leave snapshot byte-equivalent. Browser reload can restore saved snapshot only when its engine version/provenance are displayed.

## 7. Visual acceptance tests
Verify all result stages exist before Start; every label/chart equals result JSON; particle counts sum P; zero solute has zero particles; pause/resume/reset/next/speed never mutate values; correct stage order; disclaimer text visible; UI does not convert animation duration to physical seconds.
