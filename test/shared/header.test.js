import assert from 'node:assert/strict';
import test from 'node:test';

import {getPreferredLocale, languageStorageKey, savePreferredLocale} from '../../site/shared/locale.js';
import {headerMarkup} from '../../site/shared/header.js';

test('renders a brand link to the apps hub with the supplied color logo', () => {
  const markup = headerMarkup({
    rootPath: '../',
    logoPath: '../assets/nenufar_logo_horizontal.svg',
  });

  assert.match(markup, /href="\.\.\/"/);
  assert.match(markup, /src="\.\.\/assets\/nenufar_logo_horizontal\.svg"/);
  assert.match(markup, /nenufar-apps-header__nav/);
  assert.match(markup, /data-i18n="apps"/);
  assert.match(markup, /href="https:\/\/nenufar\.mx"/);
  assert.match(markup, /id="language"/);
  assert.match(markup, /nenufar-apps-header__actions/);
});

test('keeps a selected language for the current browser session', () => {
  const values = new Map();
  const storage = {getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};

  savePreferredLocale('es', storage);

  assert.equal(values.get(languageStorageKey), 'es');
  assert.equal(getPreferredLocale('en-US', storage), 'es');
});
