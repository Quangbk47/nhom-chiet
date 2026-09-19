# UI/UX SPECIFICATION

## 1. Information architecture
Primary desktop screen has three persistent regions: **left Input**, **center Dynamic Extraction Simulation**, **right Current Results**. A lower region contains full stage table, graph tabs/sections and model assumptions. Narrow screens stack in order Input → Simulation → Results → Table/Graphs; no scientific content is hidden solely for mobile.

## 2. Single Simulation mode
Input panel fields: C0 (mol/L), feed volume (L; optional mL converter), total solvent volume (L), N, split mode, custom stage rows, KD value/source note/status, temperature status/value, validity-domain note. Inline errors name field and permitted range. Equal mode displays derived per-stage volume read-only. Custom mode shows exactly N rows and displays running total/difference. Start validates and calls API; it never locally calculates.

Current Result panel shows stage index, CR, CE, nR, nE, cumulative extracted amount, cumulative recovery, mass-balance residual/error, KD provenance and warnings. Final card shows n0, final CR/nR, total extracted, recovery, N, total solvent and final diagnostic.

## 3. Required result table and graphs
Table columns: stage, solvent added, CR, CE, extracted this stage, amount remaining, cumulative extracted, cumulative recovery, MB error. Stage 0 uses em dash for extract concentration/solvent. Graph A: CR vs stage 0…N; Graph B: cumulative recovery vs stage 0…N; Graph C: bar nE per stage 1…N. Graphs must provide accessible tabular data/download labels.

## 4. Scenario Comparison mode
User creates named scenarios. Each scenario has complete input/provenance and independent result snapshot. Comparison table lists common basis fields first, then final CR/recovery/solvent/N. When C0, VR, KD provenance, temperature, or total solvent differ, show `comparison conditions differ` warning. The UI may demonstrate result differences but must not state “optimal” or “experimentally superior.”

## 5. Experimental Validation mode
User first selects a saved run/condition; UI displays its input/provenance to prevent mismatching. Manual entry provides stage number and replicate rows. CSV import previews headers/rows/errors before save. View shows raw observations, n, mean, sample SD, model CR, AE/RE, overall MAE/RMSE and data-quality warnings. If n<3, show non-compliant. If threshold PENDING, show exactly `NOT EVALUATED — Project Owner validation threshold pending`.

## 6. Interaction/error states
States: empty, editing, invalid, calculating, result-ready, playing, paused, stale-after-edit, API-error, import-preview, validation-ready. Input edits after a successful calculation set stale state; old charts/results remain clearly labelled “previous calculation” or are hidden, never silently reused. API error displays correlation ID if supplied and preserves user input.

## 7. Accessibility/usability requirements
All inputs have labels/unit/help text; tab order follows left-to-right/top-to-bottom task flow; controls have keyboard names; colors have labels/patterns; chart data have table alternative; error summary links to fields; decimal entry supports locale display but submits canonical numeric JSON. Use explicit “mol/L”, “L”, “mol”, “%” next to values.

## 8. UI acceptance checks
Confirm 3-region desktop/stacked narrow layout; all mandatory inputs; validation disable/inline errors; stale state; required controls; three result graphs; no client-side science; warning/provenance visibility; manual/CSV parity; threshold pending display; accessible labels/table alternatives.
