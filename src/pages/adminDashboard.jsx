import { useState } from "react";
import { isOpportunityExpired, loadOpportunities, saveOpportunities } from "../Data/opportunities.js";
import { loadOpportunityReports, saveOpportunityReports } from "../Data/opportunityReports.js";
import { loadDriveRequests, saveDriveRequests } from "../Data/driveRequests.js";
import { loadVerificationRequests, saveVerificationRequests } from "../Data/verificationRequests.js";
import NotificationCenter from "../components/NotificationCenter.jsx";

function AdminDashboard() {
  const [opportunities, setOpportunities] = useState(loadOpportunities);
  const [opportunityReports, setOpportunityReports] = useState(loadOpportunityReports);
  const [driveRequests, setDriveRequests] = useState(loadDriveRequests);
  const [verificationRequests, setVerificationRequests] = useState(loadVerificationRequests);
  const [filter, setFilter] = useState("All");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [verificationSearch, setVerificationSearch] = useState("");

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

  const reviewOpportunityReport = (reportId, status) => {
    const report = opportunityReports.find((item) => item.id === reportId);
    if (!report) return;

    if (status === "removed") {
      const updatedOpportunities = opportunities.map((item) =>
        item.id === report.opportunityId
          ? { ...item, verified: false, status: "rejected" }
          : item
      );
      saveOpportunities(updatedOpportunities);
      setOpportunities(updatedOpportunities);
    }

    const updatedReports = opportunityReports.map((item) =>
      item.id === reportId
        ? { ...item, status, reviewedAt: new Date().toISOString() }
        : item
    );
    saveOpportunityReports(updatedReports);
    setOpportunityReports(updatedReports);
  };

  const reviewDriveRequest = (id, adminStatus) => {
    const updated = driveRequests.map((request) =>
      request.id === id ? { ...request, adminStatus } : request
    );
    saveDriveRequests(updated);
    setDriveRequests(updated);
  };

  const reviewVerificationApplication = (id, status) => {
    const application = verificationRequests.find((request) => request.id === id);
    if (!application) return;

    const updatedRequests = verificationRequests.map((request) =>
      request.id === id ? { ...request, status, reviewedAt: new Date().toISOString() } : request
    );
    const profileKey = application.accountType === "college" ? "collegeProfile" : "companyProfile";

    try {
      const savedProfile = JSON.parse(localStorage.getItem(profileKey) || "{}");
      if (
        savedProfile.name === application.organizationName &&
        savedProfile.email?.toLowerCase() === application.contactEmail.toLowerCase()
      ) {
        localStorage.setItem(profileKey, JSON.stringify({
          ...savedProfile,
          verificationStatus: status === "approved" ? "verified" : "rejected"
        }));
      }
    } catch (error) {
      console.error("Unable to update the organization profile status.", error);
    }

    saveVerificationRequests(updatedRequests);
    setVerificationRequests(updatedRequests);
  };

  const filteredOpportunities =
    filter === "Drive Requests" || filter === "Organization Verification" || filter === "Reported Listings"
      ? []
      : filter === "Expired"
      ? opportunities.filter(isOpportunityExpired)
      : filter === "All"
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
  const expired = opportunities.filter(isOpportunityExpired).length;

  const pendingDriveRequests = driveRequests.filter(
    (request) => request.adminStatus === "pending"
  ).length;
  const approvedDriveRequests = driveRequests.filter(
    (request) => (request.adminStatus || "approved") === "approved"
  ).length;
  const rejectedDriveRequests = driveRequests.filter(
    (request) => request.adminStatus === "rejected"
  ).length;
  const pendingVerificationRequests = verificationRequests.filter(
    (request) => request.status === "pending"
  ).length;
  const pendingOpportunityReports = opportunityReports.filter(
    (report) => report.status === "pending"
  ).length;
  const approvedVerificationRequests = verificationRequests.filter(
    (request) => request.status === "approved"
  ).length;
  const rejectedVerificationRequests = verificationRequests.filter(
    (request) => request.status === "rejected"
  ).length;
  const filteredVerificationRequests = verificationRequests.filter((request) => {
    const matchesStatus = verificationFilter === "All" || request.status === verificationFilter;
    const query = verificationSearch.trim().toLowerCase();
    const matchesSearch = !query || [
      request.organizationName,
      request.contactEmail,
      request.registrationNumber,
      request.location,
      request.accountType
    ].some((value) => value?.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });
  const adminNotifications = [
    ...(pendingVerificationRequests > 0 ? [{
      id: "pending-verification",
      title: "Organization verification queue",
      message: `${pendingVerificationRequests} application${pendingVerificationRequests === 1 ? " needs" : "s need"} review.`,
      tone: "warning"
    }] : []),
    ...(pendingDriveRequests > 0 ? [{
      id: "pending-drive-requests",
      title: "College drive requests",
      message: `${pendingDriveRequests} request${pendingDriveRequests === 1 ? " needs" : "s need"} admin review.`,
      tone: "info"
    }] : []),
    ...(pending > 0 ? [{
      id: "pending-opportunities",
      title: "Opportunity review",
      message: `${pending} opportunity${pending === 1 ? " needs" : "s need"} verification.`,
      tone: "info"
    }] : []),
    ...(pendingOpportunityReports > 0 ? [{
      id: "pending-opportunity-reports",
      title: "Reported listings",
      message: `${pendingOpportunityReports} listing${pendingOpportunityReports === 1 ? "" : "s"} need review.`,
      tone: "warning"
    }] : [])
  ];

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

          <button
            className={filter === "Expired" ? "active" : ""}
            onClick={() => setFilter("Expired")}
          >
            Expired Listings{expired > 0 ? ` (${expired})` : ""}
          </button>

          <button
            className={filter === "Drive Requests" ? "active" : ""}
            onClick={() => setFilter("Drive Requests")}
          >
            Drive Requests{pendingDriveRequests > 0 ? ` (${pendingDriveRequests})` : ""}
          </button>

          <button
            className={filter === "Organization Verification" ? "active" : ""}
            onClick={() => setFilter("Organization Verification")}
          >
            Organization Verification{pendingVerificationRequests > 0 ? ` (${pendingVerificationRequests})` : ""}
          </button>

          <button
            className={filter === "Reported Listings" ? "active" : ""}
            onClick={() => setFilter("Reported Listings")}
          >
            Reported Listings{pendingOpportunityReports > 0 ? ` (${pendingOpportunityReports})` : ""}
          </button>

        </div>

      </aside>

      {/* Main Content */}

      <main className="admin-main">

        <div className="admin-header">

          <div>
            <p>ADMINISTRATION</p>
            <h1>
              {filter === "Drive Requests"
                ? "Drive Request Review"
                : filter === "Organization Verification"
                  ? "Organization Verification"
                  : filter === "Reported Listings"
                    ? "Reported Listings"
                    : filter === "Expired"
                      ? "Expired Opportunities"
                    : "Verification Dashboard"}
            </h1>
            <span>
              {filter === "Drive Requests"
                ? "Review college requests before sending them to companies."
                : filter === "Organization Verification"
                  ? "Check organization credentials before marking an account genuine."
                  : filter === "Reported Listings"
                    ? "Review concerns reported about job and internship listings."
                    : filter === "Expired"
                      ? "Review listings that have passed their application deadline."
                    : "Review and verify company opportunities."}
            </span>
          </div>

          <NotificationCenter notifications={adminNotifications} />

        </div>

        {/* Statistics */}

        {filter === "Organization Verification" ? (
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Total Applications</span>
              <strong>{verificationRequests.length}</strong>
            </div>
            <div className="admin-stat">
              <span>Awaiting Review</span>
              <strong>{pendingVerificationRequests}</strong>
            </div>
            <div className="admin-stat">
              <span>Verified</span>
              <strong>{approvedVerificationRequests}</strong>
            </div>
            <div className="admin-stat">
              <span>Not Verified</span>
              <strong>{rejectedVerificationRequests}</strong>
            </div>
          </div>
        ) : filter === "Reported Listings" ? (
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Total Reports</span>
              <strong>{opportunityReports.length}</strong>
            </div>
            <div className="admin-stat">
              <span>Awaiting Review</span>
              <strong>{pendingOpportunityReports}</strong>
            </div>
            <div className="admin-stat">
              <span>Listings Removed</span>
              <strong>{opportunityReports.filter((report) => report.status === "removed").length}</strong>
            </div>
            <div className="admin-stat">
              <span>Reports Dismissed</span>
              <strong>{opportunityReports.filter((report) => report.status === "dismissed").length}</strong>
            </div>
          </div>
        ) : filter === "Drive Requests" ? (
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Total Requests</span>
              <strong>{driveRequests.length}</strong>
            </div>
            <div className="admin-stat">
              <span>Awaiting Review</span>
              <strong>{pendingDriveRequests}</strong>
            </div>
            <div className="admin-stat">
              <span>Sent to Companies</span>
              <strong>{approvedDriveRequests}</strong>
            </div>
            <div className="admin-stat">
              <span>Declined</span>
              <strong>{rejectedDriveRequests}</strong>
            </div>
          </div>
        ) : (
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

          <div className="admin-stat">
            <span>Expired Listings</span>
            <strong>{expired}</strong>
          </div>

        </div>
        )}

        {/* Opportunity List */}

        <div className="admin-section">

          <div className="admin-section-heading">
            <h2>
              {filter === "Drive Requests"
                ? "College Drive Requests"
                : filter === "Organization Verification"
                  ? "Verification Applications"
                  : filter === "Reported Listings"
                    ? "Listing Reports"
                    : filter === "Expired"
                      ? "Expired Opportunities"
                      : `${filter} Opportunities`}
            </h2>
            <span>
              {filter === "Drive Requests"
                ? `${driveRequests.length} ${driveRequests.length === 1 ? "request" : "requests"}`
                : filter === "Organization Verification"
                  ? `${filteredVerificationRequests.length} ${filteredVerificationRequests.length === 1 ? "application" : "applications"}`
                  : filter === "Reported Listings"
                    ? `${opportunityReports.length} ${opportunityReports.length === 1 ? "report" : "reports"}`
                  : `${filteredOpportunities.length} opportunities`}
            </span>
          </div>

          {filter === "Reported Listings" ? (
            opportunityReports.length === 0 ? (
              <div className="admin-empty">
                <h3>No listing reports</h3>
                <p>Reports submitted by colleges will appear here for review.</p>
              </div>
            ) : (
              <div className="admin-opportunity-list">
                {[...opportunityReports]
                  .sort((first, second) => {
                    if (first.status === "pending" && second.status !== "pending") return -1;
                    if (second.status === "pending" && first.status !== "pending") return 1;
                    return (second.reportedAt || "").localeCompare(first.reportedAt || "");
                  })
                  .map((report) => (
                    <article className="admin-opportunity-card admin-report-card" key={report.id}>
                      <div className="admin-opportunity-info">
                        <div className="admin-title-row">
                          <h3>{report.title}</h3>
                          <span className={`admin-drive-status admin-drive-${report.status === "pending" ? "pending" : report.status}`}>
                            {report.status === "pending" ? "Awaiting review" : report.status}
                          </span>
                        </div>
                        <p className="admin-company">{report.company}</p>
                        <div className="admin-details">
                          <span>Reason: {report.reason}</span>
                          <span>Reported: {report.reportedAt ? new Date(report.reportedAt).toLocaleString() : "Date unavailable"}</span>
                          {report.details && <span>{report.details}</span>}
                        </div>
                      </div>
                      {report.status === "pending" && (
                        <div className="admin-actions">
                          <button className="verify-btn" onClick={() => reviewOpportunityReport(report.id, "dismissed")}>
                            Dismiss
                          </button>
                          <button className="reject-btn" onClick={() => reviewOpportunityReport(report.id, "removed")}>
                            Remove listing
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
              </div>
            )
          ) : filter === "Organization Verification" ? (
            <>
              <div className="verification-review-controls">
                <input
                  type="search"
                  value={verificationSearch}
                  onChange={(event) => setVerificationSearch(event.target.value)}
                  placeholder="Search name, email, registration..."
                  aria-label="Search verification applications"
                />
                <select
                  value={verificationFilter}
                  onChange={(event) => setVerificationFilter(event.target.value)}
                  aria-label="Filter verification applications by status"
                >
                  <option value="All">All statuses</option>
                  <option value="pending">Pending review</option>
                  <option value="approved">Verified</option>
                  <option value="rejected">Not verified</option>
                </select>
              </div>
              {filteredVerificationRequests.length === 0 ? (
              <div className="admin-empty">
                <h3>{verificationRequests.length === 0 ? "No verification applications" : "No matching applications"}</h3>
                <p>{verificationRequests.length === 0
                  ? "Company and college verification requests will appear here."
                  : "Try changing your search or status filter."}</p>
              </div>
            ) : (
              <div className="admin-opportunity-list">
                {[...filteredVerificationRequests]
                  .sort((first, second) => {
                    if (first.status === "pending" && second.status !== "pending") return -1;
                    if (second.status === "pending" && first.status !== "pending") return 1;
                    return (second.submittedAt || "").localeCompare(first.submittedAt || "");
                  })
                  .map((request) => (
                    <article className="admin-opportunity-card admin-verification-card" key={request.id}>
                      <div className="admin-opportunity-info">
                        <div className="admin-title-row">
                          <h3>{request.organizationName}</h3>
                          <span className={`admin-drive-status admin-drive-${request.status}`}>
                            {request.status === "approved" ? "Verified" : request.status === "rejected" ? "Not verified" : "Pending review"}
                          </span>
                        </div>
                        <p className="admin-company">
                          {request.accountType === "college" ? "College" : "Company"} · {request.contactEmail}
                        </p>
                        <div className="admin-details">
                          <span>Registration: {request.registrationNumber}</span>
                          {request.location && <span>Location: {request.location}</span>}
                          {request.website && <span>Website: {request.website}</span>}
                          <span>{request.note}</span>
                        </div>
                        {request.documents?.length > 0 && (
                          <div className="verification-review-documents">
                            <strong>Evidence documents</strong>
                            {request.documents.map((document, index) => (
                              <a
                                href={document.dataUrl}
                                download={document.name}
                                target="_blank"
                                rel="noreferrer"
                                key={`${document.name}-${index}`}
                              >
                                {document.name}
                                <small>{Math.max(1, Math.round(document.size / 1024))} KB · Open or download</small>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      {request.status === "pending" ? (
                        <div className="admin-actions">
                          <button className="verify-btn" onClick={() => reviewVerificationApplication(request.id, "approved")}>
                            Mark genuine
                          </button>
                          <button className="reject-btn" onClick={() => reviewVerificationApplication(request.id, "rejected")}>
                            Not genuine
                          </button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <span className={request.status === "approved" ? "verified-text" : "rejected-text"}>
                            {request.status === "approved" ? "Verified" : "Not verified"}
                          </span>
                        </div>
                      )}
                    </article>
                  ))}
              </div>
            )}
            </>
          ) : filter === "Drive Requests" ? (
            driveRequests.length === 0 ? (
              <div className="admin-empty">
                <h3>No drive requests to review</h3>
                <p>New requests from colleges will appear here.</p>
              </div>
            ) : (
              <div className="admin-opportunity-list">
                {[...driveRequests].sort((first, second) => {
                  if (first.adminStatus === "pending" && second.adminStatus !== "pending") return -1;
                  if (second.adminStatus === "pending" && first.adminStatus !== "pending") return 1;
                  return (second.createdAt || "").localeCompare(first.createdAt || "");
                }).map((request) => {
                  const reviewStatus = request.adminStatus || "approved";
                  return (
                    <article className="admin-opportunity-card admin-drive-request-card" key={request.id}>
                      <div className="admin-opportunity-info">
                        <div className="admin-title-row">
                          <h3>{request.college}</h3>
                          <span className={`admin-drive-status admin-drive-${reviewStatus}`}>
                            {reviewStatus === "approved" ? "Sent to company" : reviewStatus}
                          </span>
                        </div>
                        <p className="admin-company">Request for {request.company}</p>
                        <div className="admin-details">
                          <span>Preferred date: {request.date}</span>
                          <span>{request.students} expected students</span>
                          {request.message && <span>{request.message}</span>}
                        </div>
                        {reviewStatus === "approved" && (
                          <p className="admin-drive-company-status">
                            Company response: {request.status || "pending"}
                          </p>
                        )}
                      </div>
                      {reviewStatus === "pending" ? (
                        <div className="admin-actions">
                          <button className="verify-btn" onClick={() => reviewDriveRequest(request.id, "approved")}>
                            Approve
                          </button>
                          <button className="reject-btn" onClick={() => reviewDriveRequest(request.id, "rejected")}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <span className={reviewStatus === "approved" ? "verified-text" : "rejected-text"}>
                            {reviewStatus === "approved" ? "Cleared" : "Declined"}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )
          ) : filteredOpportunities.length === 0 ? (

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
                      {item.expiryDate && (
                        <span>Apply by {item.expiryDate}</span>
                      )}

                    </div>

                    <div className="admin-status">

                      {item.verified ? (

                        <span className="admin-verified">
                          ✓ Verified
                        </span>

                      ) : isOpportunityExpired(item) ? (
                        <span className="admin-rejected">
                          Expired
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