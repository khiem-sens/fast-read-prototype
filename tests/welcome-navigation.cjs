// Run with: node tests/welcome-navigation.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
const source = html.slice(html.indexOf('    function extendedPosts('), html.indexOf('    function currentFeed('));
const feeds = new Function('state','buildFeed','filteredLatest','filteredCurated','summaryItem',source+'; return [feedLatest,feedCurated];')(
  {extended:{latest:[],curated:[]}}, posts=>posts, ()=>[{kind:'post'}], ()=>[{kind:'post'}], ()=>({kind:'summary'})
);
for (const feed of feeds) {
  assert.deepEqual(feed().map(item=>item.kind), ['post','summary'], 'welcome is never a swipeable feed item');
}
let focused = '', dragHandlers, refreshes = 0, hints = 0, activeTab = 'latest';
const listeners = {};
const overlay = {
  hidden:true, style:{},
  focus(){focused='overlay'},
  querySelector:()=>({focus(){focused='choice'}}),
  addEventListener:(type, handler)=>{listeners[type]=handler},
};
const content = {inert:false};
const screen = {dataset:{readingMode:'quick'},children:[content,overlay],querySelector:()=>({focus(){focused='reader'}})};
const visibilitySource = html.slice(html.indexOf('    let welcomeClosing ='),html.indexOf('    const tabBtns ='));
const controls = new Function(
  'welcomeOverlay','screenEl','state','setTab','refreshBottombar','showSwipeHint','onClose','onPointerDrag','setTimeout',
  visibilitySource+'; return { setWelcomeVisible, enterDigest };'
)(overlay,screen,{curatedIndex:3},tab=>{activeTab=tab},()=>{refreshes++},()=>{hints++},()=>{},(_, handlers)=>{dragHandlers=handlers},callback=>callback());
const toggle = controls.setWelcomeVisible;
toggle(true);
assert.equal(overlay.hidden,false);
assert.equal(content.inert,true);
assert.equal(focused,'overlay');
toggle(false);
assert.equal(overlay.hidden,true);
assert.equal(content.inert,false);
assert.equal(focused,'reader');
const choiceSource = html.slice(html.indexOf('      const readingChoice ='),html.indexOf('      const topicCard ='));
assert.match(html,/let welcomeShown = false;/);
assert.match(html,/if \(!welcomeShown\) \{\s*welcomeShown = true;\s*reader1\.showWelcome\(\);\s*\}/);
toggle(true);
dragHandlers.onMove(0,-45,{preventDefault(){}});
assert.equal(overlay.style.transform,'translateY(-45px)','welcome follows an upward swipe');
dragHandlers.onEnd(0,-100,{type:'pointerup'});
assert.equal(overlay.hidden,true,'upward swipe dismisses the overlay');
assert.equal(content.inert,false);
assert.equal(refreshes,1);
assert.equal(hints,1,'swipe guidance appears after leaving the welcome overlay');
assert.match(html,/class="welcome-enter"[^>]*data-enter-digest>\$\{esc\(tr\("enter"\)\)\}<\/button>/);
assert.match(choiceSource,/screenEl\.dataset\.readingMode = readingChoice\.dataset\.readingMode;\s*refreshBottombar\(\);\s*return;/);
assert.match(choiceSource,/\[data-enter-digest\].*enterDigest\(\)/s);
assert.match(html,/onPointerDrag\(welcomeOverlay,\s*\{\s*shouldStart\(e\)\s*\{\s*return !e\.target\.closest\("button"\);\s*\}/s);

assert.equal(activeTab,'latest');
console.log('PASS: one-time overlay scrolls smoothly into the digest and is absent from both feeds');
