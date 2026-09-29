import assert from 'node:assert/strict';
import test from 'node:test';

import {originalPngSizeMm, pngPixelsPerMeter} from '../../site/sticker-counter/png.js';

test('uses embedded PNG pixels-per-meter to restore physical size', () => {
  const size = originalPngSizeMm({width: 1200, height: 600, pixelsPerMeter: 11811});

  assert.ok(Math.abs(size.width - 101.6) < 0.01);
  assert.ok(Math.abs(size.height - 50.8) < 0.01);
});

test('falls back to 300 DPI when a PNG has no resolution metadata', () => {
  const size = originalPngSizeMm({width: 1200, height: 600});

  assert.ok(Math.abs(size.width - 101.6) < 0.01);
  assert.ok(Math.abs(size.height - 50.8) < 0.01);
});

test('reads PNG pixels-per-meter metadata when present', () => {
  const bytes = new ArrayBuffer(29);
  const view = new DataView(bytes);
  view.setUint32(8, 9);
  new Uint8Array(bytes, 12, 4).set([...new TextEncoder().encode('pHYs')]);
  view.setUint32(16, 11811);

  assert.equal(pngPixelsPerMeter(bytes), 11811);
});
