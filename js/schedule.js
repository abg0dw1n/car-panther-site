// 2026 Schedule tab.

function renderSchedule(filter = 'all') {
  const container = document.getElementById("schedule-container");
  let tableHTML = `
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-panthers-cardBorder text-panthers-silver font-heading text-xs uppercase tracking-wider">
          <th class="py-2.5 px-3">Week</th>
          <th class="py-2.5 px-3">Opponent</th>
          <th class="py-2.5 px-3">Date / Time</th>
          <th class="py-2.5 px-3">Result / Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-panthers-cardBorder/50 text-xs">
  `;

  panthers2026Schedule.forEach(g => {
    if (filter === 'win' && g.type !== 'win') return;

    let badge = `<span class="bg-panthers-black border border-panthers-cardBorder text-panthers-silver px-2 py-0.5 rounded text-[10px] font-heading font-bold">${g.status}</span>`;
    if (g.type === "win") badge = `<span class="bg-emerald-950 border border-emerald-500 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-heading font-bold">${g.status}</span>`;
    if (g.type === "loss") badge = `<span class="bg-rose-950 border border-rose-500 text-rose-400 px-2 py-0.5 rounded text-[10px] font-heading font-bold">${g.status}</span>`;

    tableHTML += `
      <tr class="hover:bg-panthers-blue/5 transition-colors">
        <td class="py-2.5 px-3 font-heading font-bold text-white">${g.week}</td>
        <td class="py-2.5 px-3 text-panthers-silver">${g.opp}</td>
        <td class="py-2.5 px-3 text-panthers-silver">${g.date}</td>
        <td class="py-2.5 px-3">${badge}</td>
      </tr>
    `;
  });

  tableHTML += "</tbody></table>";
  container.innerHTML = tableHTML;
}

function filterSchedule(filter, btn) {
  const btns = btn.parentElement.querySelectorAll('.sched-btn');
  btns.forEach(b => {
    b.classList.remove('bg-panthers-blue', 'text-white');
    b.classList.add('bg-panthers-black/80', 'text-panthers-silver');
  });
  btn.classList.add('bg-panthers-blue', 'text-white');
  btn.classList.remove('bg-panthers-black/80', 'text-panthers-silver');
  renderSchedule(filter);
}
