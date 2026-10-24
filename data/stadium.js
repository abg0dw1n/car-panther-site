// Stadium Tour content: everything the Stadium tab shows lives here.
// Researched Oct 24, 2026 from panthers.com, the CATS/Panthers Game Day Express release, Wikipedia and
// fan guides. Every item has a `src` rating:
//   'official' = stated by the Panthers / CATS / the stadium
//   'reported' = from a third-party guide (could be out of date)
//   'approx'   = a position or detail drawn by us; treat it as a rough guide
// The Panthers do not publish section-by-section maps for sun/shade or gates, so those are marked 'reported'.

const STADIUM_AS_OF = 'Oct 24, 2026';

const SRC_LABELS = {
  official: { text: 'Official', tone: 'text-emerald-400 border-emerald-500/50' },
  reported: { text: 'Fan-guide reported', tone: 'text-amber-400 border-amber-500/50' },
  approx:   { text: 'Approximate', tone: 'text-slate-400 border-slate-500/50' }
};

// Headline numbers
const STADIUM_FACTS = [
  { label: 'Capacity', value: '75,037', note: 'seats (Panthers)', src: 'official' },
  { label: 'First game', value: '1996', note: 'preseason Aug 3; first regular-season game Sept 1', src: 'reported' },
  { label: 'Cost', value: '$500M', note: 'to build', src: 'reported' },
  { label: 'Playing surface', value: 'FieldTurf', note: 'Vertex CORE, in use since 2021', src: 'reported' },
  { label: 'Suites', value: '151', note: 'on the 300 and 400 club levels', src: 'official' },
  { label: 'Home games in 2026', value: '9', note: 'Weeks 1, 4, 7, 9, 11, 14, 15, 17, 18', src: 'official' }
];

const STADIUM_HISTORY = [
  { year: '1996', text: 'The stadium opens as Ericsson Stadium. The Panthers play a preseason game there on Aug 3 and open the regular season at home on Sept 1 with a 29-6 win over Atlanta.' },
  { year: '2004', text: 'Renamed Bank of America Stadium.' },
  { year: '2016', text: 'Jan 24: the Panthers beat Arizona 49-15 here in the NFC Championship Game on the way to Super Bowl 50.' },
  { year: '2024', text: 'Oct 26: a concert sets the stadium attendance record at 82,193. The largest football crowd on record is 74,532 (Sept 9, 2018).' },
  { year: '2026', text: 'July: the planned renovation grows to $1.3 billion, with owner David Tepper adding $500 million privately. New traffic patterns around Morehead and Church Streets begin, and CATS launches the Game Day Express on Sept 13.' },
  { year: '2027–2030', text: 'Fan-facing construction begins in 2027, with completion targeted for 2030. The Panthers keep playing at the stadium throughout.' }
];

// ---- Seating bowl ---------------------------------------------------------------------------------------

const STADIUM_LEVELS = [
  { id: '100', name: '100 Level', short: 'Lower bowl', height: 5.5, back: 12,
    text: 'The lower bowl wraps the whole field and is closest to the action. Guest Relations booths sit on this level at each main gate.', src: 'official' },
  { id: '300', name: '300 Level', short: 'Club level', height: 31.5, back: 44,
    text: 'Club seats line both sidelines, with covered concourses and the Silver Club. The 300 and 400 levels hold the 151 suites; the press box is on 400.', src: 'official' },
  { id: '500', name: '500 Level', short: 'Upper deck', height: 57.5, back: 70,
    text: 'The upper deck is the highest and cheapest view, and it includes the Sky View Terraces. Every seat looks over the whole field.', src: 'official' }
];

