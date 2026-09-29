export function headerMarkup({rootPath, logoPath}) {
  return `
    <header class="nenufar-apps-header">
      <div class="nenufar-apps-header__inner">
        <a class="nenufar-apps-header__brand" href="${rootPath}" aria-label="Nenúfar Apps home">
          <img src="${logoPath}" alt="Nenúfar Regalos Personalizados" />
        </a>
        <nav class="nenufar-apps-header__nav" data-i18n-aria="primaryNavigation" aria-label="Primary navigation">
          <a href="${rootPath}" data-i18n="apps">Apps</a>
          <a href="https://nenufar.mx" data-i18n="shop">Shop</a>
        </nav>
        <div class="nenufar-apps-header__actions">
          <label class="language-control" for="language"><span data-i18n="language">Language</span><select id="language"><option value="en">English</option><option value="es">Español</option></select></label>
        </div>
      </div>
    </header>
  `;
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-nenufar-header]').forEach((element) => {
    element.innerHTML = headerMarkup({
      rootPath: element.dataset.rootPath ?? './',
      logoPath: element.dataset.logoPath ?? './assets/nenufar_logo_horizontal.svg',
    });

  });
}
