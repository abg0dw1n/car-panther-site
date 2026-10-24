// Stadium Tour tab: interactive map + guided walkthrough, 3D-style seat view, game-day planner,
// bag checker and facts. All the content comes from data/stadium.js.

const stadiumUI = { panel: 'map', layers: { gates: true, fun: true, access: true, help: true }, pin: null, tour: -1,
                    zone: 'home', level: '100', plan: { game: 0, transport: 'drive', goal: 'early' } };

const FIELD_HALF_LENGTH = 60; // yards, goal line to goal line plus both end zones
const FIELD_HALF_WIDTH = 26.65;

function srcBadgeHtml(src) {
  const s = SRC_LABELS[src] || SRC_LABELS.approx;
  return `<span class="text-[9px] font-bold uppercase tracking-wider border rounded px-1.5 py-0.5 ${s.tone}">${s.text}</span>`;
}

// ---- Sub-navigation ------------------------------------------------------------------------------------

function showStadiumPanel(panelId, btn) {
  stadiumUI.panel = panelId;
  ['map', 'seat', 'plan', 'rules', 'facts'].forEach(id => {
    document.getElementById('stadium-panel-' + id).classList.toggle('hidden', id !== panelId);
  });
  document.querySelectorAll('.stadium-sub').forEach(b => {
    const on = b === btn;
    b.classList.toggle('bg-panthers-blue', on);
    b.classList.toggle('text-white', on);
    b.classList.toggle('text-panthers-silver', !on);
  });
  if (panelId === 'seat') drawSeatView(); // the canvas can only be drawn once visible
}

// ---- Interactive map -----------------------------------------------------------------------------------

function layerColor(layerId) {
  const l = MAP_LAYERS.find(x => x.id === layerId);
  return l ? l.color : '#0085CA';
}

function renderLayerChips() {
  document.getElementById('map-layer-chips').innerHTML = MAP_LAYERS.map(l => {
    const on = stadiumUI.layers[l.id];
    return `<button onclick="toggleMapLayer('${l.id}')" aria-pressed="${on}"
      class="text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${on ? 'text-white' : 'text-slate-500 border-panthers-cardBorder opacity-60'}"
      style="${on ? `border-color:${l.color};background:${l.color}33` : ''}">
      <span style="color:${l.color}">●</span> ${l.label}</button>`;
  }).join('');
}

function toggleMapLayer(layerId) {
  stadiumUI.layers[layerId] = !stadiumUI.layers[layerId];
  const pin = STADIUM_PINS.find(p => p.id === stadiumUI.pin);
  if (pin && !stadiumUI.layers[pin.layer]) stadiumUI.pin = null;
  renderLayerChips();
  renderStadiumMap();
  renderPinDetail();
}

