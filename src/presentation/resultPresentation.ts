import type { ChartPoint, Charts, SimulationResult, StageResult } from '../domain/models';

export interface ChartDefinition {
  readonly id: 'cr-by-stage' | 'cumulative-recovery-by-stage' | 'extracted-per-stage';
  readonly title: string;
  readonly unit: 'mol/L' | '%' | 'mol';
  readonly data: readonly ChartPoint[];
  readonly color: string;
  readonly kind: 'line' | 'bar';
}

export function chartDefinitions(charts: Charts): readonly ChartDefinition[] {
  return [
    {
      id: 'cr-by-stage',
      title: 'Nồng độ AcOH trong raffinate theo bậc',
      unit: 'mol/L',
      data: charts.raffinateConcentration,
      color: '#1769aa',
      kind: 'line',
    },
    {
      id: 'cumulative-recovery-by-stage',
      title: 'Thu hồi AcOH tích lũy theo bậc',
      unit: '%',
      data: charts.cumulativeRecovery,
      color: '#147a4b',
      kind: 'line',
    },
    {
      id: 'extracted-per-stage',
      title: 'AcOH chiết được ở từng bậc',
      unit: 'mol',
      data: charts.extractedPerStage,
      color: '#9a5a00',
      kind: 'bar',
    },
  ];
}

export function stageAt(result: SimulationResult, stageNumber: number): StageResult | null {
  return result.stages[stageNumber] ?? null;
}

export function formatResultValue(value: number): string {
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  return magnitude < 0.001 || magnitude >= 10000
    ? value.toExponential(5)
    : value.toLocaleString('vi-VN', { maximumSignificantDigits: 7 });
}
