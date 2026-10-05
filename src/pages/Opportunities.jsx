import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isOpportunityActive, isOpportunityExpired, loadOpportunities } from "../Data/opportunities.js";
import { loadOpportunityReports, saveOpportunityReports } from "../Data/opportunityReports.js";

const SAVED_OPPORTUNITIES_KEY = "savedOpportunities";

function loadSavedOpportunityIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_OPPORTUNITIES_KEY) || "[]");
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
}

function Opportunities() {
  const [searchParams] = useSearchParams();
  const [opportunities] = useState(loadOpportunities);
  const [type, setType] = useState(() => searchParams.get("type") || "All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);
  const [availability, setAvailability] = useState("Active");
  const [sort, setSort] = useState("Newest");
  const [reportingOpportunityId, setReportingOpportunityId] = useState(null);
  const [reportFeedback, setReportFeedback] = useState({});
  const [reports, setReports] = useState(loadOpportunityReports);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState(loadSavedOpportunityIds);

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

  const submitReport = (event, item) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const report = {
      id: Date.now(),
      opportunityId: item.id,
      title: item.title,
      company: item.company,
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
    reports.filter((report) => report.status === "pending").map((report) => String(report.opportunityId))
  );
  const locations = [...new Set(opportunities.map((item) => item.location))];
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

  return (
    <main className="opportunities-page">
      <header className="opportunities-header">
        <div>
          <p className="opportunities-eyebrow">CAMPUSCONNECT OPPORTUNITIES</p>
          <h1>Find your next opportunity</h1>
          <p>Explore jobs and internships shared by nearby companies.</p>
        </div>
        <Link to="/college">Back to dashboard</Link>
      </header>

      <section className="opportunities-filters" aria-label="Filter opportunities">
        <input
          type="search"
          placeholder="Search roles or companies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="All">All types</option>
          <option value="Job">Jobs</option>
          <option value="Internship">Internships</option>
        </select>
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
        <label className="saved-opportunities-toggle">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(event) => setSavedOnly(event.target.checked)}
          />
          Saved only <strong>{savedOpportunityIds.length}</strong>
        </label>
      </section>

      <p className="opportunities-count">{filteredOpportunities.length} opportunities</p>

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
                  <p role="status">{reportFeedback[item.id]}</p>
                ) : reportedOpportunityIds.has(String(item.id)) ? (
                  <p>Report submitted · under review</p>
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
          <h2>No matching opportunities</h2>
          <p>Try changing your search or filters.</p>
        </div>
      )}
    </main>
  );
}

export default Opportunities;