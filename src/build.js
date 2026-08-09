const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
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
      return `<p>${escapeHtml(paragraph).replace(
        /\n/g,
        "<br>"
      )}</p>`;
    })
    .join("\n");
}


function sanitizeArticleHtml(html) {
  return String(html)
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      ""
    )
    .replace(
      /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
      ""
    )
    .replace(
      /<object\b[^>]*>[\s\S]*?<\/object>/gi,
      ""
    )
    .replace(
      /<embed\b[^>]*>/gi,
      ""
    )
    .replace(
      /<form\b[^>]*>[\s\S]*?<\/form>/gi,
      ""
    )
    .replace(
      /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,
      ""
    )
    .replace(
      /javascript\s*:/gi,
      ""
    );
}


/* =========================================================
   URL / Image Helpers
   ========================================================= */

function articleUrl(article) {
  const slug =
    article.slug ||
    slugify(article.title);

  return `${SITE_URL}/article/${encodeURIComponent(
    slug
  )}/`;
}


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

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value.replace(/^\/+/, "")}`;
}


function absoluteImageUrl(image = "") {
  const normalized = normalizeImagePath(image);

  if (!normalized) {
    return DEFAULT_IMAGE;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  return `${SITE_URL}${normalized}`;
}


function imageExists(image = "") {
  const normalized =
    normalizeImagePath(image);

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

  if (!normalized.startsWith("/")) {
    return false;
  }

  const relativePath =
    normalized.replace(/^\/+/, "");

  const filePath =
    path.join(
      DIST_DIR,
      relativePath
    );

  return fs.existsSync(filePath);
}


/* =========================================================
   SEO Schema Helpers
   ========================================================= */

function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description:
      "Expert dog and cat care guides covering nutrition, training, grooming, behavior, breeds, and everyday pet care.",
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`
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
  const title =
    article.title ||
    "Pet Care Guide";

  const description =
    truncateText(
      article.summary ||
        "Expert pet care guide from Virixoo.",
      160
    );

  const canonical =
    articleUrl(article);

  const image =
    absoluteImageUrl(
      article.image || ""
    );

  const published =
    article.datePublished ||
    undefined;

  const modified =
    article.dateModified ||
    article.datePublished ||
    undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical
    },
    headline: title,
    description,
    image: [image],
    author: {
      "@type": "Person",
      name:
        article.author ||
        "Virixoo Editorial Team"
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`
    }
  };

  if (published) {
    schema.datePublished = published;
  }

  if (modified) {
    schema.dateModified = modified;
  }

  if (article.category) {
    schema.articleSection =
      article.category;
  }

  return schema;
}


function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(
      (item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      })
    )
  };
}


function schemaScript(schema) {
  return `
<script type="application/ld+json">
${safeJsonLd(schema)}
</script>
`;
}


function multipleSchemaScripts(schemas = []) {
  return schemas
    .filter(Boolean)
    .map(schemaScript)
    .join("\n");
}


/* =========================================================
   Article Cards
   ========================================================= */

function articleCard(article) {
  const slug =
    article.slug ||
    slugify(article.title);

  const url =
    `/article/${encodeURIComponent(slug)}/`;

  const title =
    escapeHtml(
      article.title ||
        "Pet Care Guide"
    );

  const imagePath =
    normalizeImagePath(
      article.image || ""
    );

  const image =
    escapeHtml(imagePath);

  const summary =
    escapeHtml(
      truncateText(
        article.summary || "",
        170
      )
    );

  const category =
    escapeHtml(
      article.category ||
        "Pet Care"
    );

  const alt =
    escapeHtml(
      article.alt ||
        article.imageAlt ||
        article.title ||
        "Virixoo pet care guide"
    );

  const pinterestUrl =
    `https://www.pinterest.com/pin/create/button/?` +
    `url=${encodeURIComponent(
      articleUrl(article)
    )}` +
    `&media=${encodeURIComponent(
      absoluteImageUrl(
        article.image || ""
      )
    )}` +
    `&description=${encodeURIComponent(
      article.title || ""
    )}`;

  return `
<article class="article-card">

  ${
    imagePath
      ? `
  <a
    class="card-image-link"
    href="${url}"
    aria-label="${title}"
  >
    <img
      src="${image}"
      alt="${alt}"
      loading="lazy"
      width="800"
      height="500"
    >
  </a>
  `
      : ""
  }

  <div class="category">
    ${category}
  </div>

  <h2>
    <a href="${url}">
      ${title}
    </a>
  </h2>

  <p>
    ${summary}
  </p>

  <div class="card-actions">

    <a
      class="read-more"
      href="${url}"
    >
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

</article>
`;
}


