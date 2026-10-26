// Header and Home tab: team record, next-game banner and countdown, Charlotte weather, ESPN news.

// ---- Record and next game (both come from data/schedule.js) ---------------------------------------------

function renderTeamRecord() {
  const record = getRecord();
  document.getElementById('team-record').textContent = formatRecord(record, true);
  document.getElementById('schedule-record').textContent = formatRecord(record).replace('-', '–');
}

// "W 25-14" -> { result: 'W', pf: 25, pa: 14 }
function parseResult(status) {
  const m = /^([WLT]) (\d+)-(\d+)/.exec(status || '');
  return m ? { result: m[1], pf: +m[2], pa: +m[3] } : null;
}

function playedGames() { return panthers2026Schedule.filter(g => parseResult(g.status)); }

// "26-25" -> plain-language series line
function seriesText(series) {
  const [w, l, t = 0] = String(series).split('-').map(Number);
  if (!Number.isFinite(w) || !Number.isFinite(l)) return '';
  const tie = t ? `-${t}` : '';
  if (w > l) return `Panthers lead ${w}-${l}${tie}`;
  if (w < l) return `Panthers trail ${w}-${l}${tie}`;
  return `Series tied ${w}-${l}${tie}`;
}

function shortDate(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function teamNickname(fullName) { return fullName.split(' ').slice(-1)[0]; }

function renderNextGame() {
  const g = getNextGame();
  const label = document.getElementById('next-game-label');
  const title = document.getElementById('next-game-title');
  const details = document.getElementById('next-game-details');
  const chips = document.getElementById('next-game-chips');
  const actions = document.getElementById('next-game-actions');

  if (!g) {
    label.textContent = 'SEASON COMPLETE';
    title.textContent = 'THANKS FOR A GREAT SEASON, KEEP POUNDING!';
    details.textContent = '';
    chips.innerHTML = '';
    actions.innerHTML = '';
    return;
  }

  const day = new Date(g.kickoff).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/New_York' });
  const place = g.home ? 'Bank of America Stadium, Charlotte NC' : 'Away game';
  const time = g.tentative ? `${g.time} (tentative)` : g.time;
  const tv = g.tv && g.tv !== 'TBD' ? ` (${g.tv})` : '';

  label.textContent = `UP NEXT • WEEK ${g.week}`;
  title.textContent = `CAROLINA PANTHERS ${g.home ? 'VS.' : 'AT'} ${g.team.toUpperCase()}`;
  details.textContent = `📍 ${place} • ${day} • ${time}${tv}`;

  const o = OPPONENTS[g.abbr];
  const chip = (icon, text, tone = 'text-panthers-silver') =>
    `<span class="inline-flex items-center gap-1 bg-panthers-black/70 border border-panthers-cardBorder rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone}">${icon} ${escapeHtml(text)}</span>`;
  const parts = [];
  if (g.tv && g.tv !== 'TBD') parts.push(chip('📺', g.tv, 'text-white'));
  if (o) {
    parts.push(chip('📊', `${teamNickname(g.team)} ${o.record} in 2026`));
    parts.push(chip('🤝', `All-time: ${seriesText(o.series)}`));
    if (o.last) parts.push(chip('⏮', `Last meeting: ${o.last.result} (${shortDate(o.last.date)})`));
  }
  chips.innerHTML = parts.join('');

  const btn = 'text-[10px] font-heading font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors';
  actions.innerHTML = (g.home
    ? `<button onclick="openStadiumPlanner(${g.week})" class="${btn} bg-panthers-blue hover:bg-panthers-blueHover text-white shadow-md">⏱ Plan your game day</button>`
    : '') +
    `<button onclick="openTabByNav('schedule-tab')" class="${btn} bg-panthers-black border border-panthers-cardBorder hover:border-panthers-blue text-panthers-silver hover:text-white">📅 Full schedule</button>`;
}

// ---- Countdown to the next game's kickoff (switches to game-day / live states) -----------------------

const LIVE_WINDOW_MS = 4.5 * 3600000; // a game plus postgame

function etDateKey(ms) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}

