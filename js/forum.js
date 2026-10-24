// Fan Talk: a real forum backed by /api/forum (see api/forum.js).
// Topic feed -> tap a thread -> full thread with nested replies. Upvotes, reports, game threads,
// and moderator tools. Links to a thread look like  #thread=<id>  so they can be shared.

const FORUM_API = '/api/forum';
const FORUM_CATS = {
  gameday:  { label: 'Game Day',             icon: '🏈', tone: 'text-amber-300 border-amber-400/50 bg-amber-400/10' },
  roster:   { label: 'Roster & Trades',      icon: '🐾', tone: 'text-sky-300 border-panthers-blue/50 bg-panthers-blue/10' },
  draft:    { label: 'Draft',                icon: '📋', tone: 'text-emerald-300 border-emerald-400/50 bg-emerald-400/10' },
  stadium:  { label: 'Stadium & Tailgating', icon: '🏟️', tone: 'text-fuchsia-300 border-fuchsia-400/50 bg-fuchsia-400/10' },
  offtopic: { label: 'Off-Topic',            icon: '💬', tone: 'text-slate-300 border-slate-500/50 bg-slate-500/10' }
};
const FORUM_SORTS = { hot: '🔥 Hot', new: '🆕 New', top: '⬆ Top' };
const FEED_PAGE = 20;

const forumUI = {
  threads: [], loaded: false, error: '', cat: 'all', sort: 'hot', limit: FEED_PAGE,
  thread: null, threadError: '', replyTo: null, collapsed: new Set(), composerOpen: false,
  busy: false, admin: false, reports: null
};

// ---- Browser storage (wrapped: it can be unavailable in private windows) --------------------------------

function forumStorage(kind) {
  try { return kind === 'session' ? window.sessionStorage : window.localStorage; } catch { return null; }
}
function getSaved(key, kind) { try { return forumStorage(kind)?.getItem(key) ?? null; } catch { return null; } }
function setSaved(key, value, kind) { try { value == null ? forumStorage(kind)?.removeItem(key) : forumStorage(kind)?.setItem(key, value); } catch { /* ignore */ } }

function fanId() {
  let id = getSaved('fanId');
  if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    const bytes = new Uint8Array(12);
    (globalThis.crypto || window.crypto).getRandomValues(bytes);
    id = 'fan-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    setSaved('fanId', id);
  }
  return id;
}
const fanName = () => getSaved('fanName') || '';

// ---- API ------------------------------------------------------------------------------------------------

async function forumApi(method, action, { body, query = '' } = {}) {
  const headers = { 'X-Fan-Id': fanId() };
  const adminKey = getSaved('forumAdminKey', 'session');
  if (adminKey) headers['X-Admin-Key'] = adminKey;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${FORUM_API}?action=${action}${query}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Can’t reach the forum right now. Check your connection and try again.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* not JSON */ }
  if (!res.ok) throw new Error(data.error || `The forum had a problem (${res.status}).`);
  return data;
}

// ---- Helpers ------------------------------------------------------------------------------------------

function timeAgo(iso, now = Date.now()) {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Escape the text, then turn bare http(s) links into safe links that open in a new tab
function formatPost(text) {
  return escapeHtml(text).replace(/https?:\/\/[^\s<]+[^\s<.,!?)'"]/g, url => {
    const raw = url.replace(/&amp;/g, '&');
    const href = safeUrl(raw);
    if (href === '#') return url;
    const shown = url.length > 60 ? url.slice(0, 57) + '…' : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow ugc" class="text-panthers-blue hover:underline break-all">${shown}</a>`;
  });
}

function hotScore(t, now = Date.now()) {
  const hours = (now - Date.parse(t.lastActivity || t.createdAt)) / 3600000;
  return (t.score + t.replies * 1.5 + 1) / Math.pow(hours + 2, 1.4);
}

function sortedThreads(now = Date.now()) {
  const list = forumUI.threads.filter(t => forumUI.cat === 'all' || t.cat === forumUI.cat);
  const by = {
    hot: (a, b) => hotScore(b, now) - hotScore(a, now),
    new: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    top: (a, b) => b.score - a.score || b.replies - a.replies
  }[forumUI.sort];
  return list.slice().sort((a, b) => (b.pinned - a.pinned) || by(a, b));
}

