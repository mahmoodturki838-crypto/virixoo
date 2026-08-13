const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
const ARTICLES_DIR = path.join(ROOT, "src", "data", "articles");
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

const SITE_URL = "https://virixoo.com";
const SITE_NAME = "Virixoo";
const SITE_TAGLINE = "Happy Pets, Happy Life";
const DEFAULT_IMAGE_PATH = "/images/virixoo-default.svg";
const DEFAULT_IMAGE_URL = `${SITE_URL}${DEFAULT_IMAGE_PATH}`;

const BRAND_LOGO_PATH = "/images/brand/virixoo-logo.svg";
const HERO_PETS_PATH = "/images/home/hero-pets.webp";
const DOG_CARE_IMAGE_PATH = "/images/home/dog-care.webp";
const CAT_CARE_IMAGE_PATH = "/images/home/cat-care.webp";

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

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/`/g, "&#096;");
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
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

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

function normalizeCategory(value = "") {
  const category = String(value || "").trim().toLowerCase();
  if (category === "dog" || category === "dogs") return "Dogs";
  if (category === "cat" || category === "cats") return "Cats";
  return String(value || "").trim();
}

function articlePath(article) {
  return `/article/${encodeURIComponent(article.slug)}/`;
}

function articleUrl(article) {
  return `${SITE_URL}${articlePath(article)}`;
}

function categoryPath(category) {
  return `/${slugify(category)}/`;
}

function prettyDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function topicTokens(article) {
  const raw = [
    article.title,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const stop = new Set([
    "the","and","for","with","your","you","how","why","what","when","from",
    "this","that","dog","dogs","cat","cats","my","is","are","a","an","to",
    "of","in","on","at","so","much","common","guide","safe","signs","causes"
  ]);

  return new Set(
    raw
      .replace(/[^a-z0-9\s-]/g, " ")
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
        score:
          overlap * 10 +
          (sameCategory ? 5 : 0) +
          (Number(candidate.id) || 0) / 100000
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

function buildSearchText(article) {
  return [
    article.title,
    article.summary,
    article.category,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function formatContent(content = "") {
  const raw = String(content || "").trim();
  if (!raw) return "";

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
  if (!value) return "";

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
  if (!normalized) return false;

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("//")
  ) {
    return true;
  }

  const relative = normalized.replace(/^\/+/, "");
  return fs.existsSync(path.join(PUBLIC_DIR, relative));
}

function displayImagePath(image = "") {
  const normalized = normalizeImagePath(image);
  if (normalized && publicImageExists(normalized)) return normalized;
  return DEFAULT_IMAGE_PATH;
}

function staticImagePath(preferred = "", fallback = DEFAULT_IMAGE_PATH) {
  const normalized = normalizeImagePath(preferred);
  if (normalized && publicImageExists(normalized)) return normalized;

  const normalizedFallback = normalizeImagePath(fallback);
  if (normalizedFallback && publicImageExists(normalizedFallback)) {
    return normalizedFallback;
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
   Fallback Image
   ========================================================= */

function createDefaultImage() {
  const imageDir = path.join(DIST_DIR, "images");
  ensureDir(imageDir);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f5f2ff"/>
      <stop offset="100%" stop-color="#fff5e8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="700" fill="url(#bg)"/>
  <circle cx="600" cy="280" r="120" fill="#ffffff" opacity="0.92"/>
  <text x="600" y="315" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92">🐾</text>
  <text x="600" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#111a44">Virixoo</text>
  <text x="600" y="515" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#69708e">Happy Pets, Happy Life</text>
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

function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`
  };
}

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

  if (article.datePublished) schema.datePublished = article.datePublished;
  if (article.dateModified || article.datePublished) {
    schema.dateModified = article.dateModified || article.datePublished;
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
</script>`;
}

/* =========================================================
   Shared Layout
   ========================================================= */

function logoMarkup() {
  const logoExists = publicImageExists(BRAND_LOGO_PATH);

  if (logoExists) {
    return `
      <img class="brand-logo-image"
        src="${escapeHtml(BRAND_LOGO_PATH)}"
        alt="Virixoo"
        width="210"
        height="64"
        decoding="async">`;
  }

  return `
      <span class="brand-mark" aria-hidden="true">
        <span class="brand-heart">♡</span>
        <span class="brand-pets">🐶🐱</span>
      </span>
      <span class="brand-copy">
        <strong>Virixoo</strong>
        <small>${SITE_TAGLINE}</small>
      </span>`;
}

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
  const active = options.active || "";

  function navClass(key) {
    return active === key ? ' class="active"' : "";
  }

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
<meta name="theme-color" content="#ffffff">

<title>${escapeHtml(truncateText(title, 70))}</title>

<meta
  name="description"
  content="${escapeHtml(truncateText(description, 160))}"
>

<link
  rel="canonical"
  href="${escapeHtml(canonical)}"
>

<meta property="og:type" content="${escapeHtml(options.type || "website")}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(truncateText(description, 160))}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:site_name" content="${SITE_NAME}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(truncateText(description, 160))}">
<meta name="twitter:image" content="${escapeHtml(image)}">

${schemas.map(schemaScript).join("\n")}

<link rel="stylesheet" href="/css/style.css">
</head>

<body>

<a class="skip-link" href="#main-content">Skip to content</a>

<header class="site-header">
  <div class="site-header-inner">

    <a
      class="site-brand"
      href="/"
      aria-label="Virixoo Home"
    >
      ${logoMarkup()}
    </a>

    <button
      class="mobile-menu-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="main-navigation"
      aria-label="Open navigation"
    >
      <span></span><span></span><span></span>
    </button>

    <nav
      class="main-nav"
      id="main-navigation"
      aria-label="Main navigation"
    >
      <a${navClass("home")} href="/">Home</a>
      <a${navClass("dogs")} href="/dogs/"><span aria-hidden="true">🐾</span> Dogs</a>
      <a${navClass("cats")} href="/cats/"><span aria-hidden="true">🐾</span> Cats</a>

      <div class="nav-dropdown">
        <button
          class="nav-dropdown-toggle${active === "categories" ? " active" : ""}"
          type="button"
          aria-expanded="false"
        >
          Categories <span aria-hidden="true">⌄</span>
        </button>
        <div class="nav-dropdown-menu">
          <a href="/dogs/">Dog Care</a>
          <a href="/cats/">Cat Care</a>
          <a href="/categories/">All Categories</a>
        </div>
      </div>

      <a${navClass("about")} href="/about/">About Us</a>
      <a${navClass("contact")} href="/contact/">Contact</a>
    </nav>

    <div class="header-actions">
      <a
        class="header-search-icon"
        href="/search/"
        aria-label="Search Virixoo"
      >⌕</a>
      <a class="header-search-button" href="/search/">Search</a>
    </div>

  </div>
</header>

<main class="site-main" id="main-content">
`;
}

function footer() {
  return `
</main>

<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-trust-item">
      <span class="footer-trust-icon">♢</span>
      <div>
        <strong>Expert Content</strong>
        <span>Clear, useful pet care guides</span>
      </div>
    </div>

    <div class="footer-trust-item">
      <span class="footer-trust-icon">♡</span>
      <div>
        <strong>Pet First</strong>
        <span>Helpful guidance for everyday care</span>
      </div>
    </div>

    <div class="footer-trust-item">
      <span class="footer-trust-icon">✚</span>
      <div>
        <strong>Health Focused</strong>
        <span>Know when veterinary care matters</span>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="footer-brand">
      <strong>Virixoo</strong>
      <span>${SITE_TAGLINE}</span>
    </div>

    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/dogs/">Dogs</a>
      <a href="/cats/">Cats</a>
      <a href="/about/">About</a>
      <a href="/privacy-policy/">Privacy</a>
      <a href="/contact/">Contact</a>
    </nav>

    <p class="footer-disclaimer">
      © ${new Date().getFullYear()} Virixoo. Educational information only; not a substitute for veterinary care.
    </p>
  </div>
</footer>

<script>
(function () {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.getElementById("main-navigation");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });
  }

  document.querySelectorAll(".nav-dropdown-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      const parent = button.closest(".nav-dropdown");
      if (parent) parent.classList.toggle("is-open", !open);
    });
  });

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("is-open");
        const button = dropdown.querySelector(".nav-dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      }
    });
  });
})();
</script>

</body>
</html>`;
}

/* =========================================================
   Article Cards
   ========================================================= */

function articleCard(article, options = {}) {
  const url = articlePath(article);
  const image = displayImagePath(article.image || "");
  const alt =
    article.alt ||
    article.imageAlt ||
    article.title ||
    "Virixoo pet care guide";

  const pinterestUrl = pinterestShareUrl(article);
  const compact = options.compact === true;
  const headingTag = options.headingTag || "h2";
  const showSummary = options.showSummary !== false && !compact;
  const category = normalizeCategory(article.category);

  return `
<article
  class="article-card${compact ? " article-card-compact" : ""}"
  data-article-card
  data-search="${escapeAttribute(buildSearchText(article))}"
>
  <a
    class="card-image-link"
    href="${url}"
    aria-label="Read ${escapeHtml(article.title)}"
  >
    <img
      class="article-card-image"
      src="${escapeHtml(image)}"
      alt="${escapeHtml(alt)}"
      loading="lazy"
      decoding="async"
      width="800"
      height="500"
    >
  </a>

  <div class="article-card-body">
    <div class="card-topline">
      <a class="category-pill category-${slugify(category)}" href="${categoryPath(category)}">
        ${escapeHtml(category)}
      </a>
      <span class="reading-time">${readingTime(article.content)} min read</span>
    </div>

    <${headingTag}>
      <a href="${url}">${escapeHtml(article.title)}</a>
    </${headingTag}>

    ${showSummary ? `<p>${escapeHtml(truncateText(article.summary || "", 150))}</p>` : ""}

    <div class="article-card-actions">
      <a class="read-more" href="${url}" aria-label="Read ${escapeHtml(article.title)}">Read guide <span>→</span></a>
      ${options.showPinterest === false ? "" : `
      <a
        class="pinterest-button"
        href="${escapeHtml(pinterestUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Save ${escapeHtml(article.title)} on Pinterest"
      >Save</a>`}
    </div>
  </div>
</article>`;
}

/* =========================================================
   Home Page
   ========================================================= */

