import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../../domain/calculation';
import type { SimulationResult } from '../../domain/models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { ResultCharts } from './ResultCharts';
import { ResultPanel } from './ResultPanel';
import { StageTable } from './StageTable';

function fixture(): SimulationResult {
  const calculation = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('Phase 9 result components — T12/T17', () => {
  it('renders Stage 0…N with all 11 labelled columns, canonical units and zero values', () => {
    const result = fixture();
    render(<StageTable result={result} />);
    const table = screen.getByRole('table', { name: /Kết quả Stage 0 đến Stage 4/ });

    expect(within(table).getAllByRole('columnheader')).toHaveLength(11);
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(within(table).getByRole('columnheader', { name: 'CR (mol/L)' })).toBeVisible();
    expect(within(table).getByRole('rowheader', { name: '0' })).toBeVisible();
  });

  it('shows current fields, provenance and warnings without an early final claim', () => {
    const result = fixture();
    render(<ResultPanel result={result} stageNumber={0} phase="READY" />);

    expect(screen.getByText('Nồng độ raffinate (CR)')).toBeVisible();
    expect(screen.getByText(/Software-test fixture only/)).toBeVisible();
    expect(screen.getByText('Nhiệt độ: 25 °C — declared')).toBeVisible();
    expect(screen.getByLabelText('Cảnh báo kết quả')).toHaveTextContent('User-supplied KD');
    expect(screen.getByText(/playback chưa hoàn tất/)).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Tóm tắt cuối mô phỏng' }),
    ).not.toBeInTheDocument();
  });

  it('shows final fields only in COMPLETED state', () => {
    const result = fixture();
    render(<ResultPanel result={result} stageNumber={4} phase="COMPLETED" />);
    expect(screen.getByRole('heading', { name: 'Tóm tắt cuối mô phỏng' })).toBeVisible();
    expect(screen.getByText('Thu hồi tích lũy cuối')).toBeVisible();
    expect(screen.getByText('Trạng thái cân bằng số')).toBeVisible();
  });

  it('renders three chart surfaces with units, provenance and accessible table alternatives', () => {
    const result = fixture();
    const before = JSON.stringify(result);
    render(<ResultCharts result={result} />);

    expect(screen.getAllByTestId(/^chart-/)).toHaveLength(3);
    expect(screen.getAllByRole('table')).toHaveLength(3);
    expect(screen.getByRole('table', { name: /Nồng độ AcOH trong raffinate/ })).toBeVisible();
    expect(screen.getByRole('table', { name: /AcOH chiết được ở từng bậc/ })).toBeVisible();
    expect(screen.getAllByText(/SimulationResult simulation-result@1/)).toHaveLength(3);
    expect(JSON.stringify(result)).toBe(before);
  });
});
