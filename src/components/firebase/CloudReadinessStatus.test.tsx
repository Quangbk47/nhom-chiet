import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CloudOperationStatus, CloudReadinessStatus } from './CloudReadinessStatus';

describe('CloudReadinessStatus', () => {
  it('keeps the application usable when Firebase env is absent', () => {
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