// 'upcoming' | 'gameday' (kickoff later today) | 'live' (started, within the window) | 'final' (window passed)
function gamePhase(kickoffMs, now) {
  if (!kickoffMs) return 'upcoming';
  if (now < kickoffMs) return etDateKey(now) === etDateKey(kickoffMs) ? 'gameday' : 'upcoming';
  return now - kickoffMs < LIVE_WINDOW_MS ? 'live' : 'final';
}

function startCountdown() {
  const next = getNextGame();
  const target = next ? new Date(next.kickoff).getTime() : 0;
  const pad = n => String(n).padStart(2, '0');
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  let lastPhase = null;

  function showPhase(phase) {
    const clock = document.getElementById('countdown-clock');
    const status = document.getElementById('game-status');
    const badge = document.getElementById('gameday-badge');
    badge.classList.toggle('hidden', phase !== 'gameday');
    clock.classList.toggle('hidden', phase === 'live' || phase === 'final');
    status.classList.toggle('hidden', !(phase === 'live' || phase === 'final'));
    const espn = '<a href="https://www.espn.com/nfl/team/schedule/_/name/car" target="_blank" rel="noopener noreferrer" class="text-panthers-blue font-bold hover:underline">ESPN ↗</a>';
    if (phase === 'live') status.innerHTML = `<span class="text-amber-400 font-heading font-bold text-lg tracking-wider animate-pulse">● GAME ON</span><span class="block text-[11px] text-panthers-silver">Follow it live on ${espn}</span>`;
    if (phase === 'final') status.innerHTML = `<span class="text-white font-heading font-bold text-base tracking-wider">FINAL SCORE COMING SOON</span><span class="block text-[11px] text-panthers-silver">See the result on ${espn}</span>`;
  }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, target - now);
    setText('cd-days', pad(Math.floor(diff / 86400000)));
    setText('cd-hours', pad(Math.floor((diff % 86400000) / 3600000)));
    setText('cd-mins', pad(Math.floor((diff % 3600000) / 60000)));
    setText('cd-secs', pad(Math.floor((diff % 60000) / 1000)));
    const phase = next ? gamePhase(target, now) : 'upcoming';
    if (phase !== lastPhase) { showPhase(phase); lastPhase = phase; }
  }

  tick(); // render immediately instead of showing 00:00:00:00 for the first second
  setInterval(tick, 1000);
}

// ---- Last game recap --------------------------------------------------------------------------------------

function leaderHtml(role, leader) {
  if (!leader) return '';
  const p = panthersRoster.find(x => x.name === leader.name);
  const photo = p
    ? `<img src="${headshotUrl(p.id)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-num="${escapeHtml(p.num)}" onerror="headshotFailed(this)" class="w-full h-full object-cover object-top">`
    : fallbackAvatarHtml('');
  return `
    <div class="flex items-center gap-2.5 bg-panthers-black/60 border border-panthers-cardBorder rounded-lg p-2">
      <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-panthers-blue shrink-0 bg-[#0d131d]">${photo}</div>
      <div class="min-w-0">
        <span class="text-[9px] uppercase tracking-widest text-panthers-blue font-bold">${role}</span>
        <p class="text-white text-xs font-bold leading-tight truncate">${escapeHtml(leader.name)}</p>
        <p class="text-[10px] text-panthers-silver leading-tight">${escapeHtml(leader.line)}</p>
      </div>
    </div>`;
}

