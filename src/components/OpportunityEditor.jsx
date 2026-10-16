 "use client";

import { useEffect, useState } from "react";

function getToday() {
  return new Date().toLocaleDateString("en-CA");
}

function OpportunityEditor({ opportunity, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    title: opportunity.title || "",
    location: opportunity.location || "",
    mode: opportunity.mode || "Full Time",
    openings: opportunity.openings || 1,
    salary: opportunity.salary || "",
    duration: opportunity.duration || "",
    description: opportunity.description || "",
    eligibility: opportunity.eligibility || "",
    skills: Array.isArray(opportunity.skills) ? opportunity.skills.join(", ") : "",
    expiryDate: opportunity.expiryDate || ""
  }));

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...opportunity,
      ...form,
      openings: Number(form.openings),
      skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      ...(opportunity.type === "Job" ? { salary: form.salary } : { duration: form.duration }),
      verified: false,
      status: "pending",
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <section className="company-form-card opportunity-editor" aria-labelledby="opportunity-editor-title">
      <header className="form-header opportunity-editor-heading">
        <div>
          <p>EDIT LISTING</p>
          <h2 id="opportunity-editor-title">
            {opportunity.type === "Job" ? "Modify job listing" : "Modify internship listing"}
          </h2>
          <p>Changes are sent for verification before going live.</p>
        </div>
        <button className="close-form" type="button" aria-label="Cancel editing" onClick={onClose}>×</button>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-grid opportunity-editor-grid">
          <div>
            <label htmlFor="edit-opportunity-title">Title</label>
            <input id="edit-opportunity-title" name="title" value={form.title} onChange={handleChange} maxLength="100" required />
          </div>

          <div>
            <label htmlFor="edit-opportunity-location">Location</label>
            <input id="edit-opportunity-location" name="location" value={form.location} onChange={handleChange} maxLength="100" required />
          </div>

          <div>
            <label htmlFor="edit-opportunity-mode">Work mode</label>
            <select id="edit-opportunity-mode" name="mode" value={form.mode} onChange={handleChange}>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Hybrid</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Remote</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-opportunity-openings">Openings</label>
            <input id="edit-opportunity-openings" name="openings" type="number" min="1" step="1" value={form.openings} onChange={handleChange} required />
          </div>

          {opportunity.type === "Job" ? (
            <div>
              <label htmlFor="edit-opportunity-salary">Salary</label>
              <input id="edit-opportunity-salary" name="salary" value={form.salary} onChange={handleChange} maxLength="80" required />
            </div>
          ) : (
            <div>
              <label htmlFor="edit-opportunity-duration">Duration</label>
              <input id="edit-opportunity-duration" name="duration" value={form.duration} onChange={handleChange} maxLength="80" required />
            </div>
          )}

          <div>
            <label htmlFor="edit-opportunity-expiry">Apply by</label>
            <input id="edit-opportunity-expiry" name="expiryDate" type="date" min={getToday()} value={form.expiryDate} onChange={handleChange} required />
          </div>

          <div className="company-form-wide-field">
            <label htmlFor="edit-opportunity-description">Description</label>
            <textarea id="edit-opportunity-description" name="description" value={form.description} onChange={handleChange} rows="4" maxLength="1200" />
          </div>

          <div>
            <label htmlFor="edit-opportunity-eligibility">Eligibility</label>
            <input id="edit-opportunity-eligibility" name="eligibility" value={form.eligibility} onChange={handleChange} maxLength="240" />
          </div>

          <div>
            <label htmlFor="edit-opportunity-skills">Skills (comma-separated)</label>
            <input id="edit-opportunity-skills" name="skills" value={form.skills} onChange={handleChange} maxLength="300" />
          </div>
        </div>

        <div className="opportunity-editor-actions">
          <button className="company-profile-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="submit-company-btn" type="submit">Save changes and submit for review</button>
        </div>
      </form>
    </section>
  );
}

export default OpportunityEditor;
