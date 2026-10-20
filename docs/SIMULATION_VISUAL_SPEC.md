# SIMULATION VISUAL SPECIFICATION

## 1. Principle

Visual state is a rendering of precomputed `SimulationResult`. Animation does not estimate equilibrium, alter values or imply laboratory time. All numeric labels bind to the indexed `StageResult`; a timer changes only the visual cursor.

## 2. Funnel component contract

```text
ThreeExtractionScene
├── one camera, lights and lab-background plane
├── glass funnel shell / neck / stopcock
├── aqueous liquid mesh (conventional lower layer)
├── organic liquid mesh (conventional upper layer)
├── meniscus rings / receiving beaker / drain stream
├── temporary deterministic droplets for mixing/separation only
└── accessible text legend and table alternative
```

The conventional layer order is a UI convention for the water/EtOAc teaching view, not a density claim. The current input model has no approved solvent-density dataset; a future solvent selector must provide reviewed density/provenance before changing this order. The laboratory backdrop is only a distant WebGL plane: it is not a funnel photograph with SVG liquid pasted over it.

## 3. Volume-to-height mapping

At each displayed stage, use actual nominal volumes `VR` and `VS,i`. The renderer revolves one inner radial profile `r(y)` to make both the glass interior and the liquid meshes. It integrates that same profile and numerically inverts the result:

```text
V(y) = ∫(0..y) π r(t)² dt
y = inverse(V)
```

Litres are scaled to the run's nominal feed-plus-solvent capacity with 18% presentation headspace, then passed through `inverse(V)`. A small wall clearance is included in both the integral and liquid mesh profile. These are software display settings, not physical glassware calibration. Larger nominal volume must never produce a smaller fill within the same run. Stage 0 uses `VS=0` and renders no organic mesh.

## 4. Particle mapping

Text alternatives retain the existing semi-quantitative symbol allocation from `VisualPlan`; no symbols are rendered inside a stable liquid. Temporary droplets are deterministic visual effects for `MIXING`/`SEPARATING`, never molecules or measured moles.

`C0=0` yields zero textual symbols. Rendering must not derive a scientific fraction from rounded labels or use random values during render.

## 5. State-to-visual mapping

| State | Funnel | Caption |
|---|---|---|
| READY | static liquid meshes | “Ready — calculated result is available” |
| LOADING_FEED | aqueous mesh appears inside the glass profile | “Loading raffinate” |
| ADDING_SOLVENT | upper organic mesh is added | “Adding fresh EtOAc” |
| MIXING | shared apparatus/layers move with deterministic droplets | “Mixing — visual representation” |
| EQUILIBRATING | oscillation decays | “Equilibrium assumed” |
| SEPARATING | interface returns horizontal and droplets fade | “Separating phases” |
| SHOWING_STAGE_RESULT | stable transparent meshes and menisci | “Stage i result” |
| DRAINING | lower aqueous mesh transfers to beaker through a stream; visual total is conserved | “Draining lower phase — visual representation” |
| PAUSED | freeze exact frame and show text badge | “Paused — result unchanged” |
| COMPLETED | final stable layers, tables/charts enabled | “Completed — final result” |

The WebGL context persists across these states. Pause retains the presentation clock and transfer fraction; speed scales only this clock. Following an actual `DRAINING` phase, stage completion retains the lower liquid in the receiver. A new stage reloads the nominal raffinate as a teaching reset. The existing cross-current engine still owns all acid amounts and extraction results; the visual lower-phase transfer is not a new chemistry operation. The flow line has no separately modelled in-flight volume, wetting physics or CFD solution.

## 6. Accessibility and disclaimers

Persistent text:

- `Visual representation — not actual liquid colour.`
- `Animation time is not actual extraction time.`
- `The 3D fluid motion is simplified presentation, not computational fluid dynamics.`
- `Phase volumes and levels are nominal visualization inputs.`

Use labels/patterns/icons in addition to color. Every state caption is available to a live region without spamming every animation frame. `prefers-reduced-motion` switches to static state transitions while preserving stage values and control semantics. Keyboard focus order follows the state controls; pause is reachable and announced.

## 7. Error and replay behavior

Missing/invalid result fields enter `ERROR`; the funnel cannot start. Input edits mark the snapshot stale and disable playback. Replay, pause, speed change, reset and restart must leave `JSON.stringify(result)` byte-equivalent. Browser reload may restore a saved snapshot only when engine/schema/provenance are displayed.

## 8. Acceptance checks

- All stages exist before Start.
- Every label/table/chart value matches result JSON.
- Stable stages have no decorative bubbles or particle symbols.
- Zero-solute run has zero textual symbols and N stage records.
- Volume mapping is monotonic, integrated from the vessel profile and bounded by the glass interior.
- Conventional phase order and disclaimers are visible.
- No code path converts animation duration into physical extraction time.
