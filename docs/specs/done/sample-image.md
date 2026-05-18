# Feature Specification: Add Sample Image

## Summary
Add a UI action that allows users to load a bundled sample image into Snaptiq without manually selecting a file.

This provides a quick way for users to test the application workflow and preview functionality without needing their own PNG asset.

---

## Functional Requirements

### 1. Add UI Button

Add a new button to the main UI.

| Property | Value |
|----------|-------|
| Text | `Add Sample` |
| Placement | Adjacent to the existing `Select PNG` button (preferably to its left) |
| Enabled | Always enabled |

#### Behavior

When clicked, the button should load the bundled sample image into the application.

---

## 2. Sample Image Source

A sample image exists in the repository:

```text
/samples/sampleimage.png
```

### Runtime Accessibility

Ensure the sample image is accessible at runtime.

The implementation may use either approach:

#### Option A (Preferred)

Copy the image into the application output during build.

Examples:

```text
bin/Debug/.../samples/sampleimage.png
```

or:

```text
Resources/sampleimage.png
```

#### Option B

Move the sample image into a dedicated application resource folder if that better fits the architecture.

This is allowed as long as:

- The image remains source-controlled
- Build/runtime loading works reliably across debug/release builds

---

## 3. Loading Behavior

When the user clicks `Add Sample`:

1. Locate the bundled sample image
2. Load it using the same image loading pipeline as a normal user-selected PNG
3. Populate all relevant UI/application state exactly as if the user had selected the file manually

This means:

- Preview updates normally
- Threshold/gamma sliders remain functional
- Any alpha analysis runs normally
- Export functionality works normally
- Any internal image state is initialized identically to standard file loading

---

## Non-Functional Requirements

### Code Reuse

Avoid duplicating image loading logic.

The sample button should reuse the existing image import flow.

Recommended pattern:

```csharp
LoadImage(string imagePath)
```

Both:

- `Select PNG`
- `Add Sample`

should call the same underlying method.

---

## Error Handling

If the sample image cannot be found or loaded:

Display the standard image loading error behavior already used by the application.

Do not create special-case error handling unless required.

---

## Acceptance Criteria

The feature is complete when:

- A new `Add Sample` button is visible in the main UI
- Clicking it loads the sample image successfully
- The loaded sample behaves identically to a manually selected PNG
- The feature works in both Debug and Release builds
- No duplicate image loading logic has been introduced

---

## Suggested Implementation Notes

Recommended project configuration:

```xml
<None Update="samples\sampleimage.png">
  <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
</None>
```

This keeps the asset available at runtime while preserving a clean repository structure.
```