/* =========================================================
   Header + SEO
   ========================================================= */

function header(
  title,
  description,
  canonicalUrl = SITE_URL,
  options = {}
) {
  const safeTitle =
    truncateText(
      title ||
        `${SITE_NAME} - Pet Care Guides`,
      70
    );

  const safeDescription =
    truncateText(
      description ||
        "Expert dog and cat care guides from Virixoo.",
      160
    );

  const image =
    absoluteImageUrl(
      options.image || ""
    );

  const ogType =
    options.type ||
    "website";

  const schemas =
    options.schemas || [];

  return `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="robots"
    content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  >

  <meta
    name="theme-color"
    content="#2563eb"
  >

  <title>
    ${escapeHtml(safeTitle)}
  </title>

  <meta
    name="description"
    content="${escapeHtml(safeDescription)}"
  >

  <link
    rel="canonical"
    href="${escapeHtml(canonicalUrl)}"
  >

  <!-- Open Graph -->

  <meta
    property="og:type"
    content="${escapeHtml(ogType)}"
  >

  <meta
    property="og:site_name"
    content="${SITE_NAME}"
  >

  <meta
    property="og:title"
    content="${escapeHtml(safeTitle)}"
  >

  <meta
    property="og:description"
    content="${escapeHtml(safeDescription)}"
  >

  <meta
    property="og:url"
    content="${escapeHtml(canonicalUrl)}"
  >

  <meta
    property="og:image"
    content="${escapeHtml(image)}"
  >

  <meta
    property="og:image:alt"
    content="${escapeHtml(
      options.imageAlt ||
        safeTitle
    )}"
  >

  <!-- Twitter / X -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${escapeHtml(safeTitle)}"
  >

  <meta
    name="twitter:description"
    content="${escapeHtml(safeDescription)}"
  >

  <meta
    name="twitter:url"
    content="${escapeHtml(canonicalUrl)}"
  >

  <meta
    name="twitter:image"
    content="${escapeHtml(image)}"
  >

  <meta
    name="twitter:image:alt"
    content="${escapeHtml(
      options.imageAlt ||
        safeTitle
    )}"
  >

  ${multipleSchemaScripts(schemas)}

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

      <a href="/">
        Home
      </a>

      <a href="/dogs/">
        Dogs
      </a>

      <a href="/cats/">
        Cats
      </a>

      <a href="/about/">
        About
      </a>

    </nav>

  </div>

</header>

<main class="site-main">
`;
}


/* =========================================================
   Real Visitor Counter
   ========================================================= */

