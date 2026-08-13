const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
const ARTICLES_DIR = path.join(ROOT, "src", "data", "articles");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = "https://virixoo.com";
const SITE_NAME = "Virixoo";
const DEFAULT_IMAGE_PATH = "/images/virixoo-default.svg";
const DEFAULT_IMAGE_URL = `${SITE_URL}${DEFAULT_IMAGE_PATH}`;

/* =========================================================
   Basic Helpers
   ========================================================= */

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

function truncateText(value = "", maxLength = 160) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return (
    text
      .slice(0, maxLength - 3)
      .trim()
      .replace(/[.,;:!?-]+$/, "") + "..."
  );
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#039;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function readingTime(content = "") {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function topicTokens(article) {
  const raw = [
    article.title,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ].filter(Boolean).join(" ").toLowerCase();

  const stop = new Set([
    "the","and","for","with","your","you","how","why","what","when","from",
    "this","that","dog","dogs","cat","cats","my","is","are","a","an","to",
    "of","in","on","at","so","much","common","guide","safe","signs","causes"
  ]);

  return new Set(
    raw.replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stop.has(word))
  );
}

function relatedArticles(article, allArticles, limit = 6) {
  const baseTokens = topicTokens(article);

  return allArticles
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => {
      const candidateTokens = topicTokens(candidate);
      let overlap = 0;
      for (const token of baseTokens) {
        if (candidateTokens.has(token)) overlap += 1;
      }
      const sameCategory =
        String(candidate.category).toLowerCase() ===
        String(article.category).toLowerCase();

      return {
        candidate,
        score: overlap * 10 + (sameCategory ? 5 : 0) + (Number(candidate.id) || 0) / 100000
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}

function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/* =========================================================
   Content Formatting
   ========================================================= */

function sanitizeArticleHtml(html = "") {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "")
    .replace(
      /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,
      ""
    )
    .replace(/javascript\s*:/gi, "");
}

function formatContent(content = "") {
  const raw = String(content || "").trim();

  if (!raw) {
    return "";
  }

  if (/<\/?[a-z][\s\S]*>/i.test(raw)) {
    return sanitizeArticleHtml(raw);
  }

  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`
    )
    .join("\n");
}

/* =========================================================
   URL / Image Helpers
   ========================================================= */

function normalizeImagePath(image = "") {
  const value = String(image || "").trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  ) {
    return value;
  }

  return value.startsWith("/")
    ? value
    : `/${value.replace(/^\/+/, "")}`;
}

function publicImageExists(image = "") {
  const normalized = normalizeImagePath(image);

  if (!normalized) {
    return false;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("//")
  ) {
    return true;
  }

  const relative = normalized.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, relative);

  return fs.existsSync(filePath);
}

function displayImagePath(image = "") {
  const normalized = normalizeImagePath(image);

  if (normalized && publicImageExists(normalized)) {
    return normalized;
  }

  return DEFAULT_IMAGE_PATH;
}

function absoluteImageUrl(image = "") {
  const displayed = displayImagePath(image);

  if (
    displayed.startsWith("http://") ||
    displayed.startsWith("https://")
  ) {
    return displayed;
  }

  return `${SITE_URL}${displayed}`;
}

function articleUrl(article) {
  return `${SITE_URL}/article/${encodeURIComponent(article.slug)}/`;
}

function pinterestShareUrl(article) {
  const canonical = articleUrl(article);
  const image = absoluteImageUrl(article.image || "");
  const description = article.title || "Virixoo pet care guide";

  return (
    "https://www.pinterest.com/pin/create/button/?" +
    `url=${encodeURIComponent(canonical)}` +
    `&media=${encodeURIComponent(image)}` +
    `&description=${encodeURIComponent(description)}`
  );
}

/* =========================================================
   Default Fallback Image
   ========================================================= */

function createDefaultImage() {
  const imageDir = path.join(DIST_DIR, "images");

  ensureDir(imageDir);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f4f0ff"/>
      <stop offset="100%" stop-color="#e6f4ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="700" fill="url(#bg)"/>
  <circle cx="600" cy="285" r="120" fill="#ffffff" opacity="0.88"/>
  <text x="600" y="310" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="82">🐾</text>
  <text x="600" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="70" font-weight="700" fill="#28213d">Virixoo</text>
  <text x="600" y="520" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#51486a">Dog &amp; Cat Care Guides</text>
</svg>`.trim();

  fs.writeFileSync(
    path.join(imageDir, "virixoo-default.svg"),
    svg,
    "utf8"
  );
}

/* =========================================================
   Schema
   ========================================================= */

function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: {
      "@id": `${SITE_URL}/#organization`
    }
  };
}

