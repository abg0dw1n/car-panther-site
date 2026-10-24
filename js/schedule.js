// 2026 Schedule tab. The games live in data/schedule.js.

function scheduleBadgeHtml(g) {
  const base = 'px-2 py-0.5 rounded text-[10px] font-heading font-bold border';
  if (g.type === 'win') return `<span class="${base} bg-emerald-950 border-emerald-500 text-emerald-400">${escapeHtml(g.status)}</span>`;
  if (g.type === 'loss') return `<span class="${base} bg-rose-950 border-rose-500 text-rose-400">${escapeHtml(g.status)}</span>`;
  return `<span class="${base} bg-panthers-black border-panthers-cardBorder text-panthers-silver">${escapeHtml(g.status)}</span>`;
}

function renderSchedule(filter = 'all') {
  const container = document.getElementById("schedule-container");
  const next = getNextGame();

  const games = panthers2026Schedule.filter(g => {
    if (filter === 'win') return g.type === 'win';
    if (filter === 'upcoming') return g.status === 'Upcoming';
    return true;
  });

  let rows = '';
  games.forEach(g => {
    const isNext = g === next;
    const when = g.time ? `${g.time}${g.tentative ? '*' : ''}${g.tv ? ' · ' + g.tv : ''}` : '—';
    const nextTag = isNext ? '<span class="ml-2 bg-panthers-blue text-white text-[9px] font-heading font-bold px-1.5 py-0.5 rounded tracking-wider">NEXT</span>' : '';
    rows += `
      <tr class="${isNext ? 'bg-panthers-blue/10' : ''} hover:bg-panthers-blue/5 transition-colors">
        <td class="py-2.5 px-3 font-heading font-bold text-white whitespace-nowrap">Wk ${g.week}</td>
        <td class="py-2.5 px-3 text-panthers-silver">${escapeHtml(g.opp)}${nextTag}</td>
        <td class="py-2.5 px-3 text-panthers-silver whitespace-nowrap">${escapeHtml(g.date)}${g.tentative ? '*' : ''}</td>
        <td class="py-2.5 px-3 text-panthers-silver whitespace-nowrap">${escapeHtml(when)}</td>
        <td class="py-2.5 px-3">${scheduleBadgeHtml(g)}</td>
      </tr>`;
  });

  if (!rows) rows = '<tr><td colspan="5" class="py-4 px-3 text-panthers-silver">No games to show.</td></tr>';

  const hasTentative = panthers2026Schedule.some(g => g.tentative);
  container.innerHTML = `
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-panthers-cardBorder text-panthers-silver font-heading text-xs uppercase tracking-wider">
          <th class="py-2.5 px-3">Week</th>
          <th class="py-2.5 px-3">Opponent</th>
          <th class="py-2.5 px-3">Date</th>
          <th class="py-2.5 px-3">Kickoff (ET) · TV</th>
          <th class="py-2.5 px-3">Result</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-panthers-cardBorder/50 text-xs">${rows}</tbody>
    </table>
    ${hasTentative ? '<p class="text-[10px] text-slate-500 mt-2">* Flex-scheduling window: the NFL can still move the date, time and network.</p>' : ''}`;
}

function filterSchedule(filter, btn) {
  btn.parentElement.querySelectorAll('.sched-btn').forEach(b => {
    b.classList.remove('bg-panthers-blue', 'text-white');
    b.classList.add('bg-panthers-black/80', 'text-panthers-silver');
  });
  btn.classList.add('bg-panthers-blue', 'text-white');
  btn.classList.remove('bg-panthers-black/80', 'text-panthers-silver');
  renderSchedule(filter);
}
