import { useMemo, useState, type FormEvent } from 'react';

import { InputPanel, type InputFormState } from '../../components/input/InputPanel';
import { ExperimentalValidation } from '../../components/experimental/ExperimentalValidation';
import { CloudReadinessStatus } from '../../components/firebase/CloudReadinessStatus';
import { ResultCharts } from '../../components/results/ResultCharts';
import { ResultPanel } from '../../components/results/ResultPanel';
import { StageTable } from '../../components/results/StageTable';
import { ScenarioComparison } from '../../components/scenarios/ScenarioComparison';
import { FunnelVisualization } from '../../components/simulation/FunnelVisualization';
import { PlaybackControls } from '../../components/simulation/PlaybackControls';
import { calculateValidatedSimulation } from '../../domain/calculation';
import type {
  SimulationInput,
  SimulationResult,
  ValidationError,
  Warning,
} from '../../domain/models';
import { applyVolumeUnitsAtBoundary } from '../../domain/validation/normalizeInput';
import { validateInput } from '../../domain/validation/validateInput';
import { usePlayback } from '../../simulation/playback';

type PageStatus = 'initial' | 'editing' | 'invalid' | 'valid' | 'stale' | 'error';

const EMPTY_FORM: InputFormState = {
  c0MolPerL: '',
  feedVolume: '',
  feedVolumeUnit: 'L',
  totalSolventVolume: '',
  solventVolumeUnit: 'L',
  stageCount: '',
  splitMode: '',
  stageSolventVolumes: [],
  kdValue: '',
  kdSourceType: '',
  kdReference: '',
  kdValidityDomain: '',
};

export function SingleSimulationPage() {
  const [form, setForm] = useState<InputFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<PageStatus>('initial');
  const [errors, setErrors] = useState<readonly ValidationError[]>([]);
  const [warnings, setWarnings] = useState<readonly Warning[]>([]);
  const [previousResult, setPreviousResult] = useState<SimulationResult | null>(null);
  const playback = usePlayback();

  const boundaryInput = useMemo(() => makeBoundaryInput(form), [form]);
  const preview = useMemo(() => validateInput(boundaryInput), [boundaryInput]);
  const equalStageVolumeL =
    form.splitMode === 'equal' && preview.ok ? preview.value.stageSolventVolumesL[0] : null;

  const markEdited = () => {
    setErrors([]);
    setWarnings([]);
    setStatus(previousResult === null ? 'editing' : 'stale');
    if (previousResult !== null) playback.dispatch({ type: 'INPUT_CHANGED' });
  };

  const handleFieldChange = (field: keyof InputFormState, value: string) => {
    setForm((current) => {
      if (field === 'stageCount') {
        const count = Number(value);
        const nextVolumes =
          Number.isInteger(count) && count >= 1 && count <= 10
            ? Array.from({ length: count }, (_, index) => current.stageSolventVolumes[index] ?? '')
            : current.stageSolventVolumes;
        return { ...current, stageCount: value, stageSolventVolumes: nextVolumes };
      }
      return { ...current, [field]: value };
    });
    markEdited();
  };

  const handleStageVolumeChange = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      stageSolventVolumes: current.stageSolventVolumes.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    }));
    markEdited();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const calculation = calculateValidatedSimulation(boundaryInput);
    if (!calculation.ok) {
      setErrors(calculation.errors.filter(isValidationError));
      setWarnings([]);
      setStatus(calculation.errors.every(isValidationError) ? 'invalid' : 'error');
      if (!calculation.errors.every(isValidationError)) {
        playback.dispatch({ type: 'CALCULATION_ERROR', message: 'Calculation contract error.' });
      }
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setPreviousResult(calculation.value);
    playback.dispatch({ type: 'CALCULATION_READY', result: calculation.value });
    setErrors([]);
    setWarnings(calculation.value.warnings);
    setStatus('valid');
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setStatus('initial');
    setErrors([]);
    setWarnings([]);
    setPreviousResult(null);
    playback.dispatch({ type: 'RESET' });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Liquid–Liquid Extraction Simulator</p>
          <h1>Mô phỏng chiết lỏng–lỏng</h1>
        </div>
        <nav aria-label="Chế độ ứng dụng">
          <button type="button" className="mode-tab" aria-current="page">
            Mô phỏng đơn
          </button>
          <button type="button" className="mode-tab" aria-controls="scenario-title">
            So sánh scenario
          </button>
        </nav>
      </header>

      <p className="assumption-banner">
        Mô hình cân bằng KD không đổi, thể tích danh nghĩa và nhiệt độ V1 được khai báo 25 °C.
      </p>

      <div className="workspace-grid">
        <InputPanel
          form={form}
          errors={errors}
          warnings={warnings}
          equalStageVolumeL={equalStageVolumeL ?? null}
          onFieldChange={handleFieldChange}
          onStageVolumeChange={handleStageVolumeChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <section className="panel simulation-workspace" aria-labelledby="simulation-title">
          <div className="panel-heading">
            <p className="step-label">Bước 2</p>
            <h2 id="simulation-title">Không gian mô phỏng</h2>
          </div>
          {status === 'valid' && previousResult !== null ? (
            <>
              <FunnelVisualization
                result={previousResult}
                stageNumber={playback.state.currentStageNumber}
              />
              <PlaybackControls
                state={playback.state}
                dispatch={playback.dispatch}
                reducedMotion={playback.reducedMotion}
              />
            </>
          ) : (
            <div className="visual-empty-state">
              <div className="placeholder-illustration" aria-hidden="true">
                R → S → E
              </div>
              <p>
                {status === 'stale'
                  ? 'Visualization đã tạm ẩn vì dữ liệu đầu vào thay đổi.'
                  : 'Nhập dữ liệu hợp lệ để tạo visualization tĩnh theo từng bậc.'}
              </p>
            </div>
          )}
          <p className="disclaimer">
            Playback duyệt qua các bậc đã được engine tính sẵn; không tính lại dữ liệu hóa học.
          </p>
        </section>

        <section className="panel status-panel" aria-labelledby="status-title" aria-live="polite">
          <div className="panel-heading">
            <p className="step-label">Trạng thái</p>
            <h2 id="status-title">Dữ liệu hiện tại</h2>
          </div>
          {status === 'valid' && previousResult !== null ? (
            <div data-testid="form-status">
              <span className="visually-hidden">Valid</span>
              <ResultPanel
                result={previousResult}
                stageNumber={playback.state.currentStageNumber}
                phase={playback.state.phase}
              />
            </div>
          ) : (
            <StatusContent status={status} hasPreviousResult={previousResult !== null} />
          )}
        </section>
      </div>

      {status === 'valid' && previousResult !== null ? (
        <section className="results-workspace" aria-label="Bảng và biểu đồ kết quả">
          <section className="panel" aria-labelledby="stage-table-title">
            <div className="panel-heading">
              <p className="step-label">Kết quả</p>
              <h2 id="stage-table-title">Bảng Stage 0…N</h2>
            </div>
            <StageTable result={previousResult} />
          </section>
          <section className="panel" aria-labelledby="charts-title">
            <div className="panel-heading">
              <p className="step-label">Datasets từ engine</p>
              <h2 id="charts-title">Biểu đồ kết quả</h2>
            </div>
            <ResultCharts result={previousResult} />
          </section>
        </section>
      ) : (
        <section className="deferred-content" aria-label="Trạng thái kết quả">
          <p>
            {status === 'stale'
              ? 'Bảng và biểu đồ đã ẩn vì input thay đổi; hãy tính lại để xem snapshot hiện tại.'
              : 'Bảng và biểu đồ xuất hiện sau khi tạo một SimulationResult hợp lệ.'}
          </p>
        </section>
      )}

      <ScenarioComparison
        currentResult={previousResult}
        currentResultIsValid={status === 'valid' && playback.state.phase !== 'STALE'}
      />
      <ExperimentalValidation
        result={previousResult}
        currentResultIsValid={status === 'valid' && playback.state.phase !== 'STALE'}
      />
      <CloudReadinessStatus />
    </main>
  );
}

