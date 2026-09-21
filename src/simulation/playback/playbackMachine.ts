import type { SimulationResult } from '../../domain/models';

export type PlaybackSpeed = 0.5 | 1 | 2;

export type PlaybackPhase =
  | 'IDLE'
  | 'READY'
  | 'LOADING_FEED'
  | 'ADDING_SOLVENT'
  | 'MIXING'
  | 'EQUILIBRATING'
  | 'SEPARATING'
  | 'SHOWING_STAGE_RESULT'
  | 'DRAINING'
  | 'STAGE_COMPLETE'
  | 'PREPARING_NEXT_STAGE'
  | 'COMPLETED'
  | 'PAUSED'
  | 'STALE'
  | 'ERROR';

type ResumablePhase = Exclude<
  PlaybackPhase,
  'IDLE' | 'READY' | 'STAGE_COMPLETE' | 'COMPLETED' | 'PAUSED' | 'STALE' | 'ERROR'
>;

export interface PlaybackMachineState {
  readonly phase: PlaybackPhase;
  readonly result: SimulationResult | null;
  readonly currentStageNumber: number;
  readonly speed: PlaybackSpeed;
  readonly pausedFrom: ResumablePhase | null;
  readonly error: string | null;
}

export type PlaybackEvent =
  | { readonly type: 'CALCULATION_READY'; readonly result: SimulationResult }
  | { readonly type: 'START' }
  | { readonly type: 'PAUSE' }
  | { readonly type: 'RESUME' }
  | { readonly type: 'NEXT_STAGE' }
  | { readonly type: 'RESTART' }
  | { readonly type: 'RESET' }
  | { readonly type: 'INPUT_CHANGED' }
  | { readonly type: 'CALCULATION_ERROR'; readonly message: string }
  | { readonly type: 'SPEED_CHANGED'; readonly speed: PlaybackSpeed }
  | { readonly type: 'TICK' };

export const INITIAL_PLAYBACK_STATE: PlaybackMachineState = {
  phase: 'IDLE',
  result: null,
  currentStageNumber: 0,
  speed: 1,
  pausedFrom: null,
  error: null,
};

const RESUMABLE_PHASES: readonly ResumablePhase[] = [
  'LOADING_FEED',
  'ADDING_SOLVENT',
  'MIXING',
  'EQUILIBRATING',
  'SEPARATING',
  'SHOWING_STAGE_RESULT',
  'DRAINING',
  'PREPARING_NEXT_STAGE',
];

export function playbackReducer(
  state: PlaybackMachineState,
  event: PlaybackEvent,
): PlaybackMachineState {
  if (event.type === 'CALCULATION_READY') {
    return isValidResultContract(event.result)
      ? {
          phase: 'READY',
          result: event.result,
          currentStageNumber: 0,
          speed: state.speed,
          pausedFrom: null,
          error: null,
        }
      : toError(state, 'Kết quả tính toán không đáp ứng contract Stage 0…N.');
  }

  if (event.type === 'RESET') return { ...INITIAL_PLAYBACK_STATE, speed: state.speed };
  if (event.type === 'CALCULATION_ERROR') return toError(state, event.message);
  if (event.type === 'INPUT_CHANGED') {
    return state.result === null
      ? state
      : { ...state, phase: 'STALE', pausedFrom: null, error: null };
  }
  if (event.type === 'SPEED_CHANGED') return { ...state, speed: event.speed };
  if (event.type === 'RESTART') {
    return state.result === null || state.phase === 'STALE'
      ? state
      : { ...state, phase: 'READY', currentStageNumber: 0, pausedFrom: null, error: null };
  }
  if (state.result === null || state.phase === 'STALE' || state.phase === 'ERROR') return state;

  switch (event.type) {
    case 'START':
      return state.phase === 'READY'
        ? { ...state, phase: 'LOADING_FEED', currentStageNumber: 1 }
        : state;
    case 'PAUSE':
      return isResumable(state.phase)
        ? { ...state, phase: 'PAUSED', pausedFrom: state.phase }
        : state;
    case 'RESUME':
      return state.phase === 'PAUSED' && state.pausedFrom !== null
        ? { ...state, phase: state.pausedFrom, pausedFrom: null }
        : state;
    case 'NEXT_STAGE':
      return advanceOneStage(state);
    case 'TICK':
      return tick(state);
    default:
      return state;
  }
}

export function isAutoAdvancePhase(phase: PlaybackPhase): boolean {
  return isResumable(phase) || phase === 'STAGE_COMPLETE';
}

function advanceOneStage(state: PlaybackMachineState): PlaybackMachineState {
  const stageCount = state.result!.final.stageCount;
  if (state.phase === 'READY') {
    return {
      ...state,
      currentStageNumber: 1,
      phase: stageCount === 1 ? 'COMPLETED' : 'STAGE_COMPLETE',
      pausedFrom: null,
    };
  }
  if (state.phase === 'SHOWING_STAGE_RESULT' || state.phase === 'PAUSED') {
    return {
      ...state,
      phase: state.currentStageNumber === stageCount ? 'COMPLETED' : 'STAGE_COMPLETE',
      pausedFrom: null,
    };
  }
  return state;
}

function tick(state: PlaybackMachineState): PlaybackMachineState {
  switch (state.phase) {
    case 'LOADING_FEED':
      return { ...state, phase: 'ADDING_SOLVENT' };
    case 'ADDING_SOLVENT':
      return { ...state, phase: 'MIXING' };
    case 'MIXING':
      return { ...state, phase: 'EQUILIBRATING' };
    case 'EQUILIBRATING':
      return { ...state, phase: 'SEPARATING' };
    case 'SEPARATING':
      return { ...state, phase: 'SHOWING_STAGE_RESULT' };
    case 'SHOWING_STAGE_RESULT':
      return { ...state, phase: 'DRAINING' };
    case 'DRAINING':
      return { ...state, phase: 'STAGE_COMPLETE' };
    case 'STAGE_COMPLETE':
      return state.currentStageNumber === state.result!.final.stageCount
        ? { ...state, phase: 'COMPLETED' }
        : { ...state, phase: 'PREPARING_NEXT_STAGE' };
    case 'PREPARING_NEXT_STAGE':
      return {
        ...state,
        phase: 'LOADING_FEED',
        currentStageNumber: state.currentStageNumber + 1,
      };
    default:
      return state;
  }
}

function isResumable(phase: PlaybackPhase): phase is ResumablePhase {
  return RESUMABLE_PHASES.includes(phase as ResumablePhase);
}

function isValidResultContract(result: SimulationResult): boolean {
  const { stages, final } = result;
  if (
    !Number.isInteger(final.stageCount) ||
    final.stageCount < 1 ||
    stages.length !== final.stageCount + 1
  ) {
    return false;
  }
  return stages.every((stage, index) => stage.stageNumber === index);
}

function toError(state: PlaybackMachineState, message: string): PlaybackMachineState {
  return {
    ...state,
    phase: 'ERROR',
    result: null,
    currentStageNumber: 0,
    pausedFrom: null,
    error: message,
  };
}
