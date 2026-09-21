import { useEffect, useReducer, useState } from 'react';

import { INITIAL_PLAYBACK_STATE, isAutoAdvancePhase, playbackReducer } from './playbackMachine';

export const PLAYBACK_STEP_MS = 700;
export const REDUCED_MOTION_STEP_MS = 700;

export function usePlayback() {
  const [state, dispatch] = useReducer(playbackReducer, INITIAL_PLAYBACK_STATE);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isAutoAdvancePhase(state.phase)) return;
    const duration = reducedMotion ? REDUCED_MOTION_STEP_MS : PLAYBACK_STEP_MS / state.speed;
    const timer = window.setTimeout(() => dispatch({ type: 'TICK' }), duration);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, state.phase, state.speed]);

  return { state, dispatch, reducedMotion } as const;
}

function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return matches;
}
