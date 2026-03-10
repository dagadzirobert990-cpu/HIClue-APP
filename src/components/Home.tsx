import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface Stats {
  matchesMade: string;
  compatibilityRate: string;
  activeUsers: number;
}

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="min-h-screen">
      <nav>
        <div className="logo">HI<span>Clue</span></div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">How It Works</a>
          <a href="#">Success Stories</a>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/signup" className="btn-cta">Join Now</Link>
          <button 
            onClick={toggleTheme}
            className="btn-login ml-2 p-2 rounded-full"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>

        <div className="hero-text">
          <h1>Every <span>Clue</span> Leads You Closer to Love.</h1>
          <p>Experience dating that goes beyond the surface. HIClue uses deep compatibility science to introduce you
            to people you truly connect with. Serious relationships start here.</p>
          <Link to="/quiz" className="btn-cta">Take the Compatibility Test</Link>
        </div>

        <div className="hero-visual">
          <div className="profile-card card-1">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80" alt="Profile 1" referrerPolicy="no-referrer" />
            <div className="card-content">
              <h3>Jessica, 27</h3>
              <p>Creative Director</p>
            </div>
          </div>

          <div className="profile-card card-2">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80" alt="Profile 2" referrerPolicy="no-referrer" />
            <div className="card-content">
              <h3>Eva Lovia, 30</h3>
              <p>Entrepreneur</p>
            </div>
          </div>

          <div className="clue-badge">
            <div className="clue-icon">🧩</div>
            <div className="clue-text">
              <small>Match Clue</small>
              <strong>Shared Love for Travel</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <h2>{stats?.matchesMade || '2M+'}</h2>
          <p>Matches Made</p>
        </div>
        <div className="stat-item">
          <h2>{stats?.compatibilityRate || '98%'}</h2>
          <p>Compatibility Rate</p>
        </div>
        <div className="stat-item">
          <h2>{stats?.activeUsers?.toLocaleString() || '150,000+'}</h2>
          <p>Active Users</p>
        </div>
      </section>

      <footer>
        <div className="footer-logo">HI<span>Clue</span></div>
        <p>Your all-in-one Dating platform. From an unknown person<br />
          to friends, friends to soulmate - married <br />
          couples</p>
        <br />
        <p className="text-pink-400">📧 Dagadzirobert990@gmail.com</p>
        <hr />
        <p>© 2026 HIClue. Privacy | Terms & Conditions | Safety</p>
        <p>Ringquest LLC</p>
        <p>Dragon street, KW 4049</p>
      </footer>
    </div>
  );
};

export default Home;
