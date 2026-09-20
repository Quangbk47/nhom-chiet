import { describe, expect, it } from 'vitest';
import { convertVolumeToLitres } from './normalizeInput';
import { parseFiniteNumber } from './parseInput';

describe('parseFiniteNumber', () => {
  it.each([
    ['0', 0],
    ['1.25', 1.25],
    ['1,25', 1.25],
    ['1e-3', 0.001],
    ['-2.5E+2', -250],
  ])('parses canonical and unambiguous locale input %s', (raw, expected) => {
    expect(parseFiniteNumber(raw)).toEqual({ ok: true, value: expected });
  });

  it('supports an explicitly selected comma decimal separator', () => {
    expect(parseFiniteNumber('1,234', 'comma')).toEqual({ ok: true, value: 1.234 });
  });

  it('rejects an ambiguous comma-separated value in automatic mode', () => {
    expect(parseFiniteNumber('1,234')).toEqual({ ok: false, reason: 'invalid' });
  });

  it.each([
    '',
    '   ',
    'NaN',
    'Infinity',
    '-Infinity',
    '0x10',
    '1 L',
    '1.',
    '1,',
    '1.2.3',
    '1,2.3',
    '1,2,3',
  ])('rejects invalid numeric input %j', (raw) => {
    expect(parseFiniteNumber(raw).ok).toBe(false);
  });
});

describe('convertVolumeToLitres', () => {
  it('converts displayed mL to canonical L exactly at the boundary', () => {
    expect(convertVolumeToLitres(100, 'mL')).toBe(0.1);
    expect(convertVolumeToLitres(0.1, 'L')).toBe(0.1);
  });
});
