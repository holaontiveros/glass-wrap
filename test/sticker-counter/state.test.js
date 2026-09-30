import assert from 'node:assert/strict';
import test from 'node:test';
import {convertManualMeasurements, selectedMillimeters} from '../../site/sticker-counter/state.js';

test('normalizes manual Sticker Counter values and preserves them through unit changes', () => {
  const state = {unit: 'mm', widthValue: '300', sizeValue: '50', gapValue: '4', lengthValue: '1000'};
  assert.equal(selectedMillimeters('manual', state.widthValue, state.unit), 300);
  convertManualMeasurements(state, 'cm');
  assert.deepEqual(state, {unit: 'cm', widthValue: '30', sizeValue: '5', gapValue: '0.4', lengthValue: '100'});
  assert.equal(selectedMillimeters('manual', state.widthValue, state.unit), 300);
});
