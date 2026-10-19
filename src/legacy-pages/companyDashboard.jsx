 "use client";

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "../next-router-compat.jsx";
import { hydrateOpportunities, isOpportunityExpired, loadOpportunities, saveOpportunities } from "../Data/opportunities.js";
import { hydrateDriveRequests, loadDriveRequests, saveDriveRequests } from "../Data/driveRequests.js";
import { hydrateVerificationRequests, loadVerificationRequests, saveVerificationRequests } from "../Data/verificationRequests.js";
import { hydrateOrganizationReports, loadOrganizationReports, saveOrganizationReports } from "../Data/organizationReports.js";
import { MAX_VERIFICATION_DOCUMENTS, MAX_VERIFICATION_DOCUMENT_SIZE, readVerificationDocument } from "../Data/verificationRequests.js";
import NotificationCenter from "../components/NotificationCenter.jsx";
import DriveRequestTimeline from "../components/DriveRequestTimeline.jsx";
import OpportunityEditor from "../components/OpportunityEditor.jsx";
import { api } from "../api/client.js";

const companyName = "TechNova Technologies";
const defaultCompanyProfile = {
  name: companyName,
  email: "",
  location: "Guntur, Andhra Pradesh",
  industry: "Software & Technology",
  phone: "",
  website: "",
  verificationStatus: "not_submitted"
};

function loadCompanyProfile() {
  try {
    const savedProfile = localStorage.getItem("companyProfile");
    return savedProfile
      ? { ...defaultCompanyProfile, ...JSON.parse(savedProfile) }
      : defaultCompanyProfile;
  } catch {
    return defaultCompanyProfile;
  }
}

function getDefaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function getTodayDateInputValue() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function getCompanyItems(type, activeCompanyName) {
  return loadOpportunities()
    .filter((item) => item.company === activeCompanyName && item.type === type)
    .map((item) => ({
      ...item,
      type: type === "Job" ? item.mode : item.type,
      status: isOpportunityExpired(item)
        ? "Expired"
        : item.status === "closed"
          ? "Closed"
        : item.status === "rejected"
          ? "Rejected"
          : item.verified
            ? "Verified"
            : "Under Review"
    }));
}

function CompanyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const showingProfile = location.hash === "#company-profile";
  const showingDriveRequests = location.hash === "#drive-requests";
  const showingCollegeReports = location.hash === "#college-reports";
  const showingJobs = location.hash === "#job-vacancies";
  const showingInternships = location.hash === "#internships";
  const showingDashboard = ![
    "#company-profile",
    "#drive-requests",
    "#college-reports",
    "#job-vacancies",
    "#internships"
  ].includes(location.hash);
  const [showPostedNotice, setShowPostedNotice] = useState(() =>
    Boolean(location.state?.opportunitySubmitted)
  );
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [opportunityFeedback, setOpportunityFeedback] = useState("");
  const openJobForm = () => {
    setEditingOpportunity(null);
    setShowInternshipForm(false);
    setShowJobForm(true);
  };
  const openInternshipForm = () => {
    setEditingOpportunity(null);
    setShowJobForm(false);
    setShowInternshipForm(true);
  };
  useEffect(() => {
    const postingJob = location.hash === "#post-job";
    const postingInternship = location.hash === "#post-internship";
    setShowJobForm(postingJob);
    setShowInternshipForm(postingInternship);
  }, [location.hash]);
  useEffect(() => {
    if (showJobForm) {
      document.getElementById("company-job-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showJobForm]);
  useEffect(() => {
    if (showInternshipForm) {
      document.getElementById("company-internship-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showInternshipForm]);
  useEffect(() => {
    const targetId = {
      "#create-listing": "create-listing",
      "#company-profile": "company-profile",
      "#drive-requests": "drive-requests",
      "#college-reports": "college-reports",
      "#job-vacancies": "job-vacancies",
      "#internships": "internships"
    }[location.hash];
    if (targetId) {
      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);
  const [companyProfile, setCompanyProfile] = useState(loadCompanyProfile);
  const [companyProfileForm, setCompanyProfileForm] = useState(loadCompanyProfile);
  const [editingCompanyProfile, setEditingCompanyProfile] = useState(() => !loadCompanyProfile().email);
  const [verificationRequests, setVerificationRequests] = useState(loadVerificationRequests);
  const [organizationReports, setOrganizationReports] = useState(loadOrganizationReports);
  const [reportForm, setReportForm] = useState({ organizationName: "", reason: "Unprofessional conduct", details: "" });
  const [reportFeedback, setReportFeedback] = useState("");
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ registrationNumber: "", website: "", note: "", documents: [], error: "" });
  const latestVerificationRequest = [...verificationRequests]
    .filter((request) =>
      request.accountType === "company" &&
      request.organizationName === companyProfile.name &&
      request.contactEmail?.toLowerCase() === companyProfile.email.toLowerCase()
    )
    .sort((first, second) => second.submittedAt.localeCompare(first.submittedAt))[0];
  const verificationStatus = latestVerificationRequest?.status || companyProfile.verificationStatus || "not_submitted";
  const verificationStatusLabel = {
    not_submitted: "Not verified",
    pending: "Under review",
    approved: "Verified",
    rejected: "Not verified"
  }[verificationStatus] || "Not verified";

  const [jobs, setJobs] = useState(() => getCompanyItems("Job", companyProfile.name));
  const [internships, setInternships] = useState(() => getCompanyItems("Internship", companyProfile.name));
  const initialCompanyProfileRef = useRef(companyProfile);
  useEffect(() => {
    const initialCompanyProfile = initialCompanyProfileRef.current;
    if (!initialCompanyProfile.email) return;
    api.getProfile("company", initialCompanyProfile.email)
      .then((remoteProfile) => {
        const nextProfile = {
          ...initialCompanyProfile,
          name: remoteProfile.CompanyName,
          email: remoteProfile.Email,
          location: remoteProfile.Location,
          industry: remoteProfile.Industry,
          phone: remoteProfile.Phone || "",
          website: remoteProfile.Website || "",
          verificationStatus: remoteProfile.VerificationStatus
        };
        setCompanyProfile(nextProfile);
        setCompanyProfileForm(nextProfile);
        localStorage.setItem("companyProfile", JSON.stringify(nextProfile));
      })
      .catch((error) => console.error("Unable to load the company profile.", error));
  }, []);
  useEffect(() => {
    Promise.all([hydrateOpportunities(), hydrateDriveRequests(), hydrateVerificationRequests(), hydrateOrganizationReports()])
      .then(([opportunities, requests, verifications, reports]) => {
        setJobs(opportunities.filter((item) => item.company === companyProfile.name && item.type === "Job"));
        setInternships(opportunities.filter((item) => item.company === companyProfile.name && item.type === "Internship"));
        setDriveRequests(requests.filter((request) =>
          request.company === companyProfile.name && (request.adminStatus || "approved") === "approved"
        ));
        setVerificationRequests(verifications);
        setOrganizationReports(reports);
      })
      .catch((error) => console.error("Unable to hydrate company data.", error));
  }, [companyProfile.name]);
  const [driveRequests, setDriveRequests] = useState(() =>
    loadDriveRequests().filter((request) =>
      request.company === companyProfile.name && (request.adminStatus || "approved") === "approved"
    )
  );
  const requestsAwaitingAdminReview = loadDriveRequests().filter(
    (request) => request.company === companyProfile.name && request.adminStatus === "pending"
  ).length;
  const collegeConnections = new Set(
    driveRequests
      .filter((request) => request.status === "accepted")
      .map((request) => request.college)
  ).size;
  const deadlinesThisWeek = [...jobs, ...internships].filter((item) => {
    if (
      !item.expiryDate ||
      isOpportunityExpired(item) ||
      ["closed", "rejected"].includes(item.status?.toLowerCase())
    ) return false;
    const deadline = new Date(`${item.expiryDate}T00:00:00`);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysUntilDeadline = Math.round((deadline.getTime() - todayStart.getTime()) / 86_400_000);
    return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
  }).length;

  const [job, setJob] = useState({
    title: "",
    location: "",
    openings: "",
    type: "Full Time",
    expiryDate: getDefaultExpiryDate(),
    salary: "",
    description: "",
    eligibility: "",
    skills: ""
  });

  const [internship, setInternship] = useState({
    title: "",
    duration: "",
    mode: "Online",
    expiryDate: getDefaultExpiryDate(),
    location: companyProfile.location?.split(",")[0] || "Guntur",
    openings: "1",
    stipend: "",
    description: "",
    eligibility: "",
    skills: ""
  });

  const addJob = (e) => {
    e.preventDefault();

    const newOpportunity = {
      id: Date.now(),
      type: "Job",
      title: job.title,
      company: companyProfile.name,
      location: job.location,
      openings: Number(job.openings),
      expiryDate: job.expiryDate,
      salary: job.salary.trim(),
      description: job.description.trim(),
      eligibility: job.eligibility.trim(),
      skills: job.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      mode: job.type,
      verified: false,
      status: "pending"
    };

    saveOpportunities([...loadOpportunities(), newOpportunity]);
    setJobs((currentJobs) => [...currentJobs, {
      ...newOpportunity,
      type: newOpportunity.mode,
      status: "Under Review"
    }]);

    setJob({
      title: "",
      location: "",
      openings: "",
      type: "Full Time",
      expiryDate: getDefaultExpiryDate(),
      salary: "",
      description: "",
      eligibility: "",
      skills: ""
    });

    setShowJobForm(false);
    navigate("/company#job-vacancies", { replace: true });
  };

  const addInternship = (e) => {
    e.preventDefault();

    const newOpportunity = {
      id: Date.now(),
      type: "Internship",
      title: internship.title,
      company: companyProfile.name,
      location: internship.location.trim(),
      openings: Number(internship.openings),
      duration: internship.duration,
      expiryDate: internship.expiryDate,
      mode: internship.mode,
      stipend: internship.stipend.trim(),
      description: internship.description.trim(),
      eligibility: internship.eligibility.trim(),
      skills: internship.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      verified: false,
      status: "pending"
    };

    saveOpportunities([...loadOpportunities(), newOpportunity]);
    setInternships((currentInternships) => [...currentInternships, {
      ...newOpportunity,
      status: "Under Review"
    }]);

    setInternship({
      title: "",
      duration: "",
      mode: "Online",
      expiryDate: getDefaultExpiryDate(),
      location: companyProfile.location?.split(",")[0] || "Guntur",
      openings: "1",
      stipend: "",
      description: "",
      eligibility: "",
      skills: ""
    });

    setShowInternshipForm(false);
    navigate("/company#internships", { replace: true });
  };

  const refreshCompanyOpportunities = (updatedOpportunities) => {
    saveOpportunities(updatedOpportunities);
    setJobs(getCompanyItems("Job", companyProfile.name));
    setInternships(getCompanyItems("Internship", companyProfile.name));
  };

  const saveEditedOpportunity = (updatedOpportunity) => {
    const allOpportunities = loadOpportunities();
    const existingOpportunity = allOpportunities.find(
      (item) => item.id === updatedOpportunity.id && item.company === companyProfile.name
    );
    if (!existingOpportunity) {
      setOpportunityFeedback("This opportunity could not be found in your company listings. Refresh and try again.");
      setEditingOpportunity(null);
      return;
    }

    refreshCompanyOpportunities(allOpportunities.map((item) =>
      item.id === updatedOpportunity.id && item.company === companyProfile.name
        ? updatedOpportunity
        : item
    ));
    setEditingOpportunity(null);
    setOpportunityFeedback("Opportunity updated and submitted for verification.");
  };

  const openOpportunityEditor = (opportunityId) => {
    const opportunity = loadOpportunities().find(
      (item) => item.id === opportunityId && item.company === companyProfile.name
    );
    if (!opportunity) {
      setOpportunityFeedback("This opportunity could not be found in your company listings. Refresh and try again.");
      return;
    }
    setShowJobForm(false);
    setShowInternshipForm(false);
    setOpportunityFeedback("");
    setEditingOpportunity(opportunity);
  };

  const updateOpportunityStatus = (opportunityId, status) => {
    const allOpportunities = loadOpportunities();
    const existingOpportunity = allOpportunities.find(
      (item) => item.id === opportunityId && item.company === companyProfile.name
    );
    if (!existingOpportunity) {
      setOpportunityFeedback("This opportunity could not be found in your company listings. Refresh and try again.");
      return;
    }

    const updated = allOpportunities.map((item) =>
      item.id === opportunityId && item.company === companyProfile.name
        ? {
            ...item,
            status,
            verified: false,
            updatedAt: new Date().toISOString()
          }
        : item
    );
    refreshCompanyOpportunities(updated);
    setOpportunityFeedback(
      status === "closed"
        ? "Opportunity closed and removed from active college searches."
        : "Opportunity reopened and submitted for verification."
    );
  };

  const updateOpportunityDeadline = (opportunityId, expiryDate) => {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(expiryDate);
    const [year, month, day] = dateParts ? dateParts.slice(1).map(Number) : [];
    const deadline = dateParts ? new Date(year, month - 1, day) : null;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (
      !deadline ||
      deadline.getFullYear() !== year ||
      deadline.getMonth() !== month - 1 ||
      deadline.getDate() !== day ||
      deadline < todayStart
    ) {
      setOpportunityFeedback("Choose a valid deadline that is today or later.");
      return;
    }

    const allOpportunities = loadOpportunities();
    const existingOpportunity = allOpportunities.find(
      (item) => item.id === opportunityId && item.company === companyProfile.name
    );
    if (!existingOpportunity) {
      setOpportunityFeedback("This opportunity could not be found in your company listings. Refresh and try again.");
      return;
    }

    refreshCompanyOpportunities(allOpportunities.map((item) =>
      item.id === opportunityId && item.company === companyProfile.name
        ? { ...item, expiryDate }
        : item
    ));
    setOpportunityFeedback(`Application deadline updated for ${existingOpportunity.title}. Listing status was not changed.`);
  };

  const updateDriveRequest = (requestId, status) => {
    const updatedRequests = loadDriveRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    saveDriveRequests(updatedRequests);
    setDriveRequests(updatedRequests.filter((request) =>
      request.company === companyProfile.name && (request.adminStatus || "approved") === "approved"
    ));
  };

  const submitCollegeReport = (event) => {
    event.preventDefault();
    const organizationName = reportForm.organizationName.trim();
    const details = reportForm.details.trim();
    if (!organizationName || details.length < 10) {
      setReportFeedback("Select or enter a college and provide at least 10 characters describing the incident.");
      return;
    }
    const report = {
      id: Date.now(),
      accountType: "college",
      organizationName,
      reportedBy: companyProfile.name,
      reporterEmail: companyProfile.email,
      reason: reportForm.reason,
      details,
      status: "pending",
      reportedAt: new Date().toISOString()
    };
    const updatedReports = [...organizationReports, report];
    saveOrganizationReports(updatedReports);
    setOrganizationReports(updatedReports);
    setReportForm({ organizationName: "", reason: "Unprofessional conduct", details: "" });
    setReportFeedback("Report submitted to the admin team for review.");
  };

  const saveCompanyProfile = async (event) => {
    event.preventDefault();
    const updatedProfile = {
      ...companyProfile,
      email: companyProfileForm.email.trim(),
      location: companyProfileForm.location.trim(),
      industry: companyProfileForm.industry.trim(),
      phone: companyProfileForm.phone?.trim() ?? "",
      website: companyProfileForm.website?.trim() ?? "",
      verificationStatus: companyProfile.verificationStatus || "not_submitted"
    };
    try {
      await api.updateProfile("company", companyProfile.email, updatedProfile);
      localStorage.setItem("companyProfile", JSON.stringify(updatedProfile));
      setCompanyProfile(updatedProfile);
      setCompanyProfileForm(updatedProfile);
      setEditingCompanyProfile(false);
    } catch (error) {
      console.error("Unable to save the company profile.", error);
      setOpportunityFeedback(error.message);
    }
  };

  const submitVerificationApplication = (event) => {
    event.preventDefault();
    if (verificationForm.documents.length === 0) {
      setVerificationForm((current) => ({ ...current, error: "Attach at least one business registration document." }));
      return;
    }
    const application = {
      id: Date.now(),
      accountType: "company",
      organizationName: companyProfile.name,
      contactEmail: companyProfile.email,
      location: companyProfile.location,
      registrationNumber: verificationForm.registrationNumber.trim(),
      website: verificationForm.website.trim(),
      note: verificationForm.note.trim(),
      documents: verificationForm.documents,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    const updatedRequests = [...verificationRequests, application];
    const updatedProfile = { ...companyProfile, verificationStatus: "pending" };
    saveVerificationRequests(updatedRequests);
    localStorage.setItem("companyProfile", JSON.stringify(updatedProfile));
    setVerificationRequests(updatedRequests);
    setCompanyProfile(updatedProfile);
    setCompanyProfileForm(updatedProfile);
    setShowVerificationForm(false);
  };

  const addVerificationDocuments = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (verificationForm.documents.length + selectedFiles.length > MAX_VERIFICATION_DOCUMENTS) {
      setVerificationForm((current) => ({ ...current, error: `Attach up to ${MAX_VERIFICATION_DOCUMENTS} documents.` }));
      return;
    }
    if (selectedFiles.some((file) => !["application/pdf", "image/jpeg", "image/png"].includes(file.type))) {
      setVerificationForm((current) => ({ ...current, error: "Use PDF, JPG, or PNG documents." }));
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_VERIFICATION_DOCUMENT_SIZE)) {
      setVerificationForm((current) => ({ ...current, error: `Each document must be ${Math.round(MAX_VERIFICATION_DOCUMENT_SIZE / 1024)} KB or smaller.` }));
      return;
    }
    try {
      const documents = await Promise.all(selectedFiles.map(readVerificationDocument));
      setVerificationForm((current) => ({
        ...current,
        documents: [...current.documents, ...documents],
        error: ""
      }));
    } catch (error) {
      setVerificationForm((current) => ({ ...current, error: error.message }));
    }
  };

  const companyProfileCompletion = Math.round(
    [companyProfile.name, companyProfile.email, companyProfile.industry, companyProfile.location, companyProfile.phone, companyProfile.website]
      .filter((value) => value?.trim())
      .length / 6 * 100
  );
  const companyNotifications = [
    ...loadDriveRequests()
      .filter((request) => request.company === companyProfile.name)
      .map((request) => {
        const status = request.adminStatus === "pending"
          ? "awaiting admin review"
          : request.adminStatus === "rejected"
            ? "not approved by admin"
            : request.status === "accepted"
              ? "accepted"
              : request.status === "rejected"
                ? "declined"
                : "ready for your response";
        return {
          id: `drive-${request.id}`,
          title: `Drive request ${status}`,
          message: `${request.college} · ${request.date}`,
          tone: request.status === "rejected" || request.adminStatus === "rejected" ? "warning" : "info",
          to: "/company#drive-requests"
        };
      }),
    ...verificationRequests
      .filter((request) => request.accountType === "company" && request.organizationName === companyProfile.name)
      .map((request) => ({
        id: `verification-${request.id}`,
        title: `Company verification ${request.status === "approved" ? "approved" : request.status === "rejected" ? "not approved" : "under review"}`,
        message: request.registrationNumber,
        tone: request.status === "approved" ? "success" : request.status === "rejected" ? "warning" : "info",
        to: "/company#company-profile"
      })),
    ...loadOpportunities()
      .filter((item) => item.company === companyProfile.name && ["verified", "rejected"].includes(item.status))
      .map((item) => ({
        id: `opportunity-${item.id}`,
        title: `${item.title} ${item.status === "verified" ? "was verified" : "was rejected"}`,
        message: `${item.type} · ${item.location}`,
        tone: item.status === "verified" ? "success" : "warning",
        to: item.type === "Job" ? "/company#job-vacancies" : "/company#internships"
      }))
  ];

  return (
    <div className="company-dashboard">

      {/* Sidebar */}

      <aside className="company-sidebar">

        <div className="company-dashboard-logo">
          Campus<span>XCompany</span>
        </div>

        <nav className="company-sidebar-nav" aria-label="Company navigation">
          <p className="company-menu-title">MAIN MENU</p>

          <Link className={showingDashboard ? "company-active-menu" : ""} to="/company">
            Dashboard
          </Link>

          <Link className={showingJobs ? "company-active-menu" : ""} to="/company#job-vacancies">
            Job Vacancies
          </Link>

          <Link className={showingInternships ? "company-active-menu" : ""} to="/company#internships">
            Internships
          </Link>

          <Link className={showingDriveRequests ? "company-active-menu" : ""} to="/company#drive-requests">
            Drive Requests
          </Link>
          <Link className={showingCollegeReports ? "company-active-menu" : ""} to="/company#college-reports">
            Report a College
          </Link>

          <p className="company-menu-title">ACCOUNT</p>

          <Link className={showingProfile ? "company-active-menu" : ""} to="/company#company-profile">
            Company Profile
          </Link>

          <Link to="/">
            Logout
          </Link>
        </nav>

      </aside>

      {/* Main */}

      <main
        className={[
          "company-dashboard-main",
          showingProfile && "profile-only",
          showingDriveRequests && "drive-requests-only",
          showingCollegeReports && "college-reports-only",
          showingJobs && "jobs-only",
          showingInternships && "internships-only"
        ].filter(Boolean).join(" ")}
      >

        {/* Header */}

        <header className="company-header">

          <div>
            <p>EMPLOYER WORKSPACE</p>
            <h1>Welcome back 👋</h1>
          </div>

          <NotificationCenter notifications={companyNotifications} scope="company" />

          <div className="company-user">

            <div className="company-avatar">
              {companyProfile.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{companyProfile.name}</strong>
              <small>{verificationStatusLabel}</small>
            </div>

          </div>

        </header>

        <section className="company-welcome-panel" id="create-listing" aria-label="Company workspace shortcuts">
          <div>
            <p>HIRING WORKSPACE</p>
            <h2>Find the right talent for your next opportunity.</h2>
            <span>Create and manage job and internship listings for campus candidates.</span>
          </div>
          <div className="company-welcome-actions">
            <Link to="/company#post-job">Post a job <span aria-hidden="true">→</span></Link>
            <Link to="/company#post-internship">Post an internship</Link>
            <Link to="/company#job-vacancies">Manage listings</Link>
          </div>
        </section>

        {showPostedNotice && (
          <div className="opportunity-submission-notice" role="status">
            <div>
              <strong>Opportunity submitted</strong>
              <span>It is now waiting for verification.</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss submission message"
              onClick={() => setShowPostedNotice(false)}
            >
              ×
            </button>
          </div>
        )}

        {/* Company Profile */}

        <section className="company-profile-card" id="company-profile">

          <div className="company-profile-logo">
            {companyProfile.name.charAt(0).toUpperCase()}
          </div>

          <div className="company-profile-info">

            {editingCompanyProfile ? (
              <form className="company-profile-edit-form" onSubmit={saveCompanyProfile}>
                <div className="company-title-row">
                  <h2>{companyProfile.name}</h2>
                  <span className={`organization-verification-status verification-${verificationStatus}`}>
                    {verificationStatusLabel}
                  </span>
                </div>
                <label>
                  Contact email
                  <input
                    type="email"
                    value={companyProfileForm.email}
                    onChange={(event) => setCompanyProfileForm({ ...companyProfileForm, email: event.target.value })}
                    placeholder="contact@company.com"
                    required
                  />
                </label>
                <label>
                  Industry
                  <input
                    value={companyProfileForm.industry}
                    onChange={(event) => setCompanyProfileForm({ ...companyProfileForm, industry: event.target.value })}
                    placeholder="Industry"
                    required
                  />
                </label>
                <label>
                  Location
                  <input
                    value={companyProfileForm.location}
                    onChange={(event) => setCompanyProfileForm({ ...companyProfileForm, location: event.target.value })}
                    placeholder="City, State"
                    required
                  />
                </label>
                <label>
                  <span className="profile-field-label">Contact phone <span className="profile-field-optional">Optional</span></span>
                  <input
                    type="tel"
                    value={companyProfileForm.phone ?? ""}
                    onChange={(event) => setCompanyProfileForm({ ...companyProfileForm, phone: event.target.value })}
                    placeholder="Add a business contact number"
                  />
                </label>
                <label>
                  <span className="profile-field-label">Website <span className="profile-field-optional">Optional</span></span>
                  <input
                    type="url"
                    value={companyProfileForm.website ?? ""}
                    onChange={(event) => setCompanyProfileForm({ ...companyProfileForm, website: event.target.value })}
                    placeholder="https://company.com"
                  />
                </label>
                <div className="company-profile-form-actions">
                  <button className="company-profile-save" type="submit">Save profile</button>
                  {companyProfile.email && (
                    <button
                      className="company-profile-cancel"
                      type="button"
                      onClick={() => {
                        setCompanyProfileForm(companyProfile);
                        setEditingCompanyProfile(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <>
                <div className="company-profile-view-heading">
                  <div className="company-title-row">
                    <h2>{companyProfile.name}</h2>
                    <span className={`organization-verification-status verification-${verificationStatus}`}>
                      {verificationStatusLabel}
                    </span>
                  </div>
                  <button
                    className="company-profile-edit"
                    type="button"
                    onClick={() => setEditingCompanyProfile(true)}
                  >
                    Edit profile
                  </button>
                </div>
                <div className="company-profile-overview">
                  <p>{companyProfile.industry}</p>
                  <div className="profile-completion">
                    <div>
                      <span>Profile completeness</span>
                      <strong>{companyProfileCompletion}%</strong>
                    </div>
                    <progress max="100" value={companyProfileCompletion} aria-label="Company profile completeness" />
                  </div>
                </div>
                <div className="company-profile-meta">
                  <div><span>Contact email</span><strong>{companyProfile.email || "Not added"}</strong></div>
                  <div><span>Phone</span><strong>{companyProfile.phone || "Not added"}</strong></div>
                  <div><span>Location</span><strong>{companyProfile.location}</strong></div>
                  <div><span>Website</span><strong>{companyProfile.website || "Not added"}</strong></div>
                </div>
              </>
            )}

            <section className="organization-verification">
              <div className="organization-verification-heading">
                <div>
                  <p className="college-profile-eyebrow">TRUST & SAFETY</p>
                  <h3>Company verification</h3>
                </div>
                <span className={`organization-verification-status verification-${verificationStatus}`}>
                  {verificationStatusLabel}
                </span>
              </div>
              {verificationStatus === "approved" ? (
                <p>Your company has been verified as a genuine business.</p>
              ) : verificationStatus === "pending" ? (
                <p>Your application is with the CampusXCompany admin team for review.</p>
              ) : companyProfile.email ? (
                <>
                  <p>Submit your business registration details so an admin can verify your company.</p>
                  {showVerificationForm ? (
                    <form className="verification-application-form" onSubmit={submitVerificationApplication}>
                      <label>
                        Business registration number
                        <input
                          value={verificationForm.registrationNumber}
                          onChange={(event) => setVerificationForm({ ...verificationForm, registrationNumber: event.target.value })}
                          placeholder="Company or tax registration reference"
                          required
                        />
                      </label>
                      <label>
                        Official company website
                        <input
                          type="url"
                          value={verificationForm.website}
                          onChange={(event) => setVerificationForm({ ...verificationForm, website: event.target.value })}
                          placeholder="https://company.com"
                        />
                      </label>
                      <label className="verification-note-field">
                        Verification details
                        <textarea
                          value={verificationForm.note}
                          onChange={(event) => setVerificationForm({ ...verificationForm, note: event.target.value })}
                          placeholder="Include the registration authority and any relevant references"
                          rows="3"
                          required
                        />
                      </label>
                      <label className="verification-note-field">
                        Business registration documents
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png"
                          multiple
                          onChange={addVerificationDocuments}
                        />
                        <span className="verification-upload-guidance">PDF, JPG, or PNG. Up to 3 files, 300 KB each.</span>
                      </label>
                      {verificationForm.documents.length > 0 && (
                        <ul className="verification-document-list">
                          {verificationForm.documents.map((document, index) => (
                            <li key={`${document.name}-${index}`}>
                              <span>{document.name}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${document.name}`}
                                onClick={() => setVerificationForm((current) => ({
                                  ...current,
                                  documents: current.documents.filter((_, documentIndex) => documentIndex !== index),
                                  error: ""
                                }))}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {verificationForm.error && <p className="verification-form-error" role="alert">{verificationForm.error}</p>}
                      <div className="verification-application-actions">
                        <button className="company-profile-save" type="submit">Submit application</button>
                        <button className="company-profile-cancel" type="button" onClick={() => setShowVerificationForm(false)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button className="company-profile-edit" type="button" onClick={() => setShowVerificationForm(true)}>
                      {verificationStatus === "rejected" ? "Apply again" : "Apply for verification"}
                    </button>
                  )}
                </>
              ) : (
                <p>Save your company name and contact email before applying.</p>
              )}
            </section>

          </div>

        </section>

        {/* Statistics */}

        <section className="company-stats">

          <div className="company-stat-card">

            <span>Active Jobs</span>
            <strong>{jobs.filter((item) => item.verified && !isOpportunityExpired(item)).length}</strong>
            <small>Verified and live</small>

          </div>

          <div className="company-stat-card">

            <span>Live Internships</span>
            <strong>{internships.filter((item) => item.verified && !isOpportunityExpired(item)).length}</strong>
            <small>Verified and live</small>

          </div>

          <div className="company-stat-card">

            <span>College Connections</span>
            <strong>{collegeConnections}</strong>
            <small>Accepted drive requests</small>

          </div>

          <div className="company-stat-card">

            <span>Deadlines this week</span>
            <strong>{deadlinesThisWeek}</strong>
            <small>Listings closing in 7 days</small>

          </div>

        </section>

        <section className="company-opportunities-section" id="drive-requests">
          <div className="company-section-heading">
            <div>
              <h2>College Drive Requests</h2>
              <p>Review and respond to requests for campus recruitment drives.</p>
            </div>
            <span className="drive-request-count">
              {driveRequests.length} {driveRequests.length === 1 ? "request" : "requests"}
            </span>
          </div>

          <div className="company-drive-request-list">
            {driveRequests.length === 0 ? (
              <div className="drive-request-empty">
                <span className="drive-request-empty-mark" aria-hidden="true">↗</span>
                <div>
                  <h3>{requestsAwaitingAdminReview > 0 ? "Requests are under admin review" : "No approved drive requests yet"}</h3>
                  <p>
                    {requestsAwaitingAdminReview > 0
                      ? `${requestsAwaitingAdminReview} ${requestsAwaitingAdminReview === 1 ? "request is" : "requests are"} being reviewed before reaching your inbox.`
                      : "Drive requests appear here after a college submits one and an admin approves it."}
                  </p>
                </div>
              </div>
            ) : driveRequests.map((request) => (
              <article className="company-drive-request" key={request.id}>
                <div className="company-drive-request-details">
                  <div className="company-drive-request-heading">
                    <h3>{request.college}</h3>
                    <span className={`drive-request-status status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  <p>Preferred date: {request.date}</p>
                  <p>{request.students} expected students</p>
                  {request.message && <p className="drive-request-message">{request.message}</p>}
                  <DriveRequestTimeline adminStatus={request.adminStatus} companyStatus={request.status} />
                </div>
                {request.status === "pending" && (
                  <div className="drive-request-actions">
                    <button
                      className="accept-drive-request"
                      type="button"
                      onClick={() => updateDriveRequest(request.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-drive-request"
                      type="button"
                      onClick={() => updateDriveRequest(request.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="company-opportunities-section company-report-section" id="college-reports">
          <div className="company-section-heading">
            <div>
              <h2>Report a College</h2>
              <p>Report serious concerns about college conduct to the admin team.</p>
            </div>
            <span className="drive-request-count">{organizationReports.filter((report) => report.reporterEmail === companyProfile.email).length} submitted</span>
          </div>

          <form className="company-report-form" onSubmit={submitCollegeReport}>
            <label>
              College name
              <input
                list="company-report-colleges"
                value={reportForm.organizationName}
                onChange={(event) => setReportForm({ ...reportForm, organizationName: event.target.value })}
                placeholder="Select or enter the college name"
                required
              />
              <datalist id="company-report-colleges">
                {[...new Set(driveRequests.map((request) => request.college).filter(Boolean))].map((college) => (
                  <option key={college} value={college} />
                ))}
              </datalist>
            </label>
            <label>
              Reason
              <select
                value={reportForm.reason}
                onChange={(event) => setReportForm({ ...reportForm, reason: event.target.value })}
              >
                <option>Unprofessional conduct</option>
                <option>Harassment or discrimination</option>
                <option>Misleading recruitment activity</option>
                <option>Safety concern</option>
                <option>Other</option>
              </select>
            </label>
            <label className="company-report-wide-field">
              What happened?
              <textarea
                value={reportForm.details}
                onChange={(event) => setReportForm({ ...reportForm, details: event.target.value })}
                placeholder="Describe the incident factually, including relevant dates or drive details."
                minLength={10}
                rows={5}
                required
              />
            </label>
            <div className="company-report-actions">
              <button type="submit" className="accept-drive-request">Submit report</button>
              {reportFeedback && <span role="status">{reportFeedback}</span>}
            </div>
          </form>

          {organizationReports.filter((report) => report.reporterEmail === companyProfile.email).length > 0 && (
            <div className="company-report-history">
              <h3>Your submitted reports</h3>
              {organizationReports
                .filter((report) => report.reporterEmail === companyProfile.email)
                .map((report) => (
                  <article className="company-report-history-item" key={report.id}>
                    <div>
                      <strong>{report.organizationName}</strong>
                      <span>{report.reason}</span>
                    </div>
                    <span className={`drive-request-status status-${report.status}`}>{report.status}</span>
                  </article>
                ))}
            </div>
          )}
        </section>

        {/* Job Form */}

        {showJobForm && (

          <section className="company-form-card" id="company-job-form">

            <div className="form-header">

              <div>
                <h2>Post a Job</h2>
                <p>
                  Add a new job vacancy for colleges.
                </p>
              </div>

              <button
                className="close-form"
                type="button"
                onClick={() => navigate("/company#job-vacancies", { replace: true })}
              >
                ×
              </button>

            </div>

            <form onSubmit={addJob}>

              <div className="form-grid">

                <div>
                  <label htmlFor="company-job-title">Job Title</label>

                  <input
                    id="company-job-title"
                    type="text"
                    placeholder="Example: Frontend Developer"
                    value={job.title}
                    onChange={(e) =>
                      setJob({
                        ...job,
                        title: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-job-location">Location</label>

                  <input
                    id="company-job-location"
                    type="text"
                    placeholder="Example: Guntur"
                    value={job.location}
                    onChange={(e) =>
                      setJob({
                        ...job,
                        location: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-job-openings">Number of Openings</label>

                  <input
                    id="company-job-openings"
                    type="number"
                    placeholder="Example: 5"
                    min="1"
                    value={job.openings}
                    onChange={(e) =>
                      setJob({
                        ...job,
                        openings: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-job-type">Job Type</label>

                  <select
                    id="company-job-type"
                    value={job.type}
                    onChange={(e) =>
                      setJob({
                        ...job,
                        type: e.target.value
                      })
                    }
                  >
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="company-job-expiry">Apply By</label>
                  <input
                    id="company-job-expiry"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={job.expiryDate}
                    onChange={(e) => setJob({ ...job, expiryDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-job-salary">Salary</label>
                  <input
                    id="company-job-salary"
                    type="text"
                    placeholder="Example: ₹4 - ₹7 LPA"
                    value={job.salary}
                    onChange={(e) => setJob({ ...job, salary: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-job-skills">Skills (comma-separated)</label>
                  <input
                    id="company-job-skills"
                    type="text"
                    placeholder="Example: React, JavaScript, SQL"
                    value={job.skills}
                    onChange={(e) => setJob({ ...job, skills: e.target.value })}
                  />
                </div>

                <div className="company-form-wide-field">
                  <label htmlFor="company-job-eligibility">Eligibility</label>
                  <input
                    id="company-job-eligibility"
                    type="text"
                    placeholder="Example: Final-year CS students"
                    value={job.eligibility}
                    onChange={(e) => setJob({ ...job, eligibility: e.target.value })}
                  />
                </div>

                <div className="company-form-wide-field">
                  <label htmlFor="company-job-description">Role description</label>
                  <textarea
                    id="company-job-description"
                    rows="3"
                    maxLength="1200"
                    value={job.description}
                    onChange={(e) => setJob({ ...job, description: e.target.value })}
                    required
                  />
                </div>

              </div>

              <button
                className="submit-company-btn"
                type="submit"
              >
                Publish Job
              </button>

            </form>

          </section>

        )}

        {/* Internship Form */}

        {opportunityFeedback && (
          <div className="opportunity-submission-notice" role="status">
            <div><strong>Opportunity update</strong><span>{opportunityFeedback}</span></div>
            <button type="button" aria-label="Dismiss opportunity update" onClick={() => setOpportunityFeedback("")}>×</button>
          </div>
        )}

        {showInternshipForm && (

          <section className="company-form-card" id="company-internship-form">

            <div className="form-header">

              <div>
                <h2>Post an Internship</h2>

                <p>
                  Publish a genuine internship opportunity.
                </p>

              </div>

              <button
                className="close-form"
                type="button"
                onClick={() => navigate("/company#internships", { replace: true })}
              >
                ×
              </button>

            </div>

            <form onSubmit={addInternship}>

              <div className="form-grid">

                <div>
                  <label htmlFor="company-internship-title">Internship Title</label>

                  <input
                    id="company-internship-title"
                    type="text"
                    placeholder="Example: Web Development Intern"
                    value={internship.title}
                    onChange={(e) =>
                      setInternship({
                        ...internship,
                        title: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-internship-duration">Duration</label>

                  <select
                    id="company-internship-duration"
                    value={internship.duration}
                    onChange={(e) =>
                      setInternship({
                        ...internship,
                        duration: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">
                      Select Duration
                    </option>
                    <option>1 Month</option>
                    <option>2 Months</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="company-internship-mode">Work Mode</label>

                  <select
                    id="company-internship-mode"
                    value={internship.mode}
                    onChange={(e) =>
                      setInternship({
                        ...internship,
                        mode: e.target.value
                      })
                    }
                  >
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="company-internship-location">Location</label>
                  <input
                    id="company-internship-location"
                    type="text"
                    value={internship.location}
                    onChange={(e) => setInternship({ ...internship, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-internship-openings">Number of Openings</label>
                  <input
                    id="company-internship-openings"
                    type="number"
                    min="1"
                    step="1"
                    value={internship.openings}
                    onChange={(e) => setInternship({ ...internship, openings: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-internship-expiry">Apply By</label>
                  <input
                    id="company-internship-expiry"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={internship.expiryDate}
                    onChange={(e) => setInternship({ ...internship, expiryDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-internship-stipend">Stipend (optional)</label>
                  <input
                    id="company-internship-stipend"
                    type="text"
                    placeholder="Example: ₹10,000 per month"
                    value={internship.stipend}
                    onChange={(e) => setInternship({ ...internship, stipend: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="company-internship-skills">Skills (comma-separated)</label>
                  <input
                    id="company-internship-skills"
                    type="text"
                    placeholder="Example: Python, SQL, Excel"
                    value={internship.skills}
                    onChange={(e) => setInternship({ ...internship, skills: e.target.value })}
                  />
                </div>

                <div className="company-form-wide-field">
                  <label htmlFor="company-internship-eligibility">Eligibility</label>
                  <input
                    id="company-internship-eligibility"
                    type="text"
                    placeholder="Example: Students pursuing a data degree"
                    value={internship.eligibility}
                    onChange={(e) => setInternship({ ...internship, eligibility: e.target.value })}
                  />
                </div>

                <div className="company-form-wide-field">
                  <label htmlFor="company-internship-description">Internship description</label>
                  <textarea
                    id="company-internship-description"
                    rows="3"
                    maxLength="1200"
                    value={internship.description}
                    onChange={(e) => setInternship({ ...internship, description: e.target.value })}
                    required
                  />
                </div>

              </div>

              <div className="verification-note">

                ✓
                <span>
                  All internships submitted by companies
                  will go through verification before being
                  displayed as verified opportunities.
                </span>

              </div>

              <button
                className="submit-company-btn"
                type="submit"
              >
                Submit Internship
              </button>

            </form>

          </section>

        )}

        {/* Job Vacancies */}

        <section className="company-opportunities-section" id="job-vacancies">

          <div className="company-section-heading">

            <div>
              <h2>Job Vacancies</h2>

              <p>Modify job details, salary, requirements, and application deadlines.</p>
            </div>

            <button className="small-action-btn" type="button" onClick={openJobForm}>
              + Add Job
            </button>

          </div>

          {editingOpportunity?.type === "Job" && (
            <OpportunityEditor
              key={editingOpportunity.id}
              opportunity={editingOpportunity}
              onClose={() => setEditingOpportunity(null)}
              onSave={saveEditedOpportunity}
            />
          )}

          {jobs.length === 0 ? (
            <div className="company-listing-empty">
              <h3>No job vacancies yet</h3>
              <p>Create a job listing to start reaching campus candidates.</p>
              <button className="small-action-btn" type="button" onClick={openJobForm}>Post your first job</button>
            </div>
          ) : (
            <div className="company-table">
              <div className="company-table-header">
                <span>Position</span>
                <span>Location</span>
                <span>Openings</span>
                <span>Type</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {jobs.map((item) => (

                <div
                  className="company-table-row"
                  key={item.id}
                >

                  <strong>{item.title}</strong>

                  <span>📍 {item.location}</span>

                  <span>{item.openings}</span>

                  <span>{item.type}</span>

                  <span className="company-active-status">
                    {item.status}
                    <label className="company-deadline-control">
                      <span>Apply by</span>
                      <input
                        type="date"
                        aria-label={`Application deadline for ${item.title}`}
                        min={getTodayDateInputValue()}
                        value={item.expiryDate || ""}
                        onChange={(event) => updateOpportunityDeadline(item.id, event.target.value)}
                      />
                    </label>
                  </span>
                  <div className="company-opportunity-actions">
                    <button
                      type="button"
                      onClick={() => openOpportunityEditor(item.id)}
                    >
                      Modify job
                    </button>
                    {item.status === "Closed" ? (
                      <button type="button" onClick={() => updateOpportunityStatus(item.id, "pending")}>Reopen</button>
                    ) : item.status !== "Rejected" ? (
                      <button type="button" onClick={() => updateOpportunityStatus(item.id, "closed")}>Close</button>
                    ) : null}
                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

        {/* Internships */}

        <section className="company-opportunities-section" id="internships">

          <div className="company-section-heading">

            <div>

              <h2>Internships</h2>

              <p>
                Manage genuine internship opportunities.
              </p>

            </div>

            <button className="small-action-btn" type="button" onClick={openInternshipForm}>
              + Add Internship
            </button>

          </div>

          {editingOpportunity?.type === "Internship" && (
            <OpportunityEditor
              key={editingOpportunity.id}
              opportunity={editingOpportunity}
              onClose={() => setEditingOpportunity(null)}
              onSave={saveEditedOpportunity}
            />
          )}

          {internships.length === 0 ? (
            <div className="company-listing-empty">
              <h3>No internships yet</h3>
              <p>Create an internship listing to start reaching campus candidates.</p>
              <button className="small-action-btn" type="button" onClick={openInternshipForm}>Post your first internship</button>
            </div>
          ) : (
            <div className="company-table">
              <div className="company-table-header">
                <span>Internship</span>
                <span>Duration</span>
                <span>Mode</span>
                <span>Status</span>
                <span>Verification</span>
                <span>Actions</span>
              </div>

              {internships.map((item) => (

                <div
                  className="company-table-row"
                  key={item.id}
                >

                  <strong>{item.title}</strong>

                  <span>{item.duration}</span>

                  <span>{item.mode}</span>

                  <span className="company-active-status">
                    {isOpportunityExpired(item) ? "Expired" : item.verified ? "Active" : "Under Review"}
                    <label className="company-deadline-control">
                      <span>Apply by</span>
                      <input
                        type="date"
                        aria-label={`Application deadline for ${item.title}`}
                        min={getTodayDateInputValue()}
                        value={item.expiryDate || ""}
                        onChange={(event) => updateOpportunityDeadline(item.id, event.target.value)}
                      />
                    </label>
                  </span>

                  <span className="internship-verification">
                    {item.status}
                  </span>
                  <div className="company-opportunity-actions">
                    <button
                      type="button"
                      onClick={() => openOpportunityEditor(item.id)}
                    >
                      Modify internship
                    </button>
                    {item.status === "Closed" ? (
                      <button type="button" onClick={() => updateOpportunityStatus(item.id, "pending")}>Reopen</button>
                    ) : item.status !== "Rejected" ? (
                      <button type="button" onClick={() => updateOpportunityStatus(item.id, "closed")}>Close</button>
                    ) : null}
                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default CompanyDashboard;