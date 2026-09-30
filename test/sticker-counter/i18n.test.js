import assert from 'node:assert/strict';
import test from 'node:test';

import {translate} from '../../site/sticker-counter/i18n.js';

test('formats Sticker Counter dimensions in the selected unit', () => {
  assert.equal(translate('en', 'nenufarWidth', {value: 48, unit: 'cm'}), '48 cm (Nenúfar standard)');
  assert.equal(translate('es', 'usedSpace', {width: 42.8, length: 96.8, unit: 'cm'}), 'Área usada: 42.8 × 96.8 cm');
});
