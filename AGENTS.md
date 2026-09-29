# Working Agreement

## Product focus

This repository is a browser-only generator for print-accurate SVG templates
that wrap straight and conical glasses. v1 accepts manual millimeter
measurements, previews the template, and downloads an SVG with an optional
fixed 10 mm glue tab.

Read `PLAN.md` before proposing or implementing work. Treat its confirmed
decisions and non-goals as the current product boundary.

## Engineering principles

- **YAGNI:** implement only behavior required by the accepted plan. Do not add
  persistence, APIs, authentication, configuration layers, unit conversion,
  native packaging, or future-looking abstractions without an approved need.
- **DRY:** calculate geometry once in a framework-independent domain module.
  The preview and downloaded SVG must be generated from that same source of
  truth. Do not duplicate formulas or SVG path construction in UI code.
- **TDD:** for all geometry and export behavior, first add a failing test that
  captures the expected behavior or invariant, then implement the smallest
  change that makes it pass, then refactor while retaining coverage.

## Domain rules

- Inputs are manual and expressed only in millimeters.
- Required values: top diameter, bottom diameter, glass height. Each must be
  finite and greater than zero.
- Equal top and bottom diameters represent a straight glass and yield a
  rectangle with width `π × diameter`.
- Different diameters represent a conical frustum and yield its annular-sector
  development.
- Treat almost-equal diameters safely to avoid unstable division; use the
  straight geometry when the difference is within the documented tolerance.
- The body outline is the physical wrap. An enabled glue tab is a 10 mm joining
  allowance and must not change body dimensions.
- Glue tabs are disabled by default.
- Output must have physical SVG width and height in mm and a matching `viewBox`
  so it can print at 100% scale.
- v1 output contains only cut/outline guides, with an optional fill: no labels,
  alignment marks, or decorative artwork. The preview and downloaded SVG must
  use the same selected appearance.

## Code organization

- Keep validation and geometric calculations independent of browser and UI
  APIs.
- Have the SVG renderer consume typed domain geometry. It alone should create
  SVG markup and export dimensions.
- Keep UI components focused on inputs, accessible validation, preview display,
  and download interaction.
- Prefer clear names and small pure functions over speculative patterns.
- Use TypeScript strictness; avoid `any` and implicit fallback values in
  measurements or geometry.

## Tests and validation

Maintain focused tests for at least:

- valid straight and conical calculations;
- invalid/missing/non-finite/non-positive measurements;
- near-equal diameter stability;
- top and bottom circumference/arc-length invariants;
- enabled and disabled 10 mm tab behavior;
- exported SVG physical dimensions and `viewBox`.

Before handing off a change, run the relevant unit tests and production build.
For any change affecting SVG paths or sizing, manually inspect straight and
conical previews with and without the tab. Report commands or checks that could
not run, along with the reason.

## Change discipline

- Preserve unrelated user changes.
- Keep commits scoped to one coherent, tested outcome.
- Update `PLAN.md` only when an approved product decision changes.
- Explain trade-offs whenever a request expands v1 scope or conflicts with a
  documented rule.
