# Arrow.js Migration Plan

## Objective

Move the apps hub, shared UI, and each utility to Arrow.js one utility at a
time. Each migrated page must provide the same user-visible behavior,
calculations, accessibility, URLs, language handling, and downloads as the
current implementation before any legacy UI code is removed.

This is a UI-layer migration. The existing browser-independent domain modules
remain the source of truth for geometry, sticker-grid calculations, PNG
resolution handling, exports, locale resolution, and unit conversion.

## Technical boundary

- Use Arrow's core reactive templates for page state and rendering.
- Keep the static `site/` deployment model and the current GitHub Pages paths.
- Keep pages browser-only: no accounts, APIs, database, SSR, or routing rewrite.
- Keep `site/shared/` framework-independent where possible. Shared Arrow
  components may consume those modules, but domain modules must not import
  Arrow.
- Do not introduce a component library or global state framework.
- Preserve the shared header, mm/cm standard, English/Spanish behavior, and
  session-scoped language preference.

## Phase 0 — establish the parity test baseline

Before replacing any live UI, add browser-level characterization tests alongside
the existing Node domain tests. Run the same suite against the current UI first
and keep it green throughout the migration.

### Shared/hub coverage

- Header contains the logo, Apps and Shop links, and language selector.
- Language selection persists while navigating between the hub and utilities.
- Hub card names, descriptions, About copy, metadata, and navigation are
  correct in English and Spanish.

### Glass Wrap coverage

- Browser locale resolution and manual language changes.
- mm/cm switch converts entered values without changing physical geometry.
- Straight and conical measurements enable both exports only when valid.
- Glue-tab and fill toggles affect the same preview/export geometry.
- SVG remains real-size and rotated correctly; PNG remains 300 DPI.

### Sticker Counter coverage

- Default 480 mm width, 4 mm gap, 1 m length, and 5 cm-equivalent sticker
  produce the expected count.
- Manual vinyl widths, including 300 mm, update count and preserve preview
  aspect ratio.
- Circles are rendered as circles and the number of preview sticker elements
  matches the visible grid count.
- Square and PNG modes preserve their expected dimensions; PNG original-size
  restore respects embedded resolution or the 300 DPI fallback.
- Gap appears only between stickers; incomplete items are excluded.
- Overview caps at 2 m and inspection mode remains available.
- The mm/cm selector converts all manual values, preset labels, summaries, and
  PNG physical-size labels without changing results.

## Phase 1 — shared Arrow foundation

1. Add the pinned Arrow core runtime using the static-page import map for
   `@arrow-js/core@1.0.6`.
2. Add a small Arrow mount helper and a shared reactive page-language adapter.
3. Port the shared header without changing its markup contract, paths, visual
   styling, or session storage key.
4. Pass all shared/hub tests before touching a utility.

## Phase 2 — Glass Wrap port

1. Preserve `geometry.js`, `export.js`, `i18n.js`, and the shared unit module.
2. Replace imperative form, preview, validation, and download UI updates with
   one Arrow view backed by reactive page state.
3. Retain native controls and current IDs until the browser parity suite passes.
4. Verify SVG/PNG download behavior manually in addition to the automated
   suite.
5. Remove the old Glass Wrap UI orchestration only after parity is confirmed.

## Phase 3 — Sticker Counter port

1. Preserve `layout.js`, `png.js`, `i18n.js`, and shared unit conversion.
2. Replace imperative preview construction with keyed Arrow templates for
   overview and inspection modes.
3. Keep physical-coordinate rendering so circle and custom-width aspect ratios
   cannot regress.
4. Verify PNG object-URL cleanup and upload replacement behavior.
5. Remove the old Sticker Counter UI orchestration only after parity is
   confirmed.

## Phase 4 — hub cleanup and regression pass

1. Port the app directory and About section to Arrow after both utilities are
   stable.
2. Remove replaced DOM-mutation code and any temporary migration adapters.
3. Run the full Node and browser parity suites, inspect both locales, and
   deploy as one scoped migration completion.

## Definition of done per tool

- Existing URLs, visual identity, and all accepted behavior remain intact.
- The original Node domain tests and new browser parity tests pass.
- No Arrow dependency enters domain modules.
- No new server, persistence, or feature is added as part of the port.
- The page is manually checked in English and Spanish, including units and any
  downloads or uploaded PNG workflows relevant to that tool.