function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`
  };
}

function createArticleSchema(article) {
  const canonical = articleUrl(article);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical
    },
    headline: article.title,
    description: truncateText(article.summary || "", 160),
    image: [absoluteImageUrl(article.image || "")],
    author: {
      "@type": "Organization",
      name: article.author || "Virixoo Editorial Team"
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`
    },
    articleSection: article.category
  };

  if (article.datePublished) {
    schema.datePublished = article.datePublished;
  }

  if (article.dateModified || article.datePublished) {
    schema.dateModified =
      article.dateModified || article.datePublished;
  }

  return schema;
}

function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function schemaScript(schema) {
  return `
<script type="application/ld+json">
${safeJsonLd(schema)}
</script>
`;
}

/* =========================================================
   Layout
   ========================================================= */

function header(
  title,
  description,
  canonical,
  options = {}
) {
  const image =
    options.image !== undefined
      ? absoluteImageUrl(options.image)
      : DEFAULT_IMAGE_URL;

  const schemas = options.schemas || [];

  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>
<meta
  name="robots"
  content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
>

<title>${escapeHtml(truncateText(title, 70))}</title>

<meta
  name="description"
  content="${escapeHtml(truncateText(description, 160))}"
>

<link
  rel="canonical"
  href="${escapeHtml(canonical)}"
>

<meta
  property="og:type"
  content="${escapeHtml(options.type || "website")}"
>
<meta
  property="og:title"
  content="${escapeHtml(title)}"
>
<meta
  property="og:description"
  content="${escapeHtml(truncateText(description, 160))}"
>
<meta
  property="og:url"
  content="${escapeHtml(canonical)}"
>
<meta
  property="og:image"
  content="${escapeHtml(image)}"
>

<meta
  name="twitter:card"
  content="summary_large_image"
>
<meta
  name="twitter:title"
  content="${escapeHtml(title)}"
>
<meta
  name="twitter:description"
  content="${escapeHtml(truncateText(description, 160))}"
>
<meta
  name="twitter:image"
  content="${escapeHtml(image)}"
>

${schemas.map(schemaScript).join("\n")}

<link
  rel="stylesheet"
  href="/css/style.css"
>
</head>

<body>

<header class="site-header">
  <div class="site-header-inner">

    <a
      class="site-logo"
      href="/"
      aria-label="Virixoo Home"
    >
      Virixoo
    </a>

    <nav
      class="main-nav"
      aria-label="Main navigation"
    >
      <a href="/">Home</a>
      <a href="/dogs/">Dogs</a>
      <a href="/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>

  </div>
</header>

<main class="site-main">
`;
}

function footer() {
  return `
</main>

<footer class="site-footer">
  <div class="site-footer-inner">

    <p>
      © ${new Date().getFullYear()} Virixoo.
      Practical dog and cat care guides. Educational information only; not a substitute for veterinary care.
    </p>

    <nav aria-label="Footer navigation">
      <a href="/about/">About</a>
      ·
      <a href="/privacy-policy/">Privacy</a>
      ·
      <a href="/contact/">Contact</a>
    </nav>

  </div>
</footer>

</body>
</html>
`;
}

/* =========================================================
   Article Cards
   ========================================================= */

function articleCard(article, options = {}) {
  const url = `/article/${encodeURIComponent(article.slug)}/`;
  const image = displayImagePath(article.image || "");
  const alt = article.alt || article.imageAlt || article.title || "Virixoo pet care guide";
  const pinterestUrl = pinterestShareUrl(article);
  const compact = options.compact === true;
  const headingTag = options.headingTag || "h2";

  return `
<article class="article-card${compact ? " article-card-compact" : ""}" data-article-card>
  <a class="card-image-link" href="${url}" aria-label="Read ${escapeHtml(article.title)}">
    <img class="article-card-image" src="${escapeHtml(image)}"
      alt="${escapeHtml(alt)}" loading="lazy" decoding="async" width="800" height="500">
  </a>
  <div class="article-card-body">
    <div class="card-topline">
      <a class="category-pill" href="/${slugify(article.category)}/">${escapeHtml(article.category)}</a>
      <span class="reading-time">${readingTime(article.content)} min read</span>
    </div>
    <${headingTag}><a href="${url}">${escapeHtml(article.title)}</a></${headingTag}>
    ${compact ? "" : `<p>${escapeHtml(truncateText(article.summary || "", 155))}</p>`}
    <div class="article-card-actions">
      <a class="read-more" href="${url}">Read guide →</a>
      <a class="pinterest-button" href="${escapeHtml(pinterestUrl)}"
        target="_blank" rel="noopener noreferrer">📌 Save</a>
    </div>
  </div>
</article>`;
}

/* =========================================================
   Home Page
   ========================================================= */

function createHomePage(articles) {
  const ordered = [...articles].sort((a, b) => Number(b.id) - Number(a.id));
  const featured = ordered.slice(0, 3);
  const browsePool = ordered.slice(3);
  const dogsCount = articles.filter((a) => a.category === "Dogs").length;
  const catsCount = articles.filter((a) => a.category === "Cats").length;

  const html = `
${header(
  "Virixoo - Practical Dog & Cat Care Guides",
  "Practical dog and cat care guides covering health, behavior, nutrition, grooming and everyday pet care.",
  `${SITE_URL}/`,
  { schemas: [createWebSiteSchema(), createOrganizationSchema()] }
)}

<section class="hero-section home-hero">
  <div class="hero-copy">
    <span class="eyebrow">Practical pet care, made clearer</span>
    <h1>Trusted Guides for Happier Dogs & Cats</h1>
    <p>Clear, useful guidance for everyday pet health, behavior, nutrition, grooming and training questions.</p>
    <div class="hero-actions">
      <a class="primary-button" href="/dogs/">Explore Dog Guides</a>
      <a class="secondary-button" href="/cats/">Explore Cat Guides</a>
    </div>
  </div>
  <div class="hero-stats" aria-label="Virixoo guide library">
    <div><strong>${articles.length}</strong><span>Total guides</span></div>
    <div><strong>${dogsCount}</strong><span>Dog guides</span></div>
    <div><strong>${catsCount}</strong><span>Cat guides</span></div>
  </div>
</section>

<section class="trust-strip" aria-label="Virixoo editorial principles">
  <span>✓ Easy to understand</span>
  <span>✓ Safety-first guidance</span>
  <span>✓ Clear veterinary warning signs</span>
  <span>✓ Regularly expanded library</span>
</section>

<section class="articles-section featured-section" aria-labelledby="featured-guides">
  <div class="section-heading">
    <div><span class="eyebrow">Start here</span><h2 id="featured-guides">Featured Pet Care Guides</h2></div>
  </div>
  <div class="articles-grid featured-grid">
    ${featured.map((article) => articleCard(article)).join("\n")}
  </div>
</section>

<section class="articles-section discovery-section" aria-labelledby="discover-guides">
  <div class="section-heading">
    <div>
      <span class="eyebrow">From our library</span>
      <h2 id="discover-guides">Discover More Helpful Guides</h2>
      <p>A fresh selection from Virixoo each time you visit.</p>
    </div>
    <button class="shuffle-button" id="shuffle-guides" type="button">Show different guides</button>
  </div>

  <div class="articles-grid" id="dynamic-article-grid" data-display-count="9">
    ${browsePool.map((article) => articleCard(article)).join("\n")}
  </div>
</section>

<section class="category-cta-grid">
  <a class="category-cta" href="/dogs/">
    <span class="category-icon" aria-hidden="true">🐕</span>
    <div><span class="eyebrow">Dog care</span><h2>Explore ${dogsCount} Dog Guides</h2>
    <p>Health, behavior, training, grooming and everyday care.</p></div>
  </a>
  <a class="category-cta" href="/cats/">
    <span class="category-icon" aria-hidden="true">🐈</span>
    <div><span class="eyebrow">Cat care</span><h2>Explore ${catsCount} Cat Guides</h2>
    <p>Health, behavior, nutrition, grooming and home care.</p></div>
  </a>
</section>

<section class="editorial-note">
  <span class="eyebrow">Our approach</span>
  <h2>Useful information without unnecessary complexity</h2>
  <p>Virixoo articles help pet owners understand common situations, recognize warning signs and know when professional veterinary care may be appropriate. Our guides are educational and are not a substitute for diagnosis or treatment from a veterinarian.</p>
  <a href="/about/">Learn about Virixoo →</a>
</section>

<script>
(function () {
  const grid = document.getElementById("dynamic-article-grid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll("[data-article-card]"));
  const count = Math.min(Number(grid.dataset.displayCount || 9), cards.length);

  function shuffleAndShow() {
    const shuffled = cards
      .map((card) => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item) => item.card);

    shuffled.forEach((card, index) => {
      card.hidden = index >= count;
      grid.appendChild(card);
    });
  }

  shuffleAndShow();
  const button = document.getElementById("shuffle-guides");
  if (button) button.addEventListener("click", shuffleAndShow);
})();
</script>

${footer()}`;

  fs.writeFileSync(path.join(DIST_DIR, "index.html"), html, "utf8");
}

/* =========================================================
   Article Page
   ========================================================= */

function createArticlePage(article, allArticles) {
  const articleDir = path.join(
    DIST_DIR,
    "article",
    article.slug
  );

  ensureDir(articleDir);

  const canonical = articleUrl(article);
  const categorySlug = slugify(article.category);

  const schemas = [
    createArticleSchema(article),
    createBreadcrumbSchema([
      {
        name: "Home",
        url: `${SITE_URL}/`
      },
      {
        name: article.category,
        url: `${SITE_URL}/${categorySlug}/`
      },
      {
        name: article.title,
        url: canonical
      }
    ])
  ];

  const image = displayImagePath(article.image || "");
  const pinterestUrl = pinterestShareUrl(article);
  const related = relatedArticles(article, allArticles, 6);

  const html = `
${header(
  `${article.title} | Virixoo`,
  article.summary || "Expert pet care guide from Virixoo.",
  canonical,
  {
    type: "article",
    image: article.image || "",
    schemas
  }
)}

<article class="single-article">

  <nav
    class="breadcrumbs"
    aria-label="Breadcrumb"
  >
    <a href="/">Home</a>
    ›
    <a href="/${categorySlug}/">
      ${escapeHtml(article.category)}
    </a>
    ›
    <span>
      ${escapeHtml(article.title)}
    </span>
  </nav>

  <div class="article-meta">
    <a class="category-pill" href="/${categorySlug}/">${escapeHtml(article.category)}</a>
    <span>By ${escapeHtml(article.author || "Virixoo Editorial Team")}</span>
    <span>${readingTime(article.content)} min read</span>
    ${article.dateModified || article.datePublished
      ? `<span>Updated ${escapeHtml(article.dateModified || article.datePublished)}</span>`
      : ""}
  </div>

  <h1>
    ${escapeHtml(article.title)}
  </h1>

  <img
    class="article-hero"
    src="${escapeHtml(image)}"
    alt="${escapeHtml(
      article.alt ||
      article.imageAlt ||
      article.title
    )}"
    width="1200"
    height="700"
    loading="eager"
    fetchpriority="high"
  >

  <div class="article-share">
    <a
      class="pinterest-button"
      href="${escapeHtml(pinterestUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share ${escapeHtml(article.title)} on Pinterest"
    >
      📌 Save on Pinterest
    </a>
  </div>

  ${
    article.summary
      ? `
  <p class="article-summary">
    ${escapeHtml(article.summary)}
  </p>
  `
      : ""
  }

  <div class="article-content">
    ${formatContent(article.content)}
  </div>

  <aside class="editorial-box" aria-label="Editorial note">
    <strong>Virixoo Editorial Note</strong>
    <p>This guide is for general educational purposes. Pet symptoms can have different causes, so contact a veterinarian when signs are severe, persistent, worsening or otherwise concerning.</p>
  </aside>
