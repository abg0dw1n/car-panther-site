// Arcade tab: pick a game, and it loads in the frame. Games are standalone pages:
// trivia is its own site (my-first-game repo); the others live in games/ in this repo.

const ARCADE_GAMES = {
  trivia: {
    name: 'Panthers Trivia', icon: '❓', tag: '4 modes · daily challenge', url: 'https://my-first-game-opal.vercel.app/', height: 'h-[820px] sm:h-[760px]',
    about: '69 fact-checked questions on team history, legends, the 2026 squad and the stadium.',
    points: [['🏈', 'Classic', '10 questions, 15 seconds each, with 50/50 and Skip.'], ['⚡', 'Blitz', '60 seconds. Rack up as many as you can.'],
             ['💀', 'Sudden Death', 'Gets harder every round. One miss ends it.'], ['📅', 'Daily Challenge', 'Same 5 questions for every fan, once a day.']],
    scoring: 'Every right answer is worth 100, plus up to 50 for speed. Streaks add up to +50%. Ranks run from Practice Squad to Hall of Famer.'
  },
  fieldgoal: {
    name: 'Field Goal Kicker', icon: '🥅', tag: 'Aim · power · wind', url: 'games/field-goal.html', height: 'h-[760px] sm:h-[800px]',
    about: 'Line up kicks at the Bank. Every make backs you up 5 yards, from a 20-yard chip shot to 65-yard bombs.',
    points: [['🎯', 'Aim', 'Tap to stop the swinging arrow.'], ['💪', 'Power', 'Tap again to stop the meter above the NEED line.'],
             ['🌬️', 'Wind', 'Crosswinds get stronger the farther back you go. Aim into it.'], ['🏈', 'Three misses', 'and your day is over. Watch for DOINKs off the upright.']],
    scoring: 'Each make scores its distance in yards. Your best score and longest make are saved on this device.'
  },
  drill: {
    name: 'Two-Minute Drill', icon: '⏱️', tag: 'Call plays · beat the clock', url: 'games/two-minute-drill.html', height: 'h-[980px] sm:h-[900px]',
    about: 'Down late with 2:00 to go. Call every play, read the defense and manage the clock to win it.',
    points: [['📋', 'Play calls', 'HB Dive, Quick Slant, Sideline Out, Go Route, plus a Hail Mary at the end.'], ['🛡️', 'The defense', 'blitzes, plays zone, man or prevent. Quick passes beat the blitz.'],
             ['⏰', 'The clock', 'Incompletions and stepping out of bounds stop it. Spike or use a timeout to save seconds.'], ['🎚️', 'Difficulty', 'Rookie, Pro or All-Pro defenses.']],
    scoring: 'Win with a touchdown (or tie it with a field goal when you’re down 3). Your record and win streak are saved on this device.'
  }
};

let arcadeGame = (() => { try { return localStorage.getItem('arcadeGame') || 'trivia'; } catch { return 'trivia'; } })();
if (!ARCADE_GAMES[arcadeGame]) arcadeGame = 'trivia';

function renderArcadePicker() {
  document.getElementById('arcade-picker').innerHTML = Object.entries(ARCADE_GAMES).map(([id, g]) => `
    <button onclick="selectArcadeGame('${id}')" aria-pressed="${id === arcadeGame}"
      class="text-left rounded-xl border p-3 transition-all ${id === arcadeGame ? 'bg-panthers-blue/20 border-panthers-blue shadow-[0_8px_30px_-12px_rgba(0,133,202,0.8)]' : 'bg-panthers-black/60 border-panthers-cardBorder hover:border-panthers-blue'}">
      <span class="text-2xl">${g.icon}</span>
      <span class="block font-heading font-bold text-white text-lg uppercase tracking-wider leading-tight mt-1">${g.name}</span>
      <span class="block text-[10px] text-panthers-silver">${g.tag}</span>
    </button>`).join('');
}

function renderArcadeInfo() {
  const g = ARCADE_GAMES[arcadeGame];
  document.getElementById('arcade-info').innerHTML = `
    <h3 class="font-heading font-bold text-white text-xl uppercase tracking-wider">${g.icon} ${g.name}</h3>
    <p class="text-panthers-silver text-xs mt-1">${g.about}</p>
    <ul class="mt-3 space-y-2 text-xs">
      ${g.points.map(([icon, title, text]) => `<li class="flex gap-2"><span>${icon}</span><span><strong class="text-white">${title}:</strong> <span class="text-panthers-silver">${text}</span></span></li>`).join('')}
    </ul>
    <p class="text-panthers-silver text-xs mt-3 pt-3 border-t border-panthers-cardBorder">${g.scoring}</p>
    <a href="${g.url}" target="_blank" rel="noopener noreferrer"
       class="mt-4 inline-block bg-panthers-blue hover:bg-panthers-blueHover text-white font-heading font-bold px-4 py-2 rounded-lg text-[11px] uppercase tracking-wider">Play full screen ↗</a>`;
}

// Load (or switch) the game in the frame. Called when the Arcade tab opens and when a game is picked.
function loadArcadeGame() {
  const g = ARCADE_GAMES[arcadeGame];
  const frame = document.getElementById('arcade-frame');
  if (!frame) return;
  frame.className = `w-full block ${g.height}`;
  frame.title = g.name;
  if (frame.getAttribute('src') !== g.url) frame.setAttribute('src', g.url);
}

function selectArcadeGame(id) {
  if (!ARCADE_GAMES[id]) return;
  arcadeGame = id;
  try { localStorage.setItem('arcadeGame', id); } catch { /* ignore */ }
  renderArcadePicker();
  renderArcadeInfo();
  loadArcadeGame();
}

function initArcade() {
  renderArcadePicker();
  renderArcadeInfo();
}
