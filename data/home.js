// Home tab content. Generated Oct 24, 2026 from researched sources (pro-football-reference, fantasydata,
// panthers.com, StatMuse, NFL.com, Wikipedia). Update weekly:
//   - add the new game to GAME_LEADERS (keyed by week) after each game
//   - refresh OPPONENTS (records) and OPPONENTS_AS_OF
// Individual sack credits come from a single box-score source and may be revised.

const HOME_AS_OF = 'Oct 26, 2026';

// Panthers leaders and a short recap for each played game, keyed by week
const GAME_LEADERS = {
  "1": {
    "passer": {
      "name": "Bryce Young",
      "line": "23/37, 361 yds, 3 TD, 1 INT"
    },
    "rusher": {
      "name": "Chuba Hubbard",
      "line": "10 car, 49 yds, 1 TD"
    },
    "receiver": {
      "name": "Jalen Coker",
      "line": "8 rec, 138 yds, 2 TD"
    },
    "defense": "2 sacks (Jaelan Phillips, Princely Umanmielen)",
    "recap": "Chicago won the highest-scoring season opener in NFL history. Hubbard tied it 31-31, but a late-hit penalty and a fumble fueled Bears touchdowns, and the 59 points allowed were a franchise worst.",
    "sources": [
      "https://fantasydata.com/nfl/boxscore/19458-chicago-bears-vs-carolina-panthers-week-1-2026",
      "https://www.wbtv.com/2026/09/14/caleb-williams-bears-trounce-panthers-59-37-highest-scoring-season-opener-nfl-history/",
      "https://www.foxcarolina.com/2026/09/14/watch-panthers-players-react-59-37-opening-loss-bears/"
    ]
  },
  "2": {
    "passer": {
      "name": "Bryce Young",
      "line": "23/36, 287 yds, 3 TD, 0 INT"
    },
    "rusher": {
      "name": "Chuba Hubbard",
      "line": "12 car, 53 yds, 0 TD"
    },
    "receiver": {
      "name": "Tetairoa McMillan",
      "line": "5 rec, 101 yds, 0 TD"
    },
    "defense": "Devin Lloyd: 2 INT incl. a 16-yard pick-six",
    "recap": "Carolina forced a fumble on the first play, led 20-3 at halftime and sealed it with Devin Lloyd’s pick-six, for a fourth straight win over Atlanta.",
    "sources": [
      "https://www.pro-football-reference.com/boxscores/202609200atl.htm",
      "https://fantasydata.com/nfl/boxscore/19471-carolina-panthers-vs-atlanta-falcons-week-2-2026",
      "https://www.foxcarolina.com/2026/09/20/young-throws-3-td-passes-including-2-waller-panthers-dominate-short-handed-falcons-34-3/"
    ]
  },
  "3": {
    "passer": {
      "name": "Bryce Young",
      "line": "26/48, 291 yds, 1 TD, 1 INT"
    },
    "rusher": {
      "name": "Chuba Hubbard",
      "line": "19 car, 82 yds, 0 TD"
    },
    "receiver": {
      "name": "Brycen Tremayne",
      "line": "4 rec, 83 yds, 0 TD"
    },
    "defense": "2 sacks (Princely Umanmielen, Trevis Gipson)",
    "recap": "Up 18-13 late, Carolina lost an end-zone interception to a roughing penalty. Cleveland scored with under a minute left and intercepted Young with 9 seconds to go. Ryan Fitzgerald went 4-for-4 on field goals.",
    "sources": [
      "https://www.pro-football-reference.com/boxscores/202609270cle.htm",
      "https://fantasydata.com/nfl/boxscore/19489-carolina-panthers-vs-cleveland-browns-week-3-2026",
      "https://statz.ai/nfl/games/890/panthers-at-browns",
      "https://www.live5news.com/2026/09/27/deshaun-watson-sparks-late-browns-rally-sealing-21-18-win-over-panthers/",
      "https://www.clevelandbrowns.com/news/browns-21-panthers-18-final-score-stats-game-recap"
    ]
  },
  "4": {
    "passer": {
      "name": "Bryce Young",
      "line": "29/41, 329 yds, 2 TD, 0 INT"
    },
    "rusher": {
      "name": "Chuba Hubbard",
      "line": "20 car, 122 yds, 2 TD"
    },
    "receiver": {
      "name": "Tetairoa McMillan",
      "line": "14 rec, 192 yds, 2 TD"
    },
    "defense": "Princely Umanmielen: 1 sack",
    "recap": "Young completed his first 11 passes and Carolina scored on six straight drives. McMillan set career highs with 14 catches for 192 yards, and the defense stopped Detroit’s final drive.",
    "sources": [
      "https://www.pro-football-reference.com/boxscores/202610040car.htm",
      "https://fantasydata.com/nfl/boxscore/19516-detroit-lions-vs-carolina-panthers-week-4-2026",
      "https://www.wbtv.com/2026/10/05/bryce-young-tetairoa-mcmillan-connect-2-tds-lead-panthers-past-lions-32-26/",
      "https://nbcsports.com/nfl/profootballtalk/rumor-mill/news/sunday-night-football-tetairoa-mcmillans-big-night-powers-panthers-to-32-26-victory"
    ]
  },
  "6": {
    "passer": {
      "name": "Bryce Young",
      "line": "20/39, 281 yds, 2 TD, 0 INT"
    },
    "rusher": {
      "name": "Chuba Hubbard",
      "line": "28 car, 120 yds, 1 TD"
    },
    "receiver": {
      "name": "Jalen Coker",
      "line": "6 rec, 97 yds, 0 TD"
    },
    "defense": "Held Philadelphia to 222 yards, 3 sacks",
    "recap": "Despite 13 penalties, Carolina wore down a short-handed Eagles team: Hubbard ran 28 times for 120 yards, the defense allowed just 222 yards, and Young’s second TD to Tommy Tremble put it away.",
    "sources": [
      "https://www.pro-football-reference.com/boxscores/202610180phi.htm",
      "https://fantasydata.com/nfl/boxscore/19540-carolina-panthers-vs-philadelphia-eagles-week-6-2026",
      "https://www.panthers.com/news/rapid-reactions-panthers-grind-out-a-win-in-philadelphia-rocky-tommy-tremble-chuba-hubbard"
    ]
  }
};

