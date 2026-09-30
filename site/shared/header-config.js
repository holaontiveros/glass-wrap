export function headerOptions(element) {
  return {
    rootPath: element.dataset.rootPath ?? './',
    logoPath: element.dataset.logoPath ?? './assets/nenufar_logo_horizontal.svg',
  };
}
