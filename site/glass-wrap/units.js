const factors = {mm: 1, cm: 10};

export function unitToMillimeters(value, unit) {
  return value * factors[unit];
}

export function convertUnits(value, fromUnit, toUnit) {
  return unitToMillimeters(value, fromUnit) / factors[toUnit];
}
