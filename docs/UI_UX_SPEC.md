# UI/UX SPECIFICATION — IMPLEMENTATION CONTRACT

## 1. User journey

```text
open app -> choose mode -> enter labelled inputs -> see inline validation
  -> Start -> normalize/calculate in browser -> READY
  -> play/pause/restart -> inspect current result
  -> table/charts -> optionally save scenario or compare experiment
```

The UI is a teaching/research surface, not a chemistry implementation. Every number shown after Start comes from `SimulationResult`.

## 2. Desktop wireframe

```text
┌───────────────────────────────────────────────────────────────┐
│ HEADER: MÔ PHỎNG CHIẾT LỎNG–LỎNG | mode tabs | assumptions     │
├────────────────┬───────────────────────────┬──────────────────┤
│ INPUT PANEL    │ SIMULATION WORKSPACE      │ CURRENT RESULT   │
│ C0 + unit      │ feed -> solvent -> funnel │ Stage i / N      │
│ VR + unit      │ phase labels/particles    │ CR / CE          │
│ VS total       │ status + controls         │ extracted/remain │
│ KD/provenance  │                           │ recovery/MB      │
│ N + split      │                           │ warnings         │
│ START / RESET  │                           │                  │
├────────────────┴───────────────────────────┴──────────────────┤
│ STAGE TIMELINE: ✓ complete | ● active | ○ pending              │
├───────────────────────────────────────────────────────────────┤
│ STAGE TABLE (accessible alternative)                           │
├───────────────────────────────────────────────────────────────┤
│ THREE GRAPH TABS + model assumptions/disclaimers               │
└───────────────────────────────────────────────────────────────┘
```

The ASCII wireframe expresses information hierarchy, not pixel dimensions.

## 3. Responsive breakpoints

Use CSS grid with three columns at `min-width: 1200px` (input 280px, simulation flexible, result 300px). At 768–1199px use two rows: input + result on top, simulation full width below; table/charts remain below. Under 768px use one column: Input → Simulation → Result → Timeline → Table → Graphs. No scientific content is hidden solely on narrow screens; charts may become horizontally scrollable with a table alternative.

## 4. Design tokens

These are software presentation tokens, not scientific constants:

```css
--space-1: 4px; --space-2: 8px; --space-3: 12px;
--space-4: 16px; --space-5: 24px; --space-6: 32px;
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
--input-height: 44px; --focus-ring: 3px solid #1d70d6;
--surface: #ffffff; --surface-muted: #f4f7fb; --border: #c9d5e3;
--text: #17233b; --muted: #52627a;
--status-info: #1d70d6; --status-success: #147a4b;
--status-warning: #9a5a00; --status-error: #b42318;
```

Typography hierarchy: page title 28px/700, panel title 20px/700, field label 14px/600, value 16px, help/error 13px. Status uses text and icon/pattern in addition to color. Buttons have primary Start, secondary playback, and quiet Reset hierarchy.

## 5. Input panel

Each field has a visible Vietnamese label, symbol where useful, unit suffix/select, help text and `aria-describedby`. Use the exact contract in `INPUT_SPECIFICATION.md`.

### Field behavior

- `C0`: empty initially; accepts zero; displays `mol/L`.
- `VR`, total solvent: positive; visible mL converter may update canonical L but shows both.
- `KD`: no default; requires value, source type and provenance note; warning stays visible for user KD.
- `N`: integer 1–10; changing it regenerates custom rows by index and marks any result stale.
- Split radio: equal shows derived read-only per-stage volumes; custom shows exactly N editable rows, running sum and difference.
- Temperature: pending is selectable and visibly says no fixed default; declared requires a numeric °C value.

Start is disabled for known invalid fields but remains keyboard discoverable with an error summary. Submit also revalidates to avoid relying on disabled styling.

### Keyboard/focus

Tab order is left-to-right/top-to-bottom: mode → inputs → split rows → provenance → Start → Reset. Enter in a field submits only when valid; Escape closes a non-scientific help popover. Error summary links to first invalid control. Numeric input supports paste, `.` and unambiguous locale handling; mouse-wheel must not silently alter values while focused.

## 6. Simulation workspace

The center contains a labelled feed vessel, solvent vessel and separatory-funnel SVG. It displays current stage, process caption, nominal volumes, conventional phase labels, particle legend, state badge and persistent disclaimers. Controls are Start, Pause, Resume, Next Stage, Restart, Reset and speed 0.5×/1×/2× according to `SIMULATION_STATE_MACHINE.md`.

The SVG is a child renderer; it receives `StageResult`, `VisualPlan` and playback state as props. It never receives raw form input or calls the calculation engine.

## 7. Result panel

The panel uses direct field mapping from `RESULTS_AND_CHARTS.md`: stage, solvent volume, CR, CE, extracted this stage, remaining acid, cumulative extracted/recovery and mass-balance diagnostic. It also shows KD source/status, temperature status and warnings. Empty state explains how to calculate; stale state labels old values “previous calculation” and disables playback.

## 8. Timeline

Timeline has one item per stage 1…N plus an optional feed marker. `COMPLETED` gets a check icon/text, `ACTIVE` gets a text/icon marker, pending remains hollow, and error is explicit. Clicking a completed stage may inspect its result without changing playback cursor; clicking pending does nothing until its stage is reached. Keyboard users can navigate items with arrow keys and hear stage/status text.

## 9. Scenario Comparison mode

Create named immutable snapshots. List common basis first: C0, VR, total solvent, N, split, KD provenance and temperature. Then compare final CR, recovery, total extracted and per-stage arrays. If any basis differs, show `comparison conditions differ`; never call one “optimal” or “experimentally superior”. Comparison uses saved result snapshots, not a second formula.

## 10. Experimental Validation mode

Select a saved condition/result first. Display its canonical input and provenance. Manual form and CSV preview both produce `ExperimentalStageData`. Show raw replicate values, n, mean, sample SD, model CR, AE, RE, MAE/RMSE and warnings. If n<3 show insufficient compliance. If threshold is pending show exactly `NOT EVALUATED — Project Owner validation threshold pending` and never PASS/FAIL.

## 11. Interaction states

`empty`, `editing`, `invalid`, `calculating`, `ready`, `playing`, `paused`, `stale`, `error`, `import-preview`, `validation-ready`, `completed`. A field edit after success transitions to stale and prevents old data being presented as current. Calculation failure retains raw form input and displays recoverable errors.

## 12. Accessibility and QA

All controls have labels, focus states and keyboard activation. Charts expose tabular data and units. Live regions announce state changes without per-frame noise. Reduced-motion preserves learning content. Automated/component checks and manual responsive checks are listed in `TESTING_STRATEGY.md`; UI must pass with mouse, keyboard and screen-reader-oriented text assertions.
