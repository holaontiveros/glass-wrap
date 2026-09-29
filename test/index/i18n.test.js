import assert from 'node:assert/strict';
import test from 'node:test';

import {translate} from '../../site/index.js';

test('provides the hub about copy in English and Spanish', () => {
  assert.match(translate('en', 'aboutText'), /small workshop/i);
  assert.match(translate('es', 'aboutText'), /pequeño taller/i);
});

test('uses the Glass Wrap utility name in each supported language', () => {
  assert.equal(translate('en', 'glassWrapName'), 'Glass Wrap');
  assert.equal(translate('es', 'glassWrapName'), 'Plantilla para vasos');
});
