const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync("index.html", "utf8");
const source = html.slice(html.indexOf("      function buildFeed"), html.indexOf("      function matchesTopic"));
const buildFeed = new Function("ADS", `${source}; return buildFeed;`)([{ kind: "ad" }]);
const posts = Array.from({ length: 4 }, (_, id) => ({ id }));

assert.deepEqual(buildFeed(posts).map((item) => item.kind), ["post", "post", "post", "ad", "post"]);
assert.match(html, /VISITOR_FLOW \? filteredLatest\(\)\.slice\(0, 4\) : filteredLatest\(\)/);
assert.match(html, /\.showing-caught-up \.reader-bottombar \{\s*display: none;/);
assert.match(html, /function syncLayout\(\)[\s\S]*?itemEls\.forEach[\s\S]*?snap\(opts\.getIndex\(\)\);/);
assert.match(html, /caughtUpChanged\) \(state\.activeTab === "latest" \? vLatest : vCurated\)\.syncLayout\(\);/);
assert.match(html, /caught-up-copy[\s\S]*?data-caught-up-top-stories[\s\S]*?data-back-home[\s\S]*?caught-up-card/);
assert.match(html, /\.caught-up-slide\s*\{[\s\S]*?margin:\s*0;/);
assert.match(html, /carousel\.addEventListener\("scroll", setActive, \{ passive: true \}\);/);

console.log("PASS: visitor Latest ends after the fourth post with a full-height caught-up screen");
