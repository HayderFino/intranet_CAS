const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "index.html");
const noticiasPath = path.join(__dirname, "data/noticias.json");

if (!fs.existsSync(indexPath)) {
  console.error("index.html not found");
  process.exit(1);
}

const content = fs.readFileSync(indexPath, "utf8");
const newsItems = [];

// Regex to capture news items from index.html
// This covers the hardcoded ones without data-id
const regex =
  /<div [^>]*class="[^"]*news-item[^"]*"[^>]*>[\s\S]*?<img [^>]*src="([^"]*)"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?(?:<p[^>]*>([\s\S]*?)<\/p>)?[\s\S]*?<\/div>/g;

let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  const imageUrl = match[1].trim();
  const title = match[2].trim();
  const description = match[3] ? match[3].trim() : "";

  // Prefix with / if not already
  const fixedImageUrl = imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl;

  newsItems.push({
    id: "legacy-" + count++,
    title,
    description,
    imageUrl: fixedImageUrl,
    category: "Institucional",
    createdAt: new Date().toISOString(),
  });
}

console.log(`Found ${newsItems.length} legacy news items.`);

let existingNews = [];
if (fs.existsSync(noticiasPath)) {
  try {
    existingNews = JSON.parse(fs.readFileSync(noticiasPath, "utf8"));
  } catch (e) {}
}

// Merge, avoiding duplicates by title
const filteredLegacy = newsItems.filter(
  (ln) => !existingNews.some((en) => en.title === ln.title),
);
const merged = [...existingNews, ...filteredLegacy];

fs.writeFileSync(noticiasPath, JSON.stringify(merged, null, 2), "utf8");
console.log(`Saved ${merged.length} total news items to noticias.json.`);
