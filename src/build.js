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

const HOME_FEATURED_COUNT = 6;
const HOME_DISCOVERY_COUNT = 12;
const CATEGORY_PAGE_SIZE = 30;

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
  return text.slice(0, maxLength - 3).trim().replace(/[.,;:!?-]+$/, "") + "...";
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
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(date);
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
    (candidate) => normalizeCategory(candidate.category) === category && articleTopic(candidate) === topic
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
  ].filter(Boolean).join(" "));
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

function relatedArticles(article, allArticles, limit = RELATED_ARTICLE_LIMIT) {
  const category = normalizeCategory(article.category);
  return allArticles
    .filter((candidate) => candidate.slug !== article.slug && normalizeCategory(candidate.category) === category)
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
  ].filter(Boolean).join(" ").toLowerCase();
}

function normalizeTopic(value = "") {
  const topic = String(value || "").trim();
  if (!topic) return "";
  return topic.split(/\s+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function articleTopic(article) {
  const explicit = normalizeTopic(article.topic || article.subcategory || "");
  if (explicit) return explicit;
  const haystack = [
    article.title,
    article.summary,
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ].filter(Boolean).join(" ").toLowerCase();

  if (/vomit|diarrhea|cough|limp|itch|scratch|skin|appetite|eating|drinking|water|urine|poop|stool|constipation|pain|fever|breath|breathing|hair loss|weight loss|sick|illness|health|symptom|vet|veterinar/.test(haystack)) return "Health";
  if (/train|training|leash|litter train|command|recall|bite inhibition/.test(haystack)) return "Training";
  if (/food|feeding|diet|nutrition|treat|meal/.test(haystack)) return "Nutrition";
  if (/groom|brush|nail|bath|coat|teeth|dental/.test(haystack)) return "Grooming";
  return "Behavior";
}

function isHealthArticle(article) {
  return articleTopic(article) === "Health";
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => {
      if (typeof source === "string") return { title: source.trim(), url: "" };
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
      ${sources.map((source) => {
        const label = source.publisher
          ? `${escapeHtml(source.title)} &mdash; ${escapeHtml(source.publisher)}`
          : escapeHtml(source.title);
        if (!source.url) return `<li>${label}</li>`;
        return `<li><a href="${escapeAttribute(source.url)}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
      }).join("\n")}
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

function renderFaq(article) {
  const faq = normalizeFaq(article.faq);
  if (!faq.length) return "";
  return `
  <section class="article-faq" aria-labelledby="article-faq-heading">
    <h2 id="article-faq-heading">Frequently Asked Questions</h2>
    ${faq.map((item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.question)}</summary>
        <div>${formatContent(item.answer)}</div>
      </details>`).join("\n")}
  </section>`;
}

function renderArticleDates(article) {
  const published = String(article.datePublished || "").trim();
  const modified = String(article.dateModified || "").trim();
  const parts = [];
  if (published) {
    parts.push(`<span>Published <time datetime="${escapeAttribute(published)}">${escapeHtml(prettyDate(published))}</time></span>`);
  }
  if (modified && modified !== published) {
    parts.push(`<span>Updated <time datetime="${escapeAttribute(modified)}">${escapeHtml(prettyDate(modified))}</time></span>`);
  }
  return parts.join("\n      ");
}

function renderEditorialNote(article) {
  if (isHealthArticle(article)) {
    return `
  <aside class="editorial-box editorial-box-health" aria-label="Health information note">
    <strong>Virixoo Health Information Note</strong>
    <p>This guide is for general educational purposes and is not a diagnosis. Symptoms can have different causes. Contact a veterinarian when signs are severe, persistent, worsening, unusual, or whenever you are concerned about your pet. <a href="/editorial-policy/">Read our editorial policy</a>.</p>
  </aside>`;
  }
  return `
  <aside class="editorial-box" aria-label="Editorial note">
    <strong>Virixoo Editorial Note</strong>
    <p>This guide provides general educational information for pet owners. Individual pets can behave differently, so use the advice as practical guidance rather than a one-size-fits-all rule. <a href="/editorial-policy/">Read our editorial policy</a>.</p>
  </aside>`;
}

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
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) return sanitizeArticleHtml(raw);
  return raw
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

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
  raw = raw.replace(/\s+/g, " ").replace(/\s+([.,;])/g, "$1").replace(/[.,;:\s-]+$/g, "").trim();
  if (raw) raw = raw.charAt(0).toUpperCase() + raw.slice(1);

  const stillLooksLikePrompt = /owner|comforting|redirected|observing from a distance|preparing to/i.test(raw);
  if (!raw || raw.length > 110 || raw.length < 12 || stillLooksLikePrompt) {
    const category = normalizeCategory(article.category) === "Cats" ? "Cat" : "Dog";
    const baseTopic = String(article.primaryKeyword || article.title || "").split(":")[0].split("?")[0].trim();
    return baseTopic
      ? `${baseTopic.charAt(0).toUpperCase() + baseTopic.slice(1)} (${category} Care Guide)`
      : "Virixoo pet care guide";
  }
  return raw;
}

function normalizeImagePath(image = "") {
  const value = String(image || "").trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("//")) return value;
  return value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`;
}

function publicImageExists(image = "") {
  const normalized = normalizeImagePath(image);
  if (!normalized) return false;
  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("//")) return true;
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
  if (normalizedFallback && publicImageExists(normalizedFallback)) return normalizedFallback;
  return DEFAULT_IMAGE_PATH;
}

function absoluteImageUrl(image = "") {
  const displayed = displayImagePath(image);
  if (displayed.startsWith("http://") || displayed.startsWith("https://")) return displayed;
  return `${SITE_URL}${displayed}`;
}

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
  return widths.map((width) => `${netlifyImageUrl(normalized, width, quality)} ${width}w`).join(", ");
}

function pinterestShareUrl(article) {
  const canonical = articleUrl(article);
  const image = absoluteImageUrl(article.image || "");
  const description = article.title || "Virixoo pet care guide";
  return `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(canonical)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`;
}

function createDefaultImage() {
  const imageDir = path.join(DIST_DIR, "images");
  ensureDir(imageDir);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#f5f2ff"/><stop offset="100%" stop-color="#fff5e8"/></linearGradient></defs><rect width="1200" height="700" fill="url(#bg)"/><circle cx="600" cy="280" r="120" fill="#ffffff" opacity="0.92"/><text x="600" y="315" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92">&#128062;</text><text x="600" y="455" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#111a44">Virixoo</text><text x="600" y="515" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#69708e">Happy Pets, Happy Life</text></svg>`;
  fs.writeFileSync(path.join(imageDir, "virixoo-default.svg"), svg, "utf8");
}

function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: `${SITE_URL}${BRAND_LOGO_PATH}` }
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
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` }
  };
}

function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` }
  };
}

function createArticleSchema(article) {
  const canonical = articleUrl(article);
  const keywords = [
    article.primaryKeyword,
    ...(Array.isArray(article.secondaryKeywords) ? article.secondaryKeywords : [])
  ].filter(Boolean).map((item) => String(item).trim()).filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${canonical}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
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
      logo: { "@type": "ImageObject", url: `${SITE_URL}${BRAND_LOGO_PATH}` }
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
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
  return `<script type="application/ld+json">${safeJsonLd(schema)}</script>`;
}

function logoMarkup() {
  if (publicImageExists(BRAND_LOGO_PATH)) {
    const logoSrc = netlifyImageUrl(BRAND_LOGO_PATH, 320, 82);
    const logoSrcset = responsiveImageSrcset(BRAND_LOGO_PATH, [160, 240, 320, 520], 82);
    return `<img class="brand-logo-image brand-logo-final" src="${escapeHtml(logoSrc)}" ${logoSrcset ? `srcset="${escapeAttribute(logoSrcset)}" sizes="(max-width: 700px) 150px, 190px"` : ""} alt="Virixoo - Happy Pets, Happy Life" width="520" height="170" decoding="async" fetchpriority="high">`;
  }
  return `<span class="brand-copy brand-copy-fallback"><strong>Virixoo</strong><small>${SITE_TAGLINE}</small></span>`;
}

