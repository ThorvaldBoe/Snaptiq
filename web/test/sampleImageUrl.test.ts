import { describe, expect, it } from 'vitest';
import { defaultSampleImageUrl, resolveSampleImageUrl } from '../src/widget';

describe('resolveSampleImageUrl', () => {
  it('returns the default sample image path when no option is provided', () => {
    expect(resolveSampleImageUrl()).toBe(defaultSampleImageUrl);
  });

  it('returns the configured sample image path for embedded usage', () => {
    expect(resolveSampleImageUrl({ sampleImageUrl: '/vendor/snaptiq-web/sampleimage.png' })).toBe(
      '/vendor/snaptiq-web/sampleimage.png'
    );
  });
});
