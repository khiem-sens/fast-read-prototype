// Run with: node tests/summary-navigation.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
const source = html.slice(html.indexOf('    function extendedPosts('), html.indexOf('    function currentFeed('));
const state = { extended: { latest: [], curated: [] } };
const base = [{kind:'post', id:'base'}, {kind:'event', id:'event'}];
const feeds = new Function('state', 'buildFeed', 'filteredLatest', 'filteredCurated', 'summaryItem', source + '; return { latest: feedLatest, curated: feedCurated };')(
  state, posts => posts, () => base, () => base, tab => ({kind:'summary', tab})
);
for (const tab of ['latest', 'curated']) {
  assert.equal(feeds[tab]().at(-1).kind, 'summary');
  for (const topic of ['Healthcare', 'Digital Government']) {
    const items = [1, 2].map(id => ({kind:'post', id: `${topic}-${id}`}));
    state.extended[tab].push({topic, items});
    const feed = feeds[tab]();
    assert.equal(feed.filter(item => item.kind === 'summary').length, 1, 'only one summary exists');
    assert.deepEqual(feed.slice(-3, -1), items, 'selected topic reads immediately precede summary');
    assert.equal(feed.at(-1).kind, 'summary', 'summary returns after finishing reads');
    assert.ok(feed.slice(0, -1).every(item => item.kind !== 'summary'), 'old summary is absent');
  }
}
console.log('PASS: repeated topic selections keep one summary after all next reads in both tabs');
