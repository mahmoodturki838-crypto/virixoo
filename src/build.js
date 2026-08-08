const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "src", "data", "articles.json");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");

const SITE_URL = "https://virixoo.com";
const SITE_NAME = "Virixoo";
const SITE_DESCRIPTION =
  "Trusted guides for dog and cat owners covering nutrition, care, training, grooming, behavior, breeds, and everyday pet wellness.";

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

function normalizeArticle(article, index) {
  const title = article.title || `Pet Care Guide ${index + 1}`;

  const slug =
    article.slug && article.slug.trim()
      ? slugify(article.slug)
      : slugify(title);

  const category =
    article.category === "Cats" ? "Cats" : "Dogs";

  const summary =
    article.summary ||
    `Helpful ${category.toLowerCase()} care information from Virixoo.`;

  const content =
    article.content ||
    "This article is currently being prepared.";

  const image =
    article.image ||
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1";

  const author =
    article.author || "Virixoo Editorial Team";

  const datePublished =
    article.datePublished || new Date().toISOString().slice(0, 10);

  const dateModified =
    article.dateModified || datePublished;

  return {
    ...article,
    id: article.id ?? index + 1,
    title,
    slug,
    category,
    summary,
    content,
    image,
    author,
    datePublished,
    dateModified
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDist() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }

  ensureDir(DIST);
}

function copyPublicFiles() {
  if (!fs.existsSync(PUBLIC)) return;

  fs.cpSync(PUBLIC, DIST, {
    recursive: true
  });
}

function articleUrl(article) {
  return `${SITE_URL}/articles/${article.slug}/`;
}

function pinterestUrl(article, url) {
  return (
    "https://www.pinterest.com/pin/create/button/?" +
    `url=${encodeURIComponent(url)}` +
    `&media=${encodeURIComponent(article.image)}` +
    `&description=${encodeURIComponent(
      `${article.title} - ${article.summary}`
    )}`
  );
}

