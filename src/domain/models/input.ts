import type { ValidationError, Warning } from './errors';
import type {
  KdProvenance,
  KdSourceType,
  TemperatureMetadata,
  TemperatureStatus,
} from './provenance';

export type SplitMode = 'equal' | 'custom';

export interface SimulationInput {
  readonly c0MolPerL: number | string;
  readonly feedVolumeL: number | string;
  readonly totalSolventVolumeL: number | string;
  readonly stageCount: number | string;
  readonly splitMode: SplitMode;
  readonly stageSolventVolumesL: ReadonlyArray<number | string> | null;
  readonly kd: {
    readonly value: number | string;
    readonly sourceType: KdSourceType;
    readonly referenceIdOrNote: string;
    readonly validityDomainNote: string | null;
  };
  readonly temperature: {
    readonly status: TemperatureStatus;
    readonly valueC: number | string;
  };
  readonly modelId: 'constant-kd-v1';
}

export interface NormalizedSimulationInput {
  readonly c0MolPerL: number;
  readonly feedVolumeL: number;
  readonly totalSolventVolumeL: number;
  readonly stageCount: number;
  readonly splitMode: SplitMode;
  readonly stageSolventVolumesL: readonly number[];
  readonly kd: KdProvenance;
  readonly temperature: TemperatureMetadata;
  readonly modelId: 'constant-kd-v1';
}

export type ValidationResult =
  | {
      readonly ok: true;
      readonly value: NormalizedSimulationInput;
      readonly warnings: readonly Warning[];
    }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };
