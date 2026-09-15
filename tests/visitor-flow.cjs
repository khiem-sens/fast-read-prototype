// Run with: node tests/visitor-flow.cjs
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const visitor = fs.readFileSync(path.join(root, "visitor", "index.html"), "utf8");

assert.match(visitor, /index\.html\?flow=visitor/, "visitor URL starts the isolated visitor mode");
assert.match(html, /button\.dataset\.feedTab !== "latest"/, "only Latest is a public feed tab");
assert.match(html, /button\.dataset\.storyGroup !== "topStoriesWeek"/, "Top Stories This Week remains public");
assert.match(html, /onRequireLogin\(\{ type: "bookmark", postId: post\.id \}\)/, "bookmarking asks visitors to sign in");
assert.match(html, /action\.type === "bookmark" \? "Found something worth saving\?" : "Make your daily catch-up more relevant"/, "bookmark sign-up uses saving-focused copy");
assert.match(html, /bookmarked\.add\(pendingAction\.postId\)/, "the pending bookmark is restored after login");
assert.match(html, /readerTab = pendingAction && pendingAction\.type === "category" && pendingAction\.value === "curated" \? "curated" : "latest"/, "login returns visitors to the Curated For You feed they selected");
assert.match(html, /showCenterHint\("Exclusive features unlocked!\\nThank you for registering\."\)/, "login shows an account-unlocked message");
assert.match(html, /showScreen\("reader"\);\s*reader1\.showLoginHint\(\);/, "login returns to Quick Digest with the account-unlocked message");
assert.match(html, /src="assets\/ph_confetti\.svg"/, "login notification uses the supplied confetti icon");
assert.match(html, /\.auth-back\s*\{[\s\S]*?width: max-content;[\s\S]*?padding: 16px;/, "Back button uses 16px padding on every side");
assert.match(html, /\.auth-title\s*\{[\s\S]*?font-size: 28px;[\s\S]*?line-height: 37px;/, "auth heading matches the Figma type scale");
assert.match(html, /authGoogle: "assets\/figma-auth-google\.svg"/, "auth uses the exported Figma provider icons");

console.log("PASS: visitor access, authentication, and pending bookmark handoff are wired");