function renderStadiumMap() {
  const pins = STADIUM_PINS.filter(p => stadiumUI.layers[p.layer]).map(p => {
    const selected = p.id === stadiumUI.pin;
    const color = layerColor(p.layer);
    const label = p.icon.length <= 1 ? `font-size="13" font-weight="700" fill="#fff"` : `font-size="13"`;
    return `<g class="cursor-pointer" onclick="selectPin('${p.id}')" role="button" tabindex="0" aria-label="${escapeHtml(p.name)}"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPin('${p.id}')}">
      ${selected ? `<circle cx="${p.x}" cy="${p.y}" r="24" fill="none" stroke="#fff" stroke-width="2" opacity="0.9"><animate attributeName="r" values="18;26;18" dur="1.6s" repeatCount="indefinite"/></circle>` : ''}
      <circle cx="${p.x}" cy="${p.y}" r="15" fill="${color}" stroke="${selected ? '#fff' : '#0B0E14'}" stroke-width="2.5"/>
      <text x="${p.x}" y="${p.y + 4.5}" text-anchor="middle" ${label}>${escapeHtml(p.icon)}</text>
      <text x="${p.x}" y="${p.y + 28}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${selected ? '#fff' : '#9fb0c4'}" paint-order="stroke" stroke="#0d1520" stroke-width="3">${escapeHtml(p.tag || p.name)}</text>
    </g>`;
  }).join('');

  document.getElementById('stadium-map').innerHTML = `
    <svg viewBox="0 0 780 500" class="w-full h-auto rounded-lg bg-[#0d1520] border border-panthers-cardBorder" role="img"
         aria-label="Schematic map of Bank of America Stadium and its gates, parking, transit and fan zones">
      <rect width="780" height="500" fill="#0d1520"/>
      <!-- streets (schematic) -->
      <rect x="560" y="0" width="26" height="500" fill="#16202e"/>
      <rect x="0" y="470" width="780" height="22" fill="#16202e"/>
      <text x="573" y="140" fill="#4b5d73" font-size="11" text-anchor="middle" transform="rotate(-90 573 140)" letter-spacing="3">MINT ST</text>
      <text x="120" y="486" fill="#4b5d73" font-size="11" letter-spacing="3">MOREHEAD ST</text>
      <!-- rail corridor -->
      <rect x="715" y="0" width="6" height="500" fill="#1f3a2d"/>
      <text x="745" y="250" fill="#3f7a5a" font-size="10" text-anchor="middle" transform="rotate(-90 745 250)" letter-spacing="3">LYNX BLUE LINE (approx.)</text>
      <!-- bowl -->
      <rect x="230" y="75" width="320" height="380" rx="120" fill="#16263a" stroke="#0085CA" stroke-width="3"/>
      <rect x="258" y="100" width="264" height="330" rx="96" fill="#10202f" stroke="#2a4a68" stroke-width="2"/>
      <rect x="305" y="140" width="170" height="250" rx="6" fill="#166534"/>
      <rect x="305" y="140" width="170" height="40" fill="#0085CA" opacity="0.85"/>
      <rect x="305" y="350" width="170" height="40" fill="#0085CA" opacity="0.85"/>
      ${[200, 230, 260, 290, 320].map(y => `<line x1="305" x2="475" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity="0.35"/>`).join('')}
      <text x="390" y="266" fill="#fff" fill-opacity="0.55" font-size="12" text-anchor="middle" letter-spacing="3">FIELD</text>
      <text x="270" y="262" fill="#7a8aa0" font-size="10" text-anchor="middle" transform="rotate(-90 270 262)" letter-spacing="2">PANTHERS SIDELINE</text>
      <text x="512" y="262" fill="#7a8aa0" font-size="10" text-anchor="middle" transform="rotate(90 512 262)" letter-spacing="2">VISITORS SIDELINE</text>
      <!-- compass -->
      <g transform="translate(60 60)"><circle r="22" fill="none" stroke="#2a4a68"/><path d="M0 -17 L5 3 L0 -1 L-5 3 Z" fill="#0085CA"/><text y="-26" fill="#A5ACAF" font-size="11" text-anchor="middle">N</text></g>
      <text x="20" y="440" fill="#4b5d73" font-size="10">Schematic: not to scale.</text>
      <text x="20" y="455" fill="#4b5d73" font-size="10">Pin positions are approximate.</text>
      ${pins}
    </svg>`;
}

function selectPin(pinId) {
  const pin = STADIUM_PINS.find(p => p.id === pinId);
  if (!pin) return;
  stadiumUI.layers[pin.layer] = true;
  stadiumUI.pin = pinId;
  renderLayerChips();
  renderStadiumMap();
  renderPinDetail();
}

function renderPinDetail() {
  const box = document.getElementById('stadium-pin-detail');
  const pin = STADIUM_PINS.find(p => p.id === stadiumUI.pin);
  if (!pin) {
    box.innerHTML = `<p class="text-panthers-silver text-xs">Tap any pin on the map to see what it is, how it works and when it opens. Use the filters to show only gates, fan zones, ways to get there, or services.</p>
      <ul class="mt-3 grid grid-cols-2 gap-1.5">
        ${STADIUM_PINS.filter(p => stadiumUI.layers[p.layer]).map(p => `<li><button onclick="selectPin('${p.id}')" class="w-full text-left text-[11px] text-panthers-silver hover:text-white bg-panthers-black/50 border border-panthers-cardBorder hover:border-panthers-blue rounded px-2 py-1 truncate">${escapeHtml(p.name)}</button></li>`).join('')}
      </ul>`;
    return;
  }
  const layer = MAP_LAYERS.find(l => l.id === pin.layer);
  box.innerHTML = `
    <div class="flex items-start justify-between gap-2">
      <div>
        <span class="text-[9px] uppercase tracking-widest font-bold" style="color:${layerColor(pin.layer)}">${escapeHtml(layer.label)}</span>
        <h3 class="font-heading font-bold text-white text-lg leading-tight">${escapeHtml(pin.name)}</h3>
      </div>
      <button onclick="clearPin()" class="text-panthers-silver hover:text-white text-xs" aria-label="Close details">✕</button>
    </div>
    <div class="mt-1">${srcBadgeHtml(pin.src)}</div>
    <p class="text-white text-xs mt-2">${escapeHtml(pin.summary)}</p>
    <ul class="mt-2 space-y-1.5">
      ${pin.details.map(d => `<li class="text-panthers-silver text-xs flex gap-1.5"><span class="text-panthers-blue">▸</span><span>${escapeHtml(d)}</span></li>`).join('')}
    </ul>`;
}

