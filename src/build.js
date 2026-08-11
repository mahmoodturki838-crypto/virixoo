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

function normalizeImagePath(image = "") {
  const value = String(image || "").trim();

  if (!value) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(value)) {
    return value;
  }

  return value.startsWith("/")
    ? value
    : `/${value.replace(/^\/+/, "")}`;
}

function absoluteImageUrl(image = "") {
  const normalized = normalizeImagePath(image);

  if (!normalized) {
    return DEFAULT_IMAGE;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `${SITE_URL}${normalized}`;
}

function articleUrl(article) {
  return `${SITE_URL}/article/${encodeURIComponent(
    article.slug
  )}/`;
}

function sanitizeArticleHtml(html = "") {
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
        `<p>${escapeHtml(paragraph).replace(
          /\n/g,
          "<br>"
        )}</p>`
    )
    .join("\n");
}

function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function schemaScript(schema) {
  return `
<script type="application/ld+json">
${safeJsonLd(schema)}
</script>
`;
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

    description: truncateText(
      article.summary || "",
      160
    ),

    image: [
      absoluteImageUrl(
        article.image || ""
      )
    ],

    author: {
      "@type": "Organization",
      name:
        article.author ||
        "Virixoo Editorial Team"
    },

    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`
    },

    articleSection:
      article.category
  };

  if (article.datePublished) {
    schema.datePublished =
      article.datePublished;
  }

  if (
    article.dateModified ||
    article.datePublished
  ) {
    schema.dateModified =
      article.dateModified ||
      article.datePublished;
  }

  return schema;
}

function createBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement:
      items.map(
        (item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url
        })
      )
  };
}

function header(
  title,
  description,
  canonical,
  options = {}
) {
  const image =
    absoluteImageUrl(
      options.image || ""
    );

  const schemas =
    options.schemas || [];

  return `
<!doctype html>
<html lang="en">

<head>

<meta charset="utf-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<meta
  name="robots"
  content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
>

<title>
${escapeHtml(
  truncateText(title, 70)
)}
</title>

<meta
  name="description"
  content="${escapeHtml(
    truncateText(
      description,
      160
    )
  )}"
>

<link
  rel="canonical"
  href="${escapeHtml(
    canonical
  )}"
>

<meta
  property="og:type"
  content="${escapeHtml(
    options.type || "website"
  )}"
>

<meta
  property="og:title"
  content="${escapeHtml(
    title
  )}"
>

<meta
  property="og:description"
  content="${escapeHtml(
    truncateText(
      description,
      160
    )
  )}"
>

<meta
  property="og:url"
  content="${escapeHtml(
    canonical
  )}"
>

<meta
  property="og:image"
  content="${escapeHtml(
    image
  )}"
>

<meta
  name="twitter:card"
  content="summary_large_image"
>

<meta
  name="twitter:title"
  content="${escapeHtml(
    title
  )}"
>

<meta
  name="twitter:description"
  content="${escapeHtml(
    truncateText(
      description,
      160
    )
  )}"
>

<meta
  name="twitter:image"
  content="${escapeHtml(
    image
  )}"
>

${schemas
  .map(schemaScript)
  .join("\n")}

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

function footer() {
  return `
</main>

<footer class="site-footer">

  <div class="site-footer-inner">

    <p>
      © ${new Date().getFullYear()}
      Virixoo.
      Practical dog and cat care guides.
    </p>

    <nav>

      <a href="/about/">
        About
      </a>

      ·

      <a href="/privacy-policy/">
        Privacy
      </a>

      ·

      <a href="/contact/">
        Contact
      </a>

    </nav>

  </div>

</footer>

</body>

</html>
`;
}

function articleCard(article) {
  const url =
    `/article/${encodeURIComponent(
      article.slug
    )}/`;

  const image =
    normalizeImagePath(
      article.image || ""
    );

  const alt =
    article.alt ||
    article.title;

  return `
<article class="article-card">

  ${
    image
      ? `
  <a
    class="card-image-link"
    href="${url}"
  >
    <img
      src="${escapeHtml(
        image
      )}"
      alt="${escapeHtml(
        alt
      )}"
      loading="lazy"
      width="800"
      height="500"
    >
  </a>
  `
      : ""
  }

  <div class="category">
    ${escapeHtml(
      article.category
    )}
  </div>

  <h2>

    <a href="${url}">
      ${escapeHtml(
        article.title
      )}
    </a>

  </h2>

  <p>
    ${escapeHtml(
      truncateText(
        article.summary || "",
        170
      )
    )}
  </p>

  <a
    class="read-more"
    href="${url}"
  >
    Read More →
  </a>

</article>
`;
}

