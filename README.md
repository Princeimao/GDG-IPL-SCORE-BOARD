# IPL Score Board

A Vite + React IPL scoreboard with:

- live IPL match cards
- a featured match dashboard on the home page
- batting and bowling score tables
- clickable player cards with impact score and news
- momentum graph
- phase analysis for powerplay, middle overs, and death overs
- mock fallback when live APIs are unavailable

## Setup

1. Copy `.env.example` to `.env`
2. Add `VITE_CRICAPI_KEY`
3. Optionally add `VITE_NEWS_API_KEY`
4. Run `npm run dev`

## Notes

- CricAPI powers live match data.
- News enrichment uses NewsAPI and filters to `espncricinfo.com` when a news key is configured.
- The UI is intentionally no-login and does not render any profile photo or account area.