</article>

${related.length ? `
<section class="articles-section related-section" aria-labelledby="related-guides">
  <div class="section-heading">
    <div><span class="eyebrow">Keep reading</span><h2 id="related-guides">Related ${escapeHtml(article.category)} Guides</h2></div>
    <a href="/${categorySlug}/">View all ${escapeHtml(article.category)} guides →</a>
  </div>
  <div class="articles-grid related-grid">
    ${related.map((item) => articleCard(item, { compact: true, headingTag: "h3" })).join("\n")}
  </div>
</section>` : ""}

${footer()}
`;

  fs.writeFileSync(
    path.join(articleDir, "index.html"),
    html,
    "utf8"
  );
}

/* =========================================================
   Category Pages
   ========================================================= */

function createCategoryPage(articles, category, slug) {
  const filtered = articles
    .filter((article) => String(article.category).toLowerCase() === category.toLowerCase())
    .sort((a, b) => Number(b.id) - Number(a.id));

  const description =
    category === "Dogs"
      ? "Browse practical dog care guides covering health, behavior, training, nutrition, grooming and everyday questions."
      : "Browse practical cat care guides covering health, behavior, nutrition, grooming, litter box issues and everyday questions.";

  const html = `
${header(
  `${category} Care Guides | Virixoo`,
  description,
  `${SITE_URL}/${slug}/`,
  { schemas: [createBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: `${category} Care Guides`, url: `${SITE_URL}/${slug}/` }
    ])] }
)}