function contentToHtml(content) {
  const escaped = escapeHtml(content);

  return escaped
    .split(/\n\s*\n/)
    .map(paragraph => {
      const text = paragraph.trim();

      if (!text) return "";

      if (text.startsWith("### ")) {
        return `<h3>${text.slice(4)}</h3>`;
      }

      if (text.startsWith("## ")) {
        return `<h2>${text.slice(3)}</h2>`;
      }

      if (text.startsWith("# ")) {
        return `<h2>${text.slice(2)}</h2>`;
      }

      return `<p>${text.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
}

function articleSchema(article, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: [article.image],
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Organization",
      name: article.author
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  };
}

function renderArticle(article, relatedArticles) {
  const url = articleUrl(article);
  const pinUrl = pinterestUrl(article, url);
  const contentHtml = contentToHtml(article.content);

  const related = relatedArticles
    .filter(item => item.slug !== article.slug)
    .filter(item => item.category === article.category)
    .slice(0, 4);

  const relatedHtml = related.length
    ? `
      <section class="related-section">
        <h2>Related ${escapeHtml(article.category)} Articles</h2>
        <div class="article-grid">
          ${related
            .map(item => {
              const itemUrl = articleUrl(item);

              return `
                <article class="card">
                  <a href="${itemUrl}" class="card-image-link">
                    <img
                      src="${escapeHtml(item.image)}"
                      alt="${escapeHtml(item.title)}"
                      loading="lazy"
                      width="800"
                      height="500"
                    >
                  </a>

                  <div class="card-body">
                    <div class="category">${escapeHtml(item.category)}</div>

                    <h3>
                      <a href="${itemUrl}">
                        ${escapeHtml(item.title)}
                      </a>
                    </h3>

                    <p>${escapeHtml(item.summary)}</p>

                    <a class="read-more" href="${itemUrl}">
                      Read More →
                    </a>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escapeHtml(article.title)} | ${SITE_NAME}</title>

  <meta
    name="description"
    content="${escapeHtml(article.summary)}"
  >

  <link rel="canonical" href="${url}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.summary)}">
  <meta property="og:image" content="${escapeHtml(article.image)}">
  <meta property="og:url" content="${url}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(article.summary)}">
  <meta name="twitter:image" content="${escapeHtml(article.image)}">

  <link rel="stylesheet" href="/css/style.css">

  <script type="application/ld+json">
${JSON.stringify(articleSchema(article, url), null, 2)}
  </script>
</head>

<body>

<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo">Virixoo</a>

    <nav>
      <a href="/">Home</a>
      <a href="/categories/dogs/">Dogs</a>
      <a href="/categories/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>
  </div>
</header>

<main class="container article-page">

  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span>›</span>
    <a href="/categories/${article.category.toLowerCase()}/">
      ${escapeHtml(article.category)}
    </a>
    <span>›</span>
    <span>${escapeHtml(article.title)}</span>
  </nav>

  <article>

    <div class="article-category">
      ${escapeHtml(article.category)}
    </div>

    <h1>${escapeHtml(article.title)}</h1>

    <div class="article-meta">
      <span>By ${escapeHtml(article.author)}</span>
      <span>•</span>
      <span>Published ${escapeHtml(article.datePublished)}</span>
      <span>•</span>
      <span>Updated ${escapeHtml(article.dateModified)}</span>
    </div>

    <img
      class="article-hero"
      src="${escapeHtml(article.image)}"
      alt="${escapeHtml(article.title)}"
      width="1200"
      height="700"
    >

    <div class="article-actions">

      <a
        class="pinterest-btn"
        href="${pinUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        📌 Share on Pinterest
      </a>

    </div>

    <div class="article-content">
      ${contentHtml}
    </div>

    <div class="article-bottom-share">

      <span>Enjoyed this guide?</span>

      <a
        class="pinterest-btn"
        href="${pinUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        📌 Share on Pinterest
      </a>

    </div>

  </article>

  ${relatedHtml}

</main>

<footer class="site-footer">
  <div class="container">

    <div class="footer-links">
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/terms/">Terms</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/editorial-policy/">Editorial Policy</a>
    </div>

    <p>
      © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    </p>

  </div>
</footer>

</body>
</html>`;
}

function renderHome(articles) {
  const cards = articles
    .map(article => {
      const url = articleUrl(article);
      const pinUrl = pinterestUrl(article, url);

      return `
        <article class="card">

          <a href="${url}" class="card-image-link">
            <img
              src="${escapeHtml(article.image)}"
              alt="${escapeHtml(article.title)}"
              loading="lazy"
              width="800"
              height="500"
            >
          </a>

          <div class="card-body">

            <div class="category">
              ${escapeHtml(article.category)}
            </div>

            <h2>
              <a href="${url}">
                ${escapeHtml(article.title)}
              </a>
            </h2>

            <p>
              ${escapeHtml(article.summary)}
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
                href="${pinUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >
                📌 Pinterest
              </a>

            </div>

          </div>

        </article>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Virixoo | Dog & Cat Care, Nutrition & Training Guides</title>

  <meta
    name="description"
    content="${SITE_DESCRIPTION}"
  >

  <link rel="canonical" href="${SITE_URL}/">

  <meta property="og:type" content="website">
  <meta property="og:title" content="Virixoo | Dog & Cat Care Guides">
  <meta property="og:description" content="${SITE_DESCRIPTION}">
  <meta property="og:url" content="${SITE_URL}/">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Virixoo | Dog & Cat Care Guides">
  <meta name="twitter:description" content="${SITE_DESCRIPTION}">

  <link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header class="site-header">

  <div class="container header-inner">

    <a href="/" class="logo">
      Virixoo
    </a>

    <nav>
      <a href="/">Home</a>
      <a href="/categories/dogs/">Dogs</a>
      <a href="/categories/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>

  </div>

</header>

<main class="container">

  <section class="hero">

    <h1>
      Expert Dog & Cat Care Guides
    </h1>

    <p>
      Practical guides for responsible pet owners covering
      nutrition, training, grooming, behavior, breeds, and everyday care.
    </p>

  </section>

  <section>

    <div class="section-heading">
      <h2>Latest Pet Care Guides</h2>
    </div>

    <div class="article-grid">
      ${cards}
    </div>

  </section>

</main>

<footer class="site-footer">

  <div class="container">

    <div class="footer-links">
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/terms/">Terms</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/editorial-policy/">Editorial Policy</a>
    </div>

    <p>
      © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    </p>

  </div>

</footer>

</body>
</html>`;
}

function renderCategory(category, articles) {
  const categoryArticles = articles.filter(
    article =>
      article.category.toLowerCase() === category.toLowerCase()
  );

  const cards = categoryArticles
    .map(article => {
      const url = articleUrl(article);

      return `
        <article class="card">

          <a href="${url}" class="card-image-link">
            <img
              src="${escapeHtml(article.image)}"
              alt="${escapeHtml(article.title)}"
              loading="lazy"
              width="800"
              height="500"
            >
          </a>

          <div class="card-body">

            <h2>
              <a href="${url}">
                ${escapeHtml(article.title)}
              </a>
            </h2>

            <p>
              ${escapeHtml(article.summary)}
            </p>

            <a
              class="read-more"
              href="${url}"
            >
              Read More →
            </a>

          </div>

        </article>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escapeHtml(category)} Care Guides | ${SITE_NAME}</title>

  <meta
    name="description"
    content="Helpful ${escapeHtml(category.toLowerCase())} care, nutrition, training, grooming, behavior and wellness guides from ${SITE_NAME}."
  >

  <link
    rel="canonical"
    href="${SITE_URL}/categories/${category.toLowerCase()}/"
  >

  <link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header class="site-header">

  <div class="container header-inner">

    <a href="/" class="logo">Virixoo</a>

    <nav>
      <a href="/">Home</a>
      <a href="/categories/dogs/">Dogs</a>
      <a href="/categories/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>

  </div>

</header>

<main class="container">

  <div class="breadcrumbs">
    <a href="/">Home</a>
    <span>›</span>
    <span>${escapeHtml(category)}</span>
  </div>

  <section class="hero">

    <h1>
      ${escapeHtml(category)} Care Guides
    </h1>

    <p>
      Practical information to help you provide better care,
      nutrition, training and everyday support for your ${escapeHtml(
        category.toLowerCase()
      )}.
    </p>

  </section>

  <div class="article-grid">
    ${cards}
  </div>

</main>

<footer class="site-footer">

  <div class="container">

    <div class="footer-links">
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/terms/">Terms</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/editorial-policy/">Editorial Policy</a>
    </div>

    <p>
      © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    </p>

  </div>

</footer>

</body>
</html>`;
}

function renderSimplePage(title, description, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escapeHtml(title)} | ${SITE_NAME}</title>

  <meta
    name="description"
    content="${escapeHtml(description)}"
  >

  <link rel="canonical" href="${SITE_URL}/">

  <link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header class="site-header">

  <div class="container header-inner">

    <a href="/" class="logo">Virixoo</a>

    <nav>
      <a href="/">Home</a>
      <a href="/categories/dogs/">Dogs</a>
      <a href="/categories/cats/">Cats</a>
      <a href="/about/">About</a>
    </nav>

  </div>

</header>

<main class="container static-page">

  <h1>${escapeHtml(title)}</h1>

  ${content}

</main>

<footer class="site-footer">

  <div class="container">

    <div class="footer-links">
      <a href="/about/">About</a>
      <a href="/contact/">Contact</a>
      <a href="/privacy-policy/">Privacy Policy</a>
      <a href="/terms/">Terms</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/editorial-policy/">Editorial Policy</a>
    </div>

    <p>
      © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
    </p>

  </div>

</footer>

</body>
</html>`;
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function generateSitemap(articles) {
  const urls = [
    {
      loc: `${SITE_URL}/`,
      lastmod: new Date().toISOString().slice(0, 10)
    },
    {
      loc: `${SITE_URL}/categories/dogs/`
    },
    {
      loc: `${SITE_URL}/categories/cats/`
    },
    {
      loc: `${SITE_URL}/about/`
    },
    {
      loc: `${SITE_URL}/contact/`
    },
    {
      loc: `${SITE_URL}/privacy-policy/`
    },
    {
      loc: `${SITE_URL}/terms/`
    },
    {
      loc: `${SITE_URL}/disclaimer/`
    },
    {
      loc: `${SITE_URL}/editorial-policy/`
    },
    ...articles.map(article => ({
      loc: articleUrl(article),
      lastmod: article.dateModified
    }))
  ];

  const body = urls
    .map(item => {
      return `
  <url>
    <loc>${escapeHtml(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${escapeHtml(item.lastmod)}</lastmod>` : ""}
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${body}
</urlset>`;
}

function generateStaticPages(articles) {
  writeFile(
    path.join(DIST, "index.html"),
    renderHome(articles)
  );

  for (const category of ["Dogs", "Cats"]) {
    writeFile(
      path.join(
        DIST,
        "categories",
        category.toLowerCase(),
        "index.html"
      ),
      renderCategory(category, articles)
    );
  }

  const pages = [
    {
      slug: "about",
      title: "About Virixoo",
      description:
        "Learn about Virixoo and our mission to help dog and cat owners.",
      content: `
        <p>
          Virixoo is an independent pet care website created to help
          dog and cat owners make better everyday care decisions.
        </p>

        <p>
          We cover nutrition, grooming, training, behavior, breeds,
          enrichment and practical pet care.
        </p>

        <p>
          Our editorial goal is to provide useful, clear and responsibly
          researched information for pet owners.
        </p>
      `
    },
    {
      slug: "contact",
      title: "Contact Virixoo",
      description:
        "Contact the Virixoo editorial team.",
      content: `
        <p>
          For general questions, corrections, suggestions or editorial
          inquiries, please contact the Virixoo team.
        </p>
      `
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      description:
        "Virixoo privacy policy.",
      content: `
        <p>
          Virixoo respects your privacy. This page explains how information
          may be collected and used when you visit our website.
        </p>

        <p>
          We may use analytics, advertising and essential website technologies
          to operate and improve the website.
        </p>
      `
    },
    {
      slug: "terms",
      title: "Terms of Use",
      description:
        "Terms governing the use of Virixoo.",
      content: `
        <p>
          By using Virixoo, you agree to use the website responsibly and
          understand that the information provided is for general educational
          purposes.
        </p>
      `
    },
    {
      slug: "disclaimer",
      title: "Pet Care Disclaimer",
      description:
        "Virixoo pet care disclaimer.",
      content: `
        <p>
          Virixoo provides general educational information about dogs and
          cats. Our content is not a substitute for professional veterinary
          diagnosis, treatment or medical advice.
        </p>

        <p>
          If your pet is sick, injured or showing concerning symptoms,
          consult a qualified veterinarian.
        </p>
      `
    },
    {
      slug: "editorial-policy",
      title: "Editorial Policy",
      description:
        "Virixoo editorial and content quality policy.",
      content: `
        <p>
          Virixoo aims to publish useful, accurate and clearly written
          information for dog and cat owners.
        </p>

        <p>
          Content may be researched, reviewed and updated when new information
          becomes available.
        </p>

        <p>
          We aim to distinguish educational information from professional
          veterinary advice and encourage readers to consult qualified
          professionals for health concerns.
        </p>
      `
    }
  ];

  for (const page of pages) {
    writeFile(
      path.join(DIST, page.slug, "index.html"),
      renderSimplePage(
        page.title,
        page.description,
        page.content
      )
    );
  }
}

function build() {
  console.log("Building Virixoo...");

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(
      `articles.json not found at: ${DATA_FILE}`
    );
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.articles)) {
    throw new Error(
      'articles.json must contain an "articles" array.'
    );
  }

  const articles = data.articles.map(normalizeArticle);

  cleanDist();
  copyPublicFiles();

  generateStaticPages(articles);

  for (const article of articles) {
    const filePath = path.join(
      DIST,
      "articles",
      article.slug,
      "index.html"
    );

    writeFile(
      filePath,
      renderArticle(article, articles)
    );
  }

  writeFile(
    path.join(DIST, "sitemap.xml"),
    generateSitemap(articles)
  );

  writeFile(
    path.join(DIST, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
  );

  console.log(
    `Build complete: ${articles.length} article(s) generated.`
  );
}

try {
  build();
} catch (error) {
  console.error("Build failed:");
  console.error(error);
  process.exit(1);
}
