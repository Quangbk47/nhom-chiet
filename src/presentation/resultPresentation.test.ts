import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../domain/validation/fixtures';
import { chartDefinitions, stageAt } from './resultPresentation';

function fixture() {
  const calculation = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('Phase 9 result presentation mapping', () => {
  it('maps the three chart contracts by reference without calculating or mutating data', () => {
    const result = fixture();
    const before = JSON.stringify(result);
    const charts = chartDefinitions(result.charts);

    expect(charts.map((chart) => chart.id)).toEqual([
      'cr-by-stage',
      'cumulative-recovery-by-stage',
      'extracted-per-stage',
    ]);
    expect(charts[0].data).toBe(result.charts.raffinateConcentration);
    expect(charts[1].data).toBe(result.charts.cumulativeRecovery);
    expect(charts[2].data).toBe(result.charts.extractedPerStage);
    expect(JSON.stringify(result)).toBe(before);
  });

  it('selects only a precomputed StageResult and returns null outside Stage 0…N', () => {
    const result = fixture();
    expect(stageAt(result, 0)).toBe(result.stages[0]);
    expect(stageAt(result, 4)).toBe(result.stages[4]);
    expect(stageAt(result, 5)).toBeNull();
  });
});
