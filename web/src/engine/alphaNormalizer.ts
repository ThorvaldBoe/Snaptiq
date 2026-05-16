import { validateThreshold } from './thresholdSettings';

export interface ProcessingStatistics {
  totalPixels: number;
  semiTransparentPixelsFound: number;
  pixelsModified: number;
  thresholdUsed: number;
}

export interface AlphaNormalizationResult {
  imageData: ImageData;
  statistics: ProcessingStatistics;
}

export class InvalidImageDataError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'InvalidImageDataError';
  }
}

export function normalizeAlpha(imageData: ImageData | null | undefined, threshold: number): AlphaNormalizationResult {
  validateImageData(imageData);
  validateThreshold(threshold);

  const processedData = new Uint8ClampedArray(imageData.data);
  const statistics = normalizeAlphaDataInPlace(processedData, imageData.width, imageData.height, threshold);

  return {
    imageData: new ImageData(processedData, imageData.width, imageData.height),
    statistics
  };
}

export function normalizeAlphaDataInPlace(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): ProcessingStatistics {
  validateRawRgbaData(data, width, height);
  validateThreshold(threshold);

  let semiTransparentPixelsFound = 0;
  let pixelsModified = 0;

  for (let index = 3; index < data.length; index += 4) {
    const alpha = data[index];

    if (alpha === 0 || alpha === 255) {
      continue;
    }

    semiTransparentPixelsFound += 1;

    const normalizedAlpha = alpha < threshold ? 0 : 255;
    if (normalizedAlpha !== alpha) {
      data[index] = normalizedAlpha;
      pixelsModified += 1;
    }
  }

  return {
    totalPixels: width * height,
    semiTransparentPixelsFound,
    pixelsModified,
    thresholdUsed: threshold
  };
}

function validateImageData(imageData: ImageData | null | undefined): asserts imageData is ImageData {
  if (imageData == null) {
    throw new InvalidImageDataError('Image data cannot be null.');
  }

  validateRawRgbaData(imageData.data, imageData.width, imageData.height);
}

function validateRawRgbaData(data: Uint8ClampedArray, width: number, height: number): void {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new InvalidImageDataError('Image dimensions must be positive integers.');
  }

  if (data.length !== width * height * 4) {
    throw new InvalidImageDataError('RGBA image data length does not match the supplied dimensions.');
  }
}
