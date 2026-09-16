// Run with: node tests/topic-selection-groups.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

// Minimal DOM for exercising the actual panel's rendering and click handlers.
class Element {
  constructor() { this.listeners = {}; this.children = []; this.classList = { add() {}, remove() {}, toggle() {} }; }
  set innerHTML(html) {
    this.html = html;
    this.children = [...html.matchAll(/<button\b[^>]*>/g)].map(([tag]) => {
      const button = new Element();
      button.topic = (tag.match(/data-topic="([^"]*)"/) || [])[1];
      button.confirm = tag.includes('data-confirm-read') ? 'read' : tag.includes('data-confirm-explore') ? 'explore' : null;
      button.pressed = tag.includes('aria-pressed="true"');
      return button;
    });
  }
  getAttribute(name) { return name === 'data-topic' ? this.topic : this.confirm; }
  setAttribute() {}
  addEventListener(event, callback) { this.listeners[event] = callback; }
  click() { this.listeners.click(); }
  contains(button) { return this.children.includes(button); }
  querySelector(selector) { return this.children.find(button => selector === '[data-confirm-read]' ? button.confirm === 'read' : selector === '[data-confirm-explore]' ? button.confirm === 'explore' : false); }
}
for (const file of ['index.html', 'fast-read-prototype.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const source = html.slice(html.indexOf('function createTopStoriesPanel('), html.indexOf('// Share sheet'));
  const overlay = new Element();
  const nodes = Object.fromEntries(['.ts-content', '[data-suggestions]', '.ts-suggestions-content', '[data-favorite-topics-label]', '[data-edit]', '[data-close]'].map(key => [key, new Element()]));
  overlay.querySelector = selector => nodes[selector];
  overlay.querySelectorAll = selector => selector === '[data-topic]' ? [...nodes['.ts-content'].children, ...nodes['.ts-suggestions-content'].children].filter(button => button.topic !== undefined) : [];
  const state = { savedTopics: ['Cybersecurity', 'Digital Economy'], selectedTopics: ['Cybersecurity'], moreToExploreTopics: ['Cybersecurity', 'Digital Economy'], topicSelectionGroup: 'explore' };
  const context = vm.createContext({ document: { createElement: () => overlay }, esc: x => x, tr: x => x, topicLabel: x => x });
  vm.runInContext(source, context);
  const panel = context.createTopStoriesPanel({ appendChild() {} }, state, {
    onSelectTopics(topics, explore) { state.topicSelectionGroup = topics.length ? (explore ? 'explore' : 'read') : null; }
  });
  const favorites = () => nodes['.ts-content'].children.filter(button => button.topic !== undefined);
  const suggestions = () => nodes['.ts-suggestions-content'].children;
  const selected = buttons => buttons.filter(button => button.pressed).map(button => button.topic);
  panel.open();
  assert.deepEqual(selected(favorites()), []);
  assert.deepEqual(selected(suggestions()), ['Cybersecurity']);
  favorites()[0].click(); // Same topic, different group must still be a change.
  assert.deepEqual(selected(favorites()), ['Cybersecurity']);
  assert.deepEqual(selected(suggestions()), []);
  assert.ok(nodes['.ts-content'].querySelector('[data-confirm-read]'));
  suggestions()[1].click();
  assert.deepEqual(selected(favorites()), []);
  assert.deepEqual(selected(suggestions()), ['Digital Economy']);
  assert.equal(nodes['.ts-content'].querySelector('[data-confirm-read]'), undefined);
  assert.ok(nodes['.ts-suggestions-content'].querySelector('[data-confirm-explore]'));
  suggestions()[1].click();
  assert.deepEqual(selected(suggestions()), []);
  favorites()[0].click();
  nodes['.ts-content'].querySelector('[data-confirm-read]').click();
  panel.open();
  assert.deepEqual(selected(favorites()), ['Cybersecurity']);
  assert.deepEqual(selected(suggestions()), []);
  assert.deepEqual(state.moreToExploreTopics, ['Cybersecurity', 'Digital Economy']);
  state.selectedTopics = [];
  state.topicSelectionGroup = null;
  state.storyGroup = 'topStoriesWeek';
  panel.open();
  assert.equal(nodes['.ts-content'].querySelector('[data-confirm-read]'), undefined);
}
console.log('PASS: topic groups are exclusive, category switches do not leave a stale OK action, and More to Explore remains available');
