export const GLUE_TAB_WIDTH_MM = 10;

const EQUAL_DIAMETER_TOLERANCE_MM = 0.0001;
const SVG_PADDING_MM = 4;

const isPositiveFinite = (value) => Number.isFinite(value) && value > 0;

export function validateMeasurements(measurements) {
  const fields = [
    ['topDiameter', 'Top diameter'],
    ['bottomDiameter', 'Bottom diameter'],
    ['height', 'Glass height'],
  ];
  const errors = {};

  for (const [key, label] of fields) {
    if (!isPositiveFinite(measurements[key])) {
      errors[key] = `${label} must be a number greater than 0 mm.`;
    }
  }

  return {valid: Object.keys(errors).length === 0, errors};
}

const point = (radius, angle) => ({x: radius * Math.cos(angle), y: radius * Math.sin(angle)});
const format = (value) => Number(value.toFixed(5));
const pointText = ({x, y}) => `${format(x)} ${format(y)}`;

function boundsForPoints(points) {
  return {
    minX: Math.min(...points.map(({x}) => x)),
    maxX: Math.max(...points.map(({x}) => x)),
    minY: Math.min(...points.map(({y}) => y)),
    maxY: Math.max(...points.map(({y}) => y)),
  };
}

function createStraightTemplate(measurements, includeGlueTab) {
  const bodyWidth = Math.PI * measurements.topDiameter;
  const bodyHeight = measurements.height;
  const tabWidth = includeGlueTab ? GLUE_TAB_WIDTH_MM : 0;
  const width = bodyWidth + tabWidth + SVG_PADDING_MM * 2;
  const height = bodyHeight + SVG_PADDING_MM * 2;
  const x = SVG_PADDING_MM;
  const y = SVG_PADDING_MM;
  const bodyLeft = x + tabWidth;
  const svgPath = includeGlueTab
    ? `M ${pointText({x: bodyLeft, y})} H ${format(bodyLeft + bodyWidth)} V ${format(y + bodyHeight)} H ${format(bodyLeft)} L ${format(x + 1)} ${format(y + bodyHeight - 2)} V ${format(y + 2)} Z`
    : `M ${pointText({x, y})} H ${format(x + bodyWidth)} V ${format(y + bodyHeight)} H ${x} Z`;

  return {
    kind: 'straight',
    bodyWidth,
    bodyHeight,
    tabWidth,
    width,
    height,
    viewBox: `0 0 ${format(width)} ${format(height)}`,
    svgPath,
  };
}

function createConicalTemplate(measurements, includeGlueTab) {
  const topRadius = measurements.topDiameter / 2;
  const bottomRadius = measurements.bottomDiameter / 2;
  const radiusDifference = Math.abs(topRadius - bottomRadius);
  const slantHeight = Math.hypot(measurements.height, radiusDifference);
  const largerRadius = Math.max(topRadius, bottomRadius);
  const smallerRadius = Math.min(topRadius, bottomRadius);
  const outerRadius = (slantHeight * largerRadius) / radiusDifference;
  const innerRadius = (slantHeight * smallerRadius) / radiusDifference;
  const angle = (2 * Math.PI * largerRadius) / outerRadius;
  const startAngle = -angle / 2;
  const endAngle = angle / 2;
  const outerStart = point(outerRadius, startAngle);
  const outerEnd = point(outerRadius, endAngle);
  const innerStart = point(innerRadius, startAngle);
  const innerEnd = point(innerRadius, endAngle);
  const cardinalAngles = [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI]
    .filter((candidate) => candidate > startAngle && candidate < endAngle);
  const bodyPoints = [outerStart, outerEnd, innerStart, innerEnd];
  for (const candidate of cardinalAngles) {
    bodyPoints.push(point(outerRadius, candidate), point(innerRadius, candidate));
  }

  const tabWidth = includeGlueTab ? GLUE_TAB_WIDTH_MM : 0;
  const outwardNormal = {x: Math.sin(startAngle), y: -Math.cos(startAngle)};
  const tabOuter = {
    x: outerStart.x + outwardNormal.x * tabWidth,
    y: outerStart.y + outwardNormal.y * tabWidth,
  };
  const tabInner = {
    x: innerStart.x + outwardNormal.x * tabWidth,
    y: innerStart.y + outwardNormal.y * tabWidth,
  };
  const allPoints = includeGlueTab ? [...bodyPoints, tabOuter, tabInner] : bodyPoints;
  const bounds = boundsForPoints(allPoints);
  const translate = (value) => ({
    x: value.x - bounds.minX + SVG_PADDING_MM,
    y: value.y - bounds.minY + SVG_PADDING_MM,
  });
  const translatedOuterStart = translate(outerStart);
  const translatedOuterEnd = translate(outerEnd);
  const translatedInnerStart = translate(innerStart);
  const translatedInnerEnd = translate(innerEnd);
  const largeArc = angle > Math.PI ? 1 : 0;
  const outerArc = `A ${format(outerRadius)} ${format(outerRadius)} 0 ${largeArc} 1 ${pointText(translatedOuterEnd)}`;
  const innerArc = `A ${format(innerRadius)} ${format(innerRadius)} 0 ${largeArc} 0 ${pointText(translatedInnerStart)}`;
  const svgPath = includeGlueTab
    ? `M ${pointText(translatedOuterStart)} ${outerArc} L ${pointText(translatedInnerEnd)} ${innerArc} L ${pointText(translate(tabInner))} L ${pointText(translate(tabOuter))} Z`
    : `M ${pointText(translatedOuterStart)} ${outerArc} L ${pointText(translatedInnerEnd)} ${innerArc} Z`;
  const width = bounds.maxX - bounds.minX + SVG_PADDING_MM * 2;
  const height = bounds.maxY - bounds.minY + SVG_PADDING_MM * 2;

  return {
    kind: 'conical',
    bodyWidth: null,
    bodyHeight: measurements.height,
    tabWidth,
    outerRadius,
    innerRadius,
    angle,
    width,
    height,
    viewBox: `0 0 ${format(width)} ${format(height)}`,
    svgPath,
  };
}

export function buildTemplate(measurements, options = {}) {
  const validation = validateMeasurements(measurements);
  if (!validation.valid) {
    throw new TypeError('Cannot build a template from invalid measurements.');
  }

  const includeGlueTab = options.includeGlueTab === true;
  if (Math.abs(measurements.topDiameter - measurements.bottomDiameter) < EQUAL_DIAMETER_TOLERANCE_MM) {
    return createStraightTemplate(measurements, includeGlueTab);
  }
  return createConicalTemplate(measurements, includeGlueTab);
}

export function createSvgMarkup(template, options = {}) {
  const filled = options.filled === true;
  const fill = filled ? '#f1749e' : 'none';
  const stroke = filled ? '#672c66' : '#000';
  const originalWidth = format(template.width);
  const originalHeight = format(template.height);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${originalHeight}mm" height="${originalWidth}mm" viewBox="0 0 ${originalHeight} ${originalWidth}"><g transform="translate(0 ${originalWidth}) rotate(-90)"><path d="${template.svgPath}" fill="${fill}" stroke="${stroke}" stroke-width="0.25"/></g></svg>`;
}
