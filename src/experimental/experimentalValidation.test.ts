import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../domain/validation/fixtures';
import {
  calculateValidationMetrics,
  createManualRecord,
  parseExperimentalCsv,
  THRESHOLD_PENDING,
} from './experimentalValidation';

const calculation = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
if (!calculation.ok) throw new Error('fixture must be valid');
const result = calculation.value;

describe('experimental validation boundary', () => {
  it('normalizes manual comma input and preserves immutable metadata', () => {
    const parsed = createManualRecord(
      {
        conditionId: 'synthetic-test-only',
        replicateId: 'r1',
        stageNumber: '1',
        concentration: '0,2',
        notes: 'test-only',
      },
      result,
      '2026-01-01T00:00:00.000Z',
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.records[0]).toMatchObject({
        measuredRaffinateConcentrationMolPerL: 0.2,
        unit: 'mol/L',
        source: 'manual',
      });
      expect(Object.isFrozen(parsed.records[0])).toBe(true);
    }
  });
  it('rejects invalid CSV atomically, including headers, units/values and duplicates', () => {
    const invalid = parseExperimentalCsv(
      'condition_id,replicate_id,stage_number,cr_mol_per_l\na,r1,1,0.2\na,r1,1,-1',
      result,
      'x',
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors).toHaveLength(2);
    expect(
      parseExperimentalCsv(
        'condition_id,replicate_id,stage_number,cr_mg_per_l\na,r1,1,2',
        result,
        'x',
      ).ok,
    ).toBe(false);
  });
  it('calculates metric-only values, zero cases and replicate warning', () => {
    const records = parseExperimentalCsv(
      'condition_id,replicate_id,stage_number,cr_mol_per_l\nsynthetic,r1,1,0\nsynthetic,r2,1,0\nsynthetic,r3,1,0',
      result,
      'x',
    );
    expect(records.ok).toBe(true);
    if (records.ok) {
      const metrics = calculateValidationMetrics(records.records, result);
      expect(metrics.stages[1].relativeErrorPercent).toBeNull();
      expect(metrics.warnings).toContain('INSUFFICIENT_INDEPENDENT_REPLICATES');
      expect(THRESHOLD_PENDING).toContain('NOT EVALUATED');
    }
  });
});
