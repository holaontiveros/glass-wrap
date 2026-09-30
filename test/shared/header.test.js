import assert from 'node:assert/strict';
import test from 'node:test';

import {getPreferredLocale, languageStorageKey, savePreferredLocale} from '../../site/shared/locale.js';
import {headerOptions} from '../../site/shared/header-config.js';

test('reads the brand-link and logo paths for a utility header', () => {
  const options = headerOptions({dataset: {rootPath: '../', logoPath: '../assets/nenufar_logo_horizontal.svg'}});

  assert.deepEqual(options, {rootPath: '../', logoPath: '../assets/nenufar_logo_horizontal.svg'});
});

test('keeps a selected language for the current browser session', () => {
  const values = new Map();
  const storage = {getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};

  savePreferredLocale('es', storage);

  assert.equal(values.get(languageStorageKey), 'es');
  assert.equal(getPreferredLocale('en-US', storage), 'es');
});
