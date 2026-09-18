const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync("index.html", "utf8");
const source = html.slice(html.indexOf("      function buildFeed"), html.indexOf("      function matchesTopic"));
const buildFeed = new Function("ADS", `${source}; return buildFeed;`)([{ kind: "ad" }]);
const posts = Array.from({ length: 4 }, (_, id) => ({ id }));

assert.deepEqual(buildFeed(posts).map((item) => item.kind), ["post", "post", "post", "ad", "post"]);
assert.match(html, /VISITOR_FLOW \? filteredLatest\(\)\.slice\(0, 4\) : filteredLatest\(\)/);
assert.doesNotMatch(html, /\.showing-caught-up \.reader-bottombar \{\s*display: none;/);
assert.match(html, /\.showing-caught-up \.bottombar-icons \{\s*display: none;/);
assert.match(html, /function syncLayout\(\)[\s\S]*?itemEls\.forEach[\s\S]*?snap\(opts\.getIndex\(\)\);/);
assert.match(html, /caughtUpChanged\) \(state\.activeTab === "latest" \? vLatest : vCurated\)\.syncLayout\(\);/);
assert.match(html, /caught-up-copy[\s\S]*?caught-up-card[\s\S]*?data-caught-up-signup[\s\S]*?data-caught-up-top-stories[\s\S]*?data-back-home/);
assert.match(html, /data-caught-up-top-stories[\s\S]*?src="assets\/double-arrow\.svg"/);
assert.match(html, /visitorCaughtUpHomepage: "assets\/visitor-caught-up\/personalised-homepage\.png"/);
assert.match(html, /visitorCaughtUpDigest: "assets\/visitor-caught-up\/quick-digest\.png"/);
assert.match(html, /visitorCaughtUpBookmarks: "assets\/visitor-caught-up\/bookmarks\.png"/);
assert.match(html, /visitorCaughtUpTopStories: "assets\/visitor-caught-up\/top-stories\.png"/);
assert.match(html, /topStoriesExpanded: false/);
assert.match(html, /topStoriesStartIndex: null/);
assert.match(html, /state\.topStoriesExpanded \? feed\.concat\(buildFeed\(state\.latestPosts\.slice\(4, 8\)\), \[topStoriesCaughtUpItem\(\)\]\) : feed/);
assert.match(html, /function openVisitorTopStories\(\)[\s\S]*?state\.latestIndex = firstTopStoryIndex;[\s\S]*?vLatest\.snapCurrent\(true\)/);
assert.match(html, /state\.topStoriesExpanded && currentIndex\(\) >= state\.topStoriesStartIndex/);
assert.match(html, /function topStoriesCaughtUpItem\(\) \{ return \{ kind: "top-stories-caught-up" \}; \}/);
assert.match(html, /You’ve reached your 4 free Top Stories articles for today\.[\s\S]*?Come back tomorrow for more\./);
assert.match(html, /\.caught-up-slide\s*\{[\s\S]*?margin:\s*0;/);
assert.match(html, /carousel\.addEventListener\("scroll", setActive, \{ passive: true \}\);/);

console.log("PASS: visitor Latest ends after the fourth post with a full-height caught-up screen");
