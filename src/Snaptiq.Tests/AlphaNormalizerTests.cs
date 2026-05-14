using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Snaptiq.Core;

namespace Snaptiq.Tests;

public sealed class AlphaNormalizerTests
{
    [Fact]
    public void Normalize_UsesDefaultThresholdAndPreservesRgbValues()
    {
        using Image<Rgba32> image = CreateSingleRowImage(
            new Rgba32(10, 20, 30, 1),
            new Rgba32(40, 50, 60, 127),
            new Rgba32(70, 80, 90, 128),
            new Rgba32(100, 110, 120, 254));

        using Image<Rgba32> processedImage = AlphaNormalizer.Normalize(image).Image;

        Assert.Equal(new Rgba32(10, 20, 30, 0), processedImage[0, 0]);
        Assert.Equal(new Rgba32(40, 50, 60, 0), processedImage[1, 0]);
        Assert.Equal(new Rgba32(70, 80, 90, 255), processedImage[2, 0]);
        Assert.Equal(new Rgba32(100, 110, 120, 255), processedImage[3, 0]);
    }

    [Fact]
    public void Normalize_PreservesOriginalImage()
    {
        using Image<Rgba32> image = CreateSingleRowImage(new Rgba32(10, 20, 30, 127));

        using Image<Rgba32> processedImage = AlphaNormalizer.Normalize(image).Image;

        Assert.Equal(new Rgba32(10, 20, 30, 127), image[0, 0]);
        Assert.Equal(new Rgba32(10, 20, 30, 0), processedImage[0, 0]);
    }

    [Fact]
    public void NormalizeInPlace_PreservesTransparentAndOpaquePixels()
    {
        using Image<Rgba32> image = CreateSingleRowImage(
            new Rgba32(10, 20, 30, 0),
            new Rgba32(40, 50, 60, 255));

        ProcessingStatistics statistics = AlphaNormalizer.NormalizeInPlace(image);

        Assert.Equal(new Rgba32(10, 20, 30, 0), image[0, 0]);
        Assert.Equal(new Rgba32(40, 50, 60, 255), image[1, 0]);
        Assert.Equal(2, statistics.TotalPixels);
        Assert.Equal(0, statistics.SemiTransparentPixelsFound);
        Assert.Equal(0, statistics.PixelsModified);
        Assert.Equal(ThresholdSettings.DefaultThreshold, statistics.ThresholdUsed);
    }

    [Fact]
    public void NormalizeInPlace_ReturnsProcessingStatistics()
    {
        using Image<Rgba32> image = CreateSingleRowImage(
            new Rgba32(10, 20, 30, 0),
            new Rgba32(40, 50, 60, 40),
            new Rgba32(70, 80, 90, 200),
            new Rgba32(100, 110, 120, 255));

        ProcessingStatistics statistics = AlphaNormalizer.NormalizeInPlace(image, threshold: 128);

        Assert.Equal(4, statistics.TotalPixels);
        Assert.Equal(2, statistics.SemiTransparentPixelsFound);
        Assert.Equal(2, statistics.PixelsModified);
        Assert.Equal(128, statistics.ThresholdUsed);
    }

    [Theory]
    [InlineData(1, 0, 1, 255)]
    [InlineData(254, 253, 254, 255)]
    public void NormalizeInPlace_UsesConfiguredThreshold(int threshold, byte belowThreshold, byte atThreshold, byte aboveThreshold)
    {
        using Image<Rgba32> image = CreateSingleRowImage(
            new Rgba32(10, 20, 30, belowThreshold),
            new Rgba32(40, 50, 60, atThreshold),
            new Rgba32(70, 80, 90, aboveThreshold));

        AlphaNormalizer.NormalizeInPlace(image, threshold);

        Assert.Equal(0, image[0, 0].A);
        Assert.Equal(255, image[1, 0].A);
        Assert.Equal(255, image[2, 0].A);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(255)]
    public void NormalizeInPlace_RejectsInvalidThresholds(int threshold)
    {
        using Image<Rgba32> image = CreateSingleRowImage(new Rgba32(10, 20, 30, 127));

        Assert.Throws<InvalidThresholdException>(() => AlphaNormalizer.NormalizeInPlace(image, threshold));
    }

    [Fact]
    public void NormalizeInPlace_RejectsNullImage()
    {
        Assert.Throws<ArgumentNullException>(() => AlphaNormalizer.NormalizeInPlace(null));
    }

    private static Image<Rgba32> CreateSingleRowImage(params Rgba32[] pixels)
    {
        Image<Rgba32> image = new(pixels.Length, 1);

        for (int x = 0; x < pixels.Length; x++)
        {
            image[x, 0] = pixels[x];
        }

        return image;
    }
}
