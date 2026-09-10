// Run with: node tests/summary-experience.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync(require('node:path').join(__dirname, '../fast-read-prototype.html'), 'utf8');
const streakSource = html.slice(html.indexOf('      function localDayKey('), html.indexOf('      const CURATED_HOME_CARDS'));
const { nextStreak } = new Function(`${streakSource}; return { nextStreak };`)();

assert.deepEqual(nextStreak(null, '2026-09-09'), { day: '2026-09-09', count: 1 });
assert.deepEqual(nextStreak({ day: '2026-09-08', count: 4 }, '2026-09-09'), { day: '2026-09-09', count: 5 });
assert.deepEqual(nextStreak({ day: '2026-09-06', count: 4 }, '2026-09-09'), { day: '2026-09-09', count: 1 });

assert.match(html, /data-summary-topic/);
assert.match(html, /data-summary-continue/);
assert.match(html, /data-summary-surprise/);
assert.match(html, /data-summary-surprise>Surprise Me!/);
assert.doesNotMatch(html, /data-summary-surprise[^>]*hidden/);
assert.match(html, /function surpriseSummary\(tab\)\s*\{\s*saveSummaryTopics\(tab\);/);
assert.match(html, /function surpriseSummary\(tab\)[\s\S]*?state\.savedTopics\.includes\(tag\.l\)/);
assert.match(html, /state\.surpriseActive = true;[\s\S]*?refreshBottombar\(\);/);
assert.match(html, /if \(state\.surpriseActive\)[\s\S]*?<span class="label">Surprise Me!<\/span>/);
assert.match(html, /onSelectTopics\(\) \{ state\.surpriseActive = false;/);
assert.match(html, /data-surprise-filter[\s\S]*?Displaying content outside of your favorite topics/);
assert.match(html, /surpriseButton\.classList\.toggle\("selected", surpriseSelected\);/);
assert.match(html, /surpriseButton\.addEventListener\("click", \(\) => \{ cbs\.onSurprise\(\); close\(\); \}\);/);
assert.match(html, /state\.summaryRecs\[tab\] = null;/);
assert.match(html, /state\.selectedTopics\.length === 1[\s\S]*?topicLabel\(state\.selectedTopics\[0\]\)/);
assert.match(html, /function currentItem\(\)[\s\S]*?return feed\[currentIndex\(\)\] \|\| feed\[0\];/);
assert.match(html, /if \(summaryStreakShown \|\| currentItem\(\)\.kind !== "summary"\) return;/);
assert.doesNotMatch(html, /STREAK_NOTICE_KEY/);
assert.match(html, /setTimeout\(\(\) => toast\.classList\.remove\("show"\), 5000\);/);
assert.match(html, /function createVFeed[\s\S]*?onPointerDrag\(clip,\s*\{\s*shouldStart\(e\)\s*\{\s*return !\(e\.target\.closest && e\.target\.closest\("button, a"\)\);/);
assert.match(html, /function createHFeed[\s\S]*?onPointerDrag\(clip,\s*\{\s*shouldStart\(e\)\s*\{\s*return !\(e\.target\.closest && e\.target\.closest\("button, a"\)\);/);
assert.match(html, /\.summary-topic-card\s*\{[\s\S]*?min-height:\s*44px;/);
assert.match(html, /\.summary-continue-btn,\s*\.summary-surprise-btn\s*\{[\s\S]*?min-height:\s*48px;/);

console.log('PASS: streaks advance only on consecutive days and summary selections drive continuation, Surprise Me, and the toolbar');
