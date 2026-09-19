# EXPERIMENTAL PROTOCOL — V1 PLANNING SPECIFICATION

## Safety boundary

This is a data-collection specification, not permission to conduct laboratory work. Approved laboratory SOP, SDS, supervisor and local PPE/waste rules control every operation. V1 remains blocked on study temperature, concentration range, volumes, titrant standardization, endpoint, contact/settling definition, apparatus and waste path.

## Purpose and primary measurement

Each condition compares model-predicted aqueous raffinate `CR` with measured `CR` after each stage. V1 quantifies AcOH by acid–base titration. Recovery is secondary and requires traceable data; it is not the primary validation variable.

## Condition record

Create `conditionId` before work. Record study title, operator/date, protocol version, system identity, feed lot/preparation, initial assay/C0, VR, N, every VS,i, solvent lot, temperature value/method, apparatus, mixing/separation handling, KD/reference/model version and deviations. Link exactly one simulation snapshot. A mismatch is a warning, never silently repaired.

## Independent replicates

At least three independent complete extraction runs are required per condition. Repeat titrations from one raffinate are supporting observations, not independent runs. Each replicate has its own ID and stage rows; blanks and standardization observations remain raw supporting data.

## Controlled sequence (only under approved SOP)

1. Verify safety, labels, waste and instrument/reagent readiness.
2. Prepare feed under approved method; record initial assay and conversion basis.
3. Measure nominal VR and temperature.
4. For stage 1, contact feed with fresh VS,1, mix/settle/collect per SOP and preserve stage identifier.
5. Titrate AcOH and store raw burette/sample/dilution/standardization observations plus calculated CR mol/L.
6. Retain aqueous raffinate as stage 2 feed, add fresh VS,2 and repeat through N.
7. Record emulsions, phase ambiguity, sample loss and deviations; never fabricate replacements.
8. Dispose/clean under local SOP and finalize review.

## Application data integrity

Manual and CSV capture normalize to `ExperimentalStageData` in `DATA_MODEL.md`. Raw records are append-only. Corrections create superseding records with reason, actor and timestamp. Exclusions remain visible with reviewer/reason. Firestore, if later enabled, stores snapshots/raw audit but is not required during the experiment or calculation.

## Completion checklist

Linked simulation exists; all stages have CR; ≥3 independent replicate IDs; unit conversions are traceable; temperature/KD provenance recorded; deviations reviewed; raw data archived; validation metrics reproducible. Missing evidence means incomplete, not failed.
