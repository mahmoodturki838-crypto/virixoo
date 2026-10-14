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
const EDITORIAL_TEAM_NAME = "Virixoo Editorial Team";
const DEFAULT_IMAGE_PATH = "/images/virixoo-default.svg";
const DEFAULT_IMAGE_URL = `${SITE_URL}${DEFAULT_IMAGE_PATH}`;

// Archive rendering limits: optimized for crawler performance & smaller DOM footprint.
const HOME_FEATURED_COUNT = 6;
const HOME_DISCOVERY_COUNT = 12;
const CATEGORY_PAGE_SIZE = 30;

// Virixoo Growth Engine V1
const RELATED_ARTICLE_LIMIT = 6;
const RELATED_MIN_SCORE = 0.30;
const MIN_TOPIC_HUB_ARTICLES = 4;
const TOPIC_PAGE_SIZE = 24;
const RECENTLY_UPDATED_COUNT = 36;
const CANNIBALIZATION_WARNING_SCORE = 0.56;

const BRAND_LOGO_PATH = "/images/virixoo-logo.webp";
const HERO_PETS_PATH = "/images/virixoo-hero-dog-cat.webp";
const DOG_CARE_IMAGE_PATH = "/images/home/dog-care.webp";
const CAT_CARE_IMAGE_PATH = "/images/home/cat-care.webp";

/* =========================================================
   Clean Inline SVG Icons (Replaces Unicode/Emoji bloat)
   ========================================================= */

