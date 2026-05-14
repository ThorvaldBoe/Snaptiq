namespace Snaptiq.Core;

/// <summary>
/// Defines supported alpha threshold values for binary transparency normalization.
/// </summary>
public static class ThresholdSettings
{
    public const int MinimumThreshold = 1;
    public const int MaximumThreshold = 254;
    public const int DefaultThreshold = 128;

    public static void Validate(int threshold)
    {
        if (threshold is < MinimumThreshold or > MaximumThreshold)
        {
            throw new InvalidThresholdException(threshold);
        }
    }
}
