// Mock Draft tab: a full 7-round, 257-pick mock of the 2027 NFL Draft.
// You make the Panthers' picks; the computer makes everyone else's.
// The pick order is in data/draft-order.js and the players are in data/draft-prospects.js.

const USER_TEAM = 'CAR';
const SPECIALIST_POSITIONS = ['K', 'P', 'LS'];
const DRAFT_POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS'];

const CPU_CANDIDATES = 10;         // computer teams choose among the best 10 players still on the board
const FIRST_SPECIALIST_PICK = 179; // kickers, punters and long snappers only go in the late rounds
const MAX_SPECIALISTS = 6;

// Earlier rounds count for more in the overall class grade
const ROUND_WEIGHTS = { 1: 3, 2: 2.5, 3: 2, 4: 1.5, 5: 1, 6: 0.75, 7: 0.5 };

// A pick's grade is how far he went from his consensus rank (as a share of a tolerance that grows
// with the pick number). "min" is the lowest value that earns that grade.
const PICK_GRADES = [
  { letter: 'A+', min: 1.5, points: 4.3 }, { letter: 'A', min: 0.8, points: 4.0 }, { letter: 'A-', min: 0.3, points: 3.7 },
  { letter: 'B+', min: -0.2, points: 3.3 }, { letter: 'B', min: -0.6, points: 3.0 }, { letter: 'B-', min: -1.0, points: 2.7 },
  { letter: 'C+', min: -1.5, points: 2.3 }, { letter: 'C', min: -2.0, points: 2.0 }, { letter: 'C-', min: -3.0, points: 1.7 },
  { letter: 'D', min: -Infinity, points: 1.0 }
];

// The class grade is the round-weighted average of the pick grades, turned back into a letter
const CLASS_GRADES = [
  { letter: 'A+', min: 4.15 }, { letter: 'A', min: 3.85 }, { letter: 'A-', min: 3.5 },
  { letter: 'B+', min: 3.15 }, { letter: 'B', min: 2.85 }, { letter: 'B-', min: 2.5 },
  { letter: 'C+', min: 2.15 }, { letter: 'C', min: 1.85 }, { letter: 'C-', min: 1.5 },
  { letter: 'D', min: -Infinity }
];

const CLASS_SUMMARIES = {
  A: 'Great value! You consistently landed players at or above where the consensus board ranks them.',
  B: 'A solid class: mostly fair value with a few picks that could go either way.',
  C: 'A mixed class: several picks came before the consensus board says they should have.',
  D: 'A class full of reaches. The board had better players available at most of your picks.'
};

