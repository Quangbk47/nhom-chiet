import type { SimulationResult } from '../../domain/models';
import type { PlaybackPhase } from '../../simulation/playback';
import { allocateParticles } from '../../simulation/visualization/visualMapping';
import { ThreeExtractionScene } from './ThreeExtractionScene';

interface FunnelVisualizationProps {
  readonly result: SimulationResult;
  readonly stageNumber: number;
  readonly playbackPhase?: PlaybackPhase;
  readonly reducedMotion?: boolean;
  readonly speed?: number;
}

/**
 * Accessible wrapper for the WebGL scene. Numerical values remain in the
 * table, while the scene is limited to a deterministic visual representation.
 */
export function FunnelVisualization({
  result,
  stageNumber,
  playbackPhase = 'SHOWING_STAGE_RESULT',
  reducedMotion = false,
  speed = 1,
}: FunnelVisualizationProps) {
  const stage = result.stages[stageNumber];
  if (stage === undefined) {
    return <p role="alert">Không có dữ liệu visualization cho bậc đã chọn.</p>;
  }
  const volumeInput = result.visualPlan.phaseVolumeInputs.find(
    (item) => item.stageNumber === stageNumber,
  );
  const raffinateVolumeL = volumeInput?.raffinateVolumeL ?? result.inputCanonical.feedVolumeL;
  const extractVolumeL = volumeInput?.extractVolumeL ?? stage.solventVolumeL;
  const allocation = allocateParticles(stage, result.visualPlan);

  return (
    <figure className="funnel-figure funnel-figure-immersive">
      <ThreeExtractionScene
        result={result}
        stageNumber={stageNumber}
        playbackPhase={playbackPhase}
        reducedMotion={reducedMotion}
        speed={speed}
      />
      <figcaption>
        <strong>Bậc {stageNumber}</strong> — thể tích nước danh nghĩa {raffinateVolumeL} L; thể tích
        EtOAc danh nghĩa {extractVolumeL} L.
      </figcaption>
      <div className="visual-legend" aria-label="Chú giải visualization">
        <span>
          <i className="legend-swatch legend-organic" />
          Pha hữu cơ danh nghĩa (EtOAc, ở trên)
        </span>
        <span>
          <i className="legend-swatch legend-aqueous" />
          Pha nước danh nghĩa (ở dưới)
        </span>
      </div>
      <table className="visual-alternative">
        <caption>Thông tin thay thế cho visualization bậc {stageNumber}</caption>
        <tbody>
          <tr>
            <th scope="row">Pha nước danh nghĩa</th>
            <td>{raffinateVolumeL} L</td>
          </tr>
          <tr>
            <th scope="row">Pha hữu cơ danh nghĩa</th>
            <td>{extractVolumeL} L</td>
          </tr>
          <tr>
            <th scope="row">Phân bố ký hiệu AcOH (chỉ thay thế bằng văn bản)</th>
            <td>
              aqueous {allocation.raffinateCount}, organic {allocation.extractCount}
            </td>
          </tr>
        </tbody>
      </table>
      <ul className="visual-disclaimers">
        <li>Visual representation — not actual liquid colour.</li>
        <li>Animation time is not actual extraction time.</li>
        <li>Hiệu ứng chảy/lắc là mô hình trình bày bảo toàn thể tích, không phải mô phỏng CFD.</li>
        <li>Thứ tự pha ở cảnh này chỉ áp dụng cho minh họa EtOAc–nước hiện có.</li>
      </ul>
    </figure>
  );
}
