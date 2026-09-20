import type { SimulationInput } from '../models';

export const USER_SUPPLIED_INPUT_FIXTURE: SimulationInput = Object.freeze({
  c0MolPerL: '0.5',
  feedVolumeL: '0.1',
  totalSolventVolumeL: '0.08',
  stageCount: '4',
  splitMode: 'equal',
  stageSolventVolumesL: null,
  kd: {
    value: '2',
    sourceType: 'user_supplied',
    referenceIdOrNote: 'Software-test fixture only; not a project default.',
    validityDomainNote: null,
  },
  temperature: { status: 'declared', valueC: '25' },
  modelId: 'constant-kd-v1',
});