function clearPin() { stadiumUI.pin = null; renderStadiumMap(); renderPinDetail(); }

// ---- Guided walkthrough --------------------------------------------------------------------------------

function renderTour() {
  const box = document.getElementById('tour-box');
  const btn = document.getElementById('tour-start-btn');
  if (stadiumUI.tour < 0) {
    box.classList.add('hidden');
    btn.textContent = '▶ Start guided walkthrough';
    return;
  }
  const step = STADIUM_TOUR[stadiumUI.tour];
  const pin = STADIUM_PINS.find(p => p.id === step.pin);
  btn.textContent = '■ End walkthrough';
  box.classList.remove('hidden');
  document.getElementById('tour-count').textContent = `Stop ${stadiumUI.tour + 1} of ${STADIUM_TOUR.length}`;
  document.getElementById('tour-title').textContent = pin.name;
  document.getElementById('tour-text').textContent = step.text;
  document.getElementById('tour-prev').disabled = stadiumUI.tour === 0;
  document.getElementById('tour-next').textContent = stadiumUI.tour === STADIUM_TOUR.length - 1 ? 'Finish ✓' : 'Next ▶';
}

function toggleTour() {
  if (stadiumUI.tour >= 0) { stopTour(); return; }
  MAP_LAYERS.forEach(l => { stadiumUI.layers[l.id] = true; });
  stadiumUI.tour = 0;
  renderLayerChips();
  tourGoto();
}

function tourGoto() {
  selectPin(STADIUM_TOUR[stadiumUI.tour].pin);
  renderTour();
}

function tourStep(delta) {
  if (stadiumUI.tour < 0) return;
  const next = stadiumUI.tour + delta;
  if (next >= STADIUM_TOUR.length) { stopTour(); return; }
  if (next < 0) return;
  stadiumUI.tour = next;
  tourGoto();
}

function stopTour() { stadiumUI.tour = -1; renderTour(); }

// ---- Seat view simulator (a simple 3D perspective drawn on a canvas) ------------------------------------

function zoneById(id) { return STADIUM_ZONES.find(z => z.id === id) || STADIUM_ZONES[0]; }
function levelById(id) { return STADIUM_LEVELS.find(l => l.id === id) || STADIUM_LEVELS[0]; }

// Camera position (yards) for a zone and level. x runs along the field, z across it, y is up.
function seatCamera(zoneId, levelId) {
  const zone = zoneById(zoneId), level = levelById(levelId);
  const { x: dx, z: dz } = zone.cam;
  const corner = dx !== 0 && dz !== 0;
  const back = corner ? level.back * 0.75 : level.back;
  return {
    x: dx * (FIELD_HALF_LENGTH + (dx !== 0 ? back : 0)),
    y: level.height,
    z: dz * (FIELD_HALF_WIDTH + (dz !== 0 ? back : 0))
  };
}

// A tier is a sloped ring around the field, split into 4 trapezoids and cut into rows of seats.
const SEAT_TIERS = [
  { off0: 8, h0: 0.5, off1: 34, h1: 20, rows: 8, colors: ['#1b4a73', '#215783'] },   // 100 level
  { off0: 38, h0: 26, off1: 50, h1: 34, rows: 4, colors: ['#2c3e50', '#34495e'] },   // 300 club
  { off0: 54, h0: 38, off1: 84, h1: 72, rows: 10, colors: ['#18222f', '#1e2b3a'] }   // 500 upper
];

function tierPolygons(tier) {
  const polys = [];
  const corners = (off, h) => {
    const ax = FIELD_HALF_LENGTH + off, az = FIELD_HALF_WIDTH + off;
    return [[ax, h, az], [ax, h, -az], [-ax, h, -az], [-ax, h, az]]; // x-end(+z), x-end(-z), -x end(-z), -x end(+z)
  };
  for (let r = 0; r < tier.rows; r++) {
    const t0 = r / tier.rows, t1 = (r + 1) / tier.rows;
    const a = corners(tier.off0 + (tier.off1 - tier.off0) * t0, tier.h0 + (tier.h1 - tier.h0) * t0);
    const b = corners(tier.off0 + (tier.off1 - tier.off0) * t1, tier.h0 + (tier.h1 - tier.h0) * t1);
    const color = tier.colors[r % 2];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      polys.push({ pts: [a[i], a[j], b[j], b[i]], color, kind: 'stand' });
    }
  }
  return polys;
}

