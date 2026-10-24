// Small helpers shared by every tab.

// ---- Safety --------------------------------------------------------------------------------------------
// Anything typed by a visitor or fetched from an API goes through these before it is shown.

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow http(s) links so a feed can't inject javascript: URLs
function safeUrl(url) {
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? escapeHtml(u.href) : '#';
  } catch (e) {
    return '#';
  }
}

// ---- Team facts, worked out from the schedule data ------------------------------------------------------

// The Panthers' record from every finished game in data/schedule.js
function getRecord() {
  let wins = 0, losses = 0, ties = 0;
  panthers2026Schedule.forEach(g => {
    if (g.type === 'win') wins++;
    else if (g.type === 'loss') losses++;
    else if (/^T\b/.test(g.status)) ties++;
  });
  return { wins, losses, ties };
}

function formatRecord(r, spaced = false) {
  const parts = [r.wins, r.losses].concat(r.ties ? [r.ties] : []);
  return parts.join(spaced ? ' - ' : '-');
}

// The first game that has not been played yet (null once the season is over)
function getNextGame() {
  return panthers2026Schedule.find(g => g.status === 'Upcoming') || null;
}

function ordinal(n) {
  const v = n % 100;
  const suffix = (v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return n + suffix;
}
