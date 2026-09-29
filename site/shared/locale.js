export const languageStorageKey = 'nenufar-apps-language';

export function resolveLocale(browserLanguage) {
  return String(browserLanguage || '').toLowerCase().split('-')[0] === 'es' ? 'es' : 'en';
}

export function getPreferredLocale(browserLanguage, storage) {
  const storedLocale = storage?.getItem(languageStorageKey);
  return storedLocale === 'en' || storedLocale === 'es' ? storedLocale : resolveLocale(browserLanguage);
}

export function savePreferredLocale(locale, storage) {
  storage?.setItem(languageStorageKey, resolveLocale(locale));
}

export function getSessionStorage(windowObject) {
  try {
    return windowObject.sessionStorage;
  } catch {
    return null;
  }
}
