# Snaptiq Core Engineering Rules
Version: 0.1

---

# 1. Architectural Boundaries

Snaptiq.Core is a pure processing library.

It must NOT contain:

- Console output
- File dialogs
- UI code
- Browser code
- Logging frameworks
- Dependency injection frameworks

It may contain:

- Pixel processing
- Validation
- Configuration objects
- Processing results

---

# 2. Input/Output Separation

Core must NOT read or write files.

Core accepts:

- Image data
or
- Streams
or
- In-memory objects

Core returns:

- Processed image data
- Processing statistics

File system access belongs to:

Snaptiq.Cli
Snaptiq.Web
Future desktop applications

---

# 3. Determinism

Given:

same image + same threshold

Snaptiq must always produce identical output.

No randomness.

No environment-specific behavior.

---

# 4. Mutation Policy

RGB values must never be changed.

Only alpha values may be modified.

Width and height must remain unchanged.

---

# 5. Error Handling

Never silently fail.

Invalid input must throw descriptive exceptions.

Examples:

- Unsupported image format
- Invalid threshold
- Corrupt image data

---

# 6. Performance

Avoid premature optimization.

Favor:

clarity > correctness > performance

Optimize only when benchmarks prove it is needed.

---

# 7. Testing

Every bug found in real-world files must become a regression test.

Never fix a bug without adding a test.

---

# 8. Naming

Prefer descriptive names.

Good:

AlphaNormalizer
ThresholdSettings
ProcessingResult

Avoid:

Helper
Manager
ProcessorBase
Utils

---

# 9. Public API Stability

Public APIs should remain stable once CLI and web implementations depend on them.

Breaking changes require specification updates.