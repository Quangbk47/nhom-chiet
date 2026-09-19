# DATA MODEL AND API CONTRACT

## 1. Canonical request model
```json
{
  "c0MolPerL": 0.5,
  "feedVolumeL": 0.1,
  "totalSolventVolumeL": 0.08,
  "stageCount": 4,
  "splitMode": "equal",
  "stageSolventVolumesL": null,
  "kd": {"value": 1.2, "sourceType": "user_supplied", "referenceIdOrNote": "student test input", "validityDomainNote": null},
  "temperature": {"status": "pending", "valueC": null},
  "modelId": "constant-kd-v1"
}
```
Custom mode replaces null with N positive L values. API rejects unrecognised fields if strict schema mode is enabled; it never guesses units.

## 2. Result model
Result has `engineVersion`, `inputCanonical`, `provenance`, `warnings`, `numericTolerance`, `stages`, `final`, `charts`, `visualPlan`. A stage is:
`index, solventVolumeL, nInputMol, crMolPerL, ceMolPerL, nRaffinateMol, nExtractedMol, cumulativeExtractedMol, cumulativeRecoveryPercent, stageRecoveryPercent, massBalance{residualMol,relativePercent}`.
Stage 0 must be present. `final` is derived duplicate summary, not an independently calculated path. `charts.cr` and `charts.recovery` have N+1 points; `charts.extracted` N points.

## 3. REST contract
`POST /api/simulations/calculate` accepts request and returns complete result. 422 returns `{errors:[{code,field,message}]}`. 200 can include warnings. 500 returns generic error/correlation ID, never a partial scientific result. `POST /api/simulation-runs` persists a completed snapshot; `GET /api/simulation-runs/{id}` retrieves exact saved snapshot. Access/auth endpoints depend on later architecture and are not invented here.

## 4. Persistence entities
`scientific_reference`: status, data type, full citation, system, KD convention/value, temperature/domain, review/approval/version/audit. `simulation_run`: owner/time, canonical input JSON, result JSON, engine/reference versions. `experiment_condition`: linked run, protocol version, condition metadata. `experiment_replicate`: condition, stage, replicate number, CR mol/L, raw titration observations, entry/audit time. `validation_result`: derived metrics, included/excluded observations, threshold version nullable. Calculation engine must not import these tables.

## 5. CSV contract
UTF-8 CSV, one row per stage replicate. Required headers: `condition_id,replicate_no,stage_index,cr_mol_l`. Optional: `temperature_c,operator,notes`. Import validates headers, finite nonnegative CR, existing linked condition/stage, unique condition+stage+replicate, and metadata conflicts. Preview all row errors before confirmation. Transaction default is all-or-nothing; never silently skip bad rows.

## 6. Audit/retention rules
Raw replicate/titration values are immutable. Correction creates a superseding record with reason, actor/time and link to prior record. A derived validation result can be recomputed from raw records but retains engine/metric version. Deleting a run referenced by experiment is prohibited or soft-deleted with retained provenance.

## 7. Contract tests
Validate JSON schema, units, 422 field errors, stage 0/N lengths, no missing required output fields, snapshot round-trip, reference version retention, CSV errors/all-or-nothing, unique replicate rule, raw-record immutability, and API output equality with pure engine output.
