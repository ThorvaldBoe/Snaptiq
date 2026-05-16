import { describe, expect, it } from 'vitest';
import { InvalidImageDataError, normalizeAlphaDataInPlace } from '../src/engine/alphaNormalizer';
import { InvalidThresholdError } from '../src/engine/thresholdSettings';

describe('normalizeAlphaDataInPlace', () => {
  it('normalizes only semi-transparent alpha values and preserves RGB channels', () => {
    const rgba = new Uint8ClampedArray([
      10, 20, 30, 0,
      40, 50, 60, 1,
      70, 80, 90, 127,
      100, 110, 120, 128,
      130, 140, 150, 254,
      160, 170, 180, 255
    ]);

    const statistics = normalizeAlphaDataInPlace(rgba, 3, 2, 128);

    expect(Array.from(rgba)).toEqual([
      10, 20, 30, 0,
      40, 50, 60, 0,
      70, 80, 90, 0,
      100, 110, 120, 255,
      130, 140, 150, 255,
      160, 170, 180, 255
    ]);
    expect(statistics).toEqual({
      totalPixels: 6,
      semiTransparentPixelsFound: 4,
      pixelsModified: 4,
      thresholdUsed: 128
    });
  });

  it('treats alpha values equal to threshold as opaque to match Snaptiq.Core', () => {
    const rgba = new Uint8ClampedArray([9, 8, 7, 64]);

    const statistics = normalizeAlphaDataInPlace(rgba, 1, 1, 64);

    expect(Array.from(rgba)).toEqual([9, 8, 7, 255]);
    expect(statistics.pixelsModified).toBe(1);
  });

  it('does not count already binary alpha pixels as semi-transparent or modified', () => {
    const rgba = new Uint8ClampedArray([1, 2, 3, 0, 4, 5, 6, 255]);

    const statistics = normalizeAlphaDataInPlace(rgba, 2, 1, 128);

    expect(Array.from(rgba)).toEqual([1, 2, 3, 0, 4, 5, 6, 255]);
    expect(statistics.semiTransparentPixelsFound).toBe(0);
    expect(statistics.pixelsModified).toBe(0);
  });

  it('rejects thresholds outside the supported range', () => {
    const rgba = new Uint8ClampedArray([1, 2, 3, 4]);

    expect(() => normalizeAlphaDataInPlace(rgba, 1, 1, 0)).toThrow(InvalidThresholdError);
    expect(() => normalizeAlphaDataInPlace(rgba, 1, 1, 255)).toThrow(InvalidThresholdError);
  });

  it('rejects RGBA data that does not match the dimensions', () => {
    const rgba = new Uint8ClampedArray([1, 2, 3, 4]);

    expect(() => normalizeAlphaDataInPlace(rgba, 2, 2, 128)).toThrow(InvalidImageDataError);
  });
});
