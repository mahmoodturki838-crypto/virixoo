const fs = require("fs");
const path = require("path");

const topicsPath = path.join(__dirname, "..", "data", "topics.json");

function loadTopics() {
  if (!fs.existsSync(topicsPath)) {
    throw new Error("topics.json was not found.");
  }

  const data = JSON.parse(fs.readFileSync(topicsPath, "utf8"));

  if (!data.topics || !Array.isArray(data.topics)) {
    throw new Error("topics.json must contain a 'topics' array.");
  }

  return data.topics;
}

function getNextTopic(topics) {
  return topics.find((topic) => topic.status === "unused");
}

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

function prepareArticleData(topic) {
  return {
    id: topic.id,
    title: topic.topic,
    slug: createSlug(topic.topic),
    category: topic.category,
    subcategory: topic.subcategory,
    primaryKeyword: topic.primaryKeyword,
    searchIntent: topic.searchIntent,
    status: "draft"
  };
}

function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function main() {
  console.log("====================================");
  console.log("Virixoo Auto Publisher");
  console.log("Article Generator Test");
  console.log("====================================");

  const topics = loadTopics();

  console.log(`Total topics: ${topics.length}`);

  const nextTopic = getNextTopic(topics);

  if (!nextTopic) {
    console.log("No unused topics are available.");
    return;
  }

  validateTopic(nextTopic);

  const article = prepareArticleData(nextTopic);

  console.log("\nSelected topic:");
  console.log("-----------------------------");
  console.log(`ID: ${article.id}`);
  console.log(`Title: ${article.title}`);
  console.log(`Category: ${article.category}`);
  console.log(`Subcategory: ${article.subcategory}`);
  console.log(`Primary Keyword: ${article.primaryKeyword}`);
  console.log(`Search Intent: ${article.searchIntent}`);
  console.log(`Slug: ${article.slug}`);
  console.log(`Status: ${article.status}`);
  console.log("-----------------------------");

  console.log("\nTopic selection test completed successfully.");
}

main();
