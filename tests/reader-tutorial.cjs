// Run with: node tests/reader-tutorial.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');

assert.doesNotMatch(html, /reader-tour-tabs-card|Use the <strong>Top Stories<\/strong> menu/);
assert.match(html, /Change content category by tapping the category name on this toolbar\./);
assert.match(html, /data-tour-step="2"[\s\S]*Double tap the article or use the Bookmark button to bookmark it\./);
assert.match(html, /data-tour-step="2"[\s\S]*If you find the article interesting, you can share it using the Share button\./);
assert.match(html, /data-tour-step="1"\] \[data-language-settings\][\s\S]*data-tour-step="1"\] \[data-reading-settings\]/);
assert.match(html, /data-tour-step="2"\] \[data-bookmark\][\s\S]*data-tour-step="2"\] \[data-share\]/);
assert.match(html, /data-tour-step="1"\] \.reader-bottombar::before\s*\{[^}]*background:\s*#fff;/);
assert.match(html, /data-tour-step="2"\] \.bottombar-icons::after\s*\{[^}]*width:\s*82px;[^}]*background:\s*#fff;/);
assert.doesNotMatch(html, /data-tour-step="1"\][^{]+\{[^}]*box-shadow:\s*0 0 0 8px #fff;/);

console.log('PASS: reader tutorial matches the headerless toolbar design');