function statsBox() {
  return `
<div
  id="virixoo-stats"
  class="virixoo-stats"
  aria-label="Virixoo visitor statistics"
>
  <span class="stats-loading">
    👁 Loading...
  </span>
</div>

<script>
(function () {

  const statsElement =
    document.getElementById(
      "virixoo-stats"
    );

  if (!statsElement) {
    return;
  }

  function formatNumber(value) {

    const number =
      Number(value) || 0;

    if (number >= 1000000) {
      return (
        number / 1000000
      )
        .toFixed(1)
        .replace(/\\.0$/, "") +
        "m";
    }

    if (number >= 1000) {
      return (
        number / 1000
      )
        .toFixed(1)
        .replace(/\\.0$/, "") +
        "k";
    }

    return number.toLocaleString(
      "en-US"
    );
  }

  async function recordVisit() {

    try {

      await fetch(
        "/api/visit",
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            page:
              window.location.pathname
          })
        }
      );

    } catch (error) {

      console.warn(
        "Visit tracking failed:",
        error
      );

    }

  }

  async function loadStats() {

    try {

      const response =
        await fetch(
          "/api/stats",
          {
            method: "GET",
            cache: "no-store",
            credentials:
              "same-origin"
          }
        );

      if (!response.ok) {
        throw new Error(
          "Stats request failed"
        );
      }

      const data =
        await response.json();

      const today =
        data.today ??
        data.Today ??
        data.todayVisits ??
        0;

      const month =
        data.thisMonth ??
        data.month ??
        data.monthVisits ??
        0;

      const year =
        data.thisYear ??
        data.year ??
        data.yearVisits ??
        0;

      statsElement.innerHTML =
        '<span class="stats-icon">👁</span> ' +
        '<span>' +
        formatNumber(today) +
        ' d</span>' +
        '<span class="stats-separator">·</span>' +
        '<span>' +
        formatNumber(month) +
        ' m</span>' +
        '<span class="stats-separator">·</span>' +
        '<span>' +
        formatNumber(year) +
        ' y</span>';

    } catch (error) {

      console.warn(
        "Could not load visitor statistics:",
        error
      );

      statsElement.innerHTML = "";

    }

  }

  recordVisit()
    .then(
      loadStats
    )
    .catch(
      loadStats
    );

})();
</script>
`;
}


/* =========================================================
   Footer
   ========================================================= */

function footer() {
  return `
</main>

<footer class="site-footer">

  <nav
    class="footer-nav"
    aria-label="Footer navigation"
  >

    <a href="/">
      Home
    </a>

    <a href="/dogs/">
      Dogs
    </a>

    <a href="/cats/">
      Cats
    </a>

    <a href="/about/">
      About
    </a>

    <a href="/privacy-policy/">
      Privacy Policy
    </a>

    <a href="/contact/">
      Contact
    </a>

  </nav>

  ${statsBox()}

  <p class="copyright">
    © ${new Date().getFullYear()}
    Virixoo. All rights reserved.
  </p>

</footer>

</body>

</html>
`;
}


/* =========================================================
   Home Page
   ========================================================= */

