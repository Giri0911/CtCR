 "use client";

import { useEffect, useState } from "react";
import { hydrateOpportunities, isOpportunityExpired, loadOpportunities, saveOpportunities } from "../Data/opportunities.js";
import { hydrateOpportunityReports, loadOpportunityReports, saveOpportunityReports } from "../Data/opportunityReports.js";
import { hydrateOrganizationReports, loadOrganizationReports, saveOrganizationReports } from "../Data/organizationReports.js";
import { hydrateDriveRequests, loadDriveRequests, saveDriveRequests } from "../Data/driveRequests.js";
import { hydrateVerificationRequests, loadVerificationRequests, saveVerificationRequests } from "../Data/verificationRequests.js";
import NotificationCenter from "../components/NotificationCenter.jsx";
import { Link } from "../next-router-compat.jsx";

function AdminDashboard() {
  const [opportunities, setOpportunities] = useState(loadOpportunities);
  const [opportunityReports, setOpportunityReports] = useState(loadOpportunityReports);
  const [organizationReports, setOrganizationReports] = useState(loadOrganizationReports);
  const [driveRequests, setDriveRequests] = useState(loadDriveRequests);
  const [verificationRequests, setVerificationRequests] = useState(loadVerificationRequests);
  const [filter, setFilter] = useState("All");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [verificationSearch, setVerificationSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("All");
  const [reportSearch, setReportSearch] = useState("");
  const [organizationReportFilter, setOrganizationReportFilter] = useState("All");
  const [organizationReportSearch, setOrganizationReportSearch] = useState("");
  useEffect(() => {
    Promise.all([
      hydrateOpportunities(),
      hydrateOpportunityReports(),
      hydrateOrganizationReports(),
      hydrateDriveRequests(),
      hydrateVerificationRequests()
    ]).then(([nextOpportunities, nextOpportunityReports, nextOrganizationReports, nextDriveRequests, nextVerificationRequests]) => {
      setOpportunities(nextOpportunities);
      setOpportunityReports(nextOpportunityReports);
      setOrganizationReports(nextOrganizationReports);
      setDriveRequests(nextDriveRequests);
      setVerificationRequests(nextVerificationRequests);
    }).catch((error) => console.error("Unable to hydrate admin data.", error));
  }, []);

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

  const reviewOrganizationReport = (reportId, status) => {
    const updatedReports = organizationReports.map((report) =>
      report.id === reportId
        ? { ...report, status, reviewedAt: new Date().toISOString() }
        : report
    );
    saveOrganizationReports(updatedReports);
    setOrganizationReports(updatedReports);
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

  const filteredOpportunitiesByCategory =
    filter === "Drive Requests" || filter === "Organization Verification" || filter === "Reported Listings" || filter === "Organization Reports"
      ? []
      : filter === "Expired"
      ? opportunities.filter(isOpportunityExpired)
      : filter === "Closed"
      ? opportunities.filter((item) => item.status === "closed")
      : filter === "All"
      ? opportunities
      : filter === "Pending"
      ? opportunities.filter(
          (item) =>
            item.verified === false &&
            !["rejected", "closed"].includes(item.status)
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
  const opportunityQuery = opportunitySearch.trim().toLowerCase();
  const filteredOpportunities = filteredOpportunitiesByCategory
    .filter((item) => !opportunityQuery || [
      item.title,
      item.company,
      item.location,
      item.mode,
      item.description,
      item.eligibility,
      item.salary,
      item.status,
      ...(Array.isArray(item.skills) ? item.skills : [])
    ].some((value) => String(value || "").toLowerCase().includes(opportunityQuery)))
    .sort((first, second) => {
      const firstPending = first.verified === false && !["rejected", "closed"].includes(first.status);
      const secondPending = second.verified === false && !["rejected", "closed"].includes(second.status);
      if (firstPending !== secondPending) return firstPending ? -1 : 1;
      return Number(second.id) - Number(first.id);
    });

  const total = opportunities.length;

  const pending = opportunities.filter(
    (item) =>
      item.verified === false &&
      !["rejected", "closed"].includes(item.status)
  ).length;

  const verified = opportunities.filter(
    (item) => item.verified === true
  ).length;

  const internships = opportunities.filter(
    (item) => item.type === "Internship"
  ).length;
  const expired = opportunities.filter(isOpportunityExpired).length;
  const closed = opportunities.filter((item) => item.status === "closed").length;

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
  const filteredOpportunityReports = opportunityReports.filter((report) => {
    const matchesStatus = reportFilter === "All" ||
      report.status === reportFilter;
    const query = reportSearch.trim().toLowerCase();
    const matchesSearch = !query || [
      report.title,
      report.company,
      report.reportedBy,
      report.reason,
      report.details
    ].some((value) => value?.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });
  const pendingOrganizationReports = organizationReports.filter(
    (report) => report.status === "pending"
  ).length;
  const filteredOrganizationReports = organizationReports.filter((report) => {
    const matchesStatus = organizationReportFilter === "All" ||
      (organizationReportFilter === "Reviewed"
        ? report.status !== "pending"
        : report.status === organizationReportFilter);
    const query = organizationReportSearch.trim().toLowerCase();
    const matchesSearch = !query || [
      report.organizationName,
      report.organizationLocation,
      report.reportedBy,
      report.reason,
      report.details
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
    }] : []),
    ...(pendingOrganizationReports > 0 ? [{
      id: "pending-organization-reports",
      title: "Organization reports",
      message: `${pendingOrganizationReports} report${pendingOrganizationReports === 1 ? "" : "s"} need review.`,
      tone: "warning"
    }] : [])
  ];
  const pageHeading = {
    All: "Opportunity Moderation",
    Pending: "Pending Review Queue",
    Verified: "Verified Opportunities",
    Jobs: "Job Listings",
    Internships: "Internship Listings",
    Expired: "Expired Opportunities",
    Closed: "Closed Opportunities",
    "Drive Requests": "Drive Request Review",
    "Organization Verification": "Organization Verification",
    "Reported Listings": "Reported Listings",
    "Organization Reports": "Organization Reports"
  }[filter] || "Admin Workspace";
  const pageDescription = {
    All: "Monitor opportunity listings and keep the campus hiring marketplace reliable.",
    Pending: "Review new company listings and verify accurate, complete opportunities.",
    Verified: "Review currently verified job and internship listings.",
    Jobs: "Review job listings submitted by companies.",
    Internships: "Review internship listings submitted by companies.",
    Expired: "Review listings that have passed their application deadline.",
    Closed: "Review company listings that have been closed or reopened.",
    "Drive Requests": "Review college requests before sending them to companies.",
    "Organization Verification": "Check organization credentials before marking an account genuine.",
    "Reported Listings": "Review concerns reported about job and internship listings.",
    "Organization Reports": "Review concerns reported about organizations in the company directory."
  }[filter] || "Review CampusXCompany activity.";

  return (
    <div className="admin-dashboard">

      {/* Sidebar */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <h2>CampusXCompany</h2>
          <p>Admin Panel</p>
        </div>

        <div className="admin-menu">

          <button
            type="button"
            className={filter === "All" ? "active" : ""}
            onClick={() => setFilter("All")}
          >
            All Opportunities
          </button>

          <button
            type="button"
            className={filter === "Pending" ? "active" : ""}
            onClick={() => setFilter("Pending")}
          >
            <span>Pending Review</span>
            {pending > 0 && <span className="admin-menu-count">{pending}</span>}
          </button>

          <button
            type="button"
            className={filter === "Verified" ? "active" : ""}
            onClick={() => setFilter("Verified")}
          >
            Verified
          </button>

          <button
            type="button"
            className={filter === "Jobs" ? "active" : ""}
            onClick={() => setFilter("Jobs")}
          >
            Jobs
          </button>

          <button
            type="button"
            className={filter === "Internships" ? "active" : ""}
            onClick={() => setFilter("Internships")}
          >
            Internships
          </button>

          <button
            type="button"
            className={filter === "Expired" ? "active" : ""}
            onClick={() => setFilter("Expired")}
          >
            Expired Listings{expired > 0 ? ` (${expired})` : ""}
          </button>

          <button
            type="button"
            className={filter === "Closed" ? "active" : ""}
            onClick={() => setFilter("Closed")}
          >
            Closed Listings{closed > 0 ? ` (${closed})` : ""}
          </button>

          <button
            type="button"
            className={filter === "Drive Requests" ? "active" : ""}
            onClick={() => setFilter("Drive Requests")}
          >
            Drive Requests{pendingDriveRequests > 0 ? ` (${pendingDriveRequests})` : ""}
          </button>

          <button
            type="button"
            className={filter === "Organization Verification" ? "active" : ""}
            onClick={() => setFilter("Organization Verification")}
          >
            Organization Verification{pendingVerificationRequests > 0 ? ` (${pendingVerificationRequests})` : ""}
          </button>

          <button
            type="button"
            className={filter === "Reported Listings" ? "active" : ""}
            onClick={() => setFilter("Reported Listings")}
          >
            Reported Listings{pendingOpportunityReports > 0 ? ` (${pendingOpportunityReports})` : ""}
          </button>

          <button
            type="button"
            className={filter === "Organization Reports" ? "active" : ""}
            onClick={() => setFilter("Organization Reports")}
          >
            Organization Reports{pendingOrganizationReports > 0 ? ` (${pendingOrganizationReports})` : ""}
          </button>

        </div>

        <nav className="admin-portal-links" aria-label="Other CampusXCompany pages">
          <p>PORTALS</p>
          <Link to="/">Home</Link>
          <Link to="/college">College Portal</Link>
          <Link to="/company">Company Portal</Link>
          <Link to="/college/companies">Company Directory</Link>
          <Link to="/opportunities">Browse Opportunities</Link>
        </nav>

      </aside>

      {/* Main Content */}

      <main className="admin-main">

        <div className="admin-header">

          <div>
            <p>ADMINISTRATION</p>
            <h1>{pageHeading}</h1>
            <span>{pageDescription}</span>
          </div>

          <NotificationCenter notifications={adminNotifications} scope="admin" />

        </div>

        {pending > 0 && filter !== "Pending" && (
          <section className="admin-review-banner" aria-label="Pending moderation queue">
            <div>
              <span className="admin-review-indicator" aria-hidden="true">!</span>
              <div>
                <strong>{pending} {pending === 1 ? "listing needs" : "listings need"} your review</strong>
                <p>New opportunities are prioritized at the top of the review queue.</p>
              </div>
            </div>
            <button type="button" onClick={() => setFilter("Pending")}>Open review queue <span aria-hidden="true">→</span></button>
          </section>
        )}

        {(pendingVerificationRequests + pendingDriveRequests + pendingOpportunityReports + pendingOrganizationReports) > 0 && (
          <section className="admin-reminders" aria-label="Admin reminders">
            <div className="admin-section-heading">
              <div>
                <h2>Reminders</h2>
                <p>Items waiting for admin action.</p>
              </div>
              <span>{pendingVerificationRequests + pendingDriveRequests + pendingOpportunityReports + pendingOrganizationReports} open</span>
            </div>
            <div className="admin-reminder-list">
              {[
                [pendingVerificationRequests, "Organization verification", "Organization Verification"],
                [pendingDriveRequests, "College drive requests", "Drive Requests"],
                [pendingOpportunityReports, "Reported listings", "Reported Listings"],
                [pendingOrganizationReports, "Organization reports", "Organization Reports"]
              ].filter(([count]) => count > 0).map(([count, label, nextFilter]) => (
                <button type="button" className="admin-reminder-item" key={label} onClick={() => setFilter(nextFilter)}>
                  <span className="admin-reminder-icon" aria-hidden="true">!</span>
                  <span><strong>{label}</strong><small>{count} awaiting review</small></span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        )}

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
        ) : filter === "Organization Reports" ? (
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Total Reports</span>
              <strong>{organizationReports.length}</strong>
            </div>
            <div className="admin-stat">
              <span>Awaiting Review</span>
              <strong>{pendingOrganizationReports}</strong>
            </div>
            <div className="admin-stat">
              <span>Reviewed</span>
              <strong>{organizationReports.filter((report) => report.status === "reviewed").length}</strong>
            </div>
            <div className="admin-stat">
              <span>Dismissed</span>
              <strong>{organizationReports.filter((report) => report.status === "dismissed").length}</strong>
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
          <div className="admin-stat">
            <span>Closed Listings</span>
            <strong>{closed}</strong>
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
                  : filter === "Organization Reports"
                    ? "Organization Reports"
                  : filter === "Reported Listings"
                    ? "Listing Reports"
                    : filter === "Expired"
                      ? "Expired Opportunities"
                      : filter === "Closed"
                        ? "Closed Opportunities"
                      : `${filter} Opportunities`}
            </h2>
            <span>
              {filter === "Drive Requests"
                ? `${driveRequests.length} ${driveRequests.length === 1 ? "request" : "requests"}`
                : filter === "Organization Verification"
                  ? `${filteredVerificationRequests.length} ${filteredVerificationRequests.length === 1 ? "application" : "applications"}`
                  : filter === "Organization Reports"
                    ? `${filteredOrganizationReports.length} ${filteredOrganizationReports.length === 1 ? "report" : "reports"}`
                  : filter === "Reported Listings"
                    ? `${filteredOpportunityReports.length} ${filteredOpportunityReports.length === 1 ? "report" : "reports"}`
                  : `${filteredOpportunities.length} opportunities`}
            </span>
          </div>

          {filter !== "Drive Requests" &&
            filter !== "Organization Verification" &&
            filter !== "Reported Listings" &&
            filter !== "Organization Reports" && (
              <div className="admin-opportunity-search">
                <input
                  type="search"
                  value={opportunitySearch}
                  onChange={(event) => setOpportunitySearch(event.target.value)}
                  placeholder="Search opportunities, companies, skills..."
                  aria-label="Search opportunities"
                />
                {opportunitySearch && (
                  <button type="button" onClick={() => setOpportunitySearch("")}>Clear search</button>
                )}
              </div>
            )}

          {filter === "Organization Reports" ? (
            <>
              <div className="verification-review-controls">
                <input
                  type="search"
                  value={organizationReportSearch}
                  onChange={(event) => setOrganizationReportSearch(event.target.value)}
                  placeholder="Search organizations, reporters, or concerns..."
                  aria-label="Search organization reports"
                />
                <select
                  value={organizationReportFilter}
                  onChange={(event) => setOrganizationReportFilter(event.target.value)}
                  aria-label="Filter organization reports by status"
                >
                  <option>All</option>
                  <option>pending</option>
                  <option>Reviewed</option>
                  <option>reviewed</option>
                  <option>dismissed</option>
                </select>
              </div>
              {filteredOrganizationReports.length === 0 ? (
                <div className="admin-empty">
                  <h3>{organizationReports.length === 0 ? "No organization reports" : "No matching reports"}</h3>
                  <p>{organizationReports.length === 0
                    ? "Reports submitted from the company directory will appear here for review."
                    : "Try changing your search or report status filter."}</p>
                </div>
              ) : (
                <div className="admin-opportunity-list">
                  {[...filteredOrganizationReports]
                    .sort((first, second) => {
                      if (first.status === "pending" && second.status !== "pending") return -1;
                      if (second.status === "pending" && first.status !== "pending") return 1;
                      return (second.reportedAt || "").localeCompare(first.reportedAt || "");
                    })
                    .map((report) => (
                      <article className="admin-opportunity-card admin-report-card" key={report.id}>
                        <div className="admin-opportunity-info">
                          <div className="admin-title-row">
                            <h3>{report.organizationName}</h3>
                            <span className={`admin-drive-status admin-drive-${report.status}`}>
                              {report.status === "pending" ? "Awaiting review" : report.status}
                            </span>
                          </div>
                          <p className="admin-company">{report.organizationLocation}</p>
                          <p className="admin-report-reporter">Reported by {report.reportedBy}</p>
                          <div className="admin-details">
                            <span>Reason: {report.reason}</span>
                            <span>Reported: {report.reportedAt ? new Date(report.reportedAt).toLocaleString() : "Date unavailable"}</span>
                            <span>{report.details}</span>
                          </div>
                        </div>
                        {report.status === "pending" && (
                          <div className="admin-actions">
                            <button className="verify-btn" onClick={() => reviewOrganizationReport(report.id, "dismissed")}>
                              Dismiss
                            </button>
                            <button className="reject-btn" onClick={() => reviewOrganizationReport(report.id, "reviewed")}>
                              Mark reviewed
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                </div>
              )}
            </>
          ) : filter === "Reported Listings" ? (
            <>
              <div className="verification-review-controls">
                <input
                  type="search"
                  value={reportSearch}
                  onChange={(event) => setReportSearch(event.target.value)}
                  placeholder="Search listings, companies, or reports..."
                  aria-label="Search listing reports"
                />
                <select
                  value={reportFilter}
                  onChange={(event) => setReportFilter(event.target.value)}
                  aria-label="Filter listing reports by status"
                >
                  <option>All</option>
                  <option value="pending">Awaiting review</option>
                  <option value="removed">Listing removed</option>
                  <option value="dismissed">Report dismissed</option>
                  <option value="reviewed">Reviewed (legacy)</option>
                </select>
              </div>
              <div className="admin-report-summary" aria-label="Listing report totals">
                <div><span>Awaiting review</span><strong>{pendingOpportunityReports}</strong></div>
                <div><span>Listing removed</span><strong>{opportunityReports.filter((report) => report.status === "removed").length}</strong></div>
                <div><span>Dismissed</span><strong>{opportunityReports.filter((report) => report.status === "dismissed").length}</strong></div>
              </div>
            {filteredOpportunityReports.length === 0 ? (
              <div className="admin-empty">
                <h3>{opportunityReports.length === 0 ? "No listing reports" : "No matching reports"}</h3>
                <p>{opportunityReports.length === 0
                  ? "Reports submitted by colleges will appear here for review."
                  : "Try changing your search or report status filter."}</p>
              </div>
            ) : (
              <div className="admin-opportunity-list">
                {[...filteredOpportunityReports]
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
                            {report.status === "pending"
                              ? "Awaiting review"
                              : report.status === "removed"
                                ? "Listing removed"
                                : report.status === "dismissed"
                                  ? "Report dismissed"
                                  : "Reviewed"}
                          </span>
                        </div>
                        <p className="admin-company">
                          {report.company}{report.type ? ` · ${report.type}` : ""}
                          {report.opportunityId != null ? ` · Listing #${report.opportunityId}` : ""}
                        </p>
                        {report.reportedBy && <p className="admin-report-reporter">Reported by {report.reportedBy}</p>}
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
            }
            </>
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

                      {item.stipend && (
                        <span>Stipend: {item.stipend}</span>
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

                      ) : item.status === "closed" ? (
                        <span className="admin-rejected">
                          Closed by company
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
                      item.status !== "rejected" &&
                      item.status !== "closed" &&
                      !isOpportunityExpired(item) && (
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