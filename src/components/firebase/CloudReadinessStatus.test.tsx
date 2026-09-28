import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloudOperationStatus, CloudReadinessStatus } from './CloudReadinessStatus';

describe('CloudReadinessStatus', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('keeps the application usable when Firebase env is absent', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');
    render(<CloudReadinessStatus />);
    expect(screen.getByRole('status')).toHaveTextContent('ứng dụng vẫn chạy local');
  });
  it('announces loading and cloud failures without claiming local loss', () => {
    const { rerender } = render(<CloudOperationStatus state={{ status: 'loading' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('dữ liệu local vẫn được giữ');
    rerender(
      <CloudOperationStatus
        state={{
          status: 'error',
          error: { code: 'unavailable', message: 'Không khả dụng.', retryable: true },
        }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Dữ liệu local không bị xóa');
  });
});