function header(title, description, canonical, options = {}) {
  const image = options.image !== undefined ? absoluteImageUrl(options.image) : DEFAULT_IMAGE_URL;
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

  return `<!doctype html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PQ5SS8NDPT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-PQ5SS8NDPT');
</script>
<meta charset="utf-8">
<meta name="mnd-ver" content="lxmsptma4kgu4u29smdlfw" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${escapeHtml(robots)}">
<meta name="theme-color" content="#ffffff">
<link rel="icon" type="image/png" href="/favicon.png">
<title>${escapeHtml(truncateText(title, 70))}</title>
<meta name="description" content="${escapeHtml(truncateText(description, 160))}">
<link rel="canonical" href="${escapeHtml(canonical)}">
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
<script async src="https://ss.mrmnd.com/banner.js"></script>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-brand" href="/" aria-label="Virixoo Home">${logoMarkup()}</a>
    <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation">
      <span></span><span></span><span></span>
    </button>
    <nav class="main-nav" id="main-navigation" aria-label="Main navigation">
      <a${navClass("home")} href="/">Home</a>
      <a${navClass("dogs")} href="/dogs/">${ICONS.paw} Dogs</a>
      <a${navClass("cats")} href="/cats/">${ICONS.paw} Cats</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-toggle${active === "categories" ? " active" : ""}" type="button" aria-expanded="false">
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
      <a class="header-search-icon" href="/search/" aria-label="Search Virixoo">${ICONS.search}</a>
      <a class="header-search-button" href="/search/">Search</a>
    </div>
  </div>
</header>
<main class="site-main" id="main-content">`;
}

