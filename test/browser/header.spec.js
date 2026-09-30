import {expect, test} from '@playwright/test';

test('the shared header keeps the selected language while navigating between apps', async ({page}) => {
  await page.goto('/');

  await expect(page.getByRole('link', {name: 'Nenúfar Apps home'})).toBeVisible();
  await expect(page.locator('[data-nenufar-header] a[href="https://nenufar.mx"]')).toBeVisible();
  await page.locator('#language').selectOption('es');
  await expect(page.locator('h1')).toHaveText('Apps');

  await page.goto('/sticker-counter/');
  await expect(page.locator('#language')).toHaveValue('es');
  await expect(page.locator('#page-title')).toHaveText('Contador de stickers');
});
