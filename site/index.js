import {getPreferredLocale, getSessionStorage, resolveLocale, savePreferredLocale} from './shared/locale.js';

const translations = {
  en: {
    pageTitle: 'Nenúfar Apps',
    pageDescription: 'Small practical utilities by Nenúfar Regalos Personalizados.',
    language: 'Language',
    apps: 'Apps',
    shop: 'Shop',
    primaryNavigation: 'Primary navigation',
    eyebrow: 'NENÚFAR REGALOS PERSONALIZADOS',
    heading: 'Apps',
    intro: 'Small, practical tools for making and personalizing better products.',
    availableApps: 'Available apps',
    glassWrapName: 'Glass Wrap',
    glassWrapDescription: 'Create print-accurate SVG templates for straight and conical glasses.',
    stickerCounterName: 'Sticker Counter',
    stickerCounterDescription: 'Visualize and count identical stickers on 480 mm vinyl rolls.',
    aboutEyebrow: 'ABOUT US',
    aboutHeading: 'Made with care',
    aboutText: 'We are a small workshop that crafts every product with care and close attention to detail, so each order feels personal and every customer enjoys a thoughtful experience.',
  },
  es: {
    pageTitle: 'Apps Nenúfar',
    pageDescription: 'Pequeñas utilidades prácticas de Nenúfar Regalos Personalizados.',
    language: 'Idioma',
    apps: 'Apps',
    shop: 'Tienda',
    primaryNavigation: 'Navegación principal',
    eyebrow: 'NENÚFAR REGALOS PERSONALIZADOS',
    heading: 'Apps',
    intro: 'Herramientas prácticas para crear y personalizar mejores productos.',
    availableApps: 'Apps disponibles',
    glassWrapName: 'Plantilla para vasos',
    glassWrapDescription: 'Crea plantillas SVG a escala real para vasos rectos y cónicos.',
    stickerCounterName: 'Contador de stickers',
    stickerCounterDescription: 'Visualiza y cuenta stickers idénticos en rollos de vinil de 480 mm.',
    aboutEyebrow: 'SOBRE NOSOTROS',
    aboutHeading: 'Hecho con cuidado',
    aboutText: 'Somos un pequeño taller que crea cada producto con cuidado y atención al detalle, para que cada pedido se sienta especial y cada cliente disfrute una experiencia cercana.',
  },
};

export function translate(locale, key) {
  return translations[resolveLocale(locale)]?.[key] ?? translations.en[key] ?? key;
}

if (typeof document !== 'undefined') {
  const language = document.querySelector('#language');
  const languageStorage = getSessionStorage(window);
  let locale = getPreferredLocale(navigator.language, languageStorage);

  function render() {
    document.documentElement.lang = locale;
    document.title = translate(locale, 'pageTitle');
    document.querySelector('meta[name="description"]').content = translate(locale, 'pageDescription');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = translate(locale, element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', translate(locale, element.dataset.i18nAria));
    });
  }

  language.value = locale;
  language.addEventListener('change', () => {
    locale = resolveLocale(language.value);
    savePreferredLocale(locale, languageStorage);
    render();
  });
  render();
}
