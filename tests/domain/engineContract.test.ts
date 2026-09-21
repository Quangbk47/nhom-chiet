import { describe, expect, it } from 'vitest';

import { calculateSimulation, calculateValidatedSimulation } from '../../src/domain/calculation';
import type {
  NormalizedSimulationInput,
  SimulationInput,
  SimulationResult,
} from '../../src/domain/models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../src/domain/validation/fixtures';
import { validateInput } from '../../src/domain/validation/validateInput';

function rawInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return { ...USER_SUPPLIED_INPUT_FIXTURE, ...overrides };
}

function normalizedInput(overrides: Partial<SimulationInput> = {}): NormalizedSimulationInput {
  const validation = validateInput(rawInput(overrides));
  if (!validation.ok) throw new Error(JSON.stringify(validation.errors));
  return validation.value;
}

function calculate(input: NormalizedSimulationInput): SimulationResult {
  const calculation = calculateSimulation(input);
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('Phase 5 engine contract and regression verification', () => {
  it('serializes one complete Stage 0…N snapshot without losing canonical fields', () => {
    const result = calculate(normalizedInput());
    const serialized = JSON.parse(JSON.stringify(result)) as SimulationResult;

    expect(serialized.schemaVersion).toBe('simulation-result@1');
    expect(serialized.engineVersion).toBe('constant-kd-engine@0.1.0');
    expect(serialized.stages.map(({ stageNumber }) => stageNumber)).toEqual([0, 1, 2, 3, 4]);
    expect(serialized.inputCanonical.stageSolventVolumesL).toEqual([0.02, 0.02, 0.02, 0.02]);
    expect(serialized.provenance).toEqual({
      kd: serialized.inputCanonical.kd,
      temperature: { status: 'declared', valueC: 25 },
      modelId: 'constant-kd-v1',
    });
    expect(serialized.stages.every((stage) => Object.values(stage).every(isSerializable))).toBe(
      true,
    );
  });

  it('derives final snapshot and chart datasets exactly from stage records', () => {
    const result = calculate(normalizedInput());
    const last = result.stages.at(-1);
    if (last === undefined) throw new Error('Expected final stage.');

    expect(result.final).toMatchObject({
      initialAcidAmountMol: result.stages[0].incomingAcidAmountMol,
      finalRaffinateAcidAmountMol: last.raffinateAcidAmountMol,
      finalRaffinateConcentrationMolPerL: last.raffinateConcentrationMolPerL,
      totalExtractedAcidMol: last.cumulativeExtractedMol,
      finalCumulativeRecoveryPercent: last.cumulativeRecoveryPercent,
      finalMassBalance: last.massBalance,
    });
    expect(result.charts.raffinateConcentration).toEqual(
      result.stages.map((stage) => ({
        stageNumber: stage.stageNumber,
        value: stage.raffinateConcentrationMolPerL,
      })),
    );
    expect(result.charts.cumulativeRecovery).toEqual(
      result.stages.map((stage) => ({
        stageNumber: stage.stageNumber,
        value: stage.cumulativeRecoveryPercent,
      })),
    );
    expect(result.charts.extractedPerStage).toEqual(
      result.stages.slice(1).map((stage) => ({
        stageNumber: stage.stageNumber,
        value: stage.extractAcidAmountMol,
      })),
    );
  });

  it('preserves per-stage concentration, amount, fraction and mass-balance relationships', () => {
    const result = calculate(normalizedInput());

    for (const stage of result.stages.slice(1)) {
      expect(stage.raffinateAcidAmountMol).toBeCloseTo(
        stage.raffinateConcentrationMolPerL * result.inputCanonical.feedVolumeL,
        14,
      );
      expect(stage.extractAcidAmountMol).toBeCloseTo(
        stage.extractConcentrationMolPerL * stage.solventVolumeL,
        14,
      );
      expect(stage.raffinateAcidAmountMol + stage.extractAcidAmountMol).toBeCloseTo(
        stage.incomingAcidAmountMol,
        14,
      );
      expect(stage.fractionRemaining + stage.fractionExtracted).toBeCloseTo(1, 14);
      expect(stage.massBalance.incomingMol).toBe(stage.incomingAcidAmountMol);
      expect(stage.massBalance.raffinateMol).toBe(stage.raffinateAcidAmountMol);
      expect(stage.massBalance.extractMol).toBe(stage.extractAcidAmountMol);
      expect(stage.massBalance.status).not.toBe('fault');
    }
  });

  it('propagates validation warnings and provenance into the immutable result', () => {
    const calculation = calculateValidatedSimulation(rawInput());
    expect(calculation.ok).toBe(true);
    if (!calculation.ok) return;

    expect(calculation.value.warnings.map(({ code }) => code)).toEqual([
      'USER_SUPPLIED_KD',
      'MISSING_KD_VALIDITY_DOMAIN',
    ]);
    expect(calculation.value.provenance.kd).toEqual(calculation.value.inputCanonical.kd);
    expect(Object.isFrozen(calculation.value.warnings)).toBe(true);
    expect(Object.isFrozen(calculation.value.provenance)).toBe(true);
  });

  it('keeps zero, one-stage and ten-stage boundary contracts finite and correctly sized', () => {
    for (const [stageCount, expectedLength] of [
      [1, 2],
      [10, 11],
    ] as const) {
      const result = calculate(normalizedInput({ c0MolPerL: 0, stageCount }));
      expect(result.stages).toHaveLength(expectedLength);
      expect(result.charts.extractedPerStage).toHaveLength(stageCount);
      expect(allNumbers(result)).toBe(true);
    }
  });

  it('preserves ordered custom solvent volumes and matches the sequential product oracle', () => {
    const input = normalizedInput({
      splitMode: 'custom',
      stageSolventVolumesL: [0.01, 0.02, 0.015, 0.035],
    });
    const result = calculate(input);
    const product = input.stageSolventVolumesL.reduce(
      (retained, solventVolumeL) =>
        retained * (input.feedVolumeL / (input.feedVolumeL + input.kd.value * solventVolumeL)),
      1,
    );

    expect(result.stages.slice(1).map(({ solventVolumeL }) => solventVolumeL)).toEqual(
      input.stageSolventVolumesL,
    );
    expect(result.final.finalRaffinateAcidAmountMol).toBeCloseTo(
      result.final.initialAcidAmountMol * product,
      14,
    );
  });

  it('is byte-deterministic and never mutates or aliases caller-owned input', () => {
    const source = structuredClone(normalizedInput());
    const before = JSON.stringify(source);
    const first = calculate(source);
    const second = calculate(source);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(source)).toBe(before);
    expect(first.inputCanonical).not.toBe(source);
    expect(first.inputCanonical.stageSolventVolumesL).not.toBe(source.stageSolventVolumesL);
    expect(Object.isFrozen(first.final)).toBe(true);
    expect(Object.isFrozen(first.final.finalMassBalance)).toBe(true);
    expect(Object.isFrozen(first.charts)).toBe(true);
    expect(Object.isFrozen(first.visualPlan)).toBe(true);
  });

  it.each([
    ['unsupported split mode', { splitMode: 'alternating' }, 'UNSUPPORTED_CONFIGURATION'],
    [
      'unsupported KD source type',
      { kd: { ...normalizedInput().kd, sourceType: 'guessed' } },
      'INVALID_PROVENANCE',
    ],
    [
      'malformed KD domain note',
      { kd: { ...normalizedInput().kd, validityDomainNote: 42 } },
      'INVALID_PROVENANCE',
    ],
    [
      'non-finite stage solvent',
      { stageSolventVolumesL: [0.02, 0.02, Infinity, 0.02] },
      'INVALID_SOLVENT_VOLUME',
    ],
  ])('rejects direct caller invariant bypass: %s', (_name, override, expectedCode) => {
    const forged = { ...normalizedInput(), ...override } as NormalizedSimulationInput;
    const calculation = calculateSimulation(forged);

    expect(calculation.ok).toBe(false);
    if (!calculation.ok) {
      expect(calculation.errors.some(({ code }) => code === expectedCode)).toBe(true);
    }
  });
});

function isSerializable(value: unknown): boolean {
  return typeof value !== 'number' || Number.isFinite(value);
}

function allNumbers(result: SimulationResult): boolean {
  const values = result.stages.flatMap((stage) => [
    stage.solventVolumeL,
    stage.incomingAcidAmountMol,
    stage.incomingRaffinateConcentrationMolPerL,
    stage.raffinateAcidAmountMol,
    stage.raffinateConcentrationMolPerL,
    stage.extractAcidAmountMol,
    stage.extractConcentrationMolPerL,
    stage.fractionRemaining,
    stage.fractionExtracted,
    stage.cumulativeExtractedMol,
    stage.cumulativeRecoveryPercent,
    stage.stageRecoveryPercent,
    stage.massBalance.residualMol,
    stage.massBalance.relativeErrorPercent,
  ]);
  return values.every(Number.isFinite);
}
