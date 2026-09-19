# RESULTS AND CHARTS — PRESENTATION CONTRACT

## 1. Source rule

Every numeric label, table cell, tooltip and chart point reads a field from one immutable `SimulationResult`. Components may format precision and units; they may not derive chemistry or use rounded display values for a later calculation.

## 2. Current result panel

For the selected stage, show in this order:

| UI label | Source | Unit/precision guidance | Stage 0 |
|---|---|---|---|
| Bậc i/N | `stageNumber`, input `stageCount` | integer | `0/N` feed |
| Dung môi mới | `solventVolumeL` | L or converted mL, display label | 0/em dash |
| Nồng độ raffinate (`CR`) | `raffinateConcentrationMolPerL` | mol/L, display precision only | C0 |
| Nồng độ extract (`CE`) | `extractConcentrationMolPerL` | mol/L | 0/em dash |
| AcOH vào stage | `incomingAcidAmountMol` | mol | n0 |
| AcOH extract stage này | `extractAcidAmountMol` | mol | 0 |
| AcOH còn lại | `raffinateAcidAmountMol` | mol | n0 |
| Thu hồi stage | `stageRecoveryPercent` | % | 0 |
| Thu hồi tích lũy | `cumulativeRecoveryPercent` | % | 0 |
| Cân bằng vật chất | `massBalance` | mol and % | zero |

The panel always includes KD source/status, temperature status, assumption text and warnings. A pending/unapproved status cannot be represented only by green styling.

## 3. Stage table

Columns, in order:

1. `Stage` (`stageNumber`)
2. `VS added` (`solventVolumeL`, L)
3. `CR` (`raffinateConcentrationMolPerL`, mol/L)
4. `CE` (`extractConcentrationMolPerL`, mol/L)
5. `AcOH in` (`incomingAcidAmountMol`, mol)
6. `Extracted this stage` (`extractAcidAmountMol`, mol)
7. `Remaining` (`raffinateAcidAmountMol`, mol)
8. `Cumulative extracted` (`cumulativeExtractedMol`, mol)
9. `Cumulative recovery` (`cumulativeRecoveryPercent`, %)
10. `MB absolute` (`massBalance.absoluteErrorMol`, mol)
11. `MB relative` (`massBalance.relativeErrorPercent`, %)

Stage 0 is included as the first row. The table must not hide a row merely because a value is zero. Numeric cells use a consistent display precision selected by the presentation layer; export includes canonical units and unrounded values where allowed.

## 4. Final summary

When state is `COMPLETED`, show `FinalResult`: initial acid amount, final raffinate amount/concentration, total extracted amount, final cumulative recovery, stage count, total solvent and final mass-balance status. Before completion, show a clear “calculation ready / playback in progress” status rather than a misleading final claim.

## 5. Chart contracts

### Chart A — Raffinate concentration

| Property | Contract |
|---|---|
| ID/title | `cr-by-stage`, “Nồng độ AcOH trong raffinate theo bậc” |
| X | stage number, integer 0…N |
| Y | `raffinateConcentrationMolPerL`, mol/L |
| Dataset | `charts.raffinateConcentration` |
| Stage 0 | point `(0,C0)` |
| Tooltip | stage, CR, mol/L, provenance/status note |
| Empty/loading | instruction until valid result; no invented zero |

### Chart B — Cumulative recovery

| Property | Contract |
|---|---|
| ID/title | `cumulative-recovery-by-stage`, “Thu hồi AcOH tích lũy theo bậc” |
| X | stage number 0…N |
| Y | `cumulativeRecoveryPercent`, % |
| Dataset | `charts.cumulativeRecovery` |
| Stage 0 | point `(0,0)` |
| Tooltip | stage, recovery %, initial amount context |
| Constraint | non-decreasing and `[0,100]` for valid inputs |

### Chart C — AcOH extracted per stage

| Property | Contract |
|---|---|
| ID/title | `extracted-per-stage`, “AcOH chiết được ở từng bậc” |
| X | stage number 1…N |
| Y | `extractAcidAmountMol`, mol |
| Dataset | `charts.extractedPerStage` |
| Stage 0 | omitted from this N-point dataset; table still shows zero |
| Tooltip | stage, extracted mol, solvent volume |
| Constraint | nonnegative; no cumulative value in this chart |

All chart data have a table alternative and downloadable label. Responsive containers preserve axes/units; color is supplemented by line style/pattern/labels. Chart update occurs only after a valid snapshot and after the corresponding state commits; charts do not run chemistry on render.

## 6. Mass balance presentation

For each stage display:

```text
incomingMol ≈ raffinateMol + extractMol
absoluteErrorMol = |residualMol|
relativeErrorPercent = 100*absoluteErrorMol/|incomingMol|, or 0 when incomingMol=0
```

`status=warning` may indicate floating-point residual. It is not an experimental acceptance result and must not be relabeled PASS/FAIL. A `fault` hides playback and shows a developer/user diagnostic.

## 7. Formatting and accessibility

Formatting is applied after engine output. Every value has an adjacent unit (`mol/L`, `L`, `mol`, `%`, or dimensionless). Screen readers receive the same stage/value text as visual labels. A high-contrast pattern and text label distinguish aqueous/organic; color alone is insufficient. Copy/export includes schema version, engine version, KD provenance, temperature status and displayed precision.
