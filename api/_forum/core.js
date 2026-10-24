// Forum logic, independent of HTTP so it can be tested directly.
// Documents:
//   index          -> { threads: [summary, ...] }   one small row per thread, for the topic feed
//   thread-<id>    -> the full thread: opening post, comments, votes, reports
import { createHash, randomBytes } from 'node:crypto';
import { update } from './store.js';
import { hasBlockedWord, maskProfanity } from './filter.js';

export const CATEGORIES = ['gameday', 'roster', 'draft', 'stadium', 'offtopic'];
export const MAX_DEPTH = 4;           // replies nest at most 4 levels deep
export const AUTO_HIDE_REPORTS = 3;   // hidden for review after this many reports
const LIMITS = { title: [5, 120], body: [0, 5000], comment: [1, 2000], author: [2, 24] };

export class ForumError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const newId = () => randomBytes(6).toString('base64url');
const clean = s => String(s ?? '').replace(/\r\n/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

export function voterKey(fanId, salt) {
  if (!fanId || !/^[A-Za-z0-9_-]{8,64}$/.test(fanId)) throw new ForumError(400, 'Missing fan id.');
  return createHash('sha256').update(String(salt) + ':' + fanId).digest('base64url').slice(0, 16);
}

function checkText(value, [min, max], label) {
  const v = clean(value);
  if (v.length < min) throw new ForumError(400, min <= 1 ? `${label} can't be empty.` : `${label} needs at least ${min} characters.`);
  if (v.length > max) throw new ForumError(400, `${label} can be at most ${max} characters.`);
  if (hasBlockedWord(v)) throw new ForumError(400, 'That language isn’t allowed here. Keep it clean.');
  return maskProfanity(v);
}

function checkAuthor(value) {
  const v = clean(value).replace(/\s+/g, ' ');
  if (!/^[A-Za-z0-9 _.\-]{2,24}$/.test(v)) throw new ForumError(400, 'Names are 2–24 letters, numbers, spaces, dots, dashes or underscores.');
  if (hasBlockedWord(v)) throw new ForumError(400, 'Pick a different name.');
  if (/\b(admin|moderator|mod|official|panthers staff|fan central)\b/i.test(v)) throw new ForumError(400, 'That name is reserved.');
  return maskProfanity(v);
}

const summaryOf = (t, comments) => ({
  id: t.id, title: t.title, cat: t.cat, author: t.author, kind: t.kind || 'user',
  createdAt: t.createdAt, lastActivity: t.lastActivity || t.createdAt,
  replies: comments.filter(c => !c.removed).length, score: t.score || 0,
  preview: t.removed ? '' : t.body.slice(0, 160), pinned: !!t.pinned, locked: !!t.locked,
  removed: t.removed || null, week: t.week || null, kickoff: t.kickoff || null,
  flags: (t.reports || []).length + comments.reduce((n, c) => n + (c.reports || []).length + (c.removed === 'auto' ? 1 : 0), 0) + (t.removed ? 1 : 0)
});

function syncSummary(index, thread) {
  const s = summaryOf(thread, thread.comments);
  const i = index.threads.findIndex(x => x.id === thread.id);
  if (i >= 0) index.threads[i] = s; else index.threads.unshift(s);
}

// ---- Rate limits (per IP, per server instance) ----------------------------------------------------------

const hits = new Map();
const RATE = { thread: [1, 120e3], comment: [4, 60e3], vote: [40, 60e3], report: [10, 3600e3] };
export function rateLimit(ip, action, now = Date.now()) {
  const [max, windowMs] = RATE[action];
  const key = `${action}:${ip}`;
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (list.length >= max) {
    const wait = Math.ceil((windowMs - (now - list[0])) / 1000);
    throw new ForumError(429, `Slow down a little. Try again in ${wait}s.`);
  }
  list.push(now);
  hits.set(key, list);
}
export function resetRateLimits() { hits.clear(); }

// ---- Game threads ---------------------------------------------------------------------------------------

const PRE_WINDOW = 36 * 3600e3;       // game thread opens 36 h before kickoff
const POST_START = 3.5 * 3600e3;      // post-game thread opens 3.5 h after kickoff
const POST_PIN = 48 * 3600e3;         // post-game thread stays pinned for 2 days

const WELCOME = {
  id: 'welcome', kind: 'welcome', week: null, kickoff: null, pinned: true, cat: 'offtopic',
  title: '👋 Welcome to Fan Talk: read this first',
  body: 'This is the fan forum for Panthers Fan Central. Start a thread, reply to anyone, and upvote the takes you like.\n\nHouse rules: keep it respectful, no hate speech or personal info, no spam. Slurs are blocked automatically, and posts that get 3 reports are hidden until a moderator reviews them.\n\nA Game Thread opens the day before every game. Keep Pounding.'
};

function gameThreadsDue(schedule, now) {
  const due = [WELCOME];
  for (const g of schedule || []) {
    if (!g.kickoff) continue;
    const k = Date.parse(g.kickoff);
    const vs = `Panthers ${g.home ? 'vs.' : 'at'} ${g.team.replace(/^.* /, '')}`;
    if (now >= k - PRE_WINDOW && now < k + POST_START) {
      due.push({ id: `game-w${g.week}`, kind: 'game', week: g.week, kickoff: g.kickoff,
        title: `🏈 Game Thread: ${vs} (Week ${g.week})`,
        body: `Kickoff ${g.time}${g.tv && g.tv !== 'TBD' ? ` on ${g.tv}` : ''}. Talk about the game here as it happens. Keep it respectful. Keep Pounding.` });
    }
    if (now >= k + POST_START && now < k + POST_START + 4 * 86400e3) {
      due.push({ id: `post-w${g.week}`, kind: 'postgame', week: g.week, kickoff: g.kickoff,
        title: `📣 Post-Game Thread: ${vs} (Week ${g.week})`,
        body: 'The final whistle has blown. Reactions, takeaways and grades go here.' });
    }
  }
  return due;
}

// Pinned status for game threads depends on the clock, so it's worked out on each read
export function livePinned(s, now) {
  if (s.kind === 'game' && s.kickoff) { const k = Date.parse(s.kickoff); return now >= k - PRE_WINDOW && now < k + POST_START + 2 * 3600e3; }
  if (s.kind === 'postgame' && s.kickoff) { const k = Date.parse(s.kickoff); return now < k + POST_START + POST_PIN; }
  if (s.kind === 'welcome') return s.pinned !== false;
  return s.pinned;
}

async function ensureGameThreads(store, schedule, now) {
  const due = gameThreadsDue(schedule, now);
  if (!due.length) return;
  const idx = await store.read('index');
  const have = new Set(idx ? idx.data.threads.map(t => t.id) : []);
  for (const g of due.filter(d => !have.has(d.id))) {
    const thread = { cat: 'gameday', pinned: false, ...g, author: 'Fan Central', createdAt: new Date(now).toISOString(),
      lastActivity: new Date(now).toISOString(), score: 0, votes: {}, comments: [], reports: [], locked: false, removed: null };
    try { await store.write(`thread-${g.id}`, thread); } catch { /* another request created it */ }
    await update(store, 'index', () => ({ threads: [] }), index => {
      if (index.threads.some(t => t.id === g.id)) return { abort: null };
      syncSummary(index, thread);
      return null;
    });
  }
}

// ---- Reading --------------------------------------------------------------------------------------------

export async function listThreads(store, { schedule, now = Date.now(), admin = false } = {}) {
  await ensureGameThreads(store, schedule, now);
  const idx = await store.read('index');
  const threads = (idx ? idx.data.threads : [])
    .filter(t => admin || !t.removed)
    .map(t => ({ ...t, pinned: livePinned(t, now) }));
  return { threads, categories: CATEGORIES };
}

function publicComment(c, voter, admin) {
  const hidden = c.removed && !admin;
  return {
    id: c.id, parentId: c.parentId, author: hidden ? '[removed]' : c.author, body: hidden ? '' : c.body,
    createdAt: c.createdAt, score: c.score || 0, removed: c.removed || null,
    voted: !!(voter && c.votes && c.votes[voter]), reports: admin ? (c.reports || []).length : undefined
  };
}

export async function getThread(store, id, { voter = null, admin = false, now = Date.now() } = {}) {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(String(id))) throw new ForumError(400, 'Bad thread id.');
  const doc = await store.read(`thread-${id}`);
  if (!doc || (doc.data.removed && !admin)) throw new ForumError(404, 'That thread was removed or doesn’t exist.');
  const t = doc.data;
  return {
    id: t.id, title: t.title, cat: t.cat, author: t.author, body: t.body, kind: t.kind || 'user',
    createdAt: t.createdAt, lastActivity: t.lastActivity, score: t.score || 0,
    pinned: livePinned(t, now), locked: !!t.locked, removed: t.removed || null,
    voted: !!(voter && t.votes && t.votes[voter]), reports: admin ? (t.reports || []).length : undefined,
    comments: t.comments.map(c => publicComment(c, voter, admin))
  };
}

