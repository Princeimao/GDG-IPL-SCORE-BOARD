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
    batting: raw.batting || raw.scorecard?.[0]?.batting || [],
    bowling: raw.bowling || raw.scorecard?.[0]?.bowling || [],
    onStrike: raw.onStrike || null,
    nonStriker: raw.nonStriker || null,
    currentBowler: raw.currentBowler || null,
    previousInnings: raw.previousInnings || null,
    ballByBall: raw.ballByBall || [],
    ...raw,
  };
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
    stats: raw.stats || fallbackPlayer?.stats || {},
    currentForm: fallbackPlayer?.currentForm || [],
    impactScore: computeImpactScore(raw),
  };
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
