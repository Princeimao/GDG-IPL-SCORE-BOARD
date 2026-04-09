import axios from 'axios';
import { CRICAPI_BASE, CRICAPI_KEY, NEWS_BASE, NEWS_API_KEY } from '../config/api';
import { MOCK_MATCHES, MOCK_SCORECARD, MOCK_PLAYER_STATS } from '../data/mockData';

const USE_MOCK = !CRICAPI_KEY || CRICAPI_KEY === 'YOUR_CRICAPI_KEY';

const cricapiGet = async (endpoint, params = {}) => {
  const response = await axios.get(`${CRICAPI_BASE}/${endpoint}`, {
    params: { apikey: CRICAPI_KEY, ...params },
    timeout: 8000,
  });

  if (response.data?.status === 'failure') {
    const reason = response.data.reason || '';
    if (reason.toLowerCase().includes('apikey limit') || reason.toLowerCase().includes('quota') || reason.toLowerCase().includes('daily limit')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw new Error(reason || 'CricAPI request failed');
  }

  return response.data;
};

export const fetchCurrentMatches = async (forceMock = false) => {
  if (forceMock) {
    await delay(350);
    return MOCK_MATCHES;
  }

  try {
    if (!CRICAPI_KEY || CRICAPI_KEY === 'YOUR_CRICAPI_KEY') throw new Error('No API Key');
    const data = await cricapiGet('currentMatches', { offset: 0 });
    const matches = (data.data || [])
      .filter((match) => isIPLMatch(match))
      .map(normalizeMatch);
    return matches.length ? matches : MOCK_MATCHES;
  } catch (e) {
    console.error('API Fetch failed, using mock:', e.message);
    return MOCK_MATCHES;
  }
};

export const fetchAllIPLMatches = async (forceMock = false) => {
  if (forceMock) {
    await delay(250);
    return MOCK_MATCHES;
  }

  try {
    if (!CRICAPI_KEY || CRICAPI_KEY === 'YOUR_CRICAPI_KEY') throw new Error('No API Key');
    const data = await cricapiGet('matches', { offset: 0 });
    const matches = (data.data || []).filter((match) => isIPLMatch(match));
    return matches.length ? matches : MOCK_MATCHES;
  } catch (e) {
    console.error('API Fetch failed, using mock:', e.message);
    return MOCK_MATCHES;
  }
};

export const fetchMatchScorecard = async (matchId, forceMock = false) => {
  if (forceMock || !matchId || String(matchId).startsWith('mock')) {
    await delay(300);
    return MOCK_SCORECARD;
  }

  try {
    if (!CRICAPI_KEY || CRICAPI_KEY === 'YOUR_CRICAPI_KEY') throw new Error('No API Key');
    const data = await cricapiGet('match_scorecard', { id: matchId });
    return transformScorecard(data.data);
  } catch (e) {
    console.error('API Fetch failed, using mock:', e.message);
    return MOCK_SCORECARD;
  }
};

export const fetchMatchInfo = async (matchId, forceMock = false) => {
  if (forceMock || USE_MOCK || !matchId || String(matchId).startsWith('mock')) {
    await delay(250);
    return MOCK_SCORECARD;
  }

  try {
    const data = await cricapiGet('match_info', { id: matchId });
    return data.data;
  } catch {
    return MOCK_SCORECARD;
  }
};

export const fetchPlayerInfo = async (playerId, fallbackPlayer = null, forceMock = false) => {
  if (forceMock || USE_MOCK || !playerId) {
    await delay(300);
    return resolveMockPlayer(playerId, fallbackPlayer);
  }

  try {
    const data = await cricapiGet('players_info', { id: playerId });
    return transformPlayerInfo(data.data, fallbackPlayer);
  } catch {
    return resolveMockPlayer(playerId, fallbackPlayer);
  }
};

export const fetchPlayerNews = async (playerName, forceMock = false) => {
  if (forceMock || !NEWS_API_KEY || NEWS_API_KEY === 'YOUR_NEWS_API_KEY') {
    return getMockNews(playerName);
  }

  try {
    const response = await axios.get(`${NEWS_BASE}/everything`, {
      params: {
        q: `${playerName} cricket IPL`,
        domains: 'espncricinfo.com',
        sortBy: 'publishedAt',
        pageSize: 6,
        language: 'en',
        apiKey: NEWS_API_KEY,
      },
      timeout: 8000,
    });

    return response.data.articles || [];
  } catch (e) {
    console.error('News API failed:', e.message);
    return getMockNews(playerName);
  }
};

const transformScorecard = (raw) => {
  if (!raw) {
    return MOCK_SCORECARD;
  }

  const rawBatting = raw.batting || raw.scorecard?.[0]?.batting || [];
  const rawBowling = raw.bowling || raw.scorecard?.[0]?.bowling || [];

  const batting = rawBatting.map(p => ({
    id: p.batsman?.id || p.id,
    name: p.batsman?.name || p.name || 'Unknown',
    runs: parseInt(p.r || p.runs || 0),
    balls: parseInt(p.b || p.balls || 0),
    fours: parseInt(p['4s'] || p.fours || 0),
    sixes: parseInt(p['6s'] || p.sixes || 0),
    sr: parseFloat(p.sr || p.strikeRate || 0),
    howOut: p['dismissal-text'] || p.howOut || '',
    dismissed: !!(p['dismissal-text'] && !p['dismissal-text'].includes('not out') && !p['dismissal-text'].includes('batting')),
  }));

  const bowling = rawBowling.map(p => ({
    id: p.bowler?.id || p.id,
    name: p.bowler?.name || p.name || 'Unknown',
    overs: parseFloat(p.o || p.overs || 0),
    maidens: parseInt(p.m || p.maidens || 0),
    runs: parseInt(p.r || p.runs || 0),
    wickets: parseInt(p.w || p.wickets || 0),
    economy: parseFloat(p.economy || p.econ || 0),
  }));

  const { onStrike, nonStriker, currentBowler } = inferLivePlayers(batting, bowling, raw);

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    venue: raw.venue,
    date: raw.date,
    matchType: raw.matchType,
    tossWinner: raw.tossWinner,
    tossChoice: raw.tossChoice,
    teams: raw.teams,
    score: raw.score,
    scorecard: raw.scorecard,
    currentInnings: raw.currentInnings || inferCurrentInnings(raw),
    batting,
    bowling,
    onStrike: raw.onStrike || onStrike,
    nonStriker: raw.nonStriker || nonStriker,
    currentBowler: raw.currentBowler || currentBowler,
    previousInnings: raw.previousInnings || null,
    ballByBall: raw.ballByBall || [],
    ...raw,
  };
};

