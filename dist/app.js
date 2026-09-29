import {buildTemplate, createSvgMarkup, validateMeasurements} from './geometry.js';

const form = document.querySelector('#measurements-form');
const preview = document.querySelector('#preview');
const downloadButton = document.querySelector('#download');
const shapeBadge = document.querySelector('#shape-badge');
const shapeNote = document.querySelector('#shape-note');
const inputs = [...form.querySelectorAll('input[type="number"]')];
const glueTab = document.querySelector('#glue-tab');
const filledTemplate = document.querySelector('#filled-template');

let currentTemplate = null;
const touchedFields = new Set();

function getMeasurements() {
  return Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
}

function showErrors(errors) {
  for (const input of inputs) {
    const message = touchedFields.has(input.name) ? errors[input.name] || '' : '';
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
    preview.innerHTML = '<p>Enter all three measurements to see the template.</p>';
    downloadButton.disabled = true;
    shapeBadge.textContent = 'Waiting for dimensions';
    shapeNote.textContent = 'Matching diameters create a straight wrap.';
    return;
  }

  currentTemplate = buildTemplate(measurements, {includeGlueTab: glueTab.checked});
  preview.innerHTML = createSvgMarkup(currentTemplate, {filled: filledTemplate.checked});
  downloadButton.disabled = false;
  const isStraight = currentTemplate.kind === 'straight';
  shapeBadge.textContent = isStraight ? 'Straight glass' : 'Conical glass';
  shapeNote.textContent = isStraight
    ? 'Matching diameters: this template is a rectangle.'
    : 'Different diameters: this template follows the glass taper.';
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

form.addEventListener('input', (event) => {
  if (event.target.matches('input[type="number"]')) touchedFields.add(event.target.name);
  render();
});
glueTab.addEventListener('change', render);
filledTemplate.addEventListener('change', render);
downloadButton.addEventListener('click', downloadSvg);
render();
