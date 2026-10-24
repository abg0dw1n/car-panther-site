# Carolina Panthers Fan Central

A single-page fan portal for the Carolina Panthers, deployed on Vercel.

**Live site:** https://my-first-site-mauve-iota.vercel.app/

## Tabs

- **Home:** kickoff countdown, live ESPN headlines, franchise milestones, Hall of Honor
- **Roster:** all 76 players (active, IR/PUP, practice squad) with ESPN headshots, 2026 stats and the coaching staff
- **Stadium Tour:** clickable stadium map with a guided walkthrough, a 3D "view from your seat" simulator and section lookup, a game-day timeline planner, a clear-bag checker, rules/accessibility, and facts & history
- **2026 Schedule:** results and upcoming games, with a "wins only" filter
- **Playoff Machine:** pick outcomes for the Panthers' remaining divisional games and see the NFC South standings update (all other results are held constant)
- **Mock Draft:** full 7-round, 257-pick 2027 draft; you pick for the Panthers, the computer picks for the other 31 teams; 333 prospects, search and position filters, pick and class grades
- **Fan Discussions:** a forum demo (posts live only in your browser and disappear on refresh)
- **Arcade & Trivia:** links to the standalone trivia game

## Tech

Plain HTML, CSS and JavaScript with no build step. Tailwind CSS is loaded from a CDN, and Open-Meteo (weather) and ESPN's team news API (news) are fetched client-side.

## Project layout

```
index.html        The page structure (all eight tabs)
css/style.css     The few styles Tailwind doesn't cover
data/             The content. Edit these when scores, rosters or prospects change
  roster.js         Players and the head coach
  schedule.js       Game results and upcoming games
  playoff.js        NFC South records and remaining divisional games
  draft-prospects.js  The 333 draft prospects in consensus order
  draft-order.js    The 257-pick order with trades, plus all 32 teams
  stadium.js        Stadium map pins, seating zones, game-day timeline, rules (each item rated official / fan-guide / approximate)
js/               The behavior, one file per area
  helpers.js        Safety helpers (escaping text, checking links)
  tabs.js           Switching tabs
  roster.js         Roster cards and filter buttons
  schedule.js       Schedule table
  playoff.js        Playoff Machine
  draft.js          Mock Draft engine, board and grading
  stadium.js        Stadium Tour: map, walkthrough, seat view, planner, bag checker
  forum.js          Fan Discussions
  home.js           Countdown, weather and news
  main.js           Starts everything when the page loads (keep this last)
```

The scripts are plain `<script>` tags that share one global scope, so **the order of the tags at the bottom of `index.html` matters**: data first, then `helpers.js`, then the tab files, and `main.js` last.

## Tests

`node tests/check.js` loads the real scripts against a stand-in page and checks the data, wiring and each tab's behavior. It can't check how the page looks.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server, for example `python3 -m http.server`.

## Updating season data

Everything that changes lives in `data/`. Each file notes its "as of" date at the top.

- Each week: add the result in `schedule.js`, update `initialNfcSouth` and `NFC_SOUTH_AS_OF_WEEK` in `playoff.js`, and refresh stats and `ROSTER_AS_OF` in `roster.js`. The record, next-game banner, countdown and Playoff Machine games all derive from these.
- Draft order and prospect rankings are projections (Tankathon) and shift all season.
- Headshots load from ESPN by player id (`headshotUrl`) and fall back to a silhouette. The images belong to ESPN/the NFL.