function createHomePage(
  articles
) {
  const ordered =
    [...articles].sort(
      (a, b) =>
        Number(b.id) -
        Number(a.id)
    );

  const cards =
    ordered
      .map(articleCard)
      .join("\n");

  const html = `
${header(
  "Virixoo - Expert Dog & Cat Care Guides",
  "Practical dog and cat care guides covering health, behavior, nutrition, grooming and everyday pet care.",
  `${SITE_URL}/`,
  {
    schemas: [
      createWebSiteSchema(),
      createOrganizationSchema()
    ]
  }
)}

<section class="hero-section">

  <h1>
    Expert Dog & Cat Care Guides
  </h1>

  <p>
    Practical, easy-to-understand
    guides for healthier,
    happier pets.
  </p>

</section>

<section class="articles-section">

  <h2>
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

function createArticlePage(
  article
) {
  const articleDir =
    path.join(
      DIST_DIR,
      "article",
      article.slug
    );

  ensureDir(
    articleDir
  );

  const canonical =
    articleUrl(
      article
    );

  const categorySlug =
    slugify(
      article.category
    );

  const schemas = [
    createArticleSchema(
      article
    ),

    createBreadcrumbSchema([
      {
        name: "Home",
        url: `${SITE_URL}/`
      },
      {
        name:
          article.category,
        url:
          `${SITE_URL}/${categorySlug}/`
      },
      {
        name:
          article.title,
        url:
          canonical
      }
    ])
  ];

  const image =
    normalizeImagePath(
      article.image || ""
    );

  const html = `
${header(
  `${article.title} | Virixoo`,
  article.summary ||
    "Expert pet care guide from Virixoo.",
  canonical,
  {
    type: "article",
    image:
      article.image || "",
    schemas
  }
)}

<article class="single-article">

  <nav
    class="breadcrumbs"
    aria-label="Breadcrumb"
  >

    <a href="/">
      Home
    </a>

    ›

    <a href="/${categorySlug}/">
      ${escapeHtml(
        article.category
      )}
    </a>

    ›

    <span>
      ${escapeHtml(
        article.title
      )}
    </span>

  </nav>

  <div class="article-meta">

    <span>
      ${escapeHtml(
        article.category
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
    <span>
      ${escapeHtml(
        article.datePublished
      )}
    </span>
    `
        : ""
    }

  </div>

  <h1>
    ${escapeHtml(
      article.title
    )}
  </h1>

  ${
    image
      ? `
  <img
    class="article-hero"
    src="${escapeHtml(
      image
    )}"
    alt="${escapeHtml(
      article.alt ||
      article.title
    )}"
    width="1200"
    height="700"
    loading="eager"
    fetchpriority="high"
  >
  `
      : ""
  }

  ${
    article.summary
      ? `
  <p class="article-summary">
    ${escapeHtml(
      article.summary
    )}
  </p>
  `
      : ""
  }

  <div class="article-content">

    ${formatContent(
      article.content
    )}

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

function createCategoryPage(
  articles,
  category,
  slug
) {
  const filtered =
    articles
      .filter(
        (article) =>
          String(
            article.category
          ).toLowerCase() ===
          category.toLowerCase()
      )
      .sort(
        (a, b) =>
          Number(b.id) -
          Number(a.id)
      );

  const html = `
${header(
  `${category} Care Guides | Virixoo`,
  `Practical ${category.toLowerCase()} care guides from Virixoo.`,
  `${SITE_URL}/${slug}/`
)}

<section class="category-header">

  <h1>
    ${escapeHtml(
      category
    )} Care Guides
  </h1>

  <p>
    Helpful guides for
    ${escapeHtml(
      category.toLowerCase()
    )}
    owners.
  </p>

</section>

<section class="articles-section">

  <div class="articles-grid">

    ${filtered
      .map(articleCard)
      .join("\n")}

  </div>

