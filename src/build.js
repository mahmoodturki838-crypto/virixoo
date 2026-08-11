const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
const ARTICLES_DIR = path.join(ROOT, "src", "data", "articles");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = "https://virixoo.com";
const SITE_NAME = "Virixoo";
const DEFAULT_IMAGE = `${SITE_URL}/images/virixoo-default.jpg`;


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
      .replace(/[.,;:!?-]+$/, "") +
    "..."
  );
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

function formatContent(content = "") {
  const raw = String(content || "").trim();

  if (!raw) {
    return "";
  }

  if (
    /<\/?(p|h2|h3|h4|ul|ol|li|strong|em|blockquote|a|br)\b/i.test(
      raw
    )
  ) {
    return sanitizeArticleHtml(raw);
  }

  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      return `<p>${escapeHtml(paragraph)}</p>`;
    })
    .join("\n");
}


function sanitizeArticleHtml(html = "") {
  let value = String(html || "");

  value = value.replace(
    /<script[\s\S]*?<\/script>/gi,
    ""
  );

  value = value.replace(
    /<iframe[\s\S]*?<\/iframe>/gi,
    ""
  );

  value = value.replace(
    /\son\w+\s*=\s*(['"]).*?\1/gi,
    ""
  );

  value = value.replace(
    /\son\w+\s*=\s*[^\s>]+/gi,
    ""
  );

  value = value.replace(
    /javascript:/gi,
    ""
  );

  return value;
}


/* =========================================================
   Image Helpers
   ========================================================= */

function normalizeImagePath(value = "") {
  const image = String(value || "").trim();

  if (!image) {
    return "";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return image.startsWith("/")
    ? image
    : `/${image}`;
}


function getArticleImage(article) {
  const image = normalizeImagePath(
    article.image || ""
  );

  if (!image) {
    return DEFAULT_IMAGE;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${SITE_URL}${image}`;
}


/* =========================================================
   File Helpers
   ========================================================= */

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }

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


function copyPublicFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    return;
  }

  copyDirectory(
    PUBLIC_DIR,
    DIST_DIR
  );
}


/* =========================================================
   Multi-file Article Loader
   ========================================================= */

function readJsonFile(filePath) {
  try {
    return JSON.parse(
      fs.readFileSync(
        filePath,
        "utf8"
      )
    );
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`
    );
  }
}


function normalizeArticleFileData(data, filePath) {
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
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    return [data];
  }

  throw new Error(
    `Unsupported article JSON structure in ${path.relative(ROOT, filePath)}. ` +
    `Use a single article object, an array, or {"articles":[...]}.`
  );
}


function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const results = [];

  const entries = fs.readdirSync(
    directory,
    { withFileTypes: true }
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
      entry.name.toLowerCase().endsWith(".json") &&
      entry.name.toLowerCase() !== "index.json"
    ) {
      results.push(fullPath);
    }
  }

  return results.sort();
}


function loadArticles() {
  const articles = [];

  /*
   * Keep the original articles.json.
   * Existing articles are loaded first.
   */
  if (fs.existsSync(DATA_FILE)) {
    const legacyData = readJsonFile(
      DATA_FILE
    );

    const legacyArticles =
      normalizeArticleFileData(
        legacyData,
        DATA_FILE
      );

    legacyArticles.forEach((article) => {
      articles.push({
        ...article,
        __sourceFile: path.relative(
          ROOT,
          DATA_FILE
        )
      });
    });
  }

  /*
   * Automatically discover new JSON files inside:
   *
   * src/data/articles/cats/
   * src/data/articles/dogs/
   *
   * and any future subfolders.
   */
  const articleFiles =
    collectJsonFiles(
      ARTICLES_DIR
    );

  for (const filePath of articleFiles) {
    const data = readJsonFile(
      filePath
    );

    const fileArticles =
      normalizeArticleFileData(
        data,
        filePath
      );

    fileArticles.forEach((article) => {
      articles.push({
        ...article,
        __sourceFile: path.relative(
          ROOT,
          filePath
        )
      });
    });
  }

  if (articles.length === 0) {
    throw new Error(
      "No articles found. Keep src/data/articles.json or add JSON files under src/data/articles/."
    );
  }

  return articles;
}


