// Roster tab: draws the player cards and handles the Offense/Defense/Special Teams buttons.

function renderRosterCards() {
  // Keep the filter-button counts and summary line in sync with the data
  const allEntries = Object.values(fullPanthersRoster).flat();
  const coachCount = allEntries.filter(p => p.pos === 'HC').length;
  const playerCount = allEntries.length - coachCount;
  document.getElementById('roster-summary').textContent =
    `${playerCount} players${coachCount ? ' + head coach' : ''} across Offense, Defense, and Special Teams`;

  ['offense', 'defense', 'special'].forEach(group => {
    document.getElementById(`count-${group}`).textContent = fullPanthersRoster[group].length;
    const container = document.getElementById(`${group}-group`);
    let groupHTML = "";

    fullPanthersRoster[group].forEach(p => {
      groupHTML += `
        <div class="bg-panthers-black/70 border border-panthers-cardBorder rounded-lg overflow-hidden hover:border-panthers-blue transition-colors flex flex-col justify-between">
          <div class="flex items-center gap-3 p-3">
            
            <!-- Custom Dynamic Positional Avatar with Player Jersey # -->
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a2536] to-[#0d131d] border-2 border-panthers-blue flex flex-col items-center justify-center shrink-0 shadow-inner">
              <svg class="w-6 h-6 text-panthers-blue/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span class="text-[9px] font-heading font-extrabold text-white leading-none mt-0.5">#${p.num}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[9px] font-heading font-bold text-panthers-blue uppercase tracking-wider bg-panthers-blue/20 px-1.5 py-0.5 rounded border border-panthers-blue/30 leading-none">${p.pos}</span>
                <span class="text-[9px] text-panthers-silver font-mono uppercase leading-none">• ${p.role}</span>
              </div>
              <h3 class="font-heading font-bold text-white text-base mt-1 truncate">${p.name}</h3>
            </div>
          </div>

          <!-- Season Stats Bar -->
          <div class="bg-panthers-black/90 border-t border-panthers-cardBorder p-2 grid grid-cols-3 text-center gap-1">
            <div>
              <span class="text-[8px] text-panthers-silver uppercase font-bold block leading-tight">STAT 1</span>
              <span class="text-xs font-heading font-bold text-emerald-400 truncate block">${p.stat1}</span>
            </div>
            <div>
              <span class="text-[8px] text-panthers-silver uppercase font-bold block leading-tight">STAT 2</span>
              <span class="text-xs font-heading font-bold text-panthers-blue truncate block">${p.stat2}</span>
            </div>
            <div>
              <span class="text-[8px] text-panthers-silver uppercase font-bold block leading-tight">STAT 3</span>
              <span class="text-xs font-heading font-bold text-white truncate block">${p.stat3}</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = groupHTML;
  });
}

function showGroup(groupId, btn) {
  document.getElementById('offense-group').classList.add('hidden');
  document.getElementById('offense-group').classList.remove('grid');
  document.getElementById('defense-group').classList.add('hidden');
  document.getElementById('defense-group').classList.remove('grid');
  document.getElementById('special-group').classList.add('hidden');
  document.getElementById('special-group').classList.remove('grid');

  const target = document.getElementById(groupId + '-group');
  target.classList.remove('hidden');
  target.classList.add('grid');

  const btns = btn.parentElement.querySelectorAll('.depth-btn');
  btns.forEach(b => {
    b.classList.remove('bg-panthers-blue', 'text-white', 'border-panthers-blue');
    b.classList.add('bg-panthers-black/80', 'text-panthers-silver', 'border-panthers-cardBorder');
  });

  btn.classList.add('bg-panthers-blue', 'text-white', 'border-panthers-blue');
  btn.classList.remove('bg-panthers-black/80', 'text-panthers-silver', 'border-panthers-cardBorder');
}
