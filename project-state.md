# Project State: car-panther-site

- **Current Version:** v4.0 - Split into separate files (data/, js/, css/)
- **Goal:** Carolina Panthers Official Fan Portal
- **Status:** Complete / Published on Vercel (https://my-first-site-mauve-iota.vercel.app/)

## Recent Actions
- v4.0: moved the roster, schedule, playoff and draft data into `data/`, the JavaScript into one file per area in `js/`, and the custom CSS into `css/style.css`. `index.html` now holds only the page structure. No behavior changes; see README for the layout and script load order.
- v3.3 changes:
- Escaped all user-supplied forum text and ESPN feed content before inserting it into the page, and restricted feed links to http(s).
- Fixed the countdown to use an explicit Eastern Daylight Time offset (-04:00) and to render immediately on load.
- Draft simulator now grades each pick from its own rating, and uses the same scale for the overall class grade.
- Roster filter counts and the roster summary line are now computed from the data (23 offense, 23 defense, 4 special teams/staff = 49 players + head coach).
- Playoff Machine handles ties (shows "Tied for Lead") and explains that only the Panthers' divisional games are simulated.
- Sidebars stick relative to a shared nav-height variable (desktop only), and the tab bar's scrollbar is hidden.

## Known Gaps
- Forum posts and likes are not saved; they reset on refresh.
- Draft prospect list includes players who are also on the current roster (Monroe Freeling, Lee Hunter, Will Lee III).
- Likes can be clicked repeatedly to keep increasing the count.

## Acceptance Test
- Open the live Vercel URL.
- Home: countdown shows time remaining to Sunday 1:00 PM ET immediately (no flash of 00:00:00:00).
- Roster: filter buttons show 23 / 23 / 4 and the cards match.
- Playoff Machine: starting state shows the Panthers tied with Tampa Bay; picking "Panthers Win" vs. TB makes them sole division leader.
- Mock Draft: different picks show different grades; overall grade reflects the average.
- Forum: posting a thread containing `<b>test</b>` displays the literal text instead of bold.
