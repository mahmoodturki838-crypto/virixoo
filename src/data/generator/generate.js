```javascript
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

// ============================================
// Virixoo AI Article Generator
// Test Mode: Generates ONE article only
// ============================================

const topicsPath = path.join(__dirname, "..", "data", "topics.json");
const articlesPath = path.join(__dirname, "..", "data", "articles.json");

const API_KEY = process.env.GEMINI_API_KEY;

// Change this model if needed later.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";


// ============================================
// Load topics
// ============================================

function loadTopics() {
  if (!fs.existsSync(topicsPath)) {
    throw new Error("topics.json was not found.");
  }

  const data = JSON.parse(
    fs.readFileSync(topicsPath, "utf8")
  );

  if (!data.topics || !Array.isArray(data.topics)) {
    throw new Error(
      "topics.json must contain a 'topics' array."
    );
  }

  return data.topics;
}


// ============================================
// Load existing articles
// ============================================

function loadArticles() {
  if (!fs.existsSync(articlesPath)) {
    return [];
  }

  const data = JSON.parse(
    fs.readFileSync(articlesPath, "utf8")
  );

  if (Array.isArray(data)) {
    return data;
  }

  if (data.articles && Array.isArray(data.articles)) {
    return data.articles;
  }

  throw new Error(
    "articles.json must contain an articles array."
  );
}


// ============================================
// Find next unused topic
// ============================================

function getNextTopic(topics) {
  return topics.find(
    (topic) => topic.status === "unused"
  );
}


// ============================================
// Validate topic
// ============================================

function validateTopic(topic) {
  const requiredFields = [
    "id",
    "topic",
    "category",
    "subcategory",
    "primaryKeyword",
    "searchIntent",
    "status"
  ];

  for (const field of requiredFields) {
    if (!topic[field]) {
      throw new Error(
        `Topic "${topic.id || "unknown"}" is missing "${field}".`
      );
    }
  }
}


// ============================================
// Create URL slug
// ============================================

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


// ============================================
// Check duplicate slug
// ============================================

function slugExists(slug, articles) {
  return articles.some(
    (article) => article.slug === slug
  );
}


// ============================================
// Create Gemini client
// ============================================

function createGeminiClient() {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to your environment or GitHub Secrets."
    );
  }

  return new GoogleGenAI({
    apiKey: API_KEY
  });
}


// ============================================
// Generate article with Gemini
// ============================================

async function generateArticle(topic) {
  const ai = createGeminiClient();

  const prompt = `
You are the senior editorial writer for Virixoo, an English-language
website focused on practical cat and dog care.

Write ONE original, useful, trustworthy article based on this topic.

TOPIC:
${topic.topic}

CATEGORY:
${topic.category}

SUBCATEGORY:
${topic.subcategory}

PRIMARY KEYWORD:
${topic.primaryKeyword}

SEARCH INTENT:
${topic.searchIntent}

CONTENT RULES:

1. Write for real cat and dog owners.
2. Answer the search intent directly.
3. Do not keyword stuff.
4. Use natural English.
5. Keep the writing clear and easy to understand.
6. Avoid unnecessary repetition.
7. Do not invent scientific studies, veterinary statistics, quotes,
   experts, or sources.
8. Do not provide dangerous medical advice.
9. Never invent medication names, dosages, or treatment protocols.
10. If the topic involves a potentially serious health concern,
    clearly recommend contacting a veterinarian when appropriate.
11. Give practical steps that a pet owner can safely follow.
12. Include useful examples where appropriate.
13. The article must be genuinely helpful rather than written only
    for search engines.
14. Do not mention AI, prompts, content generation, or this instruction.

ARTICLE STRUCTURE:

- H1 title
- Short introduction
- Quick Answer
- Key Takeaways
- Several useful H2 sections
- H3 sections when helpful
- Practical step-by-step advice when appropriate
- Common mistakes when relevant
- When to seek professional/veterinary help when relevant
- FAQ section with useful questions when appropriate
- Short conclusion

SEO:

- Use the primary keyword naturally.
- Include related terms naturally.
- Do not force exact-match keywords repeatedly.
- Create a concise meta description.
- Create image alt text.

IMPORTANT OUTPUT FORMAT:

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "",
  "slug": "",
  "excerpt": "",
  "metaDescription": "",
  "primaryKeyword": "",
  "category": "",
  "subcategory": "",
  "content": "",
  "imageAlt": "",
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ]
}

The "content" field must contain the complete article body
using HTML elements such as:

<h1>
<p>
<h2>
<h3>
<ul>
<li>
<strong>

