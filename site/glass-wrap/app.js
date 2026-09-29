import {buildTemplate, createSvgMarkup, validateMeasurements} from './geometry.js';
import {createPngBlob} from './export.js';
import {resolveLocale, translate} from './i18n.js';
import {convertUnits, unitToMillimeters} from './units.js';

const form = document.querySelector('#measurements-form');
const preview = document.querySelector('#preview');
const downloadButton = document.querySelector('#download');
const downloadPngButton = document.querySelector('#download-png');
const shapeBadge = document.querySelector('#shape-badge');
const shapeNote = document.querySelector('#shape-note');
const inputs = [...form.querySelectorAll('input[type="number"]')];
const glueTab = document.querySelector('#glue-tab');
const filledTemplate = document.querySelector('#filled-template');
const language = document.querySelector('#language');
const unit = document.querySelector('#unit');

let currentTemplate = null;
let locale = resolveLocale(navigator.language);
let selectedUnit = 'mm';
const touchedFields = new Set();

const text = (key) => translate(locale, key);
const textWithUnit = (key) => text(key).replace('{unit}', selectedUnit);

function renderStaticText() {
  document.documentElement.lang = locale;
  document.title = text('pageTitle');
  document.querySelector('#page-description').content = text('pageDescription');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = text(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', text(element.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = text(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-unit-label]').forEach((element) => {
    element.textContent = `${text(element.dataset.unitLabel)} (${selectedUnit})`;
  });
}

function getMeasurements() {
  return Object.fromEntries(inputs.map((input) => [input.name, unitToMillimeters(Number(input.value), selectedUnit)]));
}

function showErrors(errors) {
  for (const input of inputs) {
    const message = touchedFields.has(input.name) && errors[input.name] ? textWithUnit(`${input.name}Error`) : '';
    const errorElement = document.querySelector(`#${input.id}-error`);
    errorElement.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
}

function render() {
  const measurements = getMeasurements();
  const validation = validateMeasurements(measurements);
  showErrors(validation.errors);

  if (!validation.valid) {
    currentTemplate = null;
    preview.innerHTML = `<p>${text('waitingNote')}</p>`;
    downloadButton.disabled = true;
    downloadPngButton.disabled = true;
    shapeBadge.textContent = text('waiting');
    shapeNote.textContent = text('matchingDiameters');
    return;
  }

  currentTemplate = buildTemplate(measurements, {includeGlueTab: glueTab.checked});
  preview.innerHTML = createSvgMarkup(currentTemplate, {filled: filledTemplate.checked});
  downloadButton.disabled = false;
  downloadPngButton.disabled = false;
  const isStraight = currentTemplate.kind === 'straight';
  shapeBadge.textContent = isStraight ? text('straightGlass') : text('conicalGlass');
  shapeNote.textContent = isStraight ? text('straightNote') : text('conicalNote');
}

function downloadSvg() {
  if (!currentTemplate) return;
  const content = createSvgMarkup(currentTemplate, {filled: filledTemplate.checked});
  const blob = new Blob([content], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `glass-wrap-${currentTemplate.kind}${currentTemplate.tabWidth ? '-with-tab' : ''}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadPng() {
  if (!currentTemplate) return;
  downloadPngButton.disabled = true;
  downloadPngButton.textContent = text('preparingPng');
  try {
    const png = await createPngBlob(currentTemplate, {filled: filledTemplate.checked});
    downloadBlob(png, `glass-wrap-${currentTemplate.kind}${currentTemplate.tabWidth ? '-with-tab' : ''}.png`);
  } finally {
    downloadPngButton.textContent = text('downloadPng');
    downloadPngButton.disabled = false;
  }
}

form.addEventListener('input', (event) => {
  if (event.target.matches('input[type="number"]')) touchedFields.add(event.target.name);
  render();
});
glueTab.addEventListener('change', render);
filledTemplate.addEventListener('change', render);
language.addEventListener('change', () => {
  locale = resolveLocale(language.value);
  renderStaticText();
  render();
});
unit.addEventListener('change', () => {
  const nextUnit = unit.value;
  inputs.forEach((input) => {
    if (input.value !== '') input.value = String(convertUnits(Number(input.value), selectedUnit, nextUnit));
  });
  selectedUnit = nextUnit;
  renderStaticText();
  render();
});
downloadButton.addEventListener('click', downloadSvg);
downloadPngButton.addEventListener('click', downloadPng);
language.value = locale;
unit.value = selectedUnit;
renderStaticText();
render();
