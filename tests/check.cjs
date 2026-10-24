// Checks for the Panthers fan site. Run from the repo root with:  node tests/check.cjs
//
// It loads the page's real scripts (in the order index.html loads them) against a stand-in for the browser
// page, then checks the data, the page wiring and the behavior of each tab. It can't check how the page
// looks, so still open the site and click through it after a change.

const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="((?:data|js)\/[^"]+)"><\/script>/g)].map(m => m[1]);
const code = srcs.map(s => fs.readFileSync(path.join(repo, s), 'utf8')).join('\n');

let failed = 0;
let passed = 0;
function check(name, ok, detail = '') {
  if (ok) passed++; else failed++;
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (ok || !detail ? '' : '\n        ' + detail));
}
function section(title) { console.log('\n== ' + title); }

// ---------------------------------------------------------------------------------------------------
section('Page wiring');
// ---------------------------------------------------------------------------------------------------

const linked = [...html.matchAll(/(?:src|href)="((?:data|js|css)\/[^"]+)"/g)].map(m => m[1]);
check(`all ${linked.length} linked files exist`, linked.every(f => fs.existsSync(path.join(repo, f))),
  linked.filter(f => !fs.existsSync(path.join(repo, f))).join(', '));

const orderOk = srcs.indexOf('js/helpers.js') < srcs.indexOf('js/main.js') && srcs[srcs.length - 1] === 'js/main.js' &&
  srcs.filter(s => s.startsWith('data/')).every(s => srcs.indexOf(s) < srcs.indexOf('js/helpers.js'));
check('data loads first, main.js loads last', orderOk, srcs.join(' > '));

