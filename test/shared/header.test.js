import assert from 'node:assert/strict';
import test from 'node:test';

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
