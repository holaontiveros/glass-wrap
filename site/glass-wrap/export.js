import {createSvgMarkup} from './geometry.js';

export const PNG_DPI = 300;

export function millimetersToPixels(millimeters) {
  return Math.round((millimeters / 25.4) * PNG_DPI);
}

export function pixelsPerMeterForDpi(dpi) {
  return Math.round(dpi / 0.0254);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(data.length + 12);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(data.length + 8, crc32(chunk.subarray(4, data.length + 8)));
  return chunk;
}

export async function addPngResolution(blob, dpi = PNG_DPI) {
  const png = new Uint8Array(await blob.arrayBuffer());
  const signatureLength = 8;
  const ihdrLength = 25;
  const data = new Uint8Array(9);
  const view = new DataView(data.buffer);
  const pixelsPerMeter = pixelsPerMeterForDpi(dpi);
  view.setUint32(0, pixelsPerMeter);
  view.setUint32(4, pixelsPerMeter);
  data[8] = 1;
  const resolutionChunk = createChunk('pHYs', data);
  const output = new Uint8Array(png.length + resolutionChunk.length);
  output.set(png.subarray(0, signatureLength + ihdrLength));
  output.set(resolutionChunk, signatureLength + ihdrLength);
  output.set(png.subarray(signatureLength + ihdrLength), signatureLength + ihdrLength + resolutionChunk.length);
  return new Blob([output], {type: 'image/png'});
}

export async function createPngBlob(template, options = {}) {
  const svg = new Blob([createSvgMarkup(template, options)], {type: 'image/svg+xml'});
  const imageUrl = URL.createObjectURL(svg);
  const image = new Image();
  image.src = imageUrl;
  await image.decode();
  URL.revokeObjectURL(imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = millimetersToPixels(template.width);
  canvas.height = millimetersToPixels(template.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!png) throw new Error('PNG export could not be created.');
  return addPngResolution(png);
}
