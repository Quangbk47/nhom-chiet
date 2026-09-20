import type { Warning } from './errors';
import type { NormalizedSimulationInput, SimulationInput } from './input';
import type { KdProvenance, TemperatureMetadata } from './provenance';

export interface StageInput {
  readonly stageNumber: number;
  readonly solventVolumeL: number;
  readonly incomingAcidAmountMol: number;
  readonly incomingRaffinateConcentrationMolPerL: number;
}

export interface MassBalanceCheck {
  readonly incomingMol: number;
  readonly raffinateMol: number;
  readonly extractMol: number;
  readonly residualMol: number;
  readonly absoluteErrorMol: number;
  readonly relativeErrorPercent: number;
  readonly status: 'ok' | 'warning' | 'fault';
}

export interface StageResult {
  readonly stageNumber: number;
  readonly solventVolumeL: number;
  readonly incomingAcidAmountMol: number;
  readonly incomingRaffinateConcentrationMolPerL: number;
  readonly raffinateAcidAmountMol: number;
  readonly raffinateConcentrationMolPerL: number;
  readonly extractAcidAmountMol: number;
  readonly extractConcentrationMolPerL: number;
  readonly fractionRemaining: number;
  readonly fractionExtracted: number;
  readonly cumulativeExtractedMol: number;
  readonly cumulativeRecoveryPercent: number;
  readonly stageRecoveryPercent: number;
  readonly massBalance: MassBalanceCheck;
}

export interface FinalResult {
  readonly initialAcidAmountMol: number;
  readonly finalRaffinateAcidAmountMol: number;
  readonly finalRaffinateConcentrationMolPerL: number;
  readonly totalExtractedAcidMol: number;
  readonly finalCumulativeRecoveryPercent: number;
  readonly stageCount: number;
  readonly totalSolventVolumeL: number;
  readonly finalMassBalance: MassBalanceCheck;
}

export interface ChartPoint {
  readonly stageNumber: number;
  readonly value: number;
}

export interface Charts {
  readonly raffinateConcentration: readonly ChartPoint[];
  readonly cumulativeRecovery: readonly ChartPoint[];
  readonly extractedPerStage: readonly ChartPoint[];
}

export interface VisualPlan {
  readonly particleCapacity: number;
  readonly stageFractions: readonly {
    readonly stageNumber: number;
    readonly fractionExtracted: number;
    readonly fractionRemaining: number;
  }[];
  readonly phaseVolumeInputs: readonly {
    readonly stageNumber: number;
    readonly raffinateVolumeL: number;
    readonly extractVolumeL: number;
  }[];
}

export interface SimulationResult {
  readonly schemaVersion: string;
  readonly engineVersion: string;
  readonly inputCanonical: NormalizedSimulationInput;
  readonly provenance: {
    readonly kd: KdProvenance;
    readonly temperature: TemperatureMetadata;
    readonly modelId: 'constant-kd-v1';
  };
  readonly warnings: readonly Warning[];
  readonly numericTolerance: number;
  readonly stages: readonly StageResult[];
  readonly final: FinalResult;
  readonly charts: Charts;
  readonly visualPlan: VisualPlan;
}

export interface PlaybackState {
  readonly state: string;
  readonly currentStageNumber: number;
  readonly speed: 0.5 | 1 | 2;
  readonly pausedFrom: string | null;
}

export type SimulationUiState =
  | { readonly kind: 'empty' }
  | {
      readonly kind: 'editing';
      readonly rawInput: SimulationInput;
      readonly errors: readonly import('./errors').ValidationError[];
    }
  | { readonly kind: 'calculating'; readonly rawInput: SimulationInput }
  | { readonly kind: 'ready'; readonly result: SimulationResult; readonly playback: PlaybackState }
  | {
      readonly kind: 'stale';
      readonly previous: SimulationResult;
      readonly rawInput: SimulationInput;
    }
  | {
      readonly kind: 'error';
      readonly errors: readonly import('./errors').ValidationError[];
      readonly rawInput: SimulationInput;
    };

export interface ExperimentalStageData {
  readonly conditionId: string;
  readonly replicateId: string;
  readonly stageNumber: number;
  readonly measuredRaffinateConcentrationMolPerL: number;
  readonly rawObservationRef?: string;
  readonly included: boolean;
  readonly exclusionReason?: string;
  readonly enteredAt: string;
}

export interface ValidationStageSummary {
  readonly stageNumber: number;
  readonly modelCRMolPerL: number;
  readonly replicateValuesMolPerL: readonly number[];
  readonly includedReplicateIds: readonly string[];
  readonly excludedReplicateIds: readonly string[];
  readonly n: number;
  readonly meanMolPerL: number | null;
  readonly sampleSdMolPerL: number | null;
  readonly absoluteErrorMolPerL: number | null;
  readonly relativeErrorPercent: number | null;
  readonly notes: readonly string[];
}