// Upcoming opponents: 2026 record, all-time regular-season series (Panthers first), playoff series, last meeting
const OPPONENTS_AS_OF = 'through Sunday of Week 7';
const OPPONENTS = {
  "TB": {
    "record": "2-5",
    "series": "26-26",
    "playoffs": "0-0",
    "last": {
      "date": "2026-10-25",
      "result": "L 13-43"
    }
  },
  "GB": {
    "record": "4-3",
    "series": "7-11",
    "playoffs": "0-1",
    "last": {
      "date": "2025-11-02",
      "result": "W 16-13"
    }
  },
  "DEN": {
    "record": "5-2",
    "series": "2-6",
    "playoffs": "0-1",
    "last": {
      "date": "2024-10-27",
      "result": "L 14-28"
    }
  },
  "NO": {
    "record": "2-5",
    "series": "29-33",
    "playoffs": "0-1",
    "last": {
      "date": "2025-12-14",
      "result": "L 17-20"
    }
  },
  "BAL": {
    "record": "4-3",
    "series": "4-3",
    "playoffs": "0-0",
    "last": {
      "date": "2022-11-20",
      "result": "L 3-13"
    }
  },
  "MIN": {
    "record": "6-0",
    "series": "6-11",
    "playoffs": "0-0",
    "last": {
      "date": "2023-10-01",
      "result": "L 13-21"
    }
  },
  "CIN": {
    "record": "4-2",
    "series": "3-4-1",
    "playoffs": "0-0",
    "last": {
      "date": "2024-09-29",
      "result": "L 24-34"
    }
  },
  "PIT": {
    "record": "5-2",
    "series": "1-7",
    "playoffs": "0-0",
    "last": {
      "date": "2022-12-18",
      "result": "L 16-24"
    }
  },
  "SEA": {
    "record": "4-3",
    "series": "4-10",
    "playoffs": "1-2",
    "last": {
      "date": "2025-12-28",
      "result": "L 10-27"
    }
  },
  "ATL": {
    "record": "3-4",
    "series": "26-37",
    "playoffs": "0-0",
    "last": {
      "date": "2026-09-20",
      "result": "W 34-3"
    }
  }
};

