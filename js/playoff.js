// Playoff Machine tab.
//
// It simulates the Panthers' remaining NFC South games (the ones after NFC_SOUTH_AS_OF_WEEK in
// data/playoff.js). Every other result is held constant, so this is a simplified division picture,
// not a full playoff-seeding calculation.

const upcomingDivisionalGames = panthers2026Schedule
  .filter(g => g.div && g.week > NFC_SOUTH_AS_OF_WEEK)
  .map((g, i) => ({ id: i + 1, week: `Wk ${g.week}`, teamA: 'CAR', teamB: g.abbr, label: g.opp, picked: null }));

function renderPlayoffMachine() {
  const container = document.getElementById("sim-games-container");
  let gamesHTML = "";

  upcomingDivisionalGames.forEach(g => {
    const isCarWin = g.picked === 'CAR';
    const isCarLoss = g.picked === 'OPP';

    gamesHTML += `
      <div class="bg-panthers-black/60 border border-panthers-cardBorder p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span class="text-panthers-blue text-[10px] font-heading font-bold uppercase tracking-wider">${g.week} Divisional Matchup</span>
          <h4 class="text-sm font-heading font-bold text-white">Carolina Panthers ${g.label}</h4>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="pickSimGame(${g.id}, 'CAR')" class="px-3 py-1.5 rounded font-heading text-[10px] uppercase font-bold transition-all ${isCarWin ? 'bg-emerald-600 text-white border border-emerald-400' : 'bg-panthers-black text-panthers-silver border border-panthers-cardBorder hover:text-white'}">
            Panthers Win
          </button>
          <button onclick="pickSimGame(${g.id}, 'OPP')" class="px-3 py-1.5 rounded font-heading text-[10px] uppercase font-bold transition-all ${isCarLoss ? 'bg-rose-600 text-white border border-rose-400' : 'bg-panthers-black text-panthers-silver border border-panthers-cardBorder hover:text-white'}">
            Panthers Loss
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = gamesHTML;
  updateStandings();
}

function pickSimGame(gameId, pick) {
  const game = upcomingDivisionalGames.find(g => g.id === gameId);
  if (game) {
    game.picked = game.picked === pick ? null : pick;
  }
  renderPlayoffMachine();
}

function resetPlayoffSim() {
  upcomingDivisionalGames.forEach(g => g.picked = null);
  renderPlayoffMachine();
}

function updateStandings() {
  const currentStandings = JSON.parse(JSON.stringify(initialNfcSouth));

  upcomingDivisionalGames.forEach(g => {
    if (g.picked === 'CAR') {
      const car = currentStandings.find(t => t.key === 'CAR');
      const opp = currentStandings.find(t => t.key === g.teamB);
      if (car) car.wins++;
      if (opp) opp.losses++;
    } else if (g.picked === 'OPP') {
      const car = currentStandings.find(t => t.key === 'CAR');
      const opp = currentStandings.find(t => t.key === g.teamB);
      if (car) car.losses++;
      if (opp) opp.wins++;
    }
  });

  // Best record first: more wins, then fewer losses
  currentStandings.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const sameRecord = (x, y) => x.wins === y.wins && x.losses === y.losses;
  const leader = currentStandings[0];
  const tiedForLead = currentStandings.filter(t => sameRecord(t, leader)).length > 1;

  const tbody = document.getElementById("sim-standings-body");
  let tableHTML = "";

  currentStandings.forEach((t, idx) => {
    const isPanthers = t.key === "CAR";
    let statusHTML = '<span class="text-slate-500 text-[10px]">Contender</span>';
    if (sameRecord(t, leader)) {
      statusHTML = tiedForLead
        ? '<span class="text-amber-400 text-[10px]">Tied for Lead</span>'
        : '<span class="text-emerald-400 text-[10px]">Division Leader</span>';
    }
    tableHTML += `
      <tr class="${isPanthers ? 'text-panthers-blue font-bold bg-panthers-blue/10' : 'text-panthers-silver'}">
        <td class="py-2 flex items-center gap-1.5">
          <span class="text-[10px] text-slate-500 font-mono">#${idx + 1}</span>
          ${t.name}
        </td>
        <td class="py-2 text-center font-mono">${t.wins}</td>
        <td class="py-2 text-center font-mono">${t.losses}</td>
        <td class="py-2 text-right">${statusHTML}</td>
      </tr>
    `;
  });

  tbody.innerHTML = tableHTML;

  // Rank = 1 + number of teams with a strictly better record, so ties share a rank
  const panthers = currentStandings.find(t => t.key === 'CAR');
  const panthersRank = 1 + currentStandings.filter(t => t.wins > panthers.wins || (t.wins === panthers.wins && t.losses < panthers.losses)).length;
  const statusBadge = document.getElementById("playoff-status-badge");

  if (panthersRank === 1 && tiedForLead) {
    statusBadge.textContent = "🤝 TIED FOR DIVISION LEAD";
    statusBadge.className = "text-amber-400 font-bold text-sm block";
  } else if (panthersRank === 1) {
    statusBadge.textContent = "🥇 DIVISION LEADERS";
    statusBadge.className = "text-emerald-400 font-bold text-sm block";
  } else if (panthersRank === 2) {
    statusBadge.textContent = "🎟️ WILD CARD CONTENDER";
    statusBadge.className = "text-amber-400 font-bold text-sm block";
  } else {
    statusBadge.textContent = "👀 IN THE HUNT";
    statusBadge.className = "text-panthers-silver font-bold text-sm block";
  }
}
