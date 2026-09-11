// Run with: node tests/summary-topic-rules.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

for (const page of ["index.html", "fast-read-prototype.html"]) {
  const html = fs.readFileSync(path.join(__dirname, "..", page), "utf8");
  const profileTopics = ["Cybersecurity", "Digital Economy", "Digital Government"];
  const summaryTopics = ["Defence", "Emerging Tech", "Resilience", "Leadership", "Trade & Economy"];

  assert.match(html, /const SUMMARY_TOPICS = \["Defence", "Emerging Tech", "Resilience", "Leadership", "Trade & Economy"\];/, `${page}: summary offers the requested five topics`);
  assert.equal(summaryTopics.length, 5, `${page}: summary contains five topic cards`);
  assert(summaryTopics.every((topic) => !profileTopics.includes(topic)), `${page}: every summary topic is outside the profile`);

  const saveSource = html.slice(
    html.indexOf("        function saveSummaryTopics"),
    html.indexOf("        function continueSummary"),
  );
  assert.match(saveSource, /state\.selectedTopics = selected;/, `${page}: selected cards drive this reading session`);
  assert.doesNotMatch(saveSource, /savedTopics\.push/, `${page}: choosing a card does not change the profile`);
  assert.match(html, /function continueSummary\(tab\)[\s\S]*?appendTopicPosts\(tab, selected\);/, `${page}: Continue Reading shows posts from selected topics`);
  assert.match(html, /function topicDemoPosts\(topic\)[\s\S]*?tags: \[\{ l: topic, c: TEAL \}\]/, `${page}: each selected unfamiliar topic keeps its topic on its posts`);
  assert.match(html, /function isLikePromptPost\(post\) \{\s*return state\.topicSelectionGroup === "explore" && post\.tags\.some\(\(tag\) => state\.selectedTopics\.includes\(tag\.l\)\);/, `${page}: every selected More to Explore post receives the like prompt`);
  assert.match(html, /else if \(!state\.savedTopics\.includes\(topic\) && selected\.filter\(\(selectedTopic\) => !state\.savedTopics\.includes\(selectedTopic\)\)\.length >= 2\) return;/, `${page}: the summary cannot select more than two related topics`);
}

console.log("PASS: five fixed summary topics stay outside the profile and selected More to Explore posts receive likes");