const ICONS = {
  paw: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-0.15em;display:inline-block;"><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="12" cy="5.5" r="2.2"/><circle cx="16.5" cy="7.5" r="2.2"/><circle cx="5.5" cy="12" r="2"/><path d="M12 10.5c-3.2 0-5.8 2.4-6.3 5.5-.3 1.9 1.2 3.5 3.1 3.5 1.1 0 2.1-.4 3.2-.4s2.1.4 3.2.4c1.9 0 3.4-1.6 3.1-3.5-.5-3.1-3.1-5.5-6.3-5.5z"/></svg>`,
  chevronDown: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.12em;display:inline-block;"><polyline points="6 9 12 15 18 9"/></svg>`,
  search: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.18em;display:inline-block;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  book: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  shieldCheck: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  star: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-0.15em;display:inline-block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  compass: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  heart: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  plusCircle: `<svg class="ui-icon" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
};

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

function articleFreshnessTimestamp(article) {
  const candidates = [article.dateModified, article.datePublished];

  for (const value of candidates) {
    const raw = String(value || "").trim();
    if (!raw) continue;
    const timestamp = new Date(raw).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  const numericId = Number(article.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

// Deterministic hash to prevent alphabetical batch clustering when dates tie
function stableArticleHash(slug = "") {
  let hash = 2166136261;
  const str = String(slug);
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function compareArticlesByFreshness(a, b) {
  const dateDelta = articleFreshnessTimestamp(b) - articleFreshnessTimestamp(a);
  if (dateDelta !== 0) return dateDelta;
  return stableArticleHash(b.slug) - stableArticleHash(a.slug);
}

function sortArticlesByFreshness(articles = []) {
  return [...articles].sort(compareArticlesByFreshness);
}

function normalizedSitemapDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function latestArticleDate(articles = []) {
  let latest = 0;
  let latestValue = "";

  for (const article of articles) {
    const raw = String(article.dateModified || article.datePublished || "").trim();
    if (!raw) continue;
    const timestamp = new Date(raw).getTime();
    if (!Number.isNaN(timestamp) && timestamp > latest) {
      latest = timestamp;
      latestValue = raw;
    }
  }

  return normalizedSitemapDate(latestValue);
}

function topicHubPath(category, topic, pageNumber = 1) {
  const base = `/${slugify(normalizeCategory(category))}/${slugify(normalizeTopic(topic))}/`;
  return pageNumber <= 1 ? base : `${base}page/${pageNumber}/`;
}

function topicHubArticleCount(article, allArticles = []) {
  const category = normalizeCategory(article.category);
  const topic = articleTopic(article);

  return allArticles.filter(
    (candidate) =>
      normalizeCategory(candidate.category) === category &&
      articleTopic(candidate) === topic
  ).length;
}

function hasTopicHub(article, allArticles = []) {
  return topicHubArticleCount(article, allArticles) >= MIN_TOPIC_HUB_ARTICLES;
}

function keywordTokens(value = "") {
  const stop = new Set([
    "the","and","for","with","your","you","how","why","what","when","from",
    "this","that","dog","dogs","cat","cats","my","is","are","a","an","to",
    "of","in","on","at","so","much","common","guide","guides","safe","signs",
    "causes","cause","help","tips","explained","understanding","pet","pets","does",
    "can","should","its","it","more","about","after","before","into","without"
  ]);

  return new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .map((word) => word.replace(/^-+|-+$/g, ""))
      .filter((word) => word.length > 2 && !stop.has(word))
  );
}

function topicTokens(article) {
  return keywordTokens([
    article.title,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : []),
    article.summary
  ]
    .filter(Boolean)
    .join(" "));
}

function tokenSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union ? intersection / union : 0;
}

function articleIntentSimilarity(articleA, articleB) {
  const allA = topicTokens(articleA);
  const allB = topicTokens(articleB);
  const primaryA = keywordTokens(articleA.primaryKeyword || articleA.title || "");
  const primaryB = keywordTokens(articleB.primaryKeyword || articleB.title || "");
  const titleA = keywordTokens(articleA.title || "");
  const titleB = keywordTokens(articleB.title || "");

  const overall = tokenSimilarity(allA, allB);
  const primary = tokenSimilarity(primaryA, primaryB);
  const title = tokenSimilarity(titleA, titleB);
  const sameTopic = articleTopic(articleA) === articleTopic(articleB) ? 1 : 0;

  return Math.min(1, overall * 0.42 + primary * 0.33 + title * 0.17 + sameTopic * 0.08);
}

// Intent-aware related articles: same pet category, strong topical overlap, no random filler.
function relatedArticles(article, allArticles, limit = RELATED_ARTICLE_LIMIT) {
  const category = normalizeCategory(article.category);

  return allArticles
    .filter(
      (candidate) =>
        candidate.slug !== article.slug &&
        normalizeCategory(candidate.category) === category
    )
    .map((candidate) => ({
      candidate,
      score: articleIntentSimilarity(article, candidate),
      sameTopic: articleTopic(candidate) === articleTopic(article)
    }))
    .filter((item) => item.score >= RELATED_MIN_SCORE || (item.sameTopic && item.score >= 0.22))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return compareArticlesByFreshness(a.candidate, b.candidate);
    })
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
    article.topic,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeTopic(value = "") {
  const topic = String(value || "").trim();
  if (!topic) return "";
  return topic
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function articleTopic(article) {
  const explicit = normalizeTopic(article.topic || article.subcategory || "");
  if (explicit) return explicit;

  const haystack = [
    article.title,
    article.summary,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/vomit|diarrhea|cough|limp|itch|scratch|skin|appetite|eating|drinking|water|urine|poop|stool|constipation|pain|fever|breath|breathing|hair loss|weight loss|sick|illness|health|symptom|vet|veterinar/.test(haystack)) {
    return "Health";
  }

  if (/train|training|leash|litter train|command|recall|bite inhibition/.test(haystack)) {
    return "Training";
  }

  if (/food|feeding|diet|nutrition|treat|meal/.test(haystack)) {
    return "Nutrition";
  }

  if (/groom|brush|nail|bath|coat|teeth|dental/.test(haystack)) {
    return "Grooming";
  }

  return "Behavior";
}

function isHealthArticle(article) {
  return articleTopic(article) === "Health";
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];

  return sources
    .map((source) => {
      if (typeof source === "string") {
        return { title: source.trim(), url: "" };
      }

      if (source && typeof source === "object") {
        return {
          title: String(source.title || source.name || "").trim(),
          url: String(source.url || "").trim(),
          publisher: String(source.publisher || source.organization || "").trim()
        };
      }

      return null;
    })
    .filter((source) => source && source.title);
}

function renderSources(article) {
  const sources = normalizeSources(article.sources);
  if (!sources.length) return "";

  return `
  <section class="article-sources" aria-labelledby="article-sources-heading">
    <h2 id="article-sources-heading">Sources &amp; References</h2>
    <ul>
      ${sources
        .map((source) => {
          const label = source.publisher
            ? `${escapeHtml(source.title)} &mdash; ${escapeHtml(source.publisher)}`
            : escapeHtml(source.title);

          if (!source.url) return `<li>${label}</li>`;

          return `<li><a href="${escapeAttribute(source.url)}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
        })
        .join("\n")}
    </ul>
  </section>`;
}

function normalizeFaq(faq) {
  if (!Array.isArray(faq)) return [];

  return faq
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = String(item.question || item.q || "").trim();
      const answer = String(item.answer || item.a || "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean);
}

function createFaqSchema(article) {
  const faq = normalizeFaq(article.faq);
  if (!faq.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(item.answer)
      }
    }))
  };
}

