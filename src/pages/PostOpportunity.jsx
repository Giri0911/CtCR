import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOpportunities, saveOpportunities } from "../Data/opportunities.js";

function PostOpportunity() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "Job",
    title: "",
    company: "",
    location: "",
    mode: "Full Time",
    openings: "",
    salary: "",
    duration: ""
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

      verified: false,
      status: "pending",

      ...(form.type === "Job"
        ? { salary: form.salary }
        : { duration: form.duration })

    };

    saveOpportunities([...loadOpportunities(), newOpportunity]);

    alert(
      "Opportunity submitted successfully. It will appear as Under Review until verified."
    );

    navigate("/company");

  };

  return (

    <div className="post-opportunity-page">

      <div className="post-opportunity-box">

        <div className="post-opportunity-heading">

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

          <button type="submit">
            Submit Opportunity
          </button>

        </form>

      </div>

    </div>
  );
}

export default PostOpportunity;