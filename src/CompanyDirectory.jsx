import { useState } from "react";
import { isOpportunityActive, loadOpportunities } from "./Data/opportunities.js";

function CompanyDirectory() {

  const companies = [
    {
      id: 1,
      name: "TechNova Technologies",
      industry: "Software & Technology",
      location: "Guntur",
      distance: "4.2 km",
      verified: true,
      description:
        "Software company providing web, mobile and cloud solutions."
    },
    {
      id: 2,
      name: "CloudSoft Solutions",
      industry: "Software",
      location: "Vijayawada",
      distance: "32 km",
      verified: true,
      description:
        "Technology company working on cloud and enterprise applications."
    },
    {
      id: 3,
      name: "DataVision Analytics",
      industry: "Data & Analytics",
      location: "Guntur",
      distance: "7.8 km",
      verified: true,
      description:
        "Data analytics company helping businesses make data-driven decisions."
    },
    {
      id: 4,
      name: "DigitalEdge Systems",
      industry: "IT Services",
      location: "Amaravati",
      distance: "25 km",
      verified: false,
      description:
        "IT services company providing digital transformation solutions."
    },
    {
      id: 5,
      name: "Innovate Labs",
      industry: "Software",
      location: "Guntur",
      distance: "9.5 km",
      verified: true,
      description:
        "Product development company focused on modern software solutions."
    },
    {
      id: 6,
      name: "NextGen Technologies",
      industry: "Technology",
      location: "Vijayawada",
      distance: "38 km",
      verified: true,
      description:
        "Technology company working with AI, cloud and web technologies."
    }
  ];

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [industry, setIndustry] = useState("All Industries");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const opportunities = loadOpportunities();
  const selectedOpportunities = selectedCompany
    ? opportunities.filter(
        (item) =>
          item.company === selectedCompany.name &&
          item.verified &&
          isOpportunityActive(item)
      )
    : [];

  const filteredCompanies = companies.filter((company) => {

    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.industry.toLowerCase().includes(search.toLowerCase());

    const matchesLocation =
      location === "All Locations" ||
      company.location === location;

    const matchesIndustry =
      industry === "All Industries" ||
      company.industry === industry;

    return (
      matchesSearch &&
      matchesLocation &&
      matchesIndustry
    );
  });

  return (

    <div className="directory-page">

      {/* Header */}

      <div className="directory-header">

        <div>

          <p className="directory-label">
            COMPANY DIRECTORY
          </p>

          <h1>
            Discover Companies Around You
          </h1>

          <p>
            Find companies, job vacancies and verified
            internship opportunities available for your college.
          </p>

        </div>

        <div className="directory-location">
          📍 <strong>Guntur</strong>
          <span>Your college location</span>
        </div>

      </div>

      {/* Search */}

      <div className="directory-search">

        <div className="directory-search-box">

          🔍

          <input
            type="text"
            placeholder="Search companies or industries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option>All Locations</option>
          <option>Guntur</option>
          <option>Vijayawada</option>
          <option>Amaravati</option>
        </select>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option>All Industries</option>
          <option>Software & Technology</option>
          <option>Software</option>
          <option>Data & Analytics</option>
          <option>IT Services</option>
          <option>Technology</option>
        </select>

      </div>

      {/* Results */}

      <div className="directory-result-heading">

        <div>
          <h2>
            Companies Near Your College
          </h2>

          <p>
            {filteredCompanies.length} companies found
          </p>
        </div>

        <span className="directory-info">
          Companies are sorted by relevance
        </span>

      </div>

      {/* Company Cards */}

      {filteredCompanies.length > 0 ? (

        <div className="directory-grid">

          {filteredCompanies.map((company) => (

            <div
              className="directory-card"
              key={company.id}
            >

              <div className="directory-card-top">

                <div className="directory-company-logo">
                  {company.name.charAt(0)}
                </div>

                {company.verified ? (

                  <span className="directory-verified">
                    ✓ Verified
                  </span>

                ) : (

                  <span className="directory-pending">
                    Under Review
                  </span>

                )}

              </div>

              <h3>
                {company.name}
              </h3>

              <p className="directory-industry">
                {company.industry}
              </p>

              <p className="directory-description">
                {company.description}
              </p>

              <div className="directory-location-row">

                <span>
                  📍 {company.location}
                </span>

                <span>
                  {company.distance}
                </span>

              </div>

              <div className="directory-opportunities">

                <div>
                  <strong>
                    {opportunities.filter(
                      (item) => item.company === company.name && item.type === "Job" && item.verified && isOpportunityActive(item)
                    ).length}
                  </strong>
                  <span>Jobs</span>
                </div>

                <div>
                  <strong>
                    {opportunities.filter(
                      (item) => item.company === company.name && item.type === "Internship" && item.verified && isOpportunityActive(item)
                    ).length}
                  </strong>
                  <span>Internships</span>
                </div>

              </div>

              <button
                className="view-company-btn"
                onClick={() => setSelectedCompany(company)}
              >
                View Company
              </button>

            </div>

          ))}

        </div>

      ) : (

        <div className="directory-no-results">

          <h3>No companies found</h3>

          <p>
            Try changing your search or filters.
          </p>

        </div>

      )}

      {/* Company Details Modal */}

      {selectedCompany && (

        <div
          className="company-modal-overlay"
          onClick={() => setSelectedCompany(null)}
        >

          <div
            className="company-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setSelectedCompany(null)}
            >
              ×
            </button>

            <div className="modal-company-header">

              <div className="modal-company-logo">
                {selectedCompany.name.charAt(0)}
              </div>

              <div>

                <div className="modal-title-row">

                  <h2>
                    {selectedCompany.name}
                  </h2>

                  {selectedCompany.verified && (
                    <span className="directory-verified">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <p>
                  {selectedCompany.industry}
                </p>

                <small>
                  📍 {selectedCompany.location}
                </small>

              </div>

            </div>

            <div className="modal-divider" />

            <h3>About the Company</h3>

            <p className="modal-description">
              {selectedCompany.description}
            </p>

            <div className="modal-stats">

              <div>
                <strong>
                  {selectedOpportunities.filter((item) => item.type === "Job").length}
                </strong>
                <span>Active Jobs</span>
              </div>

              <div>
                <strong>
                  {selectedOpportunities.filter((item) => item.type === "Internship").length}
                </strong>
                <span>Internships</span>
              </div>

              <div>
                <strong>{selectedCompany.distance}</strong>
                <span>Distance</span>
              </div>

            </div>

            <div className="modal-opportunities">

              <h3>
                Current Opportunities
              </h3>

              {selectedOpportunities.length ? (
                selectedOpportunities.map((item) => (
                  <div className="modal-opportunity" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {item.type === "Job"
                          ? `${item.mode} · ${item.openings} openings`
                          : `${item.duration} · ${item.mode}`}
                      </small>
                    </div>
                    <span className={item.type === "Job" ? "job-badge" : "internship-badge"}>
                      {item.type === "Job" ? "Job" : "Verified Internship"}
                    </span>
                  </div>
                ))
              ) : (
                <p>No verified opportunities currently available.</p>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default CompanyDirectory;