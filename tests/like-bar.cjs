// Run with: node tests/like-bar.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
assert.match(html, /\.reader-likebar svg\s*\{[^}]*width:\s*20px;[^}]*height:\s*20px;/, 'the like icon is compact');
assert.match(html, /\.reader-likebar\s*\{[^}]*color:\s*var\(--ink\);/, 'the default like prompt is black');
assert.match(html, /\.reader-likebar\[aria-pressed="true"\]\s*\{[^}]*color:\s*var\(--purple\);/, 'only the Got it confirmation is purple');
assert.match(html, /\.reader-likebar\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*72px;[\s\S]*?\.reader-likebar\.show\s*\{[^}]*visibility:\s*visible;/, 'the like bar overlays the feed without changing its height');
assert.doesNotMatch(html, /likeBtn\.hidden/, 'the like bar never resizes the feed by toggling hidden');
assert.match(html, /const showingLikeConfirmation = state\.likeConfirmationPostId === post\.id;[\s\S]*?const showLike = item && item\.kind === "post" && \(!liked \|\| showingLikeConfirmation\);/, 'every unread post shows the bar and an active confirmation remains visible');
assert.match(html, /state\.likeConfirmationPostId = post\.id;[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?state\.likeConfirmationPostId = null;[\s\S]*?refreshBottombar\(\);[\s\S]*?\}, 2000\);/, 'Got it clears after two seconds');

console.log('PASS: the like confirmation expires after two seconds and uses a compact icon');
