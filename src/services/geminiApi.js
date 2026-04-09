import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`;

export const fetchAIWinPrediction = async (scorecard) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    return {
      prediction: "AI Insights unavailable. Please provide a VITE_GEMINI_API_KEY in .env",
      probability: { team1: 50, team2: 50 }
    };
  }

  if (!scorecard || !scorecard.currentInnings) {
    return {
      prediction: "Awaiting match start for AI analysis...",
      probability: { team1: 50, team2: 50 }
    };
  }

  const prompt = `
    Analyze the following IPL match situation and predict win probability.
    
    Match: ${scorecard.name}
    Venue: ${scorecard.venue}
    Score: ${scorecard.currentInnings.runs}/${scorecard.currentInnings.wickets} in ${scorecard.currentInnings.overs} overs.
    Target: ${scorecard.currentInnings.target || 'N/A'}
    
    Return the response ONLY as a JSON object:
    {
      "team1": {"prob": 60},
      "team2": {"prob": 40},
      "insight": "Expert tactical insight here..."
    }
  `;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Robust JSON extraction (removes ```json ... ``` blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    
    const result = JSON.parse(jsonMatch[0]);

    return {
      prediction: result.insight,
      probability: {
        team1: result.team1.prob,
        team2: result.team2.prob
      }
    };
  } catch (error) {
    console.error('Gemini Prediction Error:', error);
    return {
      prediction: "Match in critical phase. Every ball counts.",
      probability: { team1: 50, team2: 50 }
    };
  }
};

export const curateSocialIntelligence = async (matchName, score, rawData) => {
  if (!GEMINI_API_KEY || !rawData || rawData.length === 0) {
    return [];
  }

  const prompt = `
    You are a professional Social Media Curator for an IPL Broadcasting Dashboard.
    I have pulled some RAW data from Reddit and News sources about the match: ${matchName} (Current Score: ${score}).
    
    RAW DATA:
    ${JSON.stringify(rawData.slice(0, 15))}
    
    TASK:
    1. Transform these raw data points into 12 "Premium Social Cards".
    2. Ensure usernames are real (from author field).
    3. Clean the text: Remove technical technical gobbledygook like "click here to view full post", "old reddit", or ads.
    4. Rephrase slightly to make them sound like natural X (Twitter), Instagram, or Reddit "reactions".
    5. Assign a realistic sentiment: "pos", "neg", or "neu".
    6. Maintain the real relative timestamp (provided in raw data).
    
    Output JSON only in this format:
    [{ "user": "...", "text": "...", "platform": "twitter|instagram|reddit|threads", "sentiment": "pos|neg|neu", "time": "5m ago" }]
  `;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Curation Error:', error);
    // Fallback logic to show cleaned raw data if AI fails
    return rawData.slice(0, 10).map(r => ({
      user: r.author,
      text: r.text.substring(0, 80) + '...',
      platform: r.platform,
      sentiment: 'neu',
      time: 'Just now'
    }));
  }
};
