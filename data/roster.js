// 2026 Carolina Panthers roster.
//
// Sources: bios and jersey numbers from panthers.com (cross-checked with footballdb.com); every `id` is the
// player's ESPN athlete id, verified against ESPN's athlete lookup. The id is also what builds the headshot
// URL, so a wrong id would show the wrong photo. Season stats come from Pro-Football-Reference and NFL.com
// and run through the week named in ROSTER_STATS_THROUGH. Practice squads change weekly.
//
// To update a stat line, edit the player's "stats" object. To add a player, copy a line and change the id.

const ROSTER_AS_OF = "Oct 24, 2026";
const ROSTER_STATS_THROUGH = "Week 6";

// ESPN's headshot images follow this pattern. js/roster.js falls back to a silhouette if an image fails to load.
function headshotUrl(espnId) {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;
}

// Team numbers shown on the head coach card (through ROSTER_STATS_THROUGH)
const panthersTeamStats = { pointsFor: 146, pointsAgainst: 123, gamesPlayed: 5, ppg: 29.2, oppPpg: 24.6, ppgRank: 4 };

const panthersStaff = [
  { name: "Dave Canales", title: "Head Coach" },
  { name: "Brad Idzik", title: "Offensive Coordinator (plays caller)" },
  { name: "Ejiro Evero", title: "Defensive Coordinator" },
  { name: "Tracy Smith", title: "Special Teams Coordinator" }
];

