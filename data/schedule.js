// 2026 Carolina Panthers schedule (all times Eastern).
//
// When a game is played, change its `status` (for example "W 24-17" - Panthers score first) and its `type`
// ("win", "loss" or "normal"). The record, next-game banner and countdown update on their own.
// Games marked `tentative` can still be moved by the NFL's flex scheduling.
// `kickoff` includes the Eastern time offset (-04:00 until Nov 1, then -05:00).

const panthers2026Schedule = [
  {"week":1,"opp":"vs. Chicago Bears","team":"Chicago Bears","abbr":"CHI","home":true,"date":"Sep 13, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-09-13T13:00:00-04:00","status":"L 37-59","type":"loss","div":false,"tentative":false},
  {"week":2,"opp":"@ Atlanta Falcons","team":"Atlanta Falcons","abbr":"ATL","home":false,"date":"Sep 20, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-09-20T13:00:00-04:00","status":"W 34-3","type":"win","div":true,"tentative":false},
  {"week":3,"opp":"@ Cleveland Browns","team":"Cleveland Browns","abbr":"CLE","home":false,"date":"Sep 27, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-09-27T13:00:00-04:00","status":"L 18-21","type":"loss","div":false,"tentative":false},
  {"week":4,"opp":"vs. Detroit Lions","team":"Detroit Lions","abbr":"DET","home":true,"date":"Oct 4, 2026","time":"8:20 PM ET","tv":"NBC · SNF","kickoff":"2026-10-04T20:20:00-04:00","status":"W 32-26","type":"win","div":false,"tentative":false},
  {"week":5,"opp":"BYE WEEK","team":null,"abbr":null,"home":null,"date":"Oct 11, 2026","time":null,"tv":null,"kickoff":null,"status":"BYE","type":"normal","div":false,"tentative":false},
  {"week":6,"opp":"@ Philadelphia Eagles","team":"Philadelphia Eagles","abbr":"PHI","home":false,"date":"Oct 18, 2026","time":"1:00 PM ET","tv":"CBS","kickoff":"2026-10-18T13:00:00-04:00","status":"W 25-14","type":"win","div":false,"tentative":false},
  {"week":7,"opp":"vs. Tampa Bay Buccaneers","team":"Tampa Bay Buccaneers","abbr":"TB","home":true,"date":"Oct 25, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-10-25T13:00:00-04:00","status":"Upcoming","type":"normal","div":true,"tentative":false},
  {"week":8,"opp":"@ Green Bay Packers","team":"Green Bay Packers","abbr":"GB","home":false,"date":"Oct 29, 2026","time":"8:15 PM ET","tv":"Prime Video · TNF","kickoff":"2026-10-29T20:15:00-04:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":9,"opp":"vs. Denver Broncos","team":"Denver Broncos","abbr":"DEN","home":true,"date":"Nov 8, 2026","time":"1:00 PM ET","tv":"CBS","kickoff":"2026-11-08T13:00:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":10,"opp":"@ New Orleans Saints","team":"New Orleans Saints","abbr":"NO","home":false,"date":"Nov 15, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-11-15T13:00:00-05:00","status":"Upcoming","type":"normal","div":true,"tentative":false},
  {"week":11,"opp":"vs. Baltimore Ravens","team":"Baltimore Ravens","abbr":"BAL","home":true,"date":"Nov 22, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-11-22T13:00:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":12,"opp":"@ Tampa Bay Buccaneers","team":"Tampa Bay Buccaneers","abbr":"TB","home":false,"date":"Nov 30, 2026","time":"8:15 PM ET","tv":"ESPN · MNF","kickoff":"2026-11-30T20:15:00-05:00","status":"Upcoming","type":"normal","div":true,"tentative":false},
  {"week":13,"opp":"@ Minnesota Vikings","team":"Minnesota Vikings","abbr":"MIN","home":false,"date":"Dec 6, 2026","time":"4:25 PM ET","tv":"CBS","kickoff":"2026-12-06T16:25:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":14,"opp":"vs. New Orleans Saints","team":"New Orleans Saints","abbr":"NO","home":true,"date":"Dec 13, 2026","time":"1:00 PM ET","tv":"CBS","kickoff":"2026-12-13T13:00:00-05:00","status":"Upcoming","type":"normal","div":true,"tentative":false},
  {"week":15,"opp":"vs. Cincinnati Bengals","team":"Cincinnati Bengals","abbr":"CIN","home":true,"date":"Dec 20, 2026","time":"1:00 PM ET","tv":"FOX","kickoff":"2026-12-20T13:00:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":16,"opp":"@ Pittsburgh Steelers","team":"Pittsburgh Steelers","abbr":"PIT","home":false,"date":"Dec 27, 2026","time":"1:00 PM ET","tv":"TBD","kickoff":"2026-12-27T13:00:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":true},
  {"week":17,"opp":"vs. Seattle Seahawks","team":"Seattle Seahawks","abbr":"SEA","home":true,"date":"Jan 3, 2027","time":"1:00 PM ET","tv":"FOX","kickoff":"2027-01-03T13:00:00-05:00","status":"Upcoming","type":"normal","div":false,"tentative":false},
  {"week":18,"opp":"vs. Atlanta Falcons","team":"Atlanta Falcons","abbr":"ATL","home":true,"date":"Jan 10, 2027","time":"1:00 PM ET","tv":"TBD","kickoff":"2027-01-10T13:00:00-05:00","status":"Upcoming","type":"normal","div":true,"tentative":true}
];