// "This day in Panthers history". date = YYYY-MM-DD. uncertain = sources disagree on the exact day.
const PANTHERS_HISTORY = [
  {"date":"2004-01-02","title":"Sam Mills' 'Keep Pounding' speech","text":"Battling cancer, assistant coach Sam Mills told the team to 'keep pounding' the day before the Wild Card game against Dallas."},
  {"date":"2004-01-03","title":"Wild Card rout of Dallas, 29-10","text":"The Panthers opened the 2003 playoffs by beating the Cowboys 29-10 at home."},
  {"date":"2015-01-03","title":"First home playoff win in nine years","text":"The Panthers beat the Arizona Cardinals 27-16 in the Wild Card Round."},
  {"date":"2016-01-03","title":"15-1 finish clinches home field","text":"A 38-10 win over Tampa Bay completed a franchise-best 15-1 season and secured NFC home-field advantage."},
  {"date":"2026-01-04","title":"Panthers clinch 2025 NFC South title","text":"Carolina (8-9) clinched the division when Atlanta beat New Orleans, a day after the Panthers' Week 18 loss."},
  {"date":"1997-01-05","title":"First playoff win: Panthers 26, Cowboys 17","text":"In just their second season, the Panthers beat defending champion Dallas in the Divisional Round at Ericsson Stadium."},
  {"date":"2018-01-07","title":"Wild Card loss at New Orleans","text":"The 11-5 Panthers fell 31-26 to the Saints in the Wild Card Round."},
  {"date":"2020-01-07","title":"Matt Rhule hired as head coach","text":"Carolina hired Baylor's Matt Rhule as head coach."},
  {"date":"2006-01-08","title":"Wild Card shutout of the Giants","text":"The Panthers blanked the Giants 23-0 at Giants Stadium."},
  {"date":"2004-01-10","title":"Double-overtime win at St. Louis","text":"Steve Smith's 69-yard catch-and-run touchdown on the first play of the second overtime beat the Rams 29-23."},
  {"date":"2026-01-10","title":"Wild Card thriller vs. the Rams","text":"In their first playoff game since the 2017 season, the Panthers lost 34-31 to the Rams in Charlotte."},
  {"date":"2011-01-11","title":"Ron Rivera hired as head coach","text":"Carolina hired Chargers defensive coordinator Ron Rivera as its fourth head coach."},
  {"date":"1997-01-12","title":"NFC Championship at Lambeau Field","text":"The Panthers' 1996 run ended with a 30-13 loss at Green Bay in the NFC Championship Game."},
  {"date":"2020-01-14","title":"Luke Kuechly announces retirement","text":"Seven-time Pro Bowl linebacker Luke Kuechly retired at age 28 after eight seasons."},
  {"date":"2006-01-15","title":"Steve Smith's 218-yard playoff day","text":"Smith had 12 catches for 218 yards and two TDs as Carolina won 29-21 at Chicago."},
  {"date":"2016-01-17","title":"Divisional win over Seattle, 31-24","text":"Carolina raced to a 31-0 halftime lead and held off the Seahawks."},
  {"date":"2004-01-18","title":"Panthers win first NFC Championship","text":"Carolina beat the Eagles 14-3 in Philadelphia to reach Super Bowl XXXVIII."},
  {"date":"2006-01-22","title":"NFC Championship at Seattle","text":"Carolina's 2005 run ended with a 34-14 loss to the Seahawks in the NFC title game."},
  {"date":"2016-01-24","title":"Second NFC title: Panthers 49, Cardinals 15","text":"Carolina routed Arizona at home to clinch a trip to Super Bowl 50."},
  {"date":"2002-01-25","title":"John Fox hired as head coach","text":"Carolina named Giants defensive coordinator John Fox its third head coach."},
  {"date":"2024-01-25","title":"Dave Canales hired as head coach","text":"Carolina agreed to terms with Buccaneers offensive coordinator Dave Canales."},
  {"date":"2023-01-26","title":"Frank Reich hired as head coach","text":"The Panthers named Frank Reich head coach."},
  {"date":"2004-02-01","title":"Super Bowl XXXVIII","text":"Carolina lost 32-29 to New England on Adam Vinatieri's last-seconds field goal in Houston."},
  {"date":"2014-02-01","title":"Luke Kuechly named Defensive Player of the Year","text":"Kuechly became the Panthers' first AP Defensive Player of the Year.","uncertain":true},
  {"date":"2019-02-01","title":"Julius Peppers retires","text":"Peppers retired after 17 seasons with 159.5 career sacks: 'Once a Panther, always a Panther.'"},
  {"date":"2020-02-03","title":"Greg Olsen released","text":"Carolina released Olsen, its record-setting tight end, after nine seasons."},
  {"date":"2012-02-04","title":"Cam Newton named Offensive Rookie of the Year","text":"Newton won the award after setting rookie passing and QB rushing marks."},
  {"date":"2026-02-05","title":"Luke Kuechly elected to the Hall of Fame","text":"Kuechly was named to the Class of 2026 at NFL Honors in San Francisco."},
  {"date":"2016-02-06","title":"Cam Newton named NFL MVP","text":"Newton won league MVP and Ron Rivera was named Coach of the Year at NFL Honors."},
  {"date":"2016-02-07","title":"Super Bowl 50","text":"Carolina lost 24-10 to the Denver Broncos at Levi's Stadium."},
  {"date":"2024-02-08","title":"Julius Peppers elected to the Hall of Fame","text":"Peppers was elected to the Class of 2024 in his first year of eligibility.","uncertain":true},
  {"date":"2022-02-10","title":"Sam Mills elected to the Hall of Fame","text":"Mills was elected to the Pro Football Hall of Fame Class of 2022 at NFL Honors.","uncertain":true},
  {"date":"2023-03-01","title":"Founder Jerry Richardson dies","text":"Panthers founder and original owner Jerry Richardson died at 86 at his Charlotte home."},
  {"date":"2017-03-10","title":"Julius Peppers returns to Carolina","text":"Peppers agreed to a one-year deal to rejoin the team that drafted him."},
  {"date":"2023-03-10","title":"Trade for the No. 1 overall pick","text":"Carolina acquired the top pick of the 2023 draft from Chicago in a deal that sent DJ Moore and picks to the Bears."},
  {"date":"2025-03-10","title":"Jaycee Horn's record extension","text":"CB Jaycee Horn signed a four-year, $100 million extension."},
  {"date":"2021-03-11","title":"Olsen retires as a Panther","text":"Greg Olsen signed a one-day contract to retire with Carolina."},
  {"date":"2024-03-11","title":"Brian Burns traded to the Giants","text":"Carolina dealt the two-time Pro Bowl edge rusher to New York for draft picks."},
  {"date":"2014-03-13","title":"Panthers release Steve Smith","text":"Carolina released its all-time leading receiver after 13 seasons; he signed with Baltimore a day later."},
  {"date":"2020-03-24","title":"Panthers release Cam Newton","text":"Carolina released the franchise's all-time passing leader and 2015 MVP."},
  {"date":"2020-04-13","title":"McCaffrey becomes NFL's highest-paid RB","text":"Christian McCaffrey signed a four-year extension that made him the league's richest running back."},
  {"date":"2005-04-18","title":"Sam Mills dies at 45","text":"Panthers linebackers coach and 'Keep Pounding' icon Sam Mills died after a battle with intestinal cancer."},
  {"date":"2002-04-20","title":"Julius Peppers drafted No. 2 overall","text":"Carolina selected North Carolina DE Julius Peppers with the second pick."},
  {"date":"2001-04-21","title":"Steve Smith drafted in Round 3","text":"Carolina took Utah's Steve Smith 74th overall; he became the franchise's receiving leader.","uncertain":true},
  {"date":"1994-04-22","title":"Ground broken on Panthers stadium","text":"Construction began on the Uptown Charlotte stadium now known as Bank of America Stadium.","uncertain":true},
  {"date":"1995-04-22","title":"Kerry Collins: first-ever draft pick","text":"Carolina, after trading down from No. 1, took Penn State QB Kerry Collins fifth overall.","uncertain":true},
  {"date":"2026-04-23","title":"Monroe Freeling drafted No. 19","text":"The Panthers selected Georgia offensive tackle Monroe Freeling in the first round in Pittsburgh.","uncertain":true},
  {"date":"2025-04-24","title":"Tetairoa McMillan drafted No. 8","text":"Carolina took Arizona WR Tetairoa McMillan in the first round in Green Bay."},
  {"date":"2024-04-25","title":"Xavier Legette drafted No. 32","text":"Carolina traded into the end of the first round to take South Carolina WR Xavier Legette."},
  {"date":"2012-04-26","title":"Luke Kuechly drafted No. 9 overall","text":"Carolina took Boston College linebacker Luke Kuechly in the first round."},
  {"date":"2017-04-27","title":"Christian McCaffrey drafted No. 8 overall","text":"The Panthers selected Stanford RB Christian McCaffrey in the first round.","uncertain":true},
  {"date":"2023-04-27","title":"Bryce Young drafted No. 1 overall","text":"Carolina picked Alabama QB Bryce Young with the first overall selection."},
  {"date":"2011-04-28","title":"Cam Newton drafted No. 1 overall","text":"Carolina chose Auburn's Heisman-winning QB Cam Newton with the first pick."},
  {"date":"2019-05-06","title":"Four legends named to Hall of Honor","text":"The team announced Jake Delhomme, Jordan Gross, Steve Smith Sr. and Wesley Walls for its Hall of Honor."},
  {"date":"2026-05-07","title":"First-rounder Monroe Freeling signs","text":"On the eve of rookie minicamp, Carolina signed six of seven 2026 draft picks, including Freeling."},
  {"date":"2018-05-16","title":"Tepper agreement to buy the Panthers","text":"Jerry Richardson agreed to sell the franchise to David Tepper."},
  {"date":"2018-05-22","title":"NFL owners approve David Tepper","text":"League owners approved Tepper's purchase of the Panthers, then a record of about $2.275 billion."},
  {"date":"2015-06-02","title":"Cam Newton's five-year extension","text":"Newton and the Panthers agreed to a five-year, $103.8 million contract extension."},
  {"date":"1993-06-03","title":"PSL plan launches with 41,632 orders","text":"Richardson Sports unveiled a privately financed stadium plan built on permanent seat licenses; day one drew 41,632 PSL orders."},
  {"date":"2020-06-10","title":"Richardson statue removed","text":"The team took down the Jerry Richardson statue outside Bank of America Stadium."},
  {"date":"2024-06-24","title":"City approves stadium renovation funds","text":"Charlotte City Council voted 7-3 to give $650 million toward Bank of America Stadium renovations."},
  {"date":"2022-07-06","title":"Baker Mayfield acquired","text":"Carolina traded a conditional 2024 fifth-round pick to Cleveland for QB Baker Mayfield."},
  {"date":"2018-07-09","title":"Tepper sale closes","text":"David Tepper officially became the Panthers' second owner."},
  {"date":"1987-07-16","title":"Richardson begins the expansion push","text":"Jerry Richardson met potential investors in Charlotte to start organizing an NFL expansion bid."},
  {"date":"2017-07-17","title":"GM Dave Gettleman fired","text":"The Panthers dismissed GM Dave Gettleman on the eve of camp; Marty Hurney returned as interim GM."},
  {"date":"2025-07-22","title":"Veterans report for 2025 training camp","text":"Panthers veterans reported to camp at Bank of America Stadium, a day after rookies."},
  {"date":"2011-07-28","title":"Greg Olsen acquired from Chicago","text":"The Panthers traded a 2012 third-round pick to the Bears for TE Greg Olsen."},
  {"date":"1995-07-29","title":"First game ever: Hall of Fame Game win","text":"Carolina beat fellow expansion team Jacksonville 20-14 in Canton in its first game."},
  {"date":"1996-08-03","title":"Stadium opens with win over Chicago","text":"Ericsson Stadium (now Bank of America Stadium) debuted with a 30-12 preseason win over the Bears."},
  {"date":"2024-08-03","title":"Julius Peppers enshrined in Canton","text":"Peppers was enshrined into the Pro Football Hall of Fame as part of the Class of 2024."},
  {"date":"2016-08-06","title":"Kevin Greene enshrined in Canton","text":"Former Panthers sack leader Kevin Greene was enshrined in the Pro Football Hall of Fame.","uncertain":true},
  {"date":"2022-08-06","title":"Sam Mills enshrined in Canton","text":"Sam Mills, the linebacker behind 'Keep Pounding,' was enshrined in the Pro Football Hall of Fame.","uncertain":true},
  {"date":"2026-08-06","title":"Panthers win 2026 Hall of Fame Game","text":"Carolina beat Arizona 33-30 in Canton during Luke Kuechly's enshrinement weekend.","uncertain":true},
  {"date":"2026-08-08","title":"Luke Kuechly enshrined in Canton","text":"Kuechly was enshrined in the Pro Football Hall of Fame at Tom Benson Hall of Fame Stadium."},
  {"date":"1996-09-01","title":"First regular-season game in Charlotte","text":"Carolina beat Atlanta 29-6 in the first regular-season game at Ericsson Stadium."},
  {"date":"1995-09-03","title":"First regular-season game","text":"The Panthers lost their debut 23-20 in overtime at Atlanta."},
  {"date":"2003-09-07","title":"Delhomme's comeback debut","text":"Jake Delhomme replaced Rodney Peete down 17-0 and hit Ricky Proehl for the winning TD in a 24-23 win over Jacksonville."},
  {"date":"2018-09-09","title":"Record football crowd at the stadium","text":"A stadium-record football crowd of 74,532 watched Carolina beat Dallas 16-8."},
  {"date":"2011-09-11","title":"Cam Newton's 422-yard debut","text":"Newton threw for 422 yards at Arizona, a record for a rookie in his first start."},
  {"date":"2015-09-13","title":"15-1 season begins","text":"Carolina opened its 2015 run with a 20-9 win at Jacksonville."},
  {"date":"2008-09-14","title":"Muhsin Muhammad reaches 10,000 yards","text":"Muhammad became the 29th player in NFL history with 10,000 career receiving yards."},
  {"date":"1997-09-21","title":"Mike McCormack enters Hall of Honor","text":"Founding president and GM Mike McCormack was the first inductee into the Panthers Hall of Honor."},
  {"date":"2025-09-21","title":"30-0 shutout of Atlanta","text":"The Panthers' home opener produced their first shutout since 2020."},
  {"date":"1998-09-27","title":"Sam Mills enters Hall of Honor","text":"Linebacker Sam Mills became the second member of the Panthers Hall of Honor."},
  {"date":"2017-10-01","title":"Win in Foxborough, 33-30","text":"Carolina beat New England on the road, its first win in Foxborough since 1995."},
  {"date":"2019-10-06","title":"2019 Hall of Honor class inducted","text":"Delhomme, Gross, Smith Sr. and Walls were inducted at halftime against Jacksonville."},
  {"date":"2022-10-10","title":"Matt Rhule fired after 1-4 start","text":"Carolina dismissed Rhule; Steve Wilks became interim head coach."},
  {"date":"2025-10-12","title":"Comeback win over Dallas, 30-27","text":"Beating the Cowboys got the Panthers back to .500 for the first time since 2021."},
  {"date":"1998-10-13","title":"Kerry Collins waived","text":"Carolina waived its first-ever draft pick, QB Kerry Collins."},
  {"date":"2019-10-13","title":"First international game: win in London","text":"Carolina beat Tampa Bay in London, its first regular-season game outside the U.S."},
  {"date":"1995-10-15","title":"First win in franchise history","text":"Carolina beat the New York Jets 26-15 for its first regular-season victory."},
  {"date":"2022-10-20","title":"McCaffrey traded to San Francisco","text":"Carolina sent Christian McCaffrey to the 49ers for a package of draft picks.","uncertain":true},
  {"date":"2015-10-25","title":"First 6-0 start in team history","text":"A win over Philadelphia made the Panthers 6-0 for the first time."},
  {"date":"1993-10-26","title":"Carolina awarded NFL franchise","text":"NFL owners unanimously named Carolina the league's 29th franchise."},
  {"date":"2024-10-26","title":"Stadium attendance record","text":"The Concert for Carolina drew a record 82,193 to Bank of America Stadium."},
  {"date":"2023-10-29","title":"Peppers, Muhammad join Hall of Honor","text":"Julius Peppers and Muhsin Muhammad were inducted at halftime against Houston."},
  {"date":"2025-11-02","title":"Upset win at Lambeau Field","text":"Carolina beat Green Bay 16-13 on the road."},
  {"date":"1995-11-05","title":"Expansion team topples the champs","text":"The first-year Panthers won 13-7 at San Francisco, the defending Super Bowl champion."},
  {"date":"2021-11-11","title":"Cam Newton returns to Carolina","text":"Newton signed a one-year deal to come back to the Panthers."},
  {"date":"2013-11-15","title":"Founding president Mike McCormack dies","text":"Hall of Famer and first Panthers president/GM Mike McCormack died at 83."},
  {"date":"2025-11-16","title":"Overtime win over Atlanta","text":"The Panthers beat the Falcons 30-27 in overtime."},
  {"date":"2013-11-18","title":"Monday night win over New England","text":"Cam Newton hit Ted Ginn Jr. late and Robert Lester's end-zone INT sealed a 24-20 win."},
  {"date":"2015-11-26","title":"First Thanksgiving game: 33-14 at Dallas","text":"The Panthers won their first Thanksgiving game to move to 11-0."},
  {"date":"2023-11-27","title":"Frank Reich fired after 11 games","text":"Carolina dismissed Reich after a 1-10 start; Chris Tabor took over as interim."},
  {"date":"2008-11-30","title":"DeAngelo Williams' four-TD day","text":"Williams ran for a franchise-record four touchdowns in a 35-31 win at Green Bay."},
  {"date":"2025-11-30","title":"Panthers beat the Rams, 31-28","text":"Carolina handed Los Angeles a regular-season loss in a game that foreshadowed a playoff rematch."},
  {"date":"2019-12-03","title":"Ron Rivera fired","text":"Carolina dismissed its winningest coach; Perry Fewell became interim coach."},
  {"date":"2015-12-06","title":"2015 NFC South clinched","text":"A 41-38 win at New Orleans clinched the division with four weeks to spare."},
  {"date":"2015-12-13","title":"13-0 with a 38-0 rout of Atlanta","text":"Carolina blanked the Falcons and clinched a first-round bye."},
  {"date":"1987-12-15","title":"Carolinas enter the expansion race","text":"Richardson publicly announced the Carolinas' bid for an NFL expansion team."},
  {"date":"2017-12-17","title":"Jerry Richardson announces sale","text":"The founder announced he would sell the team, hours after a win over Green Bay."},
  {"date":"2015-12-20","title":"14-0 after win at the Giants","text":"The Panthers held off New York 38-35 to stay unbeaten."},
  {"date":"1996-12-22","title":"Season finale win over Pittsburgh","text":"Carolina beat the Steelers 18-14 to finish 12-4 in its second season."},
  {"date":"2015-12-27","title":"Perfect run ends at Atlanta","text":"Carolina's first 2015 loss, 20-13 to the Falcons, left it 14-1."},
  {"date":"1998-12-28","title":"Dom Capers fired","text":"The Panthers dismissed their first head coach one day after the 1998 finale."},
  {"date":"2008-12-28","title":"2008 NFC South title clinched","text":"A 33-31 win at New Orleans gave Carolina the division and the NFC's No. 2 seed."},
  {"date":"2014-12-28","title":"Back-to-back NFC South titles","text":"Carolina won 34-3 at Atlanta to take the division at 7-8-1."},
  {"date":"2013-12-29","title":"2013 NFC South title clinched","text":"A 21-20 win at Atlanta secured the division and a first-round bye."},
  {"date":"2019-12-29","title":"McCaffrey joins 1,000-1,000 club","text":"Christian McCaffrey became the third player with 1,000 rushing and 1,000 receiving yards in a season."}
];

