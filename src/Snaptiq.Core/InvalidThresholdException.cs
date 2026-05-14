namespace Snaptiq.Core;

/// <summary>
/// Thrown when an alpha threshold is outside the supported range.
/// </summary>
public sealed class InvalidThresholdException : ArgumentOutOfRangeException
{
    public InvalidThresholdException(int threshold)
        : base(nameof(threshold), threshold, $"Threshold must be between {ThresholdSettings.MinimumThreshold} and {ThresholdSettings.MaximumThreshold}.")
    {
    }
}
