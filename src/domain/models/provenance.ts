export type KdSourceType = 'user_supplied' | 'project_approved';

export type TemperatureStatus = 'declared';

export interface KdProvenance {
  readonly value: number;
  readonly sourceType: KdSourceType;
  readonly referenceIdOrNote: string;
  readonly validityDomainNote: string | null;
}

export interface TemperatureMetadata {
  readonly status: TemperatureStatus;
  readonly valueC: 25;
}
