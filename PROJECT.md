# Snaptiq Project

## Mission

Snaptiq fixes semi-transparent pixels in PNG exports created during Affinity Designer workflows.

The project focuses on making exported artwork safer for print-on-demand production by removing problematic alpha pixels while preserving acceptable visual quality.

## Current Priority

Build a CLI utility that can process one PNG and produce a print-safe output.

The CLI should stay focused on reading an input PNG, writing an output PNG, and reporting basic success or failure. Image-processing decisions belong in the core library.

## Architecture Rules

Detailed core implementation guidance lives in `docs/engineering/core-engineering-rules.md`.

1. Business logic belongs in `Snaptiq.Core`.
2. CLI handles file input/output only.
3. Tests must use real regression samples.
4. No UI code in core.
5. Avoid premature abstractions.

## Specification Rules

1. Specifications live in `docs/specs`.
2. The `docs` folder contains `requirements.md`, which tracks all specification documents and their status.
3. `docs/requirements.md` must mention `docs/engineering/core-engineering-rules.md` so specification work stays aligned with the core engineering rules.
4. Specification status can be `draft`, `InProgress`, or `Done`.
5. When a feature is done, the related specification document is moved to `docs/specs/done`.
6. A feature specification should have a name that reflects its contents, using dashes to separate words, for example `core-alpha-algorithm.md`.
7. Any feature, except bugfixes or small adjustments, requires a specification.

## Tech Stack

### Backend

- .NET 10
- ImageSharp
- This project uses clean architecture, and all code is grouped into folders and namespaces following the rules of clean architecture.
- This project follows the SOLID principles of software engineering.

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