function renderFaq(article) {
  const faq = normalizeFaq(article.faq);
  if (!faq.length) return "";

  return `
  <section class="article-faq" aria-labelledby="article-faq-heading">
    <h2 id="article-faq-heading">Frequently Asked Questions</h2>
    ${faq
      .map(
        (item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.question)}</summary>
        <div>${formatContent(item.answer)}</div>
      </details>`
      )
      .join("\n")}
  </section>`;
}

function hasQuickAnswerInContent(article) {
  const raw = String(article.content || "").toLowerCase();

  return (
    /(^|\n)\s*#{1,6}\s*quick\s+answer\b/m.test(raw) ||
    /<h[1-6][^>]*>\s*quick\s+answer\s*<\/h[1-6]>/i.test(raw)
  );
}

function renderArticleDates(article) {
  const published = String(article.datePublished || "").trim();
  const modified = String(article.dateModified || "").trim();

  const parts = [];

  if (published) {
    parts.push(
      `<span>Published <time datetime="${escapeAttribute(published)}">${escapeHtml(prettyDate(published))}</time></span>`
    );
  }

  if (modified && modified !== published) {
    parts.push(
      `<span>Updated <time datetime="${escapeAttribute(modified)}">${escapeHtml(prettyDate(modified))}</time></span>`
    );
  }

  return parts.join("\n      ");
}

function renderEditorialNote(article) {
  if (isHealthArticle(article)) {
    return `
  <aside class="editorial-box editorial-box-health" aria-label="Health information note">
    <strong>Virixoo Health Information Note</strong>
    <p>
      This guide is for general educational purposes and is not a diagnosis.
      Symptoms can have different causes. Contact a veterinarian when signs are
      severe, persistent, worsening, unusual, or whenever you are concerned about
      your pet. <a href="/editorial-policy/">Read our editorial policy</a>.
    </p>
  </aside>`;
  }

  return `
  <aside class="editorial-box" aria-label="Editorial note">
    <strong>Virixoo Editorial Note</strong>
    <p>
      This guide provides general educational information for pet owners.
      Individual pets can behave differently, so use the advice as practical
      guidance rather than a one-size-fits-all rule.
      <a href="/editorial-policy/">Read our editorial policy</a>.
    </p>
  </aside>`;
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
   URL / Image Helpers & AI Prompt Alt-Text Sanitizer
   ========================================================= */

const AI_PROMPT_CLEANUP_RULES = [
  /,?\s*shown non-graphically\b/gi,
  /,?\s*non-graphically\b/gi,
  /\bclose view of\s+/gi,
  /\bclose-up view of\s+/gi,
  /\bwide shot of\s+/gi,
  /,?\s*while (?:an|its|the) owner (?:calmly|gently|quietly|carefully)[^.,;]*/gi,
  /,?\s*with (?:an|its|the) owner (?:calmly|gently|quietly|carefully)[^.,;]*/gi,
  /,?\s*in a (?:bright|clean|modern|cozy|well-lit|softly lit) (?:room|living room|home|kitchen|vet clinic|setting)\b/gi,
  /\b(?:calmly|gently|briefly|quietly)\s+(?=(?:licking|sniffing|resting|sitting|looking|checking|inspecting|observing))/gi,
  /,?\s*photorealistic\b/gi,
  /,?\s*high quality photo\b/gi,
  /,?\s*natural lighting\b/gi
];

function cleanImageAlt(article) {
  let raw = String(article.alt || article.imageAlt || "").trim();

  for (const rule of AI_PROMPT_CLEANUP_RULES) {
    raw = raw.replace(rule, "");
  }

  raw = raw
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;])/g, "$1")
    .replace(/[.,;:\s-]+$/g, "")
    .trim();

  if (raw) {
    raw = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  const stillLooksLikePrompt = /owner|comforting|redirected|observing from a distance|preparing to/i.test(raw);

  if (!raw || raw.length > 110 || raw.length < 12 || stillLooksLikePrompt) {
    const category = normalizeCategory(article.category) === "Cats" ? "Cat" : "Dog";
    const baseTopic = String(article.primaryKeyword || article.title || "")
      .split(":")[0]
      .split("?")[0]
      .trim();

    return baseTopic
      ? `${baseTopic.charAt(0).toUpperCase() + baseTopic.slice(1)} (${category} Care Guide)`
      : "Virixoo pet care guide";
  }

  return raw;
}

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

function pickExistingArticleImage(articles = [], fallback = DEFAULT_IMAGE_PATH) {
  for (const article of articles) {
    const image = normalizeImagePath(article && article.image ? article.image : "");
    if (image && publicImageExists(image)) return image;
  }
  return staticImagePath(fallback, DEFAULT_IMAGE_PATH);
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

/* =========================================================
   Responsive Image Optimization (Netlify Image CDN)
   ========================================================= */

function canUseNetlifyImageCdn(image = "") {
  const normalized = normalizeImagePath(image);
  if (!normalized) return false;
  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("//")) return false;
  return !/\.svg(?:$|[?#])/i.test(normalized);
}

function netlifyImageUrl(image = "", width = 0, quality = 72) {
  const normalized = displayImagePath(image);
  if (!canUseNetlifyImageCdn(normalized)) return normalized;

  const safeWidth = Math.max(1, Math.round(Number(width) || 960));
  const safeQuality = Math.min(100, Math.max(1, Math.round(Number(quality) || 72)));

  return `/.netlify/images?url=${encodeURIComponent(normalized)}&w=${safeWidth}&q=${safeQuality}`;
}

function responsiveImageSrcset(image = "", widths = [480, 720, 960, 1200], quality = 72) {
  const normalized = displayImagePath(image);
  if (!canUseNetlifyImageCdn(normalized)) return "";

  return widths
    .map((width) => `${netlifyImageUrl(normalized, width, quality)}${width}w`)
    .join(", ");
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
  <text x="600" y="315" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92">&#128062;</text>
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
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${BRAND_LOGO_PATH}`
    }
  };
}

