// Run with: node tests/story-group-selection.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

for (const file of ['index.html', 'fast-read-prototype.html']) {
  const html = fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8');
  assert.match(html, /const activeStoryGroup = pendingTopics\.length \? null : state\.storyGroup;/);
  assert.match(html, /const selected = button\.dataset\.storyGroup === activeStoryGroup;/);
  assert.match(html, /onSelectTopics\(topics\) \{ state\.moreToExploreTopics = state\.moreToExploreTopics\.length \? topics\.slice\(\) : \[\]; state\.storyGroup = topics\.length \? null : state\.storyGroup;/);
  assert.match(html, /onSelectStoryGroup\(group\) \{ state\.storyGroup = group;[\s\S]*?state\.selectedTopics = \[\];/);
  assert.match(html, /const suggestedTopics = state\.moreToExploreTopics;/);
  assert.match(html, /state\.moreToExploreTopics = selected;/);
  assert.match(html, /More to Explore/);
  assert.match(html, /peopleLikeYou:\s*"Trending Among Your Peers"/);
  assert.match(html, /industry:\s*"Most Read In Your Industry"/);
  assert.match(html, /sector:\s*"Most Read In Your Sector"/);
}

console.log('PASS: story groups and topic selections are mutually exclusive');
