import { render, screen, within } from '@testing-library/react';
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
  it('renders an accessible, focusable WebGL scene contract for a result stage', () => {
    render(<FunnelVisualization result={result()} stageNumber={1} />);
    const graphic = screen.getByRole('img', { name: /Phễu chiết 3D — bậc 1\/4/ });
    expect(graphic).toHaveAttribute('tabindex', '0');
    expect(graphic).toHaveAttribute('data-playback-phase', 'SHOWING_STAGE_RESULT');
    expect(screen.getByTestId('three-extraction-scene')).toBeInTheDocument();
    expect(screen.queryByTestId('clipped-liquid-layer')).not.toBeInTheDocument();
  });

  it('maps selected-stage values and exposes a table alternative', () => {
    render(
      <FunnelVisualization
        result={result()}
        stageNumber={3}
        playbackPhase="MIXING"
        reducedMotion={false}
      />,
    );
    expect(screen.getByRole('img', { name: /Phễu chiết 3D — bậc 3\/4/ })).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Thông tin thay thế cho visualization bậc 3' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('three-extraction-scene')).toHaveAttribute(
      'data-playback-phase',
      'MIXING',
    );
    expect(screen.getByTestId('three-extraction-scene')).toHaveAttribute(
      'data-reduced-motion',
      'false',
    );
  });

  it('keeps a stage-zero scene free of fabricated organic volume', () => {
    render(<FunnelVisualization result={result()} stageNumber={0} />);
    expect(screen.getByText('Pha hữu cơ danh nghĩa (EtOAc, ở trên)')).toBeInTheDocument();
    const organicRow = screen.getByRole('row', { name: 'Pha hữu cơ danh nghĩa 0 L' });
    expect(within(organicRow).getByRole('cell')).toHaveTextContent(/^0 L$/);
  });

  it('renders no fabricated solute symbols for a zero-solute result', () => {
    render(<FunnelVisualization result={result('0')} stageNumber={1} />);
    expect(screen.getByText(/aqueous 0, organic 0/)).toBeInTheDocument();
  });

  it('returns an accessible error for an unknown stage', () => {
    render(<FunnelVisualization result={result()} stageNumber={99} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Không có dữ liệu visualization cho bậc đã chọn.',
    );
  });
});
