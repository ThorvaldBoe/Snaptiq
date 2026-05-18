# Snaptiq

Snaptiq is a focused utility for fixing PNG alpha transparency problems in print-on-demand workflows.

Many print-on-demand pipelines treat semi-transparent PNG pixels inconsistently, which can create unwanted halos, faded edges, or unexpected garment-print artifacts. Snaptiq's first goal is to make those alpha values explicit and predictable before artwork is uploaded for production.

## Project status

This repository is in its initial solution-structure phase. The .NET projects target .NET 10 and intentionally avoid business logic, UI, dependency injection, plugin systems, and broad abstractions until the core PNG alpha workflow is proven.

## Repository layout

```text
Snaptiq.sln       .NET solution file.
package.json      Web build and test scripts.
src/
  Snaptiq.Core/   Class library for PNG alpha normalization.
  Snaptiq.Cli/    Console application entry point.
  Snaptiq.Tests/  xUnit test project for core behavior.
web/
  src/            TypeScript Snaptiq engine, embeddable widget, and demo page.
  test/           Vitest coverage for the TypeScript engine.
```

## Current focus

The current focus is the solution structure only:

1. Keep the Snaptiq solution buildable.
2. Keep project references in place for future implementation.
3. Defer PNG alpha business logic until the behavior is defined.

## Build

Install the .NET 10 SDK, then run:

```bash
dotnet build Snaptiq.sln
```

Install Node.js dependencies, then run the web checks:

```bash
npm install
npm run web:test
npm run web:build
```

## Snaptiq Web

The local web app remains a Vite client app:

```bash
npm run web:dev
npm run web:build
```

The embeddable widget build exposes `window.SnaptiqWeb` and writes stable assets to `web/dist-embed/`:

```bash
npm run build:embed
```

Copy `web/dist-embed/snaptiq-web.js` and `web/dist-embed/snaptiq-web.css` into the host site, such as
`ArtsyVistaWeb/public/vendor/snaptiq-web/`, then load both files on the host page.

```html
<link rel="stylesheet" href="/vendor/snaptiq-web/snaptiq-web.css" />
<div id="snaptiq-tool"></div>
<script src="/vendor/snaptiq-web/snaptiq-web.js"></script>
<script>
  window.SnaptiqWeb.mount('#snaptiq-tool', {
    initialThreshold: 128,
    sampleImageUrl: '/vendor/snaptiq-web/sampleimage.png'
  });
</script>
```

`mount(target, options?)` accepts a CSS selector string or an `HTMLElement`. Use
`window.SnaptiqWeb.unmount(target)` to destroy a mounted widget.

Widget options:

- `initialThreshold?: number` sets the starting cleanup threshold.
- `sampleImageUrl?: string` overrides the bundled sample PNG path for embedded deployments. If omitted,
  Snaptiq keeps using `/samples/sampleimage.png`, which preserves the local standalone behavior.
