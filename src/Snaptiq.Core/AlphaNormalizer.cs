using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace Snaptiq.Core;

/// <summary>
/// Converts semi-transparent alpha values to binary transparency while preserving RGB values.
/// </summary>
public static class AlphaNormalizer
{
    /// <summary>
    /// Creates a processed copy of the provided image using the default threshold.
    /// </summary>
    /// <param name="image">The 8-bit RGBA image data to normalize.</param>
    /// <returns>A processed image and processing statistics.</returns>
    public static AlphaNormalizationResult Normalize(Image<Rgba32>? image) =>
        Normalize(image, ThresholdSettings.DefaultThreshold);

    /// <summary>
    /// Creates a processed copy of the provided image using the supplied threshold.
    /// </summary>
    /// <param name="image">The 8-bit RGBA image data to normalize.</param>
    /// <param name="threshold">Alpha threshold in the range 1 through 254.</param>
    /// <returns>A processed image and processing statistics.</returns>
    public static AlphaNormalizationResult Normalize(Image<Rgba32>? image, int threshold)
    {
        ValidateImage(image);
        ThresholdSettings.Validate(threshold);

        Image<Rgba32> processedImage = image.Clone();
        ProcessingStatistics statistics = NormalizeInPlace(processedImage, threshold);

        return new AlphaNormalizationResult(processedImage, statistics);
    }

    /// <summary>
    /// Normalizes alpha values directly on the provided image using the default threshold.
    /// </summary>
    /// <param name="image">The 8-bit RGBA image data to normalize.</param>
    /// <returns>Statistics captured while processing the image.</returns>
    public static ProcessingStatistics NormalizeInPlace(Image<Rgba32>? image) =>
        NormalizeInPlace(image, ThresholdSettings.DefaultThreshold);

    /// <summary>
    /// Normalizes alpha values directly on the provided image using the supplied threshold.
    /// </summary>
    /// <param name="image">The 8-bit RGBA image data to normalize.</param>
    /// <param name="threshold">Alpha threshold in the range 1 through 254.</param>
    /// <returns>Statistics captured while processing the image.</returns>
    public static ProcessingStatistics NormalizeInPlace(Image<Rgba32>? image, int threshold)
    {
        ValidateImage(image);
        ThresholdSettings.Validate(threshold);

        long semiTransparentPixelsFound = 0;
        long pixelsModified = 0;

        image.ProcessPixelRows(accessor =>
        {
            for (int y = 0; y < accessor.Height; y++)
            {
                Span<Rgba32> row = accessor.GetRowSpan(y);

                for (int x = 0; x < row.Length; x++)
                {
                    byte alpha = row[x].A;

                    if (alpha is 0 or 255)
                    {
                        continue;
                    }

                    semiTransparentPixelsFound++;

                    byte normalizedAlpha = alpha < threshold ? (byte)0 : (byte)255;
                    if (normalizedAlpha != alpha)
                    {
                        Rgba32 pixel = row[x];
                        pixel.A = normalizedAlpha;
                        row[x] = pixel;
                        pixelsModified++;
                    }
                }
            }
        });

        return new ProcessingStatistics(
            TotalPixels: (long)image.Width * image.Height,
            SemiTransparentPixelsFound: semiTransparentPixelsFound,
            PixelsModified: pixelsModified,
            ThresholdUsed: threshold);
    }

    private static void ValidateImage(Image<Rgba32>? image)
    {
        if (image is null)
        {
            throw new ArgumentNullException(nameof(image), "Image data cannot be null.");
        }
    }
}
