import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { calculateValidatedSimulation } from '../../domain/calculation';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { PLAYBACK_STEP_MS, usePlayback } from '../../simulation/playback';
import { PlaybackControls } from './PlaybackControls';

function Harness({ ready = true }: { readonly ready?: boolean }) {
  const playback = usePlayback();
  const dispatch = playback.dispatch;
  useEffect(() => {
    if (!ready) return;
    const calculation = calculateValidatedSimulation(USER_SUPPLIED_INPUT_FIXTURE);
    if (calculation.ok) dispatch({ type: 'CALCULATION_READY', result: calculation.value });
  }, [dispatch, ready]);
  return (
    <PlaybackControls
      state={playback.state}
      dispatch={playback.dispatch}
      reducedMotion={playback.reducedMotion}
    />
  );
}

describe('PlaybackControls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('supports keyboard-accessible start, pause, resume, speed and restart controls', () => {
    render(<Harness />);
    expect(screen.getByRole('list', { name: 'Tiến trình các bậc đã tính sẵn' })).toBeVisible();
    expect(screen.getByText('Ban đầu')).toHaveAttribute('aria-current', 'step');
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    expect(screen.getByRole('status')).toHaveTextContent('Nạp pha nước');
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    expect(screen.getByRole('status')).toHaveTextContent('Đã tạm dừng');
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    fireEvent.click(screen.getByRole('button', { name: '2×' }));
    expect(screen.getByRole('button', { name: '2×' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Chạy lại' }));
    expect(screen.getByRole('status')).toHaveTextContent('Sẵn sàng · Bậc 0/4');
  });

  it('uses a controlled timer and freezes it while paused', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
    act(() => vi.advanceTimersByTime(PLAYBACK_STEP_MS));
    expect(screen.getByRole('status')).toHaveTextContent('Thêm dung môi');
    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    act(() => vi.advanceTimersByTime(PLAYBACK_STEP_MS * 3));
    expect(screen.getByRole('status')).toHaveTextContent('Đã tạm dừng');
  });

  it('disables stage and restart controls without a valid result', () => {
    render(<Harness ready={false} />);
    expect(screen.getByRole('button', { name: 'Bậc tiếp theo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Chạy lại' })).toBeDisabled();
  });
});