<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a> › <span>${escapeHtml(category)} Care Guides</span>
</nav>

<section class="category-header">
  <span class="eyebrow">${escapeHtml(category)} library</span>
  <h1>${escapeHtml(category)} Care Guides</h1>
  <p>${escapeHtml(description)}</p>
  <div class="category-count">${filtered.length} practical guides and growing</div>
</section>

<section class="articles-section">
  <div class="articles-grid">
    ${filtered.map((article) => articleCard(article)).join("\n")}
  </div>
</section>

<section class="editorial-note category-editorial-note">
  <h2>How to use these guides</h2>
  <p>Start with the guide that best matches your question. Virixoo helps you understand common causes, safe next steps and warning signs. For urgent, severe or persistent symptoms, seek veterinary care.</p>
</section>

${footer()}`;

  const dir = path.join(DIST_DIR, slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

/* =========================================================
   Simple Pages
   ========================================================= */

function createSimplePage(
  title,
  text,
  slug
) {
  const dir = path.join(DIST_DIR, slug);

  ensureDir(dir);

  const html = `
${header(
  `${title} | Virixoo`,
  text,
  `${SITE_URL}/${slug}/`
)}

<article class="single-article">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(text)}</p>
</article>

${footer()}
`;

  fs.writeFileSync(
    path.join(dir, "index.html"),
    html,
    "utf8"
  );
}

/* =========================================================
   File Copying
   ========================================================= */

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

  ensureDir(destination);

  const entries = fs.readdirSync(
    source,
    {
      withFileTypes: true
    }
  );

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(
      destination,
      entry.name
    );

    if (entry.isDirectory()) {
      copyDirectory(
        sourcePath,
        destinationPath
      );
    } else if (entry.isFile()) {
      fs.copyFileSync(
        sourcePath,
        destinationPath
      );
    }
  }
}

/* =========================================================
   Article Data Loading
   ========================================================= */

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();

    if (!raw) {
      throw new Error("File is empty.");
    }

    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${path.relative(
        ROOT,
        filePath
      )}: ${error.message}`
    );
  }
}

