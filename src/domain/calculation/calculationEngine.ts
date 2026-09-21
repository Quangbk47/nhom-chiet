import type {
  DomainError,
  FinalResult,
  MassBalanceCheck,
  NormalizedSimulationInput,
  SimulationInput,
  SimulationResult,
  StageResult,
  ValidationError,
  Warning,
} from '../models';
import { validateInput, type ValidationOptions } from '../validation/validateInput';

export const DEFAULT_NUMERIC_TOLERANCE = 1e-12;
export const DEFAULT_ENGINE_VERSION = 'constant-kd-engine@0.1.0';
const SCHEMA_VERSION = 'simulation-result@1';
const PARTICLE_CAPACITY = 100;

export interface EngineOptions {
  readonly engineVersion?: string;
  readonly numericTolerance?: number;
}

export type CalculationResult =
  | { readonly ok: true; readonly value: SimulationResult }
  | { readonly ok: false; readonly errors: readonly DomainError[] };

export type ValidatedCalculationResult =
  CalculationResult | { readonly ok: false; readonly errors: readonly ValidationError[] };

/**
 * Calculates a complete immutable V1 snapshot from an already normalized input.
 * This function is pure: it performs no I/O, display formatting, or state updates.
 */
export function calculateSimulation(
  input: NormalizedSimulationInput,
  options: EngineOptions = {},
): CalculationResult {
  const numericTolerance = options.numericTolerance ?? DEFAULT_NUMERIC_TOLERANCE;
  const engineVersion = options.engineVersion ?? DEFAULT_ENGINE_VERSION;
  const validationErrors = defensiveValidate(input, numericTolerance);

  if (validationErrors.length > 0) {
    return { ok: false, errors: freezeArray(validationErrors) };
  }

  const initialAcidAmountMol = input.c0MolPerL * input.feedVolumeL;
  if (!Number.isFinite(initialAcidAmountMol)) {
    return calculationError('NUMERIC_ERROR', 'Initial acid amount is not finite.');
  }

  const stages: StageResult[] = [makeStageZero(input, initialAcidAmountMol)];
  let previousRaffinateMol = initialAcidAmountMol;

  for (let index = 0; index < input.stageCount; index += 1) {
    const stageNumber = index + 1;
    const solventVolumeL = input.stageSolventVolumesL[index];
    const denominator = input.feedVolumeL + input.kd.value * solventVolumeL;

    if (!Number.isFinite(denominator) || denominator <= 0) {
      return calculationError('NUMERIC_ERROR', 'Stage denominator is invalid.', stageNumber);
    }

    const raffinateConcentrationMolPerL = previousRaffinateMol / denominator;
    const extractConcentrationMolPerL = input.kd.value * raffinateConcentrationMolPerL;
    const raffinateAcidAmountMol = raffinateConcentrationMolPerL * input.feedVolumeL;
    const extractAcidAmountMol = extractConcentrationMolPerL * solventVolumeL;
    const residualMol = previousRaffinateMol - raffinateAcidAmountMol - extractAcidAmountMol;
    const massBalance = makeMassBalance(
      previousRaffinateMol,
      raffinateAcidAmountMol,
      extractAcidAmountMol,
      residualMol,
      numericTolerance,
    );
    const stage = freezeObject({
      stageNumber,
      solventVolumeL,
      incomingAcidAmountMol: previousRaffinateMol,
      incomingRaffinateConcentrationMolPerL: previousRaffinateMol / input.feedVolumeL,
      raffinateAcidAmountMol,
      raffinateConcentrationMolPerL,
      extractAcidAmountMol,
      extractConcentrationMolPerL,
      fractionRemaining:
        previousRaffinateMol === 0 ? 0 : raffinateAcidAmountMol / previousRaffinateMol,
      fractionExtracted:
        previousRaffinateMol === 0 ? 0 : extractAcidAmountMol / previousRaffinateMol,
      cumulativeExtractedMol: initialAcidAmountMol - raffinateAcidAmountMol,
      cumulativeRecoveryPercent:
        initialAcidAmountMol === 0
          ? 0
          : (100 * (initialAcidAmountMol - raffinateAcidAmountMol)) / initialAcidAmountMol,
      stageRecoveryPercent:
        previousRaffinateMol === 0 ? 0 : (100 * extractAcidAmountMol) / previousRaffinateMol,
      massBalance,
    });

    const invariantError = assertStageInvariants(stage, input.kd.value, numericTolerance);
    if (invariantError !== null) {
      return calculationError(invariantError, 'Stage invariant failed.', stageNumber, { stage });
    }
    stages.push(stage);
    previousRaffinateMol = raffinateAcidAmountMol;
  }

  const simulationInvariantError = assertSimulationInvariants(
    stages,
    initialAcidAmountMol,
    numericTolerance,
  );
  if (simulationInvariantError !== null) {
    return calculationError(simulationInvariantError, 'Simulation invariant failed.');
  }

  const frozenStages = freezeArray(stages);
  const lastStage = frozenStages[frozenStages.length - 1];
  const final = freezeObject<FinalResult>({
    initialAcidAmountMol,
    finalRaffinateAcidAmountMol: lastStage.raffinateAcidAmountMol,
    finalRaffinateConcentrationMolPerL: lastStage.raffinateConcentrationMolPerL,
    totalExtractedAcidMol: lastStage.cumulativeExtractedMol,
    finalCumulativeRecoveryPercent: lastStage.cumulativeRecoveryPercent,
    stageCount: input.stageCount,
    totalSolventVolumeL: input.totalSolventVolumeL,
    finalMassBalance: lastStage.massBalance,
  });
  const charts = freezeObject({
    raffinateConcentration: freezeArray(
      frozenStages.map((stage) =>
        freezeObject({
          stageNumber: stage.stageNumber,
          value: stage.raffinateConcentrationMolPerL,
        }),
      ),
    ),
    cumulativeRecovery: freezeArray(
      frozenStages.map((stage) =>
        freezeObject({ stageNumber: stage.stageNumber, value: stage.cumulativeRecoveryPercent }),
      ),
    ),
    extractedPerStage: freezeArray(
      frozenStages
        .slice(1)
        .map((stage) =>
          freezeObject({ stageNumber: stage.stageNumber, value: stage.extractAcidAmountMol }),
        ),
    ),
  });
  const visualPlan = freezeObject({
    particleCapacity: PARTICLE_CAPACITY,
    stageFractions: freezeArray(
      frozenStages.slice(1).map((stage) =>
        freezeObject({
          stageNumber: stage.stageNumber,
          fractionExtracted: stage.fractionExtracted,
          fractionRemaining: stage.fractionRemaining,
        }),
      ),
    ),
    phaseVolumeInputs: freezeArray(
      frozenStages.slice(1).map((stage) =>
        freezeObject({
          stageNumber: stage.stageNumber,
          raffinateVolumeL: input.feedVolumeL,
          extractVolumeL: stage.solventVolumeL,
        }),
      ),
    ),
  });

  const inputCanonical = freezeCanonicalInput(input);
  const result = freezeObject<SimulationResult>({
    schemaVersion: SCHEMA_VERSION,
    engineVersion,
    inputCanonical,
    provenance: freezeObject({
      kd: inputCanonical.kd,
      temperature: inputCanonical.temperature,
      modelId: inputCanonical.modelId,
    }),
    warnings: freezeArray<Warning>([]),
    numericTolerance,
    stages: frozenStages,
    final,
    charts,
    visualPlan,
  });
  return { ok: true, value: result };
}

