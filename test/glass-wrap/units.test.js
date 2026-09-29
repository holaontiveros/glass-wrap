import assert from 'node:assert/strict';
import test from 'node:test';

import {convertUnits, unitToMillimeters} from '../../site/glass-wrap/units.js';

test('normalizes millimeter and centimeter inputs to millimeters', () => {
  assert.equal(unitToMillimeters(80, 'mm'), 80);
  assert.equal(unitToMillimeters(8, 'cm'), 80);
});

test('converts entered values without changing the physical measurement', () => {
  assert.equal(convertUnits(80, 'mm', 'cm'), 8);
  assert.equal(convertUnits(8, 'cm', 'mm'), 80);
});
