// ============================================================
// Mock / Demo Data — used when API key is absent or for dev
// ============================================================

export const MOCK_MATCHES = [
  {
    id: 'mock-match-001',
    name: 'Mumbai Indians vs Chennai Super Kings',
    matchType: 'T20',
    status: 'MI won by 14 runs',
    venue: 'Wankhede Stadium, Mumbai',
    date: '2026-04-09',
    dateTimeGMT: '2026-04-09T14:00:00',
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    teamInfo: [
      { name: 'Mumbai Indians', shortname: 'MI', img: '' },
      { name: 'Chennai Super Kings', shortname: 'CSK', img: '' },
    ],
    score: [
      { r: 203, w: 5, o: 20, inning: 'Mumbai Indians Inning 1' },
      { r: 189, w: 9, o: 20, inning: 'Chennai Super Kings Inning 1' },
    ],
    series_id: 'ipl-2026',
    matchStarted: true,
    matchEnded: true,
  },
  {
    id: 'mock-match-002',
    name: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
    matchType: 'T20',
    status: '1st Innings - KKR batting',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: '2026-04-09',
    dateTimeGMT: '2026-04-09T18:00:00',
    teams: ['Royal Challengers Bengaluru', 'Kolkata Knight Riders'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru', shortname: 'RCB', img: '' },
      { name: 'Kolkata Knight Riders', shortname: 'KKR', img: '' },
    ],
    score: [
      { r: 156, w: 3, o: 14.2, inning: 'Kolkata Knight Riders Inning 1' },
    ],
    series_id: 'ipl-2026',
    matchStarted: true,
    matchEnded: false,
  },
  {
    id: 'mock-match-003',
    name: 'Gujarat Titans vs Rajasthan Royals',
    matchType: 'T20',
    status: 'Starts in 4 hours',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    date: '2026-04-10',
    dateTimeGMT: '2026-04-10T19:30:00',
    teams: ['Gujarat Titans', 'Rajasthan Royals'],
    teamInfo: [
      { name: 'Gujarat Titans', shortname: 'GT', img: '' },
      { name: 'Rajasthan Royals', shortname: 'RR', img: '' },
    ],
    score: [],
    series_id: 'ipl-2026',
    matchStarted: false,
    matchEnded: false,
  },
  {
    id: 'mock-match-004',
    name: 'Delhi Capitals vs Punjab Kings',
    matchType: 'T20',
    status: 'DC won by 6 wickets',
    venue: 'Arun Jaitley Stadium, Delhi',
    date: '2026-04-08',
    dateTimeGMT: '2026-04-08T19:30:00',
    teams: ['Delhi Capitals', 'Punjab Kings'],
    teamInfo: [
      { name: 'Delhi Capitals', shortname: 'DC', img: '' },
      { name: 'Punjab Kings', shortname: 'PBKS', img: '' },
    ],
    score: [
      { r: 167, w: 8, o: 20, inning: 'Punjab Kings Inning 1' },
      { r: 168, w: 4, o: 18.2, inning: 'Delhi Capitals Inning 1' },
    ],
    series_id: 'ipl-2026',
    matchStarted: true,
    matchEnded: true,
  },
  {
    id: 'mock-match-005',
    name: 'Sunrisers Hyderabad vs Lucknow Super Giants',
    matchType: 'T20',
    status: 'Starts tomorrow',
    venue: 'Rajiv Gandhi International Stadium, Hyderabad',
    date: '2026-04-11',
    dateTimeGMT: '2026-04-11T19:30:00',
    teams: ['Sunrisers Hyderabad', 'Lucknow Super Giants'],
    teamInfo: [
      { name: 'Sunrisers Hyderabad', shortname: 'SRH', img: '' },
      { name: 'Lucknow Super Giants', shortname: 'LSG', img: '' },
    ],
    score: [],
    series_id: 'ipl-2026',
    matchStarted: false,
    matchEnded: false,
  },
];

