import { useMemo, useState, type FormEvent } from 'react';

import { InputPanel, type InputFormState } from '../../components/input/InputPanel';
import { FunnelVisualization } from '../../components/simulation/FunnelVisualization';
import { calculateValidatedSimulation } from '../../domain/calculation';
import type {
  SimulationInput,
  SimulationResult,
  ValidationError,
  Warning,
} from '../../domain/models';
import { applyVolumeUnitsAtBoundary } from '../../domain/validation/normalizeInput';
import { validateInput } from '../../domain/validation/validateInput';

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
  const [selectedStage, setSelectedStage] = useState(0);

  const boundaryInput = useMemo(() => makeBoundaryInput(form), [form]);
  const preview = useMemo(() => validateInput(boundaryInput), [boundaryInput]);
  const equalStageVolumeL =
    form.splitMode === 'equal' && preview.ok ? preview.value.stageSolventVolumesL[0] : null;

  const markEdited = () => {
    setErrors([]);
    setWarnings([]);
    setStatus(previousResult === null ? 'editing' : 'stale');
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
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setPreviousResult(calculation.value);
    setSelectedStage(calculation.value.stages.length > 1 ? 1 : 0);
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
    setSelectedStage(0);
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
          <button type="button" className="mode-tab" disabled>
            So sánh — phase sau
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
              <label className="stage-selector" htmlFor="visual-stage">
                Bậc đang xem
                <select
                  id="visual-stage"
                  value={selectedStage}
                  onChange={(event) => setSelectedStage(Number(event.target.value))}
                >
                  {previousResult.stages.map((stage) => (
                    <option key={stage.stageNumber} value={stage.stageNumber}>
                      Bậc {stage.stageNumber}
                    </option>
                  ))}
                </select>
              </label>
              <FunnelVisualization result={previousResult} stageNumber={selectedStage} />
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
          <p className="disclaimer">Playback và timeline chưa được triển khai trong Phase 7.</p>
        </section>

        <section className="panel status-panel" aria-labelledby="status-title" aria-live="polite">
          <div className="panel-heading">
            <p className="step-label">Trạng thái</p>
            <h2 id="status-title">Dữ liệu hiện tại</h2>
          </div>
          <StatusContent status={status} hasPreviousResult={previousResult !== null} />
        </section>
      </div>

      <section className="deferred-content" aria-label="Chức năng ở phase sau">
        <p>
          Timeline, bảng kết quả và biểu đồ sẽ sử dụng immutable SimulationResult ở các phase sau.
        </p>
      </section>
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