const GRADE_TONES = {
  emerald: { text: 'text-emerald-400', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-500' },
  amber: { text: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-400 border-amber-500' },
  rose: { text: 'text-rose-400', badge: 'bg-rose-950/60 text-rose-400 border-rose-500' }
};

const prospectsById = new Map(draftProspects.map(p => [p.id, p]));

let draftRandom = Math.random; // the tests swap this out so results are repeatable
let draftState = null;
const draftUI = { pos: 'ALL', query: '', limit: 40, logRound: 1 };

// ---- Draft engine -----------------------------------------------------------------------------------------

function initDraft() {
  draftState = {
    next: 0,                                              // index of the pick that is on the clock
    picks: draftOrder.map(slot => ({ ...slot, playerId: null })),
    taken: new Set(),                                     // ids of players already drafted
    teamPicks: {},                                        // team -> positions it has drafted so far
    specialists: 0
  };
  draftUI.logRound = 1;
  draftUI.limit = 40;
}

function currentSlot() { return draftState.picks[draftState.next] || null; }
function isDraftComplete() { return draftState.next >= draftState.picks.length; }
function isUserTurn() { const s = currentSlot(); return !!s && s.team === USER_TEAM; }
function availableProspects() { return draftProspects.filter(p => !draftState.taken.has(p.id)); }
function nextUserSlot() { return draftState.picks.slice(draftState.next).find(s => s.team === USER_TEAM) || null; }

function makePick(slot, prospect) {
  slot.playerId = prospect.id;
  draftState.taken.add(prospect.id);
  if (!draftState.teamPicks[slot.team]) draftState.teamPicks[slot.team] = [];
  draftState.teamPicks[slot.team].push(prospect.pos);
  if (SPECIALIST_POSITIONS.includes(prospect.pos)) draftState.specialists++;
  draftState.next++;

  const upcoming = currentSlot();
  draftUI.logRound = upcoming ? upcoming.round : draftOrder[draftOrder.length - 1].round;
}

// Computer teams take roughly the best player available, with some randomness, and avoid doubling up
// at one position. They don't know team needs, so treat the CPU picks as a rough projection.
function cpuChoose(slot) {
  const avail = availableProspects();
  const mine = draftState.teamPicks[slot.team] || [];

  // A few late-round picks go to a kicker, punter or long snapper, as in a real draft
  if (slot.pick >= FIRST_SPECIALIST_PICK && draftState.specialists < MAX_SPECIALISTS && draftRandom() < 0.08) {
    const specialist = avail.find(p => SPECIALIST_POSITIONS.includes(p.pos) && !mine.includes(p.pos));
    if (specialist) return specialist;
  }

  const candidates = avail.filter(p => !SPECIALIST_POSITIONS.includes(p.pos)).slice(0, CPU_CANDIDATES);
  if (!candidates.length) return avail[0]; // only specialists are left

  const weights = candidates.map((p, i) => {
    const repeats = mine.filter(pos => pos === p.pos).length;
    const repeatPenalty = p.pos === 'QB' ? 0.12 : 0.5;
    return Math.pow(0.62, i) * Math.pow(repeatPenalty, repeats);
  });
  let roll = draftRandom() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function simOnePick() {
  if (isDraftComplete() || isUserTurn()) return false;
  const slot = currentSlot();
  makePick(slot, cpuChoose(slot));
  return true;
}

// ---- Buttons ----------------------------------------------------------------------------------------------

function simNextPick() { simOnePick(); renderDraft(); }

function simToMyPick() {
  while (!isDraftComplete() && !isUserTurn()) simOnePick();
  renderDraft();
}

// Finish the whole draft, making your picks for you
function autoDraftRest() {
  while (!isDraftComplete()) {
    const slot = currentSlot();
    makePick(slot, cpuChoose(slot));
  }
  renderDraft();
}

function draftProspect(id) {
  if (!isUserTurn()) return;
  const prospect = prospectsById.get(Number(id));
  if (!prospect || draftState.taken.has(prospect.id)) return;
  makePick(currentSlot(), prospect);
  renderDraft();
}

function resetDraftSim() { initDraft(); renderDraft(); }

function setDraftPos(pos) {
  draftUI.pos = DRAFT_POSITIONS.includes(pos) ? pos : 'ALL';
  draftUI.limit = 40;
  renderPositionFilters();
  renderAvailableBoard();
}

function setDraftQuery(query) {
  draftUI.query = String(query || '');
  draftUI.limit = 40;
  renderAvailableBoard();
}

function showMoreProspects() { draftUI.limit += 40; renderAvailableBoard(); }
function setLogRound(round) { draftUI.logRound = round; renderDraftLog(); }

// ---- Grading ----------------------------------------------------------------------------------------------

function gradePick(slot, prospect) {
  const delta = slot.pick - prospect.id; // positive = he went later than his consensus rank (good value)
  const value = delta / Math.max(6, slot.pick * 0.3);
  return { ...PICK_GRADES.find(g => value >= g.min), delta };
}

function gradeClass(userPicks) {
  let sum = 0, weight = 0;
  userPicks.forEach(({ slot, prospect }) => {
    const w = ROUND_WEIGHTS[slot.round];
    sum += gradePick(slot, prospect).points * w;
    weight += w;
  });
  const average = sum / weight;
  return CLASS_GRADES.find(g => average >= g.min);
}

function gradeTone(letter) {
  return GRADE_TONES[letter[0] === 'A' ? 'emerald' : letter[0] === 'B' ? 'amber' : 'rose'];
}

// ---- Rendering --------------------------------------------------------------------------------------------

function setupDraftControls() {
  document.getElementById('draft-pool-note').textContent =
    `${draftOrder.length} picks (order as of ${DRAFT_ORDER_AS_OF}) · ${draftProspects.length} prospects (as of ${PROSPECTS_AS_OF})`;
}

function renderDraft() {
  renderDraftStatus();
  renderPositionFilters();
  renderAvailableBoard();
  renderYourClass();
  renderDraftLog();
}

function setButton(id, label, enabled) {
  const btn = document.getElementById(id);
  btn.textContent = label;
  btn.disabled = !enabled;
  btn.classList.toggle('opacity-40', !enabled);
  btn.classList.toggle('cursor-not-allowed', !enabled);
}

function renderDraftStatus() {
  const slot = currentSlot();
  const el = document.getElementById('draft-status');
  document.getElementById('draft-progress').textContent = `${draftState.next} of ${draftOrder.length} picks made`;

  if (!slot) {
    el.className = 'bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg mb-4';
    el.innerHTML = `<h3 class="font-heading font-bold text-emerald-400 text-base">🎉 DRAFT COMPLETE</h3>
      <p class="text-panthers-silver text-xs">All ${draftOrder.length} picks are in. Check your class and grade on the right, or reset to run it again.</p>`;
    setButton('draft-sim-btn', '▶ Sim to My Pick', false);
    setButton('draft-one-btn', '⏭ Sim 1 Pick', false);
    setButton('draft-auto-btn', '⚡ Auto-Draft the Rest', false);
    return;
  }

  const team = NFL_TEAMS[slot.team];
  const via = slot.via ? ` · pick from ${NFL_TEAMS[slot.via].name}` : '';
  const comp = slot.comp ? ' · projected compensatory pick' : '';
  const mine = nextUserSlot();

  if (isUserTurn()) {
    el.className = 'bg-panthers-blue/15 border border-panthers-blue p-3 rounded-lg mb-4';
    el.innerHTML = `<span class="text-[10px] font-heading font-bold uppercase tracking-widest text-panthers-blue block">YOU'RE ON THE CLOCK</span>
      <h3 class="font-heading font-bold text-white text-lg leading-tight">ROUND ${slot.round} • PICK #${slot.pick}${escapeHtml(via + comp)}</h3>
      <p class="text-panthers-silver text-xs">Choose a player from the board below.</p>`;
    setButton('draft-sim-btn', 'Make your pick below', false);
    setButton('draft-one-btn', '⏭ Sim 1 Pick', false);
  } else {
    el.className = 'bg-panthers-black/60 border border-panthers-cardBorder p-3 rounded-lg mb-4';
    const mineText = mine
      ? `Your next pick: #${mine.pick} (Round ${mine.round}), ${mine.pick - slot.pick} picks away.`
      : 'You have no picks left. Sim the rest of the draft to see how it ends.';
    el.innerHTML = `<span class="text-[10px] font-heading font-bold uppercase tracking-widest text-panthers-silver block">COMPUTER PICK</span>
      <h3 class="font-heading font-bold text-white text-base leading-tight">ROUND ${slot.round} • PICK #${slot.pick}: ${escapeHtml(team.name)} (${escapeHtml(team.record)})${escapeHtml(via + comp)}</h3>
      <p class="text-panthers-silver text-xs">${escapeHtml(mineText)}</p>`;
    setButton('draft-sim-btn', mine ? `▶ Sim to My Pick (#${mine.pick})` : '▶ Sim the Rest of the Draft', true);
    setButton('draft-one-btn', '⏭ Sim 1 Pick', true);
  }
  setButton('draft-auto-btn', '⚡ Auto-Draft the Rest', true);
}

function renderPositionFilters() {
  const avail = availableProspects();
  document.getElementById('draft-pos-filters').innerHTML = DRAFT_POSITIONS.map(pos => {
    const count = pos === 'ALL' ? avail.length : avail.filter(p => p.pos === pos).length;
    const on = draftUI.pos === pos;
    const cls = on ? 'bg-panthers-blue text-white border-panthers-blue'
                   : 'bg-panthers-black/80 text-panthers-silver border-panthers-cardBorder hover:text-white';
    return `<button onclick="setDraftPos('${pos}')" class="${cls} border font-heading font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-all">${pos} <span class="opacity-70">${count}</span></button>`;
  }).join('');
}

function prospectRowHtml(p, canDraft) {
  const rank = p.board ? `#${p.board}` : 'NR';
  const rankTitle = p.board ? `Rank ${p.board} on Tankathon's big board` : 'Not on Tankathon\'s big board; order is estimated';
  const draftBtn = canDraft
    ? `<button onclick="draftProspect(${p.id})" class="bg-panthers-blue hover:bg-panthers-blueHover text-white font-heading font-bold px-3 py-1.5 rounded text-xs uppercase tracking-wider shadow-md whitespace-nowrap">DRAFT ↗</button>`
    : '';
  return `
    <div class="bg-panthers-black/60 border border-panthers-cardBorder p-2.5 rounded-lg flex items-center justify-between gap-3 hover:border-panthers-blue transition-colors">
      <div class="flex items-center gap-2.5 min-w-0">
        <span title="${escapeHtml(rankTitle)}" class="w-9 shrink-0 text-center text-[10px] font-mono text-panthers-silver">${rank}</span>
        <span class="bg-panthers-blue/20 text-panthers-blue border border-panthers-blue text-[9px] font-heading font-bold px-1.5 py-0.5 rounded shrink-0">${escapeHtml(p.pos)}</span>
        <div class="min-w-0">
          <h3 class="font-heading font-bold text-white text-sm leading-tight truncate">${escapeHtml(p.name)}</h3>
          <p class="text-panthers-silver text-[11px] truncate">${escapeHtml(p.school)}${p.cls ? ' · ' + escapeHtml(p.cls) : ''}</p>
        </div>
      </div>
      ${draftBtn}
    </div>`;
}

function renderAvailableBoard() {
  const canDraft = isUserTurn();
  const query = draftUI.query.trim().toLowerCase();
  const matches = availableProspects().filter(p =>
    (draftUI.pos === 'ALL' || p.pos === draftUI.pos) &&
    (!query || `${p.name} ${p.school}`.toLowerCase().includes(query)));
  const shown = matches.slice(0, draftUI.limit);

  document.getElementById('prospects-board').innerHTML = shown.length
    ? shown.map(p => prospectRowHtml(p, canDraft)).join('')
    : '<p class="text-panthers-silver text-xs italic p-2">No available players match that search.</p>';

  document.getElementById('prospects-more').innerHTML = matches.length > shown.length
    ? `<button onclick="showMoreProspects()" class="w-full bg-panthers-black border border-panthers-cardBorder hover:border-panthers-blue text-panthers-silver hover:text-white text-[11px] font-heading font-bold py-2 rounded uppercase tracking-wider transition-colors">Show more (${matches.length - shown.length} more)</button>`
    : '';

  document.getElementById('draft-available-count').textContent =
    `${availableProspects().length} of ${draftProspects.length} players available`;
}

function renderYourClass() {
  const slots = draftState.picks.filter(s => s.team === USER_TEAM);
  const made = slots.filter(s => s.playerId != null).map(slot => ({ slot, prospect: prospectsById.get(slot.playerId) }));
  const container = document.getElementById('user-draft-class');
  const gradeBadge = document.getElementById('draft-class-grade');
  const gradeSummary = document.getElementById('draft-grade-summary');
  document.getElementById('draft-class-count').textContent = `${made.length} of ${slots.length} picks made`;

  if (!made.length) {
    container.innerHTML = `<p class="text-panthers-silver text-xs italic">No picks yet. Sim to your first pick (#${slots[0].pick}) to get started.</p>`;
    gradeBadge.textContent = '--';
    gradeBadge.className = 'text-3xl font-heading font-extrabold text-panthers-blue block';
    gradeSummary.textContent = 'Make your selections to evaluate value against the consensus board.';
    return;
  }

  container.innerHTML = made.map(({ slot, prospect }) => {
    const g = gradePick(slot, prospect);
    const tone = gradeTone(g.letter);
    const rank = prospect.board ? `Rank #${prospect.id}` : `Est. rank #${prospect.id}`;
    const verdict = g.delta > 3 ? `▲ ${g.delta} spots of value` : g.delta < -3 ? `▼ ${-g.delta}-spot reach` : 'Right on the board';
    return `
      <div class="bg-panthers-black/60 border border-panthers-cardBorder p-2.5 rounded-lg flex justify-between items-center gap-2">
        <div class="min-w-0">
          <span class="text-[9px] text-panthers-blue font-heading font-bold uppercase block">R${slot.round} • #${slot.pick}${slot.via ? ' (via ' + escapeHtml(slot.via) + ')' : ''} • ${escapeHtml(prospect.pos)}</span>
          <h4 class="font-heading font-bold text-white text-xs truncate">${escapeHtml(prospect.name)}</h4>
          <span class="text-[9px] text-panthers-silver block truncate">${escapeHtml(prospect.school)} · ${rank} · ${verdict}</span>
        </div>
        <span class="${tone.badge} border font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0">${g.letter}</span>
      </div>`;
  }).join('');

  const overall = gradeClass(made);
  gradeBadge.textContent = overall.letter;
  gradeBadge.className = `text-3xl font-heading font-extrabold ${gradeTone(overall.letter).text} block`;
  const note = made.length < slots.length ? ` (${slots.length - made.length} pick${slots.length - made.length === 1 ? '' : 's'} still to come)` : '';
  gradeSummary.textContent = CLASS_SUMMARIES[overall.letter[0]] + note;
}

function renderDraftLog() {
  const rounds = [1, 2, 3, 4, 5, 6, 7];
  document.getElementById('draft-log-tabs').innerHTML = rounds.map(r => {
    const on = draftUI.logRound === r;
    const cls = on ? 'bg-panthers-blue text-white border-panthers-blue'
                   : 'bg-panthers-black/80 text-panthers-silver border-panthers-cardBorder hover:text-white';
    return `<button onclick="setLogRound(${r})" class="${cls} border font-heading font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wider transition-all">R${r}</button>`;
  }).join('');

  const slots = draftState.picks.filter(s => s.round === draftUI.logRound);
  const hasComp = slots.some(s => s.comp);
  document.getElementById('draft-log').innerHTML = slots.map(s => {
    const prospect = s.playerId != null ? prospectsById.get(s.playerId) : null;
    const mine = s.team === USER_TEAM;
    const who = prospect
      ? `<span class="text-white font-semibold">${escapeHtml(prospect.name)}</span> <span class="text-panthers-silver">${escapeHtml(prospect.pos)} · ${escapeHtml(prospect.school)}</span>`
      : '<span class="text-slate-600">—</span>';
    const via = s.via ? `<span class="text-[9px] text-slate-500"> via ${escapeHtml(s.via)}</span>` : '';
    return `
      <div class="flex items-baseline gap-2 text-[11px] py-1 px-1.5 border-b border-panthers-cardBorder/40 ${mine ? 'bg-panthers-blue/10' : ''}">
        <span class="w-9 shrink-0 font-mono text-panthers-silver" ${s.comp ? 'title="Projected compensatory pick"' : ''}>${s.pick}${s.comp ? '*' : ''}</span>
        <span class="w-9 shrink-0 font-heading font-bold ${mine ? 'text-panthers-blue' : 'text-panthers-silver'}">${escapeHtml(s.team)}</span>
        <span class="min-w-0 flex-1 truncate">${who}${via}</span>
      </div>`;
  }).join('') + (hasComp ? '<p class="text-[10px] text-slate-500 pt-2">* Projected compensatory pick (the NFL awards these after free agency).</p>' : '');
}
