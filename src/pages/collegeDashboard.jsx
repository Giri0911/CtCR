import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function CollegeDashboard() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [type, setType] = useState("All");

  const companies = [
    {
      name: "TechNova Technologies",
      industry: "Software",
      location: "Guntur",
      distance: "8 km",
      jobs: 5,
      internships: 2,
      verified: true
    },
    {
      name: "GreenGrid Solutions",
      industry: "Energy",
      location: "Vijayawada",
      distance: "12 km",
      jobs: 3,
      internships: 1,
      verified: true
    },
    {
      name: "FinEdge Services",
      industry: "Finance",
      location: "Guntur",
      distance: "18 km",
      jobs: 7,
      internships: 3,
      verified: true
    },
    {
      name: "CoreWorks Industries",
      industry: "Manufacturing",
      location: "Tenali",
      distance: "22 km",
      jobs: 2,
      internships: 1,
      verified: false
    }
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase());

    const matchesIndustry =
      industry === "All" || company.industry === industry;

    const matchesType =
      type === "All" ||
      (type === "Jobs" && company.jobs > 0) ||
      (type === "Internships" && company.internships > 0);

    return matchesSearch && matchesIndustry && matchesType;
  });

  return (
    <div className="college-dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="dashboard-logo">
          Campus<span>Connect</span>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <Link className="active-menu" to="/college">
          Dashboard
        </Link>

        <Link to="/college/companies">
          Discover Companies
        </Link>

        <Link to="/opportunities?type=Job">
          Job Vacancies
        </Link>

        <Link to="/opportunities?type=Internship">
          Internships
        </Link>

        <p className="menu-title">ACCOUNT</p>

        <Link to="/">
          Logout
        </Link>

      </aside>

      {/* Main Content */}

      <main className="dashboard-main">

        {/* Header */}

        <header className="dashboard-header">

          <div>
            <p className="welcome-text">College Dashboard</p>
            <h1>Good Morning 👋</h1>
          </div>

          <div className="college-user">
            <div className="college-avatar">C</div>

            <div>
              <strong>College Admin</strong>
              <small>Placement Officer</small>
            </div>
          </div>

        </header>

        {/* Search */}

        <div className="dashboard-search">

          <div className="search-box">
            🔍

            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="All">All Industries</option>
            <option value="Software">Software</option>
            <option value="Energy">Energy</option>
            <option value="Finance">Finance</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Opportunities</option>
            <option value="Jobs">Jobs</option>
            <option value="Internships">Internships</option>
          </select>

        </div>

        {/* Statistics */}

        <section className="dashboard-stats">

          <div className="dashboard-stat">
            <div className="stat-symbol blue-symbol">⌖</div>

            <div>
              <span>Nearby Companies</span>
              <strong>48</strong>
              <small>Within 25 km</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol green-symbol">▣</div>

            <div>
              <span>Active Jobs</span>
              <strong>126</strong>
              <small>Currently hiring</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol orange-symbol">✓</div>

            <div>
              <span>Verified Internships</span>
              <strong>24</strong>
              <small>From verified companies</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol purple-symbol">↔</div>

            <div>
              <span>Connections</span>
              <strong>18</strong>
              <small>College–company</small>
            </div>
          </div>

        </section>

        {/* Companies */}

        <section className="companies-section">

          <div className="section-top">

            <div>
              <h2>Companies Around You</h2>

              <p>
                Discover companies and their current opportunities
              </p>
            </div>

            <Link className="view-button" to="/college/companies">
              View All
            </Link>

          </div>

          <div className="company-grid">

            {filteredCompanies.map((company) => (

              <div className="company-card" key={company.name}>

                <div className="company-card-header">

                  <div className="company-logo">
                    {company.name.charAt(0)}
                  </div>

                  {company.verified && (
                    <span className="verified-badge">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <h3>{company.name}</h3>

                <p className="company-industry">
                  {company.industry}
                </p>

                <p className="company-location">
                  📍 {company.location} • {company.distance}
                </p>

                <div className="company-opportunities">

                  <div>
                    <strong>{company.jobs}</strong>
                    <span>Jobs</span>
                  </div>

                  <div>
                    <strong>{company.internships}</strong>
                    <span>Internships</span>
                  </div>

                </div>

                <Link className="company-button" to="/college/companies">
                  View Company
                </Link>

              </div>

            ))}

          </div>

          {filteredCompanies.length === 0 && (
            <div className="no-results">
              No companies found.
            </div>
          )}

        </section>

        {/* Recent Opportunities */}

        <section className="recent-section">

          <div className="section-top">

            <div>
              <h2>Latest Opportunities</h2>

              <p>
                Recently added recruitment and internship opportunities
              </p>
            </div>

          </div>

          <div className="opportunity-table">

            <div className="table-header">
              <span>Opportunity</span>
              <span>Company</span>
              <span>Type</span>
              <span>Status</span>
            </div>

            <div className="table-row">

              <div>
                <strong>Software Developer</strong>
                <small>5 Openings</small>
              </div>

              <span>TechNova</span>

              <span className="job-label">
                Job
              </span>

              <span className="active-label">
                Active
              </span>

            </div>

            <div className="table-row">

              <div>
                <strong>Web Development Intern</strong>
                <small>3 Months</small>
              </div>

              <span>FinEdge</span>

              <span className="internship-label">
                Internship
              </span>

              <span className="verified-label">
                ✓ Verified
              </span>

            </div>

            <div className="table-row">

              <div>
                <strong>Data Analyst</strong>
                <small>3 Openings</small>
              </div>

              <span>GreenGrid</span>

              <span className="job-label">
                Job
              </span>

              <span className="active-label">
                Active
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CollegeDashboard;