// ---- Writing --------------------------------------------------------------------------------------------

export async function createThread(store, input, { now = Date.now() } = {}) {
  const title = checkText(input.title, LIMITS.title, 'Title');
  const body = checkText(input.body, LIMITS.body, 'Post');
  const author = checkAuthor(input.author);
  const cat = CATEGORIES.includes(input.cat) ? input.cat : null;
  if (!cat) throw new ForumError(400, 'Pick a category.');
  const ts = new Date(now).toISOString();
  const thread = { id: newId(), title, body, cat, author, kind: 'user', createdAt: ts, lastActivity: ts,
    score: 0, votes: {}, comments: [], reports: [], pinned: false, locked: false, removed: null };
  await store.write(`thread-${thread.id}`, thread);
  await update(store, 'index', () => ({ threads: [] }), index => { syncSummary(index, thread); return null; });
  return { id: thread.id };
}

export async function addComment(store, input, { now = Date.now() } = {}) {
  const body = checkText(input.body, LIMITS.comment, 'Comment');
  const author = checkAuthor(input.author);
  const id = String(input.threadId || '');
  let snapshot = null;
  const comment = await update(store, `thread-${id}`, () => null, t => {
    if (!t || t.removed) throw new ForumError(404, 'That thread was removed or doesn’t exist.');
    if (t.locked) throw new ForumError(403, 'This thread is locked.');
    let parentId = input.parentId ? String(input.parentId) : null;
    if (parentId) {
      const byId = new Map(t.comments.map(c => [c.id, c]));
      if (!byId.has(parentId)) throw new ForumError(400, 'The comment you replied to is gone.');
      // keep nesting shallow: replies deeper than MAX_DEPTH attach to the deepest allowed parent
      const chain = [];
      for (let p = byId.get(parentId); p; p = p.parentId ? byId.get(p.parentId) : null) chain.unshift(p);
      if (chain.length >= MAX_DEPTH) parentId = chain[MAX_DEPTH - 2].id; // new comment lands at MAX_DEPTH
    }
    if (t.comments.some(c => c.author === author && c.body === body && now - Date.parse(c.createdAt) < 600e3)) {
      return { abort: { duplicate: true } };
    }
    const c = { id: newId(), parentId, author, body, createdAt: new Date(now).toISOString(), score: 0, votes: {}, reports: [], removed: null };
    t.comments.push(c);
    t.lastActivity = c.createdAt;
    snapshot = t;
    return c;
  });
  if (comment && comment.duplicate) throw new ForumError(409, 'Looks like you already posted that.');
  await update(store, 'index', () => ({ threads: [] }), index => { syncSummary(index, snapshot); return null; });
  return { id: comment.id };
}

