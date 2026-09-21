import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calculateValidatedSimulation } from '../../domain/calculation';
import type { SimulationResult } from '../../domain/models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { FunnelVisualization } from './FunnelVisualization';

function result(c0MolPerL: string = '0.5'): SimulationResult {
  const calculation = calculateValidatedSimulation({ ...USER_SUPPLIED_INPUT_FIXTURE, c0MolPerL });
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

describe('FunnelVisualization', () => {
  it('renders an accessible, focusable and clipped SVG for a result stage', () => {
    const simulation = result();
    const { container } = render(<FunnelVisualization result={simulation} stageNumber={1} />);
    const graphic = screen.getByRole('img', { name: /Phễu chiết — bậc 1/ });
    expect(graphic).toHaveAttribute('viewBox', '0 0 640 720');
    expect(graphic).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
    expect(graphic).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('clipped-liquid-layer')).toHaveAttribute(
      'clip-path',
      'url(#funnel-body-clip)',
    );
    expect(container.querySelectorAll('[data-particle-phase]')).toHaveLength(
      simulation.visualPlan.particleCapacity,
    );
  });

  it('maps selected-stage values and exposes a table alternative', () => {
    render(<FunnelVisualization result={result()} stageNumber={3} />);
    expect(screen.getByRole('img', { name: /Phễu chiết — bậc 3/ })).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Thông tin thay thế cho visualization bậc 3' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Stage 3\/4/)).toBeInTheDocument();
    expect(screen.getByText('nominal organic phase (EtOAc)')).toBeInTheDocument();
    expect(screen.getByText('nominal aqueous phase (water)')).toBeInTheDocument();
  });

  it('omits organic phase at Stage 0 and keeps symbols in aqueous phase', () => {
    const simulation = result();
    const { container } = render(<FunnelVisualization result={simulation} stageNumber={0} />);
    expect(screen.queryByTestId('organic-phase')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-particle-phase="extract"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-particle-phase="raffinate"]')).toHaveLength(
      simulation.visualPlan.particleCapacity,
    );
  });

  it('renders no particles for a zero-solute result', () => {
    const { container } = render(<FunnelVisualization result={result('0')} stageNumber={1} />);
    expect(container.querySelectorAll('[data-particle-phase]')).toHaveLength(0);
    expect(screen.getByText(/AcOH symbols: aqueous 0, organic 0/)).toBeInTheDocument();
  });

  it('returns an accessible error for an unknown stage', () => {
    render(<FunnelVisualization result={result()} stageNumber={99} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Không có dữ liệu visualization cho bậc đã chọn.',
    );
  });
});
