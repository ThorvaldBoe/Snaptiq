# Feature Specification: Full Screen Image Preview Mode

## Scope
This feature applies to the **Snaptiq web tool only**.

It must not change:

- Snaptiq core library
- Snaptiq CLI
- Image processing behavior
- Exported/downloaded image output

Future desktop support, such as an Avalonia UI, may use the same concept later, but desktop implementation is out of scope for this specification.

---

## Summary
Add a full screen / expanded preview mode to the Snaptiq web tool.

The default view should remain unchanged:

- Original image and processed/target image shown side by side
- Both images shown in normal preview panels
- Existing controls and stats visible

The new mode should allow the user to focus on one image at a time using as much available screen space as possible.

---

## Purpose
The current side-by-side view is useful for comparison, but it is not ideal when judging the whole design.

When creating or validating a design, users need a larger view to inspect:

- Overall composition
- Edges
- Transparency behavior
- Processing artifacts
- Appearance against the selected preview background

---

## Desired User Experience
The user should be able to enter a focused preview mode where:

- Only one image is shown
- The image uses as much available screen space as practical
- Non-essential controls are hidden
- Selected background color is preserved
- Current zoom level is preserved

---

## UI Entry Point
Add a control for opening full screen mode from the image preview area.

Preferred behavior:

- Each preview panel has its own full screen / expand action.
- Clicking full screen on the Original panel opens the Original image in full screen mode.
- Clicking full screen on the Processed/Target panel opens the Processed/Target image in full screen mode.

Recommended UI options:

- A `Full screen` button on each preview panel, or
- A full screen icon button on each preview panel.

Choose the option that best fits the existing web UI.

---

## Full Screen Mode Behavior
When activated:

- Show only the selected image.
- Use the maximum available space for the image.
- Hide the Select PNG button.
- Hide stats below the image.
- Hide the side-by-side layout.
- Keep the selected preview background color/checkerboard.
- Keep the current zoom level.
- Do not reset image state.
- Do not reload or reprocess the image just because full screen mode is entered.

If true browser Fullscreen API integration is practical and reliable, it may be used.

If true browser fullscreen is difficult, unreliable, or creates unnecessary complexity, implement an expanded in-page mode instead:

- Occupy the maximum available viewport area.
- Hide non-essential UI.
- Make the image container the dominant screen element.

The implementation may choose either approach, but the user-facing goal is the same: a focused large preview.

---

## Exit Behavior
The user must be able to leave full screen mode easily.

Required exit method:

- Visible close/back/exit full screen button.

Recommended exit method:

- `Esc` key support where technically supported.

When exiting:

- Restore the default two-panel layout.
- Restore all normal controls.
- Restore stats below the image.
- Preserve selected background color/checkerboard.
- Preserve zoom level.
- Preserve currently loaded images.
- Do not trigger image reprocessing solely because full screen mode was exited.

---

## Image Selection in Full Screen Mode
Initial implementation may show only the image whose full screen button was clicked.

Optional enhancement:

- Add a simple toggle in full screen mode to switch between Original and Processed/Target.

If implemented, switching images should:

- Keep the same background color.
- Keep zoom behavior consistent.
- Avoid reprocessing the image.

---

## Background Color Compatibility
This feature must work with the preview background color feature.

Full screen mode must respect the current selected background:

- Transparent/checkerboard
- Any preset background color
- Any valid custom hex background color

Entering or exiting full screen mode must not change the selected background.

---

## Zoom Compatibility
Full screen mode must preserve the current zoom setting.

Entering full screen mode:

- Keep current zoom if zoom is already active in the regular preview.

Changing zoom in full screen mode, if supported by existing controls:

- Should persist when exiting full screen mode.

If zoom controls are hidden in full screen mode:

- The current zoom should still be applied.
- Exiting full screen should keep the same zoom state as before entering.

---

## Layout Requirements
In full screen / expanded mode:

- The selected image should be centered.
- The image should scale within the available viewport without distortion.
- Aspect ratio must be preserved.
- The background behind transparent pixels should match the selected preview background.
- The container should avoid unnecessary margins and padding.
- The image should use as much of the available viewport as practical while remaining usable.

---

## State Management
Full screen mode should be UI state only.

Recommended state fields:

```ts
isFullScreenPreview: boolean;
fullScreenPreviewImageType: "original" | "processed";
```

This state must not affect:

- Processing pipeline
- Loaded image data
- Export behavior
- CLI behavior
- Core library behavior

---

## Acceptance Criteria

### Default View

- App still starts in normal side-by-side preview mode.
- Original and processed/target panels are visible as before.
- Existing controls and stats remain visible as before.

### Enter Full Screen

- User can open full screen / expanded preview for the Original image.
- User can open full screen / expanded preview for the Processed/Target image.
- Only the selected image is shown in focused mode.
- Select PNG button is hidden.
- Stats below the image are hidden.
- Side-by-side preview is hidden.
- Image uses as much screen/viewport space as practical.

### Exit Full Screen

- User can exit using a visible button.
- User can exit using `Esc` where technically supported.
- App returns to the normal side-by-side layout.
- Loaded images are preserved.
- No reprocessing is triggered solely by entering or exiting full screen mode.

### Background Preservation

- Selected background color/checkerboard is preserved when entering full screen.
- Selected background color/checkerboard is preserved when exiting full screen.
- Full screen image background matches the regular preview background.

### Zoom Preservation

- Current zoom is preserved when entering full screen mode.
- Current zoom is preserved when exiting full screen mode.
- Full screen mode must not reset zoom unless the user explicitly changes it.

---

## Non-Goals
This feature does not:

- Modify image output
- Modify alpha channel
- Modify the Snaptiq processing algorithm
- Add CLI support
- Add Avalonia/Desktop support
- Require implementation of a comparison slider
- Require side-by-side full screen comparison

---

## Implementation Notes
Prefer a robust implementation over a fragile browser fullscreen implementation.

If the browser Fullscreen API adds complexity, an in-page expanded mode is acceptable as long as it uses the maximum available space and hides non-essential UI.

This should be implemented as a web UI feature/component so it can later inspire similar behavior in Avalonia without moving UI concerns into the core library.