function catChip(cat) {
  const c = FORUM_CATS[cat];
  if (!c) return '';
  return `<span class="text-[9px] font-heading font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${c.tone}">${c.icon} ${c.label}</span>`;
}

function votedSet() { try { return new Set(JSON.parse(getSaved('forumVotes') || '[]')); } catch { return new Set(); } }
function rememberVote(key, on) {
  const s = votedSet();
  on ? s.add(key) : s.delete(key);
  setSaved('forumVotes', JSON.stringify([...s].slice(-500)));
}

function forumToast(msg, tone = 'info') {
  const el = document.getElementById('forum-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-lg text-xs font-bold shadow-lg ${tone === 'error' ? 'bg-red-600 text-white' : 'bg-panthers-blue text-white'}`;
  clearTimeout(forumToast.t);
  forumToast.t = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ---- Feed -----------------------------------------------------------------------------------------------

async function loadForum() {
  forumUI.error = '';
  try {
    const data = await forumApi('GET', 'list');
    forumUI.threads = data.threads || [];
    forumUI.loaded = true;
  } catch (err) {
    forumUI.error = err.message;
    if (forumUI.loaded) forumToast(err.message, 'error');
  }
  renderForumFeed();
}

function renderForumControls() {
  const chips = [['all', '🔎 All topics']].concat(Object.entries(FORUM_CATS).map(([k, c]) => [k, `${c.icon} ${c.label}`]));
  document.getElementById('forum-cats').innerHTML = chips.map(([k, label]) => `
    <button onclick="setForumCat('${k}')" aria-pressed="${forumUI.cat === k}"
      class="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${forumUI.cat === k ? 'bg-panthers-blue border-panthers-blue text-white' : 'bg-panthers-black/60 border-panthers-cardBorder text-panthers-silver hover:text-white'}">${label}</button>`).join('');
  document.getElementById('forum-sorts').innerHTML = Object.entries(FORUM_SORTS).map(([k, label]) => `
    <button onclick="setForumSort('${k}')" aria-pressed="${forumUI.sort === k}"
      class="text-[11px] font-heading font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors ${forumUI.sort === k ? 'bg-white/10 text-white' : 'text-panthers-silver hover:text-white'}">${label}</button>`).join('');
}

function threadRowHtml(t, voted) {
  const on = voted.has('t:' + t.id);
  return `
    <article class="group flex gap-3 bg-panthers-black/50 border ${t.pinned ? 'border-amber-400/40' : 'border-panthers-cardBorder'} hover:border-panthers-blue rounded-xl p-3 transition-colors">
      <button onclick="voteThread('${t.id}', event)" aria-pressed="${on}" aria-label="Upvote"
        class="shrink-0 w-11 flex flex-col items-center justify-center rounded-lg border ${on ? 'border-panthers-blue bg-panthers-blue/20 text-white' : 'border-panthers-cardBorder text-panthers-silver hover:text-white hover:border-panthers-blue'}">
        <span class="text-xs leading-none">▲</span><span class="font-heading font-bold text-sm leading-tight">${t.score}</span>
      </button>
      <div role="button" tabindex="0" onclick="openThread('${t.id}')" onkeydown="if(event.key==='Enter'){openThread('${t.id}')}" class="min-w-0 flex-1 cursor-pointer">
        <div class="flex flex-wrap items-center gap-1.5 mb-1">
          ${t.pinned ? '<span class="text-[9px] font-heading font-bold uppercase tracking-wider text-amber-300">📌 Pinned</span>' : ''}
          ${catChip(t.cat)}
          ${t.locked ? '<span class="text-[9px] text-panthers-silver">🔒 Locked</span>' : ''}
          ${t.removed ? `<span class="text-[9px] text-rose-300 font-bold">HIDDEN (${escapeHtml(t.removed)})</span>` : ''}
        </div>
        <h3 class="font-heading font-bold text-white text-base leading-snug group-hover:text-panthers-blue transition-colors">${escapeHtml(t.title)}</h3>
        ${t.preview ? `<p class="text-panthers-silver text-xs mt-0.5 line-clamp-2">${escapeHtml(t.preview)}</p>` : ''}
        <p class="text-[10px] text-slate-500 mt-1.5"><span class="text-panthers-silver font-semibold">${escapeHtml(t.author)}</span> · ${timeAgo(t.createdAt)} · 💬 ${t.replies} ${t.replies === 1 ? 'reply' : 'replies'}${t.replies ? ` · last activity ${timeAgo(t.lastActivity)}` : ''}</p>
      </div>
    </article>`;
}

function renderForumFeed() {
  renderForumControls();
  const box = document.getElementById('forum-feed');
  const more = document.getElementById('forum-more');
  if (forumUI.error && !forumUI.loaded) {
    box.innerHTML = `<div class="bg-panthers-black/50 border border-panthers-cardBorder rounded-xl p-4 text-xs text-panthers-silver">
      ${escapeHtml(forumUI.error)} <button onclick="loadForum()" class="text-panthers-blue font-bold hover:underline">Try again</button></div>`;
    more.innerHTML = '';
    return;
  }
  if (!forumUI.loaded) { box.innerHTML = '<p class="text-panthers-silver text-xs animate-pulse">Loading the latest threads…</p>'; more.innerHTML = ''; return; }
  const list = sortedThreads();
  const voted = votedSet();
  box.innerHTML = list.length
    ? list.slice(0, forumUI.limit).map(t => threadRowHtml(t, voted)).join('')
    : `<div class="text-center py-10 bg-panthers-black/40 border border-dashed border-panthers-cardBorder rounded-xl">
        <p class="text-3xl">🐾</p><p class="text-white font-heading font-bold uppercase tracking-wider mt-1">No threads here yet</p>
        <p class="text-panthers-silver text-xs mt-1">Be the first. Start the conversation.</p>
        <button onclick="toggleComposer(true)" class="mt-3 bg-panthers-blue hover:bg-panthers-blueHover text-white text-[10px] font-heading font-bold px-3 py-1.5 rounded uppercase tracking-wider">Start a thread</button></div>`;
  more.innerHTML = list.length > forumUI.limit
    ? `<button onclick="forumUI.limit += ${FEED_PAGE}; renderForumFeed()" class="w-full text-[11px] font-heading font-bold uppercase tracking-wider text-panthers-silver hover:text-white border border-panthers-cardBorder hover:border-panthers-blue rounded-lg py-2">Load more threads (${list.length - forumUI.limit} more)</button>`
    : '';
  document.getElementById('forum-count').textContent = `${forumUI.threads.length} thread${forumUI.threads.length === 1 ? '' : 's'}`;
}

function setForumCat(cat) { forumUI.cat = cat === 'all' || FORUM_CATS[cat] ? cat : 'all'; forumUI.limit = FEED_PAGE; renderForumFeed(); }
function setForumSort(sort) { forumUI.sort = FORUM_SORTS[sort] ? sort : 'hot'; renderForumFeed(); }

// ---- Composer -------------------------------------------------------------------------------------------

function toggleComposer(open) {
  forumUI.composerOpen = open === undefined ? !forumUI.composerOpen : open;
  document.getElementById('forum-composer').classList.toggle('hidden', !forumUI.composerOpen);
  if (forumUI.composerOpen) {
    const name = document.getElementById('compose-name');
    if (!name.value) name.value = fanName();
    const cat = document.getElementById('compose-cat');
    if (forumUI.cat !== 'all') cat.value = forumUI.cat;
    (name.value ? document.getElementById('compose-title') : name).focus?.();
  }
}

function setBusy(on, btnId) {
  forumUI.busy = on;
  const b = btnId && document.getElementById(btnId);
  if (b) { b.disabled = on; b.classList.toggle('opacity-60', on); }
}

async function submitThread() {
  if (forumUI.busy) return;
  const val = id => document.getElementById(id).value;
  const author = val('compose-name').trim();
  const body = { author, cat: val('compose-cat'), title: val('compose-title'), body: val('compose-body') };
  const err = document.getElementById('compose-error');
  err.textContent = '';
  setBusy(true, 'compose-submit');
  try {
    const res = await forumApi('POST', 'create', { body });
    setSaved('fanName', author);
    document.getElementById('compose-title').value = '';
    document.getElementById('compose-body').value = '';
    toggleComposer(false);
    forumToast('Thread posted 🔥');
    await loadForum();
    openThread(res.id);
  } catch (e) {
    err.textContent = e.message;
  } finally {
    setBusy(false, 'compose-submit');
  }
}

// ---- Thread view ----------------------------------------------------------------------------------------

async function openThread(id, { keepScroll = false } = {}) {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(String(id))) return;
  if (location.hash !== '#thread=' + id) history.replaceState?.(null, '', '#thread=' + id);
  document.getElementById('forum-feed-view').classList.add('hidden');
  document.getElementById('forum-thread-view').classList.remove('hidden');
  if (!forumUI.thread || forumUI.thread.id !== id) {
    forumUI.thread = { id, loading: true };
    forumUI.replyTo = null;
    forumUI.collapsed = new Set();
    renderThread();
  }
  if (!keepScroll) document.getElementById('forum-tab').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  try {
    forumUI.thread = await forumApi('GET', 'thread', { query: `&id=${encodeURIComponent(id)}` });
    forumUI.threadError = '';
  } catch (e) {
    forumUI.thread = { id, missing: true };
    forumUI.threadError = e.message;
  }
  renderThread();
}

function closeThread() {
  forumUI.thread = null;
  history.replaceState?.(null, '', location.pathname + location.search);
  document.getElementById('forum-thread-view').classList.add('hidden');
  document.getElementById('forum-feed-view').classList.remove('hidden');
  loadForum();
}

// Build the reply tree: [{ comment, children: [...] }] in posting order
function commentTree(comments) {
  const nodes = new Map(comments.map(c => [c.id, { c, children: [] }]));
  const roots = [];
  for (const c of comments) {
    const node = nodes.get(c.id);
    const parent = c.parentId && nodes.get(c.parentId);
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}

function countDescendants(node) { return node.children.reduce((n, ch) => n + 1 + countDescendants(ch), 0); }

function adminButtonsHtml(threadId, commentId, item) {
  if (!forumUI.admin) return '';
  const c = commentId ? `'${commentId}'` : 'null';
  const btn = (label, action, value) => `<button onclick="moderatePost('${action}', '${threadId}', ${c}${value !== undefined ? `, ${value}` : ''})" class="text-rose-300 hover:text-white">${label}</button>`;
  return `<span class="inline-flex flex-wrap gap-2 ml-2 pl-2 border-l border-rose-500/40 text-[10px] font-bold">
    ${item.removed ? btn('Restore', 'restore') : btn('Remove', 'remove')}
    ${item.reports ? `<span class="text-rose-300/80">${item.reports} report${item.reports === 1 ? '' : 's'}</span>${btn('Dismiss', 'dismiss')}` : ''}
    ${!commentId ? btn(forumUI.thread.pinned ? 'Unpin' : 'Pin', 'pin', !forumUI.thread.pinned) + btn(forumUI.thread.locked ? 'Unlock' : 'Lock', 'lock', !forumUI.thread.locked) : ''}
  </span>`;
}

function replyBoxHtml(parentId) {
  return `
    <div class="mt-2 bg-panthers-black/60 border border-panthers-blue/50 rounded-lg p-2.5">
      ${fanName() ? '' : `<input id="reply-name" maxlength="24" placeholder="Your fan name" class="w-full mb-2 bg-panthers-black border border-panthers-cardBorder px-2.5 py-1.5 rounded text-xs text-white focus:outline-none focus:border-panthers-blue">`}
      <textarea id="reply-body" rows="3" maxlength="2000" placeholder="${parentId ? 'Write a reply…' : 'Add to the conversation…'}" class="w-full bg-panthers-black border border-panthers-cardBorder px-2.5 py-1.5 rounded text-xs text-white focus:outline-none focus:border-panthers-blue resize-y"></textarea>
      <div class="flex items-center gap-2 mt-1.5">
        <button id="reply-submit" onclick="submitComment()" class="bg-panthers-blue hover:bg-panthers-blueHover text-white text-[10px] font-heading font-bold px-3 py-1.5 rounded uppercase tracking-wider">${parentId ? 'Reply' : 'Comment'}</button>
        ${parentId ? '<button onclick="setReplyTo(null)" class="text-[10px] text-panthers-silver hover:text-white">Cancel</button>' : ''}
        <span id="reply-error" class="text-[11px] text-rose-300"></span>
      </div>
    </div>`;
}

function commentNodeHtml(node, depth, voted, locked) {
  const c = node.c;
  const on = c.voted || voted.has('c:' + c.id);
  const collapsed = forumUI.collapsed.has(c.id);
  const kids = countDescendants(node);
  const isOp = forumUI.thread && c.author === forumUI.thread.author && !c.removed;
  return `
    <div class="${depth ? 'ml-3 sm:ml-5 pl-3 border-l-2 border-panthers-cardBorder hover:border-panthers-blue/60' : ''} mt-3" id="c-${c.id}">
      <div class="flex items-center gap-2 text-[10px] text-slate-500">
        <button onclick="toggleCollapse('${c.id}')" class="text-panthers-silver hover:text-white font-mono" aria-label="${collapsed ? 'Expand' : 'Collapse'} thread">[${collapsed ? '+' : '–'}]</button>
        <span class="font-semibold ${c.removed ? 'text-slate-500' : 'text-white'}">${escapeHtml(c.author)}</span>
        ${isOp ? '<span class="text-[9px] font-bold text-panthers-blue border border-panthers-blue/50 rounded px-1">OP</span>' : ''}
        <span>· ${timeAgo(c.createdAt)}</span>
        ${collapsed && kids ? `<span class="text-panthers-silver">· ${kids} more repl${kids === 1 ? 'y' : 'ies'} hidden</span>` : ''}
      </div>
      ${collapsed ? '' : `
        <div class="text-xs mt-1 whitespace-pre-line break-words ${c.removed ? 'italic text-slate-500' : 'text-slate-200'}">${c.removed ? (forumUI.admin && c.body ? formatPost(c.body) + ' <span class="text-rose-300 not-italic">(hidden)</span>' : 'This comment was removed.') : formatPost(c.body)}</div>
        <div class="flex items-center gap-3 mt-1 text-[10px] font-bold text-panthers-silver">
          ${c.removed ? '' : `<button onclick="voteComment('${c.id}')" aria-pressed="${on}" class="${on ? 'text-panthers-blue' : 'hover:text-white'}">▲ ${c.score}</button>
          ${locked ? '' : `<button onclick="setReplyTo('${c.id}')" class="hover:text-white">↩ Reply</button>`}
          <button onclick="reportPost('${c.id}')" class="hover:text-rose-300">⚑ Report</button>`}
          ${adminButtonsHtml(forumUI.thread.id, c.id, c)}
        </div>
        ${forumUI.replyTo === c.id ? replyBoxHtml(c.id) : ''}
        ${node.children.map(ch => commentNodeHtml(ch, depth + 1, voted, locked)).join('')}`}
    </div>`;
}

function renderThread() {
  const box = document.getElementById('forum-thread');
  const t = forumUI.thread;
  if (!t) { box.innerHTML = ''; return; }
  if (t.loading) { box.innerHTML = '<p class="text-panthers-silver text-xs animate-pulse">Loading thread…</p>'; return; }
  if (t.missing) { box.innerHTML = `<p class="text-panthers-silver text-xs">${escapeHtml(forumUI.threadError)}</p>`; return; }
  const voted = votedSet();
  const on = t.voted || voted.has('t:' + t.id);
  const tree = commentTree(t.comments);
  const visible = t.comments.filter(c => !c.removed).length;

  box.innerHTML = `
    <div class="flex flex-wrap items-center gap-1.5 mb-1">
      ${t.pinned ? '<span class="text-[9px] font-heading font-bold uppercase tracking-wider text-amber-300">📌 Pinned</span>' : ''}
      ${catChip(t.cat)}
      ${t.locked ? '<span class="text-[10px] text-panthers-silver">🔒 Locked: no new comments</span>' : ''}
    </div>
    <h2 class="font-heading font-bold text-white text-2xl sm:text-3xl uppercase tracking-wide leading-tight">${escapeHtml(t.title)}</h2>
    <p class="text-[11px] text-slate-500 mt-1"><span class="text-panthers-silver font-semibold">${escapeHtml(t.author)}</span> · ${timeAgo(t.createdAt)}</p>
    ${t.body ? `<div class="text-sm text-slate-200 mt-3 whitespace-pre-line break-words leading-relaxed">${formatPost(t.body)}</div>` : ''}
    <div class="flex flex-wrap items-center gap-3 mt-3 pb-3 border-b border-panthers-cardBorder text-[11px] font-bold text-panthers-silver">
      <button onclick="voteThread('${t.id}')" aria-pressed="${on}" class="px-2.5 py-1 rounded border ${on ? 'border-panthers-blue bg-panthers-blue/20 text-white' : 'border-panthers-cardBorder hover:text-white hover:border-panthers-blue'}">▲ ${t.score} upvote${t.score === 1 ? '' : 's'}</button>
      <span>💬 ${visible} comment${visible === 1 ? '' : 's'}</span>
      <button onclick="copyThreadLink()" class="hover:text-white">🔗 Share</button>
      <button onclick="reportPost(null)" class="hover:text-rose-300">⚑ Report</button>
      ${adminButtonsHtml(t.id, null, t)}
    </div>
    ${t.locked ? '' : (forumUI.replyTo === null ? replyBoxHtml(null) : `<button onclick="setReplyTo(null)" class="mt-3 text-[11px] text-panthers-blue font-bold hover:underline">+ Add a top-level comment</button>`)}
    <div class="mt-2">${tree.length ? tree.map(n => commentNodeHtml(n, 0, voted, t.locked)).join('') : '<p class="text-panthers-silver text-xs mt-4">No comments yet. Get it started.</p>'}</div>`;
}

function setReplyTo(id) { forumUI.replyTo = id; renderThread(); document.getElementById('reply-body')?.focus?.(); }
function toggleCollapse(id) { forumUI.collapsed.has(id) ? forumUI.collapsed.delete(id) : forumUI.collapsed.add(id); renderThread(); }

async function submitComment() {
  if (forumUI.busy || !forumUI.thread) return;
  const nameEl = document.getElementById('reply-name');
  const author = (nameEl ? nameEl.value : fanName()).trim();
  const body = document.getElementById('reply-body').value;
  const err = document.getElementById('reply-error');
  err.textContent = '';
  setBusy(true, 'reply-submit');
  try {
    await forumApi('POST', 'comment', { body: { threadId: forumUI.thread.id, parentId: forumUI.replyTo, body, author } });
    setSaved('fanName', author);
    forumUI.replyTo = null;
    await openThread(forumUI.thread.id, { keepScroll: true });
    forumToast('Posted ✔');
  } catch (e) {
    err.textContent = e.message;
  } finally {
    setBusy(false, 'reply-submit');
  }
}

async function voteThread(id, evt) {
  if (evt) evt.stopPropagation();
  try {
    const r = await forumApi('POST', 'vote', { body: { threadId: id } });
    rememberVote('t:' + id, r.voted);
    const row = forumUI.threads.find(t => t.id === id);
    if (row) row.score = r.score;
    if (forumUI.thread && forumUI.thread.id === id) { forumUI.thread.score = r.score; forumUI.thread.voted = r.voted; renderThread(); }
    renderForumFeed();
  } catch (e) { forumToast(e.message, 'error'); }
}

async function voteComment(commentId) {
  const t = forumUI.thread;
  try {
    const r = await forumApi('POST', 'vote', { body: { threadId: t.id, commentId } });
    rememberVote('c:' + commentId, r.voted);
    const c = t.comments.find(x => x.id === commentId);
    if (c) { c.score = r.score; c.voted = r.voted; }
    renderThread();
  } catch (e) { forumToast(e.message, 'error'); }
}

async function reportPost(commentId) {
  const reason = window.prompt?.('Why are you reporting this? (spam, harassment, off-topic…)', '');
  if (reason === null || reason === undefined) return;
  try {
    const r = await forumApi('POST', 'report', { body: { threadId: forumUI.thread.id, commentId, reason } });
    forumToast(r.hidden ? 'Thanks. It’s hidden until a moderator reviews it.' : 'Thanks. A moderator will take a look.');
    if (r.hidden) openThread(forumUI.thread.id, { keepScroll: true });
  } catch (e) { forumToast(e.message, 'error'); }
}

function copyThreadLink() {
  const url = location.origin + location.pathname + '#thread=' + forumUI.thread.id;
  (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => forumToast('Link copied'), () => window.prompt?.('Copy this link:', url));
}

// ---- Moderators -----------------------------------------------------------------------------------------

async function moderatorLogin() {
  if (forumUI.admin) { setSaved('forumAdminKey', null, 'session'); forumUI.admin = false; renderModPanel(); renderThread(); renderForumFeed(); return; }
  const key = window.prompt?.('Moderator password:');
  if (!key) return;
  setSaved('forumAdminKey', key.trim(), 'session');
  await checkAdmin();
  if (!forumUI.admin) { setSaved('forumAdminKey', null, 'session'); forumToast('Wrong password.', 'error'); }
  else forumToast('Moderator tools on');
}

async function checkAdmin() {
  if (!getSaved('forumAdminKey', 'session')) { forumUI.admin = false; renderModPanel(); return; }
  try { forumUI.admin = !!(await forumApi('GET', 'whoami')).admin; } catch { forumUI.admin = false; }
  renderModPanel();
  if (forumUI.admin) { loadReports(); loadForum(); if (forumUI.thread && !forumUI.thread.loading) openThread(forumUI.thread.id, { keepScroll: true }); }
}

async function loadReports() {
  try { forumUI.reports = (await forumApi('GET', 'reports')).items; } catch (e) { forumUI.reports = []; forumToast(e.message, 'error'); }
  renderModPanel();
}

function renderModPanel() {
  const btn = document.getElementById('mod-login');
  if (btn) btn.textContent = forumUI.admin ? 'Moderator: sign out' : 'Moderator login';
  const box = document.getElementById('mod-panel');
  if (!box) return;
  box.classList.toggle('hidden', !forumUI.admin);
  if (!forumUI.admin) return;
  const items = forumUI.reports;
  box.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-heading font-bold text-rose-300 text-sm uppercase tracking-wider">🛡 Report queue</h3>
      <button onclick="loadReports()" class="text-[10px] text-panthers-silver hover:text-white">↻ Refresh</button>
    </div>
    ${items == null ? '<p class="text-xs text-panthers-silver">Loading…</p>' : !items.length ? '<p class="text-xs text-panthers-silver">Nothing to review. 🎉</p>' :
      items.map(i => `
        <div class="bg-panthers-black/60 border border-rose-500/30 rounded-lg p-2 mb-2 text-[11px]">
          <button onclick="openThread('${i.threadId}')" class="text-white font-bold hover:underline text-left">${escapeHtml(i.title)}</button>
          <p class="text-slate-400">${i.commentId ? 'Comment' : 'Thread'} by ${escapeHtml(i.author)} · ${i.reports.length} report${i.reports.length === 1 ? '' : 's'}${i.removed ? ` · hidden (${escapeHtml(i.removed)})` : ''}</p>
          <p class="text-slate-300 mt-1 line-clamp-3">${escapeHtml(i.body || '(no text)')}</p>
          ${i.reports.length ? `<p class="text-slate-500 mt-1">Reasons: ${escapeHtml(i.reports.map(r => r.reason || '—').join(' · '))}</p>` : ''}
          <div class="flex gap-3 mt-1.5 font-bold">
            <button onclick="moderatePost('remove', '${i.threadId}', ${i.commentId ? `'${i.commentId}'` : 'null'})" class="text-rose-300 hover:text-white">Remove</button>
            <button onclick="moderatePost('restore', '${i.threadId}', ${i.commentId ? `'${i.commentId}'` : 'null'})" class="text-emerald-300 hover:text-white">Keep (restore)</button>
          </div>
        </div>`).join('')}`;
}

async function moderatePost(action, threadId, commentId, value) {
  try {
    await forumApi('POST', 'moderate', { body: { action, threadId, commentId, value } });
    forumToast('Done');
    loadReports();
    if (forumUI.thread && forumUI.thread.id === threadId) openThread(threadId, { keepScroll: true }); else loadForum();
  } catch (e) { forumToast(e.message, 'error'); }
}

// ---- Start-up -------------------------------------------------------------------------------------------

function threadIdFromHash() {
  const m = /^#thread=([A-Za-z0-9_-]{1,40})$/.exec(location.hash || '');
  return m ? m[1] : null;
}

function initForum() {
  renderForumControls();
  renderForumFeed();
  loadForum();
  checkAdmin();
  const id = threadIdFromHash();
  if (id) { openTabByNav('forum-tab'); openThread(id); }
}
