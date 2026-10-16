 "use client";

import { useState } from "react";
import { Link, useSearchParams } from "../next-router-compat.jsx";
import { isOpportunityActive, isOpportunityExpired, loadOpportunities } from "../Data/opportunities.js";
import { loadOpportunityReports, saveOpportunityReports } from "../Data/opportunityReports.js";
import { CollegePortalSidebar } from "../components/CollegePortalLayout.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";

const SAVED_OPPORTUNITIES_KEY = "savedOpportunities";

function createReportId() {
  return Date.now();
}

function loadSavedOpportunityIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_OPPORTUNITIES_KEY) || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
}

function loadReporterProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("collegeProfile") || "{}");
    return {
      name: typeof profile.name === "string" ? profile.name.trim() : "",
      email: typeof profile.email === "string" ? profile.email.trim().toLowerCase() : ""
    };
  } catch {
    return { name: "", email: "" };
  }
}

function loadCompanyName() {
  try {
    const profile = JSON.parse(localStorage.getItem("companyProfile") || "{}");
    return typeof profile.name === "string" && profile.name.trim()
      ? profile.name.trim()
      : "Company workspace";
  } catch {
    return "Company workspace";
  }
}

function Opportunities() {
  const [searchParams, setSearchParams] = useSearchParams();
  const returnToCompanyDashboard = searchParams.get("from") === "company";
  const [opportunities] = useState(loadOpportunities);
  const requestedType = searchParams.get("type");
  const type = ["Job", "Internship"].includes(requestedType) ? requestedType : "All";
  const savedOnly = !returnToCompanyDashboard && searchParams.get("saved") === "true";
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [availability, setAvailability] = useState("Active");
  const [sort, setSort] = useState("Newest");
  const [reportingOpportunityId, setReportingOpportunityId] = useState(null);
  const [reportFeedback, setReportFeedback] = useState({});
  const [reports, setReports] = useState(loadOpportunityReports);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState(loadSavedOpportunityIds);
  const collegeReporter = loadReporterProfile();
  const isReportFromCurrentCollege = (report) => {
    if (collegeReporter.email && report.reporterEmail) {
      return report.reporterEmail.toLowerCase() === collegeReporter.email;
    }
    return report.reportedBy === (collegeReporter.name || "College representative");
  };

  const today = new Date();
  const isExpiringSoon = (item) => {
    if (!item.expiryDate || isOpportunityExpired(item, today)) return false;
    const daysRemaining = Math.ceil(
      (new Date(`${item.expiryDate}T23:59:59`).getTime() - today.getTime()) / 86_400_000
    );
    return daysRemaining <= 7;
  };

  const toggleSavedOpportunity = (opportunityId) => {
    const id = String(opportunityId);
    const nextSavedIds = savedOpportunityIds.includes(id)
      ? savedOpportunityIds.filter((savedId) => savedId !== id)
      : [...savedOpportunityIds, id];
    localStorage.setItem(SAVED_OPPORTUNITIES_KEY, JSON.stringify(nextSavedIds));
    setSavedOpportunityIds(nextSavedIds);
  };

  const updateType = (nextType) => {
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      if (nextType === "All") nextParams.delete("type");
      else nextParams.set("type", nextType);
      nextParams.delete("saved");
      return nextParams;
    });
  };

  const submitReport = (event, item) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const existingPendingReport = reports.some((report) =>
      String(report.opportunityId) === String(item.id) &&
      report.status === "pending" &&
      isReportFromCurrentCollege(report)
    );
    if (existingPendingReport) {
      setReportingOpportunityId(null);
      setReportFeedback((current) => ({
        ...current,
        [item.id]: "You already have a report for this listing awaiting review."
      }));
      return;
    }
    const report = {
      id: createReportId(),
      opportunityId: item.id,
      title: item.title,
      company: item.company,
      type: item.type,
      reportedBy: collegeReporter.name || "College representative",
      reporterEmail: collegeReporter.email,
      reason: formData.get("reason"),
      details: String(formData.get("details") || "").trim(),
      status: "pending",
      reportedAt: new Date().toISOString()
    };
    const updatedReports = [...reports, report];
    saveOpportunityReports(updatedReports);
    setReports(updatedReports);
    setReportingOpportunityId(null);
    setReportFeedback((current) => ({ ...current, [item.id]: "Thanks. This listing was sent to the review team." }));
  };

  const reportedOpportunityIds = new Set(
    reports
      .filter((report) =>
        report.status === "pending" &&
        isReportFromCurrentCollege(report)
      )
      .map((report) => String(report.opportunityId))
  );
  const locations = [...new Set(opportunities.map((item) => item.location).filter(Boolean))].sort();
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesType = type === "All" || item.type === type;
    const matchesLocation = location === "All Locations" || item.location === location;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${item.title} ${item.company} ${item.location} ${item.description || ""} ${item.eligibility || ""} ${(item.skills || []).join(" ")}`.toLowerCase().includes(query);
    const matchesVerification =
      isOpportunityActive(item, today) && (!verifiedOnly || item.verified);
    const matchesSaved = !savedOnly || savedOpportunityIds.includes(String(item.id));
    const matchesAvailability =
      availability === "Expiring soon" ? isExpiringSoon(item) : !isOpportunityExpired(item, today);

    return matchesType && matchesLocation && matchesSearch && matchesVerification && matchesSaved && matchesAvailability;
  }).sort((first, second) => {
    if (sort === "Closing soon") {
      return (first.expiryDate || "9999-12-31").localeCompare(second.expiryDate || "9999-12-31");
    }
    return Number(second.id) - Number(first.id);
  });
  const savedOpportunityCount = opportunities.filter((item) =>
    savedOpportunityIds.includes(String(item.id))
  ).length;
  const opportunityTabCount = (tabType) => opportunities.filter((item) =>
    (tabType === "All" || item.type === tabType) &&
    isOpportunityActive(item, today) &&
    (!verifiedOnly || item.verified)
  ).length;
  const companyDisplayName = returnToCompanyDashboard ? loadCompanyName() : "";
  const collegeDisplayName = collegeReporter.name || "College Admin";

  return (
    <div className={returnToCompanyDashboard ? "company-dashboard company-opportunities-workspace" : "college-dashboard"}>
      {returnToCompanyDashboard && (
        <aside className="company-sidebar">
          <div className="company-dashboard-logo">
            Campus<span>XCompany</span>
          </div>
          <nav className="company-sidebar-nav" aria-label="Company navigation">
            <p className="company-menu-title">MAIN MENU</p>
            <Link to="/company">Dashboard</Link>
            <Link to="/company#job-vacancies">Job Vacancies</Link>
            <Link to="/company#internships">Internships</Link>
            <Link to="/company#drive-requests">Drive Requests</Link>
            <p className="company-menu-title">ACCOUNT</p>
            <Link to="/company#company-profile">Company Profile</Link>
            <Link to="/">Logout</Link>
          </nav>
        </aside>
      )}
      {!returnToCompanyDashboard && <CollegePortalSidebar />}

      <main className={returnToCompanyDashboard ? "company-dashboard-main company-opportunities-main" : "dashboard-main college-page-main college-opportunities-main"}>
      <header className={returnToCompanyDashboard ? "company-header" : "dashboard-header college-page-header"}>
        <div>
          <p className={returnToCompanyDashboard ? undefined : "welcome-text"}>
            {returnToCompanyDashboard ? "EMPLOYER WORKSPACE" : "COLLEGE PLACEMENT PORTAL"}
          </p>
          <h1>{returnToCompanyDashboard ? "Browse opportunities" : "Opportunities"}</h1>
          <p>
            {returnToCompanyDashboard
              ? "Explore active jobs and internships in the campus network."
              : "Explore jobs, internships, and your saved listings in one place."}
          </p>
        </div>
        <NotificationCenter notifications={[]} scope={returnToCompanyDashboard ? "company" : "college"} />
        {returnToCompanyDashboard ? (
          <div className="company-user">
            <div className="company-avatar">{companyDisplayName.charAt(0).toUpperCase()}</div>
            <div><strong>{companyDisplayName}</strong><small>Company account</small></div>
          </div>
        ) : (
          <div className="college-user">
            <div className="college-avatar">{collegeDisplayName.charAt(0).toUpperCase()}</div>
            <div><strong>{collegeDisplayName}</strong><small>Placement Officer</small></div>
          </div>
        )}
      </header>

      {!returnToCompanyDashboard && (
        <nav className="college-opportunity-tabs" aria-label="Opportunity categories">
          <Link
            className={!savedOnly && type === "All" ? "active" : ""}
            aria-current={!savedOnly && type === "All" ? "page" : undefined}
            to="/opportunities"
          >
            All opportunities <span>{opportunityTabCount("All")}</span>
          </Link>
          <Link
            className={!savedOnly && type === "Job" ? "active" : ""}
            aria-current={!savedOnly && type === "Job" ? "page" : undefined}
            to="/opportunities?type=Job"
          >
            Job vacancies <span>{opportunityTabCount("Job")}</span>
          </Link>
          <Link
            className={!savedOnly && type === "Internship" ? "active" : ""}
            aria-current={!savedOnly && type === "Internship" ? "page" : undefined}
            to="/opportunities?type=Internship"
          >
            Internships <span>{opportunityTabCount("Internship")}</span>
          </Link>
          <Link
            className={savedOnly ? "active" : ""}
            aria-current={savedOnly ? "page" : undefined}
            to="/opportunities?saved=true"
          >
            Saved <span>{savedOpportunityCount}</span>
          </Link>
        </nav>
      )}

      <section className="opportunities-filters" aria-label="Filter opportunities">
        <input
          type="search"
          placeholder="Search roles or companies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {returnToCompanyDashboard && (
          <select value={type} onChange={(event) => updateType(event.target.value)}>
            <option value="All">All types</option>
            <option value="Job">Jobs</option>
            <option value="Internship">Internships</option>
          </select>
        )}
        <select value={location} onChange={(event) => setLocation(event.target.value)}>
          <option>All Locations</option>
          {locations.map((itemLocation) => (
            <option key={itemLocation}>{itemLocation}</option>
          ))}
        </select>
        <select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by deadline">
          <option>Active</option>
          <option>Expiring soon</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort opportunities">
          <option>Newest</option>
          <option>Closing soon</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />
          Verified only
        </label>
      </section>

      <p className="opportunities-count">{filteredOpportunities.length} opportunities</p>
      {savedOpportunityIds.length > 0 && (
        <button
          className="clear-saved-opportunities"
          type="button"
          onClick={() => {
            localStorage.setItem(SAVED_OPPORTUNITIES_KEY, "[]");
            setSavedOpportunityIds([]);
          }}
        >
          Clear saved opportunities
        </button>
      )}

      {filteredOpportunities.length ? (
        <section className="opportunities-grid" aria-label="Available opportunities">
          {filteredOpportunities.map((item) => (
            <article className="opportunity-card" key={item.id}>
              <div className="opportunity-card-heading">
                <span className={item.type === "Job" ? "job-label" : "internship-label"}>
                  {item.type}
                </span>
                {item.verified && <span className="verified-badge">Verified</span>}
                <button
                  className={`save-opportunity-button${savedOpportunityIds.includes(String(item.id)) ? " is-saved" : ""}`}
                  type="button"
                  aria-label={`${savedOpportunityIds.includes(String(item.id)) ? "Remove saved" : "Save"} ${item.title}`}
                  aria-pressed={savedOpportunityIds.includes(String(item.id))}
                  onClick={() => toggleSavedOpportunity(item.id)}
                >
                  {savedOpportunityIds.includes(String(item.id)) ? "★" : "☆"}
                </button>
              </div>
              <h2>{item.title}</h2>
              <p className="opportunity-company">{item.company}</p>
              <dl>
                <div><dt>Location</dt><dd>{item.location}</dd></div>
                <div><dt>Work mode</dt><dd>{item.mode}</dd></div>
                <div>
                  <dt>{item.type === "Job" ? "Openings" : "Duration"}</dt>
                  <dd>{item.type === "Job" ? item.openings : item.duration}</dd>
                </div>
                {item.salary && <div><dt>Salary</dt><dd>{item.salary}</dd></div>}
                {item.stipend && <div><dt>Stipend</dt><dd>{item.stipend}</dd></div>}
                {item.expiryDate && <div><dt>Apply by</dt><dd>{item.expiryDate}</dd></div>}
              </dl>
              {item.description && <p className="opportunity-description">{item.description}</p>}
              {item.eligibility && <p className="opportunity-eligibility"><strong>Eligibility:</strong> {item.eligibility}</p>}
              {item.skills?.length > 0 && (
                <div className="opportunity-skills" aria-label="Required skills">
                  {item.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              )}
              {!item.verified && <p className="opportunity-review-status">Under review</p>}
              <div className="opportunity-report-actions">
                {reportFeedback[item.id] ? (
                  <p className="opportunity-report-feedback" role="status">
                    {reportFeedback[item.id]}
                    {!returnToCompanyDashboard && <> <Link to="/college#listing-reports">Track report</Link></>}
                  </p>
                ) : reportedOpportunityIds.has(String(item.id)) ? (
                  <p className="opportunity-report-feedback">
                    Report awaiting review · <Link to="/college#listing-reports">Track report</Link>
                  </p>
                ) : (
                  <button
                    type="button"
                    className="report-opportunity-button"
                    onClick={() => setReportingOpportunityId(reportingOpportunityId === item.id ? null : item.id)}
                  >
                    Report listing
                  </button>
                )}
              </div>
              {reportingOpportunityId === item.id && (
                <form className="opportunity-report-form" onSubmit={(event) => submitReport(event, item)}>
                  <label htmlFor={`report-reason-${item.id}`}>Why are you reporting this listing?</label>
                  <select id={`report-reason-${item.id}`} name="reason" required defaultValue="">
                    <option value="" disabled>Select a reason</option>
                    <option>Misleading or inaccurate information</option>
                    <option>Expired or already filled</option>
                    <option>Suspicious company or scam</option>
                    <option>Duplicate listing</option>
                    <option>Other</option>
                  </select>
                  <textarea name="details" rows="2" maxLength="500" placeholder="Add helpful context (optional)" />
                  <div>
                    <button type="submit">Send report</button>
                    <button type="button" onClick={() => setReportingOpportunityId(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className="opportunities-empty">
          <h2>
            {savedOnly
              ? "No saved opportunities yet"
              : type === "Job"
                ? "No matching job vacancies"
                : type === "Internship"
                  ? "No matching internships"
                  : "No matching opportunities"}
          </h2>
          <p>
            {savedOnly
              ? "Save a job or internship with the star button and it will appear here."
              : "Try changing your search or filters. Active listings awaiting review may require turning off “Verified only” to include them."}
          </p>
          {savedOnly && <Link className="browse-opportunities-link" to="/opportunities">Browse all opportunities</Link>}
        </div>
      )}
      </main>
    </div>
  );
}

export default Opportunities;