// Run with: node tests/header-tabs.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

for (const file of ['index.html', 'fast-read-prototype.html']) {
  const html = fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8');
  assert.doesNotMatch(html, /class="reader-tabbar-tabs"/);
  assert.match(html, /data-feed-tab="latest"/);
  assert.match(html, /data-feed-tab="curated"/);
  assert.match(html, /const activeFeedTab = pendingTopics\.length \|\| activeStoryGroup \? null : state\.activeTab;/);
  assert.match(html, /onSelectFeedTab\(tab\) \{ state\.activeTab = tab; state\.storyGroup = null; state\.selectedTopics = \[\];/);
}

console.log('PASS: Latest and Curated For You are feed picker options');
