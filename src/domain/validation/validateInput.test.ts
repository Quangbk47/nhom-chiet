import { describe, expect, it } from 'vitest';
import type { SimulationInput, ValidationErrorCode } from '../models';
import { USER_SUPPLIED_INPUT_FIXTURE } from './fixtures';
import { validateInput } from './validateInput';

function input(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    ...USER_SUPPLIED_INPUT_FIXTURE,
    ...overrides,
    kd: overrides.kd ?? { ...USER_SUPPLIED_INPUT_FIXTURE.kd },
    temperature: overrides.temperature ?? { ...USER_SUPPLIED_INPUT_FIXTURE.temperature },
  };
}

function expectError(result: ReturnType<typeof validateInput>, code: ValidationErrorCode): void {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors.some((error) => error.code === code)).toBe(true);
  }
}

describe('validateInput', () => {
  it('normalizes a valid equal split and returns typed provenance warnings', () => {
    const result = validateInput(input());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        c0MolPerL: 0.5,
        feedVolumeL: 0.1,
        totalSolventVolumeL: 0.08,
        stageCount: 4,
        temperature: { status: 'declared', valueC: 25 },
      });
      expect(result.value.stageSolventVolumesL).toEqual([0.02, 0.02, 0.02, 0.02]);
      expect(result.warnings.map(({ code }) => code)).toEqual([
        'USER_SUPPLIED_KD',
        'MISSING_KD_VALIDITY_DOMAIN',
      ]);
      expect(Object.isFrozen(result.value)).toBe(true);
      expect(Object.isFrozen(result.value.stageSolventVolumesL)).toBe(true);
    }
  });

  it.each([1, 10])('accepts stage-count boundary %i', (stageCount) => {
    const result = validateInput(input({ stageCount }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.stageSolventVolumesL).toHaveLength(stageCount);
    }
  });

  it.each([0, 11, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid stage count %s',
    (stageCount) => {
      expectError(validateInput(input({ stageCount })), 'INVALID_STAGE_COUNT');
    },
  );

  it('accepts scientific notation and comma decimal text', () => {
    const result = validateInput(input({ c0MolPerL: '5e-1', feedVolumeL: '0,1' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.c0MolPerL).toBe(0.5);
      expect(result.value.feedVolumeL).toBe(0.1);
    }
  });

  it.each([
    ['c0MolPerL', -1, 'OUT_OF_RANGE'],
    ['feedVolumeL', 0, 'OUT_OF_RANGE'],
    ['totalSolventVolumeL', -1, 'OUT_OF_RANGE'],
  ] as const)('rejects invalid %s', (field, value, code) => {
    expectError(validateInput(input({ [field]: value })), code);
  });

  it.each(['', 'NaN', 'Infinity', '0x10', '1 L'])('rejects malformed input %j', (value) => {
    expectError(
      validateInput(input({ c0MolPerL: value })),
      value.trim() === '' ? 'REQUIRED' : 'INVALID_NUMBER',
    );
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid KD %s', (value) => {
    const result = validateInput(input({ kd: { ...USER_SUPPLIED_INPUT_FIXTURE.kd, value } }));
    expectError(result, 'INVALID_KD');
  });

  it('accepts a valid ordered custom split without changing its values', () => {
    const result = validateInput(
      input({
        stageCount: 3,
        splitMode: 'custom',
        totalSolventVolumeL: 0.06,
        stageSolventVolumesL: [0.01, 0.02, 0.03],
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.stageSolventVolumesL).toEqual([0.01, 0.02, 0.03]);
    }
  });

  it('rejects custom count, non-positive values and sum mismatches', () => {
    expectError(
      validateInput(input({ splitMode: 'custom', stageSolventVolumesL: [0.04] })),
      'SPLIT_COUNT_MISMATCH',
    );
    expectError(
      validateInput(input({ splitMode: 'custom', stageSolventVolumesL: [0.02, 0.02, 0, 0.04] })),
      'INVALID_SOLVENT_VOLUME',
    );
    expectError(
      validateInput(input({ splitMode: 'custom', stageSolventVolumesL: [0.01, 0.01, 0.01, 0.01] })),
      'SPLIT_TOTAL_MISMATCH',
    );
  });

  it('rejects non-25 temperature rather than supplying another value', () => {
    expectError(
      validateInput(input({ temperature: { status: 'declared', valueC: 20 } })),
      'TEMPERATURE_NOT_V1_STANDARD',
    );
  });

  it('rejects a project-approved KD without a matching approved record', () => {
    const result = validateInput(
      input({
        kd: {
          ...USER_SUPPLIED_INPUT_FIXTURE.kd,
          sourceType: 'project_approved',
          referenceIdOrNote: 'missing-reference',
        },
      }),
    );
    expectError(result, 'UNAPPROVED_CONSTANT');
  });

  it('accepts a project-approved KD only when the caller provides the approved record ID', () => {
    const approvedInput = input({
      kd: {
        ...USER_SUPPLIED_INPUT_FIXTURE.kd,
        sourceType: 'project_approved',
        referenceIdOrNote: 'approved-record-v1',
        validityDomainNote: 'Test-only reviewed domain note.',
      },
    });
    expect(validateInput(approvedInput).ok).toBe(false);
    expect(
      validateInput(approvedInput, {
        approvedKdReferenceIds: new Set(['approved-record-v1']),
      }).ok,
    ).toBe(true);
  });
});
