import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../domain/validation/fixtures';
import {
  compareScenarioBasis,
  createScenarioSnapshot,
  removeScenario,
  renameScenario,
} from './scenarioStore';

function result(overrides: Partial<typeof USER_SUPPLIED_INPUT_FIXTURE> = {}) {
  const calculation = calculateValidatedSimulation({
    ...USER_SUPPLIED_INPUT_FIXTURE,
    ...overrides,
  });
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('immutable scenario snapshots', () => {
  it('keeps input/result references and does not mutate them while adding, renaming or removing', () => {
    const simulation = result();
    const serialized = JSON.stringify(simulation);
    const first = createScenarioSnapshot('scenario-1', 'Mẫu A', simulation);
    const renamed = renameScenario([first], first.id, 'Mẫu A đổi tên');
    const removed = removeScenario(renamed, first.id);

    expect(first.input).toBe(simulation.inputCanonical);
    expect(first.result).toBe(simulation);
    expect(renamed[0]).not.toBe(first);
    expect(renamed[0].result).toBe(simulation);
    expect(removed).toEqual([]);
    expect(JSON.stringify(simulation)).toBe(serialized);
  });

  it('reports basis/provenance differences without ranking scenarios', () => {
    const first = createScenarioSnapshot('scenario-1', 'A', result());
    const second = createScenarioSnapshot(
      'scenario-2',
      'B',
      result({ c0MolPerL: '0.4', kd: { ...USER_SUPPLIED_INPUT_FIXTURE.kd, value: '3' } }),
    );
    const comparison = compareScenarioBasis([first, second]);

    expect(comparison).toEqual({
      comparable: false,
      warnings: ['B: điều kiện so sánh khác (C0, KD/provenance).'],
    });
  });
});
