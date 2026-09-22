import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { ScenarioComparison } from './ScenarioComparison';

function result(overrides: Partial<typeof USER_SUPPLIED_INPUT_FIXTURE> = {}) {
  const calculation = calculateValidatedSimulation({
    ...USER_SUPPLIED_INPUT_FIXTURE,
    ...overrides,
  });
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('ScenarioComparison', () => {
  it('disables saving stale/invalid results and exposes the state text', () => {
    render(<ScenarioComparison currentResult={result()} currentResultIsValid={false} />);
    expect(screen.getByRole('button', { name: 'Lưu scenario hiện tại' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('stale, invalid hoặc error');
  });

  it('adds, renames and removes immutable scenario snapshots accessibly', () => {
    render(<ScenarioComparison currentResult={result()} currentResultIsValid />);
    const name = screen.getByLabelText('Tên scenario');
    fireEvent.change(name, { target: { value: 'Mẫu A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu scenario hiện tại' }));

    expect(screen.getByRole('table', { name: /So sánh snapshot immutable/ })).toBeVisible();
    const rowName = screen.getAllByLabelText('Tên scenario')[1];
    fireEvent.change(rowName, { target: { value: 'Mẫu A đổi tên' } });
    fireEvent.blur(rowName);
    expect(rowName).toHaveValue('Mẫu A đổi tên');
    fireEvent.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByText('Chưa có scenario snapshot.')).toBeVisible();
  });

  it('warns when saved scenarios have different comparison bases', () => {
    const first = result();
    const second = result({ c0MolPerL: '0.4' });
    const { rerender } = render(<ScenarioComparison currentResult={first} currentResultIsValid />);
    fireEvent.change(screen.getByLabelText('Tên scenario'), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu scenario hiện tại' }));
    rerender(<ScenarioComparison currentResult={second} currentResultIsValid />);
    fireEvent.change(screen.getAllByLabelText('Tên scenario')[0], { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu scenario hiện tại' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Điều kiện so sánh khác');
    expect(screen.getByRole('alert')).toHaveTextContent('C0');
  });
});
