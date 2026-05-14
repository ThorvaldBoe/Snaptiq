# Snaptiq Project Notes

## Purpose

Snaptiq exists to solve a narrow, real-world issue: PNG files with semi-transparent alpha pixels can behave poorly in print-on-demand and garment-printing workflows.

The project should stay small and practical until the alpha-cleaning behavior is validated with real artwork and production constraints.

## Non-goals for now

- No graphical user interface.
- No dependency injection container.
- No plugin system.
- No generalized image-processing framework.
- No business logic before the core behavior is defined.
- No abstractions that are not required by the current PNG alpha workflow.

## Backend target

All backend projects target .NET 10.

## Initial milestones

1. Establish the Snaptiq .NET solution structure.
2. Define the alpha-cleaning rules.
3. Add deterministic tests around alpha edge cases.
4. Add PNG file input/output once the core rules are stable.
5. Validate output with real print-on-demand samples.
