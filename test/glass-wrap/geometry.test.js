import assert from 'node:assert/strict';
import test from 'node:test';

import {
  GLUE_TAB_WIDTH_MM,
  buildTemplate,
  createSvgMarkup,
  validateMeasurements,
} from '../../site/glass-wrap/geometry.js';

test('rejects missing, non-finite, zero, and negative measurements', () => {
  for (const measurements of [
    {topDiameter: 0, bottomDiameter: 50, height: 100},
    {topDiameter: 50, bottomDiameter: -1, height: 100},
    {topDiameter: 50, bottomDiameter: 50, height: Number.NaN},
    {topDiameter: undefined, bottomDiameter: 50, height: 100},
  ]) {
    assert.equal(validateMeasurements(measurements).valid, false);
  }
});

test('creates a rectangular straight-glass body with its exact circumference', () => {
  const template = buildTemplate({topDiameter: 80, bottomDiameter: 80, height: 120});

  assert.equal(template.kind, 'straight');
  assert.equal(template.bodyWidth, Math.PI * 80);
  assert.equal(template.bodyHeight, 120);
  assert.equal(template.tabWidth, 0);
});

test('adds the fixed glue tab without changing the straight-glass body size', () => {
  const withoutTab = buildTemplate({topDiameter: 80, bottomDiameter: 80, height: 120});
  const template = buildTemplate(
    {topDiameter: 80, bottomDiameter: 80, height: 120},
    {includeGlueTab: true},
  );

  assert.equal(template.tabWidth, GLUE_TAB_WIDTH_MM);
  assert.equal(template.bodyWidth, Math.PI * 80);
  assert.equal(template.width - withoutTab.width, GLUE_TAB_WIDTH_MM);
});

test('creates a conical template whose arcs equal the glass circumferences', () => {
  const topDiameter = 90;
  const bottomDiameter = 70;
  const template = buildTemplate({topDiameter, bottomDiameter, height: 120});

  assert.equal(template.kind, 'conical');
  assert.ok(Math.abs(template.outerRadius * template.angle - Math.PI * topDiameter) < 1e-8);
  assert.ok(Math.abs(template.innerRadius * template.angle - Math.PI * bottomDiameter) < 1e-8);
  assert.ok(template.svgPath.startsWith('M '));
});

test('uses stable straight geometry for practically equal diameters', () => {
  const template = buildTemplate({topDiameter: 80, bottomDiameter: 80.00000001, height: 120});

  assert.equal(template.kind, 'straight');
});

test('exports a rotated millimeter SVG without changing the template size', () => {
  const template = buildTemplate({topDiameter: 80, bottomDiameter: 80, height: 120});
  const svg = createSvgMarkup(template);
  const originalWidth = Number(template.width.toFixed(5));

  assert.match(svg, new RegExp(`width="${template.height}mm"`));
  assert.match(svg, new RegExp(`height="${originalWidth}mm"`));
  assert.match(svg, new RegExp(`viewBox="0 0 ${template.height} ${originalWidth}"`));
  assert.match(svg, new RegExp(`transform="translate\\(0 ${originalWidth}\\) rotate\\(-90\\)"`));
  assert.match(svg, /<path d="M /);
});

test('uses the requested filled or contour-only SVG appearance', () => {
  const template = buildTemplate({topDiameter: 80, bottomDiameter: 80, height: 120});

  assert.match(createSvgMarkup(template), /fill="none"/);
  assert.match(createSvgMarkup(template, {filled: true}), /fill="#f1749e"/);
  assert.match(createSvgMarkup(template, {filled: true}), /stroke="#672c66"/);
});