function fieldPolygons() {
  const polys = [];
  const hz = FIELD_HALF_WIDTH;
  // the turf apron around the field, out to the first row of seats
  const ax = FIELD_HALF_LENGTH + 8, az = hz + 8;
  polys.push({ pts: [[-ax, 0, -az], [ax, 0, -az], [ax, 0, az], [-ax, 0, az]], color: '#14532d', kind: 'field' });
  // grass (striped every 5 yards) and end zones
  for (let x = -50; x < 50; x += 5) {
    polys.push({ pts: [[x, 0, -hz], [x + 5, 0, -hz], [x + 5, 0, hz], [x, 0, hz]], color: ((x + 50) / 5) % 2 ? '#15803d' : '#166534', kind: 'field' });
  }
  [[-60, -50], [50, 60]].forEach(([x0, x1]) => polys.push({ pts: [[x0, 0, -hz], [x1, 0, -hz], [x1, 0, hz], [x0, 0, hz]], color: '#0a6fa8', kind: 'field' }));
  // border of the field and yard lines
  const lines = [];
  for (let x = -50; x <= 50; x += 5) lines.push({ a: [x, 0.02, -hz], b: [x, 0.02, hz], w: x === 0 ? 2 : 1 });
  lines.push({ a: [-60, 0.02, -hz], b: [60, 0.02, -hz], w: 2 }, { a: [-60, 0.02, hz], b: [60, 0.02, hz], w: 2 });
  lines.push({ a: [-60, 0.02, -hz], b: [-60, 0.02, hz], w: 2 }, { a: [60, 0.02, -hz], b: [60, 0.02, hz], w: 2 });
  return { polys, lines };
}

function goalpostLines() {
  const L = [];
  [-60, 60].forEach(x => {
    L.push({ a: [x, 0, 0], b: [x, 3.3, 0] });
    L.push({ a: [x, 3.3, -3.1], b: [x, 3.3, 3.1] });
    L.push({ a: [x, 3.3, -3.1], b: [x, 10, -3.1] });
    L.push({ a: [x, 3.3, 3.1], b: [x, 10, 3.1] });
  });
  return L;
}

// Build a camera basis that looks from `cam` toward the middle of the field
function cameraBasis(cam, target = [0, 0, 0]) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = v => { const l = Math.hypot(...v) || 1; return v.map(c => c / l); };
  const forward = norm(sub(target, [cam.x, cam.y, cam.z]));
  const right = norm(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  return { forward, right, up };
}

function toCamera(p, cam, basis) {
  const v = [p[0] - cam.x, p[1] - cam.y, p[2] - cam.z];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return [dot(v, basis.right), dot(v, basis.up), dot(v, basis.forward)];
}

// Clip a polygon (in camera space) to the plane z >= near so near-side seating doesn't wrap around the viewer
function clipNear(pts, near = 0.5) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const ain = a[2] >= near, bin = b[2] >= near;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (near - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]);
    }
  }
  return out;
}

function projectPoint(pc, W, H, focal) {
  return [W / 2 + focal * pc[0] / pc[2], H / 2 - focal * pc[1] / pc[2]];
}

