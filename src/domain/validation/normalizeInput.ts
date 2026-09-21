import type { NormalizedSimulationInput, SimulationInput, SplitMode } from '../models';
import type { KdProvenance, TemperatureMetadata } from '../models/provenance';
import { parseFiniteNumber } from './parseInput';

export type VolumeUnit = 'L' | 'mL';

export function convertVolumeToLitres(value: number, unit: VolumeUnit): number {
  return unit === 'mL' ? value / 1000 : value;
}

export interface DisplayVolumeUnits {
  readonly feedVolume: VolumeUnit;
  readonly totalSolventVolume: VolumeUnit;
  readonly stageSolventVolumes: VolumeUnit;
}

/** Converts display volumes exactly once before canonical validation. */
export function applyVolumeUnitsAtBoundary(
  input: SimulationInput,
  units: DisplayVolumeUnits,
): SimulationInput {
  return {
    ...input,
    feedVolumeL: convertRawVolume(input.feedVolumeL, units.feedVolume),
    totalSolventVolumeL: convertRawVolume(input.totalSolventVolumeL, units.totalSolventVolume),
    stageSolventVolumesL:
      input.stageSolventVolumesL === null
        ? null
        : input.stageSolventVolumesL.map((value) =>
            convertRawVolume(value, units.stageSolventVolumes),
          ),
  };
}

function convertRawVolume(value: number | string, unit: VolumeUnit): number | string {
  if (unit === 'L') return value;
  const parsed = parseFiniteNumber(value);
  return parsed.ok ? convertVolumeToLitres(parsed.value, unit) : value;
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