function createHomePage(articles) {
  const ordered = [...articles].sort(
    (a, b) => Number(b.id || 0) - Number(a.id || 0)
  );

  const dogs = ordered.filter((a) => normalizeCategory(a.category) === "Dogs");
  const cats = ordered.filter((a) => normalizeCategory(a.category) === "Cats");

  const dogsCount = dogs.length;
  const catsCount = cats.length;

  const seedFeatured = [];
  if (dogs[0]) seedFeatured.push(dogs[0]);
  if (cats[0]) seedFeatured.push(cats[0]);
  if (dogs[1]) seedFeatured.push(dogs[1]);
  if (cats[1]) seedFeatured.push(cats[1]);
  if (dogs[2]) seedFeatured.push(dogs[2]);
  if (cats[2]) seedFeatured.push(cats[2]);

  const featuredSlugs = new Set(seedFeatured.map((a) => a.slug));
  const discoveryPool = ordered.filter((a) => !featuredSlugs.has(a.slug));

  const heroImage = staticImagePath(
    HERO_PETS_PATH,
    dogs[0]?.image || cats[0]?.image || DEFAULT_IMAGE_PATH
  );

  const dogCareImage = staticImagePath(
    DOG_CARE_IMAGE_PATH,
    dogs[0]?.image || DEFAULT_IMAGE_PATH
  );

  const catCareImage = staticImagePath(
    CAT_CARE_IMAGE_PATH,
    cats[0]?.image || DEFAULT_IMAGE_PATH
  );

  const html = `
${header(
  "Virixoo | Expert Dog & Cat Care Guides",
  "Practical dog and cat care guides covering health, behavior, nutrition, grooming and training.",
  `${SITE_URL}/`,
  {
    active: "home",
    schemas: [createWebSiteSchema(), createOrganizationSchema()]
  }
)}

<section class="home-hero hero-reference-layout">
  <div class="hero-decor hero-decor-left" aria-hidden="true">🐾</div>
  <div class="hero-decor hero-decor-right" aria-hidden="true">🐾</div>

  <div class="hero-copy">
    <span class="hero-badge"><span aria-hidden="true">🐾</span> Trusted Pet Care Guides</span>

    <h1>
      Expert care for happy
      <span class="hero-cat-word">cats</span>
      &amp;
      <span class="hero-dog-word">dogs</span>
    </h1>

    <p>
      Practical guides, health tips, training advice and more.
      Everything you need for a happier, healthier pet.
    </p>

    <div class="hero-actions">
      <a class="primary-button" href="/dogs/">
        <span aria-hidden="true">🐾</span> Explore Dog Guides
      </a>
      <a class="secondary-button" href="/cats/">
        <span aria-hidden="true">🐾</span> Explore Cat Guides
      </a>
    </div>
  </div>

  <div class="hero-pets">
    <img
      src="${escapeHtml(heroImage)}"
      alt="Dog and cat representing Virixoo pet care guides"
      width="760"
      height="560"
      loading="eager"
      fetchpriority="high"
      decoding="async"
    >
  </div>

  <aside class="hero-stats" aria-label="Virixoo guide library">
    <div class="hero-stat-card">
      <span class="hero-stat-icon">▤</span>
      <div>
        <strong>${articles.length}+</strong>
        <span>Expert Guides</span>
        <small>Helpful pet care articles</small>
      </div>
    </div>

    <div class="hero-stat-card">
      <span class="hero-stat-icon">♟</span>
      <div>
        <strong>100%</strong>
        <span>Pet Focused</span>
        <small>Quality content for pets</small>
      </div>
    </div>
  </aside>
</section>

<section class="care-switchboard" aria-label="Browse care guides by pet">
  <a class="care-panel dog-care-panel" href="/dogs/">
    <img
      src="${escapeHtml(dogCareImage)}"
      alt="Dog care guides"
      width="520"
      height="300"
      loading="lazy"
      decoding="async"
    >
    <div class="care-panel-content">
      <span class="care-panel-icon">🐾</span>
      <div>
        <h2>Dog Care</h2>
        <p>Training, health, nutrition and behavior guides</p>
        <span class="care-panel-link">Browse Dog Articles <b>→</b></span>
      </div>
    </div>
  </a>

  <a class="care-panel cat-care-panel" href="/cats/">
    <div class="care-panel-content">
      <span class="care-panel-icon">🐾</span>
      <div>
        <h2>Cat Care</h2>
        <p>Health, nutrition, behavior and care guides</p>
        <span class="care-panel-link">Browse Cat Articles <b>→</b></span>
      </div>
    </div>
    <img
      src="${escapeHtml(catCareImage)}"
      alt="Cat care guides"
      width="520"
      height="300"
      loading="lazy"
      decoding="async"
    >
  </a>
</section>

<section class="articles-section featured-section" aria-labelledby="featured-guides">
  <div class="section-heading">
    <div>
      <span class="section-title-row">
        <span class="section-title-icon">★</span>
        <h2 id="featured-guides">Featured Guides</h2>
      </span>
      <p>Handpicked articles to help you care for your pets better</p>
    </div>
    <a class="section-link" href="/categories/">View all articles <span>→</span></a>
  </div>

  <div
    class="articles-grid featured-grid home-featured-grid"
    id="featured-grid"
    data-display-count="6"
  >
    ${seedFeatured
      .map((article) =>
        articleCard(article, {
          compact: true,
          headingTag: "h3",
          showPinterest: false
        })
      )
      .join("\n")}
  </div>
</section>

<section class="articles-section discovery-section" aria-labelledby="discover-guides">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Explore more</span>
      <h2 id="discover-guides">More Helpful Pet Guides</h2>
      <p>A fresh selection from Virixoo each time you visit.</p>
    </div>

    <button class="shuffle-button" id="shuffle-guides" type="button">
      Show different guides
    </button>
  </div>

  <div
    class="articles-grid"
    id="dynamic-article-grid"
    data-display-count="9"
  >
    ${discoveryPool
      .map((article) =>
        articleCard(article, {
          headingTag: "h3",
          showPinterest: false
        })
      )
      .join("\n")}
  </div>
</section>

<section class="home-editorial-band">
  <div>
    <span class="eyebrow">Why Virixoo</span>
    <h2>Practical pet care without unnecessary complexity</h2>
  </div>
  <p>
    Virixoo helps pet owners understand common situations, recognize warning signs
    and know when professional veterinary care may be appropriate.
  </p>
  <a href="/about/">About our approach <span>→</span></a>
</section>

<script>
(function () {
  const grid = document.getElementById("dynamic-article-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-article-card]"));
  const count = Math.min(
    Number(grid.dataset.displayCount || 9),
    cards.length
  );

  function randomScore() {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] / 4294967295;
    }
    return Math.random();
  }

  function shuffleAndShow() {
    const shuffled = cards
      .map((card) => ({ card, sort: randomScore() }))
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

  fs.writeFileSync(
    path.join(DIST_DIR, "index.html"),
    html,
    "utf8"
  );
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
  const category = normalizeCategory(article.category);
  const categorySlug = slugify(category);

  const schemas = [
    createArticleSchema(article),
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
    active: category === "Dogs" ? "dogs" : "cats",
    schemas
  }
)}

<article class="single-article">

  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span>›</span>
    <a href="/${categorySlug}/">${escapeHtml(category)}</a>
    <span>›</span>
    <span>${escapeHtml(article.title)}</span>
  </nav>

  <header class="article-header">
    <div class="article-meta">
      <a class="category-pill category-${categorySlug}" href="/${categorySlug}/">
        ${escapeHtml(category)}
      </a>
      <span>By ${escapeHtml(article.author || "Virixoo Editorial Team")}</span>
      <span>${readingTime(article.content)} min read</span>
      ${
        article.dateModified || article.datePublished
          ? `<span>Updated ${escapeHtml(prettyDate(article.dateModified || article.datePublished))}</span>`
          : ""
      }
    </div>

    <h1>${escapeHtml(article.title)}</h1>

    ${
      article.summary
        ? `<p class="article-summary">${escapeHtml(article.summary)}</p>`
        : ""
    }
  </header>

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
    decoding="async"
  >

  <div class="article-share">
    <a
      class="pinterest-button"
      href="${escapeHtml(pinterestUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Save ${escapeHtml(article.title)} on Pinterest"
    >
      Save on Pinterest
    </a>
  </div>

  <div class="article-content">
    ${formatContent(article.content)}
  </div>

  <aside class="editorial-box" aria-label="Editorial note">
    <strong>Virixoo Editorial Note</strong>
    <p>
      This guide is for general educational purposes. Pet symptoms can have
      different causes, so contact a veterinarian when signs are severe,
      persistent, worsening or otherwise concerning.
    </p>
  </aside>
</article>

${
  related.length
    ? `
<section class="articles-section related-section" aria-labelledby="related-guides">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Keep reading</span>
      <h2 id="related-guides">Related ${escapeHtml(category)} Guides</h2>
    </div>
    <a class="section-link" href="/${categorySlug}/">
      View all ${escapeHtml(category)} guides <span>→</span>
    </a>
  </div>

  <div class="articles-grid related-grid">
    ${related
      .map((item) =>
        articleCard(item, {
          compact: true,
          headingTag: "h3",
          showPinterest: false
        })
      )
      .join("\n")}
  </div>
</section>`
    : ""
}

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
  const normalizedCategory = normalizeCategory(category);

  const filtered = articles
    .filter(
      (article) =>
        normalizeCategory(article.category) === normalizedCategory
    )
    .sort(
      (a, b) => Number(b.id || 0) - Number(a.id || 0)
    );

  const description =
    normalizedCategory === "Dogs"
      ? "Browse practical dog care guides covering health, behavior, training, nutrition, grooming and everyday questions."
      : "Browse practical cat care guides covering health, behavior, nutrition, grooming, litter box issues and everyday questions.";

  const html = `
${header(
  `${normalizedCategory} Care Guides | Virixoo`,
  description,
  `${SITE_URL}/${slug}/`,
  {
    active: slug === "dogs" ? "dogs" : "cats",
    schemas: [
      createBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        {
          name: `${normalizedCategory} Care Guides`,
          url: `${SITE_URL}/${slug}/`
        }
      ])
    ]
  }
)}

