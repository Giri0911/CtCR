import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import "./App.css";

function App() {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Campus<span>Connect</span></div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Companies</a>
          <a href="#">Opportunities</a>
          <a href="#">About</a>
        </div>

        <div className="nav-buttons">
          <button className="login-btn">Login</button>
          <button className="register-btn">Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">
          <div className="tag">
            College & Company Connection Platform
          </div>

          <h1>
            Discover Companies.
            <br />
            <span>Find Opportunities.</span>
          </h1>

          <p>
            CampusConnect helps colleges discover nearby companies,
            current job vacancies, and genuine internship opportunities
            through one centralized platform.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Explore Companies →
            </button>

            <button className="secondary-btn">
              Join CampusConnect
            </button>
          </div>

          <div className="hero-info">
            <div>
              <strong>500+</strong>
              <span>Companies</span>
            </div>

            <div>
              <strong>1,200+</strong>
              <span>Opportunities</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Colleges</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="dashboard-preview">

          <div className="preview-header">
            <div>
              <small>College Dashboard</small>
              <h3>Good Morning 👋</h3>
            </div>

            <div className="profile-circle">C</div>
          </div>

          <div className="stats">

            <div className="stat-card">
              <span>Nearby Companies</span>
              <strong>48</strong>
              <small>Within 25 km</small>
            </div>

            <div className="stat-card">
              <span>Active Jobs</span>
              <strong>126</strong>
              <small>Currently hiring</small>
            </div>

            <div className="stat-card">
              <span>Internships</span>
              <strong>24</strong>
              <small>✓ Verified</small>
            </div>

          </div>

          <div className="opportunity-box">
            <div className="opportunity-title">
              <strong>Latest Opportunities</strong>
              <span>View all</span>
            </div>

            <div className="opportunity">
              <div className="company-icon">T</div>

              <div>
                <strong>Software Developer</strong>
                <p>TechNova Technologies • 8 km</p>
              </div>

              <div className="status">Hiring</div>
            </div>

            <div className="opportunity">
              <div className="company-icon orange">G</div>

              <div>
                <strong>Software Internship</strong>
                <p>GreenGrid • 12 km</p>
              </div>

              <div className="verified">✓ Verified</div>
            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="features">

        <div className="section-heading">
          <p>WHAT CAMPUSCONNECT OFFERS</p>
          <h2>Everything colleges need to connect with industry</h2>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon blue">⌖</div>
            <h3>Discover Companies</h3>
            <p>
              Find companies operating around your college
              based on location and industry.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">▣</div>
            <h3>Current Job Vacancies</h3>
            <p>
              Know which companies are hiring and explore
              their current recruitment requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">✓</div>
            <h3>Genuine Internships</h3>
            <p>
              Discover internship opportunities from
              verified companies with clear requirements.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Build stronger college–industry connections.</h2>
        <p>
          Discover companies, explore opportunities and connect
          with the right organizations.
        </p>

        <button className="primary-btn">
          Get Started →
        </button>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">Campus<span>Connect</span></div>

        <p>
          College–Company Recruitment & Internship Information Platform
        </p>

        <small>© 2026 CampusConnect. All rights reserved.</small>
      </footer>

    </div>
  );
}

export default App;
