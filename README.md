# Carolina Panthers Fan Central

A single-page fan portal for the Carolina Panthers, deployed on Vercel.

**Live site:** https://my-first-site-mauve-iota.vercel.app/

## Tabs

- **Home:** kickoff countdown, live ESPN headlines, franchise milestones, Hall of Honor
- **Roster:** every player and the head coach, filterable by Offense, Defense and Special Teams
- **Stadium Tour:** Bank of America Stadium fan guide
- **2026 Schedule:** results and upcoming games, with a "wins only" filter
- **Playoff Machine:** pick outcomes for the Panthers' remaining divisional games and see the NFC South standings update (all other results are held constant)
- **Mock Draft:** three-round draft simulator with per-pick and overall grades
- **Fan Discussions:** a forum demo (posts live only in your browser and disappear on refresh)
- **Arcade & Trivia:** links to the standalone trivia game

## Tech

Plain HTML, CSS and JavaScript with no build step. Tailwind CSS is loaded from a CDN, and Open-Meteo (weather) and an ESPN RSS feed (news) are fetched client-side.

## Project layout

```
index.html        The page structure (all eight tabs)
css/style.css     The few styles Tailwind doesn't cover
data/             The content. Edit these when scores, rosters or prospects change
  roster.js         Players and the head coach
  schedule.js       Game results and upcoming games
  playoff.js        NFC South records and remaining divisional games
  draft.js          Mock draft prospects
js/               The behavior, one file per area
  helpers.js        Safety helpers (escaping text, checking links)
  tabs.js           Switching tabs
  roster.js         Roster cards and filter buttons
  schedule.js       Schedule table
  playoff.js        Playoff Machine
  draft.js          Mock Draft and grading
  forum.js          Fan Discussions
  home.js           Countdown, weather and news
  main.js           Starts everything when the page loads (keep this last)
```

The scripts are plain `<script>` tags that share one global scope, so **the order of the tags at the bottom of `index.html` matters**: data first, then `helpers.js`, then the tab files, and `main.js` last.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server, for example `python3 -m http.server`.

## Updating season data

Everything that changes during the season lives in the `data/` folder: `roster.js`, `schedule.js`, `playoff.js` and `draft.js`. Roster counts on the page are computed from the data, so there is nothing else to keep in sync. The "2026 Record" in the page header and a few hardcoded matchup details in `index.html` (Week 7 banner, forum sample posts) still need editing by hand.