function createWebPageSchema(title, description, url, type = "WebPage") {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    name: title,
    description: truncateText(description, 200),
    url,
    isPartOf: {
      "@id": `${SITE_URL}/#website`
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`
    }
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
  const keywords = [
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

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
      "@id": `${SITE_URL}/editorial-team/#organization`,
      name: article.author || EDITORIAL_TEAM_NAME,
      url: `${SITE_URL}/editorial-team/`
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${BRAND_LOGO_PATH}`
      }
    },
    isPartOf: {
      "@id": `${SITE_URL}/#website`
    },
    articleSection: articleTopic(article),
    inLanguage: "en"
  };

  if (keywords.length) schema.keywords = keywords.join(", ");
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
  if (publicImageExists(BRAND_LOGO_PATH)) {
    const logoSrc = netlifyImageUrl(BRAND_LOGO_PATH, 320, 82);
    const logoSrcset = responsiveImageSrcset(BRAND_LOGO_PATH, [160, 240, 320, 520], 82);

    return `
      <img
        class="brand-logo-image brand-logo-final"
        src="${escapeHtml(logoSrc)}"
        ${logoSrcset ? `srcset="${escapeAttribute(logoSrcset)}" sizes="(max-width: 700px) 150px, 190px"` : ""}
        alt="Virixoo - Happy Pets, Happy Life"
        width="520"
        height="170"
        decoding="async"
        fetchpriority="high"
      >`;
  }

  return `
    <span class="brand-copy brand-copy-fallback">
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
  const robots = options.robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1";
  const preloadImage = options.preloadImage || null;

  const imagePreloadMarkup = preloadImage && preloadImage.href
    ? `<link rel="preload" as="image" href="${escapeHtml(preloadImage.href)}"${preloadImage.srcset ? ` imagesrcset="${escapeHtml(preloadImage.srcset)}"` : ""}${preloadImage.sizes ? ` imagesizes="${escapeHtml(preloadImage.sizes)}"` : ""} fetchpriority="high">`
    : "";

  function navClass(key) {
    return active === key ? ' class="active"' : "";
  }

  return `
<!doctype html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PQ5SS8NDPT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PQ5SS8NDPT');
</script>
<meta charset="utf-8">

<!-- Mondiad site verification -->
<meta name="mnd-ver" content="lxmsptma4kgu4u29smdlfw" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>
<meta
  name="robots"
  content="${escapeHtml(robots)}"
>
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" href="/favicon.png">

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

${imagePreloadMarkup}
<link rel="stylesheet" href="/css/style.css">

