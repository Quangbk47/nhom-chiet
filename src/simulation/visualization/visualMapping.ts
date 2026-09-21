import type { StageResult, VisualPlan } from '../../domain/models';

export const FUNNEL_VIEWBOX = '0 0 640 720';
export const MIN_PHASE_HEIGHT = 64;
export const MAX_PHASE_HEIGHT = 168;
const SMALL_POSITIVE = 1e-12;

export interface PhaseHeights {
  readonly raffinateHeight: number;
  readonly extractHeight: number;
}

export interface ParticleAllocation {
  readonly raffinateCount: number;
  readonly extractCount: number;
}

export interface ParticlePoint {
  readonly id: string;
  readonly phase: 'raffinate' | 'extract';
  readonly x: number;
  readonly y: number;
}

export function mapPhaseVolumes(raffinateVolumeL: number, extractVolumeL: number): PhaseHeights {
  const referenceVolume = Math.max(raffinateVolumeL, extractVolumeL, SMALL_POSITIVE);
  return Object.freeze({
    raffinateHeight: volumeHeight(raffinateVolumeL, referenceVolume),
    extractHeight: volumeHeight(extractVolumeL, referenceVolume),
  });
}

export function allocateParticles(stage: StageResult, visualPlan: VisualPlan): ParticleAllocation {
  if (stage.incomingAcidAmountMol === 0) {
    return Object.freeze({ raffinateCount: 0, extractCount: 0 });
  }
  if (stage.stageNumber === 0) {
    return Object.freeze({ raffinateCount: visualPlan.particleCapacity, extractCount: 0 });
  }
  const fractions = visualPlan.stageFractions.find(
    ({ stageNumber }) => stageNumber === stage.stageNumber,
  );
  if (fractions === undefined) {
    return Object.freeze({ raffinateCount: 0, extractCount: 0 });
  }
  const extractCount = Math.round(visualPlan.particleCapacity * fractions.fractionExtracted);
  return Object.freeze({
    extractCount,
    raffinateCount: visualPlan.particleCapacity - extractCount,
  });
}

export function createParticlePoints(
  stageNumber: number,
  allocation: ParticleAllocation,
  heights: PhaseHeights,
): readonly ParticlePoint[] {
  const liquidBottom = 470;
  const raffinateTop = liquidBottom - heights.raffinateHeight;
  const extractTop = raffinateTop - heights.extractHeight;
  const raffinate = Array.from({ length: allocation.raffinateCount }, (_, index) =>
    point(stageNumber, index, 'raffinate', raffinateTop, liquidBottom),
  );
  const extract = Array.from({ length: allocation.extractCount }, (_, index) =>
    point(stageNumber, index, 'extract', extractTop, raffinateTop),
  );
  return Object.freeze([...raffinate, ...extract]);
}

function volumeHeight(volume: number, referenceVolume: number): number {
  if (volume <= 0) return 0;
  const normalized = clamp(volume / referenceVolume, 0, 1);
  return MIN_PHASE_HEIGHT + normalized * (MAX_PHASE_HEIGHT - MIN_PHASE_HEIGHT);
}

function point(
  stageNumber: number,
  index: number,
  phase: ParticlePoint['phase'],
  top: number,
  bottom: number,
): ParticlePoint {
  const phaseSeed = phase === 'extract' ? 31 : 73;
  const xUnit = deterministicUnit(stageNumber, index, phaseSeed);
  const yUnit = deterministicUnit(stageNumber, index, phaseSeed + 47);
  const safeTop = Math.min(top, bottom - 8);
  return Object.freeze({
    id: `${phase}-${stageNumber}-${index}`,
    phase,
    x: 228 + xUnit * 184,
    y: safeTop + 4 + yUnit * Math.max(1, bottom - safeTop - 8),
  });
}

function deterministicUnit(stageNumber: number, index: number, salt: number): number {
  const value = Math.sin((stageNumber + 1) * 12.9898 + (index + 1) * 78.233 + salt) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
