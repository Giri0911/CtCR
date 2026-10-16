 "use client";

import { Link, useLocation, useSearchParams } from "../next-router-compat.jsx";
import NotificationCenter from "./NotificationCenter.jsx";

function loadCollegeName() {
  try {
    const profile = JSON.parse(localStorage.getItem("collegeProfile") || "{}");
    return typeof profile.name === "string" && profile.name.trim()
      ? profile.name.trim()
      : "College Admin";
  } catch {
    return "College Admin";
  }
}

export function CollegePortalSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isDashboard = location.pathname === "/college" && !location.hash;
  const isDirectory = location.pathname === "/college/companies";
  const isDriveRequests = location.pathname === "/college" && location.hash === "#drive-requests";
  const isListingReports = location.pathname === "/college" && location.hash === "#listing-reports";
  const isProfile = location.pathname === "/college/college-profile" || location.hash === "#college-profile";
  const isSaved = searchParams.get("saved") === "true";
  const opportunityType = searchParams.get("type");
  const isJobs = location.pathname === "/opportunities" && opportunityType === "Job";
  const isInternships = location.pathname === "/opportunities" && opportunityType === "Internship";
  const isAllOpportunities = location.pathname === "/opportunities" && !isJobs && !isInternships && !isSaved;

  return (
    <aside className="sidebar">
      <div className="dashboard-logo">
        Campus<span>XCompany</span>
      </div>
      <nav className="college-sidebar-nav" aria-label="College navigation">
        <p className="menu-title">MAIN MENU</p>
        <Link className={isDashboard ? "active-menu" : ""} to="/college">Dashboard</Link>
        <Link className={isDirectory ? "active-menu" : ""} to="/college/companies">Discover Companies</Link>
        <Link className={isAllOpportunities ? "active-menu" : ""} to="/opportunities">All Opportunities</Link>
        <Link className={isJobs ? "active-menu" : ""} to="/opportunities?type=Job">Job Vacancies</Link>
        <Link className={isInternships ? "active-menu" : ""} to="/opportunities?type=Internship">Internships</Link>
        <Link className={isSaved ? "active-menu" : ""} to="/opportunities?saved=true">Saved Opportunities</Link>
        <Link className={isDriveRequests ? "active-menu" : ""} to="/college#drive-requests">Drive Requests</Link>
        <Link className={isListingReports ? "active-menu" : ""} to="/college#listing-reports">My Listing Reports</Link>
        <p className="menu-title">ACCOUNT</p>
        <Link className={isProfile ? "active-menu" : ""} to="/college/college-profile">College Profile</Link>
        <Link to="/">Logout</Link>
      </nav>
    </aside>
  );
}

function CollegePortalLayout({ eyebrow = "COLLEGE PLACEMENT PORTAL", title, description, children, contentClassName = "" }) {
  const collegeName = loadCollegeName();

  return (
    <div className="college-dashboard">
      <CollegePortalSidebar />
      <main className={`dashboard-main college-page-main ${contentClassName}`}>
        <header className="dashboard-header college-page-header">
          <div>
            <p className="welcome-text">{eyebrow}</p>
            <h1>{title}</h1>
            {description && <p className="college-page-description">{description}</p>}
          </div>
          <NotificationCenter notifications={[]} scope="college" />
          <div className="college-user">
            <div className="college-avatar">{collegeName.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{collegeName}</strong>
              <small>Placement Officer</small>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default CollegePortalLayout;
