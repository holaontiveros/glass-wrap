import {calculateGrid, overviewItemPositions, previewFrame, previewSheetRatio, OVERVIEW_MAX_LENGTH_MM} from './layout.js';
import {originalPngSizeMm, pngPixelsPerMeter} from './png.js';
import {resolveLocale, translate} from './i18n.js';
import {getPreferredLocale, getSessionStorage, savePreferredLocale} from '../shared/locale.js';
import {convertUnits, unitToMillimeters} from '../shared/units.js';

const controls = {
  unit: document.querySelector('#unit'),
  vinylWidth: document.querySelector('#vinyl-width'), manualWidth: document.querySelector('#manual-width'), widthValue: document.querySelector('#width-value'),
  shape: document.querySelector('#shape'), pngUpload: document.querySelector('#png-upload'), pngFile: document.querySelector('#png-file'),
  stickerSize: document.querySelector('#sticker-size'), manualSize: document.querySelector('#manual-size'), sizeValue: document.querySelector('#size-value'),
  restoreOriginal: document.querySelector('#restore-original'), originalSize: document.querySelector('#original-size'),
  gap: document.querySelector('#gap'), manualGap: document.querySelector('#manual-gap'), gapValue: document.querySelector('#gap-value'),
  length: document.querySelector('#length'), manualLength: document.querySelector('#manual-length'), lengthValue: document.querySelector('#length-value'),
  error: document.querySelector('#form-error'),
};
const preview = document.querySelector('#preview');
const overviewButton = document.querySelector('#overview-button');
const inspectionButton = document.querySelector('#inspection-button');
const language = document.querySelector('#language');
const languageStorage = getSessionStorage(window);

let locale = getPreferredLocale(navigator.language, languageStorage);
let selectedUnit = 'mm';
let viewMode = 'overview';
let png = null;

const text = (key, values) => translate(locale, key, values);
const number = (value) => Number(value);
const selectedMillimeters = (select, input) => select.value === 'manual' ? unitToMillimeters(number(input.value), selectedUnit) : number(select.value);
const displayMeasurement = (millimeters) => String(Number(convertUnits(millimeters, 'mm', selectedUnit).toFixed(3)));

function renderStaticText() {
  document.documentElement.lang = locale;
  document.title = text('pageTitle');
  document.querySelector('#page-description').content = text('pageDescription');
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', text(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-unit-label]').forEach((element) => { element.textContent = `${text(element.dataset.unitLabel)} (${selectedUnit})`; });
  document.querySelector('#vinyl-width option[value="480"]').textContent = text('nenufarWidth', {value: displayMeasurement(480), unit: selectedUnit});
  for (const select of [controls.stickerSize, controls.gap, controls.length]) {
    [...select.options].filter((option) => option.value !== 'manual').forEach((option) => {
      option.textContent = `${displayMeasurement(number(option.value))} ${selectedUnit}`;
    });
  }
}

function itemDimensions() {
  const sizeMm = selectedMillimeters(controls.stickerSize, controls.sizeValue);
  if (controls.shape.value !== 'png' || !png) return {width: sizeMm, height: sizeMm};
  const longestSide = Math.max(png.width, png.height);
  return {width: sizeMm * png.width / longestSide, height: sizeMm * png.height / longestSide};
}

function createSticker(dimensions) {
  const sticker = document.createElement('div');
  sticker.className = `sticker ${controls.shape.value}`;
  if (controls.shape.value === 'png' && png) {
    const image = document.createElement('img');
    image.src = png.url;
    image.alt = '';
    sticker.append(image);
  }
  return sticker;
}

function renderPreview(grid, dimensions, gap, vinylWidth, length) {
  preview.replaceChildren();
  if (!grid.total) {
    preview.textContent = controls.shape.value === 'png' && !png ? text('choosePng') : text('noFit');
    return;
  }

  if (viewMode === 'inspection') {
    const cell = document.createElement('div');
    cell.className = 'inspection-cell';
    cell.style.setProperty('--item-width', dimensions.width);
    cell.style.setProperty('--item-height', dimensions.height);
    cell.append(createSticker(dimensions));
    preview.append(cell);
    document.querySelector('#preview-note').textContent = text('zoomNote');
    return;
  }

  const overviewLength = Math.min(length, OVERVIEW_MAX_LENGTH_MM);
  const positions = overviewItemPositions({
    columns: grid.columns,
    rows: grid.rows,
    itemWidth: dimensions.width,
    itemHeight: dimensions.height,
    gap,
    overviewLength,
  });
  const sheet = document.createElement('div');
  sheet.className = 'overview-sheet';
  sheet.style.setProperty('--sheet-ratio', previewSheetRatio({vinylWidth, overviewLength}));
  sheet.style.setProperty('--vinyl-width', vinylWidth);
  sheet.style.setProperty('--overview-length', overviewLength);
  sheet.style.width = `${Math.min(100, (vinylWidth / overviewLength) * 100)}%`;
  for (const position of positions) {
    const frame = previewFrame(position, {vinylWidth, overviewLength});
    const sticker = createSticker(dimensions);
    sticker.style.left = `${frame.left}%`;
    sticker.style.top = `${frame.top}%`;
    sticker.style.width = `${frame.width}%`;
    sticker.style.height = `${frame.height}%`;
    sheet.append(sticker);
  }
  preview.append(sheet);
  document.querySelector('#preview-note').textContent = length > OVERVIEW_MAX_LENGTH_MM ? text('cappedOverview', {length: displayMeasurement(OVERVIEW_MAX_LENGTH_MM), unit: selectedUnit}) : text('overviewNote');
}

