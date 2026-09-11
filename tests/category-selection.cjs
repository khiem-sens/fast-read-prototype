// Run with: node tests/category-selection.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

for (const page of ["index.html", "fast-read-prototype.html"]) {
  const html = fs.readFileSync(path.join(__dirname, "..", page), "utf8");
  const feedTabHandler = html.slice(html.indexOf("onSelectFeedTab(tab)"), html.indexOf("onSelectStoryGroup(group)"));
  assert.match(html, /function shufflePosts\(\) \{ state\.latestPosts = shuffle\(ALL_LATEST\); state\.curatedPosts = shuffle\(ALL_CURATED\); \}/, `${page}: category changes shuffle both feeds`);
  assert.match(html, /function filteredCurated\(\) \{ return state\.curatedPosts; \}/, `${page}: Curated renders the shuffled feed`);
  assert.match(feedTabHandler, /state\.selectedTopics = \[\]; state\.topicSelectionGroup = null;[\s\S]*?shufflePosts\(\);[\s\S]*?slider\.setActive\(tab, false\);/, `${page}: picker swaps feeds without the tab slide`);
  assert.doesNotMatch(feedTabHandler, /moreToExploreTopics\s*=/, `${page}: More to Explore remains after switching feeds`);
  assert.match(html, /state\.activeTab = initialTabGetter\(\) === "curated" \? "curated" : "latest";/, `${page}: the curated homepage Quick Digest opens Curated`);
  assert.doesNotMatch(html, /if \(state\.activeTab === "latest"\) \{\s*if \(state\.moreToExploreTopics\.length \|\| state\.selectedTopics\.length\)/, `${page}: Curated has the category picker in its toolbar`);
}

console.log("PASS: category changes reshuffle without sliding, preserve More to Explore, and Curated opens from its homepage CTA");
