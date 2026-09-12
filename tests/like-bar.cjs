// Run with: node tests/like-bar.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

for (const file of ['index.html', 'fast-read-prototype.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.doesNotMatch(html, /likeConfirmationPostId/, 'likes have no expiring confirmation state');
  const render = html.slice(html.indexOf('          const liked = state.likedPosts.has(post.id);'), html.indexOf('          const isBm = state.bookmarked.has(post.id);'));
  const state = { likedPosts: new Set() };
  const label = {};
  const button = { classList: { toggle(_, visible) { button.visible = visible; } }, setAttribute(_, value) { button.pressed = value; } };
  const context = { state, post: { id: 1 }, item: { kind: 'post' }, isLikePromptPost: () => true, likeBar: { classList: { toggle() {} } }, likeBtn: button, likeLabel: label };
  const refresh = () => vm.runInNewContext(`{${render}}`, context);
  refresh();
  assert.equal(label.textContent, 'I like this content');
  state.likedPosts.add(1);
  refresh();
  assert.equal(label.textContent, 'Liked');
  assert.equal(button.visible, true);
  assert.equal(button.pressed, 'true');
  context.post = { id: 2 };
  refresh();
  assert.equal(label.textContent, 'I like this content');
  context.post = { id: 1 };
  context.isLikePromptPost = () => false;
  refresh();
  assert.equal(label.textContent, 'Liked');
  assert.equal(button.visible, true, 'returning to a liked article keeps the button visible');
  context.item = { kind: 'summary' };
  refresh();
  assert.equal(button.visible, false, 'summary cards do not show article actions');
}
console.log('PASS: Liked remains visible and is restored when returning to the article');
