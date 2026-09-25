import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Firestore security baseline', () => {
  it('is deny-by-default and never contains a public allow rule', () => {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    expect(rules).toContain('allow read, write: if false;');
    expect(rules).not.toMatch(/allow\s+read\s*,\s*write\s*:\s*if\s+true/);
  });
});