function renderLastGame() {
  const box = document.getElementById('last-game');
  const games = playedGames();
  const g = games[games.length - 1];
  if (!g) { box.innerHTML = '<p class="text-panthers-silver text-xs">The season hasn’t kicked off yet.</p>'; return; }
  const r = parseResult(g.status);
  const L = GAME_LEADERS[g.week];
  const tone = r.result === 'W' ? 'bg-emerald-500 text-black' : r.result === 'L' ? 'bg-red-500 text-white' : 'bg-slate-400 text-black';
  const date = new Date(g.kickoff).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' });

  box.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="flex items-center gap-4 shrink-0">
        <span class="${tone} font-heading font-extrabold text-2xl w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">${r.result}</span>
        <div>
          <p class="font-heading font-bold text-white text-3xl leading-none tracking-wide">${r.pf} <span class="text-panthers-silver text-xl">–</span> ${r.pa}</p>
          <p class="text-xs text-panthers-silver mt-1">Week ${g.week} · ${escapeHtml(g.opp.replace(/^@ /, 'at '))}<br>${escapeHtml(date)}</p>
        </div>
      </div>
      ${L && L.recap ? `<p class="text-xs text-panthers-silver sm:border-l sm:border-panthers-cardBorder sm:pl-4 leading-relaxed">${escapeHtml(L.recap)}</p>` : ''}
    </div>
    ${L ? `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
      ${leaderHtml('Passing', L.passer)}${leaderHtml('Rushing', L.rusher)}${leaderHtml('Receiving', L.receiver)}
    </div>
    ${L.defense ? `<p class="text-[11px] text-panthers-silver mt-2"><span class="text-panthers-blue font-bold uppercase tracking-wider text-[9px]">Defense</span> ${escapeHtml(L.defense)}</p>` : ''}`
    : '<p class="text-[11px] text-panthers-silver mt-3">Game leaders will be added soon.</p>'}`;
}

// ---- Season at a glance ---------------------------------------------------------------------------------

function seasonSummary() {
  const games = playedGames().map(g => ({ g, r: parseResult(g.status) }));
  const pf = games.reduce((s, x) => s + x.r.pf, 0);
  const pa = games.reduce((s, x) => s + x.r.pa, 0);
  let streak = '';
  if (games.length) {
    const last = games[games.length - 1].r.result;
    let n = 0;
    for (let i = games.length - 1; i >= 0 && games[i].r.result === last; i--) n++;
    streak = `${last}${n}`;
  }
  const pct = t => (t.wins + 0.5 * (t.ties || 0)) / Math.max(1, t.wins + t.losses + (t.ties || 0));
  const table = initialNfcSouth.slice().sort((a, b) => pct(b) - pct(a));
  const car = table.find(t => t.key === 'CAR');
  const ahead = table.filter(t => pct(t) > pct(car)).length;
  const tied = table.filter(t => t !== car && pct(t) === pct(car)).length;
  const place = `${tied ? 'T-' : ''}${ordinal(ahead + 1)}`;
  return { played: games.length, pf, pa, ppg: games.length ? pf / games.length : 0, oppg: games.length ? pa / games.length : 0, diff: pf - pa, streak, place };
}

function renderSeasonGlance() {
  const s = seasonSummary();
  const rec = formatRecord(getRecord());
  const stat = (value, label, tone = 'text-white') => `
    <div class="bg-panthers-black/60 border border-panthers-cardBorder rounded-lg p-2 text-center">
      <div class="font-heading font-bold text-lg leading-none ${tone}">${escapeHtml(String(value))}</div>
      <div class="text-[9px] text-panthers-silver uppercase tracking-wider mt-1">${label}</div>
    </div>`;
  const dots = panthers2026Schedule.map(g => {
    const r = parseResult(g.status);
    const cls = g.status === 'BYE' ? 'bg-panthers-cardBorder text-slate-500'
      : !r ? 'border border-panthers-cardBorder text-slate-500'
      : r.result === 'W' ? 'bg-emerald-500 text-black' : r.result === 'L' ? 'bg-red-500 text-white' : 'bg-slate-400 text-black';
    const label = g.status === 'BYE' ? 'B' : r ? r.result : g.week;
    const tip = g.status === 'BYE' ? `Week ${g.week}: bye` : `Week ${g.week}: ${g.opp}${r ? ' · ' + g.status : ''}`;
    return `<span title="${escapeHtml(tip)}" class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${cls}">${label}</span>`;
  }).join('');

  document.getElementById('season-glance').innerHTML = `
    <div class="flex items-end justify-between mb-3">
      <div>
        <span class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold">2026 record</span>
        <div class="font-heading font-extrabold text-4xl text-white leading-none">${rec}</div>
      </div>
      <div class="text-right">
        <span class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold">NFC South</span>
        <div class="font-heading font-bold text-2xl text-panthers-blue leading-none">${s.place}</div>
      </div>
    </div>
    <div class="grid grid-cols-4 gap-1.5">
      ${stat(s.ppg.toFixed(1), 'Pts / game')}
      ${stat(s.oppg.toFixed(1), 'Allowed')}
      ${stat((s.diff > 0 ? '+' : '') + s.diff, 'Point diff', s.diff >= 0 ? 'text-emerald-400' : 'text-red-400')}
      ${stat(s.streak || '—', 'Streak', /^W/.test(s.streak) ? 'text-emerald-400' : 'text-red-400')}
    </div>
    <div class="mt-3">
      <span class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold">Week by week</span>
      <div class="flex flex-wrap gap-1 mt-1">${dots}</div>
    </div>
    <p class="text-[9px] text-slate-500 mt-2">Division standings as of Week ${NFC_SOUTH_AS_OF_WEEK}.</p>`;
}

