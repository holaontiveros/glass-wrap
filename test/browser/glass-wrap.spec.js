import {expect, test} from '@playwright/test';

test('Glass Wrap enables both exports for valid dimensions and preserves their physical size on unit change', async ({page}) => {
  await page.goto('/glass-wrap/');

  await page.locator('#top-diameter').fill('80');
  await page.locator('#bottom-diameter').fill('70');
  await page.locator('#glass-height').fill('120');

  await expect(page.locator('#download')).toBeEnabled();
  await expect(page.locator('#download-png')).toBeEnabled();

  await page.locator('#unit').selectOption('cm');
  await expect(page.locator('#top-diameter')).toHaveValue('8');
  await expect(page.locator('#bottom-diameter')).toHaveValue('7');
  await expect(page.locator('#glass-height')).toHaveValue('12');
  await expect(page.locator('#download')).toBeEnabled();
  await expect(page.locator('#download-png')).toBeEnabled();
});
