import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadOpportunities, saveOpportunities } from "../Data/opportunities.js";

function getDefaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function loadCompanyProfile() {
  try {
    return JSON.parse(localStorage.getItem("companyProfile") || "{}");
  } catch {
    return {};
  }
}

function PostOpportunity() {

  const navigate = useNavigate();
  const companyProfile = loadCompanyProfile();

  const [form, setForm] = useState({
    type: "Job",
    title: "",
    company: companyProfile.name || "",
    location: companyProfile.location || "",
    mode: "Full Time",
    openings: "",
    salary: "",
    duration: "",
    description: "",
    eligibility: "",
    skills: "",
    expiryDate: getDefaultExpiryDate()
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const newOpportunity = {

      id: Date.now(),

      type: form.type,

      title: form.title,

      company: form.company,

      location: form.location,

      mode: form.mode,

      openings: Number(form.openings),
      description: form.description.trim(),
      eligibility: form.eligibility.trim(),
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      expiryDate: form.expiryDate,
      verified: false,
      status: "pending",

      ...(form.type === "Job"
        ? { salary: form.salary }
        : { duration: form.duration })

    };

    saveOpportunities([...loadOpportunities(), newOpportunity]);

    navigate("/company", { state: { opportunitySubmitted: true } });

  };

  return (

    <div className="post-opportunity-page">

      <div className="post-opportunity-box">

        <div className="post-opportunity-heading">

          <Link className="post-opportunity-back" to="/company">
            ← Company dashboard
          </Link>

          <p>
            COMPANY PORTAL
          </p>

          <h1>
            Post an Opportunity
          </h1>

          <span>
            Add a job vacancy or genuine internship opportunity.
          </span>

        </div>

        <form onSubmit={handleSubmit}>

          <label>
            Opportunity Type
          </label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Job">
              Job
            </option>

            <option value="Internship">
              Internship
            </option>
          </select>

          <label>
            Opportunity Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Example: Software Developer"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label>
            Company Name
          </label>

          <input
            type="text"
            name="company"
            placeholder="Company name"
            value={form.company}
            onChange={handleChange}
            readOnly={Boolean(companyProfile.name)}
            required
          />

          <label>
            Location
          </label>

          <input
            type="text"
            name="location"
            placeholder="Example: Guntur"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label htmlFor="opportunity-description">
            Opportunity Description
          </label>
          <textarea
            id="opportunity-description"
            name="description"
            placeholder="Describe the role, responsibilities, and what the candidate will work on."
            value={form.description}
            onChange={handleChange}
            rows="4"
            maxLength="1200"
            required
          />

          <label htmlFor="opportunity-eligibility">
            Eligibility
          </label>
          <input
            id="opportunity-eligibility"
            type="text"
            name="eligibility"
            placeholder="Example: Final-year CS students"
            value={form.eligibility}
            onChange={handleChange}
          />

          <label htmlFor="opportunity-skills">
            Skills <span>(separate with commas)</span>
          </label>
          <input
            id="opportunity-skills"
            type="text"
            name="skills"
            placeholder="Example: React, JavaScript, SQL"
            value={form.skills}
            onChange={handleChange}
          />

          <label>
            Work Mode
          </label>

          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
          >
            <option>
              Full Time
            </option>

            <option>
              Part Time
            </option>

            <option>
              Hybrid
            </option>

            <option>
              Online
            </option>

            <option>
              Offline
            </option>
          </select>

          <label>
            Number of Openings
          </label>

          <input
            type="number"
            name="openings"
            min="1"
            placeholder="Example: 5"
            value={form.openings}
            onChange={handleChange}
            required
          />

          {form.type === "Job" ? (

            <>
              <label>
                Salary
              </label>

              <input
                type="text"
                name="salary"
                placeholder="Example: ₹4 - ₹7 LPA"
                value={form.salary}
                onChange={handleChange}
                required
              />
            </>

          ) : (

            <>
              <label>
                Internship Duration
              </label>

              <input
                type="text"
                name="duration"
                placeholder="Example: 3 Months"
                value={form.duration}
                onChange={handleChange}
                required
              />
            </>

          )}

          <label htmlFor="opportunity-expiry">
            Apply By
          </label>
          <input
            id="opportunity-expiry"
            type="date"
            name="expiryDate"
            min={new Date().toLocaleDateString("en-CA")}
            value={form.expiryDate}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Submit Opportunity
          </button>

        </form>

      </div>

    </div>
  );
}

export default PostOpportunity;