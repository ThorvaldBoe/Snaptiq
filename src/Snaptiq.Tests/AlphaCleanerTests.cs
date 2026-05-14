using Snaptiq.Core;
using Xunit;

namespace Snaptiq.Tests;

public sealed class AlphaCleanerTests
{
    [Theory]
    [InlineData(1)]
    [InlineData(128)]
    [InlineData(254)]
    public void IsSemiTransparentReturnsTrueForPartialAlpha(byte alpha)
    {
        Assert.True(AlphaCleaner.IsSemiTransparent(alpha));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(255)]
    public void IsSemiTransparentReturnsFalseForPrintSafeAlpha(byte alpha)
    {
        Assert.False(AlphaCleaner.IsSemiTransparent(alpha));
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(254, 0)]
    [InlineData(255, 255)]
    public void ToPrintSafeAlphaRemovesSemiTransparentValues(byte alpha, byte expected)
    {
        Assert.Equal(expected, AlphaCleaner.ToPrintSafeAlpha(alpha));
    }
}
