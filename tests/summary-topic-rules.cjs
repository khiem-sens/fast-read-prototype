// Run with: node tests/summary-topic-rules.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

for (const page of ["index.html", "fast-read-prototype.html"]) {
  const html = fs.readFileSync(path.join(__dirname, "..", page), "utf8");
  const recommendationSource = html.slice(
    html.indexOf("      function pickRecommendedTopics"),
    html.indexOf("      const INITIAL_VISIBLE"),
  );
  const pickRecommendedTopics = new Function(
    "topicsWithLatestArticles",
    "TOPIC_RELATIONS",
    "shuffle",
    `${recommendationSource}; return pickRecommendedTopics;`,
  )(
    () => new Set([
      "Cybersecurity", "Digital Economy", "Digital Government",
      "Resilience", "Defence", "Data", "Trade & Economy", "Cross-border Innovation",
    ]),
    {
      Cybersecurity: ["Resilience", "Defence", "Data"],
      "Digital Economy": ["Trade & Economy", "Cross-border Innovation"],
      "Digital Government": ["Data"],
    },
    (items) => items,
  );
  const profileTopics = ["Cybersecurity", "Digital Economy", "Digital Government"];
  const summaryTopics = pickRecommendedTopics(profileTopics, 5);

  assert.deepEqual(summaryTopics.slice(0, 3), profileTopics, `${page}: first three cards are profile topics`);
  assert.equal(summaryTopics.length, 5, `${page}: summary contains five topic cards`);
  assert(summaryTopics.slice(3).every((topic) => !profileTopics.includes(topic)), `${page}: final two cards are outside the profile`);

  const saveSource = html.slice(
    html.indexOf("        function saveSummaryTopics"),
    html.indexOf("        function continueSummary"),
  );
  assert.match(saveSource, /state\.selectedTopics = selected;/, `${page}: selected cards drive this reading session`);
  assert.doesNotMatch(saveSource, /savedTopics\.push/, `${page}: choosing a card does not change the profile`);
  assert.match(html, /function continueSummary\(tab\)[\s\S]*?appendTopicPosts\(tab, selected\);/, `${page}: Continue Reading shows posts from selected topics`);
  assert.match(html, /function surpriseSummary\(tab\)[\s\S]*?!post\.tags\.some\(\(tag\) => state\.savedTopics\.includes\(tag\.l\)\)/, `${page}: Surprise Me excludes profile topics`);
  assert.match(html, /const showLike = item && item\.kind === "post" && \(!liked \|\| showingLikeConfirmation\);/, `${page}: selected related-topic posts retain the normal like prompt`);
  assert.match(html, /class="ts-suggestions-panel" data-suggestions[\s\S]*?You might like/, `${page}: related topics have their own You might like section`);
  assert.match(html, /const suggestedTopics = pendingTopics\.filter\(\(topic\) => !state\.savedTopics\.includes\(topic\)\)\.slice\(0, 2\);/, `${page}: the You might like section has no more than two topics`);
  assert.match(html, /else if \(!state\.savedTopics\.includes\(topic\) && selected\.filter\(\(selectedTopic\) => !state\.savedTopics\.includes\(selectedTopic\)\)\.length >= 2\) return;/, `${page}: the summary cannot select more than two related topics`);
}

console.log("PASS: five-card summaries preserve the 3 profile / 2 related-topic rule and selected topics stay outside the profile");