function render() {
  const vinylWidth = selectedMillimeters(controls.vinylWidth, controls.widthValue);
  const gap = selectedMillimeters(controls.gap, controls.gapValue);
  const length = selectedMillimeters(controls.length, controls.lengthValue);
  const dimensions = itemDimensions();
  const valid = [vinylWidth, gap, length, dimensions.width, dimensions.height].every(Number.isFinite) && vinylWidth > 0 && gap >= 0 && length > 0 && dimensions.width > 0 && dimensions.height > 0;
  controls.error.textContent = valid ? '' : text('invalidValue');
  const grid = valid ? calculateGrid({vinylWidth, itemWidth: dimensions.width, itemHeight: dimensions.height, gap, length}) : calculateGrid({});

  document.querySelector('#columns').textContent = grid.columns;
  document.querySelector('#rows').textContent = grid.rows;
  document.querySelector('#total').textContent = grid.total;
  document.querySelector('#total-stat').textContent = grid.total;
  document.querySelector('#used-space').textContent = grid.total ? text('usedSpace', {width: displayMeasurement(grid.usedWidth), length: displayMeasurement(grid.usedLength), unit: selectedUnit}) : '';
  renderPreview(grid, dimensions, gap, vinylWidth, length);
}

function toggleManual(select, field) { field.classList.toggle('is-hidden', select.value !== 'manual'); }

function updateShape() {
  const isPng = controls.shape.value === 'png';
  controls.pngUpload.classList.toggle('is-hidden', !isPng);
  controls.restoreOriginal.classList.toggle('is-hidden', !isPng || !png);
  controls.originalSize.classList.toggle('is-hidden', !isPng || !png);
  render();
}

async function loadPng() {
  const file = controls.pngFile.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = async () => {
    const pixelsPerMeter = pngPixelsPerMeter(await file.arrayBuffer());
    const original = originalPngSizeMm({width: image.naturalWidth, height: image.naturalHeight, pixelsPerMeter});
    if (png?.url) URL.revokeObjectURL(png.url);
    png = {url, width: image.naturalWidth, height: image.naturalHeight, original};
    controls.restoreOriginal.classList.remove('is-hidden');
    controls.originalSize.classList.remove('is-hidden');
    controls.originalSize.textContent = text('originalSize', {width: displayMeasurement(original.width), height: displayMeasurement(original.height), unit: selectedUnit});
    controls.stickerSize.value = 'manual';
    controls.manualSize.classList.remove('is-hidden');
    controls.sizeValue.value = displayMeasurement(Math.max(original.width, original.height));
    render();
  };
  image.src = url;
}

controls.shape.addEventListener('change', updateShape);
controls.pngFile.addEventListener('change', loadPng);
controls.restoreOriginal.addEventListener('click', () => {
  if (!png) return;
  controls.stickerSize.value = 'manual';
  controls.manualSize.classList.remove('is-hidden');
  controls.sizeValue.value = displayMeasurement(Math.max(png.original.width, png.original.height));
  render();
});
for (const [select, field] of [[controls.vinylWidth, controls.manualWidth], [controls.stickerSize, controls.manualSize], [controls.gap, controls.manualGap], [controls.length, controls.manualLength]]) {
  select.addEventListener('change', () => { toggleManual(select, field); render(); });
}
document.querySelector('form').addEventListener('input', render);
overviewButton.addEventListener('click', () => { viewMode = 'overview'; overviewButton.classList.add('active'); inspectionButton.classList.remove('active'); render(); });
inspectionButton.addEventListener('click', () => { viewMode = 'inspection'; inspectionButton.classList.add('active'); overviewButton.classList.remove('active'); render(); });
language.value = locale;
language.addEventListener('change', () => { locale = resolveLocale(language.value); savePreferredLocale(locale, languageStorage); renderStaticText(); if (png) controls.originalSize.textContent = text('originalSize', {width: displayMeasurement(png.original.width), height: displayMeasurement(png.original.height), unit: selectedUnit}); render(); });
controls.unit.addEventListener('change', () => {
  const nextUnit = controls.unit.value;
  for (const input of [controls.widthValue, controls.sizeValue, controls.gapValue, controls.lengthValue]) {
    if (input.value !== '') input.value = String(Number(convertUnits(number(input.value), selectedUnit, nextUnit).toFixed(3)));
  }
  selectedUnit = nextUnit;
  renderStaticText();
  if (png) controls.originalSize.textContent = text('originalSize', {width: displayMeasurement(png.original.width), height: displayMeasurement(png.original.height), unit: selectedUnit});
  render();
});
controls.unit.value = selectedUnit;
renderStaticText();
render();
