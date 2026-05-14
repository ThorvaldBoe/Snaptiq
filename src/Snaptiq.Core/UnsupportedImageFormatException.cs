namespace Snaptiq.Core;

/// <summary>
/// Thrown when image data cannot be processed by Snaptiq Core.
/// </summary>
public sealed class UnsupportedImageFormatException : Exception
{
    public UnsupportedImageFormatException(string message)
        : base(message)
    {
    }
}
