import {expect, test} from '@playwright/test';

test('Sticker Counter renders every fitting circle and keeps the 480 mm, 4 mm gap, 1 m defaults', async ({page}) => {
  await page.goto('/sticker-counter/');

  await expect(page.locator('#total')).toHaveText('144');
  await expect(page.locator('#columns')).toHaveText('8');
  await expect(page.locator('#rows')).toHaveText('18');
  await expect(page.locator('.overview-sheet .sticker')).toHaveCount(144);
});

test('Sticker Counter preserves square stickers and a correct grid with a 300 mm manual width', async ({page}) => {
  await page.goto('/sticker-counter/');

  await page.locator('#shape').selectOption('square');
  await page.locator('#vinyl-width').selectOption('manual');
  await page.locator('#width-value').fill('300');

  await expect(page.locator('#total')).toHaveText('90');
  await expect(page.locator('.overview-sheet .sticker')).toHaveCount(90);
  await expect(page.locator('.overview-sheet')).toHaveCSS('--vinyl-width', '300');
  const stickerRatio = await page.locator('.overview-sheet .sticker').first().evaluate((element) => {
    const {width, height} = element.getBoundingClientRect();
    return width / height;
  });
  expect(stickerRatio).toBeCloseTo(1, 1);
});

test('Sticker Counter changes its physical labels to centimeters without changing the count', async ({page}) => {
  await page.goto('/sticker-counter/');

  await page.locator('#unit').selectOption('cm');
  await expect(page.locator('#vinyl-width option[value="480"]')).toHaveText('48 cm (Nenúfar standard)');
  await expect(page.locator('#total')).toHaveText('144');
});
