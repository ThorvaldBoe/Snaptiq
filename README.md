# Snaptiq

Snaptiq is a focused utility for fixing PNG alpha transparency problems in print-on-demand workflows.

Many print-on-demand pipelines treat semi-transparent PNG pixels inconsistently, which can create unwanted halos, faded edges, or unexpected garment-print artifacts. Snaptiq's first goal is to make those alpha values explicit and predictable before artwork is uploaded for production.

## Project status

This repository is in its initial structure phase. The backend projects target .NET 10 and intentionally avoid UI, dependency injection, plugin systems, and broad abstractions until the core PNG alpha workflow is proven.

## Repository layout

```text
src/
  Snaptiq.Core/   Core alpha-cleaning logic.
  Snaptiq.Cli/    Command-line entry point.
  Snaptiq.Tests/  Automated tests for the core behavior.
web/              Reserved for future web-related assets if needed.
samples/          Sample image fixtures and workflow notes.
docs/             Documentation and design notes.
.github/          GitHub repository configuration.
```

## Current focus

The initial problem Snaptiq is designed to solve:

1. Detect semi-transparent PNG alpha values.
2. Convert alpha data into print-safe values.
3. Preserve a small, understandable codebase while the workflow is validated against real print-on-demand files.

## Build

Install the .NET 10 SDK, then run:

```bash
dotnet build src/Snaptiq.Cli/Snaptiq.Cli.csproj
dotnet test src/Snaptiq.Tests/Snaptiq.Tests.csproj
```
