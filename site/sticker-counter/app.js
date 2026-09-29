import {calculateGrid, gridItemPosition, OVERVIEW_MAX_LENGTH_MM, VINYL_WIDTH_MM} from './layout.js';
import {originalPngSizeMm, pngPixelsPerMeter} from './png.js';
import {resolveLocale, translate} from './i18n.js';
import {getPreferredLocale, getSessionStorage, savePreferredLocale} from '../shared/locale.js';

const controls = {
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
let viewMode = 'overview';
let png = null;

const text = (key, values) => translate(locale, key, values);
const number = (value) => Number(value);
const selectedValue = (select, input) => select.value === 'manual' ? number(input.value) : number(select.value);
const cm = (millimeters) => (millimeters / 10).toFixed(2).replace(/\.00$/, '');

function renderStaticText() {
  document.documentElement.lang = locale;
  document.title = text('pageTitle');
  document.querySelector('#page-description').content = text('pageDescription');
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = text(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', text(element.dataset.i18nAria)); });
}

function itemDimensions() {
  const sizeMm = selectedValue(controls.stickerSize, controls.sizeValue) * 10;
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

function renderPreview(grid, dimensions, length) {
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
  const visibleRows = Math.min(grid.rows, Math.floor((overviewLength + selectedValue(controls.gap, controls.gapValue)) / (dimensions.height + selectedValue(controls.gap, controls.gapValue))));
  const sheet = document.createElement('div');
  sheet.className = 'overview-sheet';
  sheet.style.setProperty('--sheet-ratio', overviewLength / VINYL_WIDTH_MM);
  sheet.style.setProperty('--overview-length', overviewLength);
  sheet.style.setProperty('--gap', `${Math.max(1, selectedValue(controls.gap, controls.gapValue) / 5)}px`);
  sheet.style.width = `${Math.min(100, (VINYL_WIDTH_MM / overviewLength) * 100)}%`;
  for (let row = 0; row < visibleRows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const position = gridItemPosition({column, row, itemWidth: dimensions.width, itemHeight: dimensions.height, gap});
      const sticker = createSticker(dimensions);
      sticker.style.left = `${position.left / VINYL_WIDTH_MM * 100}%`;
      sticker.style.top = `${position.top / overviewLength * 100}%`;
      sticker.style.width = `${position.width / VINYL_WIDTH_MM * 100}%`;
      sticker.style.height = `${position.height / overviewLength * 100}%`;
      sheet.append(sticker);
    }
  }
  preview.append(sheet);
  document.querySelector('#preview-note').textContent = length > OVERVIEW_MAX_LENGTH_MM ? text('cappedOverview') : text('overviewNote');
}

function render() {
  const gap = selectedValue(controls.gap, controls.gapValue);
  const length = selectedValue(controls.length, controls.lengthValue) * 1000;
  const dimensions = itemDimensions();
  const valid = [gap, length, dimensions.width, dimensions.height].every(Number.isFinite) && gap >= 0 && length > 0 && dimensions.width > 0 && dimensions.height > 0;
  controls.error.textContent = valid ? '' : text('invalidValue');
  const grid = valid ? calculateGrid({itemWidth: dimensions.width, itemHeight: dimensions.height, gap, length}) : calculateGrid({});

  document.querySelector('#columns').textContent = grid.columns;
  document.querySelector('#rows').textContent = grid.rows;
  document.querySelector('#total').textContent = grid.total;
  document.querySelector('#total-stat').textContent = grid.total;
  document.querySelector('#used-space').textContent = grid.total ? text('usedSpace', {width: grid.usedWidth.toFixed(1), length: grid.usedLength.toFixed(1)}) : '';
  renderPreview(grid, dimensions, length);
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
    controls.originalSize.textContent = text('originalSize', {width: cm(original.width), height: cm(original.height)});
    controls.stickerSize.value = 'manual';
    controls.manualSize.classList.remove('is-hidden');
    controls.sizeValue.value = cm(Math.max(original.width, original.height));
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
  controls.sizeValue.value = cm(Math.max(png.original.width, png.original.height));
  render();
});
for (const [select, field] of [[controls.stickerSize, controls.manualSize], [controls.gap, controls.manualGap], [controls.length, controls.manualLength]]) {
  select.addEventListener('change', () => { toggleManual(select, field); render(); });
}
document.querySelector('form').addEventListener('input', render);
overviewButton.addEventListener('click', () => { viewMode = 'overview'; overviewButton.classList.add('active'); inspectionButton.classList.remove('active'); render(); });
inspectionButton.addEventListener('click', () => { viewMode = 'inspection'; inspectionButton.classList.add('active'); overviewButton.classList.remove('active'); render(); });
language.value = locale;
language.addEventListener('change', () => { locale = resolveLocale(language.value); savePreferredLocale(locale, languageStorage); renderStaticText(); if (png) controls.originalSize.textContent = text('originalSize', {width: cm(png.original.width), height: cm(png.original.height)}); render(); });
renderStaticText();
render();
