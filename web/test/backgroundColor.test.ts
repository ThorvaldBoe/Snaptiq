import { describe, expect, it } from 'vitest';
import { normalizeBackgroundColorInput } from '../src/widget/backgroundColor';

describe('normalizeBackgroundColorInput', () => {
  it('normalizes supported hex colors to uppercase full hex', () => {
    expect(normalizeBackgroundColorInput('#fff')).toBe('#FFFFFF');
    expect(normalizeBackgroundColorInput('#ff0000')).toBe('#FF0000');
    expect(normalizeBackgroundColorInput('  #4b5320  ')).toBe('#4B5320');
  });

  it('uses an empty value for transparent background mode', () => {
    expect(normalizeBackgroundColorInput('')).toBe('');
    expect(normalizeBackgroundColorInput('   ')).toBe('');
  });

  it('rejects invalid hex values', () => {
    expect(normalizeBackgroundColorInput('#GGGGGG')).toBeNull();
    expect(normalizeBackgroundColorInput('abc')).toBeNull();
    expect(normalizeBackgroundColorInput('#12')).toBeNull();
  });
});
