import { useId, useMemo, useRef, useState } from 'react';

import type { SimulationResult } from '../../domain/models';
import { formatResultValue } from '../../presentation/resultPresentation';
import {
  compareScenarioBasis,
  createScenarioSnapshot,
  removeScenario,
  renameScenario,
  type ScenarioSnapshot,
} from '../../scenarios/scenarioStore';

interface ScenarioComparisonProps {
  readonly currentResult: SimulationResult | null;
  readonly currentResultIsValid: boolean;
}

export function ScenarioComparison({
  currentResult,
  currentResultIsValid,
}: ScenarioComparisonProps) {
  const [scenarios, setScenarios] = useState<readonly ScenarioSnapshot[]>([]);
  const [name, setName] = useState('');
  const nextScenarioId = useRef(1);
  const nameId = useId();
  const comparison = useMemo(() => compareScenarioBasis(scenarios), [scenarios]);

  const saveScenario = () => {
    if (currentResult === null || !currentResultIsValid || name.trim() === '') return;
    setScenarios((items) => [
      ...items,
      createScenarioSnapshot(`scenario-${nextScenarioId.current++}`, name, currentResult),
    ]);
    setName('');
  };

  return (
    <section className="panel scenario-panel" aria-labelledby="scenario-title">
      <div className="panel-heading">
        <p className="step-label">So sánh</p>
        <h2 id="scenario-title">Scenario snapshots</h2>
      </div>
      <p>
        Snapshot lưu input canonical và SimulationResult immutable. So sánh chỉ trình bày điều kiện
        và kết quả đã có, không xếp hạng scenario.
      </p>
      <div className="scenario-save">
        <label htmlFor={nameId}>Tên scenario</label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ví dụ: C0 0,5 mol/L"
        />
        <button
          type="button"
          className="button button-primary"
          disabled={!currentResultIsValid || currentResult === null || name.trim() === ''}
          onClick={saveScenario}
        >
          Lưu scenario hiện tại
        </button>
      </div>
      {!currentResultIsValid && (
        <p className="scenario-state" role="status">
          Cần một kết quả hiện tại hợp lệ; kết quả stale, invalid hoặc error không thể được lưu.
        </p>
      )}
      {scenarios.length === 0 ? (
        <p className="scenario-state">Chưa có scenario snapshot.</p>
      ) : (
        <>
          {!comparison.comparable && (
            <div className="message message-warning" role="alert">
              <strong>Điều kiện so sánh khác</strong>
              <ul>
                {comparison.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Bảng so sánh scenario"
          >
            <table className="scenario-table">
              <caption>So sánh snapshot immutable; đơn vị được ghi trong tiêu đề cột.</caption>
              <thead>
                <tr>
                  <th scope="col">Scenario</th>
                  <th scope="col">C0 (mol/L)</th>
                  <th scope="col">VR (L)</th>
                  <th scope="col">VS,total (L)</th>
                  <th scope="col">N</th>
                  <th scope="col">Chia dung môi</th>
                  <th scope="col">KD / nguồn</th>
                  <th scope="col">Tham chiếu KD</th>
                  <th scope="col">Nhiệt độ</th>
                  <th scope="col">CR cuối (mol/L)</th>
                  <th scope="col">Thu hồi cuối (%)</th>
                  <th scope="col">Tổng đã chiết (mol)</th>
                  <th scope="col">Cảnh báo</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <ScenarioRow
                    key={scenario.id}
                    scenario={scenario}
                    onRename={(nextName) =>
                      setScenarios((items) => renameScenario(items, scenario.id, nextName))
                    }
                    onRemove={() => setScenarios((items) => removeScenario(items, scenario.id))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ScenarioRow({
  scenario,
  onRename,
  onRemove,
}: {
  readonly scenario: ScenarioSnapshot;
  readonly onRename: (name: string) => void;
  readonly onRemove: () => void;
}) {
  const [editingName, setEditingName] = useState(scenario.name);
  return (
    <tr>
      <th scope="row">
        <label className="visually-hidden" htmlFor={`scenario-${scenario.id}`}>
          Tên scenario
        </label>
        <input
          id={`scenario-${scenario.id}`}
          value={editingName}
          onChange={(event) => setEditingName(event.target.value)}
          onBlur={() => {
            if (editingName.trim() !== '') onRename(editingName);
          }}
        />
      </th>
      <td>{formatResultValue(scenario.input.c0MolPerL)}</td>
      <td>{formatResultValue(scenario.input.feedVolumeL)}</td>
      <td>{formatResultValue(scenario.input.totalSolventVolumeL)}</td>
      <td>{scenario.input.stageCount}</td>
      <td>
        {scenario.input.splitMode}:{' '}
        {scenario.input.stageSolventVolumesL.map(formatResultValue).join(', ')} L
      </td>
      <td>
        {formatResultValue(scenario.input.kd.value)} / {scenario.input.kd.sourceType}
      </td>
      <td>{scenario.input.kd.referenceIdOrNote}</td>
      <td>
        {scenario.input.temperature.valueC} °C ({scenario.input.temperature.status})
      </td>
      <td>{formatResultValue(scenario.result.final.finalRaffinateConcentrationMolPerL)}</td>
      <td>{formatResultValue(scenario.result.final.finalCumulativeRecoveryPercent)}</td>
      <td>{formatResultValue(scenario.result.final.totalExtractedAcidMol)}</td>
      <td>
        {scenario.warnings.length === 0
          ? 'Không có'
          : scenario.warnings.map((warning) => warning.message).join(' ')}
      </td>
      <td>
        <button type="button" className="button button-secondary" onClick={onRemove}>
          Xóa
        </button>
      </td>
    </tr>
  );
}