// Returns the list of 2D shapes to paint, back to front. Pure function (easy to test).
function buildSeatScene(zoneId, levelId, W = 720, H = 380) {
  const cam = seatCamera(zoneId, levelId);
  const basis = cameraBasis(cam, [0, 0, 0]);
  const focal = (W / 2) / Math.tan((72 / 2) * Math.PI / 180);
  const field = fieldPolygons();

  const shape = (poly, order) => {
    const cpts = clipNear(poly.pts.map(p => toCamera(p, cam, basis)));
    if (cpts.length < 3) return null;
    const depth = cpts.reduce((s, p) => s + p[2], 0) / cpts.length;
    return { color: poly.color, kind: poly.kind, depth, order, pts: cpts.map(p => projectPoint(p, W, H, focal)) };
  };

  const fieldShapes = field.polys.map(p => shape(p, 0)).filter(Boolean);
  const stands = SEAT_TIERS.flatMap(t => tierPolygons(t)).map(p => shape(p, 1)).filter(Boolean).sort((a, b) => b.depth - a.depth);

  const lineShape = (l, color, w) => {
    const a = toCamera(l.a, cam, basis), b = toCamera(l.b, cam, basis);
    if (a[2] < 0.5 && b[2] < 0.5) return null;
    const c = clipNear([a, b, b], 0.5); // reuse the clipper on a degenerate polygon
    if (c.length < 2) return null;
    return { a: projectPoint(c[0], W, H, focal), b: projectPoint(c[1], W, H, focal), color, w: w || l.w || 1 };
  };
  const lines = field.lines.map(l => lineShape(l, 'rgba(255,255,255,0.75)')).filter(Boolean);
  const posts = goalpostLines().map(l => lineShape(l, '#facc15', 2.5)).filter(Boolean);
  return { cam, fieldShapes, stands, lines, posts };
}

function drawSeatView() {
  const canvas = document.getElementById('seat-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const scene = buildSeatScene(stadiumUI.zone, stadiumUI.level, W, H);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0b1a2d');
  sky.addColorStop(1, '#25405f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const paint = s => {
    ctx.beginPath();
    s.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
  };
  scene.fieldShapes.forEach(paint);
  scene.lines.forEach(l => { ctx.beginPath(); ctx.moveTo(l.a[0], l.a[1]); ctx.lineTo(l.b[0], l.b[1]); ctx.strokeStyle = l.color; ctx.lineWidth = l.w; ctx.stroke(); });
  scene.stands.forEach((s, i) => {
    paint(s);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    crowdSpecks(ctx, s, i);
  });
  scene.posts.forEach(l => { ctx.beginPath(); ctx.moveTo(l.a[0], l.a[1]); ctx.lineTo(l.b[0], l.b[1]); ctx.strokeStyle = l.color; ctx.lineWidth = l.w; ctx.stroke(); });
}

