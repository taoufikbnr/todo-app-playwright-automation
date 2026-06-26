import { test, chromium } from '@playwright/test';
import { url } from '../url';
import fs from 'fs';

test('use my real Chrome session', async () => {
  const context = await chromium.launchPersistentContext(
    'C:\\Users\\<username>\\Desktop\\profile',
    {
      headless: false,
      channel: 'chrome',
      args: ['--profile-directory=<Profile>'],
    }
  );

  const page = await context.newPage();
const urls = url
  const matchedUrls: string[] = [];

  for (const url of urls) {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(5000); 

    const popupExists = await page.evaluate(() => {
      const host = document.querySelector('aside');

      if (!host?.shadowRoot) return false;

      return !!host.shadowRoot.querySelector(
        '[data-e2e="side-button"]'
      );
    });

    console.log(`${url}: ${popupExists}`);

    if (!popupExists) {
      matchedUrls.push(url);
    }
  }

  fs.writeFileSync(
    'popup-found.txt',
    matchedUrls.join('\n'),
    'utf8'
  );

  console.log(`Found popup on ${matchedUrls.length} sites`);

});