import type { SimulationResult } from '../../domain/models';
import { formatResultValue } from '../../presentation/resultPresentation';

export function StageTable({ result }: { readonly result: SimulationResult }) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Bảng kết quả theo bậc, có thể cuộn ngang"
    >
      <table className="stage-table">
        <caption>
          Kết quả Stage 0 đến Stage {result.final.stageCount}; đơn vị ghi trong tiêu đề cột
        </caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">VS added (L)</th>
            <th scope="col">CR (mol/L)</th>
            <th scope="col">CE (mol/L)</th>
            <th scope="col">AcOH in (mol)</th>
            <th scope="col">Extracted this stage (mol)</th>
            <th scope="col">Remaining (mol)</th>
            <th scope="col">Cumulative extracted (mol)</th>
            <th scope="col">Cumulative recovery (%)</th>
            <th scope="col">MB absolute (mol)</th>
            <th scope="col">MB relative (%)</th>
          </tr>
        </thead>
        <tbody>
          {result.stages.map((stage) => (
            <tr key={stage.stageNumber}>
              <th scope="row">{stage.stageNumber}</th>
              <Cell value={stage.solventVolumeL} />
              <Cell value={stage.raffinateConcentrationMolPerL} />
              <Cell value={stage.extractConcentrationMolPerL} />
              <Cell value={stage.incomingAcidAmountMol} />
              <Cell value={stage.extractAcidAmountMol} />
              <Cell value={stage.raffinateAcidAmountMol} />
              <Cell value={stage.cumulativeExtractedMol} />
              <Cell value={stage.cumulativeRecoveryPercent} />
              <Cell value={stage.massBalance.absoluteErrorMol} />
              <Cell value={stage.massBalance.relativeErrorPercent} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ value }: { readonly value: number }) {
  return <td>{formatResultValue(value)}</td>;
}
