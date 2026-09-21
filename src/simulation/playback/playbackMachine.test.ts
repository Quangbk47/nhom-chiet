import { describe, expect, it } from 'vitest';

import { calculateValidatedSimulation } from '../../domain/calculation';
import type { SimulationResult } from '../../domain/models';
import { USER_SUPPLIED_INPUT_FIXTURE } from '../../domain/validation/fixtures';
import { INITIAL_PLAYBACK_STATE, playbackReducer, type PlaybackEvent } from './playbackMachine';

function result(stageCount = 4): SimulationResult {
  const calculation = calculateValidatedSimulation({
    ...USER_SUPPLIED_INPUT_FIXTURE,
    stageCount: String(stageCount),
    totalSolventVolumeL: String(stageCount * 0.02),
  });
  if (!calculation.ok) throw new Error(JSON.stringify(calculation.errors));
  return calculation.value;
}

function reduce(events: readonly PlaybackEvent[], simulationResult = result()) {
  return events.reduce(playbackReducer, {
    ...INITIAL_PLAYBACK_STATE,
    phase: 'READY' as const,
    result: simulationResult,
  });
}

describe('Phase 8 playback state machine — T14–T18', () => {
  it('T14: requires a complete Stage 0…N contract before becoming READY', () => {
    const complete = result(10);
    const ready = playbackReducer(INITIAL_PLAYBACK_STATE, {
      type: 'CALCULATION_READY',
      result: complete,
    });
    const corrupt = { ...complete, stages: complete.stages.slice(1) };
    const error = playbackReducer(INITIAL_PLAYBACK_STATE, {
      type: 'CALCULATION_READY',
      result: corrupt,
    });

    expect(ready).toMatchObject({ phase: 'READY', currentStageNumber: 0, result: complete });
    expect(error).toMatchObject({ phase: 'ERROR', result: null });
  });

  it('T15: follows the specified substep transition matrix through completion', () => {
    const one = result(1);
    const phases = [
      'LOADING_FEED',
      'ADDING_SOLVENT',
      'MIXING',
      'EQUILIBRATING',
      'SEPARATING',
      'SHOWING_STAGE_RESULT',
      'DRAINING',
      'STAGE_COMPLETE',
      'COMPLETED',
    ];
    let state = reduce([{ type: 'START' }], one);
    expect(state.phase).toBe(phases[0]);
    for (const phase of phases.slice(1)) {
      state = playbackReducer(state, { type: 'TICK' });
      expect(state.phase).toBe(phase);
      expect(state.currentStageNumber).toBe(1);
    }
  });

  it('T16: pause/resume/restart/speed preserve the result reference and numerical snapshot', () => {
    const simulationResult = result();
    const snapshot = JSON.stringify(simulationResult);
    const paused = reduce(
      [{ type: 'START' }, { type: 'TICK' }, { type: 'PAUSE' }],
      simulationResult,
    );
    const resumed = playbackReducer(paused, { type: 'RESUME' });
    const spedUp = playbackReducer(resumed, { type: 'SPEED_CHANGED', speed: 2 });
    const restarted = playbackReducer(spedUp, { type: 'RESTART' });

    expect(paused).toMatchObject({ phase: 'PAUSED', pausedFrom: 'ADDING_SOLVENT' });
    expect(resumed.phase).toBe('ADDING_SOLVENT');
    expect(spedUp.speed).toBe(2);
    expect(restarted).toMatchObject({ phase: 'READY', currentStageNumber: 0 });
    expect(restarted.result).toBe(simulationResult);
    expect(JSON.stringify(simulationResult)).toBe(snapshot);
  });

  it('T17: Next Stage commits exactly one precomputed stage at the 1 and 10 stage boundaries', () => {
    const one = reduce([{ type: 'NEXT_STAGE' }], result(1));
    let ten = reduce([{ type: 'NEXT_STAGE' }], result(10));

    expect(one).toMatchObject({ phase: 'COMPLETED', currentStageNumber: 1 });
    expect(ten).toMatchObject({ phase: 'STAGE_COMPLETE', currentStageNumber: 1 });
    ten = playbackReducer(ten, { type: 'TICK' });
    ten = playbackReducer(ten, { type: 'TICK' });
    expect(ten).toMatchObject({ phase: 'LOADING_FEED', currentStageNumber: 2 });
  });

  it('T18: stale/error states disable progression and never replace the old result through control events', () => {
    const simulationResult = result();
    const playing = reduce([{ type: 'START' }], simulationResult);
    const stale = playbackReducer(playing, { type: 'INPUT_CHANGED' });
    const ignored = playbackReducer(stale, { type: 'TICK' });
    const invalid = playbackReducer(INITIAL_PLAYBACK_STATE, {
      type: 'CALCULATION_ERROR',
      message: 'invalid',
    });

    expect(stale).toMatchObject({ phase: 'STALE', result: simulationResult });
    expect(ignored).toBe(stale);
    expect(playbackReducer(stale, { type: 'RESTART' })).toBe(stale);
    expect(invalid).toMatchObject({ phase: 'ERROR', result: null, error: 'invalid' });
  });

  it('visits all 10 stages, keeps the cursor bounded, and supports zero-concentration results', () => {
    const zeroCalculation = calculateValidatedSimulation({
      ...USER_SUPPLIED_INPUT_FIXTURE,
      c0MolPerL: '0',
      stageCount: '10',
      totalSolventVolumeL: '0.2',
    });
    if (!zeroCalculation.ok) throw new Error(JSON.stringify(zeroCalculation.errors));
    let state = playbackReducer(INITIAL_PLAYBACK_STATE, {
      type: 'CALCULATION_READY',
      result: zeroCalculation.value,
    });
    state = playbackReducer(state, { type: 'START' });
    const visited = new Set<number>();
    for (let index = 0; index < 100 && state.phase !== 'COMPLETED'; index += 1) {
      visited.add(state.currentStageNumber);
      state = playbackReducer(state, { type: 'TICK' });
      expect(state.currentStageNumber).toBeGreaterThanOrEqual(0);
      expect(state.currentStageNumber).toBeLessThanOrEqual(10);
    }
    expect(state.phase).toBe('COMPLETED');
    expect([...visited]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(state.result!.stages.every((stage) => stage.raffinateAcidAmountMol === 0)).toBe(true);
  });
});
