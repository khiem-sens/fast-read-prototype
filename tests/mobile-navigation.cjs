// Run with: node tests/mobile-navigation.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new Function(script);
assert.match(html, /\.vfeed-clip\s*\{[^}]*touch-action:\s*pinch-zoom;/);
assert.match(html, /\.hfeed-clip\s*\{[^}]*touch-action:\s*pan-y;/);
const element = () => ({
  style: {}, children: [], listeners: {}, clientHeight: 600, clientWidth: 400, scrollHeight: 600, scrollTop: 0,
  appendChild(child) { this.children.push(child); },
  addEventListener(type, callback) { this.listeners[type] = callback; },
  setPointerCapture() {}, releasePointerCapture() {},
});
const source = html.slice(html.indexOf('  function onPointerDrag('), html.indexOf('  function createHFeed('));
const createFeed = new Function('document', 'window', 'renderFeedItem', 'setTimeout', source + '; return createVFeed;')(
  { createElement: element }, { addEventListener() {} }, () => '', callback => callback()
);
let index = 1;
const container = element();
const feed = createFeed(container, {
  getPosts: () => [{kind:'post'}, {kind:'event'}, {kind:'post'}],
  getIndex: () => index, setIndex: value => { index = value; },
});
feed.render();
const clip = container.children[0], [tape, dots] = clip.children;
function swipe(dy, cancel = false) {
  const target = tape.children[index];
  const event = { target, pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 200 };
  clip.listeners.pointerdown({...event, type:'pointerdown'});
  for (const step of [0.1, 0.4, 0.7, 1]) {
    clip.listeners.pointermove({...event, type:'pointermove', clientY:200 + dy * step});
  }
  const type = cancel ? 'pointercancel' : 'pointerup';
  clip.listeners[type]({...event, type, clientY:200 + dy});
}
swipe(150);
assert.equal(index, 0, 'swipe down from event returns to previous post');
assert.match(dots.innerHTML, /^<div class="dot active">/);
swipe(-150);
assert.equal(index, 1, 'swipe up returns to event');
swipe(-150);
assert.equal(index, 2, 'swipe up advances to next post');
swipe(150, true);
assert.equal(index, 2, 'cancelled gesture must not change posts');
tape.children[2].scrollHeight = 1200;
tape.children[2].scrollTop = 250;
swipe(100);
assert.equal(index, 2, 'scroll within long article keeps current post');
assert.equal(tape.children[2].scrollTop, 150, 'touch gesture scrolls article content');
tape.children[2].scrollTop = 0;
swipe(150);
assert.equal(index, 1, 'swipe down at article top returns to event');
assert.match(html, /\.vfeed-item\s*\{[^}]*height:\s*100%;[^}]*touch-action:\s*pinch-zoom;/);
index = 0;
tape.children[0].scrollHeight = 900;
tape.children[0].scrollTop = 250;
swipe(-200);
assert.equal(tape.children[0].scrollTop, 300, 'article scroll stops at bottom');
assert.equal(index, 1, 'same swipe advances after reaching article bottom');
swipe(150);
assert.equal(index, 0, 'can return to previous article');
swipe(450);
assert.equal(tape.children[0].scrollTop, 0, 'scroll back to top of first article');
assert.equal(index, 0, 'cannot navigate before first article');

const horizontalSource = html.slice(html.indexOf('function onPointerDrag('), html.indexOf('function createTabSlider('));
const createHorizontalFeed = new Function('document', 'window', 'renderFeedItem', 'setTimeout', horizontalSource + '; return createHFeed;')(
  { createElement: element }, { addEventListener() {} }, () => '', callback => callback()
);
let horizontalIndex = 0;
const horizontalContainer = element();
const horizontalFeed = createHorizontalFeed(horizontalContainer, {
  getPosts: () => [{kind:'post'}, {kind:'post'}, {kind:'post'}],
  getIndex: () => horizontalIndex,
  setIndex: value => { horizontalIndex = value; },
});
horizontalFeed.render();
const horizontalClip = horizontalContainer.children[0];
function swipeHorizontal(dx) {
  const target = horizontalClip.children[0].children[horizontalIndex];
  const event = { target, pointerId: 2, pointerType: 'touch', clientX: 200, clientY: 200, preventDefault() {} };
  horizontalClip.listeners.pointerdown({...event, type:'pointerdown'});
  horizontalClip.listeners.pointermove({...event, type:'pointermove', clientX:200 + dx, clientY:205});
  horizontalClip.listeners.pointerup({...event, type:'pointerup', clientX:200 + dx, clientY:205});
}
swipeHorizontal(-120);
assert.equal(horizontalIndex, 1, 'option 2 swipes left to the next post');
swipeHorizontal(120);
assert.equal(horizontalIndex, 0, 'option 2 swipes right to the previous post');
function cancelledHorizontalSwipe(dx) {
  const target = horizontalClip.children[0].children[horizontalIndex];
  const event = { target, pointerId: 3, pointerType: 'touch', clientX: 200, clientY: 200, preventDefault() {} };
  horizontalClip.listeners.pointerdown({...event, type:'pointerdown'});
  horizontalClip.listeners.pointermove({...event, type:'pointermove', clientX:200 + dx, clientY:205});
  horizontalClip.listeners.pointercancel({...event, type:'pointercancel', clientX:200 + dx, clientY:205});
}
cancelledHorizontalSwipe(-120);
assert.equal(horizontalIndex, 1, 'option 2 completes a horizontal swipe when mobile Safari cancels the pointer on release');
console.log('PASS: touch navigation, dots, long-article scrolling, cancellation, and script syntax');
