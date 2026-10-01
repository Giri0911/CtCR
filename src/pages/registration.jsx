import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("college");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [tier, setTier] = useState("Tier 2");
  const [geoLocation, setGeoLocation] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (role === "college") {
      localStorage.setItem("collegeProfile", JSON.stringify({
        name,
        email,
        location,
        tier,
        geoLocation
      }));
      navigate("/college");
    } else if (role === "company") {
      localStorage.setItem("companyProfile", JSON.stringify({
        name,
        email,
        location,
        industry: "Software & Technology"
      }));
      navigate("/company");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h1>CampusConnect</h1>
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
            placeholder="Create password"
            required
          />

          <button type="submit">
            Create Account
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;