/** Validates raw boundary input before calling the normalized-only engine. */
export function calculateValidatedSimulation(
  rawInput: SimulationInput,
  validationOptions: ValidationOptions = {},
  engineOptions: EngineOptions = {},
): ValidatedCalculationResult {
  const validation = validateInput(rawInput, validationOptions);
  if (!validation.ok) {
    return validation;
  }
  const calculation = calculateSimulation(validation.value, engineOptions);
  if (!calculation.ok) {
    return calculation;
  }
  return {
    ok: true,
    value: freezeObject({ ...calculation.value, warnings: freezeArray(validation.warnings) }),
  };
}

function makeStageZero(
  input: NormalizedSimulationInput,
  initialAcidAmountMol: number,
): StageResult {
  return freezeObject({
    stageNumber: 0,
    solventVolumeL: 0,
    incomingAcidAmountMol: initialAcidAmountMol,
    incomingRaffinateConcentrationMolPerL: input.c0MolPerL,
    raffinateAcidAmountMol: initialAcidAmountMol,
    raffinateConcentrationMolPerL: input.c0MolPerL,
    extractAcidAmountMol: 0,
    extractConcentrationMolPerL: 0,
    fractionRemaining: 0,
    fractionExtracted: 0,
    cumulativeExtractedMol: 0,
    cumulativeRecoveryPercent: 0,
    stageRecoveryPercent: 0,
    massBalance: makeMassBalance(initialAcidAmountMol, initialAcidAmountMol, 0, 0, 0),
  });
}