/* =========================================================
   Article Validation
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
      article.slug = slugify(
        article.title
      );
    }

    article.slug = String(
      article.slug
    ).trim();

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        article.slug
      )
    ) {
      throw new Error(
        `Invalid slug "${article.slug}" in ${source}. ` +
        `Use lowercase letters, numbers, and hyphens only.`
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

    const idKey = String(
      article.id
    );

    if (ids.has(idKey)) {
      throw new Error(
        `Duplicate article id "${article.id}" found in ` +
        `${source} and ${ids.get(idKey)}.`
      );
    }

    ids.set(
      idKey,
      source
    );

    if (
      slugs.has(
        article.slug
      )
    ) {
      throw new Error(
        `Duplicate slug "${article.slug}" found in ` +
        `${source} and ${slugs.get(article.slug)}.`
      );
    }

    slugs.set(
      article.slug,
      source
    );

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

    const category = String(
      article.category
    ).trim();

    if (
      !["Cats", "Dogs"].includes(
        category
      )
    ) {
      throw new Error(
        `Unsupported category "${category}" in ${source}. ` +
        `Use "Cats" or "Dogs".`
      );
    }

    article.category = category;

    if (article.image) {
      article.image =
        normalizeImagePath(
          article.image
        );
    }
  });
}


/* =========================================================
   Internal Link Validation
   ========================================================= */

