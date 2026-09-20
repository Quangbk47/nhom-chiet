import type {
  KdSourceType,
  SimulationInput,
  SplitMode,
  ValidationError,
  ValidationResult,
  Warning,
} from '../models';
import { normalizeInput, type ParsedSimulationInput } from './normalizeInput';
import { parseFiniteNumber } from './parseInput';

const REQUIRED_MESSAGE = 'Vui lòng nhập giá trị.';
const INVALID_NUMBER_MESSAGE = 'Giá trị phải là số hữu hạn.';

export interface ValidationOptions {
  readonly approvedKdReferenceIds?: ReadonlySet<string>;
}

export function validateInput(
  rawInput: SimulationInput,
  options: ValidationOptions = {},
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: Warning[] = [];

  const c0MolPerL = parseField(rawInput.c0MolPerL, 'c0MolPerL', errors);
  const feedVolumeL = parseField(rawInput.feedVolumeL, 'feedVolumeL', errors);
  const totalSolventVolumeL = parseField(
    rawInput.totalSolventVolumeL,
    'totalSolventVolumeL',
    errors,
  );
  const stageCount = parseField(rawInput.stageCount, 'stageCount', errors, {
    invalidCode: 'INVALID_STAGE_COUNT',
    invalidMessage: 'Số bậc phải là số nguyên từ 1 đến 10.',
  });
  const kdValue = parseField(rawInput.kd.value, 'kd.value', errors, {
    invalidCode: 'INVALID_KD',
    invalidMessage: 'KD phải lớn hơn 0.',
  });
  const temperatureValue = parseField(rawInput.temperature.valueC, 'temperature.valueC', errors);

  if (c0MolPerL !== null && c0MolPerL < 0) {
    errors.push(error('OUT_OF_RANGE', 'c0MolPerL', 'C0 phải lớn hơn hoặc bằng 0 mol/L.'));
  }
  validatePositiveVolume(feedVolumeL, 'feedVolumeL', errors);
  validatePositiveVolume(totalSolventVolumeL, 'totalSolventVolumeL', errors);

  if (stageCount !== null && (!Number.isInteger(stageCount) || stageCount < 1 || stageCount > 10)) {
    errors.push(
      error('INVALID_STAGE_COUNT', 'stageCount', 'Số bậc phải là số nguyên từ 1 đến 10.'),
    );
  }

  if (kdValue !== null && kdValue <= 0) {
    errors.push(error('INVALID_KD', 'kd.value', 'KD phải lớn hơn 0.'));
  }

  if (temperatureValue !== null && temperatureValue !== 25) {
    errors.push(
      error(
        'TEMPERATURE_NOT_V1_STANDARD',
        'temperature.valueC',
        'V1 sử dụng nhiệt độ chuẩn cố định 25 °C.',
      ),
    );
  }

  validateConfiguration(rawInput, errors);
  validateProvenance(rawInput.kd, options, errors, warnings);

  const parsedStageVolumes = validateStageVolumes(
    rawInput.splitMode,
    rawInput.stageSolventVolumesL,
    stageCount,
    totalSolventVolumeL,
    errors,
  );

  if (
    errors.length > 0 ||
    c0MolPerL === null ||
    feedVolumeL === null ||
    totalSolventVolumeL === null ||
    stageCount === null ||
    kdValue === null ||
    temperatureValue === null
  ) {
    return { ok: false, errors: Object.freeze(errors) };
  }

  const parsed: ParsedSimulationInput = {
    c0MolPerL,
    feedVolumeL,
    totalSolventVolumeL,
    stageCount,
    splitMode: rawInput.splitMode,
    stageSolventVolumesL: parsedStageVolumes,
    kd: {
      value: kdValue,
      sourceType: rawInput.kd.sourceType,
      referenceIdOrNote: rawInput.kd.referenceIdOrNote.trim(),
      validityDomainNote: normalizeOptionalText(rawInput.kd.validityDomainNote),
    },
    temperature: { status: 'declared', valueC: 25 },
    modelId: 'constant-kd-v1',
  };

  return {
    ok: true,
    value: normalizeInput(parsed),
    warnings: Object.freeze(warnings),
  };
}

function parseField(
  rawValue: number | string,
  field: string,
  errors: ValidationError[],
  invalidOverride?: {
    readonly invalidCode: ValidationError['code'];
    readonly invalidMessage: string;
  },
): number | null {
  const result = parseFiniteNumber(rawValue);
  if (result.ok) {
    return result.value;
  }

  errors.push(
    error(
      result.reason === 'required'
        ? 'REQUIRED'
        : (invalidOverride?.invalidCode ?? 'INVALID_NUMBER'),
      field,
      result.reason === 'required'
        ? REQUIRED_MESSAGE
        : (invalidOverride?.invalidMessage ?? INVALID_NUMBER_MESSAGE),
    ),
  );
  return null;
}

