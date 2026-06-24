import { chromium } from '@playwright/test';
import * as fs from 'fs';
import url from './urls.json';
import type { Page } from '@playwright/test';
const URLS = url

const STATE_FILE = 'progress.json';
const JSON_FILE = "results.json";
const CSV_FILE = "results.csv";
type Result = {
  url: string;
  popup: boolean;
};
let results:Result[] = [];
function loadProgress() {
  if (!fs.existsSync(STATE_FILE)) return 0;
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')).index || 0;
}

function saveProgress(index: number) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ index }, null, 2));
}


async function detectPopup(page:Page) {
   await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    function scan(root: any): boolean {
      if (!root) return false;

      if (root.querySelector?.('.side-button[data-e2e="side-button"]')) {
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


async function safeGoto(page:Page, url:string) {
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

        if (!page.isClosed())
          await page.close();

        page = await context.newPage();

        continue;
      }
      await page.waitForTimeout(2000);

      const popup = await detectPopup(page);

      console.log(`${url} → ${popup}`);
      const record = {
  url,
  popup
};

// avoid duplicates (optional safety)
    const exists = results.some(r => r.url === url);

    if (!exists) {
      results.push(record);
    }

      fs.writeFileSync(JSON_FILE, JSON.stringify(results, null, 2));    
      fs.appendFileSync(CSV_FILE, `${url},${popup}\n`);

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