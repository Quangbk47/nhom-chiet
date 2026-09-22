# DATA MODEL — TYPESCRIPT AND PERSISTENCE CONTRACT

This is the canonical serialized shape. `CALCULATION_ENGINE.md` defines arithmetic; this document defines names, units, nullability and ownership. UI code must not invent a second `StageResult` vocabulary.

## Shared types

```ts
type SplitMode = 'equal' | 'custom';
type KdSourceType = 'user_supplied' | 'project_approved';
type TemperatureStatus = 'declared';

interface KdProvenance {
  value: number;                    // dimensionless, finite > 0
  sourceType: KdSourceType;
  referenceIdOrNote: string;        // approved ID or user note, non-empty
  validityDomainNote: string | null;
}
interface TemperatureMetadata { status: TemperatureStatus; valueC: 25; }
interface Warning { code: string; message: string; field?: string; }
interface ValidationError { code: string; field: string; message: string; details?: unknown; }
```

## Inputs

```ts
interface SimulationInput {
  c0MolPerL: number | string; feedVolumeL: number | string;
  totalSolventVolumeL: number | string; stageCount: number | string;
  splitMode: SplitMode;
  stageSolventVolumesL: Array<number | string> | null;
  kd: KdProvenance & { value: number | string };
  temperature: TemperatureMetadata & { valueC: number | string };
  modelId: 'constant-kd-v1';
}
interface NormalizedSimulationInput {
  c0MolPerL: number; feedVolumeL: number; totalSolventVolumeL: number;
  stageCount: number; splitMode: SplitMode; stageSolventVolumesL: number[];
  kd: KdProvenance; temperature: TemperatureMetadata;
  modelId: 'constant-kd-v1';
}
```

Normalized input contains finite canonical values: concentrations `mol/L`, volumes `L`, KD dimensionless, and the declared V1 temperature `25 °C`. It is created once at the boundary and frozen for a run. A numeric KD default is not implied by this temperature decision.

## Stage and mass balance

```ts
interface StageInput {
  stageNumber: number;              // 0..N; zero is feed
  solventVolumeL: number;           // zero for stage 0
  incomingAcidAmountMol: number;
  incomingRaffinateConcentrationMolPerL: number;
}
interface MassBalanceCheck {
  incomingMol: number; raffinateMol: number; extractMol: number;
  residualMol: number; absoluteErrorMol: number;
  relativeErrorPercent: number;     // zero when incoming is zero
  status: 'ok' | 'warning' | 'fault';
}
interface StageResult {
  stageNumber: number;
  solventVolumeL: number;
  incomingAcidAmountMol: number;
  incomingRaffinateConcentrationMolPerL: number;
  raffinateAcidAmountMol: number;
  raffinateConcentrationMolPerL: number;
  extractAcidAmountMol: number;
  extractConcentrationMolPerL: number;
  fractionRemaining: number;
  fractionExtracted: number;
  cumulativeExtractedMol: number;
  cumulativeRecoveryPercent: number;
  stageRecoveryPercent: number;
  massBalance: MassBalanceCheck;
}
```

`extractAcidAmountMol` is the canonical field for the UI label “extracted this stage”; do not serialize a duplicate alias. Stage 0 uses numeric zeros; the table may display an em dash for a not-applicable extract concentration.

## Simulation result

```ts
interface FinalResult {
  initialAcidAmountMol: number;
  finalRaffinateAcidAmountMol: number;
  finalRaffinateConcentrationMolPerL: number;
  totalExtractedAcidMol: number;
  finalCumulativeRecoveryPercent: number;
  stageCount: number; totalSolventVolumeL: number;
  finalMassBalance: MassBalanceCheck;
}
interface ChartPoint { stageNumber: number; value: number; }
interface Charts {
  raffinateConcentration: ChartPoint[]; // N+1, stage 0..N
  cumulativeRecovery: ChartPoint[];     // N+1, stage 0..N
  extractedPerStage: ChartPoint[];      // N, stage 1..N
}
interface VisualPlan {
  particleCapacity: number;
  stageFractions: Array<{ stageNumber: number; fractionExtracted: number; fractionRemaining: number }>;
  phaseVolumeInputs: Array<{ stageNumber: number; raffinateVolumeL: number; extractVolumeL: number }>;
}
interface SimulationResult {
  schemaVersion: string; engineVersion: string;
  inputCanonical: NormalizedSimulationInput;
  provenance: { kd: KdProvenance; temperature: TemperatureMetadata; modelId: 'constant-kd-v1' };
  warnings: Warning[]; numericTolerance: number;
  stages: readonly StageResult[]; // exactly N+1
  final: FinalResult; charts: Charts; visualPlan: VisualPlan;
}
```

`SimulationResult` is frozen after construction. Presentation may format strings but may not change numeric fields or recalculate them. `final` and all chart arrays are derived from `stages`, never an independent arithmetic path.

## UI state

```ts
type SimulationUiState =
  | { kind: 'empty' }
  | { kind: 'editing'; rawInput: SimulationInput; errors: ValidationError[] }
  | { kind: 'calculating'; rawInput: SimulationInput }
  | { kind: 'ready'; result: SimulationResult; playback: PlaybackState }
  | { kind: 'stale'; previous: SimulationResult; rawInput: SimulationInput }
  | { kind: 'error'; errors: ValidationError[]; rawInput: SimulationInput };
interface PlaybackState {
  state: string; currentStageNumber: number; speed: 0.5 | 1 | 2;
  pausedFrom: string | null;
}
```

## Experimental records

```ts
interface ExperimentalStageData {
  conditionId: string; replicateId: string; stageNumber: number;
  measuredRaffinateConcentrationMolPerL: number;
  rawObservationRef?: string; included: boolean;
  exclusionReason?: string; enteredAt: string;
  source: 'manual' | 'csv'; unit: 'mol/L'; notes: string;
}
interface ValidationStageSummary {
  stageNumber: number; modelCRMolPerL: number;
  replicateValuesMolPerL: number[]; includedReplicateIds: string[];
  excludedReplicateIds: string[]; n: number;
  meanMolPerL: number | null; sampleSdMolPerL: number | null;
  absoluteErrorMolPerL: number | null; relativeErrorPercent: number | null;
  notes: string[];
}
```

At least three independent extraction replicates are required for compliance. `relativeErrorPercent` is null when the observed mean is zero and prediction is nonzero; it is zero when both are zero.

Phase 11 keeps captured rows in immutable local snapshots. Every row retains input source, canonical unit, UTC entry timestamp and note. CSV parsing is all-or-nothing: errors are reported before any row is added.

## CSV and persistence

UTF-8 CSV required headers: `condition_id,replicate_id,stage_number,cr_mol_per_l`; optional `temperature_c,operator,notes`. For V1, `temperature_c` must be 25 when supplied. Validate finite nonnegative CR, existing condition/stage, unique condition+replicate+stage and metadata match. Preview all errors; save all rows atomically or none.

Optional Firestore entities are `scientific_reference`, `simulation_run`, `experiment_condition`, `experiment_replicate` and `validation_result`. The engine imports none. A saved run contains the complete snapshot, canonical input, engine version and provenance. Raw observations are append-only; corrections point to prior IDs. A field change increments `schemaVersion` and updates this file, input/output specs and tests.