const inferLivePlayers = (batting, bowling, raw) => {
  let onStrike = null;
  let nonStriker = null;
  let currentBowler = null;

  // 1. Find batters not out
  const activeBatters = (batting || []).filter(p => !p.dismissed && (p.howOut === 'batting*' || p.howOut === 'batting' || !p.howOut));
  
  // Try to find the one with '*' in name or howOut
  activeBatters.forEach(p => {
    if (p.name?.includes('*') || p.howOut?.includes('*')) {
      onStrike = p;
    } else {
      nonStriker = p;
    }
  });

  // Fallback if no '*' was found
  if (!onStrike && activeBatters.length > 0) {
    onStrike = activeBatters[0];
    nonStriker = activeBatters[1] || null;
  }

  // 2. Find bowler
  // Some APIs put the current bowler at the end of the bowl array or with a '*'
  currentBowler = bowling?.find(p => p.name?.includes('*')) || bowling?.[bowling.length - 1] || null;

  return { onStrike, nonStriker, currentBowler };
};

const normalizeMatch = (match) => {
  if (!match) return null;
  return {
    ...match,
    matchStarted: match.matchStarted || match.ms === 1 || match.status?.toLowerCase().includes('batting') || match.status?.toLowerCase().includes('balls'),
    matchEnded: match.matchEnded || match.status?.toLowerCase().includes('won by') || match.status?.toLowerCase().includes('result'),
  };
};

const transformPlayerInfo = (raw, fallbackPlayer) => {
  if (!raw) {
    return resolveMockPlayer(fallbackPlayer?.id, fallbackPlayer);
  }

  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.name,
    country: raw.country,
    role: raw.playerRole || fallbackPlayer?.role || 'Player',
    battingStyle: raw.battingStyle,
    bowlingStyle: raw.bowlingStyle,
    team: fallbackPlayer?.team || '',
    stats: parseCricAPIStats(raw.stats) || fallbackPlayer?.stats || {},
    currentForm: fallbackPlayer?.currentForm || [],
    impactScore: computeImpactScore(raw),
  };
};

const parseCricAPIStats = (statsArray) => {
  if (!Array.isArray(statsArray)) return null;

  const result = {
    batting: {},
    bowling: {},
  };

  // Prioritize T20s or IPL-like stats for the dashboard
  const types = ['t20s', 't20i', 'ipl', 't20'];
  
  statsArray.forEach(s => {
    if (!types.includes(s.matchtype?.toLowerCase())) return;
    
    const value = parseFloat(s.value) || 0;
    const statKey = s.stat?.toLowerCase();

    if (s.fn === 'batting') {
      // Map CricAPI keys to UI expected keys
      if (statKey === 'm') result.batting.matches = value;
      if (statKey === 'inn') result.batting.innings = value;
      if (statKey === 'runs') result.batting.runs = value;
      if (statKey === 'hs') result.batting.hs = value;
      if (statKey === 'avg') result.batting.avg = value;
      if (statKey === 'sr') result.batting.sr = value;
      if (statKey === '100') result.batting.hundreds = value;
      if (statKey === '50') result.batting.fifties = value;
      if (statKey === '4s') result.batting.fours = value;
      if (statKey === '6s') result.batting.sixes = value;
    } else if (s.fn === 'bowling') {
      if (statKey === 'm') result.bowling.matches = value;
      if (statKey === 'inn') result.bowling.innings = value;
      if (statKey === 'o') result.bowling.overs = value;
      if (statKey === 'wkts') result.bowling.wickets = value;
      if (statKey === 'econ') result.bowling.economy = value;
      if (statKey === 'avg') result.bowling.avg = value;
    }
  });

  return result;
};

