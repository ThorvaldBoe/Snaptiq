using System.Diagnostics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using Snaptiq.Core;

namespace Snaptiq.Cli;

internal static class Program
{
    private const string SnaptiqOriginalSuffix = ".snaptiq-original";
    private const string SnaptiqVersionSuffix = ".snaptiq-";

    public static int Main(string[] args)
    {
        try
        {
            CliOptions options = CliOptions.Parse(args);
            ProcessingSummary summary = Process(options);
            PrintSuccess(summary);
            return 0;
        }
        catch (CliException exception)
        {
            Console.Error.WriteLine(exception.Message);
            return 1;
        }
        catch (InvalidThresholdException)
        {
            Console.Error.WriteLine($"Invalid threshold. Must be between {ThresholdSettings.MinimumThreshold} and {ThresholdSettings.MaximumThreshold}.");
            return 1;
        }
        catch (UnauthorizedAccessException)
        {
            Console.Error.WriteLine("File is inaccessible.");
            return 1;
        }
        catch (IOException exception)
        {
            Console.Error.WriteLine($"File operation failed: {exception.Message}");
            return 1;
        }
        catch (UnknownImageFormatException)
        {
            Console.Error.WriteLine("Unsupported file format.");
            return 1;
        }
        catch (ImageFormatException)
        {
            Console.Error.WriteLine("Input file is corrupt or not a supported PNG image.");
            return 1;
        }
    }

    private static ProcessingSummary Process(CliOptions options)
    {
        ValidateInputFile(options.InputFile);

        Stopwatch stopwatch = Stopwatch.StartNew();
        ProcessingResult result = options.OutputFile is not null
            ? ProcessWithExplicitOutput(options)
            : ProcessWithCreatorWorkflow(options);
        stopwatch.Stop();

        return new ProcessingSummary(
            InputFile: options.InputFile,
            OutputFile: result.OutputFile,
            Statistics: result.Statistics,
            Duration: stopwatch.Elapsed);
    }

    private static ProcessingResult ProcessWithExplicitOutput(CliOptions options)
    {
        string outputFile = GetAvailableOutputFile(ValidateOutputFile(options.OutputFile!));
        ProcessingStatistics statistics = NormalizeFile(options.InputFile, outputFile, options.Threshold);

        return new ProcessingResult(outputFile, statistics);
    }

    private static ProcessingResult ProcessWithCreatorWorkflow(CliOptions options)
    {
        if (IsSnaptiqOriginalFile(options.InputFile))
        {
            string outputFile = GetAvailableSnaptiqVersionFile(options.InputFile);
            ProcessingStatistics statistics = NormalizeFile(options.InputFile, outputFile, options.Threshold);

            return new ProcessingResult(outputFile, statistics);
        }

        string backupFile = GetSnaptiqOriginalFile(options.InputFile);
        if (File.Exists(backupFile))
        {
            throw new CliException("Snaptiq original already exists.\n\nThis file appears to have already been processed.\n\nUse the original backup file if you want to try another threshold.");
        }

        File.Copy(options.InputFile, backupFile);
        ProcessingStatistics processedStatistics = NormalizeFile(backupFile, options.InputFile, options.Threshold);

        return new ProcessingResult(options.InputFile, processedStatistics);
    }

    private static ProcessingStatistics NormalizeFile(string inputFile, string outputFile, int threshold)
    {
        using Image<Rgba32> image = Image.Load<Rgba32>(inputFile);
        AlphaNormalizationResult result = AlphaNormalizer.Normalize(image, threshold);

        using (result.Image)
        {
            result.Image.SaveAsPng(outputFile);
        }

        return result.Statistics;
    }

    private static void ValidateInputFile(string inputFile)
    {
        if (!File.Exists(inputFile))
        {
            throw new CliException("Input file not found.");
        }

        if (!IsPngFile(inputFile))
        {
            throw new CliException("Unsupported file format.");
        }
    }

    private static string ValidateOutputFile(string outputFile)
    {
        if (!IsPngFile(outputFile))
        {
            throw new CliException("Output file must be a PNG file.");
        }

        return outputFile;
    }

    private static string GetSnaptiqOriginalFile(string inputFile)
    {
        string? directory = Path.GetDirectoryName(inputFile);
        string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(inputFile);

        return Path.Combine(directory ?? string.Empty, $"{fileNameWithoutExtension}{SnaptiqOriginalSuffix}.png");
    }

