// Tests for the forum API, using the in-memory store (no Vercel Blob token needed).
// Run from the repo root:  node tests/forum-api.js
delete process.env.BLOB_READ_WRITE_TOKEN;
process.env.FORUM_ADMIN_KEY = 'test-admin-key';
process.env.FORUM_VOTER_SALT = 'test-salt';

const { GET, POST } = await import('../api/forum.js');
const core = await import('../api/_forum/core.js');
const { memoryStore, update, ConflictError } = await import('../api/_forum/store.js');

let passed = 0, failed = 0;
function check(name, ok, detail = '') {
  if (ok) passed++; else failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (ok || !detail ? '' : '\n        ' + detail));
}

let ipN = 0;
async function call(method, action, { body, fan = 'fan-aaaaaaaa', admin, ip, query = '' } = {}) {
  const headers = { 'x-forwarded-for': ip || `10.0.0.${++ipN % 250}` };
  if (fan) headers['x-fan-id'] = fan;
  if (admin) headers['x-admin-key'] = admin;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const req = new Request(`http://localhost/api/forum?action=${action}${query}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const res = await (method === 'GET' ? GET(req) : POST(req));
  return { status: res.status, data: await res.json(), headers: res.headers };
}

// ---- Creating and listing threads
let r = await call('POST', 'create', { body: { title: 'Bryce Young is cooking this year', body: 'Five games in and the offense finally has an identity.', cat: 'roster', author: 'KeepPounding22' } });
check('create a thread returns 201 and an id', r.status === 201 && r.data.id, JSON.stringify(r));
const t1 = r.data.id;
r = await call('POST', 'create', { body: { title: 'Best parking for the Bucs game?', body: '', cat: 'stadium', author: 'Tailgate Tom' } });
check('a thread can have a title and no body', r.status === 201);
const t2 = r.data.id;

r = await call('GET', 'list');
check('list returns both threads, newest first', r.status === 200 && r.data.threads.length >= 2 && r.data.threads.map(t => t.id).indexOf(t2) < r.data.threads.map(t => t.id).indexOf(t1));
check('list responses are never cached', r.headers.get('cache-control') === 'no-store');
check('list includes the categories', r.data.categories.join() === 'gameday,roster,draft,stadium,offtopic');

// ---- Validation
r = await call('POST', 'create', { body: { title: 'Hey', body: 'x', cat: 'roster', author: 'Short Title' } });
check('titles under 5 characters are rejected', r.status === 400 && /at least 5/.test(r.data.error));
r = await call('POST', 'create', { body: { title: 'Valid title here', body: 'x', cat: 'nope', author: 'Cat Test' } });
check('unknown categories are rejected', r.status === 400 && /category/.test(r.data.error));
r = await call('POST', 'create', { body: { title: 'Valid title here', body: 'x', cat: 'roster', author: 'x' } });
check('one-letter names are rejected', r.status === 400 && /2–24/.test(r.data.error));
r = await call('POST', 'create', { body: { title: 'Valid title here', body: 'x', cat: 'roster', author: 'Panthers Admin' } });
check('names like "admin" and "Fan Central" are reserved', r.status === 400 && /reserved/.test(r.data.error));
r = await call('POST', 'create', { body: { title: 'Valid title here', body: 'x', cat: 'roster', author: 'Name<script>' } });
check('names with HTML characters are rejected', r.status === 400);
r = await call('POST', 'create', { body: { title: 'Valid title here', body: 'x', cat: 'roster', author: 'Tester' }, fan: null });
check('posting without a fan id is rejected', r.status === 400);
r = await call('POST', 'create', { body: { title: 'This ref is a r3tard honestly', body: 'x', cat: 'gameday', author: 'Angry Fan' } });
check('slurs are blocked, even with look-alike letters', r.status === 400 && /language/.test(r.data.error));
r = await call('POST', 'create', { body: { title: 'That was a fucking great drive', body: 'holy sh1t', cat: 'gameday', author: 'Hype Man' } });
const masked = await call('GET', 'thread', { query: `&id=${r.data.id}` });
check('swear words are allowed but masked', masked.data.title === 'That was a f****** great drive' && masked.data.body === 'holy s***', masked.data.title + ' | ' + masked.data.body);
r = await call('POST', 'create', { body: '{not json', fan: 'fan-aaaaaaaa' });
check('bad requests get a clean error, not a crash', r.status === 400 || r.status === 415);

// ---- Comments and nested replies
r = await call('POST', 'comment', { body: { threadId: t1, body: 'Agreed, the deep ball is back.', author: 'Cat Scratch' } });
check('comment on a thread', r.status === 201 && r.data.id);
const c1 = r.data.id;
r = await call('POST', 'comment', { body: { threadId: t1, parentId: c1, body: 'McMillan is a problem for DBs.', author: 'TMac Fan' } });
const c2 = r.data.id;
check('reply to a comment', r.status === 201);
let chainParent = c2;
for (let i = 0; i < 4; i++) {
  r = await call('POST', 'comment', { body: { threadId: t1, parentId: chainParent, body: `deeper reply ${i}`, author: 'Deep Diver' } });
  chainParent = r.data.id;
}
let th = await call('GET', 'thread', { query: `&id=${t1}` });
const byId = new Map(th.data.comments.map(c => [c.id, c]));
const depth = c => { let d = 1; while (c.parentId) { c = byId.get(c.parentId); d++; } return d; };
check(`replies never nest deeper than ${core.MAX_DEPTH} levels`, th.data.comments.every(c => depth(c) <= core.MAX_DEPTH), th.data.comments.map(depth).join());
r = await call('GET', 'list');
check('the feed shows the reply count', r.data.threads.find(t => t.id === t1).replies === 6);
r = await call('POST', 'comment', { body: { threadId: t1, body: 'Agreed, the deep ball is back.', author: 'Cat Scratch' } });
check('posting the same comment twice is blocked', r.status === 409);
r = await call('POST', 'comment', { body: { threadId: t1, parentId: 'nope123', body: 'hello', author: 'Ghost' } });
check('replying to a missing comment fails cleanly', r.status === 400);
r = await call('POST', 'comment', { body: { threadId: 'missing1', body: 'hello', author: 'Ghost' } });
check('commenting on a missing thread returns 404', r.status === 404);

// ---- Votes
r = await call('POST', 'vote', { body: { threadId: t1 }, fan: 'fan-voter-one' });
check('upvote a thread', r.status === 200 && r.data.voted === true && r.data.score === 1);
r = await call('POST', 'vote', { body: { threadId: t1 }, fan: 'fan-voter-two' });
check('a second fan adds a second vote', r.data.score === 2);
r = await call('POST', 'vote', { body: { threadId: t1 }, fan: 'fan-voter-one' });
check('voting again takes your vote back (one vote per fan)', r.data.voted === false && r.data.score === 1);
r = await call('POST', 'vote', { body: { threadId: t1, commentId: c1 }, fan: 'fan-voter-one' });
check('upvote a comment', r.data.voted && r.data.score === 1);
th = await call('GET', 'thread', { query: `&id=${t1}`, fan: 'fan-voter-one' });
check('the thread view says which comments you upvoted', th.data.comments.find(c => c.id === c1).voted === true && th.data.voted === false);
r = await call('GET', 'list');
check('thread score in the feed updates', r.data.threads.find(t => t.id === t1).score === 1);

// ---- Reports and auto-hide
for (const f of ['fan-rep-0001', 'fan-rep-0001', 'fan-rep-0002']) await call('POST', 'report', { body: { threadId: t1, commentId: c2, reason: 'spam' }, fan: f });
th = await call('GET', 'thread', { query: `&id=${t1}` });
check('reports from the same fan only count once', th.data.comments.find(c => c.id === c2).removed === null);
await call('POST', 'report', { body: { threadId: t1, commentId: c2, reason: 'spam' }, fan: 'fan-rep-0003' });
th = await call('GET', 'thread', { query: `&id=${t1}` });
const hidden = th.data.comments.find(c => c.id === c2);
check(`after ${core.AUTO_HIDE_REPORTS} reports a comment is hidden pending review`, hidden.removed === 'auto' && hidden.body === '' && hidden.author === '[removed]');
check('replies under a hidden comment stay visible', th.data.comments.filter(c => c.parentId === c2).length === 1);

// ---- Admin tools
r = await call('GET', 'reports');
check('report queue needs the admin key', r.status === 401);
r = await call('GET', 'reports', { admin: 'wrong-key' });
check('a wrong admin key is refused', r.status === 401);
r = await call('GET', 'reports', { admin: 'test-admin-key' });
check('admin sees the reported comment in the queue', r.status === 200 && r.data.items.some(i => i.commentId === c2 && i.reports.length === 3));
r = await call('POST', 'moderate', { body: { action: 'restore', threadId: t1, commentId: c2 }, admin: 'test-admin-key' });
th = await call('GET', 'thread', { query: `&id=${t1}` });
check('admin can restore a hidden comment', th.data.comments.find(c => c.id === c2).removed === null);
await call('POST', 'moderate', { body: { action: 'remove', threadId: t2 }, admin: 'test-admin-key' });
r = await call('GET', 'list');
check('admin can remove a whole thread; it leaves the feed', !r.data.threads.some(t => t.id === t2));
r = await call('GET', 'thread', { query: `&id=${t2}` });
check('a removed thread returns 404 to fans', r.status === 404);
await call('POST', 'moderate', { body: { action: 'lock', threadId: t1, value: true }, admin: 'test-admin-key' });
r = await call('POST', 'comment', { body: { threadId: t1, body: 'can I still post?', author: 'Late Fan' } });
check('locked threads refuse new comments', r.status === 403);
await call('POST', 'moderate', { body: { action: 'pin', threadId: t1, value: true }, admin: 'test-admin-key' });
r = await call('GET', 'list');
check('admin can pin a thread', r.data.threads.find(t => t.id === t1).pinned === true && r.data.threads.find(t => t.id === t1).locked === true);
r = await call('POST', 'moderate', { body: { action: 'remove', threadId: t1 } });
check('moderation without the key is refused', r.status === 401);

// ---- Rate limits
core.resetRateLimits();
const ip = '9.9.9.9';
r = await call('POST', 'create', { body: { title: 'First thread from this IP', body: 'x', cat: 'offtopic', author: 'Spammy' }, ip });
const r2 = await call('POST', 'create', { body: { title: 'Second thread right away', body: 'x', cat: 'offtopic', author: 'Spammy' }, ip });
check('one new thread per 2 minutes per person', r.status === 201 && r2.status === 429 && /Slow down/.test(r2.data.error));

// ---- Game threads (driven by the schedule)
{
  const store = memoryStore();
  const schedule = [{ week: 7, team: 'Tampa Bay Buccaneers', home: true, time: '1:00 PM ET', tv: 'FOX', kickoff: '2026-10-25T13:00:00-04:00' }];
  const k = Date.parse(schedule[0].kickoff);
  let l = await core.listThreads(store, { schedule, now: k - 48 * 3600e3 });
  check('no game thread two days before kickoff (only the pinned welcome post)', l.threads.length === 1 && l.threads[0].id === 'welcome' && l.threads[0].pinned);
  l = await core.listThreads(store, { schedule, now: k - 20 * 3600e3 });
  const g = l.threads.find(t => t.id === 'game-w7');
  check('game thread appears the day before, pinned, titled from the schedule', g && g.pinned && g.title === '🏈 Game Thread: Panthers vs. Buccaneers (Week 7)' && g.cat === 'gameday', JSON.stringify(g));
  l = await core.listThreads(store, { schedule, now: k - 19 * 3600e3 });
  check('the game thread is only created once', l.threads.filter(t => t.id === 'game-w7').length === 1);
  l = await core.listThreads(store, { schedule, now: k + 4 * 3600e3 });
  const pg = l.threads.find(t => t.id === 'post-w7');
  check('post-game thread opens after the game and is pinned', pg && pg.pinned && /Post-Game Thread/.test(pg.title));
  l = await core.listThreads(store, { schedule, now: k + 6 * 86400e3 });
  check('game threads unpin after a few days but stay in the feed', l.threads.filter(t => t.kind !== 'welcome').every(t => !t.pinned) && l.threads.length === 3);
}

// ---- Storage retries on conflicting writes
{
  const store = memoryStore();
  await store.write('doc', { n: 0 });
  let first = true;
  const racing = { ...store, async read(k) { const d = await store.read(k); if (first) { first = false; await store.write(k, { n: 100 }, { etag: d.etag }); } return d; } };
  await update(racing, 'doc', () => ({ n: 0 }), d => { d.n += 1; return null; });
  check('a write that loses a race is retried on fresh data (no lost updates)', (await store.read('doc')).data.n === 101);
  let threw = false;
  try { await store.write('doc', { n: 1 }); } catch (e) { threw = e instanceof ConflictError; }
  check('creating a document that already exists is refused', threw);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
