# 🏏 IPL 2026 Cricket Dashboard: The Oracle Match Center

A premium, broadcast-grade cricket dashboard designed for the ultimate IPL fan. This application transforms raw cricket data into a high-fidelity, interactive "Match Command Center" using real-time APIs and Cutting-Edge AI.

![Dashboard Preview](https://img.shields.io/badge/UI-Broadcast--Grade-brightgreen)
![Intelligence](https://img.shields.io/badge/AI-Gemini--3.1--Flash--Lite-blue)
![Theme](https://img.shields.io/badge/Aesthetics-Glassmorphism-purple)

## 🚀 Key Features

### 1. 🎯 Oracle AI: Tactical Command
Powered by **Google Gemini 3.1 Flash Lite**, this module provides real-time win probability and expert tactical insights. It analyzes the score, venue, and current momentum to predict the winner ball-by-ball.

### 2. 🐦 Real-Time Twitter Pulse
A live "Social Hive" that tracks match-specific hashtags (e.g., `#IPL2026`, `#RCBvsKKR`) directly from Twitter. 
- **Sentiment Barometer**: Analyzes the global mood (Positive/Neutral/Negative) of the match conversation.
- **Fan Voice of the Match**: A "Hall of Fame" card that highlights the most impactful fan comment in real-time.

### 3. ⚡ Stadium Atmosphere Engine
A dynamic "Tension Index" that calculates the match pressure using a custom algorithm (based on wickets, remaining runs, and overs). Watch the meter move from "🏏 Chilled" to "🔥 Extreme Pressure" as the game hits the wire.

### 4. 🏟️ Interactive Wagon Wheel & Heatmaps
Visualizewhere the runs are coming from with an SVG-based field map. Animated "Shot Lines" and "Delivery Dots" show the batter's shot distribution and bowler's accuracy.

### 5. 🗳️ FanPulse Voting
Integrated community interaction system allowing fans to vote for their supporting team. Includes **Anti-Spam Persistence** via localStorage to ensure one vote per match.

### 6. 📊 Strategic Scoreboard
- **Live Player Inference**: Uses our proprietary logic to identify the batter-on-strike and the current bowler even if the source API data is nested.
- **In-Depth Stats**: Real-time SR, Economy, and Over-by-Over breakdowns.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite 6
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphism)
- **Icons**: Lucide-React
- **Intelligence**: Google Gemini 1.5/3.1 (Generative AI)
- **Data APIs**: 
  - CricAPI (Match Data)
  - Twitter v2 API (Social Sentiment)
  - Reddit Public JSON (Fallback)

---

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd IPL_SCORE_BOARD
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_CRICAPI_KEY=your_cricapi_key
   VITE_GEMINI_API_KEY=your_google_gemini_key
   VITE_TWITTER_BEARER_TOKEN=your_twitter_v2_token
   VITE_NEWS_API_KEY=your_news_api_key
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy
The dashboard uses the **"Emerald Kinetic"** design system—a dark-mode interface with neon emerald and amber accents, inspired by modern sports broadcast graphics (like Star Sports and Sky Sports). It features smooth CSS animations, subtle micro-interactions, and a fully responsive layout for second-screen mobile usage.

---
*Created for the IPL 2026 Fan Engagement Hackathon.*
