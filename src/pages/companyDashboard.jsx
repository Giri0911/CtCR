import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isOpportunityExpired, loadOpportunities, saveOpportunities } from "../Data/opportunities.js";
import { loadDriveRequests, saveDriveRequests } from "../Data/driveRequests.js";
import { loadVerificationRequests, saveVerificationRequests } from "../Data/verificationRequests.js";
import { MAX_VERIFICATION_DOCUMENTS, MAX_VERIFICATION_DOCUMENT_SIZE, readVerificationDocument } from "../Data/verificationRequests.js";
import NotificationCenter from "../components/NotificationCenter.jsx";
import DriveRequestTimeline from "../components/DriveRequestTimeline.jsx";

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

function getCompanyItems(type, activeCompanyName) {
  return loadOpportunities()
    .filter((item) => item.company === activeCompanyName && item.type === type)
    .map((item) => ({
      ...item,
      type: type === "Job" ? item.mode : item.type,
      status: isOpportunityExpired(item)
        ? "Expired"
        : item.status === "rejected"
          ? "Rejected"
          : item.verified
            ? "Verified"
            : "Under Review"
    }));
}

function CompanyDashboard() {
  const location = useLocation();
  const showingProfile = location.hash === "#company-profile";
  const showingDriveRequests = location.hash === "#drive-requests";
  const [showPostedNotice, setShowPostedNotice] = useState(() =>
    Boolean(location.state?.opportunitySubmitted)
  );
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(loadCompanyProfile);
  const [companyProfileForm, setCompanyProfileForm] = useState(loadCompanyProfile);
  const [editingCompanyProfile, setEditingCompanyProfile] = useState(() => !loadCompanyProfile().email);
  const [verificationRequests, setVerificationRequests] = useState(loadVerificationRequests);
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
  const pendingOpportunities = [...jobs, ...internships].filter(
    (item) => !item.verified && item.status === "Under Review"
  ).length;

  const [job, setJob] = useState({
    title: "",
    location: "",
    openings: "",
    type: "Full Time",
    expiryDate: getDefaultExpiryDate()
  });

  const [internship, setInternship] = useState({
    title: "",
    duration: "",
    mode: "Online",
    expiryDate: getDefaultExpiryDate()
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
      expiryDate: getDefaultExpiryDate()
    });

    setShowJobForm(false);
  };

  const addInternship = (e) => {
    e.preventDefault();

    const newOpportunity = {
      id: Date.now(),
      type: "Internship",
      title: internship.title,
      company: companyProfile.name,
      location: "Guntur",
      openings: 1,
      duration: internship.duration,
      expiryDate: internship.expiryDate,
      mode: internship.mode,
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
      expiryDate: getDefaultExpiryDate()
    });

    setShowInternshipForm(false);
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

  const saveCompanyProfile = (event) => {
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
    localStorage.setItem("companyProfile", JSON.stringify(updatedProfile));
    setCompanyProfile(updatedProfile);
    setCompanyProfileForm(updatedProfile);
    setEditingCompanyProfile(false);
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
          Campus<span>Connect</span>
        </div>

        <p className="company-menu-title">MAIN MENU</p>

        <Link className={!showingProfile && !showingDriveRequests ? "company-active-menu" : ""} to="/company">
          Dashboard
        </Link>

        <Link to="#job-vacancies">
          Job Vacancies
        </Link>

        <Link to="#internships">
          Internships
        </Link>

        <Link className={showingDriveRequests ? "company-active-menu" : ""} to="#drive-requests">
          Drive Requests
        </Link>

        <Link to="/company/opportunities/new">
          Post an Opportunity
        </Link>

        <p className="company-menu-title">ACCOUNT</p>

        <Link className={showingProfile ? "company-active-menu" : ""} to="#company-profile">
          Company Profile
        </Link>

        <Link to="/">
          Logout
        </Link>

      </aside>

      {/* Main */}

      <main className={`company-dashboard-main${showingProfile ? " profile-only" : showingDriveRequests ? " drive-requests-only" : ""}`}>

        {/* Header */}

        <header className="company-header">

          <div>
            <p>Company Dashboard</p>
            <h1>Welcome back 👋</h1>
          </div>

          <NotificationCenter notifications={companyNotifications} />

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
                <p>Your application is with the CampusConnect admin team for review.</p>
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
            <strong>{jobs.filter((item) => item.verified).length}</strong>
            <small>Verified and live</small>

          </div>

          <div className="company-stat-card">

            <span>Live Internships</span>
            <strong>{internships.filter((item) => item.verified).length}</strong>
            <small>Verified and live</small>

          </div>

          <div className="company-stat-card">

            <span>College Connections</span>
            <strong>{collegeConnections}</strong>
            <small>Accepted drive requests</small>

          </div>

          <div className="company-stat-card">

            <span>Pending Review</span>
            <strong>{pendingOpportunities}</strong>
            <small>Jobs and internships</small>

          </div>

        </section>

        {/* Quick Actions */}

        <section className="company-actions">

          <div>

            <h2>Quick Actions</h2>

            <p>
              Publish opportunities for colleges to discover.
            </p>

          </div>

          <div className="company-action-buttons">

            <button
              className="post-job-btn"
              onClick={() => setShowJobForm(true)}
            >
              + Post Job
            </button>

            <button
              className="post-internship-btn"
              onClick={() => setShowInternshipForm(true)}
            >
              + Post Internship
            </button>

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
                  <h3>{requestsAwaitingAdminReview > 0 ? "Requests are under admin review" : "No drive requests yet"}</h3>
                  <p>
                    {requestsAwaitingAdminReview > 0
                      ? `${requestsAwaitingAdminReview} ${requestsAwaitingAdminReview === 1 ? "request is" : "requests are"} being reviewed before reaching your inbox.`
                      : "When a college invites you to host a campus drive, its request will appear here."}
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

        {/* Job Form */}

        {showJobForm && (

          <section className="company-form-card">

            <div className="form-header">

              <div>
                <h2>Post a Job</h2>
                <p>
                  Add a new job vacancy for colleges.
                </p>
              </div>

              <button
                className="close-form"
                onClick={() => setShowJobForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={addJob}>

              <div className="form-grid">

                <div>
                  <label>Job Title</label>

                  <input
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
                  <label>Location</label>

                  <input
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
                  <label>Number of Openings</label>

                  <input
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
                  <label>Job Type</label>

                  <select
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
                  <label>Apply By</label>
                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={job.expiryDate}
                    onChange={(e) => setJob({ ...job, expiryDate: e.target.value })}
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

        {showInternshipForm && (

          <section className="company-form-card">

            <div className="form-header">

              <div>
                <h2>Post an Internship</h2>

                <p>
                  Publish a genuine internship opportunity.
                </p>

              </div>

              <button
                className="close-form"
                onClick={() => setShowInternshipForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={addInternship}>

              <div className="form-grid">

                <div>
                  <label>Internship Title</label>

                  <input
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
                  <label>Duration</label>

                  <select
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
                  <label>Work Mode</label>

                  <select
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
                  <label>Apply By</label>
                  <input
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={internship.expiryDate}
                    onChange={(e) => setInternship({ ...internship, expiryDate: e.target.value })}
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

              <p>
                Manage your current recruitment opportunities.
              </p>
            </div>

            <button
              className="small-action-btn"
              onClick={() => setShowJobForm(true)}
            >
              + Add Job
            </button>

          </div>

          <div className="company-table">

            <div className="company-table-header">

              <span>Position</span>
              <span>Location</span>
              <span>Openings</span>
              <span>Type</span>
              <span>Status</span>

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
                  {item.expiryDate && <small className="company-opportunity-expiry">Apply by {item.expiryDate}</small>}
                </span>

              </div>

            ))}

          </div>

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

            <button
              className="small-action-btn"
              onClick={() => setShowInternshipForm(true)}
            >
              + Add Internship
            </button>

          </div>

          <div className="company-table">

            <div className="company-table-header">

              <span>Internship</span>
              <span>Duration</span>
              <span>Mode</span>
              <span>Status</span>
              <span>Verification</span>

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
                  {item.expiryDate && <small className="company-opportunity-expiry">Apply by {item.expiryDate}</small>}
                </span>

                <span className="internship-verification">
                  {item.status}
                </span>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default CompanyDashboard;