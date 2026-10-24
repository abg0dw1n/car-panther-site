// Forum API (Vercel Function). One endpoint, picked by ?action=
//   GET  ?action=list                      topic feed
//   GET  ?action=thread&id=<id>            one thread with all comments
//   POST ?action=create   {title, body, cat, author}
//   POST ?action=comment  {threadId, parentId?, body, author}
//   POST ?action=vote     {threadId, commentId?}            (toggles your upvote)
//   POST ?action=report   {threadId, commentId?, reason}
//   GET  ?action=reports                   admin only (X-Admin-Key header)
//   POST ?action=moderate {action, threadId, commentId?, value?}   admin only
// Every request from the page sends X-Fan-Id: a random id kept in the visitor's browser, used
// (salted and hashed) so each person gets one vote per post.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { getStore } from './_forum/store.js';
import * as forum from './_forum/core.js';

let schedule = null;
function loadSchedule() {
  if (schedule) return schedule;
  try {
    const code = readFileSync(join(process.cwd(), 'data', 'schedule.js'), 'utf8');
    schedule = new Function(`${code}; return panthers2026Schedule;`)();
  } catch { schedule = []; }
  return schedule;
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});

function isAdmin(request) {
  const want = process.env.FORUM_ADMIN_KEY;
  const got = request.headers.get('x-admin-key');
  if (!want || !got) return false;
  const a = Buffer.from(want), b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

const clientIp = request => (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
const salt = () => process.env.FORUM_VOTER_SALT || 'dev-salt';

async function handle(request, method) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const store = await getStore();
  const admin = isAdmin(request);
  const fanId = request.headers.get('x-fan-id');
  const voter = fanId && /^[A-Za-z0-9_-]{8,64}$/.test(fanId) ? forum.voterKey(fanId, salt()) : null;

  if (method === 'GET') {
    if (action === 'list') return json(200, await forum.listThreads(store, { schedule: loadSchedule(), admin }));
    if (action === 'thread') return json(200, await forum.getThread(store, url.searchParams.get('id'), { voter, admin }));
    if (action === 'reports') {
      if (!admin) return json(401, { error: 'Admin key required.' });
      return json(200, await forum.reportQueue(store));
    }
    if (action === 'whoami') return json(200, { admin });
    return json(400, { error: 'Unknown action.' });
  }

  // POST
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) return json(415, { error: 'Send JSON.' });
  const text = await request.text();
  if (text.length > 20000) return json(413, { error: 'That’s too long.' });
  let body;
  try { body = JSON.parse(text || '{}'); } catch { return json(400, { error: 'Bad JSON.' }); }
  const ip = clientIp(request);

  switch (action) {
    case 'create':
      if (!voter) return json(400, { error: 'Missing fan id.' });
      forum.rateLimit(ip, 'thread');
      return json(201, await forum.createThread(store, body));
    case 'comment':
      if (!voter) return json(400, { error: 'Missing fan id.' });
      forum.rateLimit(ip, 'comment');
      return json(201, await forum.addComment(store, body));
    case 'vote':
      if (!voter) return json(400, { error: 'Missing fan id.' });
      forum.rateLimit(ip, 'vote');
      return json(200, await forum.toggleVote(store, body, voter));
    case 'report':
      if (!voter) return json(400, { error: 'Missing fan id.' });
      forum.rateLimit(ip, 'report');
      return json(200, await forum.report(store, body, voter));
    case 'moderate':
      if (!admin) return json(401, { error: 'Admin key required.' });
      return json(200, await forum.moderate(store, body));
    default:
      return json(400, { error: 'Unknown action.' });
  }
}

async function safe(request, method) {
  try {
    return await handle(request, method);
  } catch (err) {
    if (err instanceof forum.ForumError) return json(err.status, { error: err.message });
    if (err && err.message === 'busy') return json(503, { error: 'The forum is busy. Try again in a moment.' });
    console.error('forum error', err);
    return json(500, { error: 'Something went wrong. Try again.' });
  }
}

export function GET(request) { return safe(request, 'GET'); }
export function POST(request) { return safe(request, 'POST'); }
