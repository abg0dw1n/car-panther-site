// Panthers depth chart, from panthers.com/team/depth-chart (read Oct 24, 2026; the page shows no week).
// Each row lists players in order: starter first, then 2nd string, 3rd, and so on.
// Rows are in the order the roster page shows them. When the team updates its depth chart,
// edit the player lists here; names must match data/roster.js exactly.

const DEPTH_CHART_AS_OF = 'Oct 24, 2026';

const DEPTH_CHART = [
  // ---- Offense
  { side: 'offense', slot: 'QB',  players: ['Bryce Young', 'Kenny Pickett', 'Haynes King'] },
  { side: 'offense', slot: 'RB',  players: ['Chuba Hubbard', 'Trevor Etienne', 'AJ Dillon'] },
  { side: 'offense', slot: 'WR',  players: ['Tetairoa McMillan', 'Brycen Tremayne'] },
  { side: 'offense', slot: 'WR',  players: ['Jalen Coker', 'David Moore'] },
  { side: 'offense', slot: 'WR',  players: ['John Metchie III'] },
  { side: 'offense', slot: 'TE',  players: ['Tommy Tremble', 'Mitchell Evans', 'Darren Waller', "Ja'Tavion Sanders", 'Feleipe Franks'] },
  { side: 'offense', slot: 'LT',  players: ['Rasheed Walker', 'Monroe Freeling', 'Stone Forsythe'] },
  { side: 'offense', slot: 'LG',  players: ['Damien Lewis', 'Corey Bullock'] },
  { side: 'offense', slot: 'C',   players: ['Luke Fortner', 'Sam Hecht'] },
  { side: 'offense', slot: 'RG',  players: ['Robert Hunt', 'Torricelli Simpkins III'] },
  { side: 'offense', slot: 'RT',  players: ['Taylor Moton', 'Monroe Freeling', 'Stone Forsythe'] },

  // ---- Defense
  { side: 'defense', slot: 'DL',  players: ['Derrick Brown', 'Aaron Hall'] },
  { side: 'defense', slot: 'DL',  players: ['Bobby Brown III', 'TeRah Edwards'] },
  { side: 'defense', slot: 'DL',  players: ['Tershawn Wharton', 'Lee Hunter'] },
  { side: 'defense', slot: 'OLB', players: ['Jaelan Phillips', 'Princely Umanmielen'] },
  { side: 'defense', slot: 'OLB', players: ['Patrick Jones II', 'Trevis Gipson', 'Thomas Incoom'] },
  { side: 'defense', slot: 'LB',  players: ['Devin Lloyd', 'Jackson Kuwatch'] },
  { side: 'defense', slot: 'LB',  players: ['Bobby Okereke', 'Tyrel Dodson'] },
  { side: 'defense', slot: 'CB',  players: ['Akayleb Evans', 'Chau Smith-Wade'] },
  { side: 'defense', slot: 'CB',  players: ['Will Lee III'] },
  { side: 'defense', slot: 'S',   players: ["Tre'von Moehrig", 'Zakee Wheatley'] },
  { side: 'defense', slot: 'S',   players: ['Nick Scott', 'Lathan Ransom', 'Isaiah Simmons'] },

  // ---- Special teams
  { side: 'special', slot: 'K',   players: ['Ryan Fitzgerald'] },
  { side: 'special', slot: 'P',   players: ['Sam Martin'] },
  { side: 'special', slot: 'LS',  players: ['JJ Jansen'] },
  { side: 'special', slot: 'H',   players: ['Sam Martin'] },
  { side: 'special', slot: 'KR',  players: ['David Moore', 'Trevor Etienne'] },
  { side: 'special', slot: 'PR',  players: ['David Moore', 'Trevor Etienne'] }
];
