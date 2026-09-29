import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [role, setRole] = useState("college");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    if (role === "college") {
      navigate("/college");
    }

    if (role === "company") {
      navigate("/company");
    }

    if (role === "admin") {
      navigate("/admin");
    }

  };

  return (

    <div className="auth-page">

      <div className="auth-box">

        <h1>
          Campus<span>Connect</span>
        </h1>

        <h2>Welcome Back</h2>

        <p>
          Login to continue to your dashboard
        </p>

        {/* Role Selection */}

        <div className="role-selection">

          <button
            type="button"
            className={role === "college" ? "role-active" : ""}
            onClick={() => setRole("college")}
          >
            🏫 College
          </button>

          <button
            type="button"
            className={role === "company" ? "role-active" : ""}
            onClick={() => setRole("company")}
          >
            🏢 Company
          </button>

          <button
            type="button"
            className={role === "admin" ? "role-active" : ""}
            onClick={() => setRole("admin")}
          >
            ⚙️ Admin
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login as {role}
          </button>

        </form>

        <p className="login-note">
          Demo mode: any valid email and password will work.
        </p>

      </div>

    </div>

  );
}

export default Login;