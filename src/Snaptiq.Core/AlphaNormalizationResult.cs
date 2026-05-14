using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace Snaptiq.Core;

/// <summary>
/// Result of an alpha normalization operation.
/// </summary>
/// <param name="Image">Processed image data with normalized alpha values.</param>
/// <param name="Statistics">Statistics captured while processing the image.</param>
public sealed record AlphaNormalizationResult(
    Image<Rgba32> Image,
    ProcessingStatistics Statistics);
