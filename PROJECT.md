# Snaptiq Project

## Mission

Snaptiq fixes semi-transparent pixels in PNG exports created during Affinity Designer workflows.

The project focuses on making exported artwork safer for print-on-demand production by removing problematic alpha pixels while preserving acceptable visual quality.

## Current Priority

Build a CLI utility that can process one PNG and produce a print-safe output.

The CLI should stay focused on reading an input PNG, writing an output PNG, and reporting basic success or failure. Image-processing decisions belong in the core library.

## Architecture Rules

1. Business logic belongs in `Snaptiq.Core`.
2. CLI handles file input/output only.
3. Tests must use real regression samples.
4. No UI code in core.
5. Avoid premature abstractions.

## Tech Stack

### Backend

- .NET 10
- ImageSharp

### Frontend (future)

- TypeScript
- Vite

### Desktop (future)

- Avalonia

## Success Criteria

MVP is complete when:

- A broken PNG can be processed.
- All semi-transparent pixels are removed.
- Output remains visually acceptable for print-on-demand.
