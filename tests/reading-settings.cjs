// Run with: node tests/reading-settings.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new Function(script);

const listeners = {};
const modes = ['hurry', 'quick', 'deep'];
const buttons = modes.map((mode) => ({
  dataset: {readingMode: mode},
  addEventListener(type, callback) { listeners[mode + type] = callback; },
}));
const choices = {
  innerHTML: '',
  querySelectorAll() { return buttons; },
};
const closeButton = {addEventListener(type, callback) { listeners['close' + type] = callback; }};
const title = {textContent: ''};
const classes = new Set();
const overlay = {
  className: '',
  innerHTML: '',
  classList: {add: value => classes.add(value), remove: value => classes.delete(value)},
  querySelector(selector) {
    if (selector === '[data-reading-choices]') return choices;
    if (selector === '[data-close]') return closeButton;
    if (selector === '.reading-sheet-title') return title;
  },
};
const root = {appendChild(node) { assert.equal(node, overlay); }};
const document = {createElement() { return overlay; }};
const source = html.slice(html.indexOf('function createReadingModeSheet('), html.indexOf('function createLanguageSheet('));
const createReadingModeSheet = new Function('document', 'renderReadingChoices', 'tr', source + '; return createReadingModeSheet;')(
  document,
  selected => `choices:${selected}`,
  () => 'How do you want to read today?'
);
let selected = null;
const sheet = createReadingModeSheet(root, () => 'quick', mode => { selected = mode; });
sheet.open();
assert.equal(choices.innerHTML, 'choices:quick');
assert.equal(classes.has('show'), true);
let stopped = false;
listeners.deepclick({stopPropagation() { stopped = true; }});
assert.equal(selected, 'deep');
assert.equal(stopped, true);
assert.equal(classes.has('show'), false);
assert.doesNotMatch(html.slice(html.indexOf('const READING_MODES = ['), html.indexOf('];', html.indexOf('const READING_MODES = ['))), /explore/);
assert.match(html, /data-reading-settings/);
assert.match(html, /settingsBtn\.addEventListener\("click", \(\) => readingModeSheet\.open\(\)\)/);
assert.match(html, /showModeChangeHint\(mode\)/);
assert.match(html, /hurryChanged: "Summary style changed to super short\."/);
assert.match(html, /quickChanged: "Summary style changed to balanced\."/);
assert.match(html, /deepChanged: "Summary style changed to more context\."/);
assert.match(html, /onSwitch: \(tab\) => \{ readerTab = tab; showScreen\("reader", true\); \}/);
console.log('PASS: settings opens the shared three-option sheet and applies a selected reading mode');
