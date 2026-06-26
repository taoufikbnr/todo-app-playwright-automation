const fs = require("fs");
const { chromium } = require("playwright");
const  CATEGORY_RULES  = require("./categoryData");


function classify(meta) {
  const text = [
    meta.title,
    meta.description,
    meta.ogTitle
  ].join(" ").toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(k => text.includes(k))) {
      return category;
    }
  }

  return "Unknown";
}

async function extractMeta(page) {
  return await page.evaluate(() => {
    const get = sel =>
      document.querySelector(sel)?.content || "";

    return {
      title: document.title || "",
      description:
        get('meta[name="description"]') ||
        get('meta[property="og:description"]') ||  get('meta[name="keywords"]'),
      ogTitle: get('meta[property="og:title"]')
    };
  });
}

const urls = JSON.parse(
  fs.readFileSync("urls.json", "utf8")
);

const results = [];

fs.writeFileSync("results.csv", "url,category\n");

(async () => {
  const browser = await chromium.launch({ headless: true,  ignoreHTTPSErrors: true });

  for (const url of urls) {
    const page = await browser.newPage();
  let category = "FAILED";

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      const meta = await extractMeta(page);
      const category =await classify(meta);

      const result = {
        url,
        category
      };

      console.log(result);

      results.push(result);

      // Save JSON
      fs.writeFileSync(
        "results.json",
        JSON.stringify(results, null, 2)
      );

      // Append CSV
      fs.appendFileSync(
        "results.csv",
        `"${url}","${category}"\n`
      );

    } catch (e) {
      console.log("FAILED:", url, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();