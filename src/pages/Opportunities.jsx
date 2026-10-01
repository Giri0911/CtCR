import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { loadOpportunities } from "../Data/opportunities.js";

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
  const [savedOpportunityIds, setSavedOpportunityIds] = useState(loadSavedOpportunityIds);

  const toggleSavedOpportunity = (opportunityId) => {
    const id = String(opportunityId);
    const nextSavedIds = savedOpportunityIds.includes(id)
      ? savedOpportunityIds.filter((savedId) => savedId !== id)
      : [...savedOpportunityIds, id];
    localStorage.setItem(SAVED_OPPORTUNITIES_KEY, JSON.stringify(nextSavedIds));
    setSavedOpportunityIds(nextSavedIds);
  };

  const locations = [...new Set(opportunities.map((item) => item.location))];
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesType = type === "All" || item.type === type;
    const matchesLocation = location === "All Locations" || item.location === location;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${item.title} ${item.company} ${item.location}`.toLowerCase().includes(query);
    const matchesVerification =
      item.status !== "rejected" && (!verifiedOnly || item.verified);
    const matchesSaved = !savedOnly || savedOpportunityIds.includes(String(item.id));

    return matchesType && matchesLocation && matchesSearch && matchesVerification && matchesSaved;
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
              </dl>
              {!item.verified && <p className="opportunity-review-status">Under review</p>}
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