function makeMassBalance(
  incomingMol: number,
  raffinateMol: number,
  extractMol: number,
  residualMol: number,
  numericTolerance: number,
): MassBalanceCheck {
  const absoluteErrorMol = Math.abs(residualMol);
  const relativeErrorPercent =
    incomingMol === 0 ? 0 : (100 * absoluteErrorMol) / Math.abs(incomingMol);
  const threshold = scaledTolerance(incomingMol, numericTolerance);
  return freezeObject({
    incomingMol,
    raffinateMol,
    extractMol,
    residualMol,
    absoluteErrorMol,
    relativeErrorPercent,
    status: absoluteErrorMol === 0 ? 'ok' : absoluteErrorMol <= threshold ? 'warning' : 'fault',
  });
}

function defensiveValidate(
  input: NormalizedSimulationInput,
  numericTolerance: number,
): DomainError[] {
  const errors: DomainError[] = [];
  const isFiniteNumber = (value: number): boolean => Number.isFinite(value);
  if (!Number.isFinite(numericTolerance) || numericTolerance <= 0) {
    errors.push(
      domainError(
        'INVALID_NUMERIC_TOLERANCE',
        'numericTolerance must be finite and greater than zero.',
      ),
    );
  }
  if (!isFiniteNumber(input.c0MolPerL) || input.c0MolPerL < 0)
    errors.push(
      domainError('INVALID_INPUT', 'C0 must be finite and nonnegative.', undefined, 'c0MolPerL'),
    );
  if (!isFiniteNumber(input.feedVolumeL) || input.feedVolumeL <= 0)
    errors.push(
      domainError(
        'INVALID_INPUT',
        'Feed volume must be finite and positive.',
        undefined,
        'feedVolumeL',
      ),
    );
  if (!isFiniteNumber(input.totalSolventVolumeL) || input.totalSolventVolumeL <= 0)
    errors.push(
      domainError(
        'INVALID_INPUT',
        'Total solvent volume must be finite and positive.',
        undefined,
        'totalSolventVolumeL',
      ),
    );
  if (!Number.isInteger(input.stageCount) || input.stageCount < 1 || input.stageCount > 10)
    errors.push(
      domainError(
        'INVALID_STAGE_COUNT',
        'Stage count must be an integer from 1 to 10.',
        undefined,
        'stageCount',
      ),
    );
  if (!isFiniteNumber(input.kd.value) || input.kd.value <= 0)
    errors.push(
      domainError('INVALID_KD', 'KD must be finite and greater than zero.', undefined, 'kd.value'),
    );
  if (input.temperature.status !== 'declared' || input.temperature.valueC !== 25)
    errors.push(
      domainError('INVALID_TEMPERATURE', 'V1 requires declared 25 °C.', undefined, 'temperature'),
    );
  if (input.modelId !== 'constant-kd-v1')
    errors.push(
      domainError('UNSUPPORTED_CONFIGURATION', 'Model is not supported.', undefined, 'modelId'),
    );
  if (input.stageSolventVolumesL.length !== input.stageCount)
    errors.push(
      domainError(
        'SPLIT_COUNT_MISMATCH',
        'Stage solvent volume count must match stage count.',
        undefined,
        'stageSolventVolumesL',
      ),
    );
  const volumeSum = input.stageSolventVolumesL.reduce((sum, volume) => sum + volume, 0);
  const allocationTolerance = Math.max(1e-12, 1e-9 * input.totalSolventVolumeL);
  if (input.stageSolventVolumesL.some((volume) => !isFiniteNumber(volume) || volume <= 0))
    errors.push(
      domainError(
        'INVALID_SOLVENT_VOLUME',
        'Each stage solvent volume must be finite and positive.',
        undefined,
        'stageSolventVolumesL',
      ),
    );
  if (
    !Number.isFinite(volumeSum) ||
    Math.abs(volumeSum - input.totalSolventVolumeL) > allocationTolerance
  )
    errors.push(
      domainError(
        'SPLIT_TOTAL_MISMATCH',
        'Stage solvent volumes do not match the total.',
        undefined,
        'stageSolventVolumesL',
      ),
    );
  if (input.kd.referenceIdOrNote.trim().length === 0)
    errors.push(
      domainError(
        'INVALID_PROVENANCE',
        'KD provenance note is required.',
        undefined,
        'kd.referenceIdOrNote',
      ),
    );
  return errors;
}

