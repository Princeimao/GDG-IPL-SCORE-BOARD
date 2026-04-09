import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { Radio, Activity } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <span>🏏</span>
          </div>
          <div className="logo-text">
            <span className="logo-title">IPL</span>
            <span className="logo-sub">SCOREBOARD</span>
          </div>
        </Link>

        {/* Center Nav */}
        <div className="navbar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Radio size={14} />
            Live Dashboard
          </Link>
          <span className="nav-link nav-link-static">
            <Activity size={14} />
            No Login Mode
          </span>
        </div>

        {/* Right */}
        <div className="navbar-right">
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
          <div className="ipl-season">IPL 2026</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
