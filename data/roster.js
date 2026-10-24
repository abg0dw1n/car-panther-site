// 2026 active roster. Edit a player here and the Roster tab updates itself.
// pos "HC" marks the head coach (counted separately from players).

const fullPanthersRoster = {
  offense: [
    { name: "Bryce Young", pos: "QB", num: "9", role: "Starter", stat1: "1,549 Pass Yds", stat2: "11 TDs", stat3: "60.2% Comp" },
    { name: "Kenny Pickett", pos: "QB", num: "12", role: "Backup", stat1: "125 Pass Yds", stat2: "1 TD", stat3: "62.5% Comp" },
    { name: "Haynes King", pos: "QB", num: "16", role: "Depth", stat1: "0 Pass Yds", stat2: "0 TD", stat3: "--" },
    
    { name: "Chuba Hubbard", pos: "RB", num: "30", role: "Starter", stat1: "426 Rush Yds", stat2: "4 TDs", stat3: "511 All-Purp" },
    { name: "AJ Dillon", pos: "RB", num: "28", role: "Backup", stat1: "142 Rush Yds", stat2: "1 TD", stat3: "165 All-Purp" },
    { name: "Trevor Etienne", pos: "RB", num: "23", role: "Depth", stat1: "68 Rush Yds", stat2: "0 TD", stat3: "88 All-Purp" },
    { name: "Anthony Tyus III", pos: "RB", num: "34", role: "Depth", stat1: "21 Rush Yds", stat2: "0 TD", stat3: "21 All-Purp" },

    { name: "Tetairoa McMillan", pos: "WR", num: "4", role: "WR1", stat1: "471 Rec Yds", stat2: "96.2 Yds/G", stat3: "2 TDs" },
    { name: "Jalen Coker", pos: "WR", num: "18", role: "Starter", stat1: "214 Rec Yds", stat2: "18 Rec", stat3: "2 TDs" },
    { name: "John Metchie III", pos: "WR", num: "13", role: "Rotation", stat1: "129 Rec Yds", stat2: "11 Rec", stat3: "1 TD" },
    { name: "Brycen Tremayne", pos: "WR", num: "87", role: "Depth", stat1: "84 Rec Yds", stat2: "6 Rec", stat3: "0 TD" },
    { name: "David Moore", pos: "WR", num: "83", role: "Depth / Return", stat1: "62 Rec Yds", stat2: "215 Ret Yds", stat3: "1 TD" },

    { name: "Tommy Tremble", pos: "TE", num: "82", role: "Starter", stat1: "148 Rec Yds", stat2: "12 Rec", stat3: "1 TD" },
    { name: "Darren Waller", pos: "TE", num: "88", role: "Rotation", stat1: "185 Rec Yds", stat2: "14 Rec", stat3: "2 TDs" },
    { name: "Mitchell Evans", pos: "TE", num: "84", role: "Depth", stat1: "42 Rec Yds", stat2: "4 Rec", stat3: "0 TD" },
    { name: "Ja'Tavion Sanders", pos: "TE", num: "0", role: "Depth", stat1: "38 Rec Yds", stat2: "3 Rec", stat3: "0 TD" },

    { name: "Taylor Moton", pos: "RT", num: "72", role: "Starter", stat1: "5 Games Started", stat2: "1 Sack Allowed", stat3: "82.4 PFF" },
    { name: "Rasheed Walker", pos: "LT", num: "63", role: "Starter", stat1: "5 Games Started", stat2: "2 Sacks Allowed", stat3: "76.1 PFF" },
    { name: "Robert Hunt", pos: "RG", num: "50", role: "Starter", stat1: "5 Games Started", stat2: "0 Sacks Allowed", stat3: "85.8 PFF" },
    { name: "Damien Lewis", pos: "LG", num: "68", role: "Starter", stat1: "5 Games Started", stat2: "1 Sack Allowed", stat3: "79.2 PFF" },
    { name: "Luke Fortner", pos: "C", num: "77", role: "Starter", stat1: "5 Games Started", stat2: "1 Sack Allowed", stat3: "74.5 PFF" },
    { name: "Monroe Freeling", pos: "OT", num: "57", role: "Backup", stat1: "3 Games Played", stat2: "Depth OL", stat3: "68.0 PFF" },
    { name: "Stone Forsythe", pos: "OT", num: "73", role: "Backup", stat1: "2 Games Played", stat2: "Depth OL", stat3: "65.2 PFF" }
  ],
  defense: [
    { name: "Derrick Brown", pos: "DT", num: "95", role: "Starter", stat1: "22 Tackles", stat2: "4.0 TFL", stat3: "1.5 Sacks" },
    { name: "Lee Hunter", pos: "DT", num: "92", role: "Starter", stat1: "15 Tackles", stat2: "2.0 TFL", stat3: "1.0 Sack" },
    { name: "Tershawn Wharton", pos: "DT", num: "98", role: "Starter", stat1: "12 Tackles", stat2: "1.5 TFL", stat3: "1.0 Sack" },
    { name: "Bobby Brown III", pos: "DT", num: "97", role: "Backup", stat1: "8 Tackles", stat2: "1.0 TFL", stat3: "0.5 Sack" },
    { name: "TeRah Edwards", pos: "DT", num: "93", role: "Depth", stat1: "4 Tackles", stat2: "0.5 TFL", stat3: "0 Sacks" },

    { name: "Devin Lloyd", pos: "LB", num: "55", role: "Starter", stat1: "35 Tackles", stat2: "2 INTs", stat3: "1 Def TD" },
    { name: "Bobby Okereke", pos: "LB", num: "58", role: "Starter", stat1: "38 Tackles", stat2: "3.0 TFL", stat3: "1 Pass Def" },
    { name: "Tyrel Dodson", pos: "LB", num: "33", role: "Backup", stat1: "14 Tackles", stat2: "1.0 TFL", stat3: "0 INT" },
    { name: "Jackson Kuwatch", pos: "LB", num: "46", role: "Depth", stat1: "6 Tackles", stat2: "Special Teams", stat3: "0 TFL" },

    { name: "Jaelan Phillips", pos: "OLB", num: "5", role: "Starter", stat1: "18 Tackles", stat2: "3.5 Sacks", stat3: "8 QB Hits" },
    { name: "Princely Umanmielen", pos: "OLB", num: "3", role: "Starter", stat1: "16 Tackles", stat2: "3.0 Sacks", stat3: "7 QB Hits" },
    { name: "Patrick Jones II", pos: "OLB", num: "91", role: "Backup", stat1: "11 Tackles", stat2: "1.5 Sacks", stat3: "4 QB Hits" },
    { name: "Trevis Gipson", pos: "OLB", num: "52", role: "Backup", stat1: "7 Tackles", stat2: "1.0 Sack", stat3: "2 QB Hits" },
    { name: "Thomas Incoom", pos: "OLB", num: "48", role: "Depth", stat1: "3 Tackles", stat2: "Special Teams", stat3: "0 Sacks" },

    { name: "Jaycee Horn", pos: "CB", num: "8", role: "Starter", stat1: "18 Tackles", stat2: "6 Pass Def", stat3: "1 INT" },
    { name: "Akayleb Evans", pos: "CB", num: "29", role: "Starter", stat1: "19 Tackles", stat2: "4 Pass Def", stat3: "0 INT" },
    { name: "Will Lee III", pos: "CB", num: "24", role: "Starter", stat1: "14 Tackles", stat2: "3 Pass Def", stat3: "1 INT" },
    { name: "Chau Smith-Wade", pos: "CB", num: "26", role: "Slot CB", stat1: "12 Tackles", stat2: "2 Pass Def", stat3: "0 INT" },

    { name: "Tre'von Moehrig", pos: "S", num: "7", role: "Starter", stat1: "29 Tackles", stat2: "1 INT", stat3: "3 Pass Def" },
    { name: "Nick Scott", pos: "S", num: "21", role: "Starter", stat1: "26 Tackles", stat2: "1 FF", stat3: "2 Pass Def" },
    { name: "Lathan Ransom", pos: "S", num: "22", role: "Backup", stat1: "11 Tackles", stat2: "0 INT", stat3: "1 Pass Def" },
    { name: "Zakee Wheatley", pos: "S", num: "20", role: "Backup", stat1: "8 Tackles", stat2: "Special Teams", stat3: "0 INT" },
    { name: "Isaiah Simmons", pos: "S", num: "27", role: "Hybrid / Depth", stat1: "9 Tackles", stat2: "1.0 TFL", stat3: "1 Pass Def" }
  ],
  special: [
    { name: "Ryan Fitzgerald", pos: "K", num: "10", role: "Starter", stat1: "44 Kick Pts", stat2: "10/11 FGs", stat3: "7 Touchbacks" },
    { name: "Sam Martin", pos: "P", num: "6", role: "Starter", stat1: "42.6 Net Avg", stat2: "8 In-20", stat3: "58 Long Punt" },
    { name: "JJ Jansen", pos: "LS", num: "44", role: "Legend", stat1: "100% Snap Acc", stat2: "19 Seasons", stat3: "Franchise Rec" },
    { name: "Dave Canales", pos: "HC", num: "HC", role: "Head Coach", stat1: "3-2 Record", stat2: "1st NFC South", stat3: "29.2 PPG" }
  ]
};