<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span>›</span>
  <span>${escapeHtml(normalizedCategory)} Care Guides</span>
</nav>

<section class="category-header category-${slug}-header">
  <div>
    <span class="hero-badge">🐾 ${escapeHtml(normalizedCategory)} Care</span>
    <h1>${escapeHtml(normalizedCategory)} Care Guides</h1>
    <p>${escapeHtml(description)}</p>
  </div>

  <div class="category-count-card">
    <strong>${filtered.length}+</strong>
    <span>Helpful guides</span>
  </div>
</section>

<section class="articles-section">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Browse library</span>
      <h2>All ${escapeHtml(normalizedCategory)} Articles</h2>
    </div>

    <div class="article-filter">
      <label for="${slug}-filter">Filter articles</label>
      <input
        id="${slug}-filter"
        class="article-filter-input"
        type="search"
        placeholder="Search ${escapeHtml(normalizedCategory.toLowerCase())} guides"
        autocomplete="off"
      >
    </div>
  </div>

  <div class="articles-grid filterable-grid" id="${slug}-grid">
    ${filtered
      .map((article) =>
        articleCard(article, {
          headingTag: "h3",
          showPinterest: false
        })
      )
      .join("\n")}
  </div>

  <p class="no-results-message" id="${slug}-no-results" hidden>
    No matching guides found.
  </p>