// Each zone sets the camera for the seat-view simulator: where it sits around the field.
//   side: which edge of the field the seats are on (the camera looks at midfield from there)
const STADIUM_ZONES = [
  { id: 'home', name: 'Home sideline', short: 'Panthers side', cam: { x: 0, z: -1 }, src: 'reported',
    sun: 'Shaded', text: 'The west/southwest side, directly across from the visitors. Fan guides say this is the shady side for afternoon games.' },
  { id: 'visitors', name: 'Visitors sideline', short: 'Opponent side', cam: { x: 0, z: 1 }, src: 'reported',
    sun: 'Sunny', text: 'The east/northeast side. It gets the most direct sun in the afternoon, so bring sunglasses and sunscreen.' },
  { id: 'north', name: 'North end zone', short: 'North end', cam: { x: 1, z: 0 }, src: 'reported',
    sun: 'Mostly sunny', text: 'Behind the north goalposts. Fan guides say this end zone sees more sun than the south end.' },
  { id: 'south', name: 'South end zone', short: 'South end', cam: { x: -1, z: 0 }, src: 'reported',
    sun: 'Mostly shaded', text: 'Behind the south goalposts. Reported to get more shade than the north end.' },
  { id: 'corner-ne', name: 'North-east corner', short: 'NE corner', cam: { x: 1, z: 1 }, src: 'approx',
    sun: 'Sunny', text: 'A diagonal view of the north end zone and the visitors sideline.' },
  { id: 'corner-nw', name: 'North-west corner', short: 'NW corner', cam: { x: 1, z: -1 }, src: 'approx',
    sun: 'Mixed', text: 'A diagonal view of the north end zone and the Panthers sideline. Sun and shade vary by the time of day.' },
  { id: 'corner-se', name: 'South-east corner', short: 'SE corner', cam: { x: -1, z: 1 }, src: 'approx',
    sun: 'Mixed', text: 'A diagonal view of the south end zone and the visitors sideline. Sun and shade vary by the time of day.' },
  { id: 'corner-sw', name: 'South-west corner', short: 'SW corner', cam: { x: -1, z: -1 }, src: 'approx',
    sun: 'Shaded', text: 'A diagonal view of the south end zone and the Panthers sideline.' }
];

// Third-party sun/shade ranges (ShadedSeats.com, for a 4 p.m. game). The Panthers do not publish this
// and it is not specific to 1 p.m. kickoffs, so the section lookup labels it as an estimate.
const SHADE_RANGES = [
  { from: 126, to: 136, label: 'Shaded sideline' }, { from: 337, to: 350, label: 'Shaded sideline' }, { from: 535, to: 547, label: 'Shaded sideline' },
  { from: 107, to: 115, label: 'Sunny sideline' },  { from: 311, to: 320, label: 'Sunny sideline' },  { from: 510, to: 519, label: 'Sunny sideline' }
];

const CLUBS_NOTE = 'Premium spaces include the Silver Club (300 level, sideline), Gridiron Club, One Carolina Club, Goal Line West Club, The Vault and The Gallery. Exact locations vary between sources, so check your ticket.';

// ---- Interactive map --------------------------------------------------------------------------------------
// The map is a schematic (not to scale): north is up and the field runs north–south. Positions are
// approximate; use the details text for the real-world address or cross streets.

const MAP_LAYERS = [
  { id: 'gates',  label: 'Gates',         color: '#0085CA' },
  { id: 'fun',    label: 'Fan zones',     color: '#f59e0b' },
  { id: 'access', label: 'Getting there', color: '#22c55e' },
  { id: 'help',   label: 'Services',      color: '#e879f9' }
];

