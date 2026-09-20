import { describe, expect, it } from 'vitest';
import type { SimulationResult, StageResult } from './result';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../validation/fixtures';
import { validateInput } from '../validation/validateInput';

const ZERO_MASS_BALANCE = Object.freeze({
  incomingMol: 0,
  raffinateMol: 0,
  extractMol: 0,
  residualMol: 0,
  absoluteErrorMol: 0,
  relativeErrorPercent: 0,
  status: 'ok' as const,
});

function stageFixture(stageNumber: number): StageResult {
  return Object.freeze({
    stageNumber,
    solventVolumeL: 0,
    incomingAcidAmountMol: 0,
    incomingRaffinateConcentrationMolPerL: 0,
    raffinateAcidAmountMol: 0,
    raffinateConcentrationMolPerL: 0,
    extractAcidAmountMol: 0,
    extractConcentrationMolPerL: 0,
    fractionRemaining: 0,
    fractionExtracted: 0,
    cumulativeExtractedMol: 0,
    cumulativeRecoveryPercent: 0,
    stageRecoveryPercent: 0,
    massBalance: ZERO_MASS_BALANCE,
  });
}

describe('canonical result model', () => {
  it('accepts one versioned shape with stage and chart lengths tied to N', () => {
    const normalized = validateInput({ ...USER_SUPPLIED_INPUT_FIXTURE, stageCount: 1 });
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) {
      return;
    }

    const resultFixture = {
      schemaVersion: 'test-schema-v1',
      engineVersion: 'test-engine-fixture-only',
      inputCanonical: normalized.value,
      provenance: {
        kd: normalized.value.kd,
        temperature: normalized.value.temperature,
        modelId: normalized.value.modelId,
      },
      warnings: normalized.warnings,
      numericTolerance: 0,
      stages: [stageFixture(0), stageFixture(1)],
      final: {
        initialAcidAmountMol: 0,
        finalRaffinateAcidAmountMol: 0,
        finalRaffinateConcentrationMolPerL: 0,
        totalExtractedAcidMol: 0,
        finalCumulativeRecoveryPercent: 0,
        stageCount: 1,
        totalSolventVolumeL: normalized.value.totalSolventVolumeL,
        finalMassBalance: ZERO_MASS_BALANCE,
      },
      charts: {
        raffinateConcentration: [
          { stageNumber: 0, value: 0 },
          { stageNumber: 1, value: 0 },
        ],
        cumulativeRecovery: [
          { stageNumber: 0, value: 0 },
          { stageNumber: 1, value: 0 },
        ],
        extractedPerStage: [{ stageNumber: 1, value: 0 }],
      },
      visualPlan: {
        particleCapacity: 0,
        stageFractions: [
          { stageNumber: 0, fractionExtracted: 0, fractionRemaining: 0 },
          { stageNumber: 1, fractionExtracted: 0, fractionRemaining: 0 },
        ],
        phaseVolumeInputs: [
          { stageNumber: 0, raffinateVolumeL: 0, extractVolumeL: 0 },
          { stageNumber: 1, raffinateVolumeL: 0, extractVolumeL: 0 },
        ],
      },
    } satisfies SimulationResult;

    expect(resultFixture.stages.map(({ stageNumber }) => stageNumber)).toEqual([0, 1]);
    expect(resultFixture.charts.raffinateConcentration).toHaveLength(2);
    expect(resultFixture.charts.cumulativeRecovery).toHaveLength(2);
    expect(resultFixture.charts.extractedPerStage).toHaveLength(1);
  });
});
