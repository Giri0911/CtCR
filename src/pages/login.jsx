import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("college");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "college") {
      navigate("/college");
    } else if (role === "company") {
      navigate("/company");
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h1>CampusConnect</h1>
        <h2>Login</h2>
        <p>Login to your CampusConnect account</p>

        <form onSubmit={handleLogin}>

          <label>Select Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="college">College</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;