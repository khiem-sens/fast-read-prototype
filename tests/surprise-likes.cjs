// Run with: node tests/surprise-likes.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
for (const page of ['index.html', 'fast-read-prototype.html']) {
  const html = fs.readFileSync(require('node:path').join(__dirname, '..', page), 'utf8');
  assert.match(html, /data-like[\s\S]*?More content like this/);
  assert.match(html, /const showLike = item && item\.kind === "post"/);
  assert.match(html, /likedPosts: new Set\(\)/);
  assert.match(html, /likesForTopic === 3 && !state\.savedTopics\.includes\(topic\.l\)[\s\S]*?state\.savedTopics\.push\(topic\.l\)/);
  assert.match(html, /const surpriseTopic = [\s\S]*?\.length >= 3[\s\S]*?slice\(0, surpriseTopic \? 3 : 2\)/);
}

console.log('PASS: Surprise Me likes are topic-counted and promote the third-liked topic to favorites');
