// Header and Home tab: team record, next-game banner and countdown, Charlotte weather, ESPN news.

// ---- Record and next game (both come from data/schedule.js) ---------------------------------------------

function renderTeamRecord() {
  const record = getRecord();
  document.getElementById('team-record').textContent = formatRecord(record, true);
  document.getElementById('schedule-record').textContent = formatRecord(record).replace('-', '–');
}

function renderNextGame() {
  const g = getNextGame();
  const label = document.getElementById('next-game-label');
  const title = document.getElementById('next-game-title');
  const details = document.getElementById('next-game-details');

  if (!g) {
    label.textContent = 'SEASON COMPLETE';
    title.textContent = 'THANKS FOR A GREAT SEASON, KEEP POUNDING!';
    details.textContent = '';
    return;
  }

  const day = new Date(g.kickoff).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/New_York' });
  const place = g.home ? 'Bank of America Stadium, Charlotte NC' : 'Away game';
  const time = g.tentative ? `${g.time} (tentative)` : g.time;
  const tv = g.tv && g.tv !== 'TBD' ? ` (${g.tv})` : '';

  label.textContent = `NEXT MATCHUP • WEEK ${g.week}`;
  title.textContent = `CAROLINA PANTHERS ${g.home ? 'VS.' : 'AT'} ${g.team.toUpperCase()}`;
  details.textContent = `📍 ${place} • ${day} • ${time}${tv}`;
}

// ---- Countdown to the next game's kickoff ---------------------------------------------------------------

function startCountdown() {
  const next = getNextGame();
  const target = next ? new Date(next.kickoff).getTime() : 0;
  const pad = n => String(n).padStart(2, '0');
  const setText = (id, value) => { document.getElementById(id).textContent = value; };

  function tick() {
    const diff = Math.max(0, target - Date.now());
    setText("cd-days", pad(Math.floor(diff / 86400000)));
    setText("cd-hours", pad(Math.floor((diff % 86400000) / 3600000)));
    setText("cd-mins", pad(Math.floor((diff % 3600000) / 60000)));
    setText("cd-secs", pad(Math.floor((diff % 60000) / 1000)));
  }

  tick(); // render immediately instead of showing 00:00:00:00 for the first second
  setInterval(tick, 1000);
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
    <div class="bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg">
      <p class="text-panthers-silver text-xs">Live headlines couldn't be loaded right now.
        <a href="https://www.espn.com/nfl/team/_/name/car/carolina-panthers" target="_blank" rel="noopener noreferrer" class="text-panthers-blue font-heading font-bold hover:underline">See the latest Panthers news on ESPN ↗</a>
      </p>
    </div>`;
}
