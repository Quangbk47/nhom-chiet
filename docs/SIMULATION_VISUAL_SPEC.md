# SIMULATION VISUAL SPECIFICATION

## 1. Principle

Visual state is a rendering of precomputed `SimulationResult`. Animation does not estimate equilibrium, alter values or imply laboratory time. All numeric labels bind to the indexed `StageResult`; a timer changes only the visual cursor.

## 2. Funnel component contract

```text
FunnelSVG
├── defs / clipPath
├── funnelOutline / neck / stopper
├── organicPhase (conventional upper layer)
├── aqueousPhase (conventional lower layer)
├── phaseInterface
├── soluteParticles
├── stopcock / drainStream
├── labels / legends
└── state overlay / reduced-motion text
```

The conventional layer order is a UI convention for the water/EtOAc teaching view, not a density claim. Labels must state “nominal organic phase (EtOAc)” and “nominal aqueous phase (water)”. SVG uses `viewBox="0 0 640 720"`, `preserveAspectRatio="xMidYMid meet"`, and a clip path inside the funnel body; geometry scales from the viewBox rather than fixed CSS pixels.

## 3. Volume-to-height mapping

At each displayed stage, use actual nominal volumes `VR` and `VS,i`. A deterministic renderer chooses:

```text
referenceVolume = max(VR, VS,i, smallPositive)
normalR = clamp(VR / referenceVolume, 0, 1)
normalE = clamp(VS,i / referenceVolume, 0, 1)
heightR = minHeight + normalR * (maxHeight - minHeight)
heightE = minHeight + normalE * (maxHeight - minHeight)
```

`minHeight`, `maxHeight` and funnel interior coordinates are software display constants documented in the visualization module. They are not a physical calibration. The clip path prevents overflow. Larger nominal volume must never produce a smaller fill within the same run. Stage 0 uses `VS=0` and renders no organic layer or an explicit zero-volume placeholder.

## 4. Particle mapping

Particles are semi-quantitative symbols, never molecules or measured moles. Choose one fixed software constant `PARTICLE_CAPACITY` and record it in `VisualPlan`. For stage `i`:

```text
fractionExtracted = nE / nInput when nInput > 0, else 0
extractParticles  = round(PARTICLE_CAPACITY * fractionExtracted)
raffinateParticles = PARTICLE_CAPACITY - extractParticles
```

The renderer must use `fractionExtracted` from the result, not derive a fraction from rounded labels. `C0=0` yields zero solute particles; if `nInput=0`, both groups are zero. This stage fraction is not cumulative recovery. Particle positions use a deterministic seeded layout derived from `(stageNumber, particleIndex, phase)`; do not use random values during render.

## 5. State-to-visual mapping

| State | Funnel | Caption |
|---|---|---|
| READY | prior raffinate or empty setup | “Ready — calculated result is available” |
| LOADING_FEED | aqueous fill grows into body | “Loading raffinate” |
| ADDING_SOLVENT | organic stream enters | “Adding fresh EtOAc” |
| MIXING | two fills merge/particles move symbolically | “Mixing — visual representation” |
| EQUILIBRATING | particles settle into proportional regions | “Equilibrium assumed; KD = CE/CR” |
| SEPARATING | interface becomes horizontal, labels appear | “Separating phases” |
| SHOWING_STAGE_RESULT | stable layers and result labels | “Stage i result” |
| DRAINING | organic stream to collected extract; raffinate stays | “Collecting extract” |
| PAUSED | freeze exact frame and show text badge | “Paused — result unchanged” |
| COMPLETED | final stable layers, tables/charts enabled | “Completed — final result” |

## 6. Accessibility and disclaimers

Persistent text:

- `Visual representation — not actual liquid colour.`
- `Animation time is not actual extraction time.`
- `Particles show relative AcOH distribution; they are not molecules.`
- `Phase volumes and heights are nominal visualization inputs.`

Use labels/patterns/icons in addition to color. Every state caption is available to a live region without spamming every animation frame. `prefers-reduced-motion` switches to static state transitions while preserving stage values and control semantics. Keyboard focus order follows the state controls; pause is reachable and announced.

## 7. Error and replay behavior

Missing/invalid result fields enter `ERROR`; the funnel cannot start. Input edits mark the snapshot stale and disable playback. Replay, pause, speed change, reset and restart must leave `JSON.stringify(result)` byte-equivalent. Browser reload may restore a saved snapshot only when engine/schema/provenance are displayed.

## 8. Acceptance checks

- All stages exist before Start.
- Every label/table/chart value matches result JSON.
- Particle counts sum to capacity when input amount is positive.
- Zero-solute run has zero particles and N stage records.
- Volume mapping is monotonic and clipped.
- Conventional phase order and disclaimers are visible.
- No code path converts animation duration into physical extraction time.
