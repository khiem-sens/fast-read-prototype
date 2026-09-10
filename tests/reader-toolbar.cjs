// Run with: node tests/reader-toolbar.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');

assert.match(html, /\.reader-bottombar\s*\{[^}]*background:\s*#fff;[^}]*height:\s*72px;/);
assert.match(html, /\.bottombar-icons button\s*\{[^}]*background:\s*transparent;[^}]*border:\s*none;/);
assert.match(html, /\.bottombar-icons img\s*\{[^}]*width:\s*36px;[^}]*height:\s*38px;[^}]*object-fit:\s*contain;/);
assert.match(html, /\.bottombar-icons img\.bm-filled\s*\{[^}]*transform:\s*scale\(0\.82\);/);
assert.match(html, /ASSETS\.toolbarTranslate/);
assert.match(html, /ASSETS\.toolbarSettings/);
assert.match(html, /ASSETS\.toolbarBookmark/);
assert.match(html, /ASSETS\.toolbarShare/);
assert.match(html, /\.sheet\s*\{[^}]*background:\s*#fff;/);
assert.match(html, /<div class="sheet">\s*<div class="sheet-handle">/);
assert.match(html, /\.swipe-hint\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*96px;/);
assert.match(html, /screenEl\.addEventListener\("pointerup", \(e\) => \{[\s\S]*?const postContent = e\.target\.closest\("\.post-content"\);[\s\S]*?state\.bookmarked\.add\(post\.id\);\s*refreshBottombar\(\);\s*showBookmarkHint\(\);/);
assert.match(html, /function showBookmarkHint\(\)\s*\{\s*showCenterHint\(tr\("bookmarked"\), "bookmark"\);/);

console.log('PASS: reader toolbar, sheets, toast placement, and double-tap bookmark feedback use the shared design');
