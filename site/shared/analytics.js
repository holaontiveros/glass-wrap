const measurementId = 'G-V42ETMD9GE';

window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
window.gtag('js', new Date());
window.gtag('config', measurementId);

if (!document.querySelector(`script[data-nenufar-ga="${measurementId}"]`)) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.dataset.nenufarGa = measurementId;
  document.head.append(script);
}
