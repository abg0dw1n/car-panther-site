// Roster tab: player cards with real headshots, status filter, and verified season stat lines.
// The data lives in data/roster.js.

const ROSTER_GROUPS = ['offense', 'defense', 'special', 'staff'];
let activeRosterStatus = 'all';

const STATUS_FILTERS = {
  all: () => true,
  active: p => p.status === 'Active',
  injured: p => p.status === 'IR' || p.status === 'PUP',
  squad: p => p.status === 'Practice Squad'
};

const STATUS_BADGES = {
  IR: { text: 'IR', cls: 'bg-rose-950/70 text-rose-300 border-rose-500/60', title: 'Injured reserve' },
  PUP: { text: 'PUP', cls: 'bg-rose-950/70 text-rose-300 border-rose-500/60', title: 'Physically unable to perform list' },
  'Practice Squad': { text: 'PS', cls: 'bg-slate-800 text-panthers-silver border-slate-500/60', title: 'Practice squad' }
};

const GRID_COLS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

// ---- Headshots -----------------------------------------------------------------------------------------

const SILHOUETTE_SVG = `<svg class="w-7 h-7 text-panthers-blue/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

// Shown only if a photo can't be loaded (offline, or ESPN removed the image)
function fallbackAvatarHtml(num) {
  const numHtml = num ? `<span class="text-[9px] font-heading font-extrabold text-white leading-none mt-0.5">#${escapeHtml(num)}</span>` : '';
  return `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2536] to-[#0d131d]">${SILHOUETTE_SVG}${numHtml}</div>`;
}

function headshotFailed(img) {
  img.parentElement.innerHTML = fallbackAvatarHtml(img.dataset.num);
}

// ---- Stat lines ----------------------------------------------------------------------------------------

function fmt(n) {
  return n == null ? '—' : Number(n).toLocaleString('en-US');
}

function formatExp(exp) {
  if (exp == null) return null;
  if (exp === 0 || exp === 'Rookie') return 'Rookie';
  return `${exp} yr${exp === 1 ? '' : 's'} exp`;
}

// Up to three [label, value] pairs for a player's 2026 season, or null if no stats are on record
function seasonStatCells(p) {
  const s = p.stats;
  if (!s) return null;

  if (p.pos === 'QB' && s.passing) {
    const q = s.passing;
    const comp = q.att ? (q.comp / q.att * 100).toFixed(1) + '%' : '—';
    return [['PASS YDS', fmt(q.yds)], ['TD / INT', `${fmt(q.td)} / ${fmt(q.int)}`], ['COMP', comp]];
  }
  if (p.pos === 'RB' && s.rushing) {
    const totalTd = (s.rushing.td || 0) + ((s.receiving && s.receiving.td) || 0);
    return [['RUSH YDS', fmt(s.rushing.yds)], ['CARRIES', fmt(s.rushing.att)], ['TOTAL TD', fmt(totalTd)]];
  }
  if (s.receiving) {
    const r = s.receiving;
    return [['REC', fmt(r.rec)], ['REC YDS', fmt(r.yds)], ['TD', fmt(r.td)]];
  }
  if (s.defense) {
    const d = s.defense;
    return [['TACKLES', fmt(d.tackles)], ['SACKS', fmt(d.sacks)], ['INT / PD', `${fmt(d.ints ?? 0)} / ${fmt(d.passesDefensed ?? 0)}`]];
  }
  if (s.kicking) {
    const k = s.kicking;
    return [['FG', `${fmt(k.fgm)}/${fmt(k.fga)}`], ['LONG', fmt(k.long)], ['POINTS', fmt(k.points)]];
  }
  if (s.punting) {
    const u = s.punting;
    return [['PUNTS', fmt(u.punts)], ['AVG', fmt(u.avg)], ['NET', fmt(u.net)]];
  }
  if (s.gp != null) return [['GAMES', fmt(s.gp)]];
  return null;
}

// ---- Cards ---------------------------------------------------------------------------------------------

