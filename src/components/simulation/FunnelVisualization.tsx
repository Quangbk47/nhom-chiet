import type { SimulationResult } from '../../domain/models';
import {
  FUNNEL_VIEWBOX,
  allocateParticles,
  createParticlePoints,
  mapPhaseVolumes,
} from '../../simulation/visualization/visualMapping';

interface FunnelVisualizationProps {
  readonly result: SimulationResult;
  readonly stageNumber: number;
}

export function FunnelVisualization({ result, stageNumber }: FunnelVisualizationProps) {
  const stage = result.stages[stageNumber];
  if (stage === undefined) {
    return <p role="alert">Không có dữ liệu visualization cho bậc đã chọn.</p>;
  }

  const volumeInput = result.visualPlan.phaseVolumeInputs.find(
    (item) => item.stageNumber === stageNumber,
  );
  const raffinateVolumeL = volumeInput?.raffinateVolumeL ?? result.inputCanonical.feedVolumeL;
  const extractVolumeL = volumeInput?.extractVolumeL ?? stage.solventVolumeL;
  const heights = mapPhaseVolumes(raffinateVolumeL, extractVolumeL);
  const allocation = allocateParticles(stage, result.visualPlan);
  const particles = createParticlePoints(stageNumber, allocation, heights);
  const liquidBottom = 470;
  const aqueousY = liquidBottom - heights.raffinateHeight;
  const organicY = aqueousY - heights.extractHeight;
  const titleId = `funnel-title-${stageNumber}`;
  const descriptionId = `funnel-description-${stageNumber}`;

  return (
    <figure className="funnel-figure">
      <svg
        className="funnel-svg"
        viewBox={FUNNEL_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        tabIndex={0}
        aria-labelledby={`${titleId} ${descriptionId}`}
        data-testid="funnel-svg"
      >
        <title id={titleId}>Phễu chiết — bậc {stageNumber}</title>
        <desc id={descriptionId}>
          Minh họa thể tích danh nghĩa và phân bố ký hiệu AcOH từ immutable SimulationResult.
        </desc>
        <defs>
          <clipPath id="funnel-body-clip">
            <path d="M170 92 H470 L420 360 Q405 420 350 480 V590 H290 V480 Q235 420 220 360 Z" />
          </clipPath>
          <pattern id="aqueous-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 12 Q4 8 8 12 T16 12" fill="none" stroke="#1769aa" strokeWidth="2" />
          </pattern>
          <pattern id="organic-pattern" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 2 L14 12 M-4 8 L4 16 M10 -2 L18 6" stroke="#9a5a00" strokeWidth="2" />
          </pattern>
        </defs>

        <g clipPath="url(#funnel-body-clip)" data-testid="clipped-liquid-layer">
          {heights.extractHeight > 0 && (
            <rect
              data-testid="organic-phase"
              x="160"
              y={organicY}
              width="320"
              height={heights.extractHeight}
              fill="#f7c76b"
              fillOpacity="0.78"
            />
          )}
          <rect
            data-testid="aqueous-phase"
            x="160"
            y={aqueousY}
            width="320"
            height={heights.raffinateHeight}
            fill="#7cc5ea"
            fillOpacity="0.82"
          />
          <rect
            x="160"
            y={aqueousY}
            width="320"
            height={heights.raffinateHeight}
            fill="url(#aqueous-pattern)"
            opacity="0.28"
          />
          {heights.extractHeight > 0 && (
            <rect
              x="160"
              y={organicY}
              width="320"
              height={heights.extractHeight}
              fill="url(#organic-pattern)"
              opacity="0.25"
            />
          )}
          {particles.map((particle) => (
            <circle
              key={particle.id}
              data-particle-phase={particle.phase}
              cx={particle.x}
              cy={particle.y}
              r="3.8"
              fill={particle.phase === 'extract' ? '#6f3b00' : '#073f70'}
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </g>

        <path
          className="funnel-outline"
          d="M170 92 H470 L420 360 Q405 420 350 480 V590 H290 V480 Q235 420 220 360 Z"
        />
        <path className="funnel-stopcock" d="M270 590 H370 M320 570 V630 M292 630 H348" />
        <line className="phase-interface" x1="190" x2="450" y1={aqueousY} y2={aqueousY} />
        <text
          x="625"
          y={Math.max(116, organicY + heights.extractHeight / 2)}
          textAnchor="end"
          className="svg-label"
        >
          nominal organic phase (EtOAc)
        </text>
        <text
          x="625"
          y={aqueousY + heights.raffinateHeight / 2}
          textAnchor="end"
          className="svg-label"
        >
          nominal aqueous phase (water)
        </text>
        <text x="32" y="130" className="svg-stage-label">
          Stage {stageNumber}/{result.inputCanonical.stageCount}
        </text>
        <text x="32" y="158" className="svg-caption">
          Static stage representation
        </text>
      </svg>

      <figcaption>
        <strong>Bậc {stageNumber}</strong> — thể tích nước danh nghĩa {raffinateVolumeL} L; thể tích
        EtOAc danh nghĩa {extractVolumeL} L.
      </figcaption>
      <div className="visual-legend" aria-label="Chú giải visualization">
        <span>
          <i className="legend-swatch legend-organic" />
          Pha hữu cơ danh nghĩa
        </span>
        <span>
          <i className="legend-swatch legend-aqueous" />
          Pha nước danh nghĩa
        </span>
        <span>
          AcOH symbols: aqueous {allocation.raffinateCount}, organic {allocation.extractCount}
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
            <th scope="row">Ký hiệu AcOH trong pha nước</th>
            <td>{allocation.raffinateCount}</td>
          </tr>
          <tr>
            <th scope="row">Ký hiệu AcOH trong pha hữu cơ</th>
            <td>{allocation.extractCount}</td>
          </tr>
        </tbody>
      </table>
      <ul className="visual-disclaimers">
        <li>Visual representation — not actual liquid colour.</li>
        <li>Animation time is not actual extraction time.</li>
        <li>Particles show relative AcOH distribution; they are not molecules.</li>
        <li>Phase volumes and heights are nominal visualization inputs.</li>
      </ul>
    </figure>
  );
}
