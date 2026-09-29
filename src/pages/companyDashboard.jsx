import { useState } from "react";
import { Link } from "react-router-dom";
import { loadOpportunities, saveOpportunities } from "../Data/opportunities.js";

const companyName = "TechNova Technologies";

function getCompanyItems(type) {
  return loadOpportunities()
    .filter((item) => item.company === companyName && item.type === type)
    .map((item) => ({
      ...item,
      type: type === "Job" ? item.mode : item.type,
      status: item.status === "rejected"
        ? "Rejected"
        : item.verified
          ? "Verified"
          : "Under Review"
    }));
}

function CompanyDashboard() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);

  const [jobs, setJobs] = useState(() => getCompanyItems("Job"));
  const [internships, setInternships] = useState(() => getCompanyItems("Internship"));

  const [job, setJob] = useState({
    title: "",
    location: "",
    openings: "",
    type: "Full Time"
  });

  const [internship, setInternship] = useState({
    title: "",
    duration: "",
    mode: "Online"
  });

  const addJob = (e) => {
    e.preventDefault();

    const newOpportunity = {
      id: Date.now(),
      type: "Job",
      title: job.title,
      company: companyName,
      location: job.location,
      openings: Number(job.openings),
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
      type: "Full Time"
    });

    setShowJobForm(false);
  };

  const addInternship = (e) => {
    e.preventDefault();

    const newOpportunity = {
      id: Date.now(),
      type: "Internship",
      title: internship.title,
      company: companyName,
      location: "Guntur",
      openings: 1,
      duration: internship.duration,
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
      mode: "Online"
    });

    setShowInternshipForm(false);
  };

  return (
    <div className="company-dashboard">

      {/* Sidebar */}

      <aside className="company-sidebar">

        <div className="company-dashboard-logo">
          Campus<span>Connect</span>
        </div>

        <p className="company-menu-title">MAIN MENU</p>

        <Link className="company-active-menu" to="/company">
          Dashboard
        </Link>

        <Link to="#job-vacancies">
          Job Vacancies
        </Link>

        <Link to="#internships">
          Internships
        </Link>

        <Link to="/company/opportunities/new">
          Post an Opportunity
        </Link>

        <p className="company-menu-title">ACCOUNT</p>

        <Link to="#company-profile">
          Company Profile
        </Link>

        <Link to="/">
          Logout
        </Link>

      </aside>

      {/* Main */}

      <main className="company-dashboard-main">

        {/* Header */}

        <header className="company-header">

          <div>
            <p>Company Dashboard</p>
            <h1>Welcome back 👋</h1>
          </div>

          <div className="company-user">

            <div className="company-avatar">
              T
            </div>

            <div>
              <strong>TechNova Technologies</strong>
              <small>Verified Company</small>
            </div>

          </div>

        </header>

        {/* Company Profile */}

        <section className="company-profile-card" id="company-profile">

          <div className="company-profile-logo">
            T
          </div>

          <div className="company-profile-info">

            <div className="company-title-row">

              <h2>TechNova Technologies</h2>

              <span className="company-verified">
                ✓ Verified
              </span>

            </div>

            <p>
              Software & Technology
            </p>

            <small>
              📍 Guntur, Andhra Pradesh
            </small>

          </div>

        </section>

        {/* Statistics */}

        <section className="company-stats">

          <div className="company-stat-card">

            <span>Active Jobs</span>
            <strong>{jobs.length}</strong>
            <small>Currently hiring</small>

          </div>

          <div className="company-stat-card">

            <span>Internships</span>
            <strong>{internships.length}</strong>
            <small>Opportunities available</small>

          </div>

          <div className="company-stat-card">

            <span>College Connections</span>
            <strong>18</strong>
            <small>Connected colleges</small>

          </div>

          <div className="company-stat-card">

            <span>Applications</span>
            <strong>126</strong>
            <small>This month</small>

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
                  {item.verified ? "Active" : "Under Review"}
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