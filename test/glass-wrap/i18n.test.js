import assert from 'node:assert/strict';
import test from 'node:test';

import {resolveLocale, translate} from '../../site/glass-wrap/i18n.js';

test('uses Spanish for Spanish browser locales', () => {
  assert.equal(resolveLocale('es'), 'es');
  assert.equal(resolveLocale('es-MX'), 'es');
});

test('uses English for all unsupported or unavailable browser locales', () => {
  assert.equal(resolveLocale('en-US'), 'en');
  assert.equal(resolveLocale('fr-CA'), 'en');
  assert.equal(resolveLocale(undefined), 'en');
});

test('returns translated labels for supported locales', () => {
  assert.equal(translate('en', 'downloadSvg'), 'Download SVG');
  assert.equal(translate('es', 'downloadSvg'), 'Descargar SVG');
});
