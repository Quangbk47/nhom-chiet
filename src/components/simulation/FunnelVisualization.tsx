import type { SimulationResult } from '../../domain/models';
import type { PlaybackPhase } from '../../simulation/playback';
import {
  FUNNEL_VIEWBOX,
  allocateParticles,
  createParticlePoints,
  mapPhaseVolumes,
} from '../../simulation/visualization/visualMapping';
import laboratoryBackground from '../../assets/laboratory-background.png';
import glassSeparatoryApparatus from '../../assets/glass-separatory-apparatus.png';

interface FunnelVisualizationProps {
  readonly result: SimulationResult;
  readonly stageNumber: number;
  readonly playbackPhase?: PlaybackPhase;
  readonly reducedMotion?: boolean;
}

/**
 * Glass, depth and lighting are presentation only. Liquid heights and symbols
 * stay derived exclusively from the immutable SimulationResult.
 */
export function FunnelVisualization({
  result,
  stageNumber,
  playbackPhase = 'SHOWING_STAGE_RESULT',
  reducedMotion = false,
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
  const heights = mapPhaseVolumes(raffinateVolumeL, extractVolumeL);
  const allocation = allocateParticles(stage, result.visualPlan);
  const particles = createParticlePoints(stageNumber, allocation, heights);
  const liquidBottom = 420;
  const aqueousY = liquidBottom - heights.raffinateHeight;
  const organicY = aqueousY - heights.extractHeight;
  const titleId = `funnel-title-${stageNumber}`;
  const descriptionId = `funnel-description-${stageNumber}`;
  const clipId = `funnel-body-clip-${stageNumber}`;
  const glassGradientId = `funnel-glass-${stageNumber}`;
  const aqueousGradientId = `funnel-aqueous-${stageNumber}`;
  const organicGradientId = `funnel-organic-${stageNumber}`;
  const shadowId = `funnel-shadow-${stageNumber}`;

  return (
    <figure className="funnel-figure funnel-figure-immersive">
      <svg
        className="funnel-svg"
        viewBox={FUNNEL_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        tabIndex={0}
        aria-labelledby={`${titleId} ${descriptionId}`}
        data-testid="funnel-svg"
        data-playback-phase={playbackPhase}
        data-reduced-motion={reducedMotion}
      >
        <title id={titleId}>Phễu chiết — bậc {stageNumber}</title>
        <desc id={descriptionId}>
          Minh họa không gian ba chiều cách điệu cho thể tích danh nghĩa và phân bố ký hiệu AcOH từ
          immutable SimulationResult.
        </desc>
        <defs>
          <clipPath id={clipId}>
            <path d="M205 170 C205 126 435 126 435 170 V230 C435 275 405 315 380 345 L345 420 H295 L260 345 C235 315 205 275 205 230 Z" />
          </clipPath>
          <filter id={shadowId} x="-30%" y="-20%" width="170%" height="170%">
            <feDropShadow
              dx="0"
              dy="14"
              stdDeviation="10"
              floodColor="#00152f"
              floodOpacity="0.32"
            />
          </filter>
          <linearGradient id={glassGradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#c9efff" stopOpacity="0.12" />
            <stop offset="0.18" stopColor="#fff" stopOpacity="0.72" />
            <stop offset="0.42" stopColor="#e8f8ff" stopOpacity="0.18" />
            <stop offset="0.75" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#8cc7e7" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id={aqueousGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#a9e6ff" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#41b7e8" stopOpacity="0.84" />
            <stop offset="1" stopColor="#0879b8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={organicGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff0ae" stopOpacity="0.9" />
            <stop offset="0.42" stopColor="#f5bd43" stopOpacity="0.86" />
            <stop offset="1" stopColor="#ce7812" stopOpacity="0.9" />
          </linearGradient>
          <pattern id="aqueous-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 12 Q4 8 8 12 T16 12" fill="none" stroke="#1769aa" strokeWidth="2" />
          </pattern>
          <pattern id="organic-pattern" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 2 L14 12 M-4 8 L4 16 M10 -2 L18 6" stroke="#9a5a00" strokeWidth="2" />
          </pattern>
        </defs>

        <image
          className="lab-scene-image"
          href={laboratoryBackground}
          x="20"
          y="36"
          width="600"
          height="620"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        />
        <rect className="lab-scene-scrim" x="20" y="36" width="600" height="620" rx="28" />
        <g className="lab-light-orbs" aria-hidden="true">
          <circle cx="94" cy="166" r="35" />
          <circle cx="550" cy="136" r="55" />
          <circle cx="514" cy="500" r="23" />
        </g>
        <ellipse className="funnel-floor-shadow" cx="320" cy="642" rx="156" ry="20" />

        <g filter={`url(#${shadowId})`}>
          <g
            className="liquid-layer"
            clipPath={`url(#${clipId})`}
            data-testid="clipped-liquid-layer"
          >
            {heights.extractHeight > 0 && (
              <rect
                data-testid="organic-phase"
                x="160"
                y={organicY}
                width="320"
                height={heights.extractHeight}
                fill={`url(#${organicGradientId})`}
              />
            )}
            <rect
              data-testid="aqueous-phase"
              x="160"
              y={aqueousY}
              width="320"
              height={heights.raffinateHeight}
              fill={`url(#${aqueousGradientId})`}
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
                className="solute-particle"
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
        </g>
        {playbackPhase === 'DRAINING' && (
          <path className="beaker-liquid" d="M250 605 H390 L378 670 H262 Z" />
        )}
        <line className="phase-interface" x1="205" x2="435" y1={aqueousY} y2={aqueousY} />
        <image
          className="glass-apparatus-image"
          href={glassSeparatoryApparatus}
          x="84"
          y="4"
          width="472"
          height="708"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        />
        {playbackPhase === 'DRAINING' && <path className="funnel-drain-stream" d="M320 482 V545" />}
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
        <text x="52" y="94" className="svg-stage-label">
          Stage {stageNumber}/{result.inputCanonical.stageCount}
        </text>
        <text x="52" y="122" className="svg-caption">
          Minh họa phễu thủy tinh 3D
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
