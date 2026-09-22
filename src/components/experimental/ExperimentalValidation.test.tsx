import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calculateValidatedSimulation } from '../../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { ExperimentalValidation } from './ExperimentalValidation';

const calculated = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
if (!calculated.ok) throw new Error('fixture invalid');

describe('ExperimentalValidation', () => {
  it('shows threshold pending and blocks stale results', () => {
    render(<ExperimentalValidation result={calculated.value} currentResultIsValid={false} />);
    expect(screen.getByText(/NOT EVALUATED/)).toBeVisible();
    expect(screen.getByText(/stale, invalid hoặc error/)).toBeVisible();
  });
  it('imports atomically and exposes metric table', () => {
    render(<ExperimentalValidation result={calculated.value} currentResultIsValid />);
    fireEvent.change(screen.getByLabelText(/Headers:/), {
      target: { value: 'condition_id,replicate_id,stage_number,cr_mol_per_l\ntest,r1,1,0.2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Preview và import atomic/ }));
    expect(screen.getByRole('table', { name: /Dữ liệu metric-only/ })).toBeVisible();
    fireEvent.change(screen.getByLabelText(/Headers:/), { target: { value: 'wrong\nx' } });
    fireEvent.click(screen.getByRole('button', { name: /Preview và import atomic/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('không lưu dữ liệu một phần');
  });
});