// Panthers Hall of Honor (team hall), per panthers.com
const HALL_OF_HONOR = [
  {
    "name": "Mike McCormack",
    "year": 1997,
    "tag": "Founder",
    "blurb": "Founding team president and general manager."
  },
  {
    "name": "Sam Mills",
    "year": 1998,
    "tag": "#51 LB",
    "blurb": "His January 2004 “Keep Pounding” speech became the team’s motto. Hall of Fame 2022; #51 is the only retired number."
  },
  {
    "name": "Wesley Walls",
    "year": 2019,
    "tag": "#85 TE",
    "blurb": "Tight end and fan favorite of the late-1990s teams."
  },
  {
    "name": "Jake Delhomme",
    "year": 2019,
    "tag": "#17 QB",
    "blurb": "Quarterback of the 2003 “Cardiac Cats” Super Bowl XXXVIII team."
  },
  {
    "name": "Jordan Gross",
    "year": 2019,
    "tag": "#69 OT",
    "blurb": "Anchored the offensive line for 11 seasons."
  },
  {
    "name": "Steve Smith Sr.",
    "year": 2019,
    "tag": "#89 WR",
    "blurb": "Franchise leader with 12,197 receiving yards. In 2005 he led or tied for the NFL lead in catches (103), yards (1,563) and TDs (12)."
  },
  {
    "name": "Muhsin Muhammad",
    "year": 2023,
    "tag": "#87 WR",
    "blurb": "Receiver on the 2003 Super Bowl XXXVIII team."
  },
  {
    "name": "Julius Peppers",
    "year": 2023,
    "tag": "#90 DE",
    "blurb": "Franchise sack leader with 97. Hall of Fame 2024."
  }
];

