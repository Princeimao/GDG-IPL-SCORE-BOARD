import './MatchDetail.css';
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Scorecard from '../../components/Scorecard/Scorecard';
import MomentumGraph from '../../components/MomentumGraph/MomentumGraph';
import PhaseAnalysis from '../../components/PhaseAnalysis/PhaseAnalysis';

const PlayerStats = lazy(() => import('../../components/PlayerStats/PlayerStats'));
import { fetchMatchScorecard, computeMomentumData, computePhaseAnalysis } from '../../services/cricketApi';
import { useApp } from '../../context/AppContext';
import { POLL_INTERVAL } from '../../config/api';

const MatchDetail = () => {
  const { matchId } = useParams();
  const { dataMode, setQuotaExceeded } = useApp();
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('scorecard');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    setError(null);

    try {
      const data = await fetchMatchScorecard(matchId, dataMode === 'mock');
      setScorecard(data);
    } catch (e) {
      if (e.message === 'QUOTA_EXCEEDED') {
        setQuotaExceeded(true);
        setError('Daily API limit reached. Using mock simulation for analytics.');
      } else {
        setError('Could not load match statistics.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (dataMode !== 'live' || !scorecard || scorecard.matchEnded) {
      return undefined;
    }

    const timer = setInterval(() => loadData(true), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [scorecard, loadData, dataMode]);

  if (loading) {
    return <div className="md-loading"><div className="md-spinner" /><span>Fetching {dataMode} stats...</span></div>;
  }

  const momentumData = scorecard?.ballByBall ? computeMomentumData(scorecard.ballByBall) : [];
  const phases = scorecard?.ballByBall ? computePhaseAnalysis(scorecard.ballByBall) : null;

  return (
    <>
      <header className="topbar">
        <div>
          <Link to="/" className="back-btn" style={{ marginBottom: 8, display: 'inline-flex' }}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back
          </Link>
          <p className="tiny-label">Live Match Analytics · {dataMode.toUpperCase()} ENGINE</p>
          <h2 className="page-title">{scorecard?.teams?.[0]} vs {scorecard?.teams?.[1]}</h2>
        </div>
        <div className="topbar-actions">
          {scorecard?.matchStarted && !scorecard?.matchEnded && (
            <span className="status-pill">Live Match Stream</span>
          )}
          <button className={`ghost-button ${refreshing ? 'spinning' : ''}`} onClick={() => loadData(true)}>
            <RefreshCw size={14} style={{ marginRight: 8 }} /> Refresh
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="hero-grid">
        <article className="panel hero-main">
          <div className="hero-header">
            <div>
              <p className="kicker">{scorecard?.venue?.split(',')[0] || 'IPL Venue'}</p>
              <h3 className="match-title">{scorecard?.status}</h3>
              <p className="subtle-copy">
                {scorecard?.tossWinner ? `Toss: ${scorecard.tossWinner} chose to ${scorecard.tossChoice}` : 'Waiting for toss...'}
              </p>
            </div>
          </div>

          <div className="score-strip">
            <div>
              <p className="tiny-label">Current Innings</p>
              <p className="innings-label">{scorecard?.currentInnings?.team || 'N/A'}</p>
            </div>
            <div className="score-box">
              <p className="score-line">
                {scorecard?.currentInnings ? `${scorecard.currentInnings.runs}/${scorecard.currentInnings.wickets}` : 'Not started'}
              </p>
              <p className="score-context">
                {scorecard?.currentInnings ? `CRR: ${scorecard.currentInnings.runRate?.toFixed(2)} · ${scorecard.currentInnings.overs} overs` : 'Match yet to begin'}
              </p>
            </div>
          </div>
        </article>

        <article className="panel summary-panel">
          <div className="summary-topline">
            <div>
              <p className="tiny-label">Match Status</p>
              <p className="summary-emphasis">{scorecard?.matchEnded ? 'Completed' : 'Live'}</p>
            </div>
          </div>
          <div className="summary-grid">
            <div className="summary-stat">
              <p className="tiny-label">Venue</p>
              <p className="summary-value small">{scorecard?.venue}</p>
            </div>
            <div className="summary-stat">
              <p className="tiny-label">Match Type</p>
              <p className="summary-value small">{scorecard?.matchType}</p>
            </div>
          </div>
        </article>
      </div>

      <nav className="section-tabs" style={{ marginTop: 20 }}>
        <button className={`section-tab ${activeSection === 'scorecard' ? 'active' : ''}`} onClick={() => setActiveSection('scorecard')}>Scorecard</button>
        <button className={`section-tab ${activeSection === 'momentum' ? 'active' : ''}`} onClick={() => setActiveSection('momentum')}>Momentum</button>
        <button className={`section-tab ${activeSection === 'phases' ? 'active' : ''}`} onClick={() => setActiveSection('phases')}>Phase Analysis</button>
      </nav>

      <div className="md-content" style={{ marginTop: 20 }}>
        {activeSection === 'scorecard' && <Scorecard scorecard={scorecard} onPlayerClick={setSelectedPlayer} />}
        {activeSection === 'momentum' && <MomentumGraph data={momentumData} />}
        {activeSection === 'phases' && phases && <PhaseAnalysis phases={phases} />}
      </div>

      {selectedPlayer && (
        <Suspense fallback={null}>
          <PlayerStats
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        </Suspense>
      )}
    </>
  );
};

export default MatchDetail;