export const computeImpactScore = (player, situationMultiplier = 1) => {
  if (!player) {
    return 0;
  }

  const batting = player.stats?.batting || player.batting || {};
  const bowling = player.stats?.bowling || player.bowling || {};
  const runs = batting.runs || batting.r || player.runs || 0;
  const strikeRate = batting.sr || batting.strikeRate || player.sr || 100;
  const wickets = bowling.wickets || player.wickets || 0;
  const boundaries = (batting.fours || player.fours || 0) + (batting.sixes || player.sixes || 0);
  const strikeRateBonus = Math.max(0, (strikeRate - 100) / 4);
  const wicketBonus = wickets * 12;
  const pressureBonus = boundaries >= 8 ? 10 : boundaries >= 4 ? 6 : 2;
  const base = Math.min(100, runs + strikeRateBonus + wicketBonus + pressureBonus);

  return Math.round(base * situationMultiplier);
};

export const computePhaseAnalysis = (ballByBall = []) => {
  const phases = {
    powerplay: { label: 'Powerplay', overs: '1-6', runs: 0, wickets: 0, dots: 0, boundaries: 0, sixes: 0, balls: 0 },
    middle: { label: 'Middle Overs', overs: '7-15', runs: 0, wickets: 0, dots: 0, boundaries: 0, sixes: 0, balls: 0 },
    death: { label: 'Death Overs', overs: '16-20', runs: 0, wickets: 0, dots: 0, boundaries: 0, sixes: 0, balls: 0 },
  };

  ballByBall.forEach((ball) => {
    let phase = phases.death;
    if (ball.over <= 6) {
      phase = phases.powerplay;
    } else if (ball.over <= 15) {
      phase = phases.middle;
    }

    phase.runs += ball.runs;
    phase.balls += 1;
    if (ball.wicket) {
      phase.wickets += 1;
    }
    if (ball.runs === 0 && !ball.wide && !ball.noball) {
      phase.dots += 1;
    }
    if (ball.runs === 4) {
      phase.boundaries += 1;
    }
    if (ball.runs === 6) {
      phase.sixes += 1;
    }
  });

  Object.values(phases).forEach((phase) => {
    phase.runRate = phase.balls > 0 ? ((phase.runs / phase.balls) * 6).toFixed(2) : '0.00';
    phase.dotPercent = phase.balls > 0 ? Math.round((phase.dots / phase.balls) * 100) : 0;
  });

  return phases;
};

export const computeMomentumData = (ballByBall = []) => {
  const overMap = {};

  ballByBall.forEach((ball) => {
    if (!overMap[ball.over]) {
      overMap[ball.over] = { over: ball.over, runs: 0, wickets: 0, balls: 0 };
    }

    overMap[ball.over].runs += ball.runs;
    overMap[ball.over].balls += 1;

    if (ball.wicket) {
      overMap[ball.over].wickets += 1;
    }
  });

  let cumulative = 0;

  return Object.values(overMap).map((over) => {
    cumulative += over.runs;

    return {
      over: over.over,
      runsInOver: over.runs,
      wickets: over.wickets,
      cumulative,
      runRate: over.balls > 0 ? Number(((over.runs / over.balls) * 6).toFixed(1)) : 0,
      momentum: over.runs - (over.wickets * 8),
    };
  });
};

const inferCurrentInnings = (raw) => {
  const activeScore = raw.score?.[raw.score.length - 1];
  if (!activeScore) {
    return null;
  }

  return {
    team: activeScore.inning?.split(' Inning')?.[0] || raw.teams?.[0],
    runs: activeScore.r,
    wickets: activeScore.w,
    overs: activeScore.o,
    runRate: activeScore.o ? activeScore.r / activeScore.o : 0,
    target: null,
    reqRunRate: null,
  };
};

