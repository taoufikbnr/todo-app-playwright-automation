import { test, chromium } from '@playwright/test';

test('attach to running chrome', async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] ?? await context.newPage();

  await page.goto('https://www.saucedemo.com/');
  await page.pause();
  await page.click('id=user-name')
  await page.locator('id=user-name').fill("hey")
});