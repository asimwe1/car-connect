import { test, expect } from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:4173';

test('home renders and nav links exist', async ({ page }) => {
  await page.goto(`${base}/`);
  await expect(page.getByRole('link', { name: 'car.connect' })).toBeVisible();
  const header = page.locator('nav');
  await expect(header.getByRole('link', { name: 'Buy Cars', exact: true })).toBeVisible();
});

test('buy cars grid loads', async ({ page }) => {
  await page.goto(`${base}/buy-cars`);
  await expect(page.getByText('Find Your Perfect Car')).toBeVisible();
});

test('protected action prompts auth', async ({ page }) => {
  await page.goto(`${base}/`);
  const header = page.locator('nav');
  await header.getByRole('link', { name: 'Sell Car', exact: true }).click();
  await expect(page.getByText('Join Car.Connect')).toBeVisible();
});


