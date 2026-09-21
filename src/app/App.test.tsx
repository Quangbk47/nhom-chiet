import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('Phase 6 app shell and input UI', () => {
  it('renders the semantic shell and neutral deferred UI', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Mô phỏng chiết lỏng–lỏng' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Chế độ ứng dụng' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dữ liệu mô phỏng' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Không gian mô phỏng' })).toBeInTheDocument();
    expect(screen.getByTestId('form-status')).toHaveTextContent('Initial');
    expect(
      screen.getByText(/SVG visualization và playback chưa được triển khai/),
    ).toBeInTheDocument();
  });

  it('submits by keyboard, validates through the boundary and shows warnings', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillValidEqualForm(user);
    await user.click(screen.getByLabelText('Miền hiệu lực KD (nếu có)'));
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('form-status')).toHaveTextContent('Valid');
    expect(screen.getByLabelText('Cảnh báo dữ liệu')).toHaveTextContent('User-supplied KD');
    expect(screen.getByLabelText('Cảnh báo dữ liệu')).toHaveTextContent(
      'KD validity domain is not supplied',
    );
  });

  it('reports required errors, focuses an invalid field and preserves input', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng kiểm tra dữ liệu nhập');
    expect(screen.getByTestId('form-status')).toHaveTextContent('Invalid');
    await waitFor(() => expect(screen.getByLabelText('Nồng độ AcOH ban đầu (C0)')).toHaveFocus());
    expect(screen.getByLabelText('Nồng độ AcOH ban đầu (C0)')).toHaveValue('');
  });

  it('converts visible mL once and displays equal allocation from normalized input', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillValidEqualForm(user, { useMillilitres: true });
    expect(screen.getByTestId('equal-stage-volume')).toHaveTextContent('0.0200000 L');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    expect(screen.getByTestId('form-status')).toHaveTextContent('Valid');
  });

  it('supports stage boundaries 1 and 10 and rejects 11', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillValidEqualForm(user);
    const stageCount = screen.getByLabelText('Số bậc chiết (N)');
    for (const validCount of ['1', '10']) {
      await user.clear(stageCount);
      await user.type(stageCount, validCount);
      await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
      expect(screen.getByTestId('form-status')).toHaveTextContent('Valid');
    }
    await user.clear(stageCount);
    await user.type(stageCount, '11');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    expect(screen.getAllByText('Số bậc phải là số nguyên từ 1 đến 10.')).toHaveLength(2);
  });

  it('creates exactly N custom split inputs and validates their sum', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBaseFields(user);
    await user.click(screen.getByRole('radio', { name: 'Tùy chỉnh từng bậc' }));
    const group = screen.getByRole('group', { name: /Thể tích dung môi từng bậc/ });
    const stageInputs = within(group).getAllByRole('textbox');
    expect(stageInputs).toHaveLength(4);
    for (const [index, input] of stageInputs.entries())
      await user.type(input, index === 3 ? '0.01' : '0.02');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    expect(
      screen.getAllByText(
        'Tổng chia dung môi phải bằng tổng dung môi trong sai số kỹ thuật cho phép.',
      ),
    ).toHaveLength(2);
    await user.clear(stageInputs[3]);
    await user.type(stageInputs[3], '0.02');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    expect(screen.getByTestId('form-status')).toHaveTextContent('Valid');
  });

  it('marks a valid result stale after edits and reset returns initial state', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillValidEqualForm(user);
    await user.click(screen.getByRole('button', { name: 'Kiểm tra và chuẩn bị mô phỏng' }));
    await user.type(screen.getByLabelText('Ghi chú hoặc mã tham chiếu KD'), ' updated');
    expect(screen.getByTestId('form-status')).toHaveTextContent('Stale result');
    expect(screen.getByText(/Previous calculation không còn là hiện tại/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Đặt lại' }));
    expect(screen.getByTestId('form-status')).toHaveTextContent('Initial');
    expect(screen.getByLabelText('Hệ số phân bố KD')).toHaveValue('');
    expect(screen.getByLabelText('Nguồn KD')).toHaveValue('');
  });
});

async function fillBaseFields(
  user: ReturnType<typeof userEvent.setup>,
  options: { readonly useMillilitres?: boolean } = {},
) {
  await user.type(screen.getByLabelText('Nồng độ AcOH ban đầu (C0)'), '0.5');
  if (options.useMillilitres) {
    await user.selectOptions(screen.getByLabelText('Đơn vị Thể tích pha nước ban đầu (VR)'), 'mL');
    await user.selectOptions(
      screen.getByLabelText('Đơn vị Tổng thể tích etyl axetat (VS,total)'),
      'mL',
    );
    await user.type(screen.getByLabelText('Thể tích pha nước ban đầu (VR)'), '100');
    await user.type(screen.getByLabelText('Tổng thể tích etyl axetat (VS,total)'), '80');
  } else {
    await user.type(screen.getByLabelText('Thể tích pha nước ban đầu (VR)'), '0.1');
    await user.type(screen.getByLabelText('Tổng thể tích etyl axetat (VS,total)'), '0.08');
  }
  await user.type(screen.getByLabelText('Số bậc chiết (N)'), '4');
  await user.type(screen.getByLabelText('Hệ số phân bố KD'), '2');
  await user.selectOptions(screen.getByLabelText('Nguồn KD'), 'user_supplied');
  await user.type(
    screen.getByLabelText('Ghi chú hoặc mã tham chiếu KD'),
    'Software UI test only; not a project default.',
  );
}

async function fillValidEqualForm(
  user: ReturnType<typeof userEvent.setup>,
  options: { readonly useMillilitres?: boolean } = {},
) {
  await fillBaseFields(user, options);
  await user.click(screen.getByRole('radio', { name: 'Chia đều theo số bậc' }));
}
