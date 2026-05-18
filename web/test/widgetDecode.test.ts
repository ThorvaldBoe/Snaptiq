import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PngDecodeError,
  SampleImageDecodeError,
  SampleImageFetchError,
  UnsupportedPngFileError,
  decodePngFile,
  fetchSampleImageFile,
  toSampleImageLoadError
} from '../src/widget';

describe('decodePngFile', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalImage = globalThis.Image;
  const originalUrl = globalThis.URL;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalCreateImageBitmap) {
      vi.stubGlobal('createImageBitmap', originalCreateImageBitmap);
    } else {
      Reflect.deleteProperty(globalThis, 'createImageBitmap');
    }

    if (originalImage) {
      vi.stubGlobal('Image', originalImage);
    } else {
      Reflect.deleteProperty(globalThis, 'Image');
    }

    Object.defineProperty(globalThis, 'URL', {
      value: originalUrl,
      configurable: true,
      writable: true
    });
  });

  it('uses createImageBitmap when it succeeds', async () => {
    const close = vi.fn();
    const bitmap = {
      width: 12,
      height: 8,
      close
    };

    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));

    const decoded = await decodePngFile(new File(['png'], 'upload.png', { type: 'image/png' }));

    expect(decoded.width).toBe(12);
    expect(decoded.height).toBe(8);
    expect(decoded.source).toBe(bitmap);

    decoded.dispose();
    expect(close).toHaveBeenCalledOnce();
  });

  it('falls back to HTMLImageElement decoding when createImageBitmap rejects', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:sample');
    const revokeObjectURL = vi.fn();

    class SuccessfulImage {
      public onload: null | (() => void) = null;
      public onerror: null | (() => void) = null;
      public naturalWidth = 5;
      public naturalHeight = 7;
      public width = 5;
      public height = 7;
      private currentSrc = '';

      public set src(value: string) {
        this.currentSrc = value;
        queueMicrotask(() => this.onload?.());
      }

      public get src(): string {
        return this.currentSrc;
      }
    }

    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bitmap decode failed')));
    vi.stubGlobal('Image', SuccessfulImage);
    Object.defineProperty(globalThis, 'URL', {
      value: { createObjectURL, revokeObjectURL },
      configurable: true,
      writable: true
    });

    const file = new File(['png'], 'sampleimage.png', { type: 'image/png' });
    const decoded = await decodePngFile(file);

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(decoded.width).toBe(5);
    expect(decoded.height).toBe(7);

    decoded.dispose();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:sample');
  });

  it('revokes the object URL and throws a PNG decode error when fallback decoding fails', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:broken');
    const revokeObjectURL = vi.fn();

    class BrokenImage {
      public onload: null | (() => void) = null;
      public onerror: null | (() => void) = null;
      public naturalWidth = 0;
      public naturalHeight = 0;
      public width = 0;
      public height = 0;

      public set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }

    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bitmap decode failed')));
    vi.stubGlobal('Image', BrokenImage);
    Object.defineProperty(globalThis, 'URL', {
      value: { createObjectURL, revokeObjectURL },
      configurable: true,
      writable: true
    });

    await expect(decodePngFile(new File(['png'], 'broken.png', { type: 'image/png' }))).rejects.toBeInstanceOf(PngDecodeError);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:broken');
  });
});

describe('sample image loading errors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a PNG File from a fetched sample image response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Blob(['png']), { status: 200 })));

    const file = await fetchSampleImageFile('/vendor/snaptiq-web/sampleimage.png');

    expect(file.name).toBe('sampleimage.png');
    expect(file.type).toBe('image/png');
  });

  it('reports fetch failures separately from decode failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404, statusText: 'Not Found' })));

    await expect(fetchSampleImageFile('/vendor/snaptiq-web/sampleimage.png')).rejects.toEqual(
      new SampleImageFetchError('Sample image could not be fetched (404 Not Found).')
    );

    expect(toSampleImageLoadError(new PngDecodeError())).toEqual(
      new SampleImageDecodeError('Sample image could not be decoded.')
    );
    expect(toSampleImageLoadError(new UnsupportedPngFileError())).toEqual(
      new SampleImageDecodeError('Sample image is not a PNG file.')
    );
  });
});