export async function toggleVote(store, { threadId, commentId }, voter) {
  let snapshot = null;
  const res = await update(store, `thread-${String(threadId || '')}`, () => null, t => {
    if (!t || t.removed) throw new ForumError(404, 'That thread was removed or doesn’t exist.');
    const target = commentId ? t.comments.find(c => c.id === commentId && !c.removed) : t;
    if (!target) throw new ForumError(404, 'That comment is gone.');
    target.votes = target.votes || {};
    const on = !target.votes[voter];
    if (on) target.votes[voter] = 1; else delete target.votes[voter];
    target.score = Object.keys(target.votes).length;
    snapshot = t;
    return { voted: on, score: target.score };
  });
  if (!commentId) await update(store, 'index', () => ({ threads: [] }), index => { syncSummary(index, snapshot); return null; });
  return res;
}

export async function report(store, { threadId, commentId, reason }, voter) {
  let snapshot = null;
  const res = await update(store, `thread-${String(threadId || '')}`, () => null, t => {
    if (!t) throw new ForumError(404, 'That thread doesn’t exist.');
    const target = commentId ? t.comments.find(c => c.id === commentId) : t;
    if (!target) throw new ForumError(404, 'That comment is gone.');
    target.reports = target.reports || [];
    if (target.reports.some(r => r.by === voter)) return { abort: { reported: true, hidden: !!target.removed } };
    target.reports.push({ by: voter, reason: clean(reason).slice(0, 200), at: new Date().toISOString() });
    if (!target.removed && target.reports.length >= AUTO_HIDE_REPORTS) target.removed = 'auto';
    snapshot = t;
    return { reported: true, hidden: !!target.removed };
  });
  if (snapshot) await update(store, 'index', () => ({ threads: [] }), index => { syncSummary(index, snapshot); return null; });
  return res;
}