function statBarHtml(cells) {
  if (!cells) {
    return `<div class="bg-panthers-black/90 border-t border-panthers-cardBorder px-2 py-2.5 text-center text-[10px] text-panthers-silver">No 2026 stats on record</div>`;
  }
  const colors = ['text-emerald-400', 'text-panthers-blue', 'text-white'];
  const inner = cells.map(([label, value], i) => `
      <div>
        <span class="text-[8px] text-panthers-silver uppercase font-bold block leading-tight">${escapeHtml(label)}</span>
        <span class="text-xs font-heading font-bold ${colors[i]} truncate block">${escapeHtml(value)}</span>
      </div>`).join('');
  return `
    <div class="bg-panthers-black/90 border-t border-panthers-cardBorder px-2 pt-1.5 pb-2">
      <span class="text-[8px] text-slate-500 uppercase tracking-widest block text-center mb-1">2026 season · thru ${escapeHtml(ROSTER_STATS_THROUGH)}</span>
      <div class="grid ${GRID_COLS[cells.length]} text-center gap-1">${inner}
      </div>
    </div>`;
}

function playerCardHtml(p) {
  const badge = STATUS_BADGES[p.status];
  const badgeHtml = badge
    ? `<span title="${escapeHtml(badge.title)}" class="text-[9px] font-heading font-bold px-1.5 py-0.5 rounded border leading-none ${badge.cls}">${badge.text}</span>`
    : '';
  const bio = [p.ht, p.wt ? `${p.wt} lb` : null, p.age != null ? `Age ${p.age}` : null, formatExp(p.exp)].filter(Boolean).join(' · ');

  return `
    <div role="button" tabindex="0" onclick="openPlayer(${p.id})" aria-label="View ${escapeHtml(p.name)} details"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openPlayer(${p.id})}"
         class="player-card group relative cursor-pointer bg-panthers-black/70 border border-panthers-cardBorder rounded-lg overflow-hidden hover:border-panthers-blue hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(0,133,202,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-panthers-blue transition-all flex flex-col justify-between">
      <span class="absolute top-2 right-2 text-[10px] text-panthers-blue opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">⤢</span>
      <div class="flex items-center gap-3 p-3">
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-panthers-blue shrink-0 bg-[#0d131d]">
          <img src="${headshotUrl(p.id)}" alt="${escapeHtml(p.name)}" data-num="${escapeHtml(p.num ?? '')}"
               width="64" height="64" loading="lazy" decoding="async" referrerpolicy="no-referrer"
               class="w-full h-full object-cover object-top" onerror="headshotFailed(this)">
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[9px] font-heading font-bold text-panthers-blue uppercase tracking-wider bg-panthers-blue/20 px-1.5 py-0.5 rounded border border-panthers-blue/30 leading-none">${escapeHtml(p.pos)}</span>
            <span class="text-[10px] text-panthers-silver font-mono leading-none">${p.num ? '#' + escapeHtml(p.num) : 'No #'}</span>
            ${badgeHtml}
          </div>
          <h3 class="font-heading font-bold text-white text-base mt-1 truncate" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
          <p class="text-[10px] text-panthers-silver leading-tight truncate">${escapeHtml(p.college ?? '')}</p>
          <p class="text-[10px] text-slate-500 leading-tight">${escapeHtml(bio)}</p>
        </div>
      </div>
      ${statBarHtml(seasonStatCells(p))}
    </div>`;
}

// ---- Enlarged player view (modal) ------------------------------------------------------------------------

const playerModal = { list: [], index: -1, lastFocus: null };

const pct = (a, b) => (b ? (a / b * 100).toFixed(1) + '%' : '—');
const avg = (a, b) => (b ? (a / b).toFixed(1) : '—');