</section>

${footer()}
`;

  const dir =
    path.join(
      DIST_DIR,
      slug
    );

  ensureDir(
    dir
  );

  fs.writeFileSync(
    path.join(
      dir,
      "index.html"
    ),
    html,
    "utf8"
  );
}

function createSimplePage(
  title,
  text,
  slug
) {
  const dir =
    path.join(
      DIST_DIR,
      slug
    );

  ensureDir(
    dir
  );

  const html = `
${header(
  `${title} | Virixoo`,
  text,
  `${SITE_URL}/${slug}/`
)}

<article class="single-article">

  <h1>
    ${escapeHtml(
      title
    )}
  </h1>

  <p>
    ${escapeHtml(
      text
    )}
  </p>

</article>

${footer()}
`;

  fs.writeFileSync(
    path.join(
      dir,
      "index.html"
    ),
    html,
    "utf8"
  );
}

function copyDirectory(
  source,
  destination
) {
  if (
    !fs.existsSync(
      source
    )
  ) {
    return;
  }

  ensureDir(
    destination
  );

  const entries =
    fs.readdirSync(
      source,
      {
        withFileTypes: true
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
    } else if (
      entry.isFile()
    ) {
      fs.copyFileSync(
        sourcePath,
        destinationPath
      );
    }
  }
}

function readJsonFile(
  filePath
) {
  try {

    return JSON.parse(
      fs.readFileSync(
        filePath,
        "utf8"
      )
    );

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
    Array.isArray(
      data.articles
    )
  ) {
    return data.articles;
  }

  if (
    Array.isArray(
      data
    )
  ) {
    return data;
  }

  if (
    data &&
    typeof data === "object"
  ) {
    return [
      data
    ];
  }

  throw new Error(
    `Unsupported article JSON structure in ${path.relative(
      ROOT,
      filePath
    )}.`
  );
}

function collectJsonFiles(
  directory
) {
  if (
    !fs.existsSync(
      directory
    )
  ) {
    return [];
  }

  const results = [];

  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    );

  for (
    const entry of entries
  ) {
    const fullPath =
      path.join(
        directory,
        entry.name
      );

    if (
      entry.isDirectory()
    ) {

      results.push(
        ...collectJsonFiles(
          fullPath
        )
      );

    } else if (
      entry.isFile() &&
      entry.name
        .toLowerCase()
        .endsWith(".json") &&
      entry.name
        .toLowerCase() !==
        "index.json"
    ) {

      results.push(
        fullPath
      );

    }
  }

  return results.sort();
}

function loadArticles() {
  const articles = [];

  if (
    fs.existsSync(
      DATA_FILE
    )
  ) {

    const data =
      readJsonFile(
        DATA_FILE
      );

    const oldArticles =
      normalizeArticleFileData(
        data,
        DATA_FILE
      );

    for (
      const article of oldArticles
    ) {

      articles.push({
        ...article,

        __sourceFile:
          path.relative(
            ROOT,
            DATA_FILE
          )
      });

    }
  }

  // Reads JSON files recursively
  // from src/data/articles
  // including cats and dogs folders.

  const articleFiles =
    collectJsonFiles(
      ARTICLES_DIR
    );

  for (
    const filePath of articleFiles
  ) {

    const data =
      readJsonFile(
        filePath
      );

    const fileArticles =
      normalizeArticleFileData(
        data,
        filePath
      );

    for (
      const article of fileArticles
    ) {

      articles.push({
        ...article,

        __sourceFile:
          path.relative(
            ROOT,
            filePath
          )
      });

    }
  }

  if (
    articles.length === 0
  ) {

    throw new Error(
      "No articles found in src/data/articles.json or src/data/articles folders."
    );

  }

  return articles;
}

function validateArticles(
  articles
) {
  const ids =
    new Map();

  const slugs =
    new Map();

  for (
    const [
      index,
      article
    ]
    of articles.entries()
  ) {

    const source =
      article.__sourceFile ||
      `article #${index + 1}`;

    if (
      !article.title
    ) {

      throw new Error(
        `Missing title in ${source}.`
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

    article.slug =
      String(
        article.slug
      ).trim();

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        article.slug
      )
    ) {

      throw new Error(
        `Invalid slug "${article.slug}" in ${source}.`
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

    const idKey =
      String(
        article.id
      );

    if (
      ids.has(
        idKey
      )
    ) {

      throw new Error(
        `Duplicate article id "${article.id}" found in ${source} and ${ids.get(
          idKey
        )}.`
      );

    }

    if (
      slugs.has(
        article.slug
      )
    ) {

      throw new Error(
        `Duplicate slug "${article.slug}" found in ${source} and ${slugs.get(
          article.slug
        )}.`
      );

    }

    ids.set(
      idKey,
      source
    );

    slugs.set(
      article.slug,
      source
    );

    if (
      !article.content
    ) {

      throw new Error(
        `Article "${article.title}" is missing content in ${source}.`
      );

    }

    if (
      !article.category
    ) {

      throw new Error(
        `Article "${article.title}" is missing category in ${source}.`
      );

    }

    article.category =
      String(
        article.category
      ).trim();

    if (
      ![
        "Cats",
        "Dogs"
      ].includes(
        article.category
      )
    ) {

      throw new Error(
        `Unsupported category "${article.category}" in ${source}. Use "Cats" or "Dogs".`
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
}

function validateInternalLinks(
  articles
) {
  const knownSlugs =
    new Set(
      articles.map(
        (article) =>
          String(
            article.slug ||
            ""
          ).trim()
      )
    );

  const linkPattern =
    /href\s*=\s*["']\/article\/([^"'?#/]+)\/?["']/gi;

  const broken = [];

  for (
    const article of articles
  ) {

    const content =
      String(
        article.content ||
        ""
      );

    let match;

    while (
      (
        match =
          linkPattern.exec(
            content
          )
      ) !== null
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

        broken.push(
          `${article.slug} -> ${linkedSlug} (${article.__sourceFile || "unknown"})`
        );

      }
    }
  }

  if (
    broken.length
  ) {

    throw new Error(
      `Broken internal article links detected:\n- ${broken.join(
        "\n- "
      )}`
    );

  }
}

function createArticleIndex(
  articles
) {
  const index = {

    generatedAt:
      new Date()
        .toISOString(),

    totalArticles:
      articles.length,

    articles:
      articles.map(
        (article) => ({
          id:
            article.id,

          title:
            article.title,

          slug:
            article.slug,

          category:
            article.category,

          image:
            article.image || "",

          source:
            article.__sourceFile ||
            ""
        })
      )
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

function createSitemap(
  articles
) {
  const urls = [
    {
      loc:
        `${SITE_URL}/`
    },
    {
      loc:
        `${SITE_URL}/cats/`
    },
    {
      loc:
        `${SITE_URL}/dogs/`
    },
    {
      loc:
        `${SITE_URL}/about/`
    },
    {
      loc:
        `${SITE_URL}/privacy-policy/`
    },
    {
      loc:
        `${SITE_URL}/contact/`
    }
  ];

  for (
    const article of articles
  ) {

    urls.push({

      loc:
        articleUrl(
          article
        ),

      lastmod:
        article.dateModified ||
        article.datePublished ||
        ""

    });
  }

  const body =
    urls
      .map(
        (item) => {

          const lastmod =
            item.lastmod
              ? `<lastmod>${escapeHtml(
                  item.lastmod
                )}</lastmod>`
              : "";

          return `
<url>
  <loc>
    ${escapeHtml(
      item.loc
    )}
  </loc>
  ${lastmod}
</url>
`;

        }
      )
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
    path.join(
      DIST_DIR,
      "sitemap.xml"
    ),
    xml,
    "utf8"
  );
}

function createRobots() {
  fs.writeFileSync(
    path.join(
      DIST_DIR,
      "robots.txt"
    ),

    `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`,

    "utf8"
  );
}

function build() {
  console.log(
    "Starting Virixoo build..."
  );

  const articles =
    loadArticles();

  console.log(
    `Found ${articles.length} articles.`
  );

  validateArticles(
    articles
  );

  validateInternalLinks(
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

  copyDirectory(
    PUBLIC_DIR,
    DIST_DIR
  );

  createArticleIndex(
    articles
  );

  createHomePage(
    articles
  );

  for (
    const article of articles
  ) {

    createArticlePage(
      article
    );

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
