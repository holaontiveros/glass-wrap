export const FALLBACK_PNG_DPI = 300;

export function originalPngSizeMm({width, height, pixelsPerMeter}) {
  const pixelsPerInch = Number.isFinite(pixelsPerMeter) && pixelsPerMeter > 0
    ? pixelsPerMeter * 0.0254
    : FALLBACK_PNG_DPI;
  const millimetersPerPixel = 25.4 / pixelsPerInch;

  return {width: width * millimetersPerPixel, height: height * millimetersPerPixel};
}

export function pngPixelsPerMeter(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 8) return null;

  for (let offset = 8; offset + 12 <= view.byteLength;) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...new Uint8Array(buffer, offset + 4, 4));
    if (type === 'pHYs' && length >= 9 && offset + 8 + length <= view.byteLength) {
      return view.getUint32(offset + 8);
    }
    offset += length + 12;
  }

  return null;
}