const STADIUM_PINS = [
  // ---- Gates
  { id: 'gate-n', tag: 'North Gate', layer: 'gates', icon: 'N', name: 'North Gate', x: 390, y: 60, src: 'reported',
    summary: 'Across from the Mint Street Parking Facility (Lot 1). Any ticket works at any gate.',
    details: ['Security screening happens on the street in front of the gate, before your ticket is scanned.', 'Two of the six “Indomitable Spirit” panther statues stand at each public gate.', 'Has an ADA ramp and elevator.', 'The Graham Street side (reported by a fan guide).'] },
  { id: 'gate-e', tag: 'East Gate', layer: 'gates', icon: 'E', name: 'East Gate (Blue Cross NC East Gate)', x: 560, y: 250, src: 'official',
    summary: 'On Mint Street, beside the team store and the Panthers Play Yard.',
    details: ['“Keep Pounding” statues stand at the North and East gates.', 'Has an ADA ramp and elevator.', 'Mint Street closes to traffic on game days.'] },
  { id: 'gate-s', tag: 'South Gate', layer: 'gates', icon: 'S', name: 'South Gate', x: 390, y: 445, src: 'reported',
    summary: 'On the Morehead Street side. All gates open 2 hours before kickoff.',
    details: ['The ADA drop-off is at Mint and Morehead, near this gate.', 'New 2026 traffic patterns affect Morehead Street, so allow extra time.', 'Has an ADA ramp and elevator.'] },

  // ---- Fan zones
  { id: 'store', tag: 'Team Store', layer: 'fun', icon: '🛍', name: 'Panthers Team Store', x: 610, y: 190, src: 'official',
    summary: 'Run by Fanatics at 800 S. Mint St.',
    details: ['Game-day hours: 9–10 a.m., then 11 a.m. until 30 minutes after the game, for ticket holders only.', 'Cashless with RFID checkout.', 'Smaller merchandise stands are on every level inside.'] },
  { id: 'samills', tag: 'Sam Mills', layer: 'fun', icon: '🗿', name: 'Sam Mills statue', x: 610, y: 305, src: 'official',
    summary: 'Along Mint Street, next to a fan autograph wall.',
    details: ['Sam Mills’ January 2004 “Keep Pounding” speech is the root of the team’s rallying cry.', 'An honorary guest hits the Keep Pounding drum before each home kickoff.'] },
  { id: 'playyard', tag: 'Play Yard', layer: 'fun', icon: '🎪', name: 'Panthers Play Yard', x: 600, y: 395, src: 'official',
    summary: 'The free pregame fan zone on the South Lawn Village, on Mint Street.',
    details: ['Opens 2 hours before kickoff.', 'Play 60 kids’ activities, a DJ, games and food.', 'You do not need a ticket for the Play Yard.'] },
  { id: 'legends', tag: 'Legends Row', layer: 'fun', icon: '🎁', name: 'Legends Row', x: 195, y: 150, src: 'official',
    summary: 'Partner giveaways and games on Graham Street.',
    details: ['Look for sponsor giveaways before the game.', 'Location is drawn approximately on this map.'] },

  // ---- Getting there
  { id: 'lot1', tag: 'Lot 1', layer: 'access', icon: 'P', name: 'Mint Street Parking Facility (Lot 1)', x: 280, y: 40, src: 'official',
    summary: 'Directly across from the North Gate at Mint and Graham.',
    details: ['7-foot clearance.', 'More than 30,000 private spaces sit within a 10–15 minute walk, run by many operators. Pre-book through SpotHero or ParkMobile.', 'Named decks include Mint Street Parking Deck (410 S Mint), Mint Street Garage (415 S Mint) and Panthers Parking Deck (423 W MLK Blvd).', 'Typical prices run $25–$60 (fan-guide estimate).'] },
  { id: 'rail-cc', tag: 'Conv. Center', layer: 'access', icon: '🚆', name: 'Convention Center station', x: 700, y: 120, src: 'official',
    summary: 'LYNX Blue Line, within blocks of the stadium.',
    details: ['Stonewall and Carson stations are the other nearby stops.', 'Position on this map is approximate.'] },
  { id: 'rail-stonewall', tag: 'Stonewall', layer: 'access', icon: '🚆', name: 'Stonewall station', x: 700, y: 245, src: 'reported',
    summary: 'LYNX Blue Line. A fan guide puts it about four blocks away.',
    details: ['Walk time is not published by the Panthers; guides suggest roughly 5–10 minutes.', 'Position on this map is approximate.'] },
  { id: 'rail-carson', tag: 'Carson', layer: 'access', icon: '🚆', name: 'Carson station', x: 700, y: 400, src: 'official',
    summary: 'LYNX Blue Line, within blocks of the stadium.',
    details: ['Position on this map is approximate.'] },
  { id: 'rideshare', tag: 'Rideshare', layer: 'access', icon: '🚕', name: 'Rideshare zone', x: 660, y: 40, src: 'official',
    summary: 'Third and Church Streets, next to Romare Bearden Park.',
    details: ['The taxi stand is on Church Street between First and Stonewall.', 'There are no dedicated stadium bike racks; racks are at Romare Bearden Park along Church Street.'] },
  { id: 'express', tag: 'Express bus', layer: 'access', icon: '🚌', name: 'Game Day Express boarding', x: 590, y: 40, src: 'official',
    summary: 'CATS express buses run to every 2026 home game. Boarding is on Brevard St between 3rd St and Brooklyn Village Ave.',
    details: ['$3.00 each way or $6.60 for a day pass, through the CATS-Pass app.', 'Inbound every 30 minutes starting 2½ hours before kickoff. Return trips begin 30 minutes after the game.', 'Routes extend the 64X (Matthews to Independence Pointe Pkwy), 177 North Meck Connector (Davidson, Cornelius, Northcross, Huntersville) and 61X Arboretum Express (Waverly, Arboretum, Strawberry Hill).'] },
  { id: 'ada-drop', tag: 'ADA drop-off', layer: 'access', icon: '♿', name: 'ADA drop-off', x: 560, y: 465, src: 'official',
    summary: 'Mint and Morehead.',
    details: ['There is no reserved handicap parking; placard spots at the Mint Street lot are first come, first served.', 'An Atrium Health ADA shuttle runs from 720 E. Morehead ($40 per vehicle, placard required).'] },

  // ---- Services
  { id: 'guest', tag: 'Guest Rel.', layer: 'help', icon: 'ℹ', name: 'Guest Relations', x: 330, y: 105, src: 'official',
    summary: 'Booths on the 100 level at each main gate, plus club desks near the sideline elevators.',
    details: ['Ask here for wheelchairs (100, 300 and 500 levels), KultureCity sensory kits and the Tag-a-Kid wristband program.', 'Phone for nursing rooms: 704-358-7000.'] },
  { id: 'nursing', tag: 'Nursing', layer: 'help', icon: '🍼', name: 'Nursing rooms', x: 450, y: 105, src: 'official',
    summary: 'Private rooms on each level, reached through Guest Relations.',
    details: ['Look for them across from sections 119, 129, 313, 525 and 543.', 'Family restrooms with changing tables are available, and all restrooms are ADA accessible.'] },
  { id: 'ada-seat', tag: 'ADA seating', layer: 'help', icon: '♿', name: 'Accessible seating info', x: 450, y: 395, src: 'official',
    summary: 'Accessible wheelchair seating is limited and first come, first served.',
    details: ['Reserve through Ticketmaster or the ticket office at 704-593-4100.', 'Elevators are at the North, South and East gates.'] }
];