// Full stat tables for a player: [{ title, cells: [[label, value], ...] }]
function fullStatGroups(p) {
  const s = p.stats;
  if (!s) return [];
  const groups = [];
  if (s.passing) {
    const q = s.passing;
    groups.push({ title: 'Passing', cells: [['CMP / ATT', `${fmt(q.comp)}/${fmt(q.att)}`], ['COMP %', pct(q.comp, q.att)], ['YARDS', fmt(q.yds)], ['TD', fmt(q.td)], ['INT', fmt(q.int)], ['RATING', q.rating ?? '—'], ['SACKED', fmt(q.sacks)]] });
  }
  if (s.rushing) {
    const r = s.rushing;
    groups.push({ title: 'Rushing', cells: [['CARRIES', fmt(r.att)], ['YARDS', fmt(r.yds)], ['AVG', avg(r.yds, r.att)], ['TD', fmt(r.td)]] });
  }
  if (s.receiving) {
    const r = s.receiving;
    groups.push({ title: 'Receiving', cells: [['REC', fmt(r.rec)], ['TARGETS', fmt(r.tgt)], ['YARDS', fmt(r.yds)], ['AVG', avg(r.yds, r.rec)], ['TD', fmt(r.td)]] });
  }
  if (s.defense) {
    const d = s.defense;
    groups.push({ title: 'Defense', cells: [['TACKLES', fmt(d.tackles)], ['SOLO', fmt(d.solo)], ['SACKS', fmt(d.sacks)], ['INT', fmt(d.ints ?? 0)], ['PASS DEF', fmt(d.passesDefensed ?? 0)], ['FF', fmt(d.forcedFumbles ?? 0)], ['FUM REC', fmt(d.fumbleRecoveries ?? 0)]] });
  }
  if (s.kicking) {
    const k = s.kicking;
    groups.push({ title: 'Kicking', cells: [['FG', `${fmt(k.fgm)}/${fmt(k.fga)}`], ['FG %', pct(k.fgm, k.fga)], ['LONG', fmt(k.long)], ['XP MADE', fmt(k.xpm)], ['POINTS', fmt(k.points)]] });
  }
  if (s.punting) {
    const u = s.punting;
    groups.push({ title: 'Punting', cells: [['PUNTS', fmt(u.punts)], ['AVG', fmt(u.avg)], ['NET', fmt(u.net)], ['INSIDE 20', fmt(u.in20)], ['LONG', fmt(u.long)]] });
  }
  return groups;
}

function playerModalHtml(p) {
  const badge = STATUS_BADGES[p.status];
  const statusText = badge ? badge.title : 'Active roster';
  const bio = [['Height', p.ht], ['Weight', p.wt ? `${p.wt} lb` : null], ['Age', p.age], ['Experience', formatExp(p.exp)], ['College', p.college]]
    .filter(([, v]) => v != null && v !== '');
  const groups = fullStatGroups(p);
  const games = p.stats && p.stats.gp != null ? `${p.stats.gp} game${p.stats.gp === 1 ? '' : 's'} played` : '';
  const n = playerModal.list.length;

  return `
    <div class="grid grid-cols-1 md:grid-cols-[260px_1fr]">
      <div class="relative bg-gradient-to-b from-[#0a3a5c] via-[#0b1d2e] to-[#07090e] overflow-hidden flex items-end justify-center min-h-[220px] md:min-h-[360px]">
        <span class="absolute -top-4 -left-2 font-heading font-bold text-[150px] leading-none text-white/[0.06] select-none" aria-hidden="true">${escapeHtml(p.num ?? '')}</span>
        <div class="relative w-48 h-48 md:w-56 md:h-56">
          <img src="${headshotUrl(p.id)}" alt="${escapeHtml(p.name)}" data-num="${escapeHtml(p.num ?? '')}" referrerpolicy="no-referrer"
               class="w-full h-full object-contain object-bottom drop-shadow-[0_10px_25px_rgba(0,133,202,0.45)]" onerror="modalHeadshotFailed(this)">
        </div>
      </div>
      <div class="p-5 md:p-6 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-[10px] font-heading font-bold text-panthers-blue uppercase tracking-wider bg-panthers-blue/20 px-2 py-0.5 rounded border border-panthers-blue/40">${escapeHtml(p.pos)}</span>
          <span class="text-xs text-panthers-silver font-mono">${p.num ? '#' + escapeHtml(p.num) : 'No number'}</span>
          <span class="text-[10px] uppercase tracking-wider ${badge ? 'text-rose-300' : 'text-emerald-400'} font-bold">● ${escapeHtml(statusText)}</span>
        </div>
        <h2 id="player-modal-title" class="font-heading font-bold text-white text-4xl uppercase tracking-wider mt-1 leading-none">${escapeHtml(p.name)}</h2>
        <dl class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          ${bio.map(([k, v]) => `<div class="bg-panthers-black/60 border border-panthers-cardBorder rounded-lg px-3 py-2"><dt class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold">${k}</dt><dd class="text-white text-sm font-semibold truncate">${escapeHtml(String(v))}</dd></div>`).join('')}
        </dl>
        <div class="mt-5">
          <div class="flex items-baseline justify-between">
            <h3 class="font-heading font-bold text-white uppercase tracking-wider text-sm">2026 season</h3>
            <span class="text-[10px] text-slate-500">${escapeHtml(games)}${games ? ' · ' : ''}thru ${escapeHtml(ROSTER_STATS_THROUGH)}</span>
          </div>
          ${groups.length ? groups.map(g => `
            <div class="mt-2">
              <span class="text-[9px] uppercase tracking-widest text-panthers-blue font-bold">${g.title}</span>
              <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 mt-1">
                ${g.cells.map(([k, v]) => `<div class="bg-panthers-black/60 border border-panthers-cardBorder rounded-md px-2 py-1.5 text-center"><span class="block text-[8px] uppercase tracking-wider text-panthers-silver font-bold">${k}</span><span class="block text-white font-heading font-bold text-base leading-tight">${escapeHtml(String(v))}</span></div>`).join('')}
              </div>
            </div>`).join('') : `<p class="text-xs text-panthers-silver mt-2">No 2026 stats on record${p.status === 'Practice Squad' ? ' (practice squad).' : p.status === 'IR' || p.status === 'PUP' ? ' (on injured reserve).' : '.'}</p>`}
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 mt-5 pt-3 border-t border-panthers-cardBorder">
          <a href="https://www.espn.com/nfl/player/_/id/${p.id}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-panthers-blue font-bold hover:underline">Full profile on ESPN ↗</a>
          ${n > 1 ? `<span class="hidden sm:inline text-[10px] text-slate-500">${playerModal.index + 1} of ${n} · use ← → to browse</span>
          <span class="sm:hidden flex items-center gap-2 text-[10px] text-slate-500">
            <button onclick="stepPlayer(-1)" class="px-2.5 py-1 rounded border border-panthers-cardBorder text-white" aria-label="Previous player">‹ Prev</button>
            ${playerModal.index + 1} / ${n}
            <button onclick="stepPlayer(1)" class="px-2.5 py-1 rounded border border-panthers-cardBorder text-white" aria-label="Next player">Next ›</button>
          </span>` : ''}
        </div>
      </div>
    </div>`;
}

// Big silhouette + number if the large photo can't load
function modalHeadshotFailed(img) {
  img.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-end pb-6">
    <svg class="w-32 h-32 text-panthers-blue/70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    ${img.dataset.num ? `<span class="font-heading font-bold text-white text-2xl">#${escapeHtml(img.dataset.num)}</span>` : ''}</div>`;
}

