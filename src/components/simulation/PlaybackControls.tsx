import type { Dispatch } from 'react';

import type {
  PlaybackEvent,
  PlaybackMachineState,
  PlaybackPhase,
  PlaybackSpeed,
} from '../../simulation/playback';

interface PlaybackControlsProps {
  readonly state: PlaybackMachineState;
  readonly dispatch: Dispatch<PlaybackEvent>;
  readonly reducedMotion: boolean;
}

const PHASE_LABELS: Readonly<Record<PlaybackPhase, string>> = {
  IDLE: 'Chưa có kết quả',
  READY: 'Sẵn sàng',
  LOADING_FEED: 'Nạp pha nước',
  ADDING_SOLVENT: 'Thêm dung môi',
  MIXING: 'Tiếp xúc hai pha (minh họa)',
  EQUILIBRATING: 'Cân bằng theo mô hình đã tính',
  SEPARATING: 'Phân lớp',
  SHOWING_STAGE_RESULT: 'Hiển thị kết quả bậc',
  DRAINING: 'Thu pha chiết (minh họa)',
  STAGE_COMPLETE: 'Hoàn tất bậc',
  PREPARING_NEXT_STAGE: 'Chuẩn bị bậc kế tiếp',
  COMPLETED: 'Hoàn tất playback',
  PAUSED: 'Đã tạm dừng',
  STALE: 'Kết quả đã cũ',
  ERROR: 'Lỗi playback',
};

const PAUSABLE: readonly PlaybackPhase[] = [
  'LOADING_FEED',
  'ADDING_SOLVENT',
  'MIXING',
  'EQUILIBRATING',
  'SEPARATING',
  'SHOWING_STAGE_RESULT',
  'DRAINING',
  'PREPARING_NEXT_STAGE',
];

export function PlaybackControls({ state, dispatch, reducedMotion }: PlaybackControlsProps) {
  const disabled = state.result === null || state.phase === 'STALE' || state.phase === 'ERROR';
  const canNext = ['READY', 'SHOWING_STAGE_RESULT', 'PAUSED'].includes(state.phase);

  return (
    <section className="playback-panel" aria-labelledby="playback-title">
      <div className="playback-summary">
        <div>
          <h3 id="playback-title">Điều khiển playback</h3>
          <p
            className="playback-state"
            role="status"
            aria-live="polite"
            data-testid="playback-status"
          >
            {PHASE_LABELS[state.phase]} · Bậc {state.currentStageNumber}/
            {state.result?.final.stageCount ?? 0}
          </p>
        </div>
        {reducedMotion && <span className="motion-note">Chế độ giảm chuyển động</span>}
      </div>

      <div className="playback-actions" aria-label="Điều khiển tiến trình mô phỏng">
        {state.phase === 'READY' && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => dispatch({ type: 'START' })}
          >
            Bắt đầu
          </button>
        )}
        {PAUSABLE.includes(state.phase) && (
          <button
            className="button button-secondary"
            type="button"
            onClick={() => dispatch({ type: 'PAUSE' })}
          >
            Tạm dừng
          </button>
        )}
        {state.phase === 'PAUSED' && (
          <button
            className="button button-primary"
            type="button"
            onClick={() => dispatch({ type: 'RESUME' })}
          >
            Tiếp tục
          </button>
        )}
        <button
          className="button button-secondary"
          type="button"
          disabled={disabled || !canNext}
          onClick={() => dispatch({ type: 'NEXT_STAGE' })}
        >
          Bậc tiếp theo
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={disabled}
          onClick={() => dispatch({ type: 'RESTART' })}
        >
          Chạy lại
        </button>
      </div>

      {state.result !== null && (
        <ol className="stage-timeline" aria-label="Tiến trình các bậc đã tính sẵn">
          {state.result.stages.map((stage) => {
            const completed =
              stage.stageNumber < state.currentStageNumber || state.phase === 'COMPLETED';
            const current = stage.stageNumber === state.currentStageNumber;
            return (
              <li
                key={stage.stageNumber}
                className={completed ? 'timeline-complete' : undefined}
                aria-current={current ? 'step' : undefined}
              >
                {stage.stageNumber === 0 ? 'Ban đầu' : `Bậc ${stage.stageNumber}`}
              </li>
            );
          })}
        </ol>
      )}

      <fieldset className="speed-controls" disabled={disabled}>
        <legend>Tốc độ trình bày</legend>
        {([0.5, 1, 2] as const).map((speed) => (
          <button
            key={speed}
            className="speed-button"
            type="button"
            aria-pressed={state.speed === speed}
            onClick={() => dispatchSpeed(dispatch, speed)}
          >
            {speed}×
          </button>
        ))}
      </fieldset>
      <p className="disclaimer">
        Tốc độ chỉ thay đổi cách trình bày; dữ liệu số và kết quả khoa học không đổi.
      </p>
    </section>
  );
}

function dispatchSpeed(dispatch: Dispatch<PlaybackEvent>, speed: PlaybackSpeed) {
  dispatch({ type: 'SPEED_CHANGED', speed });
}
