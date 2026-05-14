using Snaptiq.Core;

if (args.Length == 0 || args.Contains("--help"))
{
    Console.WriteLine("Snaptiq - PNG alpha cleanup for print-on-demand workflows");
    Console.WriteLine();
    Console.WriteLine("Usage:");
    Console.WriteLine("  snaptiq <input.png> <output.png>");
    Console.WriteLine();
    Console.WriteLine("Current core rule:");
    Console.WriteLine($"  Alpha 254 is semi-transparent: {AlphaCleaner.IsSemiTransparent(254)}");
    return 0;
}

Console.Error.WriteLine("PNG file processing is not implemented yet.");
return 1;
