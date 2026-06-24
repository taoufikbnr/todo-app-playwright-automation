const fs = require("fs");
const { chromium } = require("playwright");
const { GoogleGenAI } = require("@google/genai");


const ai = new GoogleGenAI({
  apiKey: "api key"
});
const categories = [
  "Culture & Leisure",
  "Fashion & Accessories",
  "Home & Living",
  "Travel",
  "Groceries",
  "Family & Kids",
  "Gaming",
  "Finance & Insurance",
  "Electronics",
  "Sports & Outdoors",
  "Garden & Do It Yourself",
  "Car & Motorcycle",
  "Health & Beauty",
  "Broadband & Phone Service",
  "Services & Contracts"
];
async function classify(meta) {
  const prompt = `
Classify the following retailer into exactly one category.

Allowed categories:
- Culture & Leisure
- Fashion & Accessories
- Home & Living
- Travel
- Groceries
- Family & Kids
- Gaming
- Finance & Insurance
- Electronics
- Sports & Outdoors
- Garden & Do It Yourself
- Car & Motorcycle
- Health & Beauty
- Broadband & Phone Service
- Services & Contracts

Retailer metadata:
Title: ${meta.title}
Description: ${meta.description}
OG Title: ${meta.ogTitle}

Return only the category text and nothing else.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

    const text = response.text?.trim();

    if (!text) return "FAILED";

    const parsed = JSON.parse(text);

    if (!parsed?.category) return "FAILED";

    return parsed.category;

}

async function extractMeta(page) {
  return await page.evaluate(() => {
    const get = (selector) =>
      document.querySelector(selector)?.content?.trim() || "";

    return {
      title: document.title || "",

      description:
        get('meta[name="description"]') ||
        get('meta[property="og:description"]'),

      keywords: get('meta[name="keywords"]'),

      ogTitle: get('meta[property="og:title"]'),

      ogDescription: get('meta[property="og:description"]')
    };
  });
}

const domains = JSON.parse(
  fs.readFileSync("urls.json", "utf8")
);
function toUrl(domain) {
  return domain.startsWith("http")
    ? domain
    : `https://${domain}`;
}
const results = [];

fs.writeFileSync("results.csv", "url,category\n");

(async () => {
  const browser = await chromium.launch({ headless: true,  ignoreHTTPSErrors: true
 });

  for (const domain of domains) {
      const url = toUrl(domain);

    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      const meta = await extractMeta(page);
      const category = await classify(meta);

      const result = {
        domain,
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
        `"${domain}","${category}"\n`
      );

    } catch (e) {
      console.log("FAILED:", url, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();