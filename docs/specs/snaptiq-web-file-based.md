# Snaptiq Web Specification
Version: 0.1
Module: Snaptiq.Web
Status: Draft

---

# 1. Purpose

Snaptiq Web provides a browser-based image processing tool for detecting and correcting unintended semi-transparent pixels in PNG images.

The primary goals are:

- Allow users to test Snaptiq without installation
- Provide a visual threshold tuning workflow
- Act as a lead magnet for ArtsyVista
- Serve as a reusable embeddable widget

Snaptiq.Web contains its own TypeScript implementation of the Snaptiq algorithm.

The behavior must match Snaptiq.Core exactly.

---

# 2. Architecture

Snaptiq.Web consists of:

## Snaptiq Engine

Pure TypeScript image processing engine.

Responsibilities:

- RGBA processing
- Threshold-based alpha normalization
- Statistics generation

Must not contain:

- UI logic
- DOM manipulation

---

## Snaptiq Widget

Embeddable UI component.

Responsibilities:

- User interaction
- Image display
- Threshold controls
- Zoom and pan controls
- Download workflow

The widget must be mountable into any existing HTML element.

Example:

<div id="snaptiq-widget"></div>

---

## Snaptiq Demo Page

Standalone implementation using the widget.

Used for:

- ArtsyVista tools page
- SEO
- Marketing
- Testing

---

# 3. Input Methods

Supported in V1:

---

## File Upload

Users can upload PNG files using a file picker.

---

## Drag and Drop

Users can drag PNG files directly into the widget.

---

Supported formats:

- PNG only

Rejected formats:

- JPG
- SVG
- GIF
- WebP
- Other formats

---

# 4. Workspace Layout

The widget must display two synchronized preview panes.

---

## Original Pane

Displays the original uploaded image.

---

## Snaptiq Pane

Displays the live processed result.

---

Both panes must remain synchronized during:

- Zoom
- Pan
- Resize

Purpose:

Allow accurate visual comparison of edge detail.

---

# 5. Threshold Control

The widget must provide a threshold slider.

---

## Threshold Range

Minimum:

1

Maximum:

254

Default:

128

---

## Behavior

When slider changes:

- Reprocess image live
- Update processed preview
- Update statistics

Updates should feel immediate.

Small debounce is allowed if needed for performance.

---

# 6. Zoom Controls

The widget must provide:

---

## Zoom In

Increase zoom level.

---

## Zoom Out

Decrease zoom level.

---

## Reset Zoom

Reset to 100%.

---

Zoom affects both panes simultaneously.

---

# 7. Pan Controls

When zoom level exceeds 100%:

Users must be able to pan.

Supported interactions:

- Mouse drag
- Touch drag (if supported)

Pan affects both panes simultaneously.

Both views must remain aligned.

---

# 8. Processing Statistics

The widget must display:

- Threshold used
- Total pixels
- Semi-transparent pixels found
- Pixels modified

Statistics must update live.

---

# 9. Output

The widget must allow users to download the processed image.

---

## Download Format

PNG

---

## File Naming

Default output:

original-filename.snaptiq.png

Example:

design.png

becomes:

design.snaptiq.png

---

# 10. Performance

Preview processing must feel responsive.

Target:

Visible updates within 200ms for standard images.

Priority:

1. Correctness
2. Responsiveness
3. Visual consistency

Optimization strategies are allowed if needed.

---

# 11. Error Handling

The widget must display descriptive errors.

Examples:

Unsupported file format.

File could not be read.

Image is corrupted.

Threshold is invalid.

Errors must never silently fail.

---

# 12. Out of Scope (V1)

The following are excluded:

- Clipboard paste
- Copy output to clipboard
- Batch processing
- Multiple images
- Session history
- Undo system
- Mobile-first layout optimization