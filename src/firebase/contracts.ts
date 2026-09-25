import type { SimulationResult } from '../domain/models';
import type { ExperimentalRecord } from '../experimental/experimentalValidation';
import type { ScenarioSnapshot } from '../scenarios/scenarioStore';

export interface PersistedSimulationRun {
  readonly entityType: 'simulation_run';
  readonly schemaVersion: string;
  readonly savedAt: string;
  readonly name: string;
  readonly result: SimulationResult;
}
export interface PersistedExperimentalBatch {
  readonly entityType: 'experiment_replicate';
  readonly schemaVersion: '1';
  readonly savedAt: string;
  readonly simulationSchemaVersion: string;
  readonly records: readonly ExperimentalRecord[];
}
export type PersistableDocument = PersistedSimulationRun | PersistedExperimentalBatch;

export function serializeScenario(
  snapshot: ScenarioSnapshot,
  savedAt: string,
): PersistedSimulationRun {
  return deepFreeze({
    entityType: 'simulation_run',
    schemaVersion: snapshot.result.schemaVersion,
    savedAt,
    name: snapshot.name,
    result: structuredClone(snapshot.result),
  });
}

export function serializeExperimentalBatch(
  records: readonly ExperimentalRecord[],
  result: SimulationResult,
  savedAt: string,
): PersistedExperimentalBatch {
  return deepFreeze({
    entityType: 'experiment_replicate',
    schemaVersion: '1',
    savedAt,
    simulationSchemaVersion: result.schemaVersion,
    records: structuredClone(records),
  });
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}