// ---- Guided walkthrough: a path through the pins, in the order a fan would meet them -------------------

const STADIUM_TOUR = [
  { pin: 'express', text: 'Start where your trip ends. CATS Game Day Express buses drop off and board on Brevard Street, and the light rail stops are a few blocks east.' },
  { pin: 'rideshare', text: 'Prefer a ride? The rideshare zone is at Third and Church, beside Romare Bearden Park. Expect a short walk from there.' },
  { pin: 'store', text: 'Walk toward Mint Street. The Fanatics team store opens at 9 a.m. on game days, closes at 10, then reopens at 11.' },
  { pin: 'samills', text: 'Pause at the Sam Mills statue. His “Keep Pounding” speech is the heart of the team’s identity, and a guest drummer carries it on before every home kickoff.' },
  { pin: 'playyard', text: 'The free Panthers Play Yard opens two hours before kickoff, with games, music and food. No ticket needed.' },
  { pin: 'gate-e', text: 'Any gate takes any ticket. At the East Gate you pass the panther statues, clear security on the street, then scan your mobile ticket.' },
  { pin: 'guest', text: 'Inside, Guest Relations booths on the 100 level help with accessibility needs, sensory kits and lost kids.' },
  { pin: 'gate-n', text: 'Heading to your seat from the other side? The North Gate sits across from Lot 1, so fans who park there often come in here.' },
  { pin: 'gate-s', text: 'The South Gate is on the Morehead side, near the ADA drop-off. When you leave, expect crowds: Mint Street is closed to cars.' }
];

// ---- Game day planner & rules -----------------------------------------------------------------------------

// Minutes before kickoff, from the official game-day guide unless noted.
const GAMEDAY_STEPS = [
  { min: -150, text: 'Game Day Express buses start arriving (inbound every 30 min).', mode: 'express', src: 'official' },
  { min: -120, text: 'Gates open, and the free Panthers Play Yard opens.', src: 'official' },
  { min: -120, text: 'PurrCussion marches outside the stadium (about 2 hours before).', src: 'reported' },
  { min: -5,   text: 'Shortly before kickoff, an honorary guest hits the Keep Pounding drum.', src: 'reported' },
  { min: 0,    text: 'Kickoff.', src: 'official', key: true },
  { min: 135,  text: 'Alcohol sales end at the close of the third quarter (roughly 2¼ hours after kickoff).', src: 'official' },
  { min: 210,  text: 'Team store closes 30 minutes after the final whistle (assuming a game of about 3 hours).', src: 'official' },
  { min: 210,  text: 'Return buses start 30 minutes after the game ends.', mode: 'express', src: 'official' }
];

