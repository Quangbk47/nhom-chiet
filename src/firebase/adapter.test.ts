import { describe, expect, it, vi } from 'vitest';
import { calculateValidatedSimulation } from '../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../domain/validation/fixtures';
import { createScenarioSnapshot } from '../scenarios/scenarioStore';
import { createManualRecord } from '../experimental/experimentalValidation';
import { FirebasePersistenceAdapter, saveWithLocalFallback } from './adapter';
import { serializeExperimentalBatch, serializeScenario } from './contracts';

const calculated = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
if (!calculated.ok) throw new Error('fixture invalid');
const document = serializeScenario(
  createScenarioSnapshot('s1', 'Synthetic test-only', calculated.value),
  '2026-01-01T00:00:00.000Z',
);

describe('Firebase persistence boundary', () => {
  it('roundtrips a detached immutable simulation snapshot', () => {
    expect(document.result).toEqual(calculated.value);
    expect(document.result).not.toBe(calculated.value);
    expect(Object.isFrozen(document)).toBe(true);
  });
  it('serializes experimental rows without mutating local records', () => {
    const parsed = createManualRecord(
      {
        conditionId: 'synthetic-test-only',
        replicateId: 'r1',
        stageNumber: '1',
        concentration: '0.2',
        notes: 'fixture',
      },
      calculated.value,
      '2026-01-01T00:00:00.000Z',
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const batch = serializeExperimentalBatch(
      parsed.records,
      calculated.value,
      '2026-01-01T00:00:00.000Z',
    );
    expect(batch.records).toEqual(parsed.records);
    expect(batch.records).not.toBe(parsed.records);
    expect(Object.isFrozen(batch.records)).toBe(true);
  });
  it('blocks writes before security approval', async () => {
    const save = vi.fn();
    const result = await new FirebasePersistenceAdapter({ save }, false).save(
      'simulation_run/s1',
      document,
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'permission-denied' } });
    expect(save).not.toHaveBeenCalled();
  });
  it.each([
    ['permission-denied', 'permission-denied', false],
    ['unavailable', 'unavailable', true],
    ['network-request-failed', 'offline', true],
  ])('maps %s and retains local state', async (driverCode, expectedCode, retryable) => {
    const local = Object.freeze([document]);
    const adapter = new FirebasePersistenceAdapter(
      { save: vi.fn().mockRejectedValue({ code: driverCode }) },
      true,
    );
    const outcome = await saveWithLocalFallback(local, () =>
      adapter.save('simulation_run/s1', document),
    );
    expect(outcome.localSnapshot).toBe(local);
    expect(outcome.cloud).toMatchObject({ ok: false, error: { code: expectedCode, retryable } });
  });
});
