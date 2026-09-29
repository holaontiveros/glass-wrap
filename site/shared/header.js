export function headerMarkup({rootPath, logoPath}) {
  return `
    <header class="nenufar-apps-header">
      <div class="nenufar-apps-header__inner">
        <a class="nenufar-apps-header__brand" href="${rootPath}" aria-label="Nenúfar Apps home">
          <img src="${logoPath}" alt="Nenúfar Regalos Personalizados" />
        </a>
        <a class="nenufar-apps-header__hub-link" href="${rootPath}">Apps</a>
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
