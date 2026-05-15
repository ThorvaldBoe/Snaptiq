# Snaptiq CLI Specification
Version: 0.1
Module: Snaptiq.Cli
Status: Done

---

# 1. Purpose

Snaptiq CLI provides a command-line interface for processing PNG files using Snaptiq.Core.

The CLI is designed for:

- Print-on-demand creators
- Designers
- Batch image workflows
- Developer automation

Its primary responsibility is:

- File input/output
- Argument parsing
- Validation
- User feedback
- Safe file workflow management

Snaptiq.Cli must not contain image processing logic.

All image processing belongs to Snaptiq.Core.

---

# 2. Command Format

Basic syntax:

snaptiq <input-file> [options]

Examples:

snaptiq design.png

snaptiq design.png --threshold 96

snaptiq design.png --output clean.png

snaptiq design.png --output clean.png --threshold 160

---

# 3. Required Parameters

## Input File

Required.

Must be a PNG file.

Examples:

design.png

/path/to/design.png

Validation:

Reject if:

- File does not exist
- File is inaccessible
- File is not PNG
- File is corrupt

---

# 4. Optional Parameters

## Threshold

Flags:

--threshold
-t

Description:

Controls alpha normalization threshold.

Allowed range:

1–254

Default:

128

Examples:

--threshold 96

-t 200

Validation:

Reject if outside allowed range.

---

## Output File

Flags:

--output
-o

Description:

Explicitly defines output file path.

Examples:

--output clean.png

-o /exports/clean.png

Behavior:

If output file is specified:

- No backup file is created
- Input file is never modified
- Output file is created at specified location

---

# 5. Default File Workflow

If only input file is provided:

snaptiq design.png

Snaptiq enters creator workflow mode.

---

## Step 1: Detect File Type

Snaptiq determines whether the input file is:

### Standard File

Example:

design.png

Meaning:

A normal design file.

---

### Snaptiq Original File

Example:

design.snaptiq-original.png

Meaning:

A preserved original created by Snaptiq.

---

# 6. Standard File Behavior

Input:

design.png

Snaptiq must:

---

## Step 1

Create backup:

design.snaptiq-original.png

---

## Step 2

Process the backup file.

---

## Step 3

Save processed output as:

design.png

Result:

design.png
design.snaptiq-original.png

---

# 7. Already Processed File Protection

If:

design.snaptiq-original.png

already exists, and user runs:

snaptiq design.png

Snaptiq must fail with error.

Example:

Snaptiq original already exists.

This file appears to have already been processed.

Use the original backup file if you want to try another threshold.

Purpose:

Prevent accidental destruction of original data.

---

# 8. Snaptiq Original Behavior

If input is:

design.snaptiq-original.png

Snaptiq must:

---

## Step 1

Recognize it as Snaptiq original.

No backup file is created.

---

## Step 2

Generate a unique Snaptiq output.

Examples:

First run:

design.snaptiq-2.png

Second run:

design.snaptiq-3.png

Third run:

design.snaptiq-4.png

Purpose:

Allow threshold experimentation without overwriting files.

---

# 9. Output File Conflict Behavior

If an output file already exists:

Snaptiq must generate the next available version.

Examples:

design.snaptiq-2.png exists

Create:

design.snaptiq-3.png

Snaptiq must never overwrite files automatically.

---

# 10. Processing Output

After successful processing, Snaptiq must display:

Input file

Output file

Threshold used

Total pixels processed

Semi-transparent pixels found

Pixels modified

Processing duration

Example:

Input: design.png
Output: design.png
Threshold: 128
Pixels: 4,194,304
Semi-transparent: 12,483
Modified: 12,483
Time: 312 ms

---

# 11. Error Handling

Snaptiq must fail with descriptive errors.

Examples:

Input file not found.

Unsupported file format.

Invalid threshold. Must be between 1 and 254.

Snaptiq original already exists.

Unable to create output file.

Errors must never silently fail.

---

# 12. Out of Scope (V1)

The following are excluded from V1:

- Batch folder processing
- Recursive folder scanning
- Wildcard expansion
- Parallel processing
- Interactive prompts
- Progress bars
- Undo system