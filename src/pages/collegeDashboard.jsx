import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";
import { loadDriveRequests, saveDriveRequests } from "../Data/driveRequests.js";
import { loadOpportunities } from "../Data/opportunities.js";
import { loadVerificationRequests, saveVerificationRequests } from "../Data/verificationRequests.js";
import { MAX_VERIFICATION_DOCUMENTS, MAX_VERIFICATION_DOCUMENT_SIZE, readVerificationDocument } from "../Data/verificationRequests.js";
import NotificationCenter from "../components/NotificationCenter.jsx";
import DriveRequestTimeline from "../components/DriveRequestTimeline.jsx";

const emptyCollegeProfile = {
  name: "",
  email: "",
  location: "",
  tier: "Tier 2",
  geoLocation: "",
  phone: "",
  website: ""
};

function loadCollegeProfile() {
  try {
    const savedProfile = localStorage.getItem("collegeProfile");
    return savedProfile ? { ...emptyCollegeProfile, ...JSON.parse(savedProfile) } : emptyCollegeProfile;
  } catch {
    return emptyCollegeProfile;
  }
}

function CollegeDashboard() {
  const location = useLocation();
  const showingProfile =
    location.hash === "#college-profile" || location.pathname === "/college/college-profile";
  const showingDriveRequests = location.hash === "#drive-requests";
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [type, setType] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [collegeName, setCollegeName] = useState(() => loadCollegeProfile().name);
  const [driveDate, setDriveDate] = useState("");
  const [expectedStudents, setExpectedStudents] = useState("");
  const [driveNote, setDriveNote] = useState("");
  const [driveRequests, setDriveRequests] = useState(loadDriveRequests);
  const [profile, setProfile] = useState(loadCollegeProfile);
  const [requestFeedback, setRequestFeedback] = useState("");

  useEffect(() => {
    setCollegeName(profile.name || "");
  }, [profile.name]);
  const [profileForm, setProfileForm] = useState(loadCollegeProfile);
  const [editingProfile, setEditingProfile] = useState(() => !loadCollegeProfile().name);
  const [verificationRequests, setVerificationRequests] = useState(loadVerificationRequests);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationForm, setVerificationForm] = useState({ registrationNumber: "", website: "", note: "", documents: [], error: "" });
  const latestVerificationRequest = [...verificationRequests]
    .filter((request) =>
      request.accountType === "college" &&
      request.organizationName === profile.name &&
      request.contactEmail?.toLowerCase() === profile.email.toLowerCase()
    )
    .sort((first, second) => second.submittedAt.localeCompare(first.submittedAt))[0];
  const verificationStatus = latestVerificationRequest?.status || profile.verificationStatus || "not_submitted";
  const opportunities = loadOpportunities();
  const verifiedOpportunities = opportunities.filter(
    (item) => item.verified && item.status !== "rejected"
  );

  const companies = [
    {
      name: "TechNova Technologies",
      industry: "Software",
      location: "Guntur",
      geoLocation: "16.3067° N, 80.4365° E",
      distance: "8 km",
      jobs: 5,
      internships: 2,
      tier: "Tier 1",
      verified: true
    },
    {
      name: "GreenGrid Solutions",
      industry: "Energy",
      location: "Vijayawada",
      geoLocation: "16.5062° N, 80.6480° E",
      distance: "12 km",
      jobs: 3,
      internships: 1,
      tier: "Tier 2",
      verified: true
    },
    {
      name: "FinEdge Services",
      industry: "Finance",
      location: "Guntur",
      geoLocation: "16.3067° N, 80.4365° E",
      distance: "18 km",
      jobs: 7,
      internships: 3,
      tier: "Tier 2",
      verified: true
    },
    {
      name: "CoreWorks Industries",
      industry: "Manufacturing",
      location: "Tenali",
      geoLocation: "16.2396° N, 80.6496° E",
      distance: "22 km",
      jobs: 2,
      internships: 1,
      tier: "Tier 3",
      verified: false
    }
  ];

  const selectedCompanyData = companies.find((company) => company.name === selectedCompany) || null;

  const companiesWithOpportunities = companies.map((company) => {
    const companyOpportunities = verifiedOpportunities.filter(
      (item) => item.company === company.name
    );
    return {
      ...company,
      jobs: companyOpportunities.filter((item) => item.type === "Job").length,
      internships: companyOpportunities.filter((item) => item.type === "Internship").length
    };
  });

  const latestOpportunities = [...verifiedOpportunities]
    .sort((first, second) => second.id - first.id)
    .slice(0, 3);
  const connectedCompanies = new Set(
    driveRequests
      .filter((request) => request.status === "accepted")
      .map((request) => request.company)
  ).size;

  const filteredCompanies = companiesWithOpportunities.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase());

    const matchesIndustry =
      industry === "All" || company.industry === industry;

    const matchesType =
      type === "All" ||
      (type === "Jobs" && company.jobs > 0) ||
      (type === "Internships" && company.internships > 0);

    return matchesSearch && matchesIndustry && matchesType;
  });

  const sendDriveRequest = (event) => {
    event.preventDefault();
    const request = {
      id: Date.now(),
      company: selectedCompany,
      college: collegeName.trim(),
      date: driveDate,
      students: Number(expectedStudents),
      message: driveNote.trim(),
      adminStatus: "pending",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    const updatedRequests = [...loadDriveRequests(), request];
    saveDriveRequests(updatedRequests);
    setDriveRequests(updatedRequests);
    setRequestFeedback(`Drive request sent to ${selectedCompany}.`);
    setSelectedCompany("");
    setCollegeName(profile.name || "");
    setDriveDate("");
    setExpectedStudents("");
    setDriveNote("");
  };

  const saveCollegeProfile = (event) => {
    event.preventDefault();
    const updatedProfile = {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      location: profileForm.location.trim(),
      tier: profileForm.tier || "Tier 2",
      geoLocation: profileForm.geoLocation?.trim() || "",
      phone: profileForm.phone.trim(),
      website: profileForm.website.trim(),
      verificationStatus: profile.verificationStatus || "not_submitted"
    };
    localStorage.setItem("collegeProfile", JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setProfileForm(updatedProfile);
    setCollegeName(updatedProfile.name || "");
    setEditingProfile(false);
  };

  const submitVerificationApplication = (event) => {
    event.preventDefault();
    if (verificationForm.documents.length === 0) {
      setVerificationForm((current) => ({ ...current, error: "Attach at least one accreditation document." }));
      return;
    }
    const application = {
      id: Date.now(),
      accountType: "college",
      organizationName: profile.name,
      contactEmail: profile.email,
      location: profile.location,
      registrationNumber: verificationForm.registrationNumber.trim(),
      website: verificationForm.website.trim(),
      note: verificationForm.note.trim(),
      documents: verificationForm.documents,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    const updatedRequests = [...verificationRequests, application];
    const updatedProfile = { ...profile, verificationStatus: "pending" };
    saveVerificationRequests(updatedRequests);
    localStorage.setItem("collegeProfile", JSON.stringify(updatedProfile));
    setVerificationRequests(updatedRequests);
    setProfile(updatedProfile);
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

  const verificationStatusLabel = {
    not_submitted: "Not verified",
    pending: "Under review",
    approved: "Verified",
    rejected: "Not verified"
  }[verificationStatus] || "Not verified";

  const notifications = [
    ...driveRequests.map((request) => {
      const status = request.adminStatus === "rejected"
        ? "rejected by admin"
        : request.adminStatus === "pending"
          ? "awaiting admin review"
          : request.status === "accepted"
            ? "accepted by the company"
            : request.status === "rejected"
              ? "declined by the company"
              : "sent to the company";
      return {
        id: `drive-${request.id}`,
        title: `Drive request ${status}`,
        message: `${request.company} · ${request.date}`,
        tone: request.adminStatus === "rejected" || request.status === "rejected" ? "warning" : "info",
        to: "/college#drive-requests"
      };
    }),
    ...verificationRequests
      .filter((request) => request.accountType === "college" && request.organizationName === profile.name)
      .map((request) => ({
        id: `verification-${request.id}`,
        title: `College verification ${request.status === "approved" ? "approved" : request.status === "rejected" ? "not approved" : "under review"}`,
        message: request.registrationNumber,
        tone: request.status === "approved" ? "success" : request.status === "rejected" ? "warning" : "info",
        to: "/college/college-profile"
      }))
  ];

  const collegeProfileCompletion = Math.round(
    [profile.name, profile.email, profile.location, profile.phone, profile.website]
      .filter((value) => value?.trim())
      .length / 5 * 100
  );

  return (
    <div className="college-dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="dashboard-logo">
          Campus<span>Connect</span>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <Link className={!showingProfile && !showingDriveRequests ? "active-menu" : ""} to="/college">
          Dashboard
        </Link>

        <Link to="/college/companies">
          Discover Companies
        </Link>

        <Link to="/opportunities?type=Job">
          Job Vacancies
        </Link>

        <Link to="/opportunities?type=Internship">
          Internships
        </Link>

        <Link className={showingDriveRequests ? "active-menu" : ""} to="/college#drive-requests">
          Drive Requests
        </Link>

        <p className="menu-title">ACCOUNT</p>

        <Link className={showingProfile ? "active-menu" : ""} to="/college/college-profile">
          College Profile
        </Link>

        <Link to="/">
          Logout
        </Link>

      </aside>

      {/* Main Content */}

      <main className={`dashboard-main${showingProfile ? " profile-only" : showingDriveRequests ? " drive-requests-only" : ""}`}>

        {/* Header */}

        <header className="dashboard-header">

          <div>
            <p className="welcome-text">College Dashboard</p>
            <h1>Good Morning 👋</h1>
          </div>

          <NotificationCenter notifications={notifications} />

          <div className="college-user">
            <div className="college-avatar">{(profile.name || "College Admin").charAt(0).toUpperCase()}</div>

            <div>
              <strong>{profile.name || "College Admin"}</strong>
              <small>Placement Officer</small>
            </div>
          </div>

        </header>

        <section className="college-profile-section" id="college-profile">
          <div className="college-profile-heading">
            <div>
              <p className="college-profile-eyebrow">ACCOUNT</p>
              <h2>College Profile</h2>
            </div>
            {!editingProfile && (
              <button
                className="college-profile-edit"
                type="button"
                onClick={() => setEditingProfile(true)}
              >
                Edit profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <form className="college-profile-form" onSubmit={saveCollegeProfile}>
              <label>
                College name
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                  placeholder="Enter your college name"
                  required
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                  placeholder="placement@college.edu"
                  required
                />
              </label>
              <label>
                Location
                <input
                  value={profileForm.location}
                  onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })}
                  placeholder="City, State"
                  required
                />
              </label>
              <label>
                College tier
                <select
                  value={profileForm.tier || "Tier 2"}
                  onChange={(event) => setProfileForm({ ...profileForm, tier: event.target.value })}
                >
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </label>
              <label>
                Geo location
                <input
                  value={profileForm.geoLocation ?? ""}
                  onChange={(event) => setProfileForm({ ...profileForm, geoLocation: event.target.value })}
                  placeholder="e.g. 16.3067° N, 80.4365° E"
                />
              </label>
              <label>
                <span className="profile-field-label">Contact phone <span className="profile-field-optional">Optional</span></span>
                <input
                  type="tel"
                  value={profileForm.phone ?? ""}
                  onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                  placeholder="Add a placement office number"
                />
              </label>
              <label>
                <span className="profile-field-label">Website <span className="profile-field-optional">Optional</span></span>
                <input
                  type="url"
                  value={profileForm.website ?? ""}
                  onChange={(event) => setProfileForm({ ...profileForm, website: event.target.value })}
                  placeholder="https://college.edu"
                />
              </label>
              <button className="college-profile-save" type="submit">
                Save profile
              </button>
            </form>
          ) : (
            <>
              <div className="college-profile-overview">
                <div className="college-profile-details">
                  <div className="college-profile-avatar">{profile.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <strong>{profile.name}</strong>
                    <span>College account</span>
                  </div>
                </div>
                <div className="profile-completion">
                  <div>
                    <span>Profile completeness</span>
                    <strong>{collegeProfileCompletion}%</strong>
                  </div>
                  <progress max="100" value={collegeProfileCompletion} aria-label="College profile completeness" />
                </div>
              </div>
              <div className="college-profile-meta">
                <div><span>Contact email</span><strong>{profile.email}</strong></div>
                <div><span>Phone</span><strong>{profile.phone || "Not added"}</strong></div>
                <div><span>Location</span><strong>{profile.location}</strong></div>
                <div><span>College tier</span><strong>{profile.tier || "Tier 2"}</strong></div>
                <div><span>Geo location</span><strong>{profile.geoLocation || "Not added"}</strong></div>
                <div><span>Website</span><strong>{profile.website || "Not added"}</strong></div>
              </div>
            </>
          )}

          <section className="organization-verification">
            <div className="organization-verification-heading">
              <div>
                <p className="college-profile-eyebrow">TRUST & SAFETY</p>
                <h3>College verification</h3>
              </div>
              <span className={`organization-verification-status verification-${verificationStatus}`}>
                {verificationStatusLabel}
              </span>
            </div>
            {verificationStatus === "approved" ? (
              <p>Your college has been verified as a genuine institution.</p>
            ) : verificationStatus === "pending" ? (
              <p>Your application is with the CampusConnect admin team for review.</p>
            ) : profile.name && profile.email ? (
              <>
                <p>Submit your accreditation details so an admin can confirm your institution.</p>
                {showVerificationForm ? (
                  <form className="verification-application-form" onSubmit={submitVerificationApplication}>
                    <label>
                      Registration or accreditation number
                      <input
                        value={verificationForm.registrationNumber}
                        onChange={(event) => setVerificationForm({ ...verificationForm, registrationNumber: event.target.value })}
                        placeholder="University, UGC, or AICTE reference"
                        required
                      />
                    </label>
                    <label>
                      Official college website
                      <input
                        type="url"
                        value={verificationForm.website}
                        onChange={(event) => setVerificationForm({ ...verificationForm, website: event.target.value })}
                        placeholder="https://college.edu"
                      />
                    </label>
                    <label className="verification-note-field">
                      Verification details
                      <textarea
                        value={verificationForm.note}
                        onChange={(event) => setVerificationForm({ ...verificationForm, note: event.target.value })}
                        placeholder="Include the accrediting body and any relevant references"
                        rows="3"
                        required
                      />
                    </label>
                    <label className="verification-note-field">
                      Accreditation documents
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
                      <button className="college-profile-save" type="submit">Submit application</button>
                      <button className="company-profile-cancel" type="button" onClick={() => setShowVerificationForm(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button className="college-profile-edit" type="button" onClick={() => setShowVerificationForm(true)}>
                    {verificationStatus === "rejected" ? "Apply again" : "Apply for verification"}
                  </button>
                )}
              </>
            ) : (
              <p>Save your college name and contact email before applying.</p>
            )}
          </section>
        </section>

        {/* Search */}

        <div className="dashboard-search">

          <div className="search-box">
            🔍

            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="All">All Industries</option>
            <option value="Software">Software</option>
            <option value="Energy">Energy</option>
            <option value="Finance">Finance</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Opportunities</option>
            <option value="Jobs">Jobs</option>
            <option value="Internships">Internships</option>
          </select>

        </div>

        {/* Statistics */}

        <section className="dashboard-stats">

          <div className="dashboard-stat">
            <div className="stat-symbol blue-symbol">⌖</div>

            <div>
              <span>Nearby Companies</span>
              <strong>{companies.length}</strong>
              <small>In the company directory</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol green-symbol">▣</div>

            <div>
              <span>Active Jobs</span>
              <strong>{verifiedOpportunities.filter((item) => item.type === "Job").length}</strong>
              <small>Verified opportunities</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol orange-symbol">✓</div>

            <div>
              <span>Verified Internships</span>
              <strong>{verifiedOpportunities.filter((item) => item.type === "Internship").length}</strong>
              <small>From verified companies</small>
            </div>
          </div>

          <div className="dashboard-stat">
            <div className="stat-symbol purple-symbol">↔</div>

            <div>
              <span>Connections</span>
              <strong>{connectedCompanies}</strong>
              <small>Accepted drive requests</small>
            </div>
          </div>

        </section>

        {/* Companies */}

        <section className="companies-section">

          <div className="section-top">

            <div>
              <h2>Companies Around You</h2>

              <p>
                Discover companies and their current opportunities
              </p>
            </div>

            <Link className="view-button" to="/college/companies">
              View All
            </Link>

          </div>

          <div className="company-grid">

            {filteredCompanies.map((company) => (

              <div className="company-card" key={company.name}>

                <div className="company-card-header">

                  <div className="company-logo">
                    {company.name.charAt(0)}
                  </div>

                  {company.verified && (
                    <span className="verified-badge">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <h3>{company.name}</h3>

                <p className="company-industry">
                  {company.industry}
                </p>

                <p className="company-location">
                  📍 {company.location} • {company.distance}
                </p>
                <div className="company-metadata">
                  <span className="company-tier">{company.tier}</span>
                  <span className="company-geo">Geo: {company.geoLocation}</span>
                </div>

                <div className="company-opportunities">

                  <div>
                    <strong>{company.jobs}</strong>
                    <span>Jobs</span>
                  </div>

                  <div>
                    <strong>{company.internships}</strong>
                    <span>Internships</span>
                  </div>

                </div>

                <div className="college-company-actions">
                  <Link className="company-button" to="/college/companies">
                    View Company
                  </Link>
                  <button
                    className="request-drive-button"
                    type="button"
                    onClick={() => {
                      const nextCollegeName = profile.name || collegeName || "";
                      setSelectedCompany(company.name);
                      setCollegeName(nextCollegeName);
                      window.setTimeout(() => {
                        document.getElementById("drive-requests")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start"
                        });
                      }, 50);
                    }}
                  >
                    Request Drive
                  </button>
                </div>

              </div>

            ))}

          </div>

          {filteredCompanies.length === 0 && (
            <div className="no-results">
              No companies found.
            </div>
          )}

        </section>

        <section className="drive-requests-section" id="drive-requests">
          <div className="section-top">
            <div>
              <h2>Drive Requests</h2>
              <p>Invite a company to host a recruitment drive at your college.</p>
            </div>
          </div>

          {requestFeedback && (
            <div className="drive-request-success" role="status">
              {requestFeedback}
            </div>
          )}

          {selectedCompany && (
            <form className="drive-request-form" onSubmit={sendDriveRequest}>
              <div className="drive-request-form-heading">
                <h3>
                  Request a drive with {selectedCompany}
                  {selectedCompanyData && (
                    <span className="company-request-summary"> · {selectedCompanyData.tier} · {selectedCompanyData.geoLocation}</span>
                  )}
                </h3>
                <button
                  className="close-form"
                  type="button"
                  aria-label="Close request form"
                  onClick={() => {
                    setSelectedCompany("");
                    setRequestFeedback("");
                  }}
                >
                  ×
                </button>
              </div>
              <div className="drive-request-fields">
                <label>
                  College name
                  <input
                    value={collegeName}
                    onChange={(event) => setCollegeName(event.target.value)}
                    placeholder="Enter your college name"
                    required
                  />
                </label>
                <label>
                  Preferred drive date
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={driveDate}
                    onChange={(event) => setDriveDate(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Expected students
                  <input
                    type="number"
                    min="1"
                    value={expectedStudents}
                    onChange={(event) => setExpectedStudents(event.target.value)}
                    placeholder="e.g. 120"
                    required
                  />
                </label>
                <label className="drive-request-note">
                  Note for the company
                  <textarea
                    value={driveNote}
                    onChange={(event) => setDriveNote(event.target.value)}
                    placeholder="Share roles, skills, or other details for the drive"
                    rows="3"
                  />
                </label>
              </div>
              <button className="request-drive-button" type="submit">
                Send request
              </button>
            </form>
          )}

          <div className="college-drive-request-list">
            {driveRequests.length === 0 ? (
              <p className="drive-request-empty">No drive requests sent yet.</p>
            ) : driveRequests.map((request) => (
              <article className="drive-request-row" key={request.id}>
                <div className="college-drive-request-info">
                  <strong>{request.company}</strong>
                  <span>{request.college} · {request.students} expected students</span>
                  <small>Preferred date: {request.date}</small>
                  {request.message && <small>{request.message}</small>}
                  <DriveRequestTimeline adminStatus={request.adminStatus} companyStatus={request.status} />
                </div>
                <span className={`drive-request-status status-${request.adminStatus === "rejected" ? "rejected" : request.adminStatus === "pending" ? "pending" : request.status}`}>
                  {request.adminStatus === "pending"
                    ? "Awaiting admin review"
                    : request.adminStatus === "rejected"
                      ? "Rejected by admin"
                      : request.status === "pending"
                        ? "Sent to company"
                        : request.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Opportunities */}

        <section className="recent-section">

          <div className="section-top">

            <div>
              <h2>Latest Opportunities</h2>

              <p>
                Recently added recruitment and internship opportunities
              </p>
            </div>

          </div>

          <div className="opportunity-table">
            <div className="table-header">
              <span>Opportunity</span>
              <span>Company</span>
              <span>Type</span>
              <span>Status</span>
            </div>

            {latestOpportunities.map((item) => (
              <div className="table-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.type === "Job" ? `${item.openings} openings` : item.duration}
                  </small>
                </div>
                <span>{item.company}</span>
                <span className={item.type === "Job" ? "job-label" : "internship-label"}>
                  {item.type}
                </span>
                <span className="active-label">Active</span>
              </div>
            ))}

            {latestOpportunities.length === 0 && (
              <div className="opportunities-empty">
                <h2>No verified opportunities yet</h2>
                <p>Verified jobs and internships will appear here.</p>
              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default CollegeDashboard;