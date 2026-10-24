// NFC South records used by the Playoff Machine tab.
//
// UPDATE THESE EVERY WEEK: after a week's games finish, set NFC_SOUTH_AS_OF_WEEK to that week and fix the
// records below. The Playoff Machine simulates every Panthers divisional game AFTER that week.

const NFC_SOUTH_AS_OF_WEEK = 6;

const initialNfcSouth = [
  {"name":"Carolina Panthers","key":"CAR","wins":3,"losses":2},
  {"name":"Tampa Bay Buccaneers","key":"TB","wins":1,"losses":5},
  {"name":"Atlanta Falcons","key":"ATL","wins":2,"losses":4},
  {"name":"New Orleans Saints","key":"NO","wins":2,"losses":4}
];
