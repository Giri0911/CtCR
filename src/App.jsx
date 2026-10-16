import "./App.css";

import { Link } from "./next-router-compat.jsx";

const proofItems = [
  { value: "2.8k+", label: "students matched" },
  { value: "310", label: "active employers" },
  { value: "94%", label: "engagement rate" }
];

const featureCards = [
  {
    icon: "📍",
    title: "Smart discovery",
    description: "Empower students and colleges to find employers, internships, and campus opportunities with better visibility.",
    tone: "blue"
  },
  {
    icon: "🤝",
    title: "Built for collaboration",
    description: "Facilitate direct networking, drive requests, and faster recruitment conversations from one platform.",
    tone: "green"
  },
  {
    icon: "📈",
    title: "Actionable insights",
    description: "Track verified listings, monitor approval flows, and keep hiring pipelines transparent for all stakeholders.",
    tone: "orange"
  }
];

function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="CampusXCompany home">
          Campus<span>XCompany</span>
        </Link>
        <nav className="home-nav" aria-label="Account">
          <Link to="/login">Log in</Link>
          <Link className="home-nav-cta" to="/register">
            Create account
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="home-copy">
          <p className="home-eyebrow">CAREERS, CLOSER TO CAMPUS</p>
          <h1>
            Where campus talent meets real opportunity.
          </h1>
          <p className="home-description">
            CampusXCompany helps colleges, companies, and students connect more
            effectively through verified opportunities, stronger outreach, and a
            modern careers ecosystem built for growth.
          </p>

          <div className="home-actions">
            <Link to="/register" className="primary-action">
              Get started <span aria-hidden="true">→</span>
            </Link>
            <Link to="/login" className="secondary-action">
              Sign in
            </Link>
          </div>

          <div className="home-proof">
            {proofItems.map((item) => (
              <div key={item.label} className="proof-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-visual" aria-label="CampusXCompany overview dashboard">
          <div className="dashboard-mockup">
            <div className="mockup-bar">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
            </div>

            <div className="mockup-content">
              <div className="mockup-sidebar">
                <span className="mockup-pill active">Overview</span>
                <span className="mockup-pill">Opportunities</span>
                <span className="mockup-pill">Companies</span>
                <span className="mockup-pill">Drive requests</span>
              </div>

              <div className="mockup-main">
                <div className="mockup-top-row">
                  <div>
                    <p>Campus pipeline</p>
                    <h3>Hiring momentum</h3>
                  </div>
                  <button type="button">Live</button>
                </div>

                <div className="stat-grid">
                  <div className="mini-stat">
                    <small>Jobs</small>
                    <strong>126</strong>
                  </div>
                  <div className="mini-stat accent">
                    <small>Internships</small>
                    <strong>48</strong>
                  </div>
                  <div className="mini-stat">
                    <small>Companies</small>
                    <strong>31</strong>
                  </div>
                </div>

                <div className="tracker-card">
                  <div className="tracker-head">
                    <span>Verified listings</span>
                    <strong>84%</strong>
                  </div>
                  <div className="tracker-bar">
                    <span />
                  </div>
                </div>

                <div className="list-card">
                  <div className="list-row">
                    <div>
                      <strong>Frontend Engineer</strong>
                      <small>TechNova</small>
                    </div>
                    <span className="tag-pill green">Open</span>
                  </div>
                  <div className="list-row">
                    <div>
                      <strong>Product Intern</strong>
                      <small>FinEdge</small>
                    </div>
                    <span className="tag-pill blue">New</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-highlights">
        <div className="section-heading">
          <p>WHY CAMPUSXCOMPANY</p>
          <h2>Built for every part of the campus talent journey.</h2>
        </div>

        <div className="feature-grid">
          {featureCards.map((card) => (
            <article key={card.title} className="feature-card">
              <div className={`feature-icon ${card.tone}`}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="cta-panel">
          <div>
            <p>READY TO GROW</p>
            <h2>Start building meaningful campus-to-career connections.</h2>
          </div>

          <Link to="/register" className="primary-action large">
            Create free account
          </Link>
        </div>
      </section>
    </main>
  );
}

export { Home };
export default Home;
