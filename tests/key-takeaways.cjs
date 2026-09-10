// Run with: node tests/key-takeaways.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new Function(script);

const mapStart = html.indexOf('const POST_TAKEAWAYS = ');
const mapEnd = html.indexOf('const COPY = ', mapStart);
const mapSource = html.slice(mapStart, mapEnd).replace('const POST_TAKEAWAYS =', 'return');
const takeaways = new Function(mapSource)();
assert.equal(Object.keys(takeaways).length, 15);
for (let id = 1; id <= 15; id++) {
  assert.ok(takeaways[id].length > 70, `post ${id} has a meaningful takeaway`);
  assert.doesNotMatch(takeaways[id], /lorem ipsum/i);
}

const renderStart = html.indexOf('function renderPostContent(');
const renderSource = html.slice(renderStart, html.indexOf('function renderAdContent(', renderStart));
const render = new Function('ASSETS', 'POST_TAKEAWAYS', 'esc', 'localizePost', 'tr', 'topicLabel', renderSource + '; return renderPostContent;')(
  {iconGroup: 'spark.svg'}, takeaways, value => String(value), post => post, key => ({takeaway:'Key takeaway:', fullArticle:'Full article'})[key], topic => topic
);
const basePost = {id:1, tags:[], title:'Cybersecurity', bullets:['One', 'Two'], image:'image.jpg', url:'article'};
const generatedPost = {...basePost, id:'generated', takeaway:'A specific generated article takeaway.'};
assert.match(render(basePost), new RegExp(takeaways[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(render(generatedPost), /A specific generated article takeaway\./);
assert.match(render(basePost), /<strong>Key takeaway:<\/strong>/);
console.log('PASS: every base and generated post renders a meaningful key takeaway');
