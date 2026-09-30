import {convertUnits, unitToMillimeters} from '../shared/units.js';

export function createStickerState() {
  return {
    unit: 'mm',
    vinylWidth: '480',
    widthValue: '',
    shape: 'circle',
    stickerSize: '50',
    sizeValue: '',
    gap: '4',
    gapValue: '',
    length: '1000',
    lengthValue: '',
    viewMode: 'overview',
    png: null,
  };
}

export function selectedMillimeters(selection, manualValue, unit) {
  return selection === 'manual' ? unitToMillimeters(Number(manualValue), unit) : Number(selection);
}

export function convertManualMeasurements(state, nextUnit) {
  for (const key of ['widthValue', 'sizeValue', 'gapValue', 'lengthValue']) {
    if (state[key] !== '') state[key] = String(Number(convertUnits(Number(state[key]), state.unit, nextUnit).toFixed(3)));
  }
  state.unit = nextUnit;
}