    private static bool IsSnaptiqOriginalFile(string inputFile) =>
        Path.GetFileNameWithoutExtension(inputFile).EndsWith(SnaptiqOriginalSuffix, StringComparison.OrdinalIgnoreCase);

    private static string GetAvailableSnaptiqVersionFile(string originalFile)
    {
        string? directory = Path.GetDirectoryName(originalFile);
        string originalNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFile);
        string baseName = originalNameWithoutExtension[..^SnaptiqOriginalSuffix.Length];

        for (int version = 2; ; version++)
        {
            string candidate = Path.Combine(directory ?? string.Empty, $"{baseName}{SnaptiqVersionSuffix}{version}.png");
            if (!File.Exists(candidate))
            {
                return candidate;
            }
        }
    }

    private static string GetAvailableOutputFile(string outputFile)
    {
        if (!File.Exists(outputFile))
        {
            return outputFile;
        }

        string? directory = Path.GetDirectoryName(outputFile);
        string baseName = Path.GetFileNameWithoutExtension(outputFile);

        for (int version = 2; ; version++)
        {
            string candidate = Path.Combine(directory ?? string.Empty, $"{baseName}{SnaptiqVersionSuffix}{version}.png");
            if (!File.Exists(candidate))
            {
                return candidate;
            }
        }
    }

    private static bool IsPngFile(string filePath) =>
        string.Equals(Path.GetExtension(filePath), ".png", StringComparison.OrdinalIgnoreCase);

    private static void PrintSuccess(ProcessingSummary summary)
    {
        Console.WriteLine($"Input: {summary.InputFile}");
        Console.WriteLine($"Output: {summary.OutputFile}");
        Console.WriteLine($"Threshold: {summary.Statistics.ThresholdUsed}");
        Console.WriteLine($"Pixels: {summary.Statistics.TotalPixels:N0}");
        Console.WriteLine($"Semi-transparent: {summary.Statistics.SemiTransparentPixelsFound:N0}");
        Console.WriteLine($"Modified: {summary.Statistics.PixelsModified:N0}");
        Console.WriteLine($"Time: {summary.Duration.TotalMilliseconds:N0} ms");
    }

    private sealed record ProcessingResult(string OutputFile, ProcessingStatistics Statistics);

    private sealed record ProcessingSummary(
        string InputFile,
        string OutputFile,
        ProcessingStatistics Statistics,
        TimeSpan Duration);
}

internal sealed record CliOptions(string InputFile, int Threshold, string? OutputFile)
{
    public static CliOptions Parse(string[] args)
    {
        if (args.Length == 0)
        {
            throw new CliException("Input file is required.");
        }

        string? inputFile = null;
        string? outputFile = null;
        int threshold = ThresholdSettings.DefaultThreshold;

        for (int index = 0; index < args.Length; index++)
        {
            string arg = args[index];

            switch (arg)
            {
                case "--threshold":
                case "-t":
                    threshold = ParseThreshold(GetRequiredOptionValue(args, ref index, arg));
                    break;
                case "--output":
                case "-o":
                    outputFile = GetRequiredOptionValue(args, ref index, arg);
                    break;
                default:
                    if (arg.StartsWith('-', StringComparison.Ordinal))
                    {
                        throw new CliException($"Unknown option: {arg}");
                    }

                    if (inputFile is not null)
                    {
                        throw new CliException("Only one input file is supported.");
                    }

                    inputFile = arg;
                    break;
            }
        }

        if (inputFile is null)
        {
            throw new CliException("Input file is required.");
        }

        return new CliOptions(inputFile, threshold, outputFile);
    }

    private static string GetRequiredOptionValue(string[] args, ref int index, string optionName)
    {
        if (index + 1 >= args.Length)
        {
            throw new CliException($"Missing value for {optionName}.");
        }

        index++;
        string value = args[index];
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new CliException($"Missing value for {optionName}.");
        }

        return value;
    }

    private static int ParseThreshold(string value)
    {
        if (!int.TryParse(value, out int threshold))
        {
            throw new CliException($"Invalid threshold. Must be between {ThresholdSettings.MinimumThreshold} and {ThresholdSettings.MaximumThreshold}.");
        }

        ThresholdSettings.Validate(threshold);
        return threshold;
    }
}

internal sealed class CliException : Exception
{
    public CliException(string message)
        : base(message)
    {
    }
}
