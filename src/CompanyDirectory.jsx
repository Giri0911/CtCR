 "use client";

import { useEffect, useState } from "react";
import { hydrateOpportunities, isOpportunityActive, loadOpportunities } from "./Data/opportunities.js";
import { loadDriveRequests, saveDriveRequests } from "./Data/driveRequests.js";
import { hydrateOrganizationReports, loadOrganizationReports, saveOrganizationReports } from "./Data/organizationReports.js";
import CollegePortalLayout from "./components/CollegePortalLayout.jsx";

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
const MIN_DRIVE_DATE = today.toISOString().slice(0, 10);

function loadCollegeReporter() {
  try {
    const profile = JSON.parse(localStorage.getItem("collegeProfile") || "{}");
    return typeof profile.name === "string" ? profile.name.trim() : "";
  } catch {
    return "";
  }
}

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
  const [organizationReports, setOrganizationReports] = useState(loadOrganizationReports);
  const [opportunities, setOpportunities] = useState(loadOpportunities);
  useEffect(() => {
    Promise.all([hydrateOpportunities(), hydrateOrganizationReports()])
      .then(([nextOpportunities, nextReports]) => {
        setOrganizationReports(nextReports);
        setOpportunities(nextOpportunities);
      })
      .catch((error) => console.error("Unable to hydrate directory data.", error));
  }, []);
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportingCompanyId, setReportingCompanyId] = useState(null);
  const [driveRequestCompanyId, setDriveRequestCompanyId] = useState(null);
  const [driveRequestFeedback, setDriveRequestFeedback] = useState("");
  const reporterName = loadCollegeReporter();
  const hasPendingReport = (companyName) => organizationReports.some((report) =>
    report.organizationName === companyName &&
    report.reportedBy === (reporterName || "College representative") &&
    report.status === "pending"
  );
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

  const submitOrganizationReport = (event) => {
    event.preventDefault();
    if (!selectedCompany) return;
    const formData = new FormData(event.currentTarget);
    const report = {
      id: Date.now(),
      organizationName: selectedCompany.name,
      organizationLocation: selectedCompany.location,
      reportedBy: reporterName || "College representative",
      reason: String(formData.get("reason") || ""),
      details: String(formData.get("details") || "").trim(),
      status: "pending",
      reportedAt: new Date().toISOString()
    };
    const updatedReports = [...organizationReports, report];
    saveOrganizationReports(updatedReports);
    setOrganizationReports(updatedReports);
    setReportingCompanyId(null);
    setReportFeedback("Your report has been sent to the CampusXCompany review team.");
  };

  const submitDriveRequest = (event) => {
    event.preventDefault();
    if (!selectedCompany) return;
    const formData = new FormData(event.currentTarget);
    const request = {
      id: Date.now(),
      company: selectedCompany.name,
      college: String(formData.get("collegeName") || "").trim(),
      date: String(formData.get("driveDate") || ""),
      students: Number(formData.get("students")),
      message: String(formData.get("message") || "").trim(),
      adminStatus: "pending",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    const updatedRequests = [...loadDriveRequests(), request];
    saveDriveRequests(updatedRequests);
    setDriveRequestCompanyId(null);
    setDriveRequestFeedback(`Drive request sent for ${selectedCompany.name}. It will be forwarded after admin review.`);
  };

  return (
    <CollegePortalLayout
      title="Discover companies"
      description="Find employers, explore opportunities, and request campus recruitment drives."
      contentClassName="college-directory-main"
    >
      <div className="directory-page college-directory-content">
        <div className="directory-location">
          📍 <strong>Guntur</strong>
          <span>Your college location</span>
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

              <div className="directory-card-actions">
                <button
                  className="view-company-btn"
                  type="button"
                  onClick={() => {
                    setReportFeedback("");
                    setReportingCompanyId(null);
                    setDriveRequestFeedback("");
                    setDriveRequestCompanyId(null);
                    setSelectedCompany(company);
                  }}
                >
                  View Company
                </button>
                <button
                  className="request-drive-button"
                  type="button"
                  onClick={() => {
                    setReportFeedback("");
                    setReportingCompanyId(null);
                    setDriveRequestFeedback("");
                    setDriveRequestCompanyId(company.id);
                    setSelectedCompany(company);
                  }}
                >
                  Request Drive
                </button>
              </div>

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
          onClick={() => {
            setSelectedCompany(null);
            setReportingCompanyId(null);
            setDriveRequestCompanyId(null);
          }}
        >

          <div
            className="company-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              aria-label="Close company details"
              onClick={() => {
                setSelectedCompany(null);
                setReportingCompanyId(null);
                setDriveRequestCompanyId(null);
              }}
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

            <section className="directory-drive-request" aria-labelledby="directory-drive-title">
              <h3 id="directory-drive-title">Request a campus drive</h3>
              <p>Invite {selectedCompany.name} to meet students at your college.</p>
              {driveRequestFeedback ? (
                <p className="directory-drive-feedback" role="status">{driveRequestFeedback}</p>
              ) : driveRequestCompanyId === selectedCompany.id ? (
                <form className="directory-drive-form" onSubmit={submitDriveRequest}>
                  <label htmlFor="directory-drive-college">College name</label>
                  <input
                    id="directory-drive-college"
                    name="collegeName"
                    defaultValue={loadCollegeReporter()}
                    placeholder="Enter your college name"
                    required
                  />
                  <label htmlFor="directory-drive-date">Preferred drive date</label>
                  <input
                    id="directory-drive-date"
                    name="driveDate"
                    type="date"
                    min={MIN_DRIVE_DATE}
                    required
                  />
                  <label htmlFor="directory-drive-students">Expected students</label>
                  <input
                    id="directory-drive-students"
                    name="students"
                    type="number"
                    min="1"
                    placeholder="e.g. 120"
                    required
                  />
                  <label htmlFor="directory-drive-message">Message for the company <span>(optional)</span></label>
                  <textarea
                    id="directory-drive-message"
                    name="message"
                    rows="3"
                    maxLength="500"
                    placeholder="Share roles, skills, or other drive details."
                  />
                  <div className="directory-drive-actions">
                    <button type="submit">Send drive request</button>
                    <button type="button" onClick={() => setDriveRequestCompanyId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  className="directory-drive-trigger"
                  type="button"
                  onClick={() => setDriveRequestCompanyId(selectedCompany.id)}
                >
                  Request Drive
                </button>
              )}
            </section>

            <section className="organization-report-section" aria-labelledby="organization-report-title">
              <h3 id="organization-report-title">Report this organization</h3>
              <p>If you have concerns about this organization, share them with our review team.</p>
              {reportFeedback ? (
                <p className="organization-report-feedback" role="status">{reportFeedback}</p>
              ) : hasPendingReport(selectedCompany.name) ? (
                <p className="organization-report-feedback" role="status">Your report for this organization is awaiting review.</p>
              ) : reportingCompanyId === selectedCompany.id ? (
                <form className="organization-report-form" onSubmit={submitOrganizationReport}>
                  <label htmlFor="organization-report-reason">Reason for reporting</label>
                  <select id="organization-report-reason" name="reason" defaultValue="" required>
                    <option value="" disabled>Select a reason</option>
                    <option>Misleading or false organization information</option>
                    <option>Unprofessional or inappropriate conduct</option>
                    <option>Suspicious or potentially fraudulent activity</option>
                    <option>Repeatedly unresponsive or poor communication</option>
                    <option>Other concern</option>
                  </select>
                  <label htmlFor="organization-report-details">What happened?</label>
                  <textarea
                    id="organization-report-details"
                    name="details"
                    rows="3"
                    maxLength="1000"
                    placeholder="Describe your concern so the review team can investigate."
                    required
                  />
                  <div className="organization-report-actions">
                    <button type="submit">Submit report</button>
                    <button type="button" onClick={() => setReportingCompanyId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button
                  className="organization-report-trigger"
                  type="button"
                  onClick={() => {
                    setReportFeedback("");
                    setReportingCompanyId(selectedCompany.id);
                  }}
                >
                  Report organization
                </button>
              )}
            </section>

          </div>

        </div>

      )}

      </div>
    </CollegePortalLayout>
  );
}

export default CompanyDirectory;