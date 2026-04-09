import './Atmosphere.css';
import { useState, useEffect } from 'react';
import { Ghost, Zap, Heart, Flame, MessageCircle, Twitter, Instagram, RefreshCw, MessageSquare, ExternalLink, Hash, Sparkles } from 'lucide-react';
import { fetchGlobalSocialPulse } from '../../services/cricketApi';

const Atmosphere = ({ scorecard }) => {
  const [tension, setTension] = useState(0);
  const [sentiment, setSentiment] = useState({ pos: 60, neg: 20, neutral: 20 });
  const [moodEmoji, setMoodEmoji] = useState('😊');
  const [liveReactions, setLiveReactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bestComment, setBestComment] = useState(null);

  const matchName = scorecard?.name || 'IPL Match';

  useEffect(() => {
    if (scorecard && scorecard.currentInnings) {
      calculateTension();
      if (liveReactions.length === 0) loadHive();
    }
  }, [scorecard]);

  const loadHive = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Fetch RAW data directly from real sources (via our optimized crawler)
      const rawData = await fetchGlobalSocialPulse(matchName);
      
      if (rawData && rawData.length > 0) {
        // Simple local sentiment heuristic (no AI needed for results)
        const processed = rawData.map(r => {
          const text = r.text.toLowerCase();
          let s = 'neu';
          if (text.match(/wow|great|best|boundary|wicket|amazing|win|🔥|🚀|😍/)) s = 'pos';
          else if (text.match(/bad|worst|lose|choke|angry|slow|😡|📉/)) s = 'neg';
          
          return { ...r, sentiment: s, user: r.author };
        });

        setLiveReactions(processed);
        
        // Find best comment locally by "word density" or randomness (Real Human voices)
        const best = [...processed].sort((a,b) => b.text.length - a.text.length)[0];
        setBestComment(best);

        const posCount = processed.filter(d => d.sentiment === 'pos').length;
        const negCount = processed.filter(d => d.sentiment === 'neg').length;
        const total = processed.length;
        
        setSentiment({
          pos: Math.round((posCount / total) * 100) || 33,
          neg: Math.round((negCount / total) * 100) || 33,
          neutral: Math.round(((total - posCount - negCount) / total) * 100) || 34
        });
      }
    } catch (e) {
      console.error('Hive Sync Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateTension = () => {
    const { runs, wickets, overs, runRate, target } = scorecard.currentInnings || {};
    if (!overs) return;

    let t = 0;
    t += (wickets || 0) * 12;
    if (overs > 15) t += (overs - 15) * 15;
    if (target) {
      const remainingRuns = target - runs;
      const remainingBalls = (20 - overs) * 6;
      const rrr = (remainingRuns / remainingBalls) * 6;
      if (rrr > 10) t += (rrr - 10) * 8;
    }

    const finalTension = Math.min(100, Math.max(0, t));
    setTension(finalTension);

    if (finalTension > 80) setMoodEmoji('🔥');
    else if (finalTension > 60) setMoodEmoji('😰');
    else if (finalTension > 40) setMoodEmoji('👀');
    else setMoodEmoji('🏏');
  };

  return (
    <div className="atmosphere-card">
      <div className="atmo-header">
        <div className="atmo-title">
          <Zap size={16} color="#10b981" />
          <span>Real-Time Atmosphere Engine</span>
        </div>
        <div className="atmo-mood">{moodEmoji} tension</div>
      </div>

      <div className="atmo-body">
        {/* Tension Meter */}
        <div className="tension-section">
          <div className="atmo-label">Match Tension Index</div>
          <div className="tension-bar-shell">
            <div 
              className="tension-fill" 
              style={{ 
                width: `${tension}%`, 
                background: tension > 75 ? '#ef4444' : tension > 50 ? '#f5a623' : '#10b981' 
              }} 
            />
            <div className="tension-val">{Math.round(tension)}%</div>
          </div>
        </div>

        {/* Best Reaction Card */}
        {bestComment && (
          <div className="best-comment-box">
             <div className="atmo-label" style={{ color: '#f5a623' }}>
                <Sparkles size={11} style={{ marginRight: 5 }} /> 
                Fan Voice of the Match
             </div>
             <div className="best-comment-card">
                <div className="buzz-meta">
                  <div className="buzz-p">
                    {bestComment.platform === 'twitter' ? <Twitter size={11} color="#1da1f2" /> : 
                     bestComment.platform === 'reddit' ? <MessageSquare size={11} color="#ff4500" /> :
                     <Instagram size={11} color="#e4405f" />}
                    <span>{bestComment.user}</span>
                  </div>
                  <span className="buzz-time">{bestComment.time}</span>
                </div>
                <p className="best-text">{bestComment.text}</p>
                <div className="best-engagement">
                   <div className="eng-item"><Flame size={10} /> Viral</div>
                   <div className="eng-item"><Heart size={10} /> Authentic</div>
                </div>
             </div>
          </div>
        )}

        {/* Sentiment Sentiment */}
        <div className="sentiment-section" style={{ marginTop: 24 }}>
          <div className="atmo-header-sub">
            <div className="atmo-label">Live Sentiment Barometer</div>
            <button 
              className={`sent-refresh ${loading ? 'spinning' : ''}`}
              onClick={loadHive}
              disabled={loading}
              title="Sync with global social stream"
            >
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="sent-bar">
            <div className="sent-seg pos" style={{ width: `${sentiment.pos}%` }}>{sentiment.pos}%</div>
            <div className="sent-seg neu" style={{ width: `${sentiment.neutral}%` }}>{sentiment.neutral}%</div>
            <div className="sent-seg neg" style={{ width: `${sentiment.neg}%` }}>{sentiment.neg}%</div>
          </div>
        </div>

        {/* Live Social Buzz */}
        <div className="social-buzz">
          <div className="atmo-label">Global Community Pulse</div>
          <div className="buzz-list-container">
            <div className="buzz-list">
              {liveReactions.map((r, i) => (
                <div key={i} className={`buzz-item ${r.sentiment}`}>
                  <div className="buzz-meta">
                    <div className="buzz-p">
                      {r.platform === 'twitter' ? <Twitter size={11} color="#1da1f2" /> : 
                       r.platform === 'reddit' ? <MessageSquare size={11} color="#ff4500" /> :
                       r.platform === 'instagram' ? <Instagram size={11} color="#e4405f" /> :
                       <ExternalLink size={11} color="#8b5cf6" />}
                      <span>{r.user}</span>
                    </div>
                    <span className="buzz-time">{r.time}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
              {liveReactions.length === 0 && (
                <div className="buzz-empty">CRAWLING GLOBAL SOURCES...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Atmosphere;
