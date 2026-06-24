const fs = require("fs");

const lines = fs
  .readFileSync("raw.txt", "utf8")
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean);

const urls = [...new Set(
  lines
    .flatMap(line => line.split(/[,;]/)) 
    .map(url => url.trim())
    .filter(Boolean)
    .map(url => {
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }

      const parsed = new URL(url);

      // Remove www. and normalize
      const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

      return `https://${host}/`;
    })
)];

fs.writeFileSync("urls.json", JSON.stringify(urls, null, 2));

console.log(`Saved ${urls.length} unique URLs.`);