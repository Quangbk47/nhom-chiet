# EXPERIMENTAL PROTOCOL — V1 PLANNING SOP

## 1. Status and safety boundary
This is a data-collection specification, not an authorization to conduct laboratory work. The laboratory’s approved SOP, SDS, supervisor and local waste/PPE rules control actual operation. V1 conditions that remain BLOCKED: study temperature, concentration range, solvent/feed volumes, titrant concentration/standardization, endpoint method, contact/settling definition, apparatus and waste path.

## 2. Purpose and primary measurement
Each experimental condition tests predicted versus measured aqueous raffinate AcOH concentration `CR` after each extraction stage. V1 quantification method is acid–base titration. Recovery may be calculated secondarily only from traceable data; it is not the primary validation variable.

## 3. Condition design record
Create a unique `condition_id` before work. Record: study title, operator/date, protocol version, system identity, feed preparation/lot, initial assay and C0 mol/L, VR L, stage count, every VS,i L, solvent lot, temperature value/method of measurement, apparatus, mixing/separation handling, KD/reference/model version, and deviations. The linked simulation must use the same declared condition. Mismatch is a validation warning, not silently ignored.

## 4. Independent replicate definition
A condition requires at least three **independent complete extraction runs**. Replicates are not repeated titrations from one raffinate sample. Each replicate has its own ID and stage records. Repeat titrations, blanks and standardization observations may be stored as raw supporting data but do not replace independent extraction replicates.

## 5. Controlled procedure sequence
1. Verify approved SOP/safety, labels and waste containers; record instrument/reagent readiness.
2. Prepare aqueous feed using approved procedure; determine/record initial AcOH concentration and conversion basis.
3. Measure/record nominal feed volume VR and study temperature.
4. Execute stage 1: contact feed with the defined fresh `VS,1`; perform mixing/settling/phase collection exactly per approved SOP; collect the aqueous raffinate sample without changing stage identifier.
5. Titrate AcOH using the approved acid–base SOP. Store raw burette/sample/dilution/standardization observations and calculated CR mol/L, not merely final typed CR.
6. Use retained aqueous raffinate as feed to next stage; add fresh solvent `VS,i`; repeat 4–5 through N.
7. Record incidents, emulsions, sample loss, phase ambiguity or deviation. Do not fabricate a replacement value.
8. Dispose/clean according to local SOP; finalize data review.

## 6. Data integrity rules
Raw observations are append-only. A correction creates a superseding record with rationale, actor and timestamp. An excluded replicate remains stored with explicit exclusion reason and reviewer; validation reports included/excluded counts. Never tune KD to reduce current error. A proposed revised KD is a separate Candidate reference requiring the lifecycle in `REFERENCE_DATA.md`.

## 7. Completion checklist
For every condition: linked run exists; each stage has CR values; ≥3 independent replicate IDs; units/conversions are traceable; temperature/KD provenance recorded; deviations reviewed; raw data archived; validation results reproducible. Missing item means condition is incomplete, not failed.