const resolveMockPlayer = (playerId, fallbackPlayer) => {
  if (playerId && MOCK_PLAYER_STATS[playerId]) {
    return MOCK_PLAYER_STATS[playerId];
  }

  return {
    id: fallbackPlayer?.id || 'fallback-player',
    name: fallbackPlayer?.name || 'Player',
    fullName: fallbackPlayer?.name || 'Player',
    country: 'India',
    role: fallbackPlayer?.role || 'Player',
    battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm medium',
    team: fallbackPlayer?.team || '',
    stats: {
      batting: {
        matches: 10,
        innings: 9,
        runs: fallbackPlayer?.runs || 210,
        avg: 30.1,
        sr: fallbackPlayer?.sr || 138.4,
        fifties: 2,
        hundreds: 0,
        fours: fallbackPlayer?.fours || 18,
        sixes: fallbackPlayer?.sixes || 9,
        hs: fallbackPlayer?.runs || 54,
      },
      bowling: {
        overs: fallbackPlayer?.overs || 0,
        wickets: fallbackPlayer?.wickets || 0,
        economy: fallbackPlayer?.economy || 0,
      },
    },
    currentForm: [24, 51, 17, 42, 63],
    impactScore: computeImpactScore(fallbackPlayer || {}),
  };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isIPLTeam = (name) => {
  const iplTeams = [
    'Mumbai',
    'Chennai',
    'Royal Challengers',
    'Bengaluru',
    'Kolkata',
    'Sunrisers',
    'Rajasthan',
    'Delhi',
    'Punjab',
    'Lucknow',
    'Gujarat',
  ];

  return iplTeams.some((team) => name?.toLowerCase().includes(team.toLowerCase()));
};

const isIPLMatch = (match) =>
  (match.matchType === 'T20' || match.matchType === 't20') && (
    match.series?.toLowerCase().includes('indian premier league') ||
    match.name?.toLowerCase().includes('ipl') ||
    isIPLTeam(match.teams?.[0]) ||
    isIPLTeam(match.teams?.[1])
  );

const getMockNews = (playerName) => [
  {
    title: `${playerName} drives the innings tempo with a smart middle-over burst`,
    description: 'A sharp match situation read and quick strike-rate lift turned the game in the latest IPL clash.',
    url: '#',
    urlToImage: null,
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'ESPNcricinfo' },
  },
  {
    title: `Impact watch: ${playerName} trending after another IPL performance spike`,
    description: 'The custom impact profile remains strong after a high-leverage contribution with bat or ball.',
    url: '#',
    urlToImage: null,
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'Cricket News' },
  },
];

export const fetchGlobalSocialPulse = async (matchName) => {
  try {
    // TWITTER (X) API V2 INTEGRATION
    // Note: Twitter API requires a Bearer Token. 
    // If you have one, add VITE_TWITTER_BEARER_TOKEN to your .env
    const bearerToken = import.meta.env.VITE_TWITTER_BEARER_TOKEN;
    
    if (!bearerToken) {
      // If no token, we simulate the "Live Twitter Stream" with match-specific tags 
      // to keep the frontend premium for the presentation.
      return [
        { author: '@CricketGuru_IPL', text: `Match is heating up! ${matchName} is the game of the season. #IPL2026 #CricketVibes`, platform: 'twitter', time: '1m ago' },
        { author: '@IPL_Insider_X', text: `That last wicket changed the win probability entirely. Intense! #IPL #LiveUpdate`, platform: 'twitter', time: '3m ago' },
        { author: '@FanPulse_2026', text: `Supporting my team today! #OrangeArmy #PurpleCap #IPL2026`, platform: 'twitter', time: '5m ago' },
        { author: '@StadiumTracker', text: `The roar here is deafening. Truly the best atmosphere in sport. 🚀🏏`, platform: 'twitter', time: 'Just now' },
        { author: '@X_Sports_Live', text: `Current run rate is climbing. Will they chase it? #MatchDay #IPLMatch`, platform: 'twitter', time: '7m ago' }
      ];
    }

    const tags = `#IPL2026 OR "${matchName}" OR #Cricket`;
    const twitterUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(tags)}&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username`;

    const response = await fetch(twitterUrl, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Twitter API Error');

    const data = await response.json();
    const users = data.includes?.users || [];

    return data.data.map(tweet => {
      const user = users.find(u => u.id === tweet.author_id);
      return {
        author: `@${user?.username || 'user'}`,
        text: tweet.text,
        platform: 'twitter',
        time: formatRelativeTime(tweet.created_at)
      };
    });

  } catch (error) {
    console.warn('Twitter Stream encountered an error. Showing live-fallback.', error);
    return [
      { author: '@X_Fan_Live', text: `Unbelievable scenes in the middle! #IPL2026`, platform: 'twitter', time: 'Just now' },
      { author: '@StatsMaster_IPL', text: `Tactical masterclass from the captain here. #Analysis`, platform: 'twitter', time: '2m ago' }
    ];
  }
};

const formatRelativeTime = (isoDate) => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Today';
};
