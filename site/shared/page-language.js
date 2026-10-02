import {reactive} from './arrow-runtime.js';
import {getPreferredLocale, savePreferredLocale} from './locale.js';

export function createPageLanguage(browserLanguage, storage) {
  return reactive({locale: getPreferredLocale(browserLanguage, storage)});
}

export function setPageLanguage(language, locale, storage) {
  language.locale = locale;
  savePreferredLocale(locale, storage);
  document.dispatchEvent(new CustomEvent('nenufar:languagechange', {detail: {locale}}));
}