</section>

<section class="editorial-note category-editorial-note">
  <h2>How to use these guides</h2>
  <p>
    Start with the guide that best matches your question. Virixoo helps you
    understand common causes, safe next steps and warning signs. For urgent,
    severe or persistent symptoms, seek veterinary care.
  </p>
</section>

<script>
(function () {
  const input = document.getElementById("${slug}-filter");
  const grid = document.getElementById("${slug}-grid");
  const empty = document.getElementById("${slug}-no-results");

  if (!input || !grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-article-card]"));

  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = card.getAttribute("data-search") || "";
      const match = !query || haystack.includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
  });
})();
</script>

${footer()}`;

  const dir = path.join(DIST_DIR, slug);
  ensureDir(dir);

  fs.writeFileSync(
    path.join(dir, "index.html"),
    html,
    "utf8"
  );
}

/* =========================================================
   Categories Page
   ========================================================= */

function createCategoriesPage(articles) {
  const dogs = articles.filter(
    (article) => normalizeCategory(article.category) === "Dogs"
  );

  const cats = articles.filter(
    (article) => normalizeCategory(article.category) === "Cats"
  );

  const html = `
${header(
  "Pet Care Categories | Virixoo",
  "Browse Virixoo dog and cat care categories and find practical guides for health, behavior, nutrition, training and everyday pet care.",
  `${SITE_URL}/categories/`,
  {
    active: "categories",
    schemas: [
      createBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Categories", url: `${SITE_URL}/categories/` }
      ])
    ]
  }
)}

<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span>›</span>
  <span>Categories</span>
</nav>

<section class="category-header categories-overview-header">
  <div>
    <span class="hero-badge">🐾 Explore Virixoo</span>
    <h1>Pet Care Categories</h1>
    <p>
      Choose dogs or cats to browse practical guides for health, behavior,
      nutrition, grooming, training and everyday care.
    </p>
  </div>
</section>

<section class="category-overview-grid">
  <a class="category-overview-card dogs-overview-card" href="/dogs/">
    <span class="category-overview-icon">🐕</span>
    <div>
      <h2>Dog Care</h2>
      <p>${dogs.length} guides</p>
      <span>Browse Dog Articles →</span>
    </div>
  </a>

  <a class="category-overview-card cats-overview-card" href="/cats/">
    <span class="category-overview-icon">🐈</span>
    <div>
      <h2>Cat Care</h2>
      <p>${cats.length} guides</p>
      <span>Browse Cat Articles →</span>
    </div>
  </a>
