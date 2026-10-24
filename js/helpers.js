// Small safety helpers shared by every tab.
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
