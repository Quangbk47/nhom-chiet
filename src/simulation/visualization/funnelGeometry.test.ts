import { describe, expect, it } from 'vitest';
import {
  DISPLAY_FILL_FRACTION,
  FUNNEL_INTERIOR_CAPACITY,
  FUNNEL_INTERIOR_HEIGHT,
  funnelInteriorRadius,
  heightForInteriorVolume,
  interiorVolumeAtHeight,
  mapLiquidVolumesToFunnel,
  splitDrainedVolume,
} from './funnelGeometry';

describe('funnelGeometry', () => {
  it('uses a non-linear interior profile and inverts its actual integrated volume', () => {
    const halfHeightVolume = interiorVolumeAtHeight(FUNNEL_INTERIOR_HEIGHT / 2);
    expect(halfHeightVolume / FUNNEL_INTERIOR_CAPACITY).not.toBeCloseTo(0.5, 1);
    const target = FUNNEL_INTERIOR_CAPACITY * 0.63;
    expect(interiorVolumeAtHeight(heightForInteriorVolume(target))).toBeCloseTo(target, 5);
    expect(funnelInteriorRadius(0.8)).toBeLessThan(funnelInteriorRadius(2.6));
  });

  it('maps phase levels inside the vessel and keeps the upper phase above aqueous', () => {
    const levels = mapLiquidVolumesToFunnel(0.1, 0.08, 0.2);
    expect(levels.aqueousTop).toBeGreaterThan(0);
    expect(levels.totalTop).toBeGreaterThan(levels.aqueousTop);
    expect(levels.totalTop).toBeLessThanOrEqual(FUNNEL_INTERIOR_HEIGHT);
  });

  it('conserves the lower-phase display volume during a drain transfer', () => {
    const transfer = splitDrainedVolume(0.1, 0.37);
    expect(transfer.funnelLowerL + transfer.beakerL).toBeCloseTo(0.1, 12);
    expect(splitDrainedVolume(0.1, 1)).toEqual({ funnelLowerL: 0, beakerL: 0.1 });
  });

  it('preserves both phase volumes across small and large fill fractions', () => {
    for (const fraction of [0, 0.001, 0.01, 0.1, 0.5, 0.95, 1]) {
      const levels = mapLiquidVolumesToFunnel(fraction * 0.1, fraction * 0.08, 0.18);
      expect(interiorVolumeAtHeight(levels.aqueousTop) / FUNNEL_INTERIOR_CAPACITY).toBeCloseTo(
        (fraction * 0.1 * DISPLAY_FILL_FRACTION) / 0.18,
        5,
      );
      expect(interiorVolumeAtHeight(levels.totalTop) / FUNNEL_INTERIOR_CAPACITY).toBeCloseTo(
        fraction * DISPLAY_FILL_FRACTION,
        5,
      );
      expect(levels.totalTop).toBeGreaterThanOrEqual(levels.aqueousTop);
    }
  });
});