</section>

<section class="articles-section">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Latest guides</span>
      <h2>Recently Added Pet Care Articles</h2>
    </div>
  </div>

  <div class="articles-grid">
    ${[...articles]
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 9)
      .map((article) =>
        articleCard(article, {
          headingTag: "h3",
          showPinterest: false
        })
      )
      .join("\n")}
  </div>
</section>

${footer()}`;

  const dir = path.join(DIST_DIR, "categories");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

/* =========================================================
   Search Page
   ========================================================= */

function createSearchPage(articles) {
  const safeArticles = articles.map((article) => ({
    title: article.title,
    summary: article.summary || "",
    category: normalizeCategory(article.category),
    url: articlePath(article),
    image: displayImagePath(article.image || ""),
    readingTime: readingTime(article.content),
    search: buildSearchText(article)
  }));

  const html = `
${header(
  "Search Pet Care Guides | Virixoo",
  "Search Virixoo dog and cat care guides.",
  `${SITE_URL}/search/`
)}

<section class="search-page">
  <div class="search-page-header">
    <span class="hero-badge">⌕ Search Virixoo</span>
    <h1>Find the pet care guide you need</h1>
    <p>Search dog and cat health, behavior, nutrition, grooming and training guides.</p>
  </div>

  <form class="site-search-form" id="site-search-form" role="search">
    <label class="sr-only" for="site-search-input">Search Virixoo</label>
    <input
      id="site-search-input"
      type="search"
      placeholder="Try: dog coughing, cat hungry, nail trimming..."
      autocomplete="off"
      autofocus
    >
    <button type="submit">Search</button>
  </form>

  <p class="search-status" id="search-status">
    Start typing to search ${articles.length} guides.
  </p>

  <div class="search-results-grid" id="search-results"></div>
</section>