function openPlayer(id) {
  const p = panthersRoster.find(x => x.id === id);
  if (!p) return;
  const visible = panthersRoster.filter(STATUS_FILTERS[activeRosterStatus]).filter(x => x.side === p.side);
  playerModal.list = visible.some(x => x.id === id) ? visible.map(x => x.id) : [id];
  playerModal.index = playerModal.list.indexOf(id);
  if (document.activeElement && !document.getElementById('player-modal').contains(document.activeElement)) {
    playerModal.lastFocus = document.activeElement;
  }
  renderPlayerModal();
  const modal = document.getElementById('player-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  const close = document.getElementById('player-modal-close');
  if (close && close.focus) close.focus();
}

function renderPlayerModal() {
  const p = panthersRoster.find(x => x.id === playerModal.list[playerModal.index]);
  document.getElementById('player-modal-body').innerHTML = playerModalHtml(p);
  const many = playerModal.list.length > 1;
  document.getElementById('player-prev').classList.toggle('hidden', !many);
  document.getElementById('player-next').classList.toggle('hidden', !many);
}

function stepPlayer(delta) {
  const n = playerModal.list.length;
  if (n < 2 || playerModal.index < 0) return;
  playerModal.index = (playerModal.index + delta + n) % n;
  renderPlayerModal();
}

function closePlayer() {
  const modal = document.getElementById('player-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  playerModal.index = -1;
  if (playerModal.lastFocus && playerModal.lastFocus.focus) playerModal.lastFocus.focus();
}

function playerModalKeys(e) {
  if (playerModal.index < 0) return;
  if (e.key === 'Escape') closePlayer();
  else if (e.key === 'ArrowRight') stepPlayer(1);
  else if (e.key === 'ArrowLeft') stepPlayer(-1);
}
if (typeof document.addEventListener === 'function') {
  document.addEventListener('keydown', playerModalKeys);
  // swipe left/right on phones to browse players
  let touchX = null;
  document.addEventListener('touchstart', e => { if (playerModal.index >= 0) touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (touchX == null || playerModal.index < 0) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 60) stepPlayer(dx < 0 ? 1 : -1);
  }, { passive: true });
}

// Where the Panthers stand in the NFC South, from the baseline records in data/playoff.js
function nfcSouthRankText() {
  const sorted = initialNfcSouth.slice().sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  const car = sorted.find(t => t.key === 'CAR');
  const rank = 1 + sorted.filter(t => t.wins > car.wins || (t.wins === car.wins && t.losses < car.losses)).length;
  return ordinal(rank);
}

function staffCardHtml(c, index) {
  const initials = c.name.split(' ').map(w => w[0]).join('');
  const isHead = index === 0;
  const stats = isHead
    ? statBarHtml([['RECORD', formatRecord(getRecord())], ['NFC SOUTH', nfcSouthRankText()], ['PTS / GAME', panthersTeamStats.ppg.toFixed(1)]])
    : '';
  return `
    <div class="bg-panthers-black/70 border border-panthers-cardBorder rounded-lg overflow-hidden hover:border-panthers-blue transition-colors flex flex-col justify-between">
      <div class="flex items-center gap-3 p-3">
        <div class="w-16 h-16 rounded-full border-2 border-panthers-blue shrink-0 flex items-center justify-center bg-gradient-to-br from-[#1a2536] to-[#0d131d] font-heading font-bold text-panthers-blue text-lg">${escapeHtml(initials)}</div>
        <div class="min-w-0 flex-1">
          <span class="text-[9px] font-heading font-bold text-panthers-blue uppercase tracking-wider bg-panthers-blue/20 px-1.5 py-0.5 rounded border border-panthers-blue/30 leading-none">COACH</span>
          <h3 class="font-heading font-bold text-white text-base mt-1 truncate">${escapeHtml(c.name)}</h3>
          <p class="text-[10px] text-panthers-silver leading-tight">${escapeHtml(c.title)}</p>
        </div>
      </div>
      ${stats}
    </div>`;
}

// ---- Rendering and controls ----------------------------------------------------------------------------

function renderRosterCards() {
  const visible = panthersRoster.filter(STATUS_FILTERS[activeRosterStatus]);
  const empty = '<p class="text-xs text-panthers-silver col-span-full">No players in this group for the selected filter.</p>';

  ['offense', 'defense', 'special'].forEach(side => {
    const list = visible.filter(p => p.side === side);
    document.getElementById(`count-${side}`).textContent = list.length;
    document.getElementById(`${side}-group`).innerHTML = list.length ? list.map(playerCardHtml).join('') : empty;
  });

  document.getElementById('count-staff').textContent = panthersStaff.length;
  document.getElementById('staff-group').innerHTML = panthersStaff.map(staffCardHtml).join('');

  const total = status => panthersRoster.filter(STATUS_FILTERS[status]).length;
  document.getElementById('roster-summary').textContent =
    `${total('active')} active · ${total('injured')} on IR/PUP · ${total('squad')} on the practice squad · roster as of ${ROSTER_AS_OF} · tap a player for the full card`;
}

function setRosterStatus(value) {
  activeRosterStatus = STATUS_FILTERS[value] ? value : 'all';
  renderRosterCards();
}

// Depth Chart Switcher: show one group of cards and highlight its button
function showGroup(groupId, btn) {
  ROSTER_GROUPS.forEach(g => {
    const el = document.getElementById(g + '-group');
    el.classList.add('hidden');
    el.classList.remove('grid');
  });

  const target = document.getElementById(groupId + '-group');
  target.classList.remove('hidden');
  target.classList.add('grid');

  btn.parentElement.querySelectorAll('.depth-btn').forEach(b => {
    b.classList.remove('bg-panthers-blue', 'text-white', 'border-panthers-blue');
    b.classList.add('bg-panthers-black/80', 'text-panthers-silver', 'border-panthers-cardBorder');
  });
  btn.classList.add('bg-panthers-blue', 'text-white', 'border-panthers-blue');
  btn.classList.remove('bg-panthers-black/80', 'text-panthers-silver', 'border-panthers-cardBorder');
}
