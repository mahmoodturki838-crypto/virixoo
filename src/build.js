const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = "https://virixoo.com";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatContent(content = "") {
  return String(content)
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const text = paragraph.trim();

      if (!text) return "";

      return `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function articleUrl(article) {
  const slug = article.slug || slugify(article.title);

  return `${SITE_URL}/article/${encodeURIComponent(slug)}/`;
}

function articleCard(article) {
  const slug = article.slug || slugify(article.title);
  const url = `/article/${encodeURIComponent(slug)}/`;

  const title = escapeHtml(article.title || "Pet Care Guide");
  const image = escapeHtml(article.image || "");
  const summary = escapeHtml(article.summary || "");
  const category = escapeHtml(article.category || "Pet Care");

  const pinterestUrl =
    `https://www.pinterest.com/pin/create/button/?` +
    `url=${encodeURIComponent(articleUrl(article))}` +
    `&media=${encodeURIComponent(article.image || "")}` +
    `&description=${encodeURIComponent(article.title || "")}`;

  return `
<article class="article-card">

  <a class="card-image-link" href="${url}" aria-label="${title}">
    ${
      image
        ? `
    <img
      src="${image}"
      alt="${title}"
      loading="lazy"
      width="800"
      height="500"
    >
    `
        : ""
    }
  </a>

  <div class="card-body">

    <div class="category">${category}</div>

    <h2>
      <a href="${url}">${title}</a>
    </h2>

    <p>${summary}</p>

    <div class="card-actions">

      <a class="read-more" href="${url}">
        Read More →
      </a>

      <a
        class="pinterest-btn"
        href="${pinterestUrl}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share ${title} on Pinterest"
      >
        📌 Pinterest
      </a>

    </div>

  </div>

</article>
`;
}

function header(title, description) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escapeHtml(title)}</title>

  <meta
    name="description"
    content="${escapeHtml(description)}"
  >

  <link
    rel="stylesheet"
    href="/css/style.css"
  >

</head>

<body>

<header class="site-header">

  <a href="/" class="logo">
    Virixoo
  </a>

  <nav>
    <a href="/">Home</a>
    <a href="/dogs/">Dogs</a>
    <a href="/cats/">Cats</a>
    <a href="/about/">About</a>
  </nav>

</header>

<main class="site-main">
`;
}

function footer() {
  return `
</main>

<footer class="site-footer">

  <div class="footer-links">
    <a href="/">Home</a>
    <a href="/dogs/">Dogs</a>
    <a href="/cats/">Cats</a>
    <a href="/about/">About</a>
    <a href="/privacy-policy/">Privacy Policy</a>
    <a href="/contact/">Contact</a>
  </div>

  <p>
    © ${new Date().getFullYear()} Virixoo. All rights reserved.
  </p>

</footer>

</body>
</html>
`;
}

function statsBox() {
  return `
<section class="stats-box">

  <div>
    <strong>Dogs</strong>
    <span>Expert Care Guides</span>
  </div>

  <div>
    <strong>Cats</strong>
    <span>Expert Care Guides</span>
  </div>

  <div>
    <strong>Virixoo</strong>
    <span>Pet Care Resources</span>
  </div>

</section>
`;
}

function createHomePage(articles) {
  const cards = articles
    .map(articleCard)
    .join("\n");

  const html = `
${header(
  "Virixoo - Expert Dog & Cat Care Guides",
  "Expert dog and cat care guides covering nutrition, training, grooming, behavior, breeds, and everyday pet care."
)}

<section class="hero">

  <h1>
    Expert Dog & Cat Care Guides
  </h1>

  <p>
    Practical guides for responsible pet owners covering
    nutrition, training, grooming, behavior, breeds,
    health, and everyday care.
  </p>

</section>

${statsBox()}

<section>

  <div class="section-heading">
    <h2>Latest Pet Care Guides</h2>
  </div>

  <div class="article-grid">
    ${cards}
  </div>

</section>

${footer()}
`;

  fs.writeFileSync(
    path.join(DIST_DIR, "index.html"),
    html,
    "utf8"
  );
}

function createArticlePage(article) {
  const slug = article.slug || slugify(article.title);

  const articleDir = path.join(
    DIST_DIR,
    "article",
    slug
  );

  ensureDir(articleDir);

  const title =
    article.title || "Pet Care Guide";

  const description =
    article.summary ||
    "Expert pet care guide from Virixoo.";

  const image =
    article.image || "";

  const pinterestUrl =
    `https://www.pinterest.com/pin/create/button/?` +
    `url=${encodeURIComponent(articleUrl(article))}` +
    `&media=${encodeURIComponent(image)}` +
    `&description=${encodeURIComponent(title)}`;

  const html = `
${header(
  `${title} | Virixoo`,
  description
)}

<article class="article-page">

  <div class="article-category">
    ${escapeHtml(article.category || "Pet Care")}
  </div>

  <h1>
    ${escapeHtml(title)}
  </h1>

  <div class="article-meta">

    <span>
      By ${escapeHtml(
        article.author || "Virixoo Editorial Team"
      )}
    </span>

    ${
      article.datePublished
        ? `
    <span>•</span>

    <span>
      Published ${escapeHtml(article.datePublished)}
    </span>
    `
        : ""
    }

    ${
      article.dateModified
        ? `
    <span>•</span>

    <span>
      Updated ${escapeHtml(article.dateModified)}
    </span>
    `
        : ""
    }

  </div>

  <div class="article-actions">

    <a
      class="pinterest-btn"
      href="${pinterestUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >
      📌 Share on Pinterest
    </a>

  </div>

  ${
    image
      ? `
  <img
    class="article-hero"
    src="${escapeHtml(image)}"
    alt="${escapeHtml(title)}"
    width="1200"
    height="700"
  >
  `
      : ""
  }

  <div class="article-content">

    ${formatContent(article.content)}

  </div>

  <div class="article-bottom-share">

    <span>
      Found this guide helpful?
    </span>

    <a
      class="pinterest-btn"
      href="${pinterestUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >
      📌 Save to Pinterest
    </a>

  </div>

</article>

${footer()}
`;

  fs.writeFileSync(
    path.join(articleDir, "index.html"),
    html,
    "utf8"
  );
}

