import type { NormalizedSimulationInput, SimulationResult, Warning } from '../domain/models';

export interface ScenarioSnapshot {
  readonly id: string;
  readonly name: string;
  readonly input: NormalizedSimulationInput;
  readonly result: SimulationResult;
  readonly warnings: readonly Warning[];
}

export interface ScenarioComparison {
  readonly comparable: boolean;
  readonly warnings: readonly string[];
}

export function createScenarioSnapshot(
  id: string,
  name: string,
  result: SimulationResult,
): ScenarioSnapshot {
  return Object.freeze({
    id,
    name: name.trim(),
    input: result.inputCanonical,
    result,
    warnings: result.warnings,
  });
}

export function renameScenario(
  scenarios: readonly ScenarioSnapshot[],
  id: string,
  name: string,
): readonly ScenarioSnapshot[] {
  const nextName = name.trim();
  return scenarios.map((scenario) =>
    scenario.id === id ? Object.freeze({ ...scenario, name: nextName }) : scenario,
  );
}

export function removeScenario(
  scenarios: readonly ScenarioSnapshot[],
  id: string,
): readonly ScenarioSnapshot[] {
  return scenarios.filter((scenario) => scenario.id !== id);
}

export function compareScenarioBasis(scenarios: readonly ScenarioSnapshot[]): ScenarioComparison {
  if (scenarios.length < 2) return { comparable: true, warnings: [] };
  const baseline = scenarios[0].input;
  const mismatches = scenarios.slice(1).flatMap((scenario) => {
    const fields = basisMismatchFields(baseline, scenario.input);
    return fields.length === 0
      ? []
      : [`${scenario.name}: điều kiện so sánh khác (${fields.join(', ')}).`];
  });
  return { comparable: mismatches.length === 0, warnings: mismatches };
}

function basisMismatchFields(
  baseline: NormalizedSimulationInput,
  candidate: NormalizedSimulationInput,
): readonly string[] {
  const fields: string[] = [];
  if (baseline.c0MolPerL !== candidate.c0MolPerL) fields.push('C0');
  if (baseline.feedVolumeL !== candidate.feedVolumeL) fields.push('VR');
  if (baseline.totalSolventVolumeL !== candidate.totalSolventVolumeL) fields.push('VS,total');
  if (baseline.stageCount !== candidate.stageCount) fields.push('N');
  if (
    baseline.splitMode !== candidate.splitMode ||
    baseline.stageSolventVolumesL.some(
      (volume, index) => volume !== candidate.stageSolventVolumesL[index],
    )
  ) {
    fields.push('chia dung môi');
  }
  if (
    baseline.kd.value !== candidate.kd.value ||
    baseline.kd.sourceType !== candidate.kd.sourceType ||
    baseline.kd.referenceIdOrNote !== candidate.kd.referenceIdOrNote ||
    baseline.kd.validityDomainNote !== candidate.kd.validityDomainNote
  ) {
    fields.push('KD/provenance');
  }
  if (
    baseline.temperature.valueC !== candidate.temperature.valueC ||
    baseline.temperature.status !== candidate.temperature.status
  ) {
    fields.push('nhiệt độ');
  }
  return fields;
}
