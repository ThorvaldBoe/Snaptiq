namespace Snaptiq.Core;

/// <summary>
/// Statistics captured during a single alpha normalization operation.
/// </summary>
/// <param name="TotalPixels">Total number of pixels processed.</param>
/// <param name="SemiTransparentPixelsFound">Number of pixels with alpha values from 1 through 254.</param>
/// <param name="PixelsModified">Number of pixels whose alpha value changed.</param>
/// <param name="ThresholdUsed">Threshold used to normalize semi-transparent alpha values.</param>
public sealed record ProcessingStatistics(
    long TotalPixels,
    long SemiTransparentPixelsFound,
    long PixelsModified,
    int ThresholdUsed);
