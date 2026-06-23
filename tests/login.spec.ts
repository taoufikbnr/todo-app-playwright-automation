import { test, chromium } from '@playwright/test';

test('use my real Chrome session', async () => {
  const context = await chromium.launchPersistentContext(
    'C:\\Users\\lenovo\\Desktop',
    {
      headless: false,
      channel: 'chrome',
      args: ['--profile-directory=Profile 5'],
    }
  );

  const page = await context.newPage();

  await page.goto('https://www.saucedemo.com/');

  await page.pause();
});