function assertStageInvariants(stage: StageResult, kd: number, tolerance: number): string | null {
  const values = [
    stage.raffinateConcentrationMolPerL,
    stage.extractConcentrationMolPerL,
    stage.raffinateAcidAmountMol,
    stage.extractAcidAmountMol,
  ];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return 'NUMERIC_ERROR';
  if (stage.massBalance.absoluteErrorMol > scaledTolerance(stage.incomingAcidAmountMol, tolerance))
    return 'MASS_BALANCE_FAULT';
  if (
    stage.raffinateConcentrationMolPerL > 0 &&
    Math.abs(stage.extractConcentrationMolPerL / stage.raffinateConcentrationMolPerL - kd) >
      tolerance * Math.max(1, kd)
  )
    return 'KD_RATIO_FAULT';
  return null;
}

function assertSimulationInvariants(
  stages: readonly StageResult[],
  initialMol: number,
  tolerance: number,
): string | null {
  for (let index = 1; index < stages.length; index += 1) {
    const previous = stages[index - 1];
    const current = stages[index];
    if (
      current.raffinateAcidAmountMol - previous.raffinateAcidAmountMol >
      scaledTolerance(initialMol, tolerance)
    )
      return 'MONOTONICITY_FAULT';
    if (
      previous.cumulativeRecoveryPercent - current.cumulativeRecoveryPercent > tolerance ||
      current.cumulativeRecoveryPercent < -tolerance ||
      current.cumulativeRecoveryPercent > 100 + tolerance
    )
      return 'RECOVERY_RANGE_FAULT';
  }
  return null;
}

function scaledTolerance(value: number, numericTolerance: number): number {
  return numericTolerance * Math.max(1, Math.abs(value));
}

function calculationError(
  code: string,
  message: string,
  stageNumber?: number,
  details?: Readonly<Record<string, unknown>>,
): CalculationResult {
  return {
    ok: false,
    errors: freezeArray([domainError(code, message, stageNumber, undefined, details)]),
  };
}

function domainError(
  code: string,
  message: string,
  stageNumber?: number,
  field?: string,
  details?: Readonly<Record<string, unknown>>,
): DomainError {
  return {
    category: 'CALCULATION_ERROR',
    code,
    message,
    ...(stageNumber === undefined ? {} : { stageNumber }),
    ...(field === undefined ? {} : { field }),
    ...(details === undefined ? {} : { details }),
  };
}

function freezeArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

function freezeCanonicalInput(input: NormalizedSimulationInput): NormalizedSimulationInput {
  return freezeObject({
    ...input,
    stageSolventVolumesL: freezeArray(input.stageSolventVolumesL),
    kd: freezeObject({ ...input.kd }),
    temperature: freezeObject({ ...input.temperature }),
  });
}

function freezeObject<T extends object>(value: T): Readonly<T> {
  return Object.freeze(value);
}
