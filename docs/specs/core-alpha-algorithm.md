# Snaptiq Core Algorithm Specification
Version: 0.1
Module: Snaptiq.Core
Status: Draft

---

# 1. Purpose

Snaptiq Core is responsible for detecting and correcting unintended semi-transparent pixels in PNG images.

The primary use case is PNG files exported from :contentReference[oaicite:0]{index=0} after pixel-based operations, where alpha values may contain unintended intermediate transparency.

The goal is to make images safe for print-on-demand workflows requiring binary transparency.

Snaptiq Core is platform-independent and must be reusable by:

- Command-line tools
- Web applications
- Desktop applications
- Future integrations such as :contentReference[oaicite:1]{index=1}

---

# 2. Problem Statement

Some exported PNG files contain pixels with alpha values between:

1 and 254

These semi-transparent pixels may cause:

- Print artifacts
- Unwanted anti-aliased edges
- Reduced edge sharpness
- Inconsistent masking behavior
- Poor compatibility with print-on-demand platforms

Snaptiq must detect and correct these pixels while preserving the intended design as much as possible.

---

# 3. Supported Inputs

Input format:

RGBA image data

Supported file formats in V1:

- PNG

Required image properties:

- 8-bit RGBA channels
- Any width and height
- Transparent or opaque backgrounds

Unsupported in V1:

- Animated PNG
- Indexed PNG
- CMYK images
- Multi-frame images

---

# 4. Output Requirements

Output must:

- Preserve original width
- Preserve original height
- Preserve all RGB values exactly
- Modify alpha values only
- Preserve fully transparent pixels
- Preserve fully opaque pixels

Output format:

RGBA image data

---

# 5. Alpha Normalization

Snaptiq converts semi-transparent pixels into binary alpha values using a configurable threshold.

Threshold is user-configurable from day one.

This supports:

- CLI parameters
- Web UI sliders
- Future desktop controls

---

## Threshold Settings

Allowed threshold range:

1–254

Default threshold:

128

---

## Conversion Rules

For every pixel:

### Fully Transparent Pixels

If:

Alpha = 0

Then:

Preserve alpha.

---

### Fully Opaque Pixels

If:

Alpha = 255

Then:

Preserve alpha.

---

### Semi-Transparent Pixels

If:

Alpha is between 1 and 254

Then:

Apply threshold logic:

If alpha < threshold:

Alpha becomes 0

If alpha >= threshold:

Alpha becomes 255

---

## Example (Threshold = 128)

1 → 0  
40 → 0  
127 → 0  
128 → 255  
200 → 255  
254 → 255  

---

# 6. Processing Statistics

Each processing operation must return:

## TotalPixels

Total number of pixels processed.

---

## SemiTransparentPixelsFound

Number of pixels where:

Alpha is between 1 and 254

---

## PixelsModified

Number of pixels where alpha was changed.

---

## ThresholdUsed

Threshold used during processing.

This allows:

- CLI reporting
- UI feedback
- Regression validation

---

# 7. Validation Rules

The module must validate:

## Threshold

Reject if:

Threshold < 1  
Threshold > 254

---

## Image Data

Reject if:

- Image is null
- Image is corrupted
- Pixel format is unsupported

---

# 8. Error Handling

Errors must be:

- Deterministic
- Descriptive
- Recoverable by caller

Examples:

InvalidThresholdException  
UnsupportedImageFormatException  
CorruptImageDataException  

The core must never fail silently.

---

# 9. Determinism

Given:

Same image + same threshold

Snaptiq must always produce identical output.

The algorithm must not contain:

- Random behavior
- Environment-specific logic
- Non-deterministic processing

---

# 10. Performance Goals

V1 target:

A 2048x2048 PNG should process in under 2 seconds on standard consumer hardware.

Priority order:

1. Correctness
2. Determinism
3. Simplicity
4. Performance

Optimization is out of scope unless benchmarks prove it is needed.

---

# 11. Regression Testing

Every real-world bug discovered in exported files must become a regression test.

Test assets must be stored in:

/samples/input

Expected outputs must be stored in:

/samples/expected

No bug should be fixed without a corresponding regression test.

---

# 12. Out of Scope (V1)

The following are explicitly excluded from V1:

- Edge-only processing
- Color bleed correction
- Anti-fringe reconstruction
- Soft edge preservation
- Multi-threaded optimization
- Batch processing logic
- File system operations
- UI logic

These belong to future modules.