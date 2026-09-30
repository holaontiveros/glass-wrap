import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function enterMeasurements(page, {top = '80', bottom = '70', height = '120'} = {}) {
  await page.locator('#top-diameter').fill(top);
  await page.locator('#bottom-diameter').fill(bottom);
  await page.locator('#glass-height').fill(height);
}

test('Glass Wrap enables both exports for valid dimensions and preserves their physical size on unit change', async ({page}) => {
  await page.goto('/glass-wrap/');

  await enterMeasurements(page);

  await expect(page.locator('#download')).toBeEnabled();
  await expect(page.locator('#download-png')).toBeEnabled();

  await page.locator('#unit').selectOption('cm');
  await expect(page.locator('#top-diameter')).toHaveValue('8');
  await expect(page.locator('#bottom-diameter')).toHaveValue('7');
  await expect(page.locator('#glass-height')).toHaveValue('12');
  await expect(page.locator('#download')).toBeEnabled();
  await expect(page.locator('#download-png')).toBeEnabled();
});

test('Glass Wrap updates its preview and SVG download for glue tabs and filled templates', async ({page}) => {
  await page.goto('/glass-wrap/');
  await enterMeasurements(page, {top: '80', bottom: '80', height: '120'});

  const contourPath = await page.locator('#preview path').getAttribute('d');
  await expect(page.locator('#preview path')).toHaveAttribute('fill', 'none');

  await page.locator('#glue-tab').check();
  await page.locator('#filled-template').check();
  await expect(page.locator('#preview path')).toHaveAttribute('fill', '#f1749e');
  await expect(page.locator('#preview path')).not.toHaveAttribute('d', contourPath ?? '');

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('glass-wrap-straight-with-tab.svg');
  const svg = await readFile(await download.path(), 'utf8');
  expect(svg).toContain('fill="#f1749e"');
  expect(svg).toContain('rotate(-90)');
});

test('Glass Wrap downloads a PNG after a valid template is shown', async ({page}) => {
  await page.goto('/glass-wrap/');
  await enterMeasurements(page);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#download-png').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('glass-wrap-conical.png');
  expect((await readFile(await download.path())).subarray(1, 4).toString()).toBe('PNG');
});
