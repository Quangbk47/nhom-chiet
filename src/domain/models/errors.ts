export type ValidationErrorCode =
  | 'REQUIRED'
  | 'INVALID_NUMBER'
  | 'OUT_OF_RANGE'
  | 'INVALID_STAGE_COUNT'
  | 'INVALID_KD'
  | 'SPLIT_COUNT_MISMATCH'
  | 'INVALID_SOLVENT_VOLUME'
  | 'SPLIT_TOTAL_MISMATCH'
  | 'TEMPERATURE_NOT_V1_STANDARD'
  | 'UNAPPROVED_CONSTANT'
  | 'UNSUPPORTED_CONFIGURATION';

export interface ValidationError {
  readonly code: ValidationErrorCode;
  readonly field: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export type WarningCode = 'USER_SUPPLIED_KD' | 'MISSING_KD_VALIDITY_DOMAIN';

export interface Warning {
  readonly code: WarningCode;
  readonly message: string;
  readonly field?: string;
}

export interface DomainError {
  readonly category: 'INPUT_VALIDATION_ERROR' | 'CALCULATION_ERROR' | 'NUMERIC_ERROR';
  readonly code: string;
  readonly field?: string;
  readonly stageNumber?: number;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface PersistenceError {
  readonly category: 'FIREBASE_ERROR';
  readonly code: string;
  readonly message: string;
  readonly operation: 'save' | 'load' | 'import';
  readonly retryable: boolean;
}
