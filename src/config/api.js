// ============================================================
// API CONFIGURATION
// Replace these keys with your own from:
//   CricAPI (CricketData.org): https://www.cricketdata.org/
//   NewsAPI: https://newsapi.org/
// ============================================================

export const CRICAPI_KEY = import.meta.env.VITE_CRICAPI_KEY || 'YOUR_CRICAPI_KEY';
export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'YOUR_NEWS_API_KEY';

// Base URLs
export const CRICAPI_BASE = 'https://api.cricapi.com/v1';
export const NEWS_BASE = 'https://newsapi.org/v2';

// Endpoints
export const ENDPOINTS = {
  // CricAPI
  currentMatches: `${CRICAPI_BASE}/currentMatches`,
  matchInfo: (id) => `${CRICAPI_BASE}/match_info?apikey=${CRICAPI_KEY}&id=${id}`,
  matchScorecard: (id) => `${CRICAPI_BASE}/match_scorecard?apikey=${CRICAPI_KEY}&id=${id}`,
  playerInfo: (id) => `${CRICAPI_BASE}/players_info?apikey=${CRICAPI_KEY}&id=${id}`,
  seriesMatches: (id) => `${CRICAPI_BASE}/series_info?apikey=${CRICAPI_KEY}&id=${id}`,

  // NewsAPI
  playerNews: (playerName) =>
    `${NEWS_BASE}/everything?q=${encodeURIComponent(playerName + ' cricket IPL')}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`,
};

// IPL 2026 Series ID (update with current season)
export const IPL_SERIES_ID = 'c75f3b96-7b7c-4896-934c-d63f5a7e1da4';

// Polling interval (ms) - 30 seconds for live updates
export const POLL_INTERVAL = 30000;
