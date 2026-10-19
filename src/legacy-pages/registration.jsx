 "use client";

import { useState } from "react";
import { Link, useNavigate } from "../next-router-compat.jsx";
import { api } from "../api/client.js";

function Register() {
  const [role, setRole] = useState("college");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [tier, setTier] = useState("Tier 2");
  const [geoLocation, setGeoLocation] = useState("");
  const navigate = useNavigate();

  const [registrationError, setRegistrationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistrationError("");
    setIsSubmitting(true);

    try {
      await api.register({
        accountType: role,
        organizationName: name,
        email,
        password: e.currentTarget.elements.password.value,
        location,
        collegeTier: role === "college" ? tier : null,
        geoLocation: role === "college" ? geoLocation : null,
        industry: role === "company" ? "Software & Technology" : null
      });
      localStorage.setItem(role === "college" ? "collegeProfile" : "companyProfile", JSON.stringify({
        name,
        email,
        location,
        ...(role === "college" ? { tier, geoLocation } : { industry: "Software & Technology" })
      }));
      navigate(role === "college" ? "/college" : "/company");
    } catch (error) {
      console.error("Unable to create account.", error);
      setRegistrationError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h1>CampusXCompany</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>

          <label>Register As</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="college">College</option>
            <option value="company">Company</option>
          </select>

          <label>Name</label>

          <input
            type="text"
            placeholder="College / Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Location</label>

          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          {role === "college" && (
            <>
              <label>College Tier</label>

              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3">Tier 3</option>
              </select>

              <label>Geo Location</label>

              <input
                type="text"
                placeholder="e.g. 16.3067° N, 80.4365° E"
                value={geoLocation}
                onChange={(e) => setGeoLocation(e.target.value)}
              />
            </>
          )}

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create password"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {registrationError && <p className="login-error" role="alert">{registrationError}</p>}
        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;