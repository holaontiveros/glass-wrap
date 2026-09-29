export function resolveLocale(browserLanguage) {
  return String(browserLanguage || '').toLowerCase().split('-')[0] === 'es' ? 'es' : 'en';
}