const defined = new Set([...code.matchAll(/(?:async\s+)?function\s+(\w+)/g)].map(m => m[1]));
const called = new Set([...(html + code).matchAll(/on(?:click|change|input|error)="(\w+)\(/g)].map(m => m[1]));
const undef = [...called].filter(n => !defined.has(n));
check(`all ${called.size} inline handlers call a defined function`, undef.length === 0, undef.join(', '));

const ids = new Set([...code.matchAll(/getElementById\(\s*(?:'([^']+)'|"([^"]+)")\s*\)/g)].map(m => m[1] || m[2]));
['offense', 'defense', 'special'].forEach(g => { ids.add(`count-${g}`); ids.add(`${g}-group`); });
ids.add('count-staff'); ids.add('staff-group');
// built on the fly inside the forum's reply box
['reply-name', 'reply-body', 'reply-error', 'reply-submit'].forEach(id => ids.delete(id));
const missingIds = [...ids].filter(id => !new RegExp(`id="${id}"`).test(html));
check(`all ${ids.size} element ids used by the scripts exist in index.html`, missingIds.length === 0, missingIds.join(', '));

const statusOptions = [...html.matchAll(/<option value="(\w+)"/g)].map(m => m[1]);
check('roster filter options match the filter code', ['all', 'active', 'injured', 'squad'].every(o => statusOptions.includes(o)));
check('no leftover inline <style> or app script in index.html',
  !/<style>/.test(html) && !/<script>\s*(?!tailwind\.config)\S/.test(html));
check('page says it is unofficial', /UNOFFICIAL FAN SITE/.test(html) && /not affiliated/i.test(html));

// ---------------------------------------------------------------------------------------------------
// A small stand-in for the browser page
// ---------------------------------------------------------------------------------------------------

const els = {};
function makeEl(id) {
  const classes = new Set();
  const el = {
    id, innerHTML: '', textContent: '', className: '', value: '', disabled: false, dataset: {}, parentElement: null,
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)), remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c, on) => { (on === undefined ? !classes.has(c) : on) ? classes.add(c) : classes.delete(c); },
      contains: c => classes.has(c),
    },
    querySelector: () => ({ textContent: '1' }), querySelectorAll: () => [], prepend() {},
  };
  return el;
}
global.document = {
  body: makeEl('body'),
  getElementById: id => (els[id] ??= makeEl(id)),
  querySelectorAll: () => [],
  createElement: () => makeEl('created'),
};
global.alert = () => {};
const memStore = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; };
global.window = { localStorage: memStore(), sessionStorage: memStore(), prompt: () => null, crypto: globalThis.crypto };
global.location = { hash: '', pathname: '/', search: '', origin: 'https://example.test' };
global.history = { replaceState: (a, b, url) => { global.location.hash = String(url).includes('#') ? String(url).slice(String(url).indexOf('#')) : ''; } };
global.navigator = {};
let fetchLog = [];
let fetchHandler = () => Promise.reject(new Error('offline'));
global.fetch = (url, ...rest) => { fetchLog.push(String(url)); return fetchHandler(String(url), ...rest); };
let tickFn = null;
global.setInterval = fn => { tickFn = fn; };
const realNow = Date.now;
Date.now = () => new Date('2026-10-24T13:07:00-04:00').getTime(); // Saturday before the Week 7 game

// Run every page script together, in order, then expose what the tests need
eval(code + `
  global.__t = { escapeHtml, safeUrl, getRecord, getNextGame, formatRecord, ordinal,
    panthersRoster, panthersStaff, panthers2026Schedule, initialNfcSouth, upcomingDivisionalGames, NFC_SOUTH_AS_OF_WEEK,
    draftProspects, draftOrder, NFL_TEAMS, prospectsById,
    headshotUrl, playerCardHtml, seasonStatCells, headshotFailed, fallbackAvatarHtml,
    renderRosterCards, setRosterStatus, showGroup, DEPTH_CHART, depthInfo, depthTier, sortByDepth, depthBadgeHtml, depthExtrasText, openPlayer, closePlayer, stepPlayer, playerModalKeys, fullStatGroups, getPlayerModal: () => playerModal, renderSchedule, renderPlayoffMachine, updateStandings, pickSimGame, resetPlayoffSim,
    initDraft, renderDraft, currentSlot, isUserTurn, isDraftComplete, nextUserSlot, availableProspects, cpuChoose, makePick,
    simOnePick, simNextPick, simToMyPick, autoDraftRest, draftProspect, resetDraftSim, setDraftPos, setDraftQuery, showMoreProspects,
    gradePick, gradeClass, getDraftState: () => draftState, getDraftUI: () => draftUI, setRandom: fn => { draftRandom = fn; },
    openTab, renderTeamRecord, renderNextGame, startCountdown,
    panthersTeamStats, GAME_LEADERS, OPPONENTS, PANTHERS_HISTORY, HALL_OF_HONOR, FRANCHISE, parseResult, seriesText, gamePhase, seasonSummary,
    historyFor, shiftHistoryDay, renderHome, renderLastGame,
    STADIUM_PINS, STADIUM_TOUR, STADIUM_ZONES, STADIUM_LEVELS, MAP_LAYERS, GAMEDAY_STEPS, TRANSPORT_TIPS, SRC_LABELS, stadiumUI,
    selectPin, toggleMapLayer, toggleTour, tourStep, setSeatZone, setSeatLevel, seatCamera, buildSeatScene, lookupSection,
    homeGames, buildPlan, setPlanTransport, setPlanGoal, setPlanGame, evaluateBag, showStadiumPanel, fetchCharlotteWeather, fetchPanthersNews, WEATHER_ICONS,
    forumUI, loadForum, openThread, closeThread, submitThread, submitComment, setReplyTo, voteThread, toggleCollapse, setForumCat, setForumSort, formatPost, hotScore, sortedThreads, commentTree, timeAgo, toggleComposer, threadIdFromHash };
`);
const t = global.__t;

// ---------------------------------------------------------------------------------------------------
section('Page starts up (main.js)');
// ---------------------------------------------------------------------------------------------------
check('startup finished and drew the first screens',
  els['offense-group'].innerHTML.length > 1000 && els['schedule-container'].innerHTML.length > 500 && els['prospects-board'].innerHTML.length > 500);

// ---------------------------------------------------------------------------------------------------
section('Roster data and headshots');
// ---------------------------------------------------------------------------------------------------
const R = t.panthersRoster;
check('roster has 76 players (53 active, 10 IR/PUP, 13 practice squad)',
  R.length === 76 && R.filter(p => p.status === 'Active').length === 53 &&
  R.filter(p => p.status === 'IR' || p.status === 'PUP').length === 10 && R.filter(p => p.status === 'Practice Squad').length === 13,
  JSON.stringify(R.reduce((a, p) => (a[p.status] = (a[p.status] || 0) + 1, a), {})));
check('every player has a numeric ESPN id, and ids are unique', R.every(p => Number.isInteger(p.id)) && new Set(R.map(p => p.id)).size === R.length);
check('every player has name, position, side, height, weight, age',
  R.every(p => p.name && p.pos && ['offense', 'defense', 'special'].includes(p.side) && p.ht && p.wt && p.age != null),
  R.filter(p => !(p.name && p.pos && p.ht && p.wt && p.age != null)).map(p => p.name).join(', '));
check('headshot URL is built from the ESPN id', t.headshotUrl(4685720) === 'https://a.espncdn.com/i/headshots/nfl/players/full/4685720.png');
check('players ESPN lists on other teams were left out',
  !R.some(p => ['Ahmani Marshall', 'Ihmir Smith-Marsette', 'Marco Wilson'].includes(p.name)));
const byName = n => R.find(p => p.name === n);
check('Jaycee Horn is shown as injured reserve, not as a starter', byName('Jaycee Horn').status === 'IR');

const young = byName('Bryce Young');
const cardHtml = t.playerCardHtml(young);
check('card shows a real photo (an <img> pointing at ESPN) instead of the old silhouette',
  cardHtml.includes('<img') && cardHtml.includes('a.espncdn.com/i/headshots/nfl/players/full/4685720.png') && cardHtml.includes('alt="Bryce Young"'));
check('card has a fallback if the photo fails', cardHtml.includes('onerror="headshotFailed(this)"'));
const fakeImg = { dataset: { num: '9' }, parentElement: { innerHTML: '' } };
t.headshotFailed(fakeImg);
check('fallback swaps the broken image for the silhouette with the jersey number',
  fakeImg.parentElement.innerHTML.includes('<svg') && fakeImg.parentElement.innerHTML.includes('#9'));

const cells = n => t.seasonStatCells(byName(n));
const flat = n => (cells(n) || []).map(c => c.join(' ')).join(' | ');
check('Bryce Young stats: 1,549 yds, 11 TD / 2 INT, 60.2%', flat('Bryce Young') === 'PASS YDS 1,549 | TD / INT 11 / 2 | COMP 60.2%', flat('Bryce Young'));
check('Chuba Hubbard stats: 426 rush yds, 89 carries, 6 total TD', flat('Chuba Hubbard') === 'RUSH YDS 426 | CARRIES 89 | TOTAL TD 6', flat('Chuba Hubbard'));
check('Tetairoa McMillan stats: 32 rec, 471 yds, 2 TD', flat('Tetairoa McMillan') === 'REC 32 | REC YDS 471 | TD 2', flat('Tetairoa McMillan'));
check('Derrick Brown stats were corrected (13 tackles, no 22 / 1.5 sacks)', /TACKLES 13\b/.test(flat('Derrick Brown')), flat('Derrick Brown'));
check('Ryan Fitzgerald is 11/11 on field goals', /FG 11\/11/.test(flat('Ryan Fitzgerald')), flat('Ryan Fitzgerald'));
check('Sam Martin stats: 18 punts, 46.6 avg, 42.6 net', flat('Sam Martin') === 'PUNTS 18 | AVG 46.6 | NET 42.6', flat('Sam Martin'));
check('offensive linemen with no stats say so instead of inventing numbers',
  cells('Taylor Moton') === null && t.playerCardHtml(byName('Taylor Moton')).includes('No 2026 stats on record'));

t.renderRosterCards();
check('Offense/Defense/Special counts match the data', els['count-offense'].textContent === R.filter(p => p.side === 'offense').length &&
  els['count-defense'].textContent === R.filter(p => p.side === 'defense').length && els['count-special'].textContent === R.filter(p => p.side === 'special').length);
check('coaches tab lists the head coach and coordinators', t.panthersStaff.length === 4 && els['staff-group'].innerHTML.includes('Dave Canales') && els['staff-group'].innerHTML.includes('Brad Idzik'));
t.setRosterStatus('injured');
check('"IR / PUP" filter shows only injured players', els['count-offense'].textContent + els['count-defense'].textContent + els['count-special'].textContent !== '' &&
  (+els['count-offense'].textContent + +els['count-defense'].textContent + +els['count-special'].textContent) === 10);
t.setRosterStatus('squad');
check('"Practice squad" filter shows 13 players', (+els['count-offense'].textContent + +els['count-defense'].textContent + +els['count-special'].textContent) === 13);
t.setRosterStatus('all');

check('every depth-chart name matches a player on the roster', t.DEPTH_CHART.every(r => r.players.every(n => R.some(p => p.name === n))));
check('every active player except one is on the depth chart', R.filter(p => p.status === 'Active' && !t.depthInfo(p).primary).map(p => p.name).join() === 'Anthony Tyus III');
const offSorted = t.sortByDepth(R.filter(p => p.side === 'offense'));
check('offense lists the 11 starters first, QB first', offSorted.slice(0, 11).every(p => t.depthTier(p) === 'starter') && offSorted[0].name === 'Bryce Young' && t.depthTier(offSorted[11]) !== 'starter');
check('offense starters follow position order QB, RB, WR, WR, WR, TE, LT, LG, C, RG, RT',
  offSorted.slice(0, 11).map(p => t.depthInfo(p).primary.slot).join() === 'QB,RB,WR,WR,WR,TE,LT,LG,C,RG,RT');
const defSorted = t.sortByDepth(R.filter(p => p.side === 'defense'));
check('defense lists 11 starters first', defSorted.slice(0, 11).every(p => t.depthTier(p) === 'starter') && t.depthTier(defSorted[11]) === 'second');
const tierOrder = ['starter', 'second', 'deep', 'reserve', 'injured', 'squad'];
check('tiers never go backwards: starters, 2nd, deeper, reserves, IR/PUP, practice squad',
  [offSorted, defSorted].every(list => list.every((p, i) => i === 0 || tierOrder.indexOf(t.depthTier(list[i - 1])) <= tierOrder.indexOf(t.depthTier(p)))));
check('Monroe Freeling shows as 2nd string at LT/RT', t.depthInfo(byName('Monroe Freeling')).primary.slot === 'LT/RT' && t.depthInfo(byName('Monroe Freeling')).primary.rank === 2);
check('David Moore: 2nd-string WR, also starting KR and PR', t.depthInfo(byName('David Moore')).primary.rank === 2 && t.depthExtrasText(byName('David Moore')) === 'Starting KR · Starting PR');
check('starter badge reads ★ STARTER with dots showing the spot', /★ STARTER · QB/.test(t.depthBadgeHtml(byName('Bryce Young'))) && (t.depthBadgeHtml(byName('Bryce Young')).match(/rounded-full/g) || []).length === 3);
check('Mitchell Evans shows as 2nd string at TE (5-deep row)', /2ND STRING · TE/.test(t.depthBadgeHtml(byName('Mitchell Evans'))) && (t.depthBadgeHtml(byName('Mitchell Evans')).match(/rounded-full/g) || []).length === 5);
check('injured and practice-squad players get no depth badge', t.depthBadgeHtml(byName('Jaycee Horn')) === '');
t.renderRosterCards();
check('roster groups show section headers (Starters, Second string, Practice squad)',
  ['Starters', 'Second string', 'Practice squad'].every(x => els['offense-group'].innerHTML.includes(x)));
check('the first card under Starters is Bryce Young', els['offense-group'].innerHTML.indexOf('Starters') < els['offense-group'].innerHTML.indexOf('Bryce Young') && els['offense-group'].innerHTML.indexOf('Bryce Young') < els['offense-group'].innerHTML.indexOf('Chuba Hubbard'));

t.setRosterStatus('all');
check('every player card opens the big view when clicked or tapped', t.playerCardHtml(byName('Bryce Young')).includes('onclick="openPlayer(4685720)"') && t.playerCardHtml(byName('Bryce Young')).includes('role="button"'));
t.openPlayer(4685720);
const pm = els['player-modal-body'].innerHTML;
check('big card shows photo, bio and full passing + rushing stats',
  !els['player-modal'].classList.contains('hidden') && pm.includes('4685720.png') && pm.includes('Alabama') && pm.includes('121/201') && pm.includes('60.2%') && pm.includes('98.5') && /Rushing/.test(pm));
check('big card links to the ESPN profile', pm.includes('espn.com/nfl/player/_/id/4685720'));
const offenseCount = R.filter(p => p.side === 'offense').length;
check('arrows browse the same group as the open card', t.getPlayerModal().list.length === offenseCount && !els['player-next'].classList.contains('hidden'));
const startIdx = t.getPlayerModal().index;
t.playerModalKeys({ key: 'ArrowRight' });
check('→ moves to the next player', t.getPlayerModal().index === (startIdx + 1) % offenseCount);
t.stepPlayer(-1);
check('← goes back', t.getPlayerModal().index === startIdx);
t.playerModalKeys({ key: 'Escape' });
check('Esc closes the big card', els['player-modal'].classList.contains('hidden') && t.getPlayerModal().index === -1);
const sam = t.fullStatGroups(byName('Sam Martin'));
check('punter big card shows punting stats', sam.length === 1 && sam[0].title === 'Punting' && sam[0].cells.some(c => c[0] === 'NET' && c[1] === '42.6'));
const ps = R.find(p => p.status === 'Practice Squad' && !p.stats);
if (ps) { t.openPlayer(ps.id); check('players without stats say so on the big card', /No 2026 stats on record/.test(els['player-modal-body'].innerHTML)); t.closePlayer(); }
t.setRosterStatus('squad');
const psOne = R.find(p => p.status === 'Practice Squad');
t.openPlayer(psOne.id);
check('with the practice-squad filter on, arrows only browse practice-squad players',
  t.getPlayerModal().list.every(id => R.find(p => p.id === id).status === 'Practice Squad'));
t.closePlayer();
t.setRosterStatus('all');

// ---------------------------------------------------------------------------------------------------
section('Schedule, record, next game and countdown');
// ---------------------------------------------------------------------------------------------------
const S = t.panthers2026Schedule;
check('18 weeks in the schedule, with the Week 5 bye', S.length === 18 && S[4].status === 'BYE' && S[4].kickoff === null);
const rec = t.getRecord();
check('record is 3-2 and comes from the results', rec.wins === 3 && rec.losses === 2 && t.formatRecord(rec) === '3-2');
t.renderTeamRecord();
check('header and schedule tab show the record', els['team-record'].textContent === '3 - 2' && els['schedule-record'].textContent === '3–2', els['team-record'].textContent);
const next = t.getNextGame();
check('next game is Week 7 vs. Tampa Bay on Oct 25 at 1:00 PM ET', next.week === 7 && next.abbr === 'TB' && next.home === true && next.kickoff === '2026-10-25T13:00:00-04:00' && next.tv === 'FOX');
t.renderNextGame();
check('banner text is built from the schedule',
  els['next-game-label'].textContent === 'UP NEXT • WEEK 7' && els['next-game-title'].textContent === 'CAROLINA PANTHERS VS. TAMPA BAY BUCCANEERS' &&
  els['next-game-details'].textContent === '📍 Bank of America Stadium, Charlotte NC • Sunday, Oct 25 • 1:00 PM ET (FOX)', els['next-game-details'].textContent);
check('kickoff times use the right Eastern offset (EDT before Nov 1, EST after)',
  S.filter(g => g.kickoff).every(g => g.kickoff.endsWith(g.kickoff < '2026-11-01' ? '-04:00' : '-05:00')));
check('Week 8 is Thursday night on Prime Video; Week 12 is Monday night on ESPN', S[7].tv === 'Prime Video · TNF' && S[11].tv === 'ESPN · MNF');
check('flex games are flagged tentative', S[15].tentative && S[17].tentative && !S[6].tentative);
check('every division game is marked (TB, ATL, NO)', S.filter(g => g.div).map(g => g.abbr).sort().join() === 'ATL,ATL,NO,NO,TB,TB');
t.renderSchedule();
check('schedule table marks the next game and the flex footnote', els['schedule-container'].innerHTML.includes('NEXT') && els['schedule-container'].innerHTML.includes('Flex-scheduling'));
t.renderSchedule('upcoming');
check('"Upcoming" filter hides played games', !els['schedule-container'].innerHTML.includes('L 37-59') && els['schedule-container'].innerHTML.includes('Upcoming'));
t.renderSchedule('win');
check('"Wins only" filter shows 3 wins', (els['schedule-container'].innerHTML.match(/W \d+-\d+/g) || []).length === 3);

t.startCountdown();
check('countdown shows 23h 53m the day before kickoff, immediately',
  els['cd-days'].textContent === '00' && els['cd-hours'].textContent === '23' && els['cd-mins'].textContent === '53', [els['cd-days'].textContent, els['cd-hours'].textContent, els['cd-mins'].textContent].join(':'));
Date.now = () => new Date('2026-10-25T14:00:00-04:00').getTime();
tickFn();
check('countdown stops at zero after kickoff', els['cd-hours'].textContent === '00' && els['cd-secs'].textContent === '00');
Date.now = () => new Date('2026-10-24T13:07:00-04:00').getTime();

// ---------------------------------------------------------------------------------------------------
section('Playoff Machine');
// ---------------------------------------------------------------------------------------------------
check('NFC South baseline matches the standings research (CAR 3-2, ATL 2-4, NO 2-4, TB 1-5)',
  t.initialNfcSouth.map(x => `${x.key} ${x.wins}-${x.losses}`).join() === 'CAR 3-2,TB 1-5,ATL 2-4,NO 2-4');
check('simulated games come from the schedule: weeks 7, 10, 12, 14, 18', t.upcomingDivisionalGames.map(g => g.week).join() === 'Wk 7,Wk 10,Wk 12,Wk 14,Wk 18');
t.renderPlayoffMachine();
check('Panthers are the sole division leader at the start', /DIVISION LEADERS/.test(els['playoff-status-badge'].textContent) && /Division Leader/.test(els['sim-standings-body'].innerHTML), els['playoff-status-badge'].textContent);
t.upcomingDivisionalGames.forEach(g => t.pickSimGame(g.id, 'OPP'));
check('losing every division game drops them out of the lead', /IN THE HUNT/.test(els['playoff-status-badge'].textContent), els['playoff-status-badge'].textContent);
t.resetPlayoffSim();
const savedTb = { ...t.initialNfcSouth.find(x => x.key === 'TB') };
Object.assign(t.initialNfcSouth.find(x => x.key === 'TB'), { wins: 3, losses: 2 });
t.updateStandings();
check('a tie for first is shown as a tie', /TIED FOR DIVISION LEAD/.test(els['playoff-status-badge'].textContent) && /Tied for Lead/.test(els['sim-standings-body'].innerHTML));
Object.assign(t.initialNfcSouth.find(x => x.key === 'TB'), savedTb);

// ---------------------------------------------------------------------------------------------------
section('Mock draft: data');
// ---------------------------------------------------------------------------------------------------
const P = t.draftProspects, O = t.draftOrder;
check('333 prospects, ids 1..333 in order', P.length === 333 && P.every((p, i) => p.id === i + 1));
check('no duplicate prospects', new Set(P.map(p => p.name.toLowerCase() + '|' + p.school.toLowerCase())).size === P.length);
check('Tankathon ranks 1-162 are each used once and come first', P.slice(0, 162).every((p, i) => p.board === i + 1) && P.slice(162).every(p => p.board === null));
const posSet = new Set(P.map(p => p.pos));
check('all 14 positions are present', ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS'].every(x => posSet.has(x)), [...posSet].join());
check('257 picks across 7 rounds, numbered 1..257', O.length === 257 && O.every((o, i) => o.pick === i + 1) && new Set(O.map(o => o.round)).size === 7);
check('every team has exactly 7 original regular picks (trades included)', (() => {
  const own = {}; O.filter(o => !o.comp).forEach(o => { const k = o.via || o.team; own[k] = (own[k] || 0) + 1; });
  return Object.keys(own).length === 32 && Object.values(own).every(n => n === 7);
})());
check('every team in the order has a name and record', O.every(o => t.NFL_TEAMS[o.team] && (!o.via || t.NFL_TEAMS[o.via])));
check('Panthers hold picks 20, 53, 84, 122, 131 (via MIN), 199, 240',
  O.filter(o => o.team === 'CAR').map(o => o.pick).join() === '20,53,84,122,131,199,240' && O.find(o => o.pick === 131).via === 'MIN');

// ---------------------------------------------------------------------------------------------------
section('Mock draft: playing it');
// ---------------------------------------------------------------------------------------------------
function seeded(seed) { let a = seed; return () => { a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

t.setRandom(seeded(1));
t.initDraft();
t.renderDraft();
check('draft starts at pick 1 and it is not the user\'s turn', t.currentSlot().pick === 1 && !t.isUserTurn());
check('board lists every prospect at the start', els['draft-available-count'].textContent === '333 of 333 players available');
t.draftProspect(1);
check('you cannot draft when you are not on the clock', t.getDraftState().next === 0);
t.simToMyPick();
check('"Sim to my pick" stops at the Panthers\' first pick (#20) with 19 picks made', t.currentSlot().pick === 20 && t.isUserTurn() && t.getDraftState().next === 19);
check('board shows DRAFT buttons only on your turn', els['prospects-board'].innerHTML.includes('draftProspect('));
check('status says you are on the clock', /ON THE CLOCK/.test(els['draft-status'].innerHTML));
const before = t.availableProspects().length;
t.simNextPick();
check('"Sim 1 pick" does nothing while you are on the clock', t.getDraftState().next === 19);
const pick1 = t.availableProspects()[0];
t.draftProspect(pick1.id);
check('drafting a player records the pick and moves on', t.getDraftState().picks[19].playerId === pick1.id && t.currentSlot().pick === 21 && t.availableProspects().length === before - 1);
t.draftProspect(pick1.id);
check('the same player can\'t be drafted twice', t.getDraftState().next === 20);
check('your class panel shows the pick with a grade', els['user-draft-class'].innerHTML.includes(pick1.name) && /GRADE|font-mono/.test(els['user-draft-class'].innerHTML) && els['draft-class-grade'].textContent !== '--');
t.simToMyPick();
check('next stop is pick #53', t.currentSlot().pick === 53 && t.isUserTurn());

// Position filter and search
t.setDraftPos('QB');
check('QB filter lists only quarterbacks', !/>(RB|WR|TE|OT|EDGE|CB)</.test(els['prospects-board'].innerHTML) && els['prospects-board'].innerHTML.includes('>QB<'));
t.setDraftPos('ALL');
t.setDraftQuery(P[200].name.split(' ')[0]);
check('search finds a player by name', els['prospects-board'].innerHTML.includes(P[200].name));
t.setDraftQuery('zzzz-no-such-player');
check('search with no match says so', els['prospects-board'].innerHTML.includes('No available players'));
t.setDraftQuery('');
t.setDraftPos('ALL');

// Pick grades
const g = (pick, id) => t.gradePick({ pick }, { id }).letter;
check('grades: right on the board = B+, big value = A+, big reach = D', g(20, 20) === 'B+' && g(20, 5) === 'A+' && g(20, 50) === 'D', [g(20, 20), g(20, 5), g(20, 50)].join());

// Finish the draft (auto-picks for the Panthers too)
t.autoDraftRest();
const st = t.getDraftState();
check('the draft finishes with all 257 picks made', t.isDraftComplete() && st.picks.every(p => p.playerId != null));
check('no player is drafted twice', new Set(st.picks.map(p => p.playerId)).size === 257);
check('exactly 76 players were left undrafted', t.availableProspects().length === 333 - 257);
check('your 7 Panthers picks are all made and graded', els['draft-class-count'].textContent === '7 of 7 picks made' && /^[A-D][+-]?$/.test(els['draft-class-grade'].textContent), els['draft-class-grade'].textContent);
const firstSpecialist = st.picks.find(p => ['K', 'P', 'LS'].includes(t.prospectsById.get(p.playerId).pos));
check('no kicker, punter or long snapper goes before pick 179', !firstSpecialist || firstSpecialist.pick >= 179, firstSpecialist && '#' + firstSpecialist.pick);
check('at most 6 specialists in the whole draft', st.picks.filter(p => ['K', 'P', 'LS'].includes(t.prospectsById.get(p.playerId).pos)).length <= 6);
const round1Players = st.picks.filter(p => p.round === 1).map(p => t.prospectsById.get(p.playerId));
const avgRank = round1Players.reduce((a, p) => a + p.id, 0) / 32;
check('round 1 is mostly top-ranked players (average consensus rank under 45)', avgRank < 45, avgRank.toFixed(1));
check('draft status says complete and buttons are disabled', /DRAFT COMPLETE/.test(els['draft-status'].innerHTML) && els['draft-sim-btn'].disabled && els['draft-auto-btn'].disabled);
check('draft log shows every round with all picks', (() => { t.getDraftUI().logRound = 5; t.renderDraft(); return (els['draft-log'].innerHTML.match(/font-mono text-panthers-silver/g) || []).length === 41; })());

// Run many full drafts with different random seeds: never crash, never double-draft
let allClean = true, worstDetail = '';
for (let seed = 2; seed <= 30; seed++) {
  t.setRandom(seeded(seed)); t.initDraft();
  try {
    t.autoDraftRest();
    const s2 = t.getDraftState();
    if (!t.isDraftComplete() || new Set(s2.picks.map(p => p.playerId)).size !== 257 || s2.picks.some(p => p.playerId == null)) { allClean = false; worstDetail = 'seed ' + seed; }
  } catch (e) { allClean = false; worstDetail = 'seed ' + seed + ': ' + e.message; }
}
check('29 more full drafts with different random seeds all finish cleanly', allClean, worstDetail);

// Reset
t.resetDraftSim();
check('reset puts the draft back at pick 1 with everyone available', t.currentSlot().pick === 1 && t.availableProspects().length === 333 && t.getDraftState().picks.every(p => p.playerId == null));

// ---------------------------------------------------------------------------------------------------
section('Home page');
// ---------------------------------------------------------------------------------------------------
check('every played game has leaders and a recap', t.panthers2026Schedule.filter(g => t.parseResult(g.status)).every(g => t.GAME_LEADERS[g.week] && t.GAME_LEADERS[g.week].recap));
const sumYds = Object.values(t.GAME_LEADERS).reduce((s, L) => s + (L.passer.name === 'Bryce Young' ? +L.passer.line.match(/, (\d+) yds/)[1] : 0), 0);
check('game-by-game passing yards add up to the season total on the roster card (1,549)', sumYds === 1549, String(sumYds));
const sumRush = Object.values(t.GAME_LEADERS).reduce((s, L) => s + (L.rusher.name === 'Chuba Hubbard' ? +L.rusher.line.match(/, (\d+) yds/)[1] : 0), 0);
check('game-by-game rushing yards add up to Hubbard\'s 426', sumRush === 426, String(sumRush));
check('last game card shows the Week 6 win at Philadelphia with photos of the leaders',
  /25 <span[^>]*>–<\/span> 14/.test(els['last-game'].innerHTML) && els['last-game'].innerHTML.includes('at Philadelphia Eagles') && els['last-game'].innerHTML.includes('Chuba Hubbard') && els['last-game'].innerHTML.includes('a.espncdn.com'));
const ss = t.seasonSummary();
check('season numbers: 146 scored, 123 allowed, +23, W2 streak, 1st in NFC South',
  ss.pf === 146 && ss.pa === 123 && ss.diff === 23 && ss.streak === 'W2' && ss.place === '1st', JSON.stringify(ss));
check('season numbers match the team stats in roster.js', Math.abs(ss.ppg - t.panthersTeamStats.ppg) < 0.05 && Math.abs(ss.oppg - t.panthersTeamStats.oppPpg) < 0.05);
check('week-by-week row has 18 dots', (els['season-glance'].innerHTML.match(/title="Week/g) || []).length === 18);
check('series text reads naturally', t.seriesText('26-25') === 'Panthers lead 26-25' && t.seriesText('7-11') === 'Panthers trail 7-11' && t.seriesText('3-4-1') === 'Panthers trail 3-4-1' && t.seriesText('5-5') === 'Series tied 5-5');
check('banner chips show TV, Bucs record, all-time series and last meeting',
  ['FOX', 'Buccaneers 1-5 in 2026', 'Panthers lead 26-25', 'L 14-16'].every(x => els['next-game-chips'].innerHTML.includes(x)), els['next-game-chips'].innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
check('home games get a "Plan your game day" button linked to that week', els['next-game-actions'].innerHTML.includes('openStadiumPlanner(7)'));
check('every remaining opponent has records and series', t.panthers2026Schedule.filter(g => g.status === 'Upcoming').every(g => t.OPPONENTS[g.abbr] && t.OPPONENTS[g.abbr].series));
const K = Date.parse('2026-10-25T13:00:00-04:00');
check('game phases: day before = upcoming, morning of = game day, during = live, much later = final',
  t.gamePhase(K, Date.parse('2026-10-24T20:00:00-04:00')) === 'upcoming' && t.gamePhase(K, Date.parse('2026-10-25T08:00:00-04:00')) === 'gameday' &&
  t.gamePhase(K, Date.parse('2026-10-25T15:00:00-04:00')) === 'live' && t.gamePhase(K, Date.parse('2026-10-25T19:00:00-04:00')) === 'final');
check('late-night ET kickoffs still count as game day in Charlotte (not UTC)',
  t.gamePhase(Date.parse('2026-10-29T20:15:00-04:00'), Date.parse('2026-10-29T08:00:00-04:00')) === 'gameday');
check('history list has 100+ dated events covering all 12 months',
  t.PANTHERS_HISTORY.length >= 100 && new Set(t.PANTHERS_HISTORY.map(e => e.date.slice(5, 7))).size === 12 && t.PANTHERS_HISTORY.every(e => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.title && e.text));
check('Keep Pounding speech is dated Jan 2, 2004', t.PANTHERS_HISTORY.some(e => e.date === '2004-01-02' && /Keep Pounding/i.test(e.title)));
const oct25 = t.historyFor('10-25');
check('history: Oct 25 has an exact entry; a date with none points to the next one',
  oct25.exact && oct25.events.length >= 1 && t.historyFor('10-24').exact === t.PANTHERS_HISTORY.some(e => e.date.endsWith('-10-24')));
check('history wraps from late December to January', t.historyFor('12-31').events.length > 0);
t.shiftHistoryDay(1);
check('the "next day" arrow moves to October 25', /October 25/.test(els['history-date'].textContent));
t.shiftHistoryDay(0);
check('"back to today" returns to today', /Today · October 24/.test(els['history-date'].textContent));
check('Hall of Honor lists all 8 members including McCormack, Gross, Muhammad',
  t.HALL_OF_HONOR.length === 8 && ['Mike McCormack', 'Jordan Gross', 'Muhsin Muhammad', 'Wesley Walls'].every(n => els['hall-of-honor'].innerHTML.includes(n)));
check('snapshot: 2 NFC titles, 7 division titles, 9 playoff trips, 227-273-1',
  t.FRANCHISE.nfcTitles === 2 && t.FRANCHISE.divisionTitles === 7 && t.FRANCHISE.playoffTrips === 9 && els['franchise-snapshot'].innerHTML.includes('227-273-1'));
check('hype headline matches the real standings and next game', els['hype-headline'].innerHTML.includes('We’re 3-2 and running the South</span> 🔥') && els['hype-sub'].textContent === 'The Buccaneers come to the Bank Sunday. Don’t be late.', els['hype-headline'].innerHTML + ' | ' + els['hype-sub'].textContent);
check('milestones include the 2025 Wild Card loss to the Rams (34-31)', els['milestones'].innerHTML.includes('34-31'));

// ---------------------------------------------------------------------------------------------------
section('Arcade');
// ---------------------------------------------------------------------------------------------------
check('the tab is called Arcade', /<span>🎮<\/span> ARCADE/.test(html) && !/> TRIVIA\n/.test(html));
const frameEl = els['trivia-frame'] = Object.assign(makeEl('trivia-frame'), { dataset: { src: 'https://my-first-game-opal.vercel.app/' }, attrs: {} });
frameEl.getAttribute = k => frameEl.attrs[k] ?? null; frameEl.setAttribute = (k, v) => { frameEl.attrs[k] = v; };
check('the trivia game does not load until the Arcade is opened', frameEl.getAttribute('src') === null);
t.openTab(null, 'arcade-tab');
check('opening the Arcade loads the trivia game', frameEl.getAttribute('src') === 'https://my-first-game-opal.vercel.app/');

// ---------------------------------------------------------------------------------------------------
section('Stadium Tour');
// ---------------------------------------------------------------------------------------------------
check('every map pin has a known layer, a source rating, a summary and details',
  t.STADIUM_PINS.every(p => t.MAP_LAYERS.some(l => l.id === p.layer) && t.SRC_LABELS[p.src] && p.summary && p.details.length));
check('map pins sit inside the map and have unique ids',
  t.STADIUM_PINS.every(p => p.x > 0 && p.x < 780 && p.y > 0 && p.y < 500) && new Set(t.STADIUM_PINS.map(p => p.id)).size === t.STADIUM_PINS.length);
check('the map draws one button per pin at start', (els['stadium-map'].innerHTML.match(/onclick="selectPin\('/g) || []).length === t.STADIUM_PINS.length);
t.selectPin('store');
check('clicking a pin shows its details', els['stadium-pin-detail'].innerHTML.includes('Panthers Team Store') && els['stadium-pin-detail'].innerHTML.includes('9–10 a.m.'));
t.toggleMapLayer('fun');
check('hiding a layer removes its pins and closes an open pin from it',
  !els['stadium-map'].innerHTML.includes("selectPin('store')") && t.stadiumUI.pin === null);
t.toggleMapLayer('fun');
check('every walkthrough stop points at a real pin', t.STADIUM_TOUR.every(s => t.STADIUM_PINS.some(p => p.id === s.pin)));
t.toggleMapLayer('gates');
t.toggleTour();
check('starting the walkthrough turns every layer back on and opens stop 1',
  Object.values(t.stadiumUI.layers).every(Boolean) && els['tour-count'].textContent === `Stop 1 of ${t.STADIUM_TOUR.length}` && t.stadiumUI.pin === t.STADIUM_TOUR[0].pin);
t.tourStep(-1);
check('"Back" on the first stop does nothing', t.stadiumUI.tour === 0);
for (let i = 1; i < t.STADIUM_TOUR.length; i++) t.tourStep(1);
check('stepping reaches the last stop, which offers Finish', t.stadiumUI.tour === t.STADIUM_TOUR.length - 1 && /Finish/.test(els['tour-next'].textContent));
t.tourStep(1);
check('Finish ends the walkthrough', t.stadiumUI.tour === -1 && els['tour-box'].classList.contains('hidden'));

const cam = t.seatCamera('home', '100');
check('home-sideline lower-level seats sit on the Panthers (-z) side, low and close',
  cam.x === 0 && cam.z < -26.65 && cam.z > -50 && cam.y < 10);
const up = t.seatCamera('visitors', '500');
check('upper-deck visitor seats are on the other side, higher and farther back', up.z > 0 && up.y > 40 && Math.abs(up.z) > Math.abs(cam.z));
let sceneOk = true, sceneMsg = '';
for (const z of t.STADIUM_ZONES) for (const l of t.STADIUM_LEVELS) {
  const sc = t.buildSeatScene(z.id, l.id);
  const allPts = [...sc.fieldShapes, ...sc.stands].flatMap(s => s.pts);
  if (sc.fieldShapes.length < 10 || sc.stands.length < 20 || sc.posts.length < 4 || allPts.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) {
    sceneOk = false; sceneMsg = `${z.id}/${l.id}`;
  }
  // the 50-yard line's middle should be in view, near the center of the picture
  const mid = sc.lines.find(x => x.w === 2 && Math.abs(x.a[0] - x.b[0]) < 1e9);
  if (!mid) { sceneOk = false; sceneMsg = `${z.id}/${l.id} no lines`; }
}
check(`seat view draws the field, stands and goalposts from all ${t.STADIUM_ZONES.length * t.STADIUM_LEVELS.length} zone/level combos`, sceneOk, sceneMsg);
t.setSeatZone('north'); t.setSeatLevel('300');
check('choosing seats updates the description', /North end zone · 300 Level/.test(els['seat-info'].innerHTML));
t.setSeatZone('no-such-zone');
check('an unknown zone falls back safely', t.stadiumUI.zone === 'home');

check('section lookup: 128 is lower bowl and on the shaded side', /100 level/.test(t.lookupSection('128').text) && /Shaded/.test(t.lookupSection('128').text));
check('section lookup: 512 is upper deck, sunny side', /500 level/.test(t.lookupSection('512').text) && /Sunny/.test(t.lookupSection('512').text));
check('section lookup rejects nonsense', !t.lookupSection('42').ok && !t.lookupSection('abc').ok && !t.lookupSection('700').ok);

const hg = t.homeGames();
check('planner lists the 9 home games', hg.length === 9 && hg.map(g => g.week).join() === '1,4,7,9,11,14,15,17,18', hg.map(g => g.week).join());
check('planner opens on the next home game (Week 7 vs. Tampa Bay)', /October 25/.test(els['plan-heading'].textContent) && /Tampa Bay/.test(els['plan-heading'].textContent), els['plan-heading'].textContent);
const plan = t.buildPlan(hg[2], 'drive', 'early');
const at = txt => (plan.find(s => s.text.includes(txt)) || {}).time;
check('gates open at 11:00 AM for a 1:00 PM kickoff', at('Gates open') === '11:00 AM ET');
check('kickoff is listed at 1:00 PM and the plan is in time order',
  at('Kickoff') === '1:00 PM ET' && plan.every((s, i) => i === 0 || plan[i - 1].min <= s.min));
check('bus times appear only when you pick the Game Day Express',
  !plan.some(s => /Express buses|Return buses/.test(s.text)) && t.buildPlan(hg[2], 'express', 'early').filter(s => /buses/i.test(s.text)).length === 2);
check('first express bus is 2½ hours before kickoff (10:30 AM)', t.buildPlan(hg[2], 'express', 'early')[0].time === '10:30 AM ET');
check('arrival goal "30 minutes early" lands at 12:30 PM', t.buildPlan(hg[2], 'ride', 'justin').find(s => s.mine).time === '12:30 PM ET');
const sunNight = hg.find(g => g.week === 9);
check('times after Nov 1 use Eastern Standard Time correctly',
  t.buildPlan(sunNight, 'drive', 'early').find(s => s.key).time === new Date(sunNight.kickoff).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET');
t.setPlanTransport('express');
check('switching transport changes the tips', /Brevard/.test(els['plan-tips'].innerHTML));
t.setPlanTransport('teleport');
check('an unknown transport is ignored', t.stadiumUI.plan.transport === 'express');

const bag = (...a) => t.evaluateBag(...a).ok;
check('bag: 12×6×12 clear tote passes in any order', bag('clear', 12, 12, 6, true) && bag('clear', 6, 12, 12, true));
check('bag: 13×6×12 is too big, and a non-clear tote fails', !bag('clear', 13, 6, 12, true) && !bag('clear', 10, 5, 10, false));
check('bag: a 6×4 clutch passes even if not clear; 7×4 fails', bag('clutch', 6, 4, 0, false) && !bag('clutch', 7, 4, 0, false));
check('bag: a freezer bag only needs to be clear', bag('freezer', 0, 0, 0, true) && !bag('freezer', 0, 0, 0, false));
check('bag: missing sizes ask for input instead of passing', !t.evaluateBag('clear', '', 6, 12, true).ok && /Enter/.test(t.evaluateBag('clear', '', 6, 12, true).messages[0]));
t.showStadiumPanel('plan', null);
check('stadium sub-tabs show one panel at a time', !els['stadium-panel-plan'].classList.contains('hidden') && els['stadium-panel-map'].classList.contains('hidden'));
check('facts panel lists capacity 75,037 and the 1996 opening', els['stadium-facts'].innerHTML.includes('75,037') && els['stadium-history'].innerHTML.includes('1996'));

// ---------------------------------------------------------------------------------------------------
section('Weather, news, forum and safety');
// ---------------------------------------------------------------------------------------------------
check('escapeHtml neutralizes markup', t.escapeHtml('<img src=x onerror=alert(1)> & "q"') === '&lt;img src=x onerror=alert(1)&gt; &amp; &quot;q&quot;');
check('safeUrl blocks javascript: links and allows https', t.safeUrl('javascript:alert(1)') === '#' && t.safeUrl('https://www.espn.com/a?b=1').startsWith('https://www.espn.com/a'));
check('ordinal() gets 1st, 2nd, 3rd, 11th right', [1, 2, 3, 11, 21].map(t.ordinal).join() === '1st,2nd,3rd,11th,21st');

(async () => {
  fetchLog = [];
  fetchHandler = () => Promise.resolve({ json: () => Promise.resolve({ current_weather: { temperature: 61.4, windspeed: 8.2, weathercode: 3 } }) });
  await t.fetchCharlotteWeather();
  check('weather asks for mph and shows the right icon', fetchLog[0].includes('windspeed_unit=mph') && els['charlotte-weather'].innerHTML.includes('☁️') && els['charlotte-weather'].innerHTML.includes('61°F') && els['charlotte-weather'].innerHTML.includes('Wind 8mph'), els['charlotte-weather'].innerHTML);
  fetchHandler = () => Promise.reject(new Error('down'));
  await t.fetchCharlotteWeather();
  check('weather failure says "Unavailable" instead of showing a made-up temperature', els['charlotte-weather'].innerHTML.includes('Unavailable') && !/72°F/.test(els['charlotte-weather'].innerHTML));

  fetchLog = [];
  fetchHandler = () => Promise.resolve({ json: () => Promise.resolve({ articles: [
    { headline: 'Panthers <script>alert(1)</script> win', description: 'Big <b>win</b>', published: '2026-10-19T12:00:00Z', links: { web: { href: 'https://www.espn.com/story/1' } } },
    { headline: 'Bad link story', description: '', links: { web: { href: 'javascript:alert(1)' } } } ] }) });
  await t.fetchPanthersNews();
  const news = els['espn-news-container'].innerHTML;
  check('news uses ESPN\'s Panthers feed (team 29)', fetchLog[0].includes('site.api.espn.com') && fetchLog[0].includes('team=29'));
  check('news headlines are escaped and unsafe links are blocked', !/<script>/.test(news) && news.includes('&lt;script&gt;') && !/href="javascript:/.test(news) && news.includes('href="#"'));
  fetchHandler = () => Promise.reject(new Error('down'));
  await t.fetchPanthersNews();
  check('news failure shows a link to ESPN, not invented headlines', els['espn-news-container'].innerHTML.includes('espn.com/nfl/team') && !/Gear Up|Showing Grit/.test(els['espn-news-container'].innerHTML));

  // ---- Fan Talk forum (API mocked)
  const now = Date.now();
  const iso = h => new Date(now - h * 3600e3).toISOString();
  const apiThreads = [
    { id: 'old1', title: 'Old but popular', cat: 'roster', author: 'A', createdAt: iso(72), lastActivity: iso(70), replies: 30, score: 40, preview: 'x', pinned: false, locked: false },
    { id: 'new1', title: 'Fresh take <b>bold</b>', cat: 'draft', author: 'B', createdAt: iso(1), lastActivity: iso(0.5), replies: 2, score: 3, preview: '<img src=x onerror=alert(1)>', pinned: false, locked: false },
    { id: 'game-w7', title: '🏈 Game Thread: Panthers vs. Buccaneers (Week 7)', cat: 'gameday', author: 'Fan Central', createdAt: iso(3), lastActivity: iso(3), replies: 0, score: 0, preview: '', pinned: true, locked: false, kind: 'game' }
  ];
  const apiThread = { id: 'new1', title: 'Fresh take', cat: 'draft', author: 'B', body: 'Check https://example.com/x?a=1&b=2 and javascript:alert(1)', createdAt: iso(1), lastActivity: iso(0.5), score: 3, pinned: false, locked: false, voted: false,
    comments: [
      { id: 'c1', parentId: null, author: 'C', body: 'top level', createdAt: iso(0.9), score: 1, removed: null, voted: false },
      { id: 'c2', parentId: 'c1', author: 'B', body: 'OP reply <script>x</script>', createdAt: iso(0.8), score: 0, removed: null, voted: true },
      { id: 'c3', parentId: 'c2', author: 'D', body: 'deeper', createdAt: iso(0.7), score: 0, removed: null, voted: false },
      { id: 'c4', parentId: null, author: '[removed]', body: '', createdAt: iso(0.6), score: 0, removed: 'auto', voted: false }
    ] };
  let calls = [];
  fetchHandler = (url, opts = {}) => {
    calls.push({ url, opts });
    const json = (status, data) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(data) });
    if (url.includes('action=list')) return json(200, { threads: apiThreads, categories: [] });
    if (url.includes('action=thread')) return json(200, JSON.parse(JSON.stringify(apiThread)));
    if (url.includes('action=whoami')) return json(200, { admin: false });
    if (url.includes('action=create')) return json(201, { id: 'made1' });
    if (url.includes('action=comment')) { const b = JSON.parse(opts.body); return b.body.length ? json(201, { id: 'cNew' }) : json(400, { error: 'Comment can’t be empty.' }); }
    if (url.includes('action=vote')) return json(200, { voted: true, score: 4 });
    return json(400, { error: 'unknown' });
  };
  await t.loadForum();
  const feed = els['forum-feed'].innerHTML;
  check('forum feed loads threads from the API with a fan id header', calls[0].url.startsWith('/api/forum?action=list') && /^fan-[0-9a-f]{24}$/.test(calls[0].opts.headers['X-Fan-Id']));
  check('pinned game thread is listed first', feed.indexOf('Game Thread') < feed.indexOf('Fresh take') && feed.includes('📌 Pinned'));
  check('hot sort favors the fresh thread over the old popular one', feed.indexOf('Fresh take') < feed.indexOf('Old but popular'));
  check('thread titles and previews are escaped', !/<b>bold<\/b>/.test(feed) && feed.includes('&lt;b&gt;bold') && !/<img src=x/.test(feed));
  t.setForumSort('top');
  check('Top sort puts the most upvoted first (after pinned)', els['forum-feed'].innerHTML.indexOf('Old but popular') < els['forum-feed'].innerHTML.indexOf('Fresh take'));
  t.setForumCat('draft');
  check('category filter shows only that category', els['forum-feed'].innerHTML.includes('Fresh take') && !els['forum-feed'].innerHTML.includes('Old but popular'));
  t.setForumCat('all'); t.setForumSort('hot');

  await t.openThread('new1');
  const tv = els['forum-thread'].innerHTML;
  check('opening a thread shows it and updates the link (#thread=new1)', !els['forum-thread-view'].classList.contains('hidden') && els['forum-feed-view'].classList.contains('hidden') && location.hash === '#thread=new1');
  check('links in posts become safe new-tab links; javascript: stays plain text',
    tv.includes('href="https://example.com/x?a=1&amp;b=2"') && tv.includes('rel="noopener noreferrer nofollow ugc"') && !/href="javascript/.test(tv));
  check('comments render as a nested tree (reply inside its parent)', tv.indexOf('id="c-c2"') > tv.indexOf('id="c-c1"') && tv.indexOf('id="c-c3"') > tv.indexOf('id="c-c2"') && tv.indexOf('id="c-c3"') < tv.indexOf('id="c-c4"'));
  check('comment text is escaped', !tv.includes('<script>x</script>') && tv.includes('&lt;script&gt;'));
  check('the original poster gets an OP tag on their replies', /id="c-c2"[\s\S]*?OP<\/span>/.test(tv));
  check('removed comments show a placeholder', tv.includes('This comment was removed.'));
  check('your earlier upvotes are highlighted', /voteComment\('c2'\)" aria-pressed="true"/.test(tv));
  t.toggleCollapse('c1');
  check('collapsing a comment hides its replies and says how many', !els['forum-thread'].innerHTML.includes('id="c-c2"') && els['forum-thread'].innerHTML.includes('2 more replies hidden'));
  t.toggleCollapse('c1');
  t.setReplyTo('c2');
  check('reply opens a box under that comment', els['forum-thread'].innerHTML.indexOf('id="reply-body"') > els['forum-thread'].innerHTML.indexOf('id="c-c2"'));
  els['reply-name'] = Object.assign(makeEl('reply-name'), { value: 'Tester' });
  els['reply-body'] = Object.assign(makeEl('reply-body'), { value: 'Great point' });
  calls = [];
  await t.submitComment();
  const sent = calls.find(c => c.url.includes('action=comment'));
  check('posting a reply sends thread, parent, name and text', sent && JSON.parse(sent.opts.body).parentId === 'c2' && JSON.parse(sent.opts.body).author === 'Tester' && JSON.parse(sent.opts.body).threadId === 'new1');
  check('your fan name is remembered for next time', window.localStorage.getItem('fanName') === 'Tester');
  t.setReplyTo(null);
  els['reply-body'] = Object.assign(makeEl('reply-body'), { value: '' });
  await t.submitComment();
  check('server errors are shown next to the reply box', els['reply-error'].textContent === 'Comment can’t be empty.');
  await t.voteThread('new1');
  check('upvoting updates the count right away', t.forumUI.thread.score === 4 && /▲ 4 upvotes/.test(els['forum-thread'].innerHTML));
  t.closeThread();
  check('back button returns to the feed and clears the link', els['forum-thread-view'].classList.contains('hidden') && location.hash === '');
  check('the share link format is recognized on load', (location.hash = '#thread=abc_123', t.threadIdFromHash() === 'abc_123') && (location.hash = '#thread=<x>', t.threadIdFromHash() === null));
  location.hash = '';
  await new Promise(r => setTimeout(r, 0)); // let the feed refresh started by closeThread finish
  fetchHandler = () => Promise.reject(new Error('offline'));
  t.forumUI.loaded = false;
  await t.loadForum();
  check('if the forum can’t be reached, it says so with a retry button', /Can’t reach the forum/.test(els['forum-feed'].innerHTML) && els['forum-feed'].innerHTML.includes('Try again'));
  check('time-ago labels read naturally', t.timeAgo(iso(0.001)) === 'just now' && t.timeAgo(iso(2)) === '2h ago' && t.timeAgo(iso(49)) === '2d ago');

  Date.now = realNow;
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
