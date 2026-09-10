// Run with: node tests/top-stories.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');

assert.match(html, /--sky-blue-100:\s*#e6f2fb;/i);
assert.match(html, /\.event-slide\s*\{[^}]*background:\s*var\(--sky-blue-100\);/);
assert.match(html, /<button type="button" class="ts-row ts-top-stories-btn" data-top-stories>/);
assert.match(html, /state\.selectedTopic = t;\s*cbs\.onSelectTopic\(state\.selectedTopic\);/);
assert.match(html, /\[data-top-stories\][\s\S]*?state\.selectedTopic = null;\s*cbs\.onSelectTopic\(null\);/);

console.log('PASS: Top Stories clears the filter; a selected topic stays selected; events use sky blue 100');
