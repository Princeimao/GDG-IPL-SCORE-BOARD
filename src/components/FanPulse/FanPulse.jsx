import './FanPulse.css';
import { useState, useEffect } from 'react';
import { Sparkles, Users, TrendingUp, Vote } from 'lucide-react';
import { fetchAIWinPrediction } from '../../services/geminiApi';

const FanPulse = ({ scorecard, team1, team2 }) => {
  const [userVote, setUserVote] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mockVotes, setMockVotes] = useState({ t1: 45, t2: 55 });

  const matchId = scorecard?.id || 'unknown';
  const team1Name = team1 || 'Team 1';
  const team2Name = team2 || 'Team 2';

  useEffect(() => {
    if (scorecard) {
      loadPrediction();
      
      // Load saved vote for this match
      const savedVote = localStorage.getItem(`vote_${matchId}`);
      if (savedVote) setUserVote(savedVote);

      setMockVotes({
        t1: Math.floor(Math.random() * 40) + 30,
        t2: 0
      });
    }
  }, [matchId]);

  const loadPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetchAIWinPrediction(scorecard);
      setPrediction(res);
    } catch {
      setPrediction({
        prediction: "The match is delicately balanced. Each side has opportunities to seize momentum.",
        probability: { team1: 50, team2: 50 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (t) => {
    if (userVote) return; // Prevent double voting
    
    setUserVote(t);
    localStorage.setItem(`vote_${matchId}`, t);

    setMockVotes(prev => ({
      ...prev,
      [t]: prev[t] + 1
    }));
  };

  const t1Percent = Math.round((mockVotes.t1 / (mockVotes.t1 + (mockVotes.t2 || 60))) * 100);
  const t2Percent = 100 - t1Percent;

  return (
    <div className="fan-pulse-card">
      <div className="pulse-header">
        <div className="pulse-title">
          <Sparkles size={16} color="#f5a623" />
          <span>AI Prediction</span>
        </div>
        {loading && <div className="pulse-loading">Syncing Match Intelligence...</div>}
      </div>

      <div className="pulse-content">
        {/* AI Prediction Section (Moved to Top) */}
        <div className="prediction-sec">
          <div className="prob-bar-row">
            <div className="prob-labels">
              <span>{team1Name} — {prediction?.probability?.team1 || 50}%</span>
              <span>{prediction?.probability?.team2 || 50}% — {team2Name}</span>
            </div>
            <div className="prob-wrapper">
              <div 
                className="prob-fill t1" 
                style={{ width: `${prediction?.probability?.team1 || 50}%` }}
              >
                {prediction?.probability?.team1}%
              </div>
              <div 
                className="prob-fill t2" 
                style={{ width: `${prediction?.probability?.team2 || 50}%` }}
              >
                {prediction?.probability?.team2}%
              </div>
            </div>
          </div>

          <div className="ai-insight">
            <TrendingUp size={14} className="insight-icon" />
            <p>{prediction?.prediction || "Generating tactical match analysis..."}</p>
          </div>
        </div>

        {/* Voting Section */}
        <div className="voting-sec" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="sec-label">
             <Vote size={13} /> 
             <span>Fan Sentiment {userVote && '(Voted)'}</span>
          </div>
          <div className="vote-options">
            <button 
              className={`vote-btn ${userVote === 't1' ? 'active' : ''} ${userVote ? 'disabled' : ''}`}
              onClick={() => handleVote('t1')}
              disabled={!!userVote}
            >
              <span className="v-name">{team1Name}</span>
              <span className="v-perc">{t1Percent}%</span>
            </button>
            <div className="v-divider">VS</div>
            <button 
              className={`vote-btn ${userVote === 't2' ? 'active' : ''} ${userVote ? 'disabled' : ''}`}
              onClick={() => handleVote('t2')}
              disabled={!!userVote}
            >
              <span className="v-name">{team2Name}</span>
              <span className="v-perc">{t2Percent}%</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanPulse;