const panthersRoster = [
  {"id":4685720,"name":"Bryce Young","num":"9","pos":"QB","side":"offense","status":"Active","ht":"5' 10\"","wt":204,"age":25,"exp":4,"college":"Alabama","stats":{"gp":5,"passing":{"comp":121,"att":201,"yds":1549,"td":11,"int":2,"rating":98.5,"sacks":12},"rushing":{"att":9,"yds":25,"td":1}}},
  {"id":4240703,"name":"Kenny Pickett","num":"12","pos":"QB","side":"offense","status":"Active","ht":"6' 3\"","wt":218,"age":28,"exp":5,"college":"Pittsburgh","stats":{"gp":2,"passing":{"comp":0,"att":1,"yds":0,"td":0,"int":0,"rating":39.6,"sacks":0},"rushing":{"att":2,"yds":20,"td":0}}},
  {"id":4428993,"name":"Haynes King","num":"16","pos":"QB","side":"offense","status":"Active","ht":"6' 3\"","wt":215,"age":25,"exp":"Rookie","college":"Georgia Tech"},
  {"id":4685350,"name":"Trevor Etienne","num":"23","pos":"RB","side":"offense","status":"Active","ht":"5' 9\"","wt":204,"age":22,"exp":2,"college":"Georgia","stats":{"gp":1,"rushing":{"att":1,"yds":-1,"td":0}}},
  {"id":4239934,"name":"AJ Dillon","num":"28","pos":"RB","side":"offense","status":"Active","ht":"6' 0\"","wt":248,"age":28,"exp":7,"college":"Boston College","stats":{"gp":4,"rushing":{"att":17,"yds":43,"td":0},"receiving":{"rec":2,"tgt":2,"yds":3,"td":0},"defense":{"tackles":1,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4241416,"name":"Chuba Hubbard","num":"30","pos":"RB","side":"offense","status":"Active","ht":"6' 1\"","wt":216,"age":27,"exp":6,"college":"Oklahoma State","stats":{"gp":5,"rushing":{"att":89,"yds":426,"td":4},"receiving":{"rec":11,"tgt":13,"yds":85,"td":2}}},
  {"id":4709392,"name":"Anthony Tyus III","num":"34","pos":"RB","side":"offense","status":"Active","ht":"6' 1\"","wt":222,"age":23,"exp":1,"college":"Ohio","stats":{"gp":3,"defense":{"tackles":1,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4678008,"name":"Jonathon Brooks","num":"25","pos":"RB","side":"offense","status":"IR","ht":"6' 0\"","wt":216,"age":23,"exp":3,"college":"Texas","stats":{"gp":2,"rushing":{"att":9,"yds":30,"td":0}}},
  {"id":4685472,"name":"Tetairoa McMillan","num":"4","pos":"WR","side":"offense","status":"Active","ht":"6' 4\"","wt":220,"age":23,"exp":2,"college":"Arizona","stats":{"gp":5,"receiving":{"rec":32,"tgt":48,"yds":471,"td":2},"defense":{"tackles":0,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4567096,"name":"John Metchie III","num":"13","pos":"WR","side":"offense","status":"Active","ht":"6' 0\"","wt":204,"age":26,"exp":4,"college":"Alabama","stats":{"gp":4,"receiving":{"rec":7,"tgt":13,"yds":80,"td":1}}},
  {"id":4695883,"name":"Jalen Coker","num":"18","pos":"WR","side":"offense","status":"Active","ht":"6' 3\"","wt":215,"age":24,"exp":3,"college":"Holy Cross","stats":{"gp":4,"receiving":{"rec":24,"tgt":35,"yds":319,"td":2},"defense":{"tackles":0,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4212909,"name":"David Moore","num":"83","pos":"WR","side":"offense","status":"Active","ht":"6' 0\"","wt":219,"age":31,"exp":8,"college":"East Central","stats":{"gp":3,"receiving":{"rec":1,"tgt":3,"yds":27,"td":0},"defense":{"tackles":1,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4360763,"name":"Brycen Tremayne","num":"87","pos":"WR","side":"offense","status":"Active","ht":"6' 4\"","wt":212,"age":26,"exp":2,"college":"Stanford","stats":{"gp":5,"receiving":{"rec":6,"tgt":9,"yds":115,"td":0},"defense":{"tackles":6,"solo":4,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4430034,"name":"Xavier Legette","num":"17","pos":"WR","side":"offense","status":"IR","ht":"6' 3\"","wt":218,"age":25,"exp":3,"college":"South Carolina","stats":{"gp":2,"receiving":{"rec":2,"tgt":6,"yds":64,"td":0}}},
  {"id":5091739,"name":"Chris Brazzell II","num":"19","pos":"WR","side":"offense","status":"IR","ht":"6' 5\"","wt":197,"age":23,"exp":"Rookie","college":"Tennessee"},
  {"id":4428796,"name":"Casey Washington","num":"85","pos":"WR","side":"offense","status":"Practice Squad","ht":"6' 0\"","wt":205,"age":25,"exp":3,"college":"Illinois"},
  {"id":4876995,"name":"Ja'seem Reed","num":"86","pos":"WR","side":"offense","status":"Practice Squad","ht":"6' 2\"","wt":195,"age":23,"exp":1,"college":"San Diego","stats":{"gp":1,"receiving":{"rec":0,"tgt":1,"yds":0,"td":0}}},
  {"id":4431588,"name":"Ja'Tavion Sanders","num":"0","pos":"TE","side":"offense","status":"Active","ht":"6' 4\"","wt":243,"age":23,"exp":3,"college":"Texas"},
  {"id":4034948,"name":"Feleipe Franks","num":"81","pos":"TE","side":"offense","status":"Active","ht":"6' 6\"","wt":252,"age":28,"exp":4,"college":"Arkansas","stats":{"gp":5,"defense":{"tackles":4,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4372780,"name":"Tommy Tremble","num":"82","pos":"TE","side":"offense","status":"Active","ht":"6' 4\"","wt":247,"age":26,"exp":6,"college":"Notre Dame","stats":{"gp":5,"receiving":{"rec":15,"tgt":19,"yds":128,"td":2},"defense":{"tackles":0,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":1}}},
  {"id":4683243,"name":"Mitchell Evans","num":"84","pos":"TE","side":"offense","status":"Active","ht":"6' 5\"","wt":265,"age":23,"exp":2,"college":"Notre Dame","stats":{"gp":5,"rushing":{"att":1,"yds":1,"td":0},"receiving":{"rec":6,"tgt":8,"yds":66,"td":0}}},
  {"id":2576925,"name":"Darren Waller","num":"88","pos":"TE","side":"offense","status":"Active","ht":"6' 6\"","wt":238,"age":34,"exp":9,"college":"Georgia Tech","stats":{"gp":5,"receiving":{"rec":13,"tgt":21,"yds":148,"td":2}}},
  {"id":4870694,"name":"Monroe Freeling","num":"57","pos":"OT","side":"offense","status":"Active","ht":"6' 7\"","wt":323,"age":22,"exp":"Rookie","college":"Georgia"},
  {"id":4361429,"name":"Rasheed Walker","num":"63","pos":"OT","side":"offense","status":"Active","ht":"6' 6\"","wt":328,"age":26,"exp":5,"college":"Penn State"},
  {"id":4576075,"name":"Corey Bullock","num":"67","pos":"OT","side":"offense","status":"Active","ht":"6' 3\"","wt":325,"age":24,"exp":2,"college":"Maryland"},
  {"id":2973051,"name":"Taylor Moton","num":"72","pos":"OT","side":"offense","status":"Active","ht":"6' 5\"","wt":316,"age":32,"exp":10,"college":"Western Michigan"},
  {"id":4034962,"name":"Stone Forsythe","num":"73","pos":"OT","side":"offense","status":"Active","ht":"6' 8\"","wt":315,"age":28,"exp":6,"college":"Florida"},
  {"id":4427132,"name":"Ikem Ekwonu","num":"79","pos":"OT","side":"offense","status":"PUP","ht":"6' 4\"","wt":335,"age":25,"exp":5,"college":"NC State"},
  {"id":4035870,"name":"Jake Curhan","num":"71","pos":"OT","side":"offense","status":"Practice Squad","ht":"6' 6\"","wt":325,"age":28,"exp":6,"college":"California"},
  {"id":3917592,"name":"Robert Hunt","num":"50","pos":"OG","side":"offense","status":"Active","ht":"6' 6\"","wt":335,"age":30,"exp":7,"college":"Louisiana-Lafayette"},
  {"id":4696902,"name":"Torricelli Simpkins III","num":"65","pos":"OG","side":"offense","status":"Active","ht":"6' 5\"","wt":312,"age":24,"exp":2,"college":"South Carolina"},
  {"id":4362647,"name":"Damien Lewis","num":"68","pos":"OG","side":"offense","status":"Active","ht":"6' 2\"","wt":335,"age":29,"exp":7,"college":"LSU"},
  {"id":4256062,"name":"Brady Christensen","num":"70","pos":"OG","side":"offense","status":"IR","ht":"6' 6\"","wt":300,"age":30,"exp":6,"college":"BYU"},
  {"id":4242230,"name":"Saahdiq Charles","num":"78","pos":"OG","side":"offense","status":"Practice Squad","ht":"6' 4\"","wt":321,"age":27,"exp":5,"college":"LSU"},
  {"id":4874515,"name":"Sam Hecht","num":"75","pos":"C","side":"offense","status":"Active","ht":"6' 4\"","wt":305,"age":23,"exp":"Rookie","college":"Kansas State"},
  {"id":4035048,"name":"Luke Fortner","num":"77","pos":"C","side":"offense","status":"Active","ht":"6' 4\"","wt":305,"age":28,"exp":5,"college":"Kentucky"},
  {"id":4431551,"name":"Lee Hunter","num":"92","pos":"DT","side":"defense","status":"Active","ht":"6' 4\"","wt":315,"age":24,"exp":"Rookie","college":"Texas Tech","stats":{"gp":5,"defense":{"tackles":11,"solo":5,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4431077,"name":"TeRah Edwards","num":"93","pos":"DT","side":"defense","status":"Active","ht":"6' 2\"","wt":305,"age":25,"exp":1,"college":"Illinois","stats":{"gp":4,"defense":{"tackles":7,"solo":2,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4602967,"name":"Aaron Hall","num":"94","pos":"DT","side":"defense","status":"Active","ht":"6' 4\"","wt":300,"age":23,"exp":"Rookie","college":"Duke","stats":{"gp":5,"defense":{"tackles":10,"solo":3,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":1}}},
  {"id":4035495,"name":"Derrick Brown","num":"95","pos":"DT","side":"defense","status":"Active","ht":"6' 5\"","wt":330,"age":28,"exp":7,"college":"Auburn","stats":{"gp":5,"defense":{"tackles":13,"solo":9,"sacks":0,"ints":0,"passesDefensed":4,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4372518,"name":"Bobby Brown III","num":"97","pos":"DT","side":"defense","status":"Active","ht":"6' 4\"","wt":330,"age":26,"exp":6,"college":"Texas A&M","stats":{"gp":4,"defense":{"tackles":4,"solo":0,"sacks":0,"ints":0,"passesDefensed":1,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4058925,"name":"Tershawn Wharton","num":"98","pos":"DT","side":"defense","status":"Active","ht":"6' 1\"","wt":295,"age":28,"exp":7,"college":"Missouri-Rolla","stats":{"gp":1,"defense":{"tackles":1,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4687513,"name":"Cam Jackson","num":"99","pos":"DT","side":"defense","status":"IR","ht":"6' 6\"","wt":340,"age":24,"exp":2,"college":"Florida","stats":{"gp":1,"defense":{"tackles":2,"solo":2,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4875848,"name":"Parker Petersen","num":"69","pos":"DT","side":"defense","status":"Practice Squad","ht":"6' 4\"","wt":309,"age":23,"exp":"Rookie","college":"Wisconsin"},
  {"id":4712462,"name":"Keith Cooper Jr.","num":"96","pos":"DT","side":"defense","status":"Practice Squad","ht":"6' 5\"","wt":280,"age":23,"exp":1,"college":"Houston"},
  {"id":4429166,"name":"Princely Umanmielen","num":"3","pos":"OLB","side":"defense","status":"Active","ht":"6' 4\"","wt":255,"age":24,"exp":2,"college":"Mississippi","stats":{"gp":5,"defense":{"tackles":12,"solo":9,"sacks":3,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4242975,"name":"Jaelan Phillips","num":"5","pos":"OLB","side":"defense","status":"Active","ht":"6' 5\"","wt":265,"age":27,"exp":6,"college":"Miami","stats":{"gp":5,"defense":{"tackles":10,"solo":3,"sacks":2.5,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4714157,"name":"Thomas Incoom","num":"48","pos":"OLB","side":"defense","status":"Active","ht":"6' 4\"","wt":248,"age":27,"exp":4,"college":"Central Michigan","stats":{"gp":5,"defense":{"tackles":6,"solo":3,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":1}}},
  {"id":3917016,"name":"Trevis Gipson","num":"52","pos":"OLB","side":"defense","status":"Active","ht":"6' 4\"","wt":264,"age":29,"exp":7,"college":"Tulsa","stats":{"gp":5,"defense":{"tackles":4,"solo":3,"sacks":1,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4036063,"name":"Patrick Jones II","num":"91","pos":"OLB","side":"defense","status":"Active","ht":"6' 4\"","wt":260,"age":28,"exp":6,"college":"Pittsburgh","stats":{"gp":3,"defense":{"tackles":6,"solo":3,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4833355,"name":"Nic Scourton","num":"11","pos":"OLB","side":"defense","status":"IR","ht":"6' 2\"","wt":265,"age":22,"exp":2,"college":"Texas A&M"},
  {"id":4360773,"name":"Nick Hampton","num":null,"pos":"OLB","side":"defense","status":"Practice Squad","ht":"6' 3\"","wt":235,"age":26,"exp":4,"college":"Appalachian State"},
  {"id":4035232,"name":"Tyrel Dodson","num":"33","pos":"LB","side":"defense","status":"Active","ht":"6' 0\"","wt":242,"age":28,"exp":7,"college":"Texas A&M","stats":{"gp":3,"defense":{"tackles":7,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4875592,"name":"Jackson Kuwatch","num":"46","pos":"LB","side":"defense","status":"Active","ht":"6' 4\"","wt":234,"age":23,"exp":"Rookie","college":"Miami (Ohio)","stats":{"gp":5,"defense":{"tackles":4,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4243256,"name":"Devin Lloyd","num":"55","pos":"LB","side":"defense","status":"Active","ht":"6' 3\"","wt":243,"age":28,"exp":5,"college":"Utah","stats":{"gp":4,"defense":{"tackles":35,"solo":24,"sacks":2,"ints":2,"passesDefensed":3,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":3117253,"name":"Bobby Okereke","num":"58","pos":"LB","side":"defense","status":"Active","ht":"6' 2\"","wt":235,"age":30,"exp":8,"college":"Stanford","stats":{"gp":5,"defense":{"tackles":34,"solo":21,"sacks":1,"ints":1,"passesDefensed":4,"forcedFumbles":1,"fumbleRecoveries":0}}},
  {"id":4880613,"name":"Bam Martin-Scott","num":"54","pos":"LB","side":"defense","status":"IR","ht":"6' 2\"","wt":235,"age":26,"exp":2,"college":"South Carolina"},
  {"id":5279357,"name":"Mapalo Mwansa","num":"42","pos":"LB","side":"defense","status":"Practice Squad","ht":"6' 3\"","wt":234,"age":22,"exp":1,"college":null},
  {"id":4428125,"name":"Maema Njongmeta","num":"45","pos":"LB","side":"defense","status":"Practice Squad","ht":"6' 0\"","wt":230,"age":25,"exp":3,"college":"Wisconsin","stats":{"gp":1,"defense":{"tackles":3,"solo":2,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":1,"fumbleRecoveries":0}}},
  {"id":5151083,"name":"Will Lee III","num":"24","pos":"CB","side":"defense","status":"Active","ht":"6' 1\"","wt":195,"age":23,"exp":"Rookie","college":"Texas A&M","stats":{"gp":5,"defense":{"tackles":24,"solo":17,"sacks":0,"ints":0,"passesDefensed":7,"forcedFumbles":0,"fumbleRecoveries":1}}},
  {"id":4697636,"name":"Chau Smith-Wade","num":"26","pos":"CB","side":"defense","status":"Active","ht":"5' 11\"","wt":192,"age":24,"exp":3,"college":"Washington State","stats":{"gp":4,"defense":{"tackles":3,"solo":0,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4244607,"name":"Akayleb Evans","num":"29","pos":"CB","side":"defense","status":"Active","ht":"6' 2\"","wt":205,"age":27,"exp":5,"college":"Missouri","stats":{"gp":5,"defense":{"tackles":21,"solo":15,"sacks":0,"ints":0,"passesDefensed":2,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":3917853,"name":"Mike Jackson","num":"2","pos":"CB","side":"defense","status":"IR","ht":"6' 1\"","wt":210,"age":29,"exp":6,"college":"Miami","stats":{"gp":3,"defense":{"tackles":6,"solo":4,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4362847,"name":"Jaycee Horn","num":"8","pos":"CB","side":"defense","status":"IR","ht":"6' 1\"","wt":212,"age":26,"exp":6,"college":"South Carolina","stats":{"gp":3,"defense":{"tackles":6,"solo":4,"sacks":0,"ints":0,"passesDefensed":2,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4431426,"name":"Corey Thornton","num":"31","pos":"CB","side":"defense","status":"Practice Squad","ht":"6' 1\"","wt":204,"age":25,"exp":2,"college":"Louisville"},
  {"id":4685841,"name":"Zion Childress","num":"32","pos":"CB","side":"defense","status":"Practice Squad","ht":"5' 11\"","wt":203,"age":24,"exp":1,"college":"Kentucky"},
  {"id":4032200,"name":"Robert Rochell","num":"38","pos":"CB","side":"defense","status":"Practice Squad","ht":"6' 2\"","wt":195,"age":28,"exp":6,"college":"Central Arkansas","stats":{"gp":2,"defense":{"tackles":1,"solo":1,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4594449,"name":"DeVonta Smith","num":"43","pos":"CB","side":"defense","status":"Practice Squad","ht":"5' 11\"","wt":195,"age":23,"exp":"Rookie","college":"Notre Dame"},
  {"id":4362487,"name":"Tre'von Moehrig","num":"7","pos":"S","side":"defense","status":"Active","ht":"6' 2\"","wt":215,"age":27,"exp":6,"college":"TCU","stats":{"gp":5,"defense":{"tackles":21,"solo":11,"sacks":0.5,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4566384,"name":"Zakee Wheatley","num":"20","pos":"S","side":"defense","status":"Active","ht":"6' 2\"","wt":204,"age":24,"exp":"Rookie","college":"Penn State","stats":{"gp":4,"defense":{"tackles":18,"solo":14,"sacks":0,"ints":0,"passesDefensed":2,"forcedFumbles":1,"fumbleRecoveries":0}}},
  {"id":3116179,"name":"Nick Scott","num":"21","pos":"S","side":"defense","status":"Active","ht":"5' 11\"","wt":200,"age":31,"exp":8,"college":"Penn State","stats":{"gp":4,"defense":{"tackles":17,"solo":14,"sacks":0,"ints":0,"passesDefensed":1,"forcedFumbles":0,"fumbleRecoveries":1}}},
  {"id":4429110,"name":"Lathan Ransom","num":"22","pos":"S","side":"defense","status":"Active","ht":"6' 0\"","wt":202,"age":24,"exp":2,"college":"Ohio State","stats":{"gp":5,"defense":{"tackles":19,"solo":9,"sacks":0,"ints":0,"passesDefensed":2,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4035462,"name":"Isaiah Simmons","num":"27","pos":"S","side":"defense","status":"Active","ht":"6' 4\"","wt":232,"age":28,"exp":6,"college":"Clemson","stats":{"gp":5,"defense":{"tackles":4,"solo":2,"sacks":0,"ints":0,"passesDefensed":0,"forcedFumbles":0,"fumbleRecoveries":0}}},
  {"id":4568263,"name":"Ryan Fitzgerald","num":"10","pos":"K","side":"special","status":"Active","ht":"5' 11\"","wt":201,"age":26,"exp":2,"college":"Florida State","stats":{"gp":5,"kicking":{"fgm":11,"fga":11,"long":53,"xpm":11,"points":44}}},
  {"id":15928,"name":"Sam Martin","num":"6","pos":"P","side":"special","status":"Active","ht":"6' 1\"","wt":207,"age":36,"exp":14,"college":"Appalachian State","stats":{"gp":5,"punting":{"punts":18,"avg":46.6,"net":42.6,"in20":11,"long":61}}},
  {"id":11759,"name":"JJ Jansen","num":"44","pos":"LS","side":"special","status":"Active","ht":"6' 2\"","wt":245,"age":40,"exp":19,"college":"Notre Dame"}
];