function createHomePage(
  articles
) {
  const cards =
    articles
      .map(articleCard)
      .join("\n");

  const homeSchema =
    createWebSiteSchema();

  const organizationSchema =
    createOrganizationSchema();

  const html = `
${header(
  "Virixoo - Expert Dog & Cat Care Guides",
  "Expert dog and cat care guides covering nutrition, training, grooming, behavior, breeds, and everyday pet care.",
  SITE_URL + "/",
  {
    type: "website",
    schemas: [
      homeSchema,
      organizationSchema
    ]
  }
)}

<section class="hero-section">

  <h1>
    Expert Dog & Cat Care Guides
  </h1>

  <p>
    Practical and easy-to-understand
    guides for healthier,
    happier dogs and cats.
  </p>

</section>

<section
  class="articles-section"
  aria-labelledby="latest-guides"
>

  <h2 id="latest-guides">
    Latest Pet Care Guides
  </h2>

  <div class="articles-grid">
    ${cards}
  </div>

</section>

${footer()}
`;

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
   Article Page
   ========================================================= */

function createArticlePage(
  article
) {
  const slug =
    article.slug ||
    slugify(article.title);

  const articleDir =
    path.join(
      DIST_DIR,
      "article",
      slug
    );

  ensureDir(
    articleDir
  );

  const title =
    article.title ||
    "Pet Care Guide";

  const description =
    truncateText(
      article.summary ||
        "Expert pet care guide from Virixoo.",
      160
    );

  const imagePath =
    normalizeImagePath(
      article.image || ""
    );

  const imageUrl =
    absoluteImageUrl(
      article.image || ""
    );

  const alt =
    article.alt ||
    article.imageAlt ||
    title;

  const canonical =
    articleUrl(article);

  const category =
    article.category ||
    "Pet Care";

  const categorySlug =
    slugify(category);

  const pinterestUrl =
    `https://www.pinterest.com/pin/create/button/?` +
    `url=${encodeURIComponent(
      canonical
    )}` +
    `&media=${encodeURIComponent(
      imageUrl
    )}` +
    `&description=${encodeURIComponent(
      title
    )}`;

  const imageMarkup =
    imagePath
      ? `
<img
  class="article-hero"
  src="${escapeHtml(
    imagePath
  )}"
  alt="${escapeHtml(
    alt
  )}"
  width="1200"
  height="700"
  loading="eager"
  fetchpriority="high"
>
`
      : "";

  const articleSchema =
    createArticleSchema(
      article
    );

  const breadcrumbSchema =
    createBreadcrumbSchema([
      {
        name: "Home",
        url: `${SITE_URL}/`
      },
      {
        name: category,
        url: `${SITE_URL}/${categorySlug}/`
      },
      {
        name: title,
        url: canonical
      }
    ]);

  const html = `${header(
    `${title} | Virixoo`,
    description,
    canonical,
    {
      type: "article",
      image: article.image || "",
      imageAlt: alt,
      schemas: [
        articleSchema,
        breadcrumbSchema
      ]
    }
  )}

<article class="single-article">

  <div class="article-meta">

    <span>
      ${escapeHtml(
        category
      )}
    </span>

    <span>
      By ${escapeHtml(
        article.author ||
        "Virixoo Editorial Team"
      )}
    </span>

    ${
      article.datePublished
        ? `
    <span>•</span>

    <span>
      Published
      ${escapeHtml(
        article.datePublished
      )}
    </span>
    `
        : ""
    }

    ${
      article.dateModified
        ? `
    <span>•</span>

    <span>
      Updated
      ${escapeHtml(
        article.dateModified
      )}
    </span>
    `
        : ""
    }

  </div>

  <nav
    aria-label="Breadcrumb"
    class="article-breadcrumbs"
  >

    <a href="/">
      Home
    </a>

    <span aria-hidden="true">
      /
    </span>

    <a href="/${escapeHtml(
      categorySlug
    )}/">
      ${escapeHtml(
        category
      )}
    </a>

    <span aria-hidden="true">
      /
    </span>

    <span>
      ${escapeHtml(
        title
      )}
    </span>

  </nav>

  <h1>
    ${escapeHtml(title)}
  </h1>

  <a
    class="pinterest-btn"
    href="${pinterestUrl}"
    target="_blank"
    rel="noopener noreferrer"
  >
    📌 Share on Pinterest
  </a>

  ${imageMarkup}

  <div class="article-content">
    ${formatContent(
      article.content
    )}
  </div>

  <div class="article-share">

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
    path.join(
      articleDir,
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
  articles,
  category,
  slug
) {
  const filtered =
    articles.filter(
      (article) =>
        String(
          article.category || ""
        ).toLowerCase() ===
        category.toLowerCase()
    );

  const cards =
    filtered
      .map(articleCard)
      .join("\n");

  const canonical =
    `${SITE_URL}/${slug}/`;

  const breadcrumbSchema =
    createBreadcrumbSchema([
      {
        name: "Home",
        url: `${SITE_URL}/`
      },
      {
        name: `${category} Care Guides`,
        url: canonical
      }
    ]);

  const html = `${header(
    `${category} Care Guides | Virixoo`,
    `Expert ${category.toLowerCase()} care guides for responsible pet owners.`,
    canonical,
    {
      type: "website",
      schemas: [
        breadcrumbSchema
      ]
    }
  )}

<section class="category-page">

  <nav
    aria-label="Breadcrumb"
    class="article-breadcrumbs"
  >

    <a href="/">
      Home
    </a>

    <span aria-hidden="true">
      /
    </span>

    <span>
      ${escapeHtml(
        category
      )}
    </span>

  </nav>

  <h1>
    ${escapeHtml(
      category
    )} Care Guides
  </h1>

  <div class="articles-grid">
    ${cards}
  </div>

</section>

${footer()}
`;

  const categoryDir =
    path.join(
      DIST_DIR,
      slug
    );

  ensureDir(
    categoryDir
  );

  fs.writeFileSync(
    path.join(
      categoryDir,
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
  const canonical =
    `${SITE_URL}/${slug}/`;

  const description =
    truncateText(
      text,
      160
    );

  const breadcrumbSchema =
    createBreadcrumbSchema([
      {
        name: "Home",
        url: `${SITE_URL}/`
      },
      {
        name: title,
        url: canonical
      }
    ]);

  const html = `${header(
    `${title} | Virixoo`,
    description,
    canonical,
    {
      type: "website",
      schemas: [
        breadcrumbSchema
      ]
    }
  )}

<section class="simple-page">

  <nav
    aria-label="Breadcrumb"
    class="article-breadcrumbs"
  >

    <a href="/">
      Home
    </a>

    <span aria-hidden="true">
      /
    </span>

    <span>
      ${escapeHtml(
        title
      )}
    </span>

  </nav>

  <h1>
    ${escapeHtml(title)}
  </h1>

  <p>
    ${escapeHtml(text)}
  </p>

</section>

${footer()}
`;

  const pageDir =
    path.join(
      DIST_DIR,
      slug
    );

  ensureDir(
    pageDir
  );

  fs.writeFileSync(
    path.join(
      pageDir,
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

  const robots = `
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`.trim();

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

function createSitemap(
  articles
) {
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

  urls.push(`
<url>
  <loc>${SITE_URL}/privacy-policy/</loc>
</url>
`);

  urls.push(`
<url>
  <loc>${SITE_URL}/contact/</loc>
</url>
`);

  articles.forEach(
    (article) => {

      urls.push(`
<url>

  <loc>
    ${escapeHtml(
      articleUrl(article)
    )}
  </loc>

  ${
    article.dateModified
      ? `
  <lastmod>
    ${escapeHtml(
      article.dateModified
    )}
  </lastmod>
  `
      : ""
  }

</url>
`);

    }
  );

  const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>

<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

${urls.join("\n")}

</urlset>
`.trim();

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
   Copy Public Files
   ========================================================= */

function copyPublicFiles() {

  if (
    !fs.existsSync(
      PUBLIC_DIR
    )
  ) {
    return;
  }

  function copyDirectory(
    source,
    destination
  ) {

    ensureDir(
      destination
    );

    const entries =
      fs.readdirSync(
        source,
        {
          withFileTypes:
            true
        }
      );

    for (
      const entry of entries
    ) {

      const sourcePath =
        path.join(
          source,
          entry.name
        );

      const destinationPath =
        path.join(
          destination,
          entry.name
        );

      if (
        entry.isDirectory()
      ) {

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


/* =========================================================
   Validate Articles
   ========================================================= */

function validateArticles(
  articles
) {

  articles.forEach(
    (article, index) => {

      if (
        !article.title
      ) {
        throw new Error(
          `Article ${index + 1} is missing a title.`
        );
      }

      if (
        !article.slug
      ) {
        article.slug =
          slugify(
            article.title
          );
      }

      if (
        !article.content
      ) {
        throw new Error(
          `Article "${article.title}" is missing content.`
        );
      }

      if (
        article.image
      ) {
        article.image =
          normalizeImagePath(
            article.image
          );
      }

    }
  );
}


/* =========================================================
   Build
   ========================================================= */

function build() {

  console.log(
    "Starting Virixoo build..."
  );

  if (
    !fs.existsSync(
      DATA_FILE
    )
  ) {
    throw new Error(
      `articles.json not found: ${DATA_FILE}`
    );
  }

  const raw =
    fs.readFileSync(
      DATA_FILE,
      "utf8"
    );

  const data =
    JSON.parse(raw);

  if (
    !Array.isArray(
      data.articles
    )
  ) {
    throw new Error(
      "articles.json must contain an 'articles' array."
    );
  }

  const articles =
    data.articles;

  console.log(
    `Found ${articles.length} articles.`
  );

  validateArticles(
    articles
  );

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

  copyPublicFiles();

  articles.forEach(
    (article) => {

      if (
        article.image &&
        !imageExists(
          article.image
        )
      ) {

        console.warn(
          `WARNING: Image not found in public/: ${article.image}`
        );

      }

    }
  );

  createHomePage(
    articles
  );

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
