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
    <div class="bg-panthers-black/70 border border-panthers-cardBorder rounded-lg overflow-hidden hover:border-panthers-blue transition-colors flex flex-col justify-between">
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
    `${total('active')} active · ${total('injured')} on IR/PUP · ${total('squad')} on the practice squad · roster as of ${ROSTER_AS_OF}`;
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