const TRANSPORT_TIPS = {
  drive: { label: '🚗 Drive & park', tips: ['Book parking ahead through SpotHero or ParkMobile; 30,000+ spaces are within a 10–15 minute walk.', 'Mint Street closes on game days. Morehead and Church have new traffic patterns in 2026, so check the Panthers traffic page before you leave.', 'Know your lot: Lot 1 (Mint Street Parking Facility) is across from the North Gate.'] },
  rail: { label: '🚆 Light rail', tips: ['Ride the LYNX Blue Line to Carson, Stonewall or Convention Center, then walk a few blocks.', 'Load your fare before you get to the platform.', 'Plan for a crowded ride home right after the game.'] },
  express: { label: '🚌 Game Day Express', tips: ['Board on Brevard Street between 3rd Street and Brooklyn Village Ave.', 'Routes: 64X (Matthews), 177 (North Meck), 61X (Arboretum). $3 each way or $6.60 for a day pass in the CATS-Pass app.', 'Buses run inbound every 30 minutes from 2½ hours before kickoff, and return trips begin 30 minutes after the game.'] },
  ride: { label: '🚕 Rideshare', tips: ['Get dropped off at the rideshare zone at Third and Church (next to Romare Bearden Park).', 'Expect surge pricing and long waits after the game. Walk a few blocks away before requesting your ride home.', 'The taxi stand is on Church Street between First and Stonewall.'] }
};

const ARRIVAL_GOALS = [
  { id: 'early', label: 'When gates open', offset: -120 },
  { id: 'relaxed', label: '1 hour early', offset: -60 },
  { id: 'justin', label: '30 minutes early', offset: -30 }
];

// NFL clear-bag rules as the Panthers enforce them. Sizes in inches.
const BAG_RULES = {
  clear: { name: 'Clear tote', max: [12, 12, 6], needsClear: true },
  freezer: { name: 'One-gallon freezer bag', max: null, needsClear: true, note: 'A one-gallon clear plastic freezer bag (Ziploc type) is allowed.' },
  clutch: { name: 'Small clutch', max: [6.5, 4.5, 0], needsClear: false, note: 'Small clutches up to 4.5" × 6.5" are allowed, even if not clear.' }
};

const BANNED_BAGS = ['Backpacks', 'Camera cases', 'Cinch bags', 'Computer bags', 'Diaper bags', 'Fanny packs'];

const PACKING_LIST = [
  'Mobile ticket added to your phone wallet (no paper tickets)',
  'Clear bag no larger than 12" × 6" × 12" (or a clutch up to 4.5" × 6.5")',
  'A credit or debit card, since the stadium is cashless',
  'Sunscreen and sunglasses for sunny-side seats',
  'A charged phone, since tickets and ordering are in the Panthers app',
  'Layers or a poncho. The stadium is open-air.'
];

const STADIUM_RULES = [
  'Mobile tickets only, through the Panthers app or Ticketmaster.',
  'Cashless: cards, touch-free payments, the Panthers app or prepaid debit.',
  'Gates open 2 hours before kickoff, and every gate accepts every ticket.',
  'Alcohol sales end at the close of the third quarter.',
  'The stadium is smoke-free, including vaping.',
  'Order food ahead in the Panthers app and get a text when it is ready.'
];

const ACCESS_NOTES = [
  'ADA ramps and elevators at the North, South and East gates.',
  'Accessible wheelchair seating is limited and first come, first served: Ticketmaster or 704-593-4100.',
  'Guest Relations booths (100 level, each gate) lend wheelchairs and KultureCity sensory kits.',
  'Nursing rooms on every level: call 704-358-7000.',
  'ADA drop-off at Mint and Morehead; Atrium Health shuttle from 720 E. Morehead ($40 per vehicle).'
];

const STADIUM_NOT_FOUND = 'We could not confirm: which gate leads to which sections, which side of the field the player tunnel is on, the exact home of the Keep Pounding drum, or first-aid station locations. Check with Guest Relations when you arrive.';