// Sprinkle fans in Panthers colors over a stand shape. Deterministic, so the picture doesn't flicker.
const CROWD_COLORS = ['#0085CA', '#0085CA', '#ffffff', '#A5ACAF', '#101820'];
function crowdSpecks(ctx, shape, seed) {
  const [a, b, c, d] = shape.pts;
  if (!d) return;
  const area = Math.abs((c[0] - a[0]) * (d[1] - b[1]) - (d[0] - b[0]) * (c[1] - a[1])) / 2;
  const count = Math.min(160, Math.floor(area / 90));
  let r = (seed + 1) * 9301;
  const rand = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  const size = Math.max(1, Math.min(3, Math.sqrt(area) / 60));
  for (let k = 0; k < count; k++) {
    const u = rand(), v = rand();
    const x = (1 - v) * ((1 - u) * a[0] + u * b[0]) + v * ((1 - u) * d[0] + u * c[0]);
    const y = (1 - v) * ((1 - u) * a[1] + u * b[1]) + v * ((1 - u) * d[1] + u * c[1]);
    ctx.fillStyle = CROWD_COLORS[k % CROWD_COLORS.length];
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function renderSeatInfo() {
  const zone = zoneById(stadiumUI.zone), level = levelById(stadiumUI.level);
  document.getElementById('seat-info').innerHTML = `
    <div class="flex flex-wrap items-center gap-2">
      <h3 class="font-heading font-bold text-white text-lg">${escapeHtml(zone.name)} · ${escapeHtml(level.name)}</h3>
      ${srcBadgeHtml(zone.src)}
    </div>
    <p class="text-xs mt-1"><span class="font-bold ${/Sunny|Mostly sunny/.test(zone.sun) ? 'text-amber-400' : /Shaded|Mostly shaded/.test(zone.sun) ? 'text-sky-300' : 'text-panthers-silver'}">☀ ${escapeHtml(zone.sun)}</span>
      <span class="text-panthers-silver"> · ${escapeHtml(level.short)}</span></p>
    <p class="text-panthers-silver text-xs mt-2">${escapeHtml(zone.text)}</p>
    <p class="text-panthers-silver text-xs mt-1">${escapeHtml(level.text)}</p>`;

  document.getElementById('seat-level-btns').innerHTML = STADIUM_LEVELS.map(l => `
    <button onclick="setSeatLevel('${l.id}')" aria-pressed="${l.id === stadiumUI.level}"
      class="text-[11px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-colors ${l.id === stadiumUI.level ? 'bg-panthers-blue border-panthers-blue text-white' : 'bg-panthers-black border-panthers-cardBorder text-panthers-silver hover:text-white'}">
      ${escapeHtml(l.name)}<span class="block text-[9px] font-body normal-case tracking-normal opacity-80">${escapeHtml(l.short)}</span></button>`).join('');

  renderBowlMap();
}

// The clickable bowl: a 3x3 grid around the field
function renderBowlMap() {
  const cells = [
    { id: 'corner-nw', x: 10, y: 10, w: 60, h: 70 }, { id: 'north', x: 70, y: 10, w: 100, h: 70 }, { id: 'corner-ne', x: 170, y: 10, w: 60, h: 70 },
    { id: 'home', x: 10, y: 80, w: 60, h: 160 },      { id: null,    x: 70, y: 80, w: 100, h: 160 }, { id: 'visitors', x: 170, y: 80, w: 60, h: 160 },
    { id: 'corner-sw', x: 10, y: 240, w: 60, h: 70 }, { id: 'south', x: 70, y: 240, w: 100, h: 70 }, { id: 'corner-se', x: 170, y: 240, w: 60, h: 70 }
  ];
  const body = cells.map(c => {
    if (!c.id) return `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#166534"/><rect x="${c.x}" y="${c.y}" width="${c.w}" height="22" fill="#0085CA" opacity="0.8"/><rect x="${c.x}" y="${c.y + c.h - 22}" width="${c.w}" height="22" fill="#0085CA" opacity="0.8"/>`;
    const z = zoneById(c.id);
    const on = c.id === stadiumUI.zone;
    return `<g class="cursor-pointer" onclick="setSeatZone('${c.id}')" role="button" tabindex="0" aria-label="${escapeHtml(z.name)}"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setSeatZone('${c.id}')}">
      <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${on ? '#0085CA' : '#1b2c40'}" stroke="#0B0E14" stroke-width="2"><title>${escapeHtml(z.name)}</title></rect>
      <text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + 3}" text-anchor="middle" fill="${on ? '#fff' : '#9fb0c4'}" font-size="9" font-weight="700">${escapeHtml(z.short)}</text></g>`;
  }).join('');
  document.getElementById('bowl-map').innerHTML = `<svg viewBox="0 0 240 320" class="w-full max-w-[220px] mx-auto" role="group" aria-label="Choose a seating area">${body}</svg>`;
}

function setSeatZone(id) { stadiumUI.zone = zoneById(id).id; renderSeatInfo(); drawSeatView(); }
function setSeatLevel(id) { stadiumUI.level = levelById(id).id; renderSeatInfo(); drawSeatView(); }

// Look up a section number
function lookupSection(value) {
  const n = parseInt(value, 10);
  if (!Number.isInteger(n) || n < 100 || n > 599) return { ok: false, text: 'Enter a section number from 100 to 599.' };
  const levelNo = Math.floor(n / 100);
  const names = { 1: '100 level: the lower bowl', 2: '200 level: end-zone seating', 3: '300 level: club level on the sidelines', 4: '400 level: suites and the press box', 5: '500 level: the upper deck' };
  const range = SHADE_RANGES.find(r => n >= r.from && n <= r.to);
  const sun = range
    ? `${range.label} (estimate for a 4 p.m. game from a fan site; not official).`
    : 'No sun/shade estimate for this section.';
  const note = levelNo === 4 ? ' Suites are sold privately, so sections here are not general seating.' : '';
  return { ok: true, level: levelNo, text: `${names[levelNo]}.${note} ${sun}` };
}

function onSectionInput(value) {
  const box = document.getElementById('section-result');
  if (!String(value).trim()) { box.textContent = ''; return; }
  const r = lookupSection(value);
  box.className = 'text-xs mt-2 ' + (r.ok ? 'text-panthers-silver' : 'text-amber-400');
  box.textContent = r.text;
}

// ---- Game day planner ----------------------------------------------------------------------------------

function homeGames() { return panthers2026Schedule.filter(g => g.home && g.kickoff); }

function planTime(kickoffIso, minutes) {
  return new Date(Date.parse(kickoffIso) + minutes * 60000)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET';
}

// The timeline for a game, transport choice and arrival goal. Pure; used by the page and by tests.
function buildPlan(game, transport, goalId) {
  const goal = ARRIVAL_GOALS.find(g => g.id === goalId) || ARRIVAL_GOALS[0];
  const steps = GAMEDAY_STEPS.filter(s => !s.mode || s.mode === transport).map(s => ({ min: s.min, text: s.text, src: s.src, key: !!s.key }));
  steps.push({ min: goal.offset, text: `Your goal: be at the security line (${goal.label.toLowerCase()}).`, src: 'approx', mine: true });
  steps.sort((a, b) => a.min - b.min);
  return steps.map(s => ({ ...s, time: planTime(game.kickoff, s.min) }));
}

function renderPlanner() {
  const games = homeGames();
  const sel = document.getElementById('plan-game');
  const next = getNextGame();
  if (sel.dataset.ready !== '1') {
    sel.innerHTML = games.map((g, i) => `<option value="${i}">Wk ${g.week} · ${escapeHtml(g.opp)}</option>`).join('');
    const nextIdx = next ? games.findIndex(g => g.week >= next.week) : 0;
    stadiumUI.plan.game = Math.max(0, nextIdx);
    sel.value = String(stadiumUI.plan.game);
    sel.dataset.ready = '1';
  }
  const game = games[stadiumUI.plan.game] || games[0];
  const p = stadiumUI.plan;

  document.getElementById('plan-transport').innerHTML = Object.keys(TRANSPORT_TIPS).map(id => `
    <button onclick="setPlanTransport('${id}')" aria-pressed="${id === p.transport}"
      class="text-[11px] font-heading font-bold px-2.5 py-1.5 rounded border transition-colors ${id === p.transport ? 'bg-panthers-blue border-panthers-blue text-white' : 'bg-panthers-black border-panthers-cardBorder text-panthers-silver hover:text-white'}">${TRANSPORT_TIPS[id].label}</button>`).join('');

  document.getElementById('plan-goal').innerHTML = ARRIVAL_GOALS.map(g => `<option value="${g.id}" ${g.id === p.goal ? 'selected' : ''}>${g.label}</option>`).join('');

  const when = new Date(game.kickoff).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
  document.getElementById('plan-heading').textContent = `${when} · Panthers ${game.opp} · kickoff ${planTime(game.kickoff, 0)}${game.tentative ? ' (tentative, could be flexed)' : ''}`;

  document.getElementById('plan-timeline').innerHTML = buildPlan(game, p.transport, p.goal).map(s => `
    <li class="flex gap-3 items-start ${s.mine ? 'bg-panthers-blue/15 border border-panthers-blue/50 rounded-lg p-2' : ''}">
      <span class="w-20 shrink-0 font-heading font-bold text-sm ${s.key ? 'text-amber-400' : 'text-panthers-blue'}">${escapeHtml(s.time.replace(' ET', ''))}</span>
      <span class="text-xs ${s.key ? 'text-white font-bold' : 'text-panthers-silver'}">${escapeHtml(s.text)}</span>
    </li>`).join('');

  document.getElementById('plan-tips').innerHTML = TRANSPORT_TIPS[p.transport].tips
    .map(t => `<li class="text-xs text-panthers-silver flex gap-1.5"><span class="text-panthers-blue">▸</span><span>${escapeHtml(t)}</span></li>`).join('');
}

// Jump from the Home tab straight to the planner for a given week
function openStadiumPlanner(week) {
  openTabByNav('stadium-tab');
  showStadiumPanel('plan', document.querySelectorAll('.stadium-sub')[2]);
  renderPlanner();
  const idx = homeGames().findIndex(g => g.week === week);
  if (idx >= 0) { document.getElementById('plan-game').value = String(idx); setPlanGame(idx); }
}

function setPlanGame(v) { stadiumUI.plan.game = parseInt(v, 10) || 0; renderPlanner(); }
function setPlanTransport(id) { if (TRANSPORT_TIPS[id]) { stadiumUI.plan.transport = id; renderPlanner(); } }
function setPlanGoal(id) { stadiumUI.plan.goal = id; renderPlanner(); }

// ---- Bag checker & rules ---------------------------------------------------------------------------------

function evaluateBag(type, l, w, h, isClear) {
  const rule = BAG_RULES[type];
  if (!rule) return { ok: false, messages: ['Pick a bag type.'] };
  const messages = [];
  let ok = true;
  if (rule.needsClear && !isClear) { ok = false; messages.push('The bag must be clear plastic, vinyl or PVC.'); }
  if (rule.max) {
    const dims = [l, w, h].map(Number);
    const needed = type === 'clutch' ? 2 : 3;
    if (dims.slice(0, needed).some(d => !(d > 0))) return { ok: false, messages: ['Enter the bag size in inches.'] };
    const sorted = dims.slice(0, needed).sort((a, b) => b - a);
    const max = rule.max.slice(0, needed);
    if (sorted.some((d, i) => d > max[i])) {
      ok = false;
      const maxText = type === 'clutch' ? '4.5" × 6.5"' : '12" × 6" × 12"';
      messages.push(`Too big. The limit is ${maxText}.`);
    }
  }
  if (ok) messages.push(rule.note || 'Looks good. It should pass the security check.');
  return { ok, messages };
}

function renderBagChecker() {
  const type = BAG_RULES[document.getElementById('bag-type').value] ? document.getElementById('bag-type').value : 'clear';
  const rule = BAG_RULES[type];
  document.getElementById('bag-dims').classList.toggle('hidden', !rule.max);
  document.getElementById('bag-h-wrap').classList.toggle('hidden', type === 'clutch');
  document.getElementById('bag-clear-wrap').classList.toggle('hidden', !rule.needsClear);
  checkBag();
}

function checkBag() {
  const type = BAG_RULES[document.getElementById('bag-type').value] ? document.getElementById('bag-type').value : 'clear';
  const rule = BAG_RULES[type];
  const val = id => document.getElementById(id).value;
  const out = document.getElementById('bag-result');
  const hasSize = !rule.max || (parseFloat(val('bag-l')) > 0 && parseFloat(val('bag-w')) > 0 && (type === 'clutch' || parseFloat(val('bag-h')) > 0));
  if (!hasSize) { out.className = 'text-xs text-panthers-silver mt-2'; out.textContent = 'Enter the size (in inches) to check your bag.'; return; }
  const r = evaluateBag(type, val('bag-l'), val('bag-w'), val('bag-h'), document.getElementById('bag-clear').checked);
  out.className = 'text-xs mt-2 font-bold ' + (r.ok ? 'text-emerald-400' : 'text-red-400');
  out.textContent = (r.ok ? '✅ ' : '⛔ ') + r.messages.join(' ');
}

// ---- Static sections ---------------------------------------------------------------------------------------

function renderStadiumFacts() {
  document.getElementById('stadium-facts').innerHTML = STADIUM_FACTS.map(f => `
    <div class="bg-panthers-black/60 border border-panthers-cardBorder border-l-4 border-l-panthers-blue p-3 rounded-lg">
      <span class="text-[9px] uppercase tracking-widest text-panthers-silver font-bold">${escapeHtml(f.label)}</span>
      <div class="font-heading font-bold text-white text-xl leading-tight">${escapeHtml(f.value)}</div>
      <p class="text-[11px] text-panthers-silver">${escapeHtml(f.note)}</p>
    </div>`).join('');

  document.getElementById('stadium-history').innerHTML = STADIUM_HISTORY.map(h => `
    <li class="flex gap-3"><span class="w-20 shrink-0 font-heading font-bold text-panthers-blue text-sm">${escapeHtml(h.year)}</span>
    <span class="text-xs text-panthers-silver">${escapeHtml(h.text)}</span></li>`).join('');

  document.getElementById('stadium-clubs').textContent = CLUBS_NOTE;
  document.getElementById('stadium-gaps').textContent = STADIUM_NOT_FOUND;
  document.getElementById('stadium-asof').textContent = `Researched ${STADIUM_AS_OF}. Rules, hours and traffic plans change; check panthers.com/gameday before each game.`;

  const list = id => items => { document.getElementById(id).innerHTML = items.map(t => `<li class="text-xs text-panthers-silver flex gap-1.5"><span class="text-panthers-blue">▸</span><span>${escapeHtml(t)}</span></li>`).join(''); };
  list('rules-list')(STADIUM_RULES);
  list('access-list')(ACCESS_NOTES);
  document.getElementById('banned-bags').textContent = BANNED_BAGS.join(', ');
  document.getElementById('packing-list').innerHTML = PACKING_LIST.map((t, i) => `
    <li><label class="flex gap-2 items-start text-xs text-panthers-silver cursor-pointer"><input type="checkbox" class="mt-0.5 accent-[#0085CA]"> <span>${escapeHtml(t)}</span></label></li>`).join('');
}

function renderStadium() {
  renderLayerChips();
  renderStadiumMap();
  renderPinDetail();
  renderTour();
  renderSeatInfo();
  renderPlanner();
  renderBagChecker();
  renderStadiumFacts();
}
