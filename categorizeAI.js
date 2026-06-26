const fs = require("fs");
const { chromium } = require("playwright");


const ALLOWED_CATEGORIES = [
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
You are a strict classifier.

FORMAT:
{"category":"<one category>"}

The category value MUST be exactly one of:

${ALLOWED_CATEGORIES}

If none fits perfectly, choose the closest category.
Never create a new category.

Classification rules:

1. Focus on the PRIMARY business activity, not isolated words.
2. Consider  description, keywords and OG tags together.
3. food or drinks belong to Groceries.
4. Investment coins, bullion and precious metals belong to Finance & Insurance.
5. If multiple categories seem possible, choose the most representative one.
6. If information is insufficient, return "Unknown".


Metadata:
Description: ${meta.description}
Keywords: ${meta.keywords}
OG Description: ${meta.ogDescription}

`;

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1:8b",
      prompt,
      stream: false,
      options: {
        temperature: 0
      },
    })
  });

  const data = await res.json();

  

  console.log("Raw model output:", data.response);

  try {
    const cleaned = data.response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.category) {
      console.log("Missing category field:", parsed);
      return "Unknown";
    }

    return parsed.category;

  } catch (e) {
    console.log("JSON PARSE FAILED");
    console.log("RAW OUTPUT WAS:", data.response);
    return "Unknown";
  }
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
  fs.readFileSync("results.json", "utf8")
);
function toUrl(domain) {
  return domain.startsWith("http")
    ? domain
    : `https://${domain}`;
}
const results = [];

fs.writeFileSync("results.csv", "url;category\n");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ignoreHTTPSErrors: true
  });
const failedDomains = domains.filter(item => item.category === "FAILED");

  for (const domain of failedDomains) {
    const url = toUrl(domain.domain);

    const page = await browser.newPage();

    let category = "FAILED";

    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000
      });

      if (!response || !response.ok()) {
        throw new Error("Bad response");
      }

      const meta = await extractMeta(page);

      try {
        category = await classify(meta);
      } catch (e) {
        console.log("AI failed:", domain);
        category = "FAILED";
      }

    } catch (e) {
      category = "FAILED";
      console.log("FAILED:", domain);
    } finally {
      await page.close();
    }

    const result = {
      domain,
      category
    };

    console.log(result);

    results.push(result);

    // JSON save
    // fs.writeFileSync(
    //   "results.json",
    //   JSON.stringify(results, null, 2)
    // );

    // CSV save
    fs.appendFileSync(
      "results.csv",
      `"${domain}";"${category}"\n`
    );
  }

  await browser.close();

})();

