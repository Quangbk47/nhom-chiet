import type { NormalizedSimulationInput, SplitMode } from '../models';
import type { KdProvenance, TemperatureMetadata } from '../models/provenance';

export type VolumeUnit = 'L' | 'mL';

export function convertVolumeToLitres(value: number, unit: VolumeUnit): number {
  return unit === 'mL' ? value / 1000 : value;
}

export interface ParsedSimulationInput {
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

export function normalizeInput(input: ParsedSimulationInput): NormalizedSimulationInput {
  const stageSolventVolumesL =
    input.splitMode === 'equal'
      ? Array.from({ length: input.stageCount }, () => input.totalSolventVolumeL / input.stageCount)
      : [...input.stageSolventVolumesL];

  return Object.freeze({
    ...input,
    stageSolventVolumesL: Object.freeze(stageSolventVolumesL),
    kd: Object.freeze({ ...input.kd }),
    temperature: Object.freeze({ ...input.temperature }),
  });
}
