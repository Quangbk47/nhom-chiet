import type { SimulationResult } from '../domain/models';
import { parseFiniteNumber } from '../domain/validation/parseInput';

export const THRESHOLD_PENDING = 'NOT EVALUATED — Project Owner validation threshold pending';
export const METRIC_ONLY = 'V1 METRIC-ONLY — no PASS/FAIL acceptance threshold is defined.';

export interface ExperimentalRecord {
  readonly conditionId: string;
  readonly replicateId: string;
  readonly stageNumber: number;
  readonly measuredRaffinateConcentrationMolPerL: number;
  readonly included: boolean;
  readonly enteredAt: string;
  readonly source: 'manual' | 'csv';
  readonly unit: 'mol/L';
  readonly notes: string;
}

export interface ExperimentalError {
  readonly row: number;
  readonly field: string;
  readonly message: string;
}
export type ImportResult =
  | { readonly ok: true; readonly records: readonly ExperimentalRecord[] }
  | { readonly ok: false; readonly errors: readonly ExperimentalError[] };
export interface StageMetric {
  readonly stageNumber: number;
  readonly modelCRMolPerL: number;
  readonly values: readonly number[];
  readonly n: number;
  readonly meanMolPerL: number | null;
  readonly sampleSdMolPerL: number | null;
  readonly absoluteErrorMolPerL: number | null;
  readonly relativeErrorPercent: number | null;
  readonly notes: readonly string[];
}
export interface ValidationMetrics {
  readonly stages: readonly StageMetric[];
  readonly pairCount: number;
  readonly maeMolPerL: number | null;
  readonly rmseMolPerL: number | null;
  readonly warnings: readonly string[];
}

export function createManualRecord(
  raw: {
    conditionId: string;
    replicateId: string;
    stageNumber: string;
    concentration: string;
    notes: string;
  },
  result: SimulationResult,
  enteredAt: string,
): ImportResult {
  return normalizeRows(
    [[raw.conditionId, raw.replicateId, raw.stageNumber, raw.concentration, raw.notes]],
    result,
    'manual',
    enteredAt,
    1,
  );
}

export function parseExperimentalCsv(
  csv: string,
  result: SimulationResult,
  enteredAt: string,
): ImportResult {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
  if (lines.length === 0)
    return { ok: false, errors: [{ row: 1, field: 'csv', message: 'CSV không có dữ liệu.' }] };
  const headers = lines[0].split(',').map((header) => header.trim());
  const required = ['condition_id', 'replicate_id', 'stage_number', 'cr_mol_per_l'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length > 0)
    return {
      ok: false,
      errors: missing.map((field) => ({
        row: 1,
        field,
        message: `Thiếu header bắt buộc: ${field}.`,
      })),
    };
  const index = (header: string) => headers.indexOf(header);
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    return [
      values[index('condition_id')] ?? '',
      values[index('replicate_id')] ?? '',
      values[index('stage_number')] ?? '',
      values[index('cr_mol_per_l')] ?? '',
      values[index('notes')] ?? '',
    ];
  });
  return normalizeRows(rows, result, 'csv', enteredAt, 2);
}

function normalizeRows(
  rows: readonly (readonly string[])[],
  result: SimulationResult,
  source: ExperimentalRecord['source'],
  enteredAt: string,
  rowOffset: number,
): ImportResult {
  const errors: ExperimentalError[] = [];
  const records: ExperimentalRecord[] = [];
  const knownStages = new Set(result.stages.map((stage) => stage.stageNumber));
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const [conditionId, replicateId, stageRaw, concentrationRaw, notes] = row;
    const rowNumber = index + rowOffset;
    const stage = parseFiniteNumber(stageRaw);
    const concentration = parseFiniteNumber(concentrationRaw);
    if (!conditionId.trim())
      errors.push({ row: rowNumber, field: 'condition_id', message: 'Condition ID là bắt buộc.' });
    if (!replicateId.trim())
      errors.push({ row: rowNumber, field: 'replicate_id', message: 'Replicate ID là bắt buộc.' });
    if (
      !stage.ok ||
      !Number.isInteger(stage.ok ? stage.value : NaN) ||
      !knownStages.has(stage.ok ? stage.value : NaN)
    )
      errors.push({
        row: rowNumber,
        field: 'stage_number',
        message: 'Stage không thuộc simulation đã chọn.',
      });
    if (!concentration.ok || (concentration.ok && concentration.value < 0))
      errors.push({
        row: rowNumber,
        field: 'cr_mol_per_l',
        message: 'CR phải là số hữu hạn không âm, đơn vị mol/L.',
      });
    const key = `${conditionId}|${replicateId}|${stage.ok ? stage.value : stageRaw}`;
    if (seen.has(key))
      errors.push({
        row: rowNumber,
        field: 'duplicate',
        message: 'Trùng condition/replicate/stage.',
      });
    seen.add(key);
    if (
      stage.ok &&
      concentration.ok &&
      concentration.value >= 0 &&
      conditionId.trim() &&
      replicateId.trim()
    )
      records.push(
        Object.freeze({
          conditionId: conditionId.trim(),
          replicateId: replicateId.trim(),
          stageNumber: stage.value,
          measuredRaffinateConcentrationMolPerL: concentration.value,
          included: true,
          enteredAt,
          source,
          unit: 'mol/L',
          notes: notes.trim(),
        }),
      );
  });
  return errors.length > 0 ? { ok: false, errors } : { ok: true, records: Object.freeze(records) };
}

export function calculateValidationMetrics(
  records: readonly ExperimentalRecord[],
  result: SimulationResult,
): ValidationMetrics {
  const stages = result.stages.map((model) => {
    const values = records
      .filter((record) => record.included && record.stageNumber === model.stageNumber)
      .map((record) => record.measuredRaffinateConcentrationMolPerL);
    const n = values.length;
    const mean = n === 0 ? null : values.reduce((total, value) => total + value, 0) / n;
    const sd =
      n < 2 || mean === null
        ? null
        : Math.sqrt(values.reduce((total, value) => total + (value - mean) ** 2, 0) / (n - 1));
    const ae = mean === null ? null : Math.abs(model.raffinateConcentrationMolPerL - mean);
    const re =
      ae === null
        ? null
        : mean === 0
          ? model.raffinateConcentrationMolPerL === 0
            ? 0
            : null
          : (100 * ae) / Math.abs(mean);
    return Object.freeze({
      stageNumber: model.stageNumber,
      modelCRMolPerL: model.raffinateConcentrationMolPerL,
      values: Object.freeze(values),
      n,
      meanMolPerL: mean,
      sampleSdMolPerL: sd,
      absoluteErrorMolPerL: ae,
      relativeErrorPercent: re,
      notes: Object.freeze(n < 3 ? ['INSUFFICIENT_INDEPENDENT_REPLICATES'] : []),
    });
  });
  const comparable = stages.filter((stage) => stage.absoluteErrorMolPerL !== null);
  return Object.freeze({
    stages: Object.freeze(stages),
    pairCount: comparable.length,
    maeMolPerL:
      comparable.length === 0
        ? null
        : comparable.reduce((sum, stage) => sum + stage.absoluteErrorMolPerL!, 0) /
          comparable.length,
    rmseMolPerL:
      comparable.length === 0
        ? null
        : Math.sqrt(
            comparable.reduce((sum, stage) => sum + stage.absoluteErrorMolPerL! ** 2, 0) /
              comparable.length,
          ),
    warnings: Object.freeze(
      stages.some((stage) => stage.n < 3) ? ['INSUFFICIENT_INDEPENDENT_REPLICATES'] : [],
    ),
  });
}