<script>
(function () {
  const articles = ${JSON.stringify(safeArticles)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")};

  const form = document.getElementById("site-search-form");
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");

  if (!form || !input || !results || !status) return;

  function escapeText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function render() {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      results.innerHTML = "";
      status.textContent = "Start typing to search " + articles.length + " guides.";
      return;
    }

    const terms = query.split(/\\s+/).filter(Boolean);

    const matches = articles
      .map(function (article) {
        let score = 0;
        terms.forEach(function (term) {
          if (article.title.toLowerCase().includes(term)) score += 5;
          if (article.search.includes(term)) score += 1;
        });
        return { article: article, score: score };
      })
      .filter(function (item) {
        return item.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 30);

    status.textContent =
      matches.length === 1
        ? "1 matching guide"
        : matches.length + " matching guides";

    results.innerHTML = matches
      .map(function (item) {
        const article = item.article;

        return (
          '<article class="search-result-card">' +
            '<a class="search-result-image" href="' + article.url + '">' +
              '<img src="' + escapeText(article.image) + '" alt="" loading="lazy" width="420" height="270">' +
            '</a>' +
            '<div>' +
              '<span class="category-pill category-' + article.category.toLowerCase() + '">' +
                escapeText(article.category) +
              '</span>' +
              '<h2><a href="' + article.url + '">' +
                escapeText(article.title) +
              '</a></h2>' +
              '<p>' + escapeText(article.summary) + '</p>' +
              '<span class="reading-time">' + article.readingTime + ' min read</span>' +
            '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  input.addEventListener("input", render);

  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q");
  if (initial) {
    input.value = initial;
    render();
  }
})();
</script>

${footer()}`;

  const dir = path.join(DIST_DIR, "search");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

/* =========================================================
   Simple Pages
   ========================================================= */

function createSimplePage(
  title,
  text,
  slug,
  active = ""
) {
  const dir = path.join(DIST_DIR, slug);
  ensureDir(dir);

  const html = `
${header(
  `${title} | Virixoo`,
  text,
  `${SITE_URL}/${slug}/`,
  { active }
)}

<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <span>›</span>
  <span>${escapeHtml(title)}</span>
</nav>

<article class="single-article simple-page">
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
  if (!fs.existsSync(source)) return;

  ensureDir(destination);

  const entries = fs.readdirSync(
    source,
    { withFileTypes: true }
  );

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

/* =========================================================
   Article Data Loading
   ========================================================= */

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) throw new Error("File is empty.");
    return JSON.parse(raw);
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

  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
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
  if (!fs.existsSync(directory)) return [];

  const results = [];
  const entries = fs.readdirSync(
    directory,
    { withFileTypes: true }
  );

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectJsonFiles(fullPath));
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

  if (fs.existsSync(DATA_FILE)) {
    const legacyData = readJsonFile(DATA_FILE);
    const legacyArticles = normalizeArticleFileData(
      legacyData,
      DATA_FILE
    );

    for (const article of legacyArticles) {
      articles.push({
        ...article,
        __sourceFile: path.relative(ROOT, DATA_FILE)
      });
    }
  }

  const articleFiles = collectJsonFiles(ARTICLES_DIR);

  for (const filePath of articleFiles) {
    const data = readJsonFile(filePath);
    const fileArticles = normalizeArticleFileData(data, filePath);

    for (const article of fileArticles) {
      articles.push({
        ...article,
        __sourceFile: path.relative(ROOT, filePath)
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
      throw new Error(`Missing title in ${source}.`);
    }

    if (!article.slug) {
      article.slug = slugify(article.title);
    }

    article.slug = String(article.slug).trim();

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
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
        `Duplicate article id "${article.id}" found in ${source} and ${ids.get(idKey)}.`
      );
    }

    ids.set(idKey, source);

    if (slugs.has(article.slug)) {
      throw new Error(
        `Duplicate slug "${article.slug}" found in ${source} and ${slugs.get(article.slug)}.`
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

    article.category = normalizeCategory(article.category);

    if (!["Cats", "Dogs"].includes(article.category)) {
      throw new Error(
        `Unsupported category "${article.category}" in ${source}. Use "Cats" or "Dogs".`
      );
    }

    if (article.image) {
      article.image = normalizeImagePath(article.image);
    }
  });
}

function validateInternalLinks(articles) {
  const knownSlugs = new Set(
    articles.map((article) =>
      String(article.slug || "").trim()
    )
  );

  const linkPattern =
    /href\s*=\s*["']\/article\/([^"'?#/]+)\/?["']/gi;

  const broken = [];

  for (const article of articles) {
    const content = String(article.content || "");
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const linkedSlug = decodeURIComponent(match[1]);

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
    generatedAt: new Date().toISOString(),
    totalArticles: articles.length,
    articles: articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      image: displayImagePath(article.image || ""),
      url: articlePath(article),
      readingTime: readingTime(article.content),
      source: article.__sourceFile || ""
    }))
  };

  fs.writeFileSync(
    path.join(DIST_DIR, "articles-index.json"),
    JSON.stringify(index, null, 2),
    "utf8"
  );
}

function createSitemap(articles) {
  const urls = [
    { loc: `${SITE_URL}/` },
    { loc: `${SITE_URL}/cats/` },
    { loc: `${SITE_URL}/dogs/` },
    { loc: `${SITE_URL}/categories/` },
    { loc: `${SITE_URL}/search/` },
    { loc: `${SITE_URL}/about/` },
    { loc: `${SITE_URL}/privacy-policy/` },
    { loc: `${SITE_URL}/contact/` }
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
        ? `<lastmod>${escapeHtml(item.lastmod)}</lastmod>`
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
  console.log(`Found ${articles.length} articles.`);

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

  createCategoriesPage(articles);
  createSearchPage(articles);

  createSimplePage(
    "About Virixoo",
    "Virixoo provides practical and easy-to-understand guides for dog and cat owners, covering nutrition, training, grooming, behavior and everyday pet care.",
    "about",
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
    "contact",
    "contact"
  );

  createRobots();
  createSitemap(articles);

  console.log("Virixoo build completed successfully.");
  console.log(`Generated ${articles.length} article pages.`);
}

try {
  build();
} catch (error) {
  console.error("BUILD FAILED:");
  console.error(error);
  process.exit(1);
}