function normalizeArticleFileData(
  data,
  filePath
) {
  if (
    data &&
    !Array.isArray(data) &&
    Array.isArray(data.articles)
  ) {
    return data.articles;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    return [data];
  }

  throw new Error(
    `Unsupported article JSON structure in ${path.relative(
      ROOT,
      filePath
    )}. Use a single article object, an array, or {"articles":[...]}.`
  );
}

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];

  const entries = fs.readdirSync(
    directory,
    {
      withFileTypes: true
    }
  );

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      results.push(
        ...collectJsonFiles(fullPath)
      );
      continue;
    }

    if (
      entry.isFile() &&
      entry.name
        .toLowerCase()
        .endsWith(".json") &&
      entry.name.toLowerCase() !== "index.json"
    ) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function loadArticles() {
  const articles = [];

  if (fs.existsSync(DATA_FILE)) {
    const legacyData = readJsonFile(DATA_FILE);

    const legacyArticles =
      normalizeArticleFileData(
        legacyData,
        DATA_FILE
      );

    for (const article of legacyArticles) {
      articles.push({
        ...article,
        __sourceFile:
          path.relative(ROOT, DATA_FILE)
      });
    }
  }

  // Recursively loads JSON article files
  // from all subfolders under src/data/articles.

  const articleFiles =
    collectJsonFiles(ARTICLES_DIR);

  for (const filePath of articleFiles) {
    const data = readJsonFile(filePath);

    const fileArticles =
      normalizeArticleFileData(
        data,
        filePath
      );

    for (const article of fileArticles) {
      articles.push({
        ...article,
        __sourceFile:
          path.relative(ROOT, filePath)
      });
    }
  }

  if (articles.length === 0) {
    throw new Error(
      "No articles found. Keep src/data/articles.json or add JSON files under src/data/articles."
    );
  }

  return articles;
}

