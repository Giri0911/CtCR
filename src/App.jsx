import "./App.css";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import heroImage from "./assets/hero.png";

import Login from "./pages/login.jsx";
import Register from "./pages/registration";
import CollegeDashboard from "./pages/collegeDashboard";
import CompanyDashboard from "./pages/companyDashboard";
import AdminDashboard from "./pages/adminDashboard";
import CompanyDirectory from "./CompanyDirectory.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import PostOpportunity from "./pages/PostOpportunity.jsx";

function Home() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/" aria-label="CampusConnect home">
          Campus<span>Connect</span>
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
          <h1>CampusConnect</h1>
          <p className="home-description">
            Bringing colleges and ambitious companies together to make the next
            opportunity easier to find.
          </p>
          <div className="home-actions">
            <Link to="/register">
              Get started <span aria-hidden="true">→</span>
            </Link>
            <Link to="/login">Sign in</Link>
          </div>
          <div className="home-proof">
            <div>
              <strong>01</strong>
              <span>Discover local employers</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Find jobs and internships</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Build lasting connections</span>
            </div>
          </div>
        </div>

        <figure className="home-visual">
          <img src={heroImage} alt="CampusConnect career opportunities" />
          <figcaption>
            <span>Local talent.</span> Real opportunity.
          </figcaption>
        </figure>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/college" element={<CollegeDashboard />} />

        <Route path="/college/companies" element={<CompanyDirectory />} />

        <Route path="/opportunities" element={<Opportunities />} />

        <Route path="/company/opportunities/new" element={<PostOpportunity />} />

        <Route path="/company" element={<CompanyDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
