import { useMemo, useState } from 'react';

import type { SimulationResult } from '../../domain/models';
import { formatResultValue } from '../../presentation/resultPresentation';
import {
  calculateValidationMetrics,
  createManualRecord,
  METRIC_ONLY,
  parseExperimentalCsv,
  THRESHOLD_PENDING,
  type ExperimentalError,
  type ExperimentalRecord,
} from '../../experimental/experimentalValidation';

interface Props {
  readonly result: SimulationResult | null;
  readonly currentResultIsValid: boolean;
}
const EMPTY = {
  conditionId: 'current-simulation',
  replicateId: '',
  stageNumber: '1',
  concentration: '',
  notes: '',
};

export function ExperimentalValidation({ result, currentResultIsValid }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [csv, setCsv] = useState('');
  const [records, setRecords] = useState<readonly ExperimentalRecord[]>([]);
  const [errors, setErrors] = useState<readonly ExperimentalError[]>([]);
  const metrics = useMemo(
    () =>
      result === null || !currentResultIsValid ? null : calculateValidationMetrics(records, result),
    [currentResultIsValid, records, result],
  );
  const timestamp = () => new Date().toISOString();
  const save = () => {
    if (result === null || !currentResultIsValid) return;
    const parsed = createManualRecord(form, result, timestamp());
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setRecords((items) => Object.freeze([...items, ...parsed.records]));
    setErrors([]);
    setForm((value) => ({ ...value, replicateId: '', concentration: '', notes: '' }));
  };
  const importCsv = () => {
    if (result === null || !currentResultIsValid) return;
    const parsed = parseExperimentalCsv(csv, result, timestamp());
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setRecords((items) => Object.freeze([...items, ...parsed.records]));
    setErrors([]);
    setCsv('');
  };
  return (
    <section className="panel experimental-panel" aria-labelledby="experimental-title">
      <div className="panel-heading">
        <p className="step-label">Thực nghiệm</p>
        <h2 id="experimental-title">Validation capture và metrics</h2>
      </div>
      <p className="disclaimer">{METRIC_ONLY}</p>
      <p className="message message-warning" role="status">
        {THRESHOLD_PENDING}
      </p>
      {!currentResultIsValid || result === null ? (
        <p className="scenario-state">
          Cần SimulationResult hiện tại hợp lệ. Dữ liệu stale, invalid hoặc error không được liên
          kết như dữ liệu hiện tại.
        </p>
      ) : (
        <>
          <p>
            Điều kiện đang liên kết: model {result.provenance.modelId}; KD{' '}
            {formatResultValue(result.provenance.kd.value)} ({result.provenance.kd.sourceType});
            nhiệt độ {result.provenance.temperature.valueC} °C.
          </p>
          <fieldset>
            <legend>Nhập thủ công (mol/L)</legend>
            <div className="experimental-form">
              <label>
                Condition ID
                <input
                  value={form.conditionId}
                  onChange={(e) => setForm({ ...form, conditionId: e.target.value })}
                />
              </label>
              <label>
                Replicate ID
                <input
                  value={form.replicateId}
                  onChange={(e) => setForm({ ...form, replicateId: e.target.value })}
                />
              </label>
              <label>
                Stage
                <input
                  value={form.stageNumber}
                  onChange={(e) => setForm({ ...form, stageNumber: e.target.value })}
                />
              </label>
              <label>
                CR đo được (mol/L)
                <input
                  value={form.concentration}
                  onChange={(e) => setForm({ ...form, concentration: e.target.value })}
                />
              </label>
              <label>
                Ghi chú
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              <button type="button" className="button button-primary" onClick={save}>
                Lưu quan sát
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Import CSV UTF-8</legend>
            <label htmlFor="experimental-csv">
              Headers: condition_id, replicate_id, stage_number, cr_mol_per_l; optional notes
            </label>
            <textarea id="experimental-csv" value={csv} onChange={(e) => setCsv(e.target.value)} />
            <button type="button" className="button button-secondary" onClick={importCsv}>
              Preview và import atomic
            </button>
          </fieldset>
        </>
      )}
      {errors.length > 0 && (
        <div className="message message-error" role="alert">
          <strong>Import/nhập chưa hợp lệ — không lưu dữ liệu một phần.</strong>
          <ul>
            {errors.map((error) => (
              <li key={`${error.row}-${error.field}`}>
                Dòng {error.row}, {error.field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {metrics !== null && (
        <>
          <h3>Metrics theo bậc</h3>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Bảng validation thực nghiệm"
          >
            <table>
              <caption>Dữ liệu metric-only; CR, AE, SD và MAE/RMSE dùng mol/L.</caption>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Model CR</th>
                  <th>n</th>
                  <th>Mean</th>
                  <th>SD</th>
                  <th>AE</th>
                  <th>RE (%)</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {metrics.stages.map((stage) => (
                  <tr key={stage.stageNumber}>
                    <th scope="row">{stage.stageNumber}</th>
                    <td>{formatResultValue(stage.modelCRMolPerL)}</td>
                    <td>{stage.n}</td>
                    <td>
                      {stage.meanMolPerL === null ? '—' : formatResultValue(stage.meanMolPerL)}
                    </td>
                    <td>
                      {stage.sampleSdMolPerL === null
                        ? '—'
                        : formatResultValue(stage.sampleSdMolPerL)}
                    </td>
                    <td>
                      {stage.absoluteErrorMolPerL === null
                        ? '—'
                        : formatResultValue(stage.absoluteErrorMolPerL)}
                    </td>
                    <td>
                      {stage.relativeErrorPercent === null
                        ? '—'
                        : formatResultValue(stage.relativeErrorPercent)}
                    </td>
                    <td>{stage.notes.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            m = {metrics.pairCount}; MAE ={' '}
            {metrics.maeMolPerL === null ? '—' : formatResultValue(metrics.maeMolPerL)} mol/L; RMSE
            = {metrics.rmseMolPerL === null ? '—' : formatResultValue(metrics.rmseMolPerL)} mol/L.
          </p>
          {metrics.warnings.map((warning) => (
            <p className="message message-warning" role="status" key={warning}>
              {warning}
            </p>
          ))}
        </>
      )}
      {records.length > 0 && (
        <button type="button" className="button button-secondary" onClick={() => setRecords([])}>
          Xóa toàn bộ quan sát cục bộ
        </button>
      )}
    </section>
  );
}
