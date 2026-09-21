import { describe, expect, it } from 'vitest';
import type { SimulationResult, StageResult } from '../../domain/models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { calculateValidatedSimulation } from '../../domain/calculation';
import {
  MAX_PHASE_HEIGHT,
  MIN_PHASE_HEIGHT,
  allocateParticles,
  createParticlePoints,
  mapPhaseVolumes,
} from './visualMapping';

function result(c0MolPerL: string = '0.5'): SimulationResult {
  const calculation = calculateValidatedSimulation({ ...USER_SUPPLIED_INPUT_FIXTURE, c0MolPerL });
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('visual mapping', () => {
  it('maps zero to no fill and larger volumes to no smaller heights', () => {
    expect(mapPhaseVolumes(0.1, 0)).toEqual({
      raffinateHeight: MAX_PHASE_HEIGHT,
      extractHeight: 0,
    });
    const mapped = mapPhaseVolumes(0.1, 0.02);
    expect(mapped.raffinateHeight).toBe(MAX_PHASE_HEIGHT);
    expect(mapped.extractHeight).toBeGreaterThanOrEqual(MIN_PHASE_HEIGHT);
    expect(mapped.extractHeight).toBeLessThanOrEqual(mapped.raffinateHeight);
  });

  it('allocates capacity from visual-plan fractions and zero particles for zero solute', () => {
    const populated = result();
    const stage = populated.stages[1];
    const allocation = allocateParticles(stage, populated.visualPlan);
    expect(allocation.raffinateCount + allocation.extractCount).toBe(
      populated.visualPlan.particleCapacity,
    );
    expect(allocation.extractCount).toBe(
      Math.round(populated.visualPlan.particleCapacity * stage.fractionExtracted),
    );

    const zero = result('0');
    expect(allocateParticles(zero.stages[1], zero.visualPlan)).toEqual({
      raffinateCount: 0,
      extractCount: 0,
    });
  });

  it('maps stage 0 entirely to the nominal aqueous phase', () => {
    const simulation = result();
    expect(allocateParticles(simulation.stages[0], simulation.visualPlan)).toEqual({
      raffinateCount: simulation.visualPlan.particleCapacity,
      extractCount: 0,
    });
  });

  it('creates deterministic particle points inside the clipped liquid drawing bounds', () => {
    const heights = mapPhaseVolumes(0.1, 0.02);
    const allocation = { raffinateCount: 71, extractCount: 29 };
    const first = createParticlePoints(1, allocation, heights);
    const second = createParticlePoints(1, allocation, heights);

    expect(second).toEqual(first);
    expect(first).toHaveLength(100);
    expect(first.every(({ x }) => x >= 228 && x <= 412)).toBe(true);
    expect(first.every(({ y }) => y >= 126 && y <= 470)).toBe(true);
  });

  it('returns no NaN or Infinity for a zero-height phase', () => {
    const points = createParticlePoints(
      0,
      { raffinateCount: 2, extractCount: 0 },
      mapPhaseVolumes(0.1, 0),
    );
    expect(points.flatMap(({ x, y }) => [x, y]).every(Number.isFinite)).toBe(true);
  });

  it('does not require or mutate a StageResult to map particles', () => {
    const simulation = result();
    const stage = simulation.stages[2];
    const before = JSON.stringify(stage);
    allocateParticles(stage as StageResult, simulation.visualPlan);
    expect(JSON.stringify(stage)).toBe(before);
  });
});
