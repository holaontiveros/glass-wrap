import assert from 'node:assert/strict';
import test from 'node:test';

import {calculateGrid} from '../../site/sticker-counter/layout.js';

test('fills a 480 mm roll left to right and top to bottom with complete stickers only', () => {
  const grid = calculateGrid({itemWidth: 50, itemHeight: 50, gap: 5, length: 1000});

  assert.equal(grid.columns, 8);
  assert.equal(grid.rows, 18);
  assert.equal(grid.total, 144);
  assert.equal(grid.usedWidth, 435);
  assert.equal(grid.usedLength, 985);
});

test('does not count a sticker that exceeds the usable roll dimension', () => {
  const grid = calculateGrid({itemWidth: 481, itemHeight: 30, gap: 3, length: 500});

  assert.deepEqual(grid, {columns: 0, rows: 0, total: 0, usedWidth: 0, usedLength: 0});
});