export const MOCK_SCORECARD = {
  id: 'mock-match-002',
  name: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
  status: 'Kolkata Knight Riders are batting',
  venue: 'M. Chinnaswamy Stadium, Bengaluru',
  date: '2025-04-09',
  matchType: 'T20',
  tossWinner: 'Royal Challengers Bengaluru',
  tossChoice: 'bowl',

  // Current Innings
  currentInnings: {
    team: 'Kolkata Knight Riders',
    runs: 156,
    wickets: 3,
    overs: 14.2,
    runRate: 10.89,
    target: null,
    reqRunRate: null,
  },

  // Batting - current innings
  batting: [
    { name: 'Sunil Narine', runs: 42, balls: 24, fours: 5, sixes: 2, sr: 175.0, dismissed: true, howOut: 'c Kohli b Siraj', id: 'p001' },
    { name: 'Philip Salt', runs: 28, balls: 18, fours: 3, sixes: 1, sr: 155.5, dismissed: true, howOut: 'b Hazlewood', id: 'p002' },
    { name: 'Angkrish Raghuvanshi', runs: 56, balls: 38, fours: 6, sixes: 2, sr: 147.4, dismissed: false, howOut: 'batting*', id: 'p003' },
    { name: 'Rinku Singh', runs: 21, balls: 17, fours: 1, sixes: 1, sr: 123.5, dismissed: false, howOut: 'batting*', id: 'p004' },
    { name: 'Venkatesh Iyer', runs: 9, balls: 7, fours: 1, sixes: 0, sr: 128.5, dismissed: true, howOut: 'lbw b Maxwell', id: 'p005' },
  ],

  // Already batted (out in innings)
  alreadyBatted: [
    { name: 'Sunil Narine', runs: 42, balls: 24, dismissed: true },
    { name: 'Philip Salt', runs: 28, balls: 18, dismissed: true },
    { name: 'Venkatesh Iyer', runs: 9, balls: 7, dismissed: true },
  ],

  // Bowling - current innings
  bowling: [
    { name: 'Mohammed Siraj', overs: 3, maidens: 0, runs: 28, wickets: 1, economy: 9.33, id: 'bp001' },
    { name: 'Josh Hazlewood', overs: 3, maidens: 1, runs: 19, wickets: 1, economy: 6.33, id: 'bp002' },
    { name: 'Glenn Maxwell', overs: 2, maidens: 0, runs: 22, wickets: 1, economy: 11.0, id: 'bp003' },
    { name: 'Romario Shepherd', overs: 2, maidens: 0, runs: 31, wickets: 0, economy: 15.5, id: 'bp004' },
    { name: 'Virat Kohli', overs: 2, maidens: 0, runs: 21, wickets: 0, economy: 10.5, id: 'bp005' },
  ],

  // Ball-by-ball data for momentum chart
  ballByBall: [
    // Over 1
    { over: 1, ball: 1, runs: 1, wicket: false, wide: false, noball: false },
    { over: 1, ball: 2, runs: 6, wicket: false, wide: false, noball: false },
    { over: 1, ball: 3, runs: 0, wicket: false, wide: false, noball: false },
    { over: 1, ball: 4, runs: 4, wicket: false, wide: false, noball: false },
    { over: 1, ball: 5, runs: 1, wicket: false, wide: false, noball: false },
    { over: 1, ball: 6, runs: 0, wicket: false, wide: false, noball: false },
    // Over 2
    { over: 2, ball: 1, runs: 4, wicket: false, wide: false, noball: false },
    { over: 2, ball: 2, runs: 6, wicket: false, wide: false, noball: false },
    { over: 2, ball: 3, runs: 0, wicket: true, wide: false, noball: false },
    { over: 2, ball: 4, runs: 1, wicket: false, wide: false, noball: false },
    { over: 2, ball: 5, runs: 0, wicket: false, wide: false, noball: false },
    { over: 2, ball: 6, runs: 2, wicket: false, wide: false, noball: false },
    // Over 3
    { over: 3, ball: 1, runs: 0, wicket: false, wide: false, noball: false },
    { over: 3, ball: 2, runs: 4, wicket: false, wide: false, noball: false },
    { over: 3, ball: 3, runs: 4, wicket: false, wide: false, noball: false },
    { over: 3, ball: 4, runs: 0, wicket: false, wide: false, noball: false },
    { over: 3, ball: 5, runs: 1, wicket: false, wide: false, noball: false },
    { over: 3, ball: 6, runs: 6, wicket: false, wide: false, noball: false },
    // Over 4
    { over: 4, ball: 1, runs: 0, wicket: false, wide: false, noball: false },
    { over: 4, ball: 2, runs: 0, wicket: false, wide: false, noball: false },
    { over: 4, ball: 3, runs: 0, wicket: false, wide: false, noball: false },
    { over: 4, ball: 4, runs: 4, wicket: false, wide: false, noball: false },
    { over: 4, ball: 5, runs: 2, wicket: false, wide: false, noball: false },
    { over: 4, ball: 6, runs: 0, wicket: false, wide: false, noball: false },
    // Over 5
    { over: 5, ball: 1, runs: 4, wicket: false, wide: false, noball: false },
    { over: 5, ball: 2, runs: 6, wicket: false, wide: false, noball: false },
    { over: 5, ball: 3, runs: 1, wicket: false, wide: false, noball: false },
    { over: 5, ball: 4, runs: 4, wicket: false, wide: false, noball: false },
    { over: 5, ball: 5, runs: 0, wicket: false, wide: false, noball: false },
    { over: 5, ball: 6, runs: 2, wicket: false, wide: false, noball: false },
    // Over 6 (PP end)
    { over: 6, ball: 1, runs: 6, wicket: false, wide: false, noball: false },
    { over: 6, ball: 2, runs: 4, wicket: false, wide: false, noball: false },
    { over: 6, ball: 3, runs: 0, wicket: true, wide: false, noball: false },
    { over: 6, ball: 4, runs: 0, wicket: false, wide: false, noball: false },
    { over: 6, ball: 5, runs: 1, wicket: false, wide: false, noball: false },
    { over: 6, ball: 6, runs: 1, wicket: false, wide: false, noball: false },
    // Overs 7-14
    ...generateOvers(7, 14),
  ],

  // Previous innings
  previousInnings: null,

  // Current bowler & batsmen
  currentBowler: { name: 'Josh Hazlewood', overs: 3, maidens: 1, runs: 19, wickets: 1 },
  onStrike: { name: 'Angkrish Raghuvanshi', runs: 56, balls: 38 },
  nonStriker: { name: 'Rinku Singh', runs: 21, balls: 17 },
};

