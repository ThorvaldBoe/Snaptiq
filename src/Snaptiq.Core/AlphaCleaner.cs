namespace Snaptiq.Core;

public static class AlphaCleaner
{
    public static bool IsSemiTransparent(byte alpha) => alpha is > 0 and < 255;

    public static byte ToPrintSafeAlpha(byte alpha, byte opaqueThreshold = 255)
    {
        return alpha >= opaqueThreshold ? byte.MaxValue : byte.MinValue;
    }
}
