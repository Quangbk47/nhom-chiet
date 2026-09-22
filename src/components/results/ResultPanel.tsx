import type { SimulationResult } from '../../domain/models';
import type { PlaybackPhase } from '../../simulation/playback';
import { formatResultValue, stageAt } from '../../presentation/resultPresentation';

interface ResultPanelProps {
  readonly result: SimulationResult;
  readonly stageNumber: number;
  readonly phase: PlaybackPhase;
}

export function ResultPanel({ result, stageNumber, phase }: ResultPanelProps) {
  const stage = stageAt(result, stageNumber);
  if (stage === null) return <p role="alert">Không có kết quả cho bậc đang chọn.</p>;

  return (
    <div className="result-content">
      <dl className="result-list" aria-label={`Kết quả bậc ${stage.stageNumber}`}>
        <ResultValue label="Bậc" value={`${stage.stageNumber}/${result.final.stageCount}`} />
        <ResultValue label="Dung môi mới" value={withUnit(stage.solventVolumeL, 'L')} />
        <ResultValue
          label="Nồng độ raffinate (CR)"
          value={withUnit(stage.raffinateConcentrationMolPerL, 'mol/L')}
        />
        <ResultValue
          label="Nồng độ extract (CE)"
          value={withUnit(stage.extractConcentrationMolPerL, 'mol/L')}
        />
        <ResultValue label="AcOH vào stage" value={withUnit(stage.incomingAcidAmountMol, 'mol')} />
        <ResultValue
          label="AcOH extract stage này"
          value={withUnit(stage.extractAcidAmountMol, 'mol')}
        />
        <ResultValue label="AcOH còn lại" value={withUnit(stage.raffinateAcidAmountMol, 'mol')} />
        <ResultValue label="Thu hồi stage" value={withUnit(stage.stageRecoveryPercent, '%')} />
        <ResultValue
          label="Thu hồi tích lũy"
          value={withUnit(stage.cumulativeRecoveryPercent, '%')}
        />
        <ResultValue
          label="Cân bằng vật chất"
          value={`${formatResultValue(stage.massBalance.absoluteErrorMol)} mol; ${formatResultValue(stage.massBalance.relativeErrorPercent)} % (${stage.massBalance.status})`}
        />
      </dl>

      <section className="provenance-card" aria-labelledby="provenance-title">
        <h3 id="provenance-title">Nguồn và điều kiện mô hình</h3>
        <p>
          KD:{' '}
          {result.provenance.kd.sourceType === 'user_supplied'
            ? 'người dùng cung cấp'
            : 'Project Owner phê duyệt'}{' '}
          — {result.provenance.kd.referenceIdOrNote}
        </p>
        <p>
          Nhiệt độ: {result.provenance.temperature.valueC} °C —{' '}
          {result.provenance.temperature.status}
        </p>
        <p>Mô hình: {result.provenance.modelId}</p>
        {result.warnings.length > 0 && (
          <div className="message message-warning" aria-label="Cảnh báo kết quả">
            <strong>Cảnh báo</strong>
            <ul>
              {result.warnings.map((warning) => (
                <li key={warning.code}>{warning.message}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {phase === 'COMPLETED' ? (
        <section className="final-summary" aria-labelledby="final-title">
          <h3 id="final-title">Tóm tắt cuối mô phỏng</h3>
          <dl className="result-list">
            <ResultValue
              label="AcOH ban đầu"
              value={withUnit(result.final.initialAcidAmountMol, 'mol')}
            />
            <ResultValue
              label="AcOH raffinate cuối"
              value={withUnit(result.final.finalRaffinateAcidAmountMol, 'mol')}
            />
            <ResultValue
              label="CR cuối"
              value={withUnit(result.final.finalRaffinateConcentrationMolPerL, 'mol/L')}
            />
            <ResultValue
              label="Tổng AcOH đã chiết"
              value={withUnit(result.final.totalExtractedAcidMol, 'mol')}
            />
            <ResultValue
              label="Thu hồi tích lũy cuối"
              value={withUnit(result.final.finalCumulativeRecoveryPercent, '%')}
            />
            <ResultValue label="Số bậc" value={String(result.final.stageCount)} />
            <ResultValue
              label="Tổng dung môi"
              value={withUnit(result.final.totalSolventVolumeL, 'L')}
            />
            <ResultValue
              label="Trạng thái cân bằng số"
              value={result.final.finalMassBalance.status}
            />
          </dl>
        </section>
      ) : (
        <p className="result-readiness">Kết quả tính toán đã sẵn sàng; playback chưa hoàn tất.</p>
      )}
    </div>
  );
}

function ResultValue({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function withUnit(value: number, unit: string): string {
  return `${formatResultValue(value)} ${unit}`;
}