function createCategoryPage(
  articles,
  category,
  slug
) {
  const filtered = articles.filter(
    (article) =>
      String(article.category || "").toLowerCase() ===
      category.toLowerCase()
  );

  const cards = filtered
    .map(articleCard)
    .join("\n");

  const html = `
${header(
  `${category} Care Guides | Virixoo`,
  `Expert ${category.toLowerCase()} care guides for responsible pet owners.`
)}

<section>

  <h1>
    ${escapeHtml(category)} Care Guides
  </h1>

  <p>
    Practical ${escapeHtml(
      category.toLowerCase()
    )}
    care information for responsible pet owners.
  </p>

  <div class="article-grid">
    ${cards}
  </div>

</section>

${footer()}
`;

  const categoryDir = path.join(
    DIST_DIR,
    slug
  );

  ensureDir(categoryDir);

  fs.writeFileSync(
    path.join(categoryDir, "index.html"),
    html,
    "utf8"
  );
}

function createSimplePage(
  title,
  text,
  slug
) {
  const html = `
${header(
  `${title} | Virixoo`,
  text
)}

<section class="simple-page">

  <h1>
    ${escapeHtml(title)}
  </h1>

  <p>
    ${escapeHtml(text)}
  </p>

</section>

${footer()}
`;

  const pageDir = path.join(
    DIST_DIR,
    slug
  );

  ensureDir(pageDir);

  fs.writeFileSync(
    path.join(pageDir, "index.html"),
    html,
    "utf8"
  );
}

function createRobots() {
  const robots = `
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`.trim();

  fs.writeFileSync(
    path.join(DIST_DIR, "robots.txt"),
    robots,
    "utf8"
  );
}

function createSitemap(articles) {
  const urls = [];

  urls.push(`
  <url>
    <loc>${SITE_URL}/</loc>
  </url>
  `);

  urls.push(`
  <url>
    <loc>${SITE_URL}/dogs/</loc>
  </url>
  `);

  urls.push(`
  <url>
    <loc>${SITE_URL}/cats/</loc>
  </url>
  `);

  urls.push(`
  <url>
    <loc>${SITE_URL}/about/</loc>
  </url>
  `);

  articles.forEach((article) => {
    urls.push(`
  <url>
    <loc>${escapeHtml(articleUrl(article))}</loc>
    ${
      article.dateModified
        ? `<lastmod>${escapeHtml(article.dateModified)}</lastmod>`
        : ""
    }
  </url>
    `);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls.join("\n")}
</urlset>
`;

  fs.writeFileSync(
    path.join(DIST_DIR, "sitemap.xml"),
    sitemap,
    "utf8"
  );
}

function copyPublicFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    return;
  }

  function copyDirectory(
    source,
    destination
  ) {
    ensureDir(destination);

    const entries = fs.readdirSync(
      source,
      { withFileTypes: true }
    );

    for (const entry of entries) {
      const sourcePath = path.join(
        source,
        entry.name
      );

      const destinationPath = path.join(
        destination,
        entry.name
      );

      if (entry.isDirectory()) {
        copyDirectory(
          sourcePath,
          destinationPath
        );
      } else {
        fs.copyFileSync(
          sourcePath,
          destinationPath
        );
      }
    }
  }

  copyDirectory(
    PUBLIC_DIR,
    DIST_DIR
  );
}

function build() {
  console.log(
    "Starting Virixoo build..."
  );

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(
      `articles.json not found: ${DATA_FILE}`
    );
  }

  const raw = fs.readFileSync(
    DATA_FILE,
    "utf8"
  );

  const data = JSON.parse(raw);

  if (!Array.isArray(data.articles)) {
    throw new Error(
      "articles.json must contain an 'articles' array."
    );
  }

  const articles = data.articles;

  console.log(
    `Found ${articles.length} articles.`
  );

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(
      DIST_DIR,
      {
        recursive: true,
        force: true
      }
    );
  }

  ensureDir(DIST_DIR);

  copyPublicFiles();

  createHomePage(articles);

  articles.forEach(
    createArticlePage
  );

  createCategoryPage(
    articles,
    "Dogs",
    "dogs"
  );

  createCategoryPage(
    articles,
    "Cats",
    "cats"
  );

  createSimplePage(
    "About Virixoo",
    "Virixoo provides practical and easy-to-understand guides for dog and cat owners, covering nutrition, training, grooming, behavior, breeds, and everyday pet care.",
    "about"
  );

  createSimplePage(
    "Privacy Policy",
    "Virixoo respects your privacy. This page will contain the complete privacy policy before advertising is enabled.",
    "privacy-policy"
  );

  createSimplePage(
    "Contact",
    "For questions, corrections, or general inquiries, please contact the Virixoo team.",
    "contact"
  );

  createRobots();

  createSitemap(articles);

  console.log(
    "Virixoo build completed successfully."
  );

  console.log(
    `Generated ${articles.length} article pages.`
  );
}

try {
  build();
} catch (error) {
  console.error(
    "BUILD FAILED:"
  );

  console.error(error);

  process.exit(1);
}
