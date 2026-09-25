import type { PersistableDocument } from './contracts';

export type PersistenceErrorCode = 'offline' | 'permission-denied' | 'unavailable' | 'unknown';
export interface PersistenceError {
  readonly code: PersistenceErrorCode;
  readonly message: string;
  readonly retryable: boolean;
}
export type SaveResult =
  { readonly ok: true } | { readonly ok: false; readonly error: PersistenceError };
export interface PersistenceDriver {
  save(path: string, document: PersistableDocument): Promise<void>;
}

export class FirebasePersistenceAdapter {
  constructor(
    private readonly driver: PersistenceDriver,
    private readonly writesEnabled: boolean,
  ) {}
  async save(path: string, document: PersistableDocument): Promise<SaveResult> {
    if (!this.writesEnabled)
      return {
        ok: false,
        error: {
          code: 'permission-denied',
          message:
            'Cloud write bị khóa cho đến khi Owner phê duyệt Authentication và Firestore rules.',
          retryable: false,
        },
      };
    try {
      await this.driver.save(path, document);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: mapPersistenceError(error) };
    }
  }
}

export function mapPersistenceError(error: unknown): PersistenceError {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code.includes('permission-denied'))
    return {
      code: 'permission-denied',
      message: 'Firestore từ chối quyền truy cập.',
      retryable: false,
    };
  if (code.includes('unavailable'))
    return {
      code: 'unavailable',
      message: 'Dịch vụ Firebase tạm thời không khả dụng.',
      retryable: true,
    };
  if (code.includes('network') || (typeof navigator !== 'undefined' && !navigator.onLine))
    return {
      code: 'offline',
      message: 'Không có kết nối mạng; dữ liệu local được giữ nguyên.',
      retryable: true,
    };
  return {
    code: 'unknown',
    message: 'Không thể lưu cloud; dữ liệu local được giữ nguyên.',
    retryable: true,
  };
}

export async function saveWithLocalFallback<T>(
  localSnapshot: T,
  operation: () => Promise<SaveResult>,
): Promise<{ readonly localSnapshot: T; readonly cloud: SaveResult }> {
  return Object.freeze({ localSnapshot, cloud: await operation() });
}