/* =========================================================
   Validation
   ========================================================= */

function validateArticles(articles) {
  const ids = new Map();
  const slugs = new Map();

  articles.forEach((article, index) => {
    const source =
      article.__sourceFile ||
      `article #${index + 1}`;

    if (!article.title) {
      throw new Error(
        `Missing title in ${source}.`
      );
    }

    if (!article.slug) {
      article.slug = slugify(article.title);
    }

    article.slug =
      String(article.slug).trim();

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        article.slug
      )
    ) {
      throw new Error(
        `Invalid slug "${article.slug}" in ${source}. Use lowercase letters, numbers, and hyphens only.`
      );
    }

    if (
      article.id === undefined ||
      article.id === null ||
      article.id === ""
    ) {
      throw new Error(
        `Article "${article.title}" is missing an id in ${source}.`
      );
    }

    const idKey = String(article.id);

    if (ids.has(idKey)) {
      throw new Error(
        `Duplicate article id "${article.id}" found in ${source} and ${ids.get(
          idKey
        )}.`
      );
    }

    ids.set(idKey, source);

    if (slugs.has(article.slug)) {
      throw new Error(
        `Duplicate slug "${article.slug}" found in ${source} and ${slugs.get(
          article.slug
        )}.`
      );
    }

    slugs.set(article.slug, source);

    if (!article.content) {
      throw new Error(
        `Article "${article.title}" is missing content in ${source}.`
      );
    }

    if (!article.category) {
      throw new Error(
        `Article "${article.title}" is missing category in ${source}.`
      );
    }

    article.category =
      String(article.category).trim();

    if (
      !["Cats", "Dogs"].includes(
        article.category
      )
    ) {
      throw new Error(
        `Unsupported category "${article.category}" in ${source}. Use "Cats" or "Dogs".`
      );
    }

    if (article.image) {
      article.image =
        normalizeImagePath(article.image);
    }
  });
}

