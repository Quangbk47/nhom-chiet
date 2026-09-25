import { describe, expect, it } from 'vitest';
import { readFirebaseConfig } from './config';

describe('Firebase config boundary', () => {
  it('reports every missing required value and keeps writes disabled', () => {
    expect(readFirebaseConfig({})).toEqual({
      status: 'missing',
      missing: [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_APP_ID',
      ],
      writesEnabled: false,
    });
  });
  it('returns typed config without enabling writes by default', () => {
    const state = readFirebaseConfig({
      VITE_FIREBASE_API_KEY: 'key',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.test',
      VITE_FIREBASE_PROJECT_ID: 'project',
      VITE_FIREBASE_APP_ID: 'app',
    });
    expect(state).toMatchObject({
      status: 'configured',
      writesEnabled: false,
      config: { projectId: 'project' },
    });
  });
});