<!-- Mondiad banner ad -->
<script async src="https://ss.mrmnd.com/banner.js"></script>

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
      <a${navClass("dogs")} href="/dogs/">${ICONS.paw} Dogs</a>
      <a${navClass("cats")} href="/cats/">${ICONS.paw} Cats</a>

      <div class="nav-dropdown">
        <button
          class="nav-dropdown-toggle${active === "categories" ? " active" : ""}"
          type="button"
          aria-expanded="false"
        >
          Categories ${ICONS.chevronDown}
        </button>
        <div class="nav-dropdown-menu">
          <a href="/dogs/"><strong>All Dog Care</strong></a>
          <a href="/dogs/health/">Dog Health</a>
          <a href="/dogs/behavior/">Dog Behavior</a>
          <a href="/dogs/nutrition/">Dog Nutrition</a>
          <a href="/dogs/training/">Dog Training</a>
          <a href="/cats/"><strong>All Cat Care</strong></a>
          <a href="/cats/health/">Cat Health</a>
          <a href="/cats/behavior/">Cat Behavior</a>
          <a href="/cats/nutrition/">Cat Nutrition</a>
          <a href="/categories/">All Categories &amp; Hubs</a>
          <a href="/recently-updated/">Recently Updated</a>
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
      >${ICONS.search}</a>
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
      <span class="footer-trust-icon">${ICONS.compass}</span>
      <div>
        <strong>Clear Guidance</strong>
        <span>Practical, carefully prepared pet care information</span>
      </div>
    </div>

    <div class="footer-trust-item">
      <span class="footer-trust-icon">${ICONS.heart}</span>
      <div>
        <strong>Pet First</strong>
        <span>Helpful guidance for everyday care</span>
      </div>
    </div>

    <div class="footer-trust-item">
      <span class="footer-trust-icon">${ICONS.plusCircle}</span>
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
      <a href="/dogs/health/">Dog Health</a>
      <a href="/dogs/behavior/">Dog Behavior</a>
      <a href="/cats/">Cats</a>
      <a href="/cats/health/">Cat Health</a>
      <a href="/cats/behavior/">Cat Behavior</a>
      <a href="/categories/">Categories</a>
      <a href="/recently-updated/">Recently Updated</a>
      <a href="/about/">About</a>
      <a href="/editorial-policy/">Editorial Policy</a>
      <a href="/editorial-team/">Editorial Team</a>
      <a href="/privacy-policy/">Privacy</a>
      <a href="/contact/">Contact</a>
    </nav>

    <p class="footer-disclaimer">
      &copy; ${new Date().getFullYear()} Virixoo. Educational information only; not a substitute for veterinary care.
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
  const cardImageSrc = netlifyImageUrl(image, 720, 70);
  const cardImageSrcset = responsiveImageSrcset(image, [360, 480, 720, 960], 70);
  const cardImageSizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw";
  const alt = cleanImageAlt(article);

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
      src="${escapeHtml(cardImageSrc)}"
      ${cardImageSrcset ? `srcset="${escapeAttribute(cardImageSrcset)}" sizes="${escapeAttribute(cardImageSizes)}"` : ""}
      alt="${escapeHtml(alt)}"
      loading="lazy"
      decoding="async"
      width="800"
      height="450"
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
      <a class="read-more" href="${url}" aria-label="Read ${escapeHtml(article.title)}">Read guide <span>&rarr;</span></a>
      ${options.showPinterest === false ? "" : `
      <a
        class="pinterest-button"
        href="${escapeHtml(pinterestUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pin ${escapeHtml(article.title)} on Pinterest"
      >Pin</a>`}
    </div>
  </div>
</article>`;
}

/* =========================================================
   Home Page
   ========================================================= */

function createHomePage(articles) {
  const ordered = sortArticlesByFreshness(articles);

  const dogs = ordered.filter((a) => normalizeCategory(a.category) === "Dogs");
  const cats = ordered.filter((a) => normalizeCategory(a.category) === "Cats");

  const seedFeatured = [];
  if (dogs[0]) seedFeatured.push(dogs[0]);
  if (cats[0]) seedFeatured.push(cats[0]);
  if (dogs[1]) seedFeatured.push(dogs[1]);
  if (cats[1]) seedFeatured.push(cats[1]);
  if (dogs[2]) seedFeatured.push(dogs[2]);
  if (cats[2]) seedFeatured.push(cats[2]);

  const featuredSlugs = new Set(seedFeatured.map((a) => a.slug));
  const discoveryPool = ordered.filter((a) => !featuredSlugs.has(a.slug));
  const discoveryGuides = discoveryPool.slice(0, HOME_DISCOVERY_COUNT);

  const heroPetsImage = publicImageExists(HERO_PETS_PATH)
    ? HERO_PETS_PATH
    : (pickExistingArticleImage(dogs) || pickExistingArticleImage(cats));

  const dogCareImage = publicImageExists(DOG_CARE_IMAGE_PATH)
    ? DOG_CARE_IMAGE_PATH
    : pickExistingArticleImage(dogs);

  const catCareImage = publicImageExists(CAT_CARE_IMAGE_PATH)
    ? CAT_CARE_IMAGE_PATH
    : pickExistingArticleImage(cats);

  const heroPetsSrc = netlifyImageUrl(heroPetsImage, 960, 74);
  const heroPetsSrcset = responsiveImageSrcset(heroPetsImage, [480, 720, 960, 1280], 74);
  const careImageSizes = "(max-width: 800px) 100vw, 50vw";
  const dogCareSrc = netlifyImageUrl(dogCareImage, 720, 72);
  const dogCareSrcset = responsiveImageSrcset(dogCareImage, [360, 520, 720, 960], 72);
  const catCareSrc = netlifyImageUrl(catCareImage, 720, 72);
  const catCareSrcset = responsiveImageSrcset(catCareImage, [360, 520, 720, 960], 72);

  const html = `
