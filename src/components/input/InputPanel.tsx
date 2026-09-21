import type { FormEvent } from 'react';

import type { ValidationError, Warning } from '../../domain/models';
import type { VolumeUnit } from '../../domain/validation/normalizeInput';

export interface InputFormState {
  readonly c0MolPerL: string;
  readonly feedVolume: string;
  readonly feedVolumeUnit: VolumeUnit;
  readonly totalSolventVolume: string;
  readonly solventVolumeUnit: VolumeUnit;
  readonly stageCount: string;
  readonly splitMode: '' | 'equal' | 'custom';
  readonly stageSolventVolumes: readonly string[];
  readonly kdValue: string;
  readonly kdSourceType: '' | 'user_supplied' | 'project_approved';
  readonly kdReference: string;
  readonly kdValidityDomain: string;
}

interface InputPanelProps {
  readonly form: InputFormState;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly Warning[];
  readonly equalStageVolumeL: number | null;
  readonly onFieldChange: (field: keyof InputFormState, value: string) => void;
  readonly onStageVolumeChange: (index: number, value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onReset: () => void;
}

export function InputPanel({
  form,
  errors,
  warnings,
  equalStageVolumeL,
  onFieldChange,
  onStageVolumeChange,
  onSubmit,
  onReset,
}: InputPanelProps) {
  const errorFor = (field: string) => errors.find((error) => error.field === field);

  return (
    <section className="panel input-panel" aria-labelledby="input-title">
      <div className="panel-heading">
        <p className="step-label">Bước 1</p>
        <h2 id="input-title">Dữ liệu mô phỏng</h2>
      </div>

      {errors.length > 0 && (
        <div className="message message-error" role="alert" aria-labelledby="error-title">
          <strong id="error-title">Vui lòng kiểm tra dữ liệu nhập</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={`${error.field}-${error.code}-${index}`}>
                <a href={`#${fieldId(error.field)}`}>{error.message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Field
          id="c0MolPerL"
          label="Nồng độ AcOH ban đầu (C0)"
          value={form.c0MolPerL}
          unit="mol/L"
          error={errorFor('c0MolPerL')?.message}
          onChange={(value) => onFieldChange('c0MolPerL', value)}
        />

        <VolumeField
          id="feedVolumeL"
          label="Thể tích pha nước ban đầu (VR)"
          value={form.feedVolume}
          unit={form.feedVolumeUnit}
          error={errorFor('feedVolumeL')?.message}
          onValueChange={(value) => onFieldChange('feedVolume', value)}
          onUnitChange={(value) => onFieldChange('feedVolumeUnit', value)}
        />

        <VolumeField
          id="totalSolventVolumeL"
          label="Tổng thể tích etyl axetat (VS,total)"
          value={form.totalSolventVolume}
          unit={form.solventVolumeUnit}
          error={errorFor('totalSolventVolumeL')?.message}
          onValueChange={(value) => onFieldChange('totalSolventVolume', value)}
          onUnitChange={(value) => onFieldChange('solventVolumeUnit', value)}
        />

        <Field
          id="stageCount"
          label="Số bậc chiết (N)"
          value={form.stageCount}
          unit="bậc"
          inputMode="numeric"
          error={errorFor('stageCount')?.message}
          onChange={(value) => onFieldChange('stageCount', value)}
        />

        <fieldset className="field-group">
          <legend>Cách chia dung môi</legend>
          <label className="radio-row">
            <input
              type="radio"
              name="splitMode"
              value="equal"
              checked={form.splitMode === 'equal'}
              onChange={() => onFieldChange('splitMode', 'equal')}
            />
            Chia đều theo số bậc
          </label>
          <label className="radio-row">
            <input
              type="radio"
              name="splitMode"
              value="custom"
              checked={form.splitMode === 'custom'}
              onChange={() => onFieldChange('splitMode', 'custom')}
            />
            Tùy chỉnh từng bậc
          </label>
          {errorFor('splitMode') && <FieldError message={errorFor('splitMode')!.message} />}
        </fieldset>

        {form.splitMode === 'equal' && equalStageVolumeL !== null && (
          <p className="derived-value" data-testid="equal-stage-volume">
            Mỗi bậc: {equalStageVolumeL.toPrecision(6)} L (giá trị từ input boundary)
          </p>
        )}

        {form.splitMode === 'custom' && (
          <fieldset className="field-group custom-split">
            <legend>Thể tích dung môi từng bậc ({form.solventVolumeUnit})</legend>
            {form.stageSolventVolumes.map((value, index) => {
              const field = `stageSolventVolumesL.${index}`;
              return (
                <Field
                  key={index}
                  id={fieldId(field)}
                  label={`Dung môi bậc ${index + 1}`}
                  value={value}
                  unit={form.solventVolumeUnit}
                  error={errorFor(field)?.message}
                  onChange={(nextValue) => onStageVolumeChange(index, nextValue)}
                />
              );
            })}
            {errorFor('stageSolventVolumesL') && (
              <FieldError message={errorFor('stageSolventVolumesL')!.message} />
            )}
          </fieldset>
        )}

        <Field
          id="kdValue"
          label="Hệ số phân bố KD"
          value={form.kdValue}
          unit="không thứ nguyên"
          error={errorFor('kd.value')?.message}
          onChange={(value) => onFieldChange('kdValue', value)}
        />

        <div className="field">
          <label htmlFor="kdSourceType">Nguồn KD</label>
          <select
            id="kdSourceType"
            value={form.kdSourceType}
            aria-describedby="kd-source-help"
            onChange={(event) => onFieldChange('kdSourceType', event.target.value)}
          >
            <option value="">Chọn nguồn KD</option>
            <option value="user_supplied">Người dùng cung cấp</option>
            <option value="project_approved">Project Owner phê duyệt</option>
          </select>
          <p id="kd-source-help" className="help-text">
            Không có nguồn hoặc giá trị KD mặc định.
          </p>
          {errorFor('kd.sourceType') && <FieldError message={errorFor('kd.sourceType')!.message} />}
        </div>

        <TextField
          id="kdReference"
          label="Ghi chú hoặc mã tham chiếu KD"
          value={form.kdReference}
          error={errorFor('kd.referenceIdOrNote')?.message}
          onChange={(value) => onFieldChange('kdReference', value)}
        />
        <TextField
          id="kdValidityDomain"
          label="Miền hiệu lực KD (nếu có)"
          value={form.kdValidityDomain}
          onChange={(value) => onFieldChange('kdValidityDomain', value)}
        />

        <div className="read-only-field">
          <span>Nhiệt độ V1</span>
          <output>25 °C — declared</output>
        </div>

        {warnings.length > 0 && (
          <div className="message message-warning" aria-label="Cảnh báo dữ liệu">
            <strong>Cảnh báo</strong>
            <ul>
              {warnings.map((warning) => (
                <li key={warning.code}>{warning.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-actions">
          <button className="button button-primary" type="submit">
            Kiểm tra và chuẩn bị mô phỏng
          </button>
          <button className="button button-secondary" type="button" onClick={onReset}>
            Đặt lại
          </button>
        </div>
      </form>
    </section>
  );
}

interface FieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly inputMode?: 'decimal' | 'numeric';
  readonly error?: string;
  readonly onChange: (value: string) => void;
}

function Field({ id, label, value, unit, inputMode = 'decimal', error, onChange }: FieldProps) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-unit">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
          onChange={(event) => onChange(event.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
        />
        <span aria-hidden="true">{unit}</span>
      </div>
      <p id={helpId} className="help-text">
        Chấp nhận dấu chấm, dấu phẩy không mơ hồ và ký hiệu khoa học.
      </p>
      {error && <FieldError id={errorId} message={error} />}
    </div>
  );
}

interface VolumeFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly unit: VolumeUnit;
  readonly error?: string;
  readonly onValueChange: (value: string) => void;
  readonly onUnitChange: (value: VolumeUnit) => void;
}

function VolumeField({
  id,
  label,
  value,
  unit,
  error,
  onValueChange,
  onUnitChange,
}: VolumeFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-select">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
          onChange={(event) => onValueChange(event.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
        />
        <select
          aria-label={`Đơn vị ${label}`}
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as VolumeUnit)}
        >
          <option value="L">L</option>
          <option value="mL">mL</option>
        </select>
      </div>
      <p id={`${id}-help`} className="help-text">
        mL được đổi sang L đúng một lần tại input boundary.
      </p>
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

function TextField({ id, label, value, error, onChange }: Omit<FieldProps, 'unit' | 'inputMode'>) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

function FieldError({ id, message }: { readonly id?: string; readonly message: string }) {
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

function fieldId(field: string): string {
  if (field.startsWith('stageSolventVolumesL.')) return field.replace('.', '-');
  const ids: Readonly<Record<string, string>> = {
    'kd.value': 'kdValue',
    'kd.sourceType': 'kdSourceType',
    'kd.referenceIdOrNote': 'kdReference',
    'kd.validityDomainNote': 'kdValidityDomain',
  };
  return ids[field] ?? field;
}