Do not include markdown fences.
Do not include commentary outside the JSON.
`;

  console.log("\nSending article request to Gemini...");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  const text = response.text;

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  let article;

  try {
    article = JSON.parse(text);
  } catch (error) {
    console.error("Gemini response:");
    console.error(text);

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }

  return article;
}


// ============================================
// Validate generated article
// ============================================

function validateGeneratedArticle(article, topic) {
  const requiredFields = [
    "title",
    "slug",
    "excerpt",
    "metaDescription",
    "primaryKeyword",
    "category",
    "subcategory",
    "content",
    "imageAlt"
  ];

  for (const field of requiredFields) {
    if (
      !article[field] ||
      typeof article[field] !== "string"
    ) {
      throw new Error(
        `Generated article is missing "${field}".`
      );
    }
  }

  if (!article.content.includes("<h1")) {
    throw new Error(
      "Generated article does not contain an H1."
    );
  }

  if (!article.content.includes("<h2")) {
    throw new Error(
      "Generated article does not contain H2 sections."
    );
  }

  if (
    !article.primaryKeyword
      .toLowerCase()
      .includes(topic.primaryKeyword.toLowerCase())
  ) {
    console.warn(
      "Warning: Primary keyword differs from topic keyword."
    );
  }

  if (article.metaDescription.length > 170) {
    console.warn(
      "Warning: Meta description may be too long."
    );
  }

  return true;
}


// ============================================
// Prepare final article
// ============================================

function prepareArticle(article, topic) {
  return {
    id: topic.id,
    title: article.title,
    slug: article.slug || createSlug(article.title),
    category: topic.category,
    subcategory: topic.subcategory,
    primaryKeyword: topic.primaryKeyword,
    searchIntent: topic.searchIntent,
    excerpt: article.excerpt,
    metaDescription: article.metaDescription,
    imageAlt: article.imageAlt,
    content: article.content,
    faq: Array.isArray(article.faq)
      ? article.faq
      : [],
    status: "draft",
    generatedAt: new Date().toISOString()
  };
}


// ============================================
// Save article to articles.json
// ============================================

function saveArticle(article, articles) {
  const updatedArticles = [
    ...articles,
    article
  ];

  fs.writeFileSync(
    articlesPath,
    JSON.stringify(
      {
        articles: updatedArticles
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(
    "\nArticle saved to articles.json"
  );
}


// ============================================
// Main
// ============================================

async function main() {
  try {
    console.log("====================================");
    console.log("Virixoo AI Article Generator");
    console.log("====================================");

    const topics = loadTopics();
    const articles = loadArticles();

    console.log(
      `Total topics: ${topics.length}`
    );

    console.log(
      `Existing articles: ${articles.length}`
    );

    const topic = getNextTopic(topics);

    if (!topic) {
      console.log(
        "\nNo unused topics are available."
      );
      return;
    }

    validateTopic(topic);

    console.log("\nSelected topic:");
    console.log("-----------------------------");
    console.log(`ID: ${topic.id}`);
    console.log(`Title: ${topic.topic}`);
    console.log(`Category: ${topic.category}`);
    console.log(`Subcategory: ${topic.subcategory}`);
    console.log(`Primary Keyword: ${topic.primaryKeyword}`);
    console.log(`Search Intent: ${topic.searchIntent}`);
    console.log("-----------------------------");

    const predictedSlug = createSlug(topic.topic);

    if (
      slugExists(predictedSlug, articles)
    ) {
      throw new Error(
        `Duplicate slug detected: ${predictedSlug}`
      );
    }

    const generated = await generateArticle(topic);

    validateGeneratedArticle(
      generated,
      topic
    );

    const finalArticle = prepareArticle(
      generated,
      topic
    );

    if (
      slugExists(
        finalArticle.slug,
        articles
      )
    ) {
      throw new Error(
        `Generated slug already exists: ${finalArticle.slug}`
      );
    }

    saveArticle(
      finalArticle,
      articles
    );

    console.log("\n====================================");
    console.log("SUCCESS");
    console.log("====================================");
    console.log(`Article: ${finalArticle.title}`);
    console.log(`Slug: ${finalArticle.slug}`);
    console.log(`Status: ${finalArticle.status}`);
    console.log(
      "The first AI article has been generated successfully."
    );
    console.log(
      "Publishing automation is NOT enabled yet."
    );

  } catch (error) {
    console.error("\n====================================");
    console.error("GENERATION FAILED");
    console.error("====================================");
    console.error(error.message);

    process.exit(1);
  }
}

main();
```
