import assert from 'node:assert/strict';
import test from 'node:test';

import {calculateGrid, gridItemPosition, overviewItemPositions, previewFrame} from '../../site/sticker-counter/layout.js';

test('fills a 480 mm roll left to right and top to bottom with complete stickers only', () => {
  const grid = calculateGrid({itemWidth: 50, itemHeight: 50, gap: 5, length: 1000});

  assert.equal(grid.columns, 8);
  assert.equal(grid.rows, 18);
  assert.equal(grid.total, 144);
  assert.equal(grid.usedWidth, 435);
  assert.equal(grid.usedLength, 985);
});

test('uses a selected custom vinyl width for the grid count', () => {
  const grid = calculateGrid({vinylWidth: 600, itemWidth: 50, itemHeight: 50, gap: 4, length: 1000});

  assert.equal(grid.columns, 11);
  assert.equal(grid.total, 198);
});

test('does not count a sticker that exceeds the usable roll dimension', () => {
  const grid = calculateGrid({itemWidth: 481, itemHeight: 30, gap: 3, length: 500});

  assert.deepEqual(grid, {columns: 0, rows: 0, total: 0, usedWidth: 0, usedLength: 0});
});

test('applies the gap only between stickers, never at the vinyl edges', () => {
  const grid = calculateGrid({itemWidth: 60, itemHeight: 60, gap: 4, length: 1000});

  assert.equal(grid.columns, 7);
  assert.equal(grid.usedWidth, 444);
  assert.equal(grid.rows, 15);
  assert.equal(grid.usedLength, 956);
});

test('positions each sticker from its physical dimensions without stretching it', () => {
  assert.deepEqual(
    gridItemPosition({column: 2, row: 3, itemWidth: 50, itemHeight: 50, gap: 4}),
    {left: 108, top: 162, width: 50, height: 50},
  );
});

test('creates one preview position for every visible grid sticker', () => {
  const positions = overviewItemPositions({columns: 8, rows: 18, itemWidth: 50, itemHeight: 50, gap: 4, overviewLength: 1000});

  assert.equal(positions.length, 144);
  assert.deepEqual(positions.at(-1), {left: 378, top: 918, width: 50, height: 50});
});

test('scales preview frames against the selected vinyl width', () => {
  const frame = previewFrame({left: 50, top: 50, width: 50, height: 50}, {vinylWidth: 600, overviewLength: 1000});

  assert.deepEqual(frame, {left: 8.333333333333332, top: 5, width: 8.333333333333332, height: 5});
});
