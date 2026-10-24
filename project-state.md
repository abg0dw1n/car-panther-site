# Project State: car-panther-site

- **Current Version:** v5.3 - Bold & hype restyle
- **Goal:** Carolina Panthers fan portal (unofficial)
- **Status:** Published on Vercel (https://my-first-site-mauve-iota.vercel.app/)

## Recent Actions
- v5.3: restyled for an 18-28 audience: glassy cards, blue glow, Bebas Neue headlines (theme layer at the bottom of css/style.css); rewrote headings and buttons across all tabs in a punchier voice (facts unchanged); data-driven hype headline on Home; Home rows rebalanced, Hall of Honor now a full-width grid.
- v5.2: Home page rebuilt: smarter next-game banner with game-day/live states, last-game recap, season at a glance, quick links, this day in history (119 dates), full Hall of Honor (8), corrected franchise facts. Content in data/home.js.
- v5.1: rebuilt the Stadium Tour tab: schematic clickable map (gates, fan zones, transit/parking, services) with a 9-stop guided walkthrough; canvas 3D seat-view for 8 seating areas x 3 levels; section lookup; game-day planner driven by the schedule; clear-bag checker; rules, accessibility, facts and history. Content in data/stadium.js, rated official / fan-guide / approximate.
- v5.0: audited all content and fixed errors (stadium capacity, unsupported claims, NFC South baseline, stats, wind units, fake weather/news fallbacks, "Official" label). Record, next game, countdown and playoff games now derive from the schedule data. Roster rebuilt (76 players) with ESPN headshots. Mock draft is now the full 257-pick, 7-round draft with 333 prospects. Added `tests/check.js`.
- v4.0: split into data/, js/, css/.

## Known Gaps
- Stadium: the map is schematic and pin positions are approximate; sun/shade and home/visitor sides come from fan guides; gate-to-section mapping, tunnel side and first-aid locations are unconfirmed.
- Forum posts are not saved; they reset on refresh.
- CPU draft teams ignore team needs; prospects beyond Tankathon's top 162 are ordered by estimate; the draft order and comp picks are projections.
- Prospects have no photos. Headshots are hotlinked from ESPN.
- ESPN news CORS and Open-Meteo were not verified in a real browser.
- Three practice-squad players left out due to conflicting ESPN data; some jersey numbers differ between panthers.com and ESPN (panthers.com used).

## Acceptance Test
- `node tests/check.js` passes.
- Open the live site: roster cards show photos; Mock Draft: Sim to My Pick stops at #20, draft through to 7 picks and a class grade.