function validateInternalLinks(articles) {
  const knownSlugs = new Set(
    articles.map(
      (article) =>
        String(article.slug || "").trim()
    )
  );

  const linkPattern =
    /href\s*=\s*["']\/article\/([^"'?#/]+)\/?["']/gi;

  const broken = [];

  for (const article of articles) {
    const content =
      String(article.content || "");

    let match;

    while (
      (match = linkPattern.exec(content)) !== null
    ) {
      const linkedSlug =
        decodeURIComponent(match[1]);

      if (!knownSlugs.has(linkedSlug)) {
        broken.push({
          article: article.slug,
          linkedSlug,
          source: article.__sourceFile
        });
      }
    }
  }

  if (broken.length) {
    const details = broken
      .map(
        (item) =>
          `- ${item.article} -> ${item.linkedSlug} (${item.source})`
      )
      .join("\n");

    throw new Error(
      `Broken internal article links detected:\n${details}`
    );
  }
}

/* =========================================================
   Index / Sitemap / Robots
   ========================================================= */

function createArticleIndex(articles) {
  const index = {
    generatedAt:
      new Date().toISOString(),

    totalArticles:
      articles.length,

    articles:
      articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        image:
          displayImagePath(
            article.image || ""
          ),
        source:
          article.__sourceFile || ""
      }))
  };

  fs.writeFileSync(
    path.join(
      DIST_DIR,
      "articles-index.json"
    ),
    JSON.stringify(
      index,
      null,
      2
    ),
    "utf8"
  );
}

function createSitemap(articles) {
  const urls = [
    {
      loc: `${SITE_URL}/`
    },
    {
      loc: `${SITE_URL}/cats/`
    },
    {
      loc: `${SITE_URL}/dogs/`
    },
    {
      loc: `${SITE_URL}/about/`
    },
    {
      loc: `${SITE_URL}/privacy-policy/`
    },
    {
      loc: `${SITE_URL}/contact/`
    }
  ];

  for (const article of articles) {
    urls.push({
      loc: articleUrl(article),
      lastmod:
        article.dateModified ||
        article.datePublished ||
        ""
    });
  }

  const body = urls
    .map((item) => {
      const lastmod = item.lastmod
        ? `<lastmod>${escapeHtml(
            item.lastmod
          )}</lastmod>`
        : "";

      return `
<url>
  <loc>${escapeHtml(item.loc)}</loc>
  ${lastmod}
</url>`;
    })
    .join("\n");

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${body}
</urlset>
`.trim();

  fs.writeFileSync(
    path.join(DIST_DIR, "sitemap.xml"),
    xml,
    "utf8"
  );
}

function createRobots() {
  fs.writeFileSync(
    path.join(DIST_DIR, "robots.txt"),
    `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`,
    "utf8"
  );
}

/* =========================================================
   Build
   ========================================================= */

function build() {
  console.log("Starting Virixoo build...");

  const articles = loadArticles();

  console.log(
    `Found ${articles.length} articles.`
  );

  validateArticles(articles);
  validateInternalLinks(articles);

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

  copyDirectory(
    PUBLIC_DIR,
    DIST_DIR
  );

  createDefaultImage();

  createArticleIndex(articles);

  for (const article of articles) {
    if (
      article.image &&
      !publicImageExists(article.image)
    ) {
      console.warn(
        `WARNING: Image missing, using fallback: ${article.image}`
      );
    }
  }

  createHomePage(articles);

  for (const article of articles) {
    createArticlePage(article, articles);
  }

  createCategoryPage(
    articles,
    "Cats",
    "cats"
  );

  createCategoryPage(
    articles,
    "Dogs",
    "dogs"
  );

  createSimplePage(
    "About Virixoo",
    "Virixoo provides practical and easy-to-understand guides for dog and cat owners, covering nutrition, training, grooming, behavior and everyday pet care.",
    "about"
  );

  createSimplePage(
    "Privacy Policy",
    "Virixoo respects your privacy. This page contains information about how the site handles visitor data and advertising technologies.",
    "privacy-policy"
  );

  createSimplePage(
    "Contact",
    "For questions, corrections or general inquiries, please contact the Virixoo team.",
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
  console.error("BUILD FAILED:");
  console.error(error);
  process.exit(1);
}