function StatusContent({
  status,
  hasPreviousResult,
}: {
  readonly status: PageStatus;
  readonly hasPreviousResult: boolean;
}) {
  const messages: Record<PageStatus, string> = {
    initial: 'Chưa có dữ liệu. Hãy nhập các trường bắt buộc.',
    editing: 'Đang chỉnh sửa dữ liệu.',
    invalid: 'Dữ liệu chưa hợp lệ. Xem lỗi tại biểu mẫu.',
    valid: 'Dữ liệu hợp lệ và kết quả immutable đã sẵn sàng cho các phase hiển thị sau.',
    stale: 'Kết quả trước đã cũ do dữ liệu đầu vào thay đổi. Hãy kiểm tra lại.',
    error: 'Không thể chuẩn bị mô phỏng. Dữ liệu nhập được giữ nguyên để sửa.',
  };
  return (
    <div className={`status-card status-${status}`} data-testid="form-status">
      <strong>{statusLabel(status)}</strong>
      <p>{messages[status]}</p>
      {status === 'stale' && hasPreviousResult && (
        <p>Previous calculation không còn là hiện tại.</p>
      )}
    </div>
  );
}

function statusLabel(status: PageStatus): string {
  return {
    initial: 'Initial',
    editing: 'Editing',
    invalid: 'Invalid',
    valid: 'Valid',
    stale: 'Stale result',
    error: 'Error',
  }[status];
}

function makeBoundaryInput(form: InputFormState): SimulationInput {
  const rawInput = {
    c0MolPerL: form.c0MolPerL,
    feedVolumeL: form.feedVolume,
    totalSolventVolumeL: form.totalSolventVolume,
    stageCount: form.stageCount,
    splitMode: form.splitMode,
    stageSolventVolumesL: form.splitMode === 'custom' ? form.stageSolventVolumes : null,
    kd: {
      value: form.kdValue,
      sourceType: form.kdSourceType,
      referenceIdOrNote: form.kdReference,
      validityDomainNote: form.kdValidityDomain.trim() || null,
    },
    temperature: { status: 'declared', valueC: '25' },
    modelId: 'constant-kd-v1',
  } as SimulationInput;

  return applyVolumeUnitsAtBoundary(rawInput, {
    feedVolume: form.feedVolumeUnit,
    totalSolventVolume: form.solventVolumeUnit,
    stageSolventVolumes: form.solventVolumeUnit,
  });
}

function isValidationError(
  error: ValidationError | { readonly category: string },
): error is ValidationError {
  return !('category' in error);
}