// ---- Admin ----------------------------------------------------------------------------------------------

export async function moderate(store, { action, threadId, commentId, value }) {
  const ACTIONS = ['remove', 'restore', 'dismiss', 'pin', 'lock', 'purge'];
  if (!ACTIONS.includes(action)) throw new ForumError(400, 'Unknown admin action.');
  let snapshot = null;
  await update(store, `thread-${String(threadId || '')}`, () => null, t => {
    if (!t) throw new ForumError(404, 'No such thread.');
    const target = commentId ? t.comments.find(c => c.id === commentId) : t;
    if (!target) throw new ForumError(404, 'No such comment.');
    if (action === 'remove') target.removed = 'admin';
    if (action === 'restore') { target.removed = null; target.reports = []; }
    if (action === 'dismiss') target.reports = [];
    if (action === 'pin' && !commentId) t.pinned = !!value;
    if (action === 'lock' && !commentId) t.locked = !!value;
    if (action === 'purge' && commentId) { target.body = ''; target.author = '[removed]'; target.removed = 'admin'; }
    snapshot = t;
    return null;
  });
  await update(store, 'index', () => ({ threads: [] }), index => { syncSummary(index, snapshot); return null; });
  return { ok: true };
}

// Everything with open reports or hidden content, newest first
export async function reportQueue(store) {
  const idx = await store.read('index');
  const out = [];
  for (const s of (idx ? idx.data.threads : []).filter(x => x.flags)) {
    const doc = await store.read(`thread-${s.id}`);
    if (!doc) continue;
    const t = doc.data;
    if ((t.reports || []).length || t.removed) out.push({ threadId: t.id, commentId: null, title: t.title, author: t.author, body: t.body.slice(0, 300), reports: t.reports || [], removed: t.removed });
    for (const c of t.comments) {
      if ((c.reports || []).length || c.removed === 'auto') out.push({ threadId: t.id, commentId: c.id, title: t.title, author: c.author, body: c.body.slice(0, 300), reports: c.reports || [], removed: c.removed });
    }
  }
  return { items: out };
}
