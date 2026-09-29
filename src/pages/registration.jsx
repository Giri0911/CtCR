import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("college");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (role === "college") {
      navigate("/college");
    } else if (role === "company") {
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
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter email"
            required
          />

          <label>Location</label>

          <input
            type="text"
            placeholder="Enter location"
            required
          />

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