// Franchise numbers through the 2025 season
const FRANCHISE = {
  awarded: 1993, firstSeason: 1995,
  nfcTitles: 2, divisionTitles: 7, playoffTrips: 9,
  regularSeason: '227-273-1', superBowls: '0-2',
  careerLeaders: [{"stat":"Passing Yards","player":"Cam Newton","value":29725},{"stat":"Rushing Yards","player":"Jonathan Stewart","value":7318},{"stat":"Receiving Yards","player":"Steve Smith Sr.","value":12197},{"stat":"Sacks","player":"Julius Peppers","value":97},{"stat":"Interceptions","player":"Chris Gamble","value":27}]
};

const MILESTONES = [
  { year: '1995', title: 'Inaugural season', text: 'Awarded to Charlotte in 1993 as the NFL’s 29th franchise, the Panthers went 7-9 under Dom Capers in 1995, the best record ever by a first-year expansion team. Home games that year were played at Clemson.' },
  { year: '1996', title: 'NFC West champs in year two', text: 'Moving into their new stadium, the Panthers won the division at 12-4 and reached the NFC Championship Game.' },
  { year: '2003', title: '“Cardiac Cats” & Super Bowl XXXVIII', text: 'Behind Jake Delhomme, Stephen Davis and Steve Smith Sr., Carolina won the NFC Championship, then fell 32-29 to New England in Super Bowl XXXVIII.' },
  { year: '2015', title: '15-1 and MVP Cam Newton', text: 'League MVP Cam Newton and Luke Kuechly (Pro Football Hall of Fame, Class of 2026) led a 15-1 season and a second NFC title. Carolina lost Super Bowl 50 to Denver, 24-10.' },
  { year: '2025', title: 'NFC South champions', text: 'In Dave Canales’ second season, Carolina won the NFC South at 8-9 and returned to the playoffs, falling 34-31 to the Rams in the Wild Card round.' }
];