function validatePositiveVolume(
  value: number | null,
  field: string,
  errors: ValidationError[],
): void {
  if (value !== null && value <= 0) {
    errors.push(error('OUT_OF_RANGE', field, 'Thể tích phải lớn hơn 0.'));
  }
}

function validateConfiguration(rawInput: SimulationInput, errors: ValidationError[]): void {
  if (!isSplitMode(rawInput.splitMode)) {
    errors.push(
      error('UNSUPPORTED_CONFIGURATION', 'splitMode', 'Cách chia dung môi không được hỗ trợ.'),
    );
  }
  if (rawInput.temperature.status !== 'declared') {
    errors.push(
      error(
        'UNSUPPORTED_CONFIGURATION',
        'temperature.status',
        'Trạng thái nhiệt độ V1 không được hỗ trợ.',
      ),
    );
  }
  if (rawInput.modelId !== 'constant-kd-v1') {
    errors.push(error('UNSUPPORTED_CONFIGURATION', 'modelId', 'Mô hình V1 không được hỗ trợ.'));
  }
}

function validateProvenance(
  kd: SimulationInput['kd'],
  options: ValidationOptions,
  errors: ValidationError[],
  warnings: Warning[],
): void {
  const reference = kd.referenceIdOrNote.trim();
  if (!isKdSourceType(kd.sourceType)) {
    errors.push(error('UNSUPPORTED_CONFIGURATION', 'kd.sourceType', 'Nguồn KD không được hỗ trợ.'));
    return;
  }
  if (reference.length === 0) {
    errors.push(error('REQUIRED', 'kd.referenceIdOrNote', REQUIRED_MESSAGE));
  }
  if (
    kd.sourceType === 'project_approved' &&
    (reference.length === 0 || !options.approvedKdReferenceIds?.has(reference))
  ) {
    errors.push(
      error(
        'UNAPPROVED_CONSTANT',
        'kd.referenceIdOrNote',
        'KD này chưa có reference được Project Owner duyệt.',
      ),
    );
  }
  if (kd.sourceType === 'user_supplied') {
    warnings.push({
      code: 'USER_SUPPLIED_KD',
      field: 'kd.value',
      message: 'User-supplied KD — not a project-approved default.',
    });
  }
  if (normalizeOptionalText(kd.validityDomainNote) === null) {
    warnings.push({
      code: 'MISSING_KD_VALIDITY_DOMAIN',
      field: 'kd.validityDomainNote',
      message: 'KD validity domain is not supplied; this result is exploratory.',
    });
  }
}

function validateStageVolumes(
  splitMode: SplitMode,
  rawVolumes: ReadonlyArray<number | string> | null,
  stageCount: number | null,
  totalSolventVolumeL: number | null,
  errors: ValidationError[],
): readonly number[] {
  if (splitMode === 'equal') {
    return [];
  }

  const volumes = rawVolumes ?? [];
  if (stageCount !== null && volumes.length !== stageCount) {
    errors.push(
      error('SPLIT_COUNT_MISMATCH', 'stageSolventVolumesL', 'Cần đúng N giá trị dung môi.'),
    );
  }

  const parsed = volumes.map((rawVolume, index) => {
    const field = `stageSolventVolumesL.${index}`;
    const value = parseField(rawVolume, field, errors);
    if (value !== null && value <= 0) {
      errors.push(error('INVALID_SOLVENT_VOLUME', field, 'Mỗi thể tích dung môi phải lớn hơn 0.'));
    }
    return value;
  });

  if (parsed.every((value): value is number => value !== null) && totalSolventVolumeL !== null) {
    const sum = parsed.reduce((total, value) => total + value, 0);
    const tolerance = Math.max(1e-12, 1e-9 * totalSolventVolumeL);
    if (Math.abs(sum - totalSolventVolumeL) > tolerance) {
      errors.push(
        error(
          'SPLIT_TOTAL_MISMATCH',
          'stageSolventVolumesL',
          'Tổng chia dung môi phải bằng tổng dung môi trong sai số kỹ thuật cho phép.',
          { sum, expected: totalSolventVolumeL, tolerance },
        ),
      );
    }
  }

  return parsed.filter((value): value is number => value !== null);
}

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function isSplitMode(value: string): value is SplitMode {
  return value === 'equal' || value === 'custom';
}

function isKdSourceType(value: string): value is KdSourceType {
  return value === 'user_supplied' || value === 'project_approved';
}

function error(
  code: ValidationError['code'],
  field: string,
  message: string,
  details?: Readonly<Record<string, unknown>>,
): ValidationError {
  return details === undefined ? { code, field, message } : { code, field, message, details };
}