// ---- This day in Panthers history -------------------------------------------------------------------------

const homeUI = { dayOffset: 0 };

function historyDay(offset) {
  const [y, m, d] = etDateKey(Date.now()).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offset, 12));
  const key = dt.toISOString().slice(5, 10);
  return { year: y, key, dt, label: dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }) };
}

// Events for an MM-DD key; if none, the next date on the calendar that has some
function historyFor(key) {
  const exact = PANTHERS_HISTORY.filter(e => e.date.slice(5) === key);
  if (exact.length) return { exact: true, events: exact };
  const after = PANTHERS_HISTORY.find(e => e.date.slice(5) > key) || PANTHERS_HISTORY[0];
  return { exact: false, events: PANTHERS_HISTORY.filter(e => e.date.slice(5) === after.date.slice(5)) };
}

function renderThisDay() {
  const day = historyDay(homeUI.dayOffset);
  const { exact, events } = historyFor(day.key);
  const header = document.getElementById('history-date');
  header.textContent = homeUI.dayOffset === 0 ? `Today · ${day.label}` : day.label;
  const nextLabel = exact ? '' : new Date('2000-' + events[0].date.slice(5) + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

  document.getElementById('history-events').innerHTML =
    (exact ? '' : `<p class="text-[11px] text-panthers-silver mb-2">Nothing on record for this date. Next up on the calendar: <span class="text-white font-bold">${escapeHtml(nextLabel)}</span></p>`) +
    events.map(e => {
      const y = +e.date.slice(0, 4);
      const ago = day.year - y;
      return `
      <div class="bg-panthers-black/60 border border-panthers-cardBorder border-l-4 border-l-amber-400 rounded-lg p-2.5">
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-heading font-bold text-amber-400 text-lg leading-none">${y}</span>
          <span class="text-[9px] uppercase tracking-wider text-panthers-silver">${ago > 0 ? ago + (ago === 1 ? ' year ago' : ' years ago') : 'this year'}</span>
        </div>
        <p class="text-white text-xs font-bold mt-1">${escapeHtml(e.title)}</p>
        <p class="text-[11px] text-panthers-silver">${escapeHtml(e.text)}${e.uncertain ? ' <span class="text-slate-500">(date varies by source)</span>' : ''}</p>
      </div>`;
    }).join('');
  document.getElementById('history-today-btn').classList.toggle('invisible', homeUI.dayOffset === 0);
}

function shiftHistoryDay(delta) { homeUI.dayOffset = delta === 0 ? 0 : homeUI.dayOffset + delta; renderThisDay(); }

// ---- Franchise sections (milestones, snapshot, Hall of Honor) -------------------------------------------

function renderFranchise() {
  document.getElementById('milestones').innerHTML = MILESTONES.map(m => `
    <li class="relative pl-6">
      <span class="absolute left-0 top-1 w-3 h-3 rounded-full bg-panthers-blue ring-4 ring-panthers-blue/20"></span>
      <span class="font-heading font-bold text-panthers-blue text-sm">${escapeHtml(m.year)}</span>
      <h3 class="font-heading font-bold text-white text-base leading-tight">${escapeHtml(m.title)}</h3>
      <p class="text-panthers-silver text-xs mt-0.5">${escapeHtml(m.text)}</p>
    </li>`).join('');

  const F = FRANCHISE;
  const tile = (value, label) => `
    <div class="bg-panthers-black/60 border border-panthers-cardBorder p-2.5 rounded-lg text-center">
      <div class="${String(value).length > 6 ? 'text-sm sm:text-base' : 'text-xl'} font-heading font-bold text-panthers-blue leading-none">${escapeHtml(String(value))}</div>
      <span class="text-[9px] text-panthers-silver uppercase tracking-wider block mt-1">${label}</span>
    </div>`;
  document.getElementById('franchise-snapshot').innerHTML = `
    <div class="grid grid-cols-3 gap-2">
      ${tile(F.firstSeason, 'First season')}${tile(F.nfcTitles, 'NFC titles')}${tile(F.divisionTitles, 'Division titles')}
      ${tile(F.playoffTrips, 'Playoff trips')}${tile(F.regularSeason, 'All-time record')}${tile('#51', 'Retired: Sam Mills')}
    </div>
    <span class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold block mt-3 mb-1">Franchise leaders</span>
    <ul class="divide-y divide-panthers-cardBorder">
      ${F.careerLeaders.map(l => `<li class="flex justify-between py-1 text-[11px]"><span class="text-panthers-silver">${escapeHtml(l.stat)}</span><span class="text-white font-semibold">${escapeHtml(l.player)} <span class="text-panthers-blue">${l.value.toLocaleString('en-US')}</span></span></li>`).join('')}
    </ul>
    <p class="text-[9px] text-slate-500 mt-2">Awarded in ${F.awarded}. Totals through the 2025 season.</p>`;

  document.getElementById('hall-of-honor').innerHTML = HALL_OF_HONOR.map(m => `
    <li class="bg-panthers-black/50 border border-panthers-cardBorder hover:border-panthers-blue transition-colors p-3 rounded-lg flex flex-col">
      <div class="flex justify-between items-center gap-2">
        <h3 class="font-heading font-bold text-white text-sm">${escapeHtml(m.name)}</h3>
        <span class="shrink-0 bg-panthers-blue/20 text-panthers-blue border border-panthers-blue font-heading text-[10px] font-bold px-1.5 py-0.5 rounded">${escapeHtml(m.tag)}</span>
      </div>
      <p class="text-[11px] text-panthers-silver mt-1 flex-1">${escapeHtml(m.blurb)}</p>
      <span class="text-[9px] uppercase tracking-widest text-slate-500 mt-2">Inducted ${m.year}</span>
    </li>`).join('');
}

// The big headline in the welcome card: built from the real record and standings, so it never overhypes
function hypeLines() {
  const s = seasonSummary();
  const rec = formatRecord(getRecord());
  let headline, emoji = '';
  if (!s.played) headline = 'The season starts soon. Lock in.';
  else if (s.place === '1st' && /^L/.test(s.streak)) headline = `${rec} and still on top of the South`;
  else if (s.place === '1st') headline = `We’re ${rec} and running the South`;
  else if (s.place === 'T-1st') headline = `We’re ${rec} and tied for the South lead`;
  else headline = `${rec}, ${s.place} in the South. Plenty of football left.`;
  if (s.place === '1st' && s.played && !/^L/.test(s.streak)) emoji = '🔥';

  const g = getNextGame();
  let sub = '';
  if (g) {
    const kick = new Date(g.kickoff).getTime();
    const days = (kick - Date.now()) / 86400000;
    const when = new Date(kick).toLocaleDateString('en-US', days < 6 ? { weekday: 'long', timeZone: 'America/New_York' } : { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
    const them = teamNickname(g.team);
    sub = g.home
      ? `The ${them} come to the Bank ${days < 6 ? '' : 'on '}${when}. Don’t be late.`
      : `Road game at the ${them} ${days < 6 ? '' : 'on '}${when}${g.tv && g.tv !== 'TBD' ? `. Catch it on ${g.tv.split(' · ')[0]}` : ''}.`;
  }
  return { headline, emoji, sub };
}

function renderHype() {
  const { headline, emoji, sub } = hypeLines();
  // the emoji sits outside the gradient text so it keeps its own colors
  document.getElementById('hype-headline').innerHTML = `<span class="text-hype">${escapeHtml(headline)}</span>${emoji ? ' ' + emoji : ''}`;
  document.getElementById('hype-sub').textContent = sub;
}

function renderHome() {
  renderHype();
  renderLastGame();
  renderSeasonGlance();
  renderThisDay();
  renderFranchise();
}

// ---- Charlotte weather (Open-Meteo, no API key needed) --------------------------------------------------

// WMO weather codes -> emoji
const WEATHER_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️', 56: '🌧️', 57: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️', 80: '🌦️', 81: '🌦️', 82: '⛈️', 85: '❄️', 86: '❄️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

async function fetchCharlotteWeather() {
  const box = document.getElementById('charlotte-weather');
  const heading = `<span class="text-panthers-silver uppercase font-semibold text-[9px] tracking-widest">Charlotte Weather</span>`;
  try {
    const lat = 35.2258;
    const lon = -80.8528;
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`);
    const data = await response.json();
    if (!data || !data.current_weather) throw new Error('no weather data');

    const w = data.current_weather;
    const icon = WEATHER_ICONS[w.weathercode] || '🌡️';
    box.innerHTML = `${heading}
      <span class="text-amber-400 font-bold font-heading text-xs leading-none">${icon} ${Math.round(w.temperature)}°F • Wind ${Math.round(w.windspeed)}mph</span>`;
  } catch (err) {
    // Show that it's unavailable rather than inventing a temperature
    box.innerHTML = `${heading}
      <span class="text-panthers-silver font-bold font-heading text-xs leading-none">Unavailable</span>`;
  }
}

// ---- Live Panthers headlines (ESPN) ---------------------------------------------------------------------

async function fetchPanthersNews() {
  const container = document.getElementById('espn-news-container');
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?team=29');
    const data = await response.json();
    const articles = ((data && data.articles) || []).filter(a => a.headline).slice(0, 4);
    if (!articles.length) throw new Error('no articles');

    container.innerHTML = articles.map(a => {
      const link = safeUrl(a.links && a.links.web && a.links.web.href);
      const date = a.published ? new Date(a.published) : null;
      const dateText = date && !isNaN(date) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
      return `
        <div class="bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg flex flex-col justify-between hover:border-panthers-blue transition-colors">
          <div>
            <h3 class="font-heading font-bold text-white text-sm mb-1">
              <a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:text-panthers-blue hover:underline transition-colors">${escapeHtml(a.headline)}</a>
            </h3>
            <p class="text-panthers-silver text-xs line-clamp-2">${escapeHtml(a.description || '')}</p>
          </div>
          <div class="mt-2 pt-1.5 border-t border-panthers-cardBorder/40 flex justify-between items-center text-[10px]">
            <span class="text-panthers-silver">ESPN${dateText ? ' • ' + escapeHtml(dateText) : ''}</span>
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-panthers-blue font-heading font-bold uppercase tracking-wider hover:underline">Read Story ↗</a>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    showNewsUnavailable(container);
  }
}

// No made-up headlines: just a link to the real source
function showNewsUnavailable(container) {
  container.innerHTML = `
    <div class="md:col-span-2 bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg">
      <p class="text-panthers-silver text-xs">Headlines aren’t loading right now.
        <a href="https://www.espn.com/nfl/team/_/name/car/carolina-panthers" target="_blank" rel="noopener noreferrer" class="text-panthers-blue font-heading font-bold hover:underline">See the latest Panthers news on ESPN ↗</a>
      </p>
    </div>`;
}
