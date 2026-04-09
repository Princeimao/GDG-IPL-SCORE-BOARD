import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import './App.css';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home/Home'));
const MatchDetail = lazy(() => import('./pages/MatchDetail/MatchDetail'));

// Premium fall-back loader
const PageLoader = () => (
  <div className="page-loader-screen">
    <div className="page-loader-spinner" />
    <p>Calibrating IPL Hub Stats...</p>
  </div>
);

const Sidebar = () => {
  const location = useLocation();
  const { dataMode, toggleDataMode } = useApp();

  return (
    <aside className="sidebar">
      <div>
        <p className="brand-kicker">Emerald Kinetic</p>
        <h1 className="brand-title">IPL Match Hub</h1>
        <p className="brand-copy">Live data stream for score, phases, player impact, and momentum.</p>
      </div>

      <nav className="nav-stack" aria-label="Primary">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'nav-item-active' : ''}`}>
          Live Command Center
        </Link>
      </nav>

      <div className="sidebar-cta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p className="tiny-label">Data Engine</p>
          <span className={`status-pill ${dataMode === 'live' ? '' : 'pill-mock'}`} style={{ padding: '4px 8px', fontSize: '10px' }}>
            {dataMode.toUpperCase()}
          </span>
        </div>
        <button
          className="ghost-button"
          style={{ width: '100%', fontSize: '12px', padding: '10px' }}
          onClick={toggleDataMode}
        >
          Switch to {dataMode === 'live' ? 'Mock Data' : 'Live API'}
        </button>
        <p className="sidebar-copy" style={{ marginTop: 12, fontSize: '11px' }}>
          {dataMode === 'live'
            ? 'Using real-time data from CricketData API.'
            : 'Using locally stored static data for demonstrations.'}
        </p>
      </div>
    </aside>
  );
}

const Layout = ({ children }) => {
  const { quotaExceeded } = useApp();
  return (
    <div className="app-shell">
      {quotaExceeded && (
        <div className="quota-banner">
          <div className="quota-banner-content">
            <strong>⚠️ API QUOTA REACHED:</strong> The daily limit for the real-time cricket API has been exhausted.
            The dashboard has automatically transitioned to <strong>High-Fidelity Mock Mode</strong> to demonstrate the analytics, momentum charts, and phase filtering functionality.
          </div>
        </div>
      )}
      <Sidebar />
      <main className="dashboard">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/match/:matchId" element={<MatchDetail />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
