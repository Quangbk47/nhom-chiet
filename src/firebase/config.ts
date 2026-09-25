export interface FirebaseEnvironment {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_CLOUD_WRITES_ENABLED?: string;
}

export interface FirebaseRuntimeConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
  readonly storageBucket?: string;
  readonly messagingSenderId?: string;
}

export type FirebaseConfigState =
  | {
      readonly status: 'missing';
      readonly missing: readonly string[];
      readonly writesEnabled: false;
    }
  | {
      readonly status: 'configured';
      readonly config: FirebaseRuntimeConfig;
      readonly writesEnabled: boolean;
    };

const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export function readFirebaseConfig(
  env: FirebaseEnvironment = import.meta.env,
): FirebaseConfigState {
  const missing = REQUIRED.filter((key) => !env[key]?.trim());
  if (missing.length > 0)
    return Object.freeze({
      status: 'missing',
      missing: Object.freeze(missing),
      writesEnabled: false,
    });
  return Object.freeze({
    status: 'configured',
    config: Object.freeze({
      apiKey: env.VITE_FIREBASE_API_KEY!.trim(),
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN!.trim(),
      projectId: env.VITE_FIREBASE_PROJECT_ID!.trim(),
      appId: env.VITE_FIREBASE_APP_ID!.trim(),
      ...(env.VITE_FIREBASE_STORAGE_BUCKET?.trim()
        ? { storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET.trim() }
        : {}),
      ...(env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim()
        ? { messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID.trim() }
        : {}),
    }),
    writesEnabled: env.VITE_FIREBASE_CLOUD_WRITES_ENABLED === 'true',
  });
}
