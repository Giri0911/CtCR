import { useState } from "react";
import { loadOpportunities, saveOpportunities } from "../Data/opportunities.js";

function AdminDashboard() {
  const [opportunities, setOpportunities] = useState(loadOpportunities);
  const [filter, setFilter] = useState("All");

  const verifyOpportunity = (id) => {
    const updated = opportunities.map((item) =>
      item.id === id
        ? {
            ...item,
            verified: true,
            status: "verified"
          }
        : item
    );

    saveOpportunities(updated);
    setOpportunities(updated);
  };

  const rejectOpportunity = (id) => {
    const updated = opportunities.map((item) =>
      item.id === id
        ? {
            ...item,
            verified: false,
            status: "rejected"
          }
        : item
    );

    saveOpportunities(updated);
    setOpportunities(updated);
  };

  const filteredOpportunities =
    filter === "All"
      ? opportunities
      : filter === "Pending"
      ? opportunities.filter(
          (item) =>
            item.verified === false &&
            item.status !== "rejected"
        )
      : filter === "Verified"
      ? opportunities.filter(
          (item) => item.verified === true
        )
      : filter === "Jobs"
      ? opportunities.filter(
          (item) => item.type === "Job"
        )
      : opportunities.filter(
          (item) => item.type === "Internship"
        );

  const total = opportunities.length;

  const pending = opportunities.filter(
    (item) =>
      item.verified === false &&
      item.status !== "rejected"
  ).length;

  const verified = opportunities.filter(
    (item) => item.verified === true
  ).length;

  const internships = opportunities.filter(
    (item) => item.type === "Internship"
  ).length;

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <h2>CampusConnect</h2>
          <p>Admin Panel</p>
        </div>

        <div className="admin-menu">

          <button
            className={filter === "All" ? "active" : ""}
            onClick={() => setFilter("All")}
          >
            All Opportunities
          </button>

          <button
            className={filter === "Pending" ? "active" : ""}
            onClick={() => setFilter("Pending")}
          >
            Pending Review
          </button>

          <button
            className={filter === "Verified" ? "active" : ""}
            onClick={() => setFilter("Verified")}
          >
            Verified
          </button>

          <button
            className={filter === "Jobs" ? "active" : ""}
            onClick={() => setFilter("Jobs")}
          >
            Jobs
          </button>

          <button
            className={filter === "Internships" ? "active" : ""}
            onClick={() => setFilter("Internships")}
          >
            Internships
          </button>

        </div>

      </aside>

      {/* Main Content */}

      <main className="admin-main">

        <div className="admin-header">

          <div>
            <p>ADMINISTRATION</p>
            <h1>Verification Dashboard</h1>
            <span>
              Review and verify company opportunities.
            </span>
          </div>

        </div>

        {/* Statistics */}

        <div className="admin-stats">

          <div className="admin-stat">
            <span>Total Opportunities</span>
            <strong>{total}</strong>
          </div>

          <div className="admin-stat">
            <span>Pending Review</span>
            <strong>{pending}</strong>
          </div>

          <div className="admin-stat">
            <span>Verified</span>
            <strong>{verified}</strong>
          </div>

          <div className="admin-stat">
            <span>Internships</span>
            <strong>{internships}</strong>
          </div>

        </div>

        {/* Opportunity List */}

        <div className="admin-section">

          <div className="admin-section-heading">
            <h2>{filter} Opportunities</h2>
            <span>
              {filteredOpportunities.length} opportunities
            </span>
          </div>

          {filteredOpportunities.length === 0 ? (

            <div className="admin-empty">
              <h3>No opportunities found</h3>
              <p>
                There are no opportunities in this category.
              </p>
            </div>

          ) : (

            <div className="admin-opportunity-list">

              {filteredOpportunities.map((item) => (

                <div
                  className="admin-opportunity-card"
                  key={item.id}
                >

                  <div className="admin-opportunity-info">

                    <div className="admin-title-row">

                      <h3>{item.title}</h3>

                      <span
                        className={
                          item.type === "Job"
                            ? "job-label"
                            : "internship-label"
                        }
                      >
                        {item.type}
                      </span>

                    </div>

                    <p className="admin-company">
                      {item.company}
                    </p>

                    <div className="admin-details">

                      <span>📍 {item.location}</span>

                      <span>💼 {item.mode}</span>

                      <span>
                        👥 {item.openings} openings
                      </span>

                      {item.salary && (
                        <span>💰 {item.salary}</span>
                      )}

                      {item.duration && (
                        <span>⏱ {item.duration}</span>
                      )}

                    </div>

                    <div className="admin-status">

                      {item.verified ? (

                        <span className="admin-verified">
                          ✓ Verified
                        </span>

                      ) : item.status === "rejected" ? (

                        <span className="admin-rejected">
                          ✕ Rejected
                        </span>

                      ) : (

                        <span className="admin-pending">
                          ● Under Review
                        </span>

                      )}

                    </div>

                  </div>

                  <div className="admin-actions">

                    {!item.verified &&
                      item.status !== "rejected" && (
                        <>
                          <button
                            className="verify-btn"
                            onClick={() =>
                              verifyOpportunity(item.id)
                            }
                          >
                            ✓ Verify
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() =>
                              rejectOpportunity(item.id)
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}

                    {item.verified && (
                      <span className="verified-text">
                        Verified
                      </span>
                    )}

                    {item.status === "rejected" && (
                      <span className="rejected-text">
                        Rejected
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;