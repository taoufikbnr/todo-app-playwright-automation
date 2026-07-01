import { chromium } from '@playwright/test';
import fs from 'fs';
import { url } from '../url';

const URLS = url
// --------------------
// load resume index
// --------------------
const STATE_FILE = 'progress.json';

function loadProgress() {
  if (!fs.existsSync(STATE_FILE)) return 0;
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')).index || 0;
}

function saveProgress(index: number) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ index }, null, 2));
}

// --------------------
// popup detection
// --------------------
async function detectPopup(page) {
  return await page.evaluate(() => {
    function scan(root: any): boolean {
      if (!root) return false;

      if (root.querySelector?.('[data-e2e="side-button"]')) {
        return true;
      }

      for (const el of root.querySelectorAll?.('*') || []) {
        if (el.shadowRoot && scan(el.shadowRoot)) {
          return true;
        }
      }

      return false;
    }

    return scan(document);
  }).catch(() => false);
}

// --------------------
// safe navigation
// --------------------
async function safeGoto(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      return true;
    } catch (e) {
      console.log(`Retry ${i + 1} → ${url}`);
    }
  }
  return false;
}

// --------------------
// main runner
// --------------------
(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];

  let page = await context.newPage();

  const startIndex = loadProgress();

  console.log(`Resuming from index: ${startIndex}`);

  for (let i = startIndex; i < URLS.length; i++) {
    const url = URLS[i];

    let success = false;

    try {
      if (page.isClosed()) {
        page = await context.newPage();
      }

      const ok = await safeGoto(page, url);
      if (!ok) {
        console.log("SKIP (navigation failed):", url);
        continue;
      }

      await page.waitForTimeout(2000);

      const popup = await detectPopup(page);

      console.log(`${url} → ${popup}`);

      fs.appendFileSync(
        'results.csv',
        `${url},${popup}\n`
      );

      success = true;

    } catch (err) {
      console.log(`ERROR: ${url}`, err);
    }

    if (success) {
      saveProgress(i + 1);
    } else {
      saveProgress(i); 
    }
  }

  console.log("DONE ALL URLS");
})();