// Home tab and header: kickoff countdown, Charlotte weather, ESPN news.

function startCountdown() {
  // Explicit -04:00 offset = Eastern Daylight Time (DST runs until Nov 1, 2026),
  // so this is correct for every visitor regardless of their time zone.
  const targetDate = new Date("2026-10-25T13:00:00-04:00").getTime();
  const pad = n => String(n).padStart(2, '0');
  const setText = (id, value) => { document.getElementById(id).textContent = value; };

  function tick() {
    const diff = Math.max(0, targetDate - Date.now());

    setText("cd-days", pad(Math.floor(diff / 86400000)));
    setText("cd-hours", pad(Math.floor((diff % 86400000) / 3600000)));
    setText("cd-mins", pad(Math.floor((diff % 3600000) / 60000)));
    setText("cd-secs", pad(Math.floor((diff % 60000) / 1000)));
  }

  tick(); // render immediately instead of showing 00:00:00:00 for the first second
  setInterval(tick, 1000);
}

async function fetchCharlotteWeather() {
  try {
    const lat = 35.2258;
    const lon = -80.8528;
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`);
    const data = await response.json();
    
    if (data && data.current_weather) {
      const temp = Math.round(data.current_weather.temperature);
      const wind = Math.round(data.current_weather.windspeed);
      
      document.getElementById('charlotte-weather').innerHTML = `
        <span class="text-panthers-silver uppercase font-semibold text-[9px] tracking-widest">Charlotte Weather</span>
        <span class="text-amber-400 font-bold font-heading text-xs leading-none">🌤️ ${temp}°F • Wind ${wind}mph</span>
      `;
    }
  } catch (err) {
    document.getElementById('charlotte-weather').innerHTML = `
      <span class="text-panthers-silver uppercase font-semibold text-[9px] tracking-widest">Charlotte Weather</span>
      <span class="text-panthers-blue font-bold font-heading text-xs leading-none">72°F • Clear</span>
    `;
  }
}

async function fetchPanthersNews() {
  const container = document.getElementById('espn-news-container');
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.espn.com%2Fespn%2Frss%2Fnfl%2Fnews');
    const data = await response.json();

    if (data && data.items && data.items.length > 0) {
      const panthersNews = data.items.filter(item => 
        item.title.toLowerCase().includes('panthers') || 
        item.description.toLowerCase().includes('panthers') ||
        item.description.toLowerCase().includes('carolina')
      );

      const articlesToDisplay = panthersNews.length > 0 ? panthersNews.slice(0, 3) : data.items.slice(0, 3);

      let newsHTML = '';
      articlesToDisplay.forEach(article => {
        const cleanDesc = article.description ? article.description.replace(/<[^>]*>?/gm, '') : '';
        const link = safeUrl(article.link);
        newsHTML += `
          <div class="bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg flex flex-col justify-between hover:border-panthers-blue transition-colors">
            <div>
              <h3 class="font-heading font-bold text-white text-sm mb-1">
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="hover:text-panthers-blue hover:underline transition-colors">${escapeHtml(article.title)}</a>
              </h3>
              <p class="text-panthers-silver text-xs line-clamp-2">${escapeHtml(cleanDesc)}</p>
            </div>
            <div class="mt-2 pt-1.5 border-t border-panthers-cardBorder/40 flex justify-between items-center text-[10px]">
              <span class="text-panthers-silver">Source: ESPN Feed</span>
              <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-panthers-blue font-heading font-bold uppercase tracking-wider hover:underline">Read Story ↗</a>
            </div>
          </div>
        `;
      });
      container.innerHTML = newsHTML;
    } else {
      showFallbackNews(container);
    }
  } catch (err) {
    showFallbackNews(container);
  }
}

function showFallbackNews(container) {
  container.innerHTML = `
    <div class="bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg">
      <h3 class="font-heading font-bold text-white text-sm mb-0.5">
        <a href="https://www.espn.com/nfl/team/_/name/car/carolina-panthers" target="_blank" class="hover:text-panthers-blue hover:underline">Panthers Gear Up for NFC South Matchups</a>
      </h3>
      <p class="text-panthers-silver text-xs">Dave Canales and Bryce Young continue building rhythm on offense as division competition intensifies.</p>
    </div>
    <div class="bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg">
      <h3 class="font-heading font-bold text-white text-sm mb-0.5">
        <a href="https://www.espn.com/nfl/team/_/name/car/carolina-panthers" target="_blank" class="hover:text-panthers-blue hover:underline">Keep Pounding Defense Showing Grit</a>
      </h3>
      <p class="text-panthers-silver text-xs">Derrick Brown and Jaycee Horn leading the physical defensive effort in Uptown Charlotte.</p>
    </div>
  `;
}
