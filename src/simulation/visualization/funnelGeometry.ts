/**
 * Geometry contract for the presentation-only separatory funnel.
 *
 * All lengths are scene units.  The volume integral is deliberately based on
 * the same radial profile that is revolved to make the WebGL mesh, so a given
 * displayed volume can never be mapped to a height outside the glass wall.
 * This is not a calibrated laboratory-glass specification.
 */
export const FUNNEL_INTERIOR_HEIGHT = 4.35;
export const LIQUID_WALL_CLEARANCE = 0.02;
// Presentation headspace, allowing agitation without filling the neck to its rim.
export const DISPLAY_FILL_FRACTION = 0.82;

export function liquidRadius(height: number): number {
  return funnelInteriorRadius(height) - LIQUID_WALL_CLEARANCE;
}

export interface FunnelVolumeLevels {
  readonly aqueousTop: number;
  readonly totalTop: number;
  readonly capacitySceneUnits: number;
}

export function funnelInteriorRadius(height: number): number {
  const y = clamp(height, 0, FUNNEL_INTERIOR_HEIGHT);

  if (y <= 0.62) return 0.115;
  if (y <= 1.96) return 0.115 + ((y - 0.62) / 1.34) * 0.9;
  if (y <= 3.22) {
    const progress = (y - 1.96) / 1.26;
    return 1.015 + 0.17 * Math.sin(Math.PI * progress);
  }
  if (y <= 3.72) return 1.015 - ((y - 3.22) / 0.5) * 0.47;
  return 0.545;
}

/** Numerically integrates πr² over the inner funnel profile. */
export function interiorVolumeAtHeight(height: number, slices = 320): number {
  const cappedHeight = clamp(height, 0, FUNNEL_INTERIOR_HEIGHT);
  if (cappedHeight === 0) return 0;
  const count = Math.max(8, Math.ceil((slices * cappedHeight) / FUNNEL_INTERIOR_HEIGHT));
  const step = cappedHeight / count;
  let sum = 0;
  for (let index = 0; index < count; index += 1) {
    const midpoint = (index + 0.5) * step;
    sum += Math.PI * liquidRadius(midpoint) ** 2 * step;
  }
  return sum;
}

export const FUNNEL_INTERIOR_CAPACITY = interiorVolumeAtHeight(FUNNEL_INTERIOR_HEIGHT);

/** Inverts the profile's integrated volume using a bounded binary search. */
export function heightForInteriorVolume(volume: number): number {
  const target = clamp(volume, 0, FUNNEL_INTERIOR_CAPACITY);
  if (target === 0) return 0;
  if (target === FUNNEL_INTERIOR_CAPACITY) return FUNNEL_INTERIOR_HEIGHT;
  let low = 0;
  let high = FUNNEL_INTERIOR_HEIGHT;
  for (let index = 0; index < 36; index += 1) {
    const middle = (low + high) / 2;
    if (interiorVolumeAtHeight(middle) < target) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/**
 * Maps canonical litres to the display vessel without assuming a linear
 * height-to-volume relationship. The capacity basis uses the run's original
 * nominal feed plus total solvent; it is a visual scale, never a new input.
 */
export function mapLiquidVolumesToFunnel(
  aqueousVolumeL: number,
  organicVolumeL: number,
  runCapacityBasisL: number,
): FunnelVolumeLevels {
  const totalL = Math.max(0, aqueousVolumeL) + Math.max(0, organicVolumeL);
  const basisL = Math.max(totalL, runCapacityBasisL, Number.EPSILON);
  const displayCapacity = FUNNEL_INTERIOR_CAPACITY * DISPLAY_FILL_FRACTION;
  const aqueousSceneVolume = (Math.max(0, aqueousVolumeL) / basisL) * displayCapacity;
  const totalSceneVolume = (totalL / basisL) * displayCapacity;
  return Object.freeze({
    aqueousTop: heightForInteriorVolume(aqueousSceneVolume),
    totalTop: heightForInteriorVolume(totalSceneVolume),
    capacitySceneUnits: FUNNEL_INTERIOR_CAPACITY,
  });
}

/** A display transfer is conserved when the lower phase is drained to a beaker. */
export function splitDrainedVolume(lowerPhaseL: number, progress: number) {
  const drained = Math.max(0, lowerPhaseL) * clamp(progress, 0, 1);
  return Object.freeze({ funnelLowerL: Math.max(0, lowerPhaseL) - drained, beakerL: drained });
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