function validateInternalLinks(articles) {
  const knownSlugs = new Set(
    articles.map((article) =>
      String(
        article.slug || ""
      ).trim()
    )
  );

  const linkPattern =
    /href\s*=\s*["']\/article\/([^"'?#/]+)\/?["']/gi;

  const broken = [];

  for (const article of articles) {
    const content = String(
      article.content || ""
    );

    let match;

    while (
      (match = linkPattern.exec(content)) !== null
    ) {
      const linkedSlug =
        decodeURIComponent(
          match[1]
        );

      if (
        !knownSlugs.has(
          linkedSlug
        )
      ) {
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
   Generated Article Index
   ========================================================= */

function createArticleIndex(articles) {
  const index = {
    generatedAt:
      new Date().toISOString(),

    totalArticles:
      articles.length,

    articles:
      articles.map((article) => ({
        id:
          article.id ?? null,

        title:
          article.title || "",

        slug:
          article.slug || "",

        category:
          article.category || "",

        image:
          article.image || "",

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


/* =========================================================
   Site Header / Footer
   ========================================================= */

function createHeader() {
  return `
<header class="site-header">
  <div class="container header-inner">

    <a
      class="site-logo"
      href="/"
      aria-label="${SITE_NAME} home"
    >
      ${SITE_NAME}
    </a>

    <nav
      class="main-nav"
      aria-label="Main navigation"
    >
      <a href="/">Home</a>
      <a href="/category/dogs/">Dogs</a>
      <a href="/category/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>

  </div>
</header>
`;
}


function createFooter() {
  const year =
    new Date().getFullYear();

  return `
<footer class="site-footer">
  <div class="container footer-inner">

    <div>
      <strong>${SITE_NAME}</strong>
      <p>
        Practical pet care guides for dog and cat owners.
      </p>
    </div>

    <nav
      class="footer-nav"
      aria-label="Footer navigation"
    >
      <a href="/about/">About</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/contact/">Contact</a>
    </nav>

  </div>

  <div class="container footer-bottom">
    &copy; ${year} ${SITE_NAME}. All rights reserved.
  </div>
</footer>
`;
}


/* =========================================================
   Page Layout
   ========================================================= */

function pageLayout({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  content,
  jsonLd = null
}) {
  const pageTitle =
    title === SITE_NAME
      ? SITE_NAME
      : `${title} | ${SITE_NAME}`;

  const metaDescription =
    truncateText(
      description ||
      "Practical pet care guides for dog and cat owners.",
      160
    );

  const canonicalUrl =
    canonical || SITE_URL;

  const socialImage =
    image || DEFAULT_IMAGE;

  return `<!doctype html>
<html lang="en">
<head>

  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>${escapeHtml(pageTitle)}</title>

  <meta
    name="description"
    content="${escapeHtml(metaDescription)}"
  >

  <link
    rel="canonical"
    href="${escapeHtml(canonicalUrl)}"
  >

  <meta
    property="og:site_name"
    content="${SITE_NAME}"
  >

  <meta
    property="og:type"
    content="${escapeHtml(type)}"
  >

  <meta
    property="og:title"
    content="${escapeHtml(pageTitle)}"
  >

  <meta
    property="og:description"
    content="${escapeHtml(metaDescription)}"
  >

  <meta
    property="og:url"
    content="${escapeHtml(canonicalUrl)}"
  >

  <meta
    property="og:image"
    content="${escapeHtml(socialImage)}"
  >

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${escapeHtml(pageTitle)}"
  >

  <meta
    name="twitter:description"
    content="${escapeHtml(metaDescription)}"
  >

  <meta
    name="twitter:image"
    content="${escapeHtml(socialImage)}"
  >

  <link
    rel="stylesheet"
    href="/css/style.css"
  >

  ${
    jsonLd
      ? `<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>`
      : ""
  }

</head>

<body>

  ${createHeader()}

  <main>
    ${content}
  </main>

  ${createFooter()}

</body>
</html>`;
}


/* =========================================================
   Article Cards
   ========================================================= */

function createArticleCard(article) {
  const image =
    normalizeImagePath(
      article.image || ""
    );

  const imageMarkup = image
    ? `
      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(
          article.alt ||
          article.title
        )}"
        loading="lazy"
        width="640"
        height="360"
      >
    `
    : "";

  return `
<article class="article-card">

  <a
    class="article-card-image"
    href="/article/${escapeHtml(article.slug)}/"
  >
    ${imageMarkup}
  </a>

  <div class="article-card-content">

    <div class="article-card-category">
      ${escapeHtml(article.category || "")}
    </div>

    <h2>
      <a href="/article/${escapeHtml(article.slug)}/">
        ${escapeHtml(article.title)}
      </a>
    </h2>

    <p>
      ${escapeHtml(
        truncateText(
          article.summary || "",
          150
        )
      )}
    </p>

    <a
      class="read-more"
      href="/article/${escapeHtml(article.slug)}/"
    >
      Read guide
    </a>

  </div>

</article>
`;
}


/* =========================================================
   Homepage
   ========================================================= */

function createHomePage(articles) {
  const latestArticles =
    [...articles]
      .sort((a, b) => {
        const dateA =
          new Date(
            a.datePublished || 0
          ).getTime();

        const dateB =
          new Date(
            b.datePublished || 0
          ).getTime();

        return dateB - dateA;
      });

  const cards =
    latestArticles
      .map(createArticleCard)
      .join("\n");

  const content = `
<section class="hero">
  <div class="container hero-inner">

    <div class="hero-content">

      <span class="eyebrow">
        Practical Pet Care
      </span>

      <h1>
        Better care for happier dogs and cats
      </h1>

      <p>
        Clear, practical guides to help you understand
        your pet's health, behavior, nutrition,
        grooming and everyday needs.
      </p>

      <div class="hero-actions">
        <a
          class="button button-primary"
          href="/category/dogs/"
        >
          Explore Dog Guides
        </a>

        <a
          class="button button-secondary"
          href="/category/cats/"
        >
          Explore Cat Guides
        </a>
      </div>

    </div>

  </div>
</section>


<section class="section">
  <div class="container">

    <div class="section-heading">
      <div>
        <span class="eyebrow">
          Expert-friendly guidance
        </span>

        <h2>
          Latest Pet Care Guides
        </h2>
      </div>
    </div>

    <div class="article-grid">
      ${cards}
    </div>

  </div>
</section>
`;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "WebSite",

    name:
      SITE_NAME,

    url:
      SITE_URL,

    description:
      "Practical pet care guides for dog and cat owners."
  };

  const html = pageLayout({
    title: SITE_NAME,
    description:
      "Practical pet care guides for dog and cat owners, covering health, behavior, nutrition, grooming and everyday care.",
    canonical:
      `${SITE_URL}/`,
    content,
    jsonLd
  });

  fs.writeFileSync(
    path.join(
      DIST_DIR,
      "index.html"
    ),
    html,
    "utf8"
  );
}


/* =========================================================
   Related Articles
   ========================================================= */

function getRelatedArticles(
  currentArticle,
  articles,
  limit = 3
) {
  const sameCategory =
    articles.filter((article) => {
      return (
        article.slug !==
          currentArticle.slug &&
        article.category ===
          currentArticle.category
      );
    });

  return sameCategory.slice(
    0,
    limit
  );
}


function createRelatedArticles(
  currentArticle,
  articles
) {
  const related =
    getRelatedArticles(
      currentArticle,
      articles,
      3
    );

  if (!related.length) {
    return "";
  }

  return `
<section class="related-articles">

  <div class="section-heading">
    <div>
      <span class="eyebrow">
        Keep learning
      </span>

      <h2>
        Related Guides
      </h2>
    </div>
  </div>

  <div class="article-grid">
    ${related
      .map(createArticleCard)
      .join("\n")}
  </div>

</section>
`;
}


/* =========================================================
   Article Page
   ========================================================= */

function createArticlePage(
  article,
  articles
) {
  const categorySlug =
    slugify(
      article.category
    );

  const canonical =
    `${SITE_URL}/article/${article.slug}/`;

  const image =
    getArticleImage(
      article
    );

  const articleContent =
    formatContent(
      article.content
    );

  const published =
    article.datePublished || "";

  const modified =
    article.dateModified ||
    article.datePublished ||
    "";

  const author =
    article.author ||
    "Virixoo Editorial Team";

  const content = `
<div class="container article-page">

  <nav
    class="breadcrumbs"
    aria-label="Breadcrumb"
  >
    <a href="/">Home</a>
    <span>/</span>
    <a href="/category/${escapeHtml(categorySlug)}/">
      ${escapeHtml(article.category)}
    </a>
    <span>/</span>
    <span>
      ${escapeHtml(article.title)}
    </span>
  </nav>


  <article class="article">

    <header class="article-header">

      <span class="eyebrow">
        ${escapeHtml(article.category)}
      </span>

      <h1>
        ${escapeHtml(article.title)}
      </h1>

      ${
        article.summary
          ? `
            <p class="article-summary">
              ${escapeHtml(article.summary)}
            </p>
          `
          : ""
      }

      <div class="article-meta">

        <span>
          By ${escapeHtml(author)}
        </span>

        ${
          published
            ? `
              <span>
                Published ${escapeHtml(published)}
              </span>
            `
            : ""
        }

        ${
          modified &&
          modified !== published
            ? `
              <span>
                Updated ${escapeHtml(modified)}
              </span>
            `
            : ""
        }

      </div>

    </header>


    ${
      article.image
        ? `
          <figure class="article-featured-image">

            <img
              src="${escapeHtml(
                normalizeImagePath(
                  article.image
                )
              )}"
              alt="${escapeHtml(
                article.alt ||
                article.title
              )}"
              width="1200"
              height="675"
            >

          </figure>
        `
        : ""
    }


    <div class="article-body">
      ${articleContent}
    </div>

  </article>


  ${createRelatedArticles(
    article,
    articles
  )}

</div>
`;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      article.title,

    description:
      article.summary || "",

    image: [
      image
    ],

    datePublished:
      published || undefined,

    dateModified:
      modified || undefined,

    author: {
      "@type":
        "Organization",

      name:
        author
    },

    publisher: {
      "@type":
        "Organization",

      name:
        SITE_NAME,

      url:
        SITE_URL
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        canonical
    }
  };

  const html = pageLayout({
    title:
      article.title,

    description:
      article.summary ||
      article.title,

    canonical,

    image,

    type:
      "article",

    content,

    jsonLd
  });

  const articleDirectory =
    path.join(
      DIST_DIR,
      "article",
      article.slug
    );

  ensureDir(
    articleDirectory
  );

  fs.writeFileSync(
    path.join(
      articleDirectory,
      "index.html"
    ),
    html,
    "utf8"
  );
}


/* =========================================================
   Category Pages
   ========================================================= */

function createCategoryPage(
  category,
  articles
) {
  const categorySlug =
    slugify(
      category
    );

  const categoryArticles =
    articles.filter(
      (article) =>
        article.category ===
        category
    );

  const cards =
    categoryArticles
      .map(createArticleCard)
      .join("\n");

  const description =
    category === "Dogs"
      ? "Practical dog care guides covering health, training, behavior, nutrition, grooming and everyday care."
      : "Practical cat care guides covering health, behavior, nutrition, grooming, litter box care and everyday needs.";

  const content = `
<section class="category-hero">
  <div class="container">

    <span class="eyebrow">
      ${escapeHtml(category)} Care
    </span>

    <h1>
      ${escapeHtml(category)} Guides
    </h1>

    <p>
      ${escapeHtml(description)}
    </p>

  </div>
</section>


<section class="section">
  <div class="container">

    <div class="article-grid">
      ${cards}
    </div>

  </div>
</section>
`;

  const html = pageLayout({
    title:
      `${category} Care Guides`,

    description,

    canonical:
      `${SITE_URL}/category/${categorySlug}/`,

    content
  });

  const directory =
    path.join(
      DIST_DIR,
      "category",
      categorySlug
    );

  ensureDir(
    directory
  );

  fs.writeFileSync(
    path.join(
      directory,
      "index.html"
    ),
    html,
    "utf8"
  );
}


/* =========================================================
   Simple Pages
   ========================================================= */

function createSimplePage(
  title,
  text,
  slug
) {
  const content = `
<section class="simple-page">
  <div class="container narrow-container">

    <h1>
      ${escapeHtml(title)}
    </h1>

    <div class="article-body">
      <p>
        ${escapeHtml(text)}
      </p>
    </div>

  </div>
</section>
`;

  const html = pageLayout({
    title,
    description:
      truncateText(
        text,
        160
      ),
    canonical:
      `${SITE_URL}/${slug}/`,
    content
  });

  const directory =
    path.join(
      DIST_DIR,
      slug
    );

  ensureDir(
    directory
  );

  fs.writeFileSync(
    path.join(
      directory,
      "index.html"
    ),
    html,
    "utf8"
  );
}


/* =========================================================
   Robots.txt
   ========================================================= */

function createRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  fs.writeFileSync(
    path.join(
      DIST_DIR,
      "robots.txt"
    ),
    robots,
    "utf8"
  );
}


/* =========================================================
   Sitemap
   ========================================================= */

function createSitemap(articles) {
  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/category/dogs/`,
    `${SITE_URL}/category/cats/`,
    `${SITE_URL}/about/`,
    `${SITE_URL}/privacy-policy/`,
    `${SITE_URL}/contact/`
  ];

  for (const article of articles) {
    urls.push(
      `${SITE_URL}/article/${article.slug}/`
    );
  }

  const entries =
    urls
      .map(
        (url) => `
  <url>
    <loc>${escapeHtml(url)}</loc>
  </url>`
      )
      .join("");

  const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  fs.writeFileSync(
    path.join(
      DIST_DIR,
      "sitemap.xml"
    ),
    sitemap,
    "utf8"
  );
}


/* =========================================================
   Build
   ========================================================= */

function build() {
  console.log(
    "Starting Virixoo build..."
  );

  /*
   * Load BOTH:
   *
   * 1. src/data/articles.json
   * 2. src/data/articles/**/*.json
   */
  const articles =
    loadArticles();

  /*
   * Validate before creating the site.
   *
   * If an ID or slug is duplicated,
   * the build stops instead of publishing
   * broken pages.
   */
  validateArticles(
    articles
  );

  /*
   * Validate links between articles.
   */
  validateInternalLinks(
    articles
  );

  /*
   * Start with a clean dist directory.
   */
  if (
    fs.existsSync(
      DIST_DIR
    )
  ) {
    fs.rmSync(
      DIST_DIR,
      {
        recursive: true,
        force: true
      }
    );
  }

  ensureDir(
    DIST_DIR
  );

  /*
   * Copy CSS, images and other public files.
   */
  copyPublicFiles();

  /*
   * Generate a machine-readable index
   * for debugging / future tooling.
   */
  createArticleIndex(
    articles
  );

  /*
   * Homepage
   */
  createHomePage(
    articles
  );

  /*
   * Individual article pages
   */
  articles.forEach(
    (article) => {
      createArticlePage(
        article,
        articles
      );
    }
  );

  /*
   * Main category pages
   */
  createCategoryPage(
    "Dogs",
    articles
  );

  createCategoryPage(
    "Cats",
    articles
  );

  /*
   * Static informational pages
   */
  createSimplePage(
    "About Virixoo",
    "Virixoo provides practical and easy-to-understand guides for dog and cat owners, covering nutrition, training, grooming, behavior, health, and everyday pet care.",
    "about"
  );

  createSimplePage(
    "Privacy Policy",
    "Virixoo respects your privacy. This page contains information about how Virixoo handles privacy and website usage.",
    "privacy-policy"
  );

  createSimplePage(
    "Contact",
    "For questions, corrections, or general inquiries, please contact the Virixoo team.",
    "contact"
  );

  /*
   * Search engine files
   */
  createRobots();

  createSitemap(
    articles
  );

  console.log(
    "Virixoo build completed successfully."
  );

  console.log(
    `Generated ${articles.length} article pages.`
  );
}


/* =========================================================
   Run Build
   ========================================================= */

try {
  build();
} catch (error) {
  console.error(
    "BUILD FAILED:"
  );

  console.error(
    error
  );

  process.exit(1);
}
