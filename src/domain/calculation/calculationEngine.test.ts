import { describe, expect, it } from 'vitest';

import type { NormalizedSimulationInput, SimulationInput } from '../models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../validation/fixtures';
import { validateInput } from '../validation/validateInput';
import { calculateSimulation, calculateValidatedSimulation } from './calculationEngine';

function validInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return { ...USER_SUPPLIED_INPUT_FIXTURE, ...overrides };
}

function normalized(overrides: Partial<SimulationInput> = {}): NormalizedSimulationInput {
  const result = validateInput(validInput(overrides));
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
}

function resultOrThrow(input: NormalizedSimulationInput) {
  const result = calculateSimulation(input);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
}

describe('pure calculation engine — T01–T10', () => {
  it('T01: produces N+1 all-zero reports for C0=0', () => {
    const result = resultOrThrow(normalized({ c0MolPerL: '0' }));

    expect(result.stages).toHaveLength(5);
    expect(result.charts.extractedPerStage).toHaveLength(4);
    for (const stage of result.stages) {
      expect(stage.raffinateAcidAmountMol).toBe(0);
      expect(stage.extractAcidAmountMol).toBe(0);
      expect(stage.raffinateConcentrationMolPerL).toBe(0);
      expect(stage.extractConcentrationMolPerL).toBe(0);
      expect(stage.cumulativeRecoveryPercent).toBe(0);
    }
  });

  it('T02/T03: includes stage 0 through N for N=1 and N=10', () => {
    const one = resultOrThrow(normalized({ stageCount: '1' }));
    const ten = resultOrThrow(normalized({ stageCount: '10' }));

    expect(one.stages.map((stage) => stage.stageNumber)).toEqual([0, 1]);
    expect(ten.stages).toHaveLength(11);
    expect(ten.charts.raffinateConcentration).toHaveLength(11);
    expect(ten.charts.cumulativeRecovery).toHaveLength(11);
    expect(ten.charts.extractedPerStage).toHaveLength(10);
  });

  it('T04/T05: reports typed faults when defensive callers bypass boundary validation', () => {
    const invalidStageCount = { ...normalized(), stageCount: 0 } as NormalizedSimulationInput;
    const invalidKd = {
      ...normalized(),
      kd: { ...normalized().kd, value: 0 },
    } as NormalizedSimulationInput;

    const stageFailure = calculateSimulation(invalidStageCount);
    const kdFailure = calculateSimulation(invalidKd);

    expect(stageFailure.ok).toBe(false);
    expect(kdFailure.ok).toBe(false);
    if (!stageFailure.ok && !kdFailure.ok) {
      expect(stageFailure.errors.some((error) => error.code === 'INVALID_STAGE_COUNT')).toBe(true);
      expect(kdFailure.errors.some((error) => error.code === 'INVALID_KD')).toBe(true);
    }
  });

  it('T06/T08: validation boundary prevents invalid values and split configurations from producing a result', () => {
    const invalidNumbers = calculateValidatedSimulation(validInput({ c0MolPerL: '-1' }));
    const invalidCustomSplit = calculateValidatedSimulation(
      validInput({ splitMode: 'custom', stageSolventVolumesL: ['0.02', '0', '0.02', '0.04'] }),
    );

    expect(invalidNumbers).toMatchObject({ ok: false, errors: [{ field: 'c0MolPerL' }] });
    expect(invalidCustomSplit).toMatchObject({
      ok: false,
      errors: [{ code: 'INVALID_SOLVENT_VOLUME' }],
    });
  });

  it('T07: equal and identical custom allocations have equivalent snapshots', () => {
    const equal = resultOrThrow(normalized());
    const custom = resultOrThrow(
      normalized({ splitMode: 'custom', stageSolventVolumesL: ['0.02', '0.02', '0.02', '0.02'] }),
    );

    expect(custom.stages).toEqual(equal.stages);
    expect(custom.final).toEqual(equal.final);
  });

  it('T09: matches the documented software reference case and invariants', () => {
    const result = resultOrThrow(normalized());
    const last = result.stages[4];

    expect(last.raffinateConcentrationMolPerL).toBeCloseTo(0.130154102457, 12);
    expect(last.extractConcentrationMolPerL).toBeCloseTo(0.260308204914, 11);
    expect(last.raffinateAcidAmountMol).toBeCloseTo(0.013015410246, 12);
    expect(last.cumulativeRecoveryPercent).toBeCloseTo(73.9691795086, 9);
    for (const stage of result.stages.slice(1)) {
      expect(stage.massBalance.absoluteErrorMol).toBeLessThanOrEqual(result.numericTolerance);
      expect(stage.extractConcentrationMolPerL / stage.raffinateConcentrationMolPerL).toBeCloseTo(
        2,
        12,
      );
      expect(stage.massBalance.status).not.toBe('fault');
    }
  });

  it('T10: is deterministic and does not mutate the normalized input', () => {
    const input = normalized();
    const before = JSON.stringify(input);
    const first = resultOrThrow(input);
    const second = resultOrThrow(input);

    expect(second).toEqual(first);
    expect(JSON.stringify(input)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.stages)).toBe(true);
    expect(Object.isFrozen(first.stages[0])).toBe(true);
    expect(Object.isFrozen(first.charts.raffinateConcentration)).toBe(true);
  });
});
