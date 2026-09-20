import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the neutral foundation notice', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Nền tảng ứng dụng đang được xây dựng' }),
    ).toBeInTheDocument();
  });
});
