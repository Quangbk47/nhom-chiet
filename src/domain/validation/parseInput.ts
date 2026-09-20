export type DecimalSeparator = 'auto' | 'dot' | 'comma';

export type ParseNumberResult =
  | { readonly ok: true; readonly value: number }
  | { readonly ok: false; readonly reason: 'required' | 'invalid' };

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function parseFiniteNumber(
  rawValue: number | string,
  decimalSeparator: DecimalSeparator = 'auto',
): ParseNumberResult {
  if (typeof rawValue === 'number') {
    return Number.isFinite(rawValue)
      ? { ok: true, value: rawValue }
      : { ok: false, reason: 'invalid' };
  }

  const trimmed = rawValue.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'required' };
  }

  const normalized = normalizeDecimalSeparator(trimmed, decimalSeparator);
  if (normalized === null || !DECIMAL_PATTERN.test(normalized)) {
    return { ok: false, reason: 'invalid' };
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, reason: 'invalid' };
}

function normalizeDecimalSeparator(value: string, mode: DecimalSeparator): string | null {
  const hasDot = value.includes('.');
  const commaCount = value.split(',').length - 1;

  if (mode === 'dot') {
    return commaCount === 0 ? value : null;
  }

  if (mode === 'comma') {
    return !hasDot && commaCount <= 1 ? value.replace(',', '.') : null;
  }

  if (hasDot && commaCount > 0) {
    return null;
  }

  if (commaCount === 1) {
    const [integerPart, fractionPart] = value.toLowerCase().split('e')[0].split(',');
    if (integerPart !== undefined && fractionPart?.length === 3) {
      return null;
    }
  }

  return commaCount <= 1 ? value.replace(',', '.') : null;
}
