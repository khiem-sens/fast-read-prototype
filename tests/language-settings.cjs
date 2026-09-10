// Run with: node tests/language-settings.cjs
const fs = require("node:fs");
const assert = require("node:assert/strict");

const html = fs.readFileSync(
  require("node:path").join(__dirname, "../fast-read-prototype.html"),
  "utf8",
);
for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))
  new Function(script);

const listeners = {};
const buttons = ["en", "id", "ms", "vi"].map((language) => ({
  dataset: { language },
  addEventListener(type, callback) {
    listeners[language + type] = callback;
  },
}));
const options = {
  innerHTML: "",
  querySelectorAll() {
    return buttons;
  },
};
const closeButton = {
  addEventListener(type, callback) {
    listeners["close" + type] = callback;
  },
};
const title = { textContent: "" };
const classes = new Set();
const overlay = {
  className: "",
  innerHTML: "",
  classList: {
    add: (value) => classes.add(value),
    remove: (value) => classes.delete(value),
  },
  querySelector(selector) {
    if (selector === "[data-language-options]") return options;
    if (selector === "[data-close]") return closeButton;
    if (selector === ".language-sheet-title") return title;
  },
};
const document = {
  documentElement: { lang: "en" },
  createElement() {
    return overlay;
  },
};
const root = {
  appendChild(node) {
    assert.equal(node, overlay);
  },
};
const start = html.indexOf("function createLanguageSheet(");
const source = html.slice(start, html.indexOf("function createReader(", start));
const factory = new Function(
  "document",
  "tr",
  'let selectedLanguage = "en";' +
    source +
    "; return { createLanguageSheet, selected: () => selectedLanguage };",
)(document, () => "Change summary language");
let changes = 0;
const sheet = factory.createLanguageSheet(root, () => {
  changes++;
});
sheet.open();
assert.match(options.innerHTML, /data-language="en" aria-pressed="true"/);
assert.equal(classes.has("show"), true);
listeners.viclick();
assert.equal(factory.selected(), "vi");
assert.equal(document.documentElement.lang, "en", "the interface language remains unchanged");
assert.equal(changes, 1);
assert.equal(classes.has("show"), false);
sheet.open();
assert.match(options.innerHTML, /data-language="vi" aria-pressed="true"/);
assert.match(
  html,
  /languageBtn\.addEventListener\("click", \(\) => languageSheet\.open\(\)\)/,
);
assert.match(html, /post = localizePost\(post\)/);
assert.match(html, /function tr\(key\) \{ return COPY\.en\[key\] \|\| key; \}/, "UI labels always use their original language");
assert.match(html, /function topicLabel\(topic\) \{ return topic; \}/, "topics remain unchanged");
assert.match(html, /<div class="post-content" lang="\$\{selectedLanguage\}">/, "only post content receives the selected language");
assert.match(html, /<strong>\$\{esc\(postTr\("takeaway"\)\)\}<\/strong>/, "the key-takeaway label is part of translated post content");
assert.doesNotMatch(html, /applyReaderLanguage/);
for (const language of ["id", "ms", "vi"]) {
  const start = html.indexOf(
    `    ${language}: {`,
    html.indexOf("const POST_I18N"),
  );
  const end =
    language === "vi"
      ? html.indexOf("\n    },\n  };", start)
      : html.indexOf("\n    },", start);
  const section = html.slice(start, end);
  for (let id = 1; id <= 15; id++)
    assert.match(
      section,
      new RegExp(`\\n\\s*${id}:\\s*\\[`),
      `${language} translates post ${id}`,
    );
}
console.log(
  "PASS: language button opens a four-option sheet and preserves the selection",
);