function generateOvers(from, to) {
  const balls = [];
  for (let o = from; o <= to; o++) {
    for (let b = 1; b <= 6; b++) {
      const r = Math.floor(Math.random() * 8);
      const w = r === 0 && Math.random() < 0.2;
      balls.push({ over: o, ball: b, runs: r, wicket: w, wide: false, noball: false });
    }
  }
  return balls;
}

export const MOCK_PLAYER_STATS = {
  p003: {
    id: 'p003',
    name: 'Angkrish Raghuvanshi',
    fullName: 'Angkrish Raghuvanshi',
    country: 'India',
    role: 'Batsman',
    battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm Off break',
    team: 'Kolkata Knight Riders',
    age: 19,
    stats: {
      batting: { matches: 14, innings: 13, runs: 389, avg: 35.4, sr: 152.7, fifties: 3, hundreds: 0, fours: 38, sixes: 21, hs: 74 },
      bowling: { overs: 2, wickets: 0, economy: 11.5 },
    },
    currentForm: [42, 8, 74, 31, 56, 12, 45],
    impactScore: 87,
  },
  p001: {
    id: 'p001',
    name: 'Sunil Narine',
    fullName: 'Sunil Philip Narine',
    country: 'West Indies',
    role: 'All-rounder',
    battingStyle: 'Left-handed',
    bowlingStyle: 'Right-arm Off break',
    team: 'Kolkata Knight Riders',
    age: 35,
    stats: {
      batting: { matches: 16, innings: 14, runs: 421, avg: 38.3, sr: 181.5, fifties: 3, hundreds: 0, fours: 41, sixes: 32, hs: 81 },
      bowling: { overs: 48, wickets: 12, economy: 7.1 },
    },
    currentForm: [81, 15, 42, 6, 38, 65, 42],
    impactScore: 94,
  },
};
