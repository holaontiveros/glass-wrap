import assert from 'node:assert/strict';
import test from 'node:test';

import {PNG_DPI, millimetersToPixels, pixelsPerMeterForDpi} from '../../site/glass-wrap/export.js';

test('renders millimeter dimensions at 300 DPI for PNG export', () => {
  assert.equal(PNG_DPI, 300);
  assert.equal(millimetersToPixels(25.4), 300);
  assert.equal(millimetersToPixels(50.8), 600);
});

test('converts print resolution into PNG pixels-per-meter metadata', () => {
  assert.equal(pixelsPerMeterForDpi(300), 11811);
});