${header(
  "Virixoo | Practical Dog & Cat Care Guides",
  "Practical dog and cat care guides covering health, behavior, nutrition, grooming and training.",
  `${SITE_URL}/`,
  {
    active: "home",
    schemas: [createWebSiteSchema(), createOrganizationSchema()]
  }
)}

<div class="mondiad-banner-slot" style="width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;margin:18px auto;overflow:hidden;">
  <div data-mndbanid="ff1f399f-5766-4eca-8d31-95475c430bdb"></div>
</div>

<section class="home-hero hero-reference-layout">
  <div class="hero-decor hero-decor-left" aria-hidden="true">${ICONS.paw}</div>
  <div class="hero-decor hero-decor-right" aria-hidden="true">${ICONS.paw}</div>

  <div class="hero-copy">
    <span class="hero-badge">${ICONS.paw} Practical Pet Care Guides</span>

    <h1>
      Clear guidance for happy
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
        ${ICONS.paw} Explore Dog Guides
      </a>
      <a class="secondary-button" href="/cats/">
        ${ICONS.paw} Explore Cat Guides
      </a>
    </div>
  </div>

  <div class="hero-pets hero-pets-feature" aria-label="Happy dog and cat">
    <img
      class="hero-pets-feature-image"
      src="${escapeHtml(heroPetsSrc)}"
      ${heroPetsSrcset ? `srcset="${escapeAttribute(heroPetsSrcset)}" sizes="(max-width: 900px) 100vw, 50vw"` : ""}
      alt="Happy golden retriever and tabby cat representing Virixoo pet care guides"
      width="1536"
      height="1024"
      loading="eager"
      fetchpriority="high"
      decoding="async"
    >
  </div>

  <aside class="hero-stats" aria-label="Virixoo guide library">
    <div class="hero-stat-card">
      <span class="hero-stat-icon">${ICONS.book}</span>
      <div>
        <strong>${articles.length}+</strong>
        <span>Pet Care Guides</span>
        <small>Helpful pet care articles</small>
      </div>
    </div>

    <div class="hero-stat-card">
      <span class="hero-stat-icon">${ICONS.shieldCheck}</span>
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
      src="${escapeHtml(dogCareSrc)}"
      ${dogCareSrcset ? `srcset="${escapeAttribute(dogCareSrcset)}" sizes="${escapeAttribute(careImageSizes)}"` : ""}
      alt="Dog care guides"
      width="520"
      height="300"
      loading="lazy"
      decoding="async"
    >
    <div class="care-panel-content">
      <span class="care-panel-icon">${ICONS.paw}</span>
      <div>
        <h2>Dog Care</h2>
        <p>Training, health, nutrition and behavior guides</p>
        <span class="care-panel-link">Browse Dog Articles <b>&rarr;</b></span>
      </div>
    </div>
  </a>

  <a class="care-panel cat-care-panel" href="/cats/">
    <div class="care-panel-content">
      <span class="care-panel-icon">${ICONS.paw}</span>
      <div>
        <h2>Cat Care</h2>
        <p>Health, nutrition, behavior and care guides</p>
        <span class="care-panel-link">Browse Cat Articles <b>&rarr;</b></span>
      </div>
    </div>
    <img
      src="${escapeHtml(catCareSrc)}"
      ${catCareSrcset ? `srcset="${escapeAttribute(catCareSrcset)}" sizes="${escapeAttribute(careImageSizes)}"` : ""}
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
        <span class="section-title-icon">${ICONS.star}</span>
        <h2 id="featured-guides">Featured Guides</h2>
      </span>
      <p>Handpicked articles to help you care for your pets better</p>
    </div>
    <a class="section-link" href="/categories/">View all articles <span>&rarr;</span></a>
  </div>

  <div
    class="articles-grid featured-grid home-featured-grid"
    id="featured-grid"
    data-display-count="${HOME_FEATURED_COUNT}"
  >
    ${seedFeatured
      .map((article) =>
        articleCard(article, {
          compact: true,
          headingTag: "h3",
          showPinterest: true
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
      <p>More practical guides from the Virixoo library.</p>
    </div>

    <a class="shuffle-button" href="/recently-updated/">
      Recently updated guides
    </a>
  </div>

  <div
    class="articles-grid"
    id="dynamic-article-grid"
    data-display-count="${HOME_DISCOVERY_COUNT}"
  >
    ${discoveryGuides
      .map((article) =>
        articleCard(article, {
          headingTag: "h3",
          showPinterest: true
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
  <a href="/about/">About our approach <span>&rarr;</span></a>
</section>

${footer()}`;

  fs.writeFileSync(
    path.join(DIST_DIR, "index.html"),
    html,
    "utf8"
  );

  return seedFeatured.length + discoveryGuides.length;
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

  const topic = articleTopic(article);
  const topicHubAvailable = hasTopicHub(article, allArticles);
  const breadcrumbItems = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: category, url: `${SITE_URL}/${categorySlug}/` }
  ];

  if (topicHubAvailable) {
    breadcrumbItems.push({
      name: `${category}${topic}`,
      url: `${SITE_URL}${topicHubPath(category, topic)}`
    });
  }

  breadcrumbItems.push({ name: article.title, url: canonical });

  const schemas = [
    createArticleSchema(article),
    createBreadcrumbSchema(breadcrumbItems)
  ];

  // FAQ content remains useful to readers, but FAQPage schema is intentionally not emitted.

  const image = displayImagePath(article.image || "");
  const articleHeroSrc = netlifyImageUrl(image, 1280, 78);
  const articleHeroSrcset = responsiveImageSrcset(image, [640, 960, 1280, 1600], 78);
  const articleHeroSizes = "(max-width: 900px) 100vw, 1200px";
  const pinterestUrl = pinterestShareUrl(article);
  const related = relatedArticles(article, allArticles, RELATED_ARTICLE_LIMIT);

  const html = `
${header(
  `${article.title} | Virixoo`,
  article.summary || "Practical pet care guide from Virixoo.",
  canonical,
  {
    type: "article",
    image: article.image || "",
    active: category === "Dogs" ? "dogs" : "cats",
    schemas,
    preloadImage: {
      href: articleHeroSrc,
      srcset: articleHeroSrcset,
      sizes: articleHeroSizes
    }
  }
)}

<div class="mondiad-banner-slot" style="width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;margin:18px auto;overflow:hidden;">
  <div data-mndbanid="ff1f399f-5766-4eca-8d31-95475c430bdb"></div>
</div>

<article class="single-article">

  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span>&rsaquo;</span>
    <a href="/${categorySlug}/">${escapeHtml(category)}</a>
    <span>&rsaquo;</span>
    ${topicHubAvailable ? `<a href="${topicHubPath(category, topic)}">${escapeHtml(topic)}</a><span>&rsaquo;</span>` : ""}
    <span>${escapeHtml(article.title)}</span>
  </nav>

  <header class="article-header">
    <div class="article-meta">
      <a class="category-pill category-${categorySlug}" href="/${categorySlug}/">
        ${escapeHtml(category)}
      </a>
      <span>By <a href="/editorial-team/">${escapeHtml(article.author || EDITORIAL_TEAM_NAME)}</a></span>
      <span>${readingTime(article.content)} min read</span>${topicHubAvailable
        ? `<a class="article-topic" href="${topicHubPath(category, topic)}">${escapeHtml(topic)}</a>`
        : `<span class="article-topic">${escapeHtml(topic)}</span>`}
      ${renderArticleDates(article)}
    </div>

    <h1>${escapeHtml(article.title)}</h1>

    ${article.summary ? `<p class="article-summary">${escapeHtml(article.summary)}</p>` : ""}
  </header>

  <div
    class="article-hero-frame"
    style="width:100%;max-width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;overflow:hidden;"
  >
    <img
      class="article-hero"
      src="${escapeHtml(articleHeroSrc)}"
      ${articleHeroSrcset ? `srcset="${escapeAttribute(articleHeroSrcset)}" sizes="${escapeAttribute(articleHeroSizes)}"` : ""}
      alt="${escapeHtml(cleanImageAlt(article))}"
      width="1200"
      height="675"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      style="width:100%;height:100%;max-width:100%;object-fit:contain;"
    >
  </div>

  <div class="article-share">
    <a
      class="pinterest-button"
      href="${escapeHtml(pinterestUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pin ${escapeHtml(article.title)} on Pinterest"
    >
      Pin on Pinterest
    </a>
  </div>

  <div class="article-content">
    ${formatContent(article.content)}
  </div>

  ${renderSources(article)}
  ${renderFaq(article)}${renderEditorialNote(article)}
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
      View all ${escapeHtml(category)} guides <span>&rarr;</span>
    </a>
  </div>

  <div class="articles-grid related-grid">
    ${related
      .map((item) =>
        articleCard(item, {
          compact: true,
          headingTag: "h3",
          showPinterest: true
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

  const filtered = sortArticlesByFreshness(
    articles.filter(
      (article) =>
        normalizeCategory(article.category) === normalizedCategory
    )
  );

  const topicGroups = Array.from(
    filtered.reduce((map, article) => {
      const topic = articleTopic(article);
      if (!map.has(topic)) map.set(topic, []);
      map.get(topic).push(article);
      return map;
    }, new Map()).entries()
  )
    .filter(([, group]) => group.length >= MIN_TOPIC_HUB_ARTICLES)
    .sort((a, b) => b[1].length - a[1].length);

  const description =
    normalizedCategory === "Dogs"
      ? "Browse practical dog care guides covering health, behavior, training, nutrition, grooming and everyday questions."
      : "Browse practical cat care guides covering health, behavior, nutrition, grooming, litter box issues and everyday questions.";

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATEGORY_PAGE_SIZE));

  function archivePath(pageNumber) {
    return pageNumber <= 1
      ? `/${slug}/`
      : `/${slug}/page/${pageNumber}/`;
  }

  function paginationMarkup(currentPage) {
    if (totalPages <= 1) return "";

    const links = [];

    if (currentPage > 1) {
      links.push(
        `<a class="archive-page-link archive-page-prev" href="${archivePath(currentPage - 1)}" rel="prev">&larr; Previous</a>`
      );
    }

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      if (pageNumber === currentPage) {
        links.push(
          `<span class="archive-page-link is-current" aria-current="page">${pageNumber}</span>`
        );
      } else {
        links.push(
          `<a class="archive-page-link" href="${archivePath(pageNumber)}">${pageNumber}</a>`
        );
      }
    }

    if (currentPage < totalPages) {
      links.push(
        `<a class="archive-page-link archive-page-next" href="${archivePath(currentPage + 1)}" rel="next">Next &rarr;</a>`
      );
    }

    return `
      <nav class="archive-pagination" aria-label="${escapeHtml(normalizedCategory)} article pages">
        ${links.join("\n        ")}
      </nav>`;
  }

  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    const startIndex = (currentPage - 1) * CATEGORY_PAGE_SIZE;
    const pageArticles = filtered.slice(startIndex, startIndex + CATEGORY_PAGE_SIZE);
    const canonicalPath = archivePath(currentPage);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : "";
    const pageTitle = `${normalizedCategory} Care Guides${pageSuffix} | Virixoo`;
    const pageDescription = currentPage > 1
      ? `${description} Page ${currentPage} of${totalPages}.`
      : description;

    const breadcrumbItems = [
      { name: "Home", url: `${SITE_URL}/` },
      {
        name: `${normalizedCategory} Care Guides`,
        url: `${SITE_URL}/${slug}/`
      }
    ];

    if (currentPage > 1) {
      breadcrumbItems.push({
        name: `Page ${currentPage}`,
        url: canonical
      });
    }

    const html = `
${header(
  pageTitle,
  pageDescription,
  canonical,
  {
    active: slug === "dogs" ? "dogs" : "cats",
    schemas: [createBreadcrumbSchema(breadcrumbItems)]
  }
)}

<style>
.archive-pagination{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;justify-content:center;margin:2rem auto 0;padding:0 1rem}
.archive-page-link{display:inline-flex;align-items:center;justify-content:center;min-width:2.65rem;min-height:2.65rem;padding:.55rem .8rem;border:1px solid #dfe3ef;border-radius:999px;text-decoration:none;font-weight:700;background:#fff}
.archive-page-link.is-current{background:#111a44;color:#fff;border-color:#111a44}
.archive-page-prev,.archive-page-next{padding-left:1rem;padding-right:1rem}