function footer() {
  return `</main>
<footer class="site-footer">
  <div class="footer-top">
    <div class="footer-trust-item">
      <span class="footer-trust-icon">${ICONS.compass}</span>
      <div><strong>Clear Guidance</strong><span>Practical, carefully prepared pet care information</span></div>
    </div>
    <div class="footer-trust-item">
      <span class="footer-trust-icon">${ICONS.heart}</span>
      <div><strong>Pet First</strong><span>Helpful guidance for everyday care</span></div>
    </div>
    <div class="footer-trust-item">
      <span class="footer-trust-icon">${ICONS.plusCircle}</span>
      <div><strong>Health Focused</strong><span>Know when veterinary care matters</span></div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-brand"><strong>Virixoo</strong><span>${SITE_TAGLINE}</span></div>
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
    <p class="footer-disclaimer">&copy; ${new Date().getFullYear()} Virixoo. Educational information only; not a substitute for veterinary care.</p>
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

  return `<article class="article-card${compact ? " article-card-compact" : ""}" data-article-card data-search="${escapeAttribute(buildSearchText(article))}">
  <a class="card-image-link" href="${url}" aria-label="Read ${escapeHtml(article.title)}">
    <img class="article-card-image" src="${escapeHtml(cardImageSrc)}" ${cardImageSrcset ? `srcset="${escapeAttribute(cardImageSrcset)}" sizes="${escapeAttribute(cardImageSizes)}"` : ""} alt="${escapeHtml(alt)}" loading="lazy" decoding="async" width="800" height="450">
  </a>
  <div class="article-card-body">
    <div class="card-topline">
      <a class="category-pill category-${slugify(category)}" href="${categoryPath(category)}">${escapeHtml(category)}</a>
      <span class="reading-time">${readingTime(article.content)} min read</span>
    </div>
    <${headingTag}><a href="${url}">${escapeHtml(article.title)}</a></${headingTag}>
    ${showSummary ? `<p>${escapeHtml(truncateText(article.summary || "", 150))}</p>` : ""}
    <div class="article-card-actions">
      <a class="read-more" href="${url}" aria-label="Read ${escapeHtml(article.title)}">Read guide <span>&rarr;</span></a>
      ${options.showPinterest === false ? "" : `<a class="pinterest-button" href="${escapeHtml(pinterestUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Pin ${escapeHtml(article.title)} on Pinterest">Pin</a>`}
    </div>
  </div>
</article>`;
}

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

  const heroPetsImage = publicImageExists(HERO_PETS_PATH) ? HERO_PETS_PATH : (pickExistingArticleImage(dogs) || pickExistingArticleImage(cats));
  const dogCareImage = publicImageExists(DOG_CARE_IMAGE_PATH) ? DOG_CARE_IMAGE_PATH : pickExistingArticleImage(dogs);
  const catCareImage = publicImageExists(CAT_CARE_IMAGE_PATH) ? CAT_CARE_IMAGE_PATH : pickExistingArticleImage(cats);

  const heroPetsSrc = netlifyImageUrl(heroPetsImage, 960, 74);
  const heroPetsSrcset = responsiveImageSrcset(heroPetsImage, [480, 720, 960, 1280], 74);
  const careImageSizes = "(max-width: 800px) 100vw, 50vw";
  const dogCareSrc = netlifyImageUrl(dogCareImage, 720, 72);
  const dogCareSrcset = responsiveImageSrcset(dogCareImage, [360, 520, 720, 960], 72);
  const catCareSrc = netlifyImageUrl(catCareImage, 720, 72);
  const catCareSrcset = responsiveImageSrcset(catCareImage, [360, 520, 720, 960], 72);

  const html = `${header(
    "Virixoo | Practical Dog & Cat Care Guides",
    "Practical dog and cat care guides covering health, behavior, nutrition, grooming and training.",
    `${SITE_URL}/`,
    { active: "home", schemas: [createWebSiteSchema(), createOrganizationSchema()] }
  )}
<div class="mondiad-banner-slot" style="width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;margin:18px auto;overflow:hidden;">
  <div data-mndbanid="ff1f399f-5766-4eca-8d31-95475c430bdb"></div>
</div>
<section class="home-hero hero-reference-layout">
  <div class="hero-decor hero-decor-left" aria-hidden="true">${ICONS.paw}</div>
  <div class="hero-decor hero-decor-right" aria-hidden="true">${ICONS.paw}</div>
  <div class="hero-copy">
    <span class="hero-badge">${ICONS.paw} Practical Pet Care Guides</span>
    <h1>Clear guidance for happy <span class="hero-cat-word">cats</span> &amp; <span class="hero-dog-word">dogs</span></h1>
    <p>Practical guides, health tips, training advice and more. Everything you need for a happier, healthier pet.</p>
    <div class="hero-actions">
      <a class="primary-button" href="/dogs/">${ICONS.paw} Explore Dog Guides</a>
      <a class="secondary-button" href="/cats/">${ICONS.paw} Explore Cat Guides</a>
    </div>
  </div>
  <div class="hero-pets hero-pets-feature" aria-label="Happy dog and cat">
    <img class="hero-pets-feature-image" src="${escapeHtml(heroPetsSrc)}" ${heroPetsSrcset ? `srcset="${escapeAttribute(heroPetsSrcset)}" sizes="(max-width: 900px) 100vw, 50vw"` : ""} alt="Happy golden retriever and tabby cat representing Virixoo pet care guides" width="1536" height="1024" loading="eager" fetchpriority="high" decoding="async">
  </div>
  <aside class="hero-stats" aria-label="Virixoo guide library">
    <div class="hero-stat-card">
      <span class="hero-stat-icon">${ICONS.book}</span>
      <div><strong>${articles.length}+</strong><span>Pet Care Guides</span><small>Helpful pet care articles</small></div>
    </div>
    <div class="hero-stat-card">
      <span class="hero-stat-icon">${ICONS.shieldCheck}</span>
      <div><strong>100%</strong><span>Pet Focused</span><small>Quality content for pets</small></div>
    </div>
  </aside>
</section>
<section class="care-switchboard" aria-label="Browse care guides by pet">
  <a class="care-panel dog-care-panel" href="/dogs/">
    <img src="${escapeHtml(dogCareSrc)}" ${dogCareSrcset ? `srcset="${escapeAttribute(dogCareSrcset)}" sizes="${escapeAttribute(careImageSizes)}"` : ""} alt="Dog care guides" width="520" height="300" loading="lazy" decoding="async">
    <div class="care-panel-content">
      <span class="care-panel-icon">${ICONS.paw}</span>
      <div><h2>Dog Care</h2><p>Training, health, nutrition and behavior guides</p><span class="care-panel-link">Browse Dog Articles <b>&rarr;</b></span></div>
    </div>
  </a>
  <a class="care-panel cat-care-panel" href="/cats/">
    <div class="care-panel-content">
      <span class="care-panel-icon">${ICONS.paw}</span>
      <div><h2>Cat Care</h2><p>Health, nutrition, behavior and care guides</p><span class="care-panel-link">Browse Cat Articles <b>&rarr;</b></span></div>
    </div>
    <img src="${escapeHtml(catCareSrc)}" ${catCareSrcset ? `srcset="${escapeAttribute(catCareSrcset)}" sizes="${escapeAttribute(careImageSizes)}"` : ""} alt="Cat care guides" width="520" height="300" loading="lazy" decoding="async">
  </a>
</section>
<section class="articles-section featured-section" aria-labelledby="featured-guides">
  <div class="section-heading">
    <div>
      <span class="section-title-row"><span class="section-title-icon">${ICONS.star}</span><h2 id="featured-guides">Featured Guides</h2></span>
      <p>Handpicked articles to help you care for your pets better</p>
    </div>
    <a class="section-link" href="/categories/">View all articles <span>&rarr;</span></a>
  </div>
  <div class="articles-grid featured-grid home-featured-grid" id="featured-grid" data-display-count="${HOME_FEATURED_COUNT}">
    ${seedFeatured.map((article) => articleCard(article, { compact: true, headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
</section>
<section class="articles-section discovery-section" aria-labelledby="discover-guides">
  <div class="section-heading">
    <div><span class="eyebrow">Explore more</span><h2 id="discover-guides">More Helpful Pet Guides</h2><p>More practical guides from the Virixoo library.</p></div>
    <a class="shuffle-button" href="/recently-updated/">Recently updated guides</a>
  </div>
  <div class="articles-grid" id="dynamic-article-grid" data-display-count="${HOME_DISCOVERY_COUNT}">
    ${discoveryGuides.map((article) => articleCard(article, { headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
</section>
<section class="home-editorial-band">
  <div><span class="eyebrow">Why Virixoo</span><h2>Practical pet care without unnecessary complexity</h2></div>
  <p>Virixoo helps pet owners understand common situations, recognize warning signs and know when professional veterinary care may be appropriate.</p>
  <a href="/about/">About our approach <span>&rarr;</span></a>
</section>
${footer()}`;

  fs.writeFileSync(path.join(DIST_DIR, "index.html"), html, "utf8");
  return seedFeatured.length + discoveryGuides.length;
}

function createArticlePage(article, allArticles) {
  const articleDir = path.join(DIST_DIR, "article", article.slug);
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
    breadcrumbItems.push({ name: `${category} ${topic}`, url: `${SITE_URL}${topicHubPath(category, topic)}` });
  }
  breadcrumbItems.push({ name: article.title, url: canonical });

  const schemas = [createArticleSchema(article), createBreadcrumbSchema(breadcrumbItems)];
  const image = displayImagePath(article.image || "");
  const articleHeroSrc = netlifyImageUrl(image, 1280, 78);
  const articleHeroSrcset = responsiveImageSrcset(image, [640, 960, 1280, 1600], 78);
  const articleHeroSizes = "(max-width: 900px) 100vw, 1200px";
  const pinterestUrl = pinterestShareUrl(article);
  const related = relatedArticles(article, allArticles, RELATED_ARTICLE_LIMIT);

  const html = `${header(
    `${article.title} | Virixoo`,
    article.summary || "Practical pet care guide from Virixoo.",
    canonical,
    {
      type: "article",
      image: article.image || "",
      active: category === "Dogs" ? "dogs" : "cats",
      schemas,
      preloadImage: { href: articleHeroSrc, srcset: articleHeroSrcset, sizes: articleHeroSizes }
    }
  )}
<div class="mondiad-banner-slot" style="width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;margin:18px auto;overflow:hidden;">
  <div data-mndbanid="ff1f399f-5766-4eca-8d31-95475c430bdb"></div>
</div>
<article class="single-article">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a><span>&rsaquo;</span>
    <a href="/${categorySlug}/">${escapeHtml(category)}</a><span>&rsaquo;</span>
    ${topicHubAvailable ? `<a href="${topicHubPath(category, topic)}">${escapeHtml(topic)}</a><span>&rsaquo;</span>` : ""}
    <span>${escapeHtml(article.title)}</span>
  </nav>
  <header class="article-header">
    <div class="article-meta">
      <a class="category-pill category-${categorySlug}" href="/${categorySlug}/">${escapeHtml(category)}</a>
      <span>By <a href="/editorial-team/">${escapeHtml(article.author || EDITORIAL_TEAM_NAME)}</a></span>
      <span>${readingTime(article.content)} min read</span>
      ${topicHubAvailable ? `<a class="article-topic" href="${topicHubPath(category, topic)}">${escapeHtml(topic)}</a>` : `<span class="article-topic">${escapeHtml(topic)}</span>`}
      ${renderArticleDates(article)}
    </div>
    <h1>${escapeHtml(article.title)}</h1>
    ${article.summary ? `<p class="article-summary">${escapeHtml(article.summary)}</p>` : ""}
  </header>
  <div class="article-hero-frame" style="width:100%;max-width:100%;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;overflow:hidden;">
    <img class="article-hero" src="${escapeHtml(articleHeroSrc)}" ${articleHeroSrcset ? `srcset="${escapeAttribute(articleHeroSrcset)}" sizes="${escapeAttribute(articleHeroSizes)}"` : ""} alt="${escapeHtml(cleanImageAlt(article))}" width="1200" height="675" loading="eager" fetchpriority="high" decoding="async" style="width:100%;height:100%;max-width:100%;object-fit:contain;">
  </div>
  <div class="article-share">
    <a class="pinterest-button" href="${escapeHtml(pinterestUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Pin ${escapeHtml(article.title)} on Pinterest">Pin on Pinterest</a>
  </div>
  <div class="article-content">${formatContent(article.content)}</div>
  ${renderSources(article)}
  ${renderFaq(article)}
  ${renderEditorialNote(article)}
</article>
${related.length ? `
<section class="articles-section related-section" aria-labelledby="related-guides">
  <div class="section-heading">
    <div><span class="eyebrow">Keep reading</span><h2 id="related-guides">Related ${escapeHtml(category)} Guides</h2></div>
    <a class="section-link" href="/${categorySlug}/">View all ${escapeHtml(category)} guides <span>&rarr;</span></a>
  </div>
  <div class="articles-grid related-grid">
    ${related.map((item) => articleCard(item, { compact: true, headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
</section>` : ""}
${footer()}`;

  fs.writeFileSync(path.join(articleDir, "index.html"), html, "utf8");
}

function createCategoryPage(articles, category, slug) {
  const normalizedCategory = normalizeCategory(category);
  const filtered = sortArticlesByFreshness(
    articles.filter((article) => normalizeCategory(article.category) === normalizedCategory)
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

  const description = normalizedCategory === "Dogs"
    ? "Browse practical dog care guides covering health, behavior, training, nutrition, grooming and everyday questions."
    : "Browse practical cat care guides covering health, behavior, nutrition, grooming, litter box issues and everyday questions.";

  const totalPages = Math.max(1, Math.ceil(filtered.length / CATEGORY_PAGE_SIZE));

  function archivePath(pageNumber) {
    return pageNumber <= 1 ? `/${slug}/` : `/${slug}/page/${pageNumber}/`;
  }

  function paginationMarkup(currentPage) {
    if (totalPages <= 1) return "";
    const links = [];
    if (currentPage > 1) {
      links.push(`<a class="archive-page-link archive-page-prev" href="${archivePath(currentPage - 1)}" rel="prev">&larr; Previous</a>`);
    }
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      links.push(
        pageNumber === currentPage
          ? `<span class="archive-page-link is-current" aria-current="page">${pageNumber}</span>`
          : `<a class="archive-page-link" href="${archivePath(pageNumber)}">${pageNumber}</a>`
      );
    }
    if (currentPage < totalPages) {
      links.push(`<a class="archive-page-link archive-page-next" href="${archivePath(currentPage + 1)}" rel="next">Next &rarr;</a>`);
    }
    return `<nav class="archive-pagination" aria-label="${escapeHtml(normalizedCategory)} article pages">${links.join("\n")}</nav>`;
  }

  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    const startIndex = (currentPage - 1) * CATEGORY_PAGE_SIZE;
    const pageArticles = filtered.slice(startIndex, startIndex + CATEGORY_PAGE_SIZE);
    const canonicalPath = archivePath(currentPage);
    const canonical = `${SITE_URL}${canonicalPath}`;
    const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : "";
    const pageTitle = `${normalizedCategory} Care Guides${pageSuffix} | Virixoo`;
    const pageDescription = currentPage > 1 ? `${description} Page ${currentPage} of ${totalPages}.` : description;

    const breadcrumbItems = [
      { name: "Home", url: `${SITE_URL}/` },
      { name: `${normalizedCategory} Care Guides`, url: `${SITE_URL}/${slug}/` }
    ];
    if (currentPage > 1) breadcrumbItems.push({ name: `Page ${currentPage}`, url: canonical });

    const html = `${header(pageTitle, pageDescription, canonical, {
      active: slug === "dogs" ? "dogs" : "cats",
      schemas: [createBreadcrumbSchema(breadcrumbItems)]
    })}
<style>
.archive-pagination{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;justify-content:center;margin:2rem auto 0;padding:0 1rem}
.archive-page-link{display:inline-flex;align-items:center;justify-content:center;min-width:2.65rem;min-height:2.65rem;padding:.55rem .8rem;border:1px solid #dfe3ef;border-radius:999px;text-decoration:none;font-weight:700;background:#fff}
.archive-page-link.is-current{background:#111a44;color:#fff;border-color:#111a44}
.archive-page-prev,.archive-page-next{padding-left:1rem;padding-right:1rem}
@media(max-width:600px){.archive-pagination{gap:.4rem}.archive-page-link{min-width:2.4rem;min-height:2.4rem;padding:.45rem .65rem}}
</style>
<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a><span>&rsaquo;</span>
  ${currentPage > 1 ? `<a href="/${slug}/">${escapeHtml(normalizedCategory)} Care Guides</a><span>&rsaquo;</span><span>Page${currentPage}</span>` : `<span>${escapeHtml(normalizedCategory)} Care Guides</span>`}
</nav>
<section class="category-header category-${slug}-header">
  <div>
    <span class="hero-badge">${ICONS.paw} ${escapeHtml(normalizedCategory)} Care</span>
    <h1>${escapeHtml(normalizedCategory)} Care Guides${currentPage > 1 ? ` - Page ${currentPage}` : ""}</h1>
    <p>${escapeHtml(description)}</p>
  </div>
  <div class="category-count-card"><strong>${filtered.length}+</strong><span>Helpful guides</span></div>
</section>
${currentPage === 1 && topicGroups.length ? `
<section class="articles-section topic-hub-directory" aria-labelledby="${slug}-topic-hubs">
  <div class="section-heading">
    <div><span class="eyebrow">Browse by topic</span><h2 id="${slug}-topic-hubs">${escapeHtml(normalizedCategory)} Topic Hubs</h2><p>Use focused topic pages to move between closely related guides.</p></div>
  </div>
  <div class="category-overview-grid">
    ${topicGroups.map(([topic, group]) => `
      <a class="category-overview-card" href="${topicHubPath(normalizedCategory, topic)}">
        <div><h3>${escapeHtml(topic)}</h3><p>${group.length} guides</p><span>Browse ${escapeHtml(topic)} &rarr;</span></div>
      </a>`).join("\n")}
  </div>
</section>` : ""}
<section class="articles-section">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Browse library</span>
      <h2>All ${escapeHtml(normalizedCategory)} Articles</h2>
      <p>Page ${currentPage} of ${totalPages} &middot; ${pageArticles.length} guides on this page</p>
    </div>
    <div class="article-filter">
      <label for="${slug}-filter-page-${currentPage}">Filter this page</label>
      <input id="${slug}-filter-page-${currentPage}" class="article-filter-input" type="search" placeholder="Filter these ${pageArticles.length} guides" autocomplete="off">
    </div>
  </div>
  <div class="articles-grid filterable-grid" id="${slug}-grid-page-${currentPage}">
    ${pageArticles.map((article) => articleCard(article, { headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
  <p class="no-results-message" id="${slug}-no-results-page-${currentPage}" hidden>
    No matching guides found on this page. Use <a href="/search/">site search</a> to search the full Virixoo library.
  </p>
  ${paginationMarkup(currentPage)}
</section>
<section class="editorial-note category-editorial-note">
  <h2>How to use these guides</h2>
  <p>Start with the guide that best matches your question. Virixoo helps you understand common causes, safe next steps and warning signs. For urgent, severe or persistent symptoms, seek veterinary care.</p>
</section>
<script>
(function () {
  const input = document.getElementById("${slug}-filter-page-${currentPage}");
  const grid = document.getElementById("${slug}-grid-page-${currentPage}");
  const empty = document.getElementById("${slug}-no-results-page-${currentPage}");
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

    const dir = currentPage === 1 ? path.join(DIST_DIR, slug) : path.join(DIST_DIR, slug, "page", String(currentPage));
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
  }

  return { totalArticles: filtered.length, totalPages };
}

function buildTopicGroups(articles) {
  const map = new Map();
  for (const article of articles) {
    const category = normalizeCategory(article.category);
    const topic = articleTopic(article);
    const key = `${category}::${topic}`;
    if (!map.has(key)) map.set(key, { category, topic, articles: [] });
    map.get(key).articles.push(article);
  }
  return Array.from(map.values())
    .filter((group) => group.articles.length >= MIN_TOPIC_HUB_ARTICLES)
    .map((group) => ({ ...group, articles: sortArticlesByFreshness(group.articles) }))
    .sort((a, b) => {
      const categoryOrder = a.category.localeCompare(b.category);
      if (categoryOrder !== 0) return categoryOrder;
      return b.articles.length - a.articles.length || a.topic.localeCompare(b.topic);
    });
}

function topicHubDescription(category, topic, count) {
  const pet = normalizeCategory(category) === "Cats" ? "cat" : "dog";
  const topicLower = String(topic || "pet care").toLowerCase();
  return `Browse ${count} Virixoo ${pet} ${topicLower} guides, organized to help you move between closely related questions without repeating the same search.`;
}

function createTopicHubPages(articles) {
  const groups = buildTopicGroups(articles);
  const generatedPages = [];

  for (const group of groups) {
    const categorySlug = slugify(group.category);
    const topicSlug = slugify(group.topic);
    const totalPages = Math.max(1, Math.ceil(group.articles.length / TOPIC_PAGE_SIZE));
    const description = topicHubDescription(group.category, group.topic, group.articles.length);

    function hubPagePath(pageNumber) {
      return topicHubPath(group.category, group.topic, pageNumber);
    }

    function paginationMarkup(currentPage) {
      if (totalPages <= 1) return "";
      const links = [];
      if (currentPage > 1) {
        links.push(`<a class="archive-page-link archive-page-prev" href="${hubPagePath(currentPage - 1)}" rel="prev">&larr; Previous</a>`);
      }
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        links.push(
          pageNumber === currentPage
            ? `<span class="archive-page-link is-current" aria-current="page">${pageNumber}</span>`
            : `<a class="archive-page-link" href="${hubPagePath(pageNumber)}">${pageNumber}</a>`
        );
      }
      if (currentPage < totalPages) {
        links.push(`<a class="archive-page-link archive-page-next" href="${hubPagePath(currentPage + 1)}" rel="next">Next &rarr;</a>`);
      }
      return `<nav class="archive-pagination" aria-label="${escapeHtml(group.category)} ${escapeHtml(group.topic)} pages">${links.join("\n")}</nav>`;
    }

    for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
      const startIndex = (currentPage - 1) * TOPIC_PAGE_SIZE;
      const pageArticles = group.articles.slice(startIndex, startIndex + TOPIC_PAGE_SIZE);
      const canonicalPath = hubPagePath(currentPage);
      const canonical = `${SITE_URL}${canonicalPath}`;
      const titleSuffix = currentPage > 1 ? ` - Page ${currentPage}` : "";
      const pageTitle = `${group.category} ${group.topic} Guides${titleSuffix} | Virixoo`;
      const pageDescription = currentPage > 1 ? `${description} Page ${currentPage} of ${totalPages}.` : description;
      const breadcrumbs = [
        { name: "Home", url: `${SITE_URL}/` },
        { name: group.category, url: `${SITE_URL}/${categorySlug}/` },
        { name: `${group.category} ${group.topic}`, url: `${SITE_URL}${hubPagePath(1)}` }
      ];
      if (currentPage > 1) breadcrumbs.push({ name: `Page ${currentPage}`, url: canonical });

      const html = `${header(pageTitle, pageDescription, canonical, {
        active: categorySlug === "dogs" ? "dogs" : "cats",
        schemas: [createWebPageSchema(pageTitle, pageDescription, canonical), createBreadcrumbSchema(breadcrumbs)]
      })}
<style>
.archive-pagination{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;justify-content:center;margin:2rem auto 0;padding:0 1rem}
.archive-page-link{display:inline-flex;align-items:center;justify-content:center;min-width:2.65rem;min-height:2.65rem;padding:.55rem .8rem;border:1px solid #dfe3ef;border-radius:999px;text-decoration:none;font-weight:700;background:#fff}
.archive-page-link.is-current{background:#111a44;color:#fff;border-color:#111a44}
</style>
<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a><span>&rsaquo;</span>
  <a href="/${categorySlug}/">${escapeHtml(group.category)}</a><span>&rsaquo;</span>
  ${currentPage > 1 ? `<a href="${hubPagePath(1)}">${escapeHtml(group.topic)}</a><span>&rsaquo;</span><span>Page${currentPage}</span>` : `<span>${escapeHtml(group.topic)}</span>`}
</nav>
<section class="category-header category-${categorySlug}-header">
  <div>
    <span class="hero-badge">${ICONS.paw} Focused ${escapeHtml(group.category)} Library</span>
    <h1>${escapeHtml(group.category)} ${escapeHtml(group.topic)} Guides${titleSuffix}</h1>
    <p>${escapeHtml(description)}</p>
  </div>
  <div class="category-count-card"><strong>${group.articles.length}</strong><span>Related guides</span></div>
</section>
<section class="articles-section">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Topic cluster</span>
      <h2>${escapeHtml(group.topic)} questions and practical next steps</h2>
      <p>Page ${currentPage} of ${totalPages}. Choose the guide that most closely matches the situation you are trying to understand.</p>
    </div>
  </div>
  <div class="articles-grid">
    ${pageArticles.map((article) => articleCard(article, { headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
  ${paginationMarkup(currentPage)}
</section>
<section class="editorial-note category-editorial-note">
  <h2>Why this topic page exists</h2>
  <p>This hub groups genuinely related ${escapeHtml(group.topic.toLowerCase())} guides so readers can move between connected questions without wading through unrelated pages. Each article should still answer a distinct question rather than repeat another page.</p>
</section>
${footer()}`;

      const dir = currentPage === 1
        ? path.join(DIST_DIR, categorySlug, topicSlug)
        : path.join(DIST_DIR, categorySlug, topicSlug, "page", String(currentPage));
      ensureDir(dir);
      fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");

      generatedPages.push({
        category: group.category,
        topic: group.topic,
        path: canonicalPath,
        loc: canonical,
        pageNumber: currentPage,
        totalPages,
        totalArticles: group.articles.length,
        lastmod: latestArticleDate(group.articles)
      });
    }
  }
  return generatedPages;
}

function createRecentlyUpdatedPage(articles) {
  const ordered = sortArticlesByFreshness(articles).slice(0, RECENTLY_UPDATED_COUNT);
  const canonical = `${SITE_URL}/recently-updated/`;
  const description = "Browse recently updated and newly published Virixoo dog and cat care guides, ordered by their latest meaningful editorial date.";

  const html = `${header("Recently Updated Pet Care Guides | Virixoo", description, canonical, {
    schemas: [
      createWebPageSchema("Recently Updated Pet Care Guides", description, canonical),
      createBreadcrumbSchema([
        { name: "Home", url: `${SITE_URL}/` },
        { name: "Recently Updated", url: canonical }
      ])
    ]
  })}
<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a><span>&rsaquo;</span><span>Recently Updated</span>
</nav>
<section class="category-header categories-overview-header">
  <div>
    <span class="hero-badge">${ICONS.paw} Fresh from the Virixoo library</span>
    <h1>Recently Updated Pet Care Guides</h1>
    <p>${escapeHtml(description)}</p>
  </div>
</section>
<section class="articles-section">
  <div class="section-heading"><div><span class="eyebrow">Latest editorial activity</span><h2>Updated and newly published guides</h2></div></div>
  <div class="articles-grid">
    ${ordered.map((article) => articleCard(article, { headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
</section>
${footer()}`;

  const dir = path.join(DIST_DIR, "recently-updated");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function createCategoriesPage(articles) {
  const dogs = articles.filter((article) => normalizeCategory(article.category) === "Dogs");
  const cats = articles.filter((article) => normalizeCategory(article.category) === "Cats");
  const topicGroups = buildTopicGroups(articles);

  const html = `${header(
    "Pet Care Categories | Virixoo",
    "Browse Virixoo dog and cat care categories and find practical guides for health, behavior, nutrition, training and everyday pet care.",
    `${SITE_URL}/categories/`,
    {
      active: "categories",
      schemas: [createBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: "Categories", url: `${SITE_URL}/categories/` }])]
    }
  )}
<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a><span>&rsaquo;</span><span>Categories</span>
</nav>
<section class="category-header categories-overview-header">
  <div>
    <span class="hero-badge">${ICONS.paw} Explore Virixoo</span>
    <h1>Pet Care Categories</h1>
    <p>Choose dogs or cats to browse practical guides for health, behavior, nutrition, grooming, training and everyday care.</p>
  </div>
</section>
<section class="category-overview-grid">
  <a class="category-overview-card dogs-overview-card" href="/dogs/">
    <span class="category-overview-icon">${ICONS.paw}</span>
    <div><h2>Dog Care</h2><p>${dogs.length} guides</p><span>Browse Dog Articles &rarr;</span></div>
  </a>
  <a class="category-overview-card cats-overview-card" href="/cats/">
    <span class="category-overview-icon">${ICONS.paw}</span>
    <div><h2>Cat Care</h2><p>${cats.length} guides</p><span>Browse Cat Articles &rarr;</span></div>
  </a>
</section>
${topicGroups.length ? `
<section class="articles-section topic-hub-directory" aria-labelledby="all-topic-hubs">
  <div class="section-heading">
    <div>
      <span class="eyebrow">Specialized Silos</span>
      <h2 id="all-topic-hubs">Browse by Pet &amp; Topic</h2>
      <p>Direct access to specialized health, behavior, nutrition, grooming and training clusters.</p>
    </div>
  </div>
  <div class="category-overview-grid">
    ${topicGroups.map((group) => `
      <a class="category-overview-card" href="${topicHubPath(group.category, group.topic)}">
        <div>
          <h3>${escapeHtml(group.category)} ${escapeHtml(group.topic)}</h3>
          <p>${group.articles.length} guides</p>
          <span>Explore ${escapeHtml(group.topic)} &rarr;</span>
        </div>
      </a>`).join("\n")}
  </div>
</section>` : ""}
<section class="articles-section">
  <div class="section-heading"><div><span class="eyebrow">Latest guides</span><h2>Recently Updated Pet Care Articles</h2></div></div>
  <div class="articles-grid">
    ${sortArticlesByFreshness(articles).slice(0, 9).map((article) => articleCard(article, { headingTag: "h3", showPinterest: true })).join("\n")}
  </div>
</section>
${footer()}`;

  const dir = path.join(DIST_DIR, "categories");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function createSearchPage(articles) {
  const safeArticles = articles.map((article) => ({
    title: article.title,
    summary: article.summary || "",
    category: normalizeCategory(article.category),
    topic: articleTopic(article),
    url: articlePath(article),
    image: netlifyImageUrl(displayImagePath(article.image || ""), 480, 70),
    alt: cleanImageAlt(article),
    readingTime: readingTime(article.content),
    search: buildSearchText(article)
  }));

  const html = `${header("Search Pet Care Guides | Virixoo", "Search Virixoo dog and cat care guides.", `${SITE_URL}/search/`, { robots: "noindex,follow" })}
<section class="search-page">
  <div class="search-page-header">
    <span class="hero-badge">${ICONS.search} Search Virixoo</span>
    <h1>Find the pet care guide you need</h1>
    <p>Search dog and cat health, behavior, nutrition, grooming and training guides.</p>
  </div>
  <form class="site-search-form" id="site-search-form" role="search">
    <label class="sr-only" for="site-search-input">Search Virixoo</label>
    <input id="site-search-input" type="search" placeholder="Try: dog coughing, cat hungry, nail trimming..." autocomplete="off" autofocus>
    <button type="submit">Search</button>
  </form>
  <p class="search-status" id="search-status">Start typing to search ${articles.length} guides.</p>
  <div class="search-results-grid" id="search-results"></div>
</section>
<script>
(function () {
  const articles = ${JSON.stringify(safeArticles).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")};
  const form = document.getElementById("site-search-form");
  const input = document.getElementById("site-search-input");
  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  if (!form || !input || !results || !status) return;
  function escapeText(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
      .filter(function (item) { return item.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 30);

    status.textContent = matches.length === 1 ? "1 matching guide" : matches.length + " matching guides";
    results.innerHTML = matches.map(function (item) {
      const article = item.article;
      return (
        '<article class="search-result-card">' +
          '<a class="search-result-image" href="' + article.url + '">' +
            '<img src="' + escapeText(article.image) + '" alt="' + escapeText(article.alt || article.title) + '" loading="lazy" decoding="async" width="420" height="270">' +
          '</a>' +
          '<div>' +
            '<span class="category-pill category-' + article.category.toLowerCase() + '">' + escapeText(article.category) + '</span>' +
            '<h2><a href="' + article.url + '">' + escapeText(article.title) + '</a></h2>' +
            '<p>' + escapeText(article.summary) + '</p>' +
            '<span class="reading-time">' + article.readingTime + ' min read</span>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }
  form.addEventListener("submit", function (event) { event.preventDefault(); render(); });
  input.addEventListener("input", render);
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q");
  if (initial) { input.value = initial; render(); }
})();
</script>
${footer()}`;

  const dir = path.join(DIST_DIR, "search");
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function createInfoPage({ title, description, slug, contentHtml, active = "", schemaType = "WebPage" }) {
  const dir = path.join(DIST_DIR, slug);
  ensureDir(dir);
  const canonical = `${SITE_URL}/${slug}/`;
  const schemas = [
    createWebPageSchema(title, description, canonical, schemaType),
    createBreadcrumbSchema([{ name: "Home", url: `${SITE_URL}/` }, { name: title, url: canonical }])
  ];
  const html = `${header(`${title} | Virixoo`, description, canonical, { active, schemas })}
<nav class="breadcrumbs page-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a><span>&rsaquo;</span><span>${escapeHtml(title)}</span>
</nav>
<article class="single-article simple-page info-page">${contentHtml}</article>
${footer()}`;

  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  ensureDir(destination);
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    else if (entry.isFile()) fs.copyFileSync(sourcePath, destinationPath);
  }
}

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();
    if (!raw) throw new Error("File is empty.");
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function normalizeArticleFileData(data, filePath) {
  if (data && !Array.isArray(data) && Array.isArray(data.articles)) return data.articles;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  throw new Error(`Unsupported article JSON structure in ${path.relative(ROOT, filePath)}.`);
}

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsonFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json") && entry.name.toLowerCase() !== "index.json") {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function loadArticles() {
  const articles = [];
  if (fs.existsSync(DATA_FILE)) {
    const legacyData = readJsonFile(DATA_FILE);
    const legacyArticles = normalizeArticleFileData(legacyData, DATA_FILE);
    for (const article of legacyArticles) {
      articles.push({ ...article, __sourceFile: path.relative(ROOT, DATA_FILE) });
    }
  }
  const articleFiles = collectJsonFiles(ARTICLES_DIR);
  for (const filePath of articleFiles) {
    const data = readJsonFile(filePath);
    const fileArticles = normalizeArticleFileData(data, filePath);
    for (const article of fileArticles) {
      articles.push({ ...article, __sourceFile: path.relative(ROOT, filePath) });
    }
  }
  if (articles.length === 0) {
    throw new Error("No articles found. Keep src/data/articles.json or add JSON files under src/data/articles.");
  }
  return articles;
}

function validateArticles(articles) {
  const ids = new Map();
  const slugs = new Map();

  articles.forEach((article, index) => {
    const source = article.__sourceFile || `article #${index + 1}`;
    if (!article.title) throw new Error(`Missing title in ${source}.`);
    if (!article.slug) article.slug = slugify(article.title);
    article.slug = String(article.slug).trim();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
      throw new Error(`Invalid slug "${article.slug}" in ${source}.`);
    }
    if (article.id === undefined || article.id === null || article.id === "") {
      throw new Error(`Article "${article.title}" is missing an id in ${source}.`);
    }

    const idKey = String(article.id);
    if (ids.has(idKey)) throw new Error(`Duplicate article id "${article.id}" found in ${source} and ${ids.get(idKey)}.`);
    ids.set(idKey, source);

    if (slugs.has(article.slug)) throw new Error(`Duplicate slug "${article.slug}" found in ${source} and ${slugs.get(article.slug)}.`);
    slugs.set(article.slug, source);

    if (!article.content) throw new Error(`Article "${article.title}" is missing content in ${source}.`);
    if (!article.category) throw new Error(`Article "${article.title}" is missing category in ${source}.`);

    article.category = normalizeCategory(article.category);
    if (article.topic || article.subcategory) {
      article.topic = normalizeTopic(article.topic || article.subcategory);
    }
    if (!["Cats", "Dogs"].includes(article.category)) {
      throw new Error(`Unsupported category "${article.category}" in ${source}. Use "Cats" or "Dogs".`);
    }
    if (article.image) article.image = normalizeImagePath(article.image);
  });
}

function validateArticleQuality(articles) {
  const warnings = [];
  const normalizedTitles = new Map();
  const primaryKeywords = new Map();

  for (const article of articles) {
    const source = article.__sourceFile || article.slug || article.title;
    const recommended = [
      ["summary", article.summary],
      ["author", article.author],
      ["datePublished", article.datePublished],
      ["dateModified", article.dateModified],
      ["alt", article.alt || article.imageAlt],
      ["primaryKeyword", article.primaryKeyword]
    ];
    for (const [field, value] of recommended) {
      if (!String(value || "").trim()) warnings.push(`${source}: missing recommended field "${field}"`);
    }

    const normalizedTitle = String(article.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (normalizedTitle) {
      if (normalizedTitles.has(normalizedTitle)) {
        warnings.push(`${source}: duplicate article title also used in ${normalizedTitles.get(normalizedTitle)}`);
      } else {
        normalizedTitles.set(normalizedTitle, source);
      }
    }

    const primaryKeyword = String(article.primaryKeyword || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (primaryKeyword) {
      if (primaryKeywords.has(primaryKeyword)) {
        warnings.push(`${source}: primaryKeyword "${article.primaryKeyword}" is also used in ${primaryKeywords.get(primaryKeyword)}`);
      } else {
        primaryKeywords.set(primaryKeyword, source);
      }
    }
  }

  if (warnings.length) {
    console.warn(`ARTICLE QUALITY WARNINGS (${warnings.length}):`);
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
}

function validateInternalLinks(articles) {
  const knownSlugs = new Set(articles.map((article) => String(article.slug || "").trim()));
  const linkPattern = /href\s*=\s*["'](?:https?:\/\/(?:www\.)?virixoo\.com)?\/article\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/gi;
  const broken = [];

  for (const article of articles) {
    const content = String(article.content || "");
    let match;
    linkPattern.lastIndex = 0;
    while ((match = linkPattern.exec(content)) !== null) {
      let linkedSlug = "";
      try {
        linkedSlug = decodeURIComponent(match[1]);
      } catch (error) {
        broken.push({ article: article.slug, linkedSlug: match[1], source: article.__sourceFile, reason: "malformed URL encoding" });
        continue;
      }
      if (!knownSlugs.has(linkedSlug)) {
        broken.push({ article: article.slug, linkedSlug, source: article.__sourceFile, reason: "target article does not exist" });
      }
    }
  }

  if (broken.length) {
    const details = broken.map((item) => `- ${item.article} -> ${item.linkedSlug} (${item.source}; ${item.reason})`).join("\n");
    throw new Error(`Broken internal article links detected:\n${details}`);
  }
}

function extractInternalArticleSlugs(content = "") {
  const slugs = [];
  const pattern = /href\s*=\s*["'](?:https?:\/\/(?:www\.)?virixoo\.com)?\/article\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/gi;
  let match;
  while ((match = pattern.exec(String(content || ""))) !== null) {
    try {
      slugs.push(decodeURIComponent(match[1]));
    } catch (error) {}
  }
  return slugs;
}

function createGrowthReport(articles, topicHubPages = []) {
  const manualInbound = new Map(articles.map((article) => [article.slug, 0]));
  const relatedInbound = new Map(articles.map((article) => [article.slug, 0]));

  for (const article of articles) {
    for (const slug of extractInternalArticleSlugs(article.content)) {
      if (manualInbound.has(slug) && slug !== article.slug) {
        manualInbound.set(slug, manualInbound.get(slug) + 1);
      }
    }
    for (const related of relatedArticles(article, articles, RELATED_ARTICLE_LIMIT)) {
      if (relatedInbound.has(related.slug)) {
        relatedInbound.set(related.slug, relatedInbound.get(related.slug) + 1);
      }
    }
  }

  const contextualIsolation = articles
    .map((article) => ({
      slug: article.slug,
      title: article.title,
      category: normalizeCategory(article.category),
      topic: articleTopic(article),
      manualInbound: manualInbound.get(article.slug) || 0,
      relatedInbound: relatedInbound.get(article.slug) || 0,
      totalContextualInbound: (manualInbound.get(article.slug) || 0) + (relatedInbound.get(article.slug) || 0),
      topicHub: hasTopicHub(article, articles) ? topicHubPath(article.category, articleTopic(article)) : ""
    }))
    .filter((item) => item.totalContextualInbound === 0)
    .sort((a, b) => a.category.localeCompare(b.category) || a.topic.localeCompare(b.topic));

  const cannibalization = [];
  for (let i = 0; i < articles.length; i += 1) {
    for (let j = i + 1; j < articles.length; j += 1) {
      const a = articles[i];
      const b = articles[j];
      if (normalizeCategory(a.category) !== normalizeCategory(b.category)) continue;
      const score = articleIntentSimilarity(a, b);
      if (score < CANNIBALIZATION_WARNING_SCORE) continue;
      cannibalization.push({
        score: Number(score.toFixed(3)),
        category: normalizeCategory(a.category),
        topicA: articleTopic(a),
        topicB: articleTopic(b),
        slugA: a.slug,
        titleA: a.title,
        slugB: b.slug,
        titleB: b.title
      });
    }
  }
  cannibalization.sort((a, b) => b.score - a.score);

  const topicHubs = buildTopicGroups(articles).map((group) => ({
    category: group.category,
    topic: group.topic,
    articles: group.articles.length,
    path: topicHubPath(group.category, group.topic),
    pages: topicHubPages.filter((page) => page.category === group.category && page.topic === group.topic).length
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    engine: "Virixoo Growth Engine V1",
    articleCount: articles.length,
    topicHubs,
    contextuallyIsolatedPages: contextualIsolation,
    possibleIntentOverlap: cannibalization
  };

  fs.writeFileSync(path.join(DIST_DIR, "seo-growth-report.json"), JSON.stringify(report, null, 2), "utf8");
  return report;
}

function createArticleIndex(articles) {
  const index = {
    generatedAt: new Date().toISOString(),
    totalArticles: articles.length,
    articles: sortArticlesByFreshness(articles).map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      topic: articleTopic(article),
      topicHub: hasTopicHub(article, articles) ? topicHubPath(article.category, articleTopic(article)) : "",
      image: displayImagePath(article.image || ""),
      alt: cleanImageAlt(article),
      url: articlePath(article),
      readingTime: readingTime(article.content),
      datePublished: article.datePublished || "",
      dateModified: article.dateModified || "",
      source: article.__sourceFile || ""
    }))
  };
  fs.writeFileSync(path.join(DIST_DIR, "articles-index.json"), JSON.stringify(index, null, 2), "utf8");
}

function createSitemap(articles, topicHubPages = []) {
  const siteLastmod = latestArticleDate(articles);
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: siteLastmod },
    { loc: `${SITE_URL}/cats/`, lastmod: latestArticleDate(articles.filter((a) => normalizeCategory(a.category) === "Cats")) },
    { loc: `${SITE_URL}/dogs/`, lastmod: latestArticleDate(articles.filter((a) => normalizeCategory(a.category) === "Dogs")) },
    { loc: `${SITE_URL}/categories/`, lastmod: siteLastmod },
    { loc: `${SITE_URL}/recently-updated/`, lastmod: siteLastmod },
    { loc: `${SITE_URL}/about/` },
    { loc: `${SITE_URL}/editorial-policy/` },
    { loc: `${SITE_URL}/editorial-team/` },
    { loc: `${SITE_URL}/privacy-policy/` },
    { loc: `${SITE_URL}/contact/` }
  ];

  for (const category of ["Cats", "Dogs"]) {
    const slug = category.toLowerCase();
    const categoryArticles = articles.filter((article) => normalizeCategory(article.category) === category);
    const totalPages = Math.max(1, Math.ceil(categoryArticles.length / CATEGORY_PAGE_SIZE));
    const categoryLastmod = latestArticleDate(categoryArticles);
    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
      urls.push({ loc: `${SITE_URL}/${slug}/page/${pageNumber}/`, lastmod: categoryLastmod });
    }
  }

  for (const hubPage of topicHubPages) {
    urls.push({ loc: hubPage.loc, lastmod: hubPage.lastmod || "" });
  }

  for (const article of articles) {
    urls.push({
      loc: articleUrl(article),
      lastmod: normalizedSitemapDate(article.dateModified || article.datePublished || "")
    });
  }

  const seen = new Set();
  const body = urls
    .filter((item) => {
      if (!item.loc || seen.has(item.loc)) return false;
      seen.add(item.loc);
      return true;
    })
    .map((item) => {
      const lastmod = item.lastmod ? `\n  <lastmod>${escapeHtml(item.lastmod)}</lastmod>` : "";
      return `<url>\n  <loc>${escapeHtml(item.loc)}</loc>${lastmod}\n</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), xml, "utf8");
}

function createRobots() {
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, "utf8");
}

function create404Page(articles) {
  const suggestions = sortArticlesByFreshness(articles).slice(0, 6);
  const html = `${header(
    "Page Not Found | Virixoo",
    "The page you requested could not be found. Browse Virixoo dog and cat care guides or search the site.",
    `${SITE_URL}/404.html`,
    { robots: "noindex,follow", schemas: [] }
  )}
<section class="search-page error-page" aria-labelledby="not-found-heading">
  <div class="search-page-header">
    <span class="hero-badge">404 &middot; Page Not Found</span>
    <h1 id="not-found-heading">We couldn't find that page</h1>
    <p>The link may be outdated, the page may have moved, or the address may have been typed incorrectly. You can continue with one of the options below.</p>
  </div>
  <div class="hero-actions" aria-label="404 navigation options">
    <a class="primary-button" href="/">Go to Home</a>
    <a class="secondary-button" href="/search/">Search Virixoo</a>
    <a class="secondary-button" href="/dogs/">Dog Guides</a>
    <a class="secondary-button" href="/cats/">Cat Guides</a>
    <a class="secondary-button" href="/categories/">All Categories</a>
  </div>
</section>
${suggestions.length ? `
<section class="articles-section related-section" aria-labelledby="not-found-guides">
  <div class="section-heading">
    <div><span class="eyebrow">Keep exploring</span><h2 id="not-found-guides">Helpful Pet Care Guides</h2><p>These recently added guides may help you find what you were looking for.</p></div>
  </div>
  <div class="articles-grid related-grid">
    ${suggestions.map((article) => articleCard(article, { compact: true, headingTag: "h3", showPinterest: false })).join("\n")}
  </div>
</section>` : ""}
${footer()}`;

  fs.writeFileSync(path.join(DIST_DIR, "404.html"), html, "utf8");
}

function build() {
  console.log("Starting Virixoo build...");
  const articles = loadArticles();
  console.log(`Found ${articles.length} articles.`);

  validateArticles(articles);
  validateInternalLinks(articles);
  validateArticleQuality(articles);

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);
  copyDirectory(PUBLIC_DIR, DIST_DIR);

  createDefaultImage();
  createArticleIndex(articles);

  const homeCardCount = createHomePage(articles);
  const topicHubPages = createTopicHubPages(articles);
  createRecentlyUpdatedPage(articles);

  for (const article of articles) {
    createArticlePage(article, articles);
  }

  const catsArchive = createCategoryPage(articles, "Cats", "cats");
  const dogsArchive = createCategoryPage(articles, "Dogs", "dogs");

  createCategoriesPage(articles);
  createSearchPage(articles);

  createInfoPage({
    title: "About Virixoo",
    description: "Learn how Virixoo creates practical dog and cat care guides, what our editorial approach is, and how we handle health-related pet information.",
    slug: "about",
    active: "about",
    schemaType: "AboutPage",
    contentHtml: `
      <header class="article-header">
        <span class="hero-badge">${ICONS.paw} About Virixoo</span>
        <h1>Practical pet care information, written for everyday owners</h1>
        <p class="article-summary">Virixoo is an independent pet care website focused on clear, useful guidance for people who share their lives with cats and dogs.</p>
      </header>
      <section><h2>Our Mission</h2><p>Our goal is to make everyday pet care easier to understand. We publish practical guides about behavior, nutrition, grooming, training, common health concerns and the questions pet owners frequently face at home.</p></section>
      <section><h2>What We Cover</h2><p>Virixoo focuses on cats and dogs. Our content is designed to help readers understand common situations, recognize useful next steps and identify warning signs that may require professional veterinary attention.</p></section>
      <section><h2>How We Create Our Content</h2><p>Articles are prepared by the <a href="/editorial-team/">Virixoo Editorial Team</a>. We aim to use clear language, stay focused on the question being answered, avoid unnecessary alarm, and distinguish general educational information from veterinary diagnosis or treatment.</p><p>Digital and AI-assisted tools may be used during research, outlining, drafting or production. Published material remains subject to editorial review for clarity, relevance, consistency and obvious factual issues. AI output is not treated as a veterinary source.</p></section>
      <section><h2>Health and Veterinary Information</h2><p>Virixoo does not provide veterinary diagnosis and does not replace a licensed veterinarian. When an article discusses symptoms or health concerns, we aim to explain common possibilities and warning signs while encouraging veterinary care when symptoms are severe, persistent, worsening or otherwise concerning.</p></section>
      <section><h2>Corrections and Updates</h2><p>Pet care information can change, and published pages may be updated when we identify an error, improve clarity or add useful context. Readers can report concerns through our <a href="/contact/">Contact page</a>.</p></section>
      <section><h2>Our Editorial Standards</h2><p>For more detail about sourcing, AI-assisted tools, corrections, health content and how we separate education from veterinary advice, read our <a href="/editorial-policy/">Editorial Policy</a>.</p></section>
    `
  });

  createInfoPage({
    title: "Editorial Policy",
    description: "Read Virixoo's editorial standards for pet care content, including sourcing, health information, AI-assisted tools, corrections and updates.",
    slug: "editorial-policy",
    schemaType: "WebPage",
    contentHtml: `
      <header class="article-header">
        <span class="hero-badge">Editorial Standards</span>
        <h1>Virixoo Editorial Policy</h1>
        <p class="article-summary">This policy explains how Virixoo prepares, reviews and updates its dog and cat care content.</p>
      </header>
      <section><h2>1. Purpose of Our Content</h2><p>Virixoo publishes educational information for cat and dog owners. Our goal is to explain pet care topics in practical language without overstating certainty or presenting general information as a diagnosis.</p></section>
      <section><h2>2. Research and Sources</h2><p>We aim to base health and care information on established veterinary principles and reputable references. When a topic depends on individual circumstances, we avoid presenting a single explanation as the only possible cause.</p></section>
      <section><h2>3. Writing and Editorial Review</h2><p>Content is prepared by the <a href="/editorial-team/">Virixoo Editorial Team</a>. Before publication, we aim to check each guide for clarity, relevance, internal consistency, useful context and obvious factual problems.</p></section>
      <section><h2>4. AI-Assisted Tools</h2><p>Virixoo may use digital or AI-assisted tools to support research, outlining, drafting, formatting or production. These tools do not replace editorial responsibility, and AI-generated text is not considered a veterinary authority or primary medical source.</p></section>
      <section><h2>5. Health and Safety Content</h2><p>Our health-related articles are educational. Unless a page explicitly states otherwise, content should not be interpreted as having been individually reviewed by a veterinarian. We do not claim that Virixoo provides diagnosis, treatment or emergency veterinary services.</p><p>Readers should contact a veterinarian for severe, persistent, worsening, unusual or urgent symptoms, or whenever they are concerned about an animal's condition.</p></section>
      <section><h2>6. Corrections</h2><p>If we identify a meaningful error, we aim to correct it. Readers may report factual concerns, broken links or unclear information through our <a href="/contact/">Contact page</a>.</p></section>
      <section><h2>7. Updates</h2><p>Articles may be updated to improve accuracy, clarity, usefulness, internal links, formatting or current context. Where available, the article page displays its most recent modification date.</p></section>
      <section><h2>8. Editorial Independence</h2><p>Editorial content should be written to help readers first. If Virixoo uses advertising or commercial partnerships, those relationships should not determine the factual conclusions of our pet care guides.</p></section>
    `
  });

  createInfoPage({
    title: "Virixoo Editorial Team",
    description: "Meet the Virixoo Editorial Team and learn how the team prepares practical dog and cat care content.",
    slug: "editorial-team",
    schemaType: "WebPage",
    contentHtml: `
      <header class="article-header">
        <span class="hero-badge">${ICONS.paw} Our Team</span>
        <h1>Virixoo Editorial Team</h1>
        <p class="article-summary">The Virixoo Editorial Team prepares and maintains our practical dog and cat care guides.</p>
      </header>
      <section><h2>What the Team Does</h2><p>The team researches topics, organizes information, writes and edits articles, checks internal consistency, updates older pages and maintains Virixoo's content library.</p></section>
      <section><h2>Our Scope</h2><p>Virixoo covers everyday cat and dog care, including behavior, feeding, grooming, training and common health questions. We aim to make complex topics easier to understand while being clear about the limits of general online information.</p></section>
      <section><h2>What We Do Not Claim</h2><p>The Virixoo Editorial Team is not presented as a veterinary clinic, and we do not claim that every article is reviewed by a veterinarian. When professional veterinary assessment matters, our content should say so.</p></section>
      <section><h2>How We Work</h2><p>We may use digital and AI-assisted tools during research, drafting, organization or production. Editorial responsibility remains with the Virixoo team, and our standards are described in the <a href="/editorial-policy/">Editorial Policy</a>.</p></section>
    `
  });

  createInfoPage({
    title: "Privacy Policy",
    description: "Virixoo's privacy policy explains how visitor data, cookies, analytics, advertising technologies and third-party services may be handled.",
    slug: "privacy-policy",
    schemaType: "WebPage",
    contentHtml: `
      <header class="article-header">
        <span class="hero-badge">Privacy</span>
        <h1>Privacy Policy</h1>
        <p class="article-summary">This policy explains the types of information Virixoo may process when you visit the website and how third-party services may be involved.</p>
        <p><strong>Last updated:</strong> August 15, 2026</p>
      </header>
      <section><h2>Information We May Collect</h2><p>Like many websites, Virixoo may process basic technical information such as IP address, browser type, device information, referring pages, requested URLs and timestamps through hosting logs, security tools or analytics technologies.</p></section>
      <section><h2>Analytics</h2><p>Virixoo uses site analytics, including Google Analytics where enabled, to understand general traffic patterns and improve the website. Analytics tools may rely on cookies, local storage, server logs or similar identifiers.</p></section>
      <section><h2>Cookies and Similar Technologies</h2><p>Cookies or similar technologies may be used for essential site functionality, analytics, preferences, security and&mdash;if advertising is enabled&mdash;ad delivery and measurement.</p></section>
      <section><h2>Advertising</h2><p>Virixoo uses third-party advertising technologies on pages where ads are active, including Mondiad, and may use additional services such as Google AdSense. Advertising providers may use cookies or similar technologies to serve, personalize or measure ads in accordance with their own policies and applicable law.</p></section>
      <section><h2>Third-Party Links and Services</h2><p>Virixoo may link to third-party websites or use third-party services. Those services operate under their own privacy practices, and Virixoo does not control their independent data handling.</p></section>
      <section><h2>Contact Form Data</h2><p>If you submit information through the Virixoo contact form, the details you provide may be processed for the purpose of responding to your message, reviewing corrections or handling site-related inquiries.</p></section>
      <section><h2>Data Retention</h2><p>Information should be kept only for as long as reasonably necessary for the purpose for which it was collected, including security, site operation, communication and legal obligations where applicable.</p></section>
      <section><h2>Your Choices</h2><p>You can control cookies through your browser settings. If consent tools are introduced for advertising or analytics, additional choices may be presented directly on the website.</p></section>
      <section><h2>Policy Changes</h2><p>This policy may be updated when Virixoo changes its technology, analytics, advertising or data practices. The latest version will be published on this page.</p></section>
      <section><h2>Questions About Privacy</h2><p>For privacy questions or concerns, use the <a href="/contact/">Contact page</a>.</p></section>
    `
  });

  createInfoPage({
    title: "Contact Virixoo",
    description: "Contact Virixoo about corrections, editorial questions, privacy concerns, broken links or general site feedback.",
    slug: "contact",
    active: "contact",
    schemaType: "ContactPage",
    contentHtml: `
      <header class="article-header">
        <span class="hero-badge">Contact</span>
        <h1>Contact Virixoo</h1>
        <p class="article-summary">Use this page for factual corrections, editorial questions, privacy concerns, broken links or general feedback about Virixoo.</p>
      </header>
      <section>
        <h2>What You Can Contact Us About</h2>
        <ul>
          <li>Possible factual errors or unclear information</li>
          <li>Broken links or technical problems</li>
          <li>Privacy-related questions</li>
          <li>Editorial feedback or content suggestions</li>
          <li>General questions about Virixoo</li>
        </ul>
      </section>
      <section>
        <h2>Send a Message</h2>
        <form class="contact-form" name="virixoo-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/contact/?sent=1">
          <input type="hidden" name="form-name" value="virixoo-contact">
          <p hidden><label>Do not fill this out: <input name="bot-field"></label></p>
          <p><label for="contact-name">Name</label><input id="contact-name" name="name" type="text" autocomplete="name" required></p>
          <p><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" autocomplete="email" required></p>
          <p>
            <label for="contact-topic">Topic</label>
            <select id="contact-topic" name="topic">
              <option value="correction">Correction or factual concern</option>
              <option value="privacy">Privacy question</option>
              <option value="technical">Technical or broken link issue</option>
              <option value="editorial">Editorial feedback</option>
              <option value="general">General inquiry</option>
            </select>
          </p>
          <p><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="7" required></textarea></p>
          <button class="primary-button" type="submit">Send message</button>
        </form>
        <p class="editorial-note">Please do not use this form for veterinary emergencies. Contact a veterinarian or local emergency veterinary service for urgent medical concerns.</p>
      </section>
    `
  });

  create404Page(articles);
  const growthReport = createGrowthReport(articles, topicHubPages);
  createRobots();
  createSitemap(articles, topicHubPages);

  console.log("Virixoo build completed successfully.");
  console.log(`Generated ${articles.length} article pages.`);
  console.log(`Homepage article cards rendered: ${homeCardCount}`);
  console.log(`Cats archive: ${catsArchive.totalArticles} articles across ${catsArchive.totalPages} page(s).`);
  console.log(`Dogs archive: ${dogsArchive.totalArticles} articles across ${dogsArchive.totalPages} page(s).`);
  console.log(`Topic hub pages generated: ${topicHubPages.length}.`);
  console.log(`Contextually isolated pages flagged: ${growthReport.contextuallyIsolatedPages.length}.`);
  console.log(`Possible intent-overlap pairs flagged: ${growthReport.possibleIntentOverlap.length}.`);
}

try {
  build();
} catch (error) {
  console.error("BUILD FAILED:");
  console.error(error);
  process.exit(1);
}
// === END OF FILE ===
