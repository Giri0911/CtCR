 "use client";

import { useState } from "react";
import { Link, useNavigate } from "../next-router-compat.jsx";

function findAccountWorkspace(email) {
  const accountEmail = email.trim().toLowerCase();
  const profiles = [
    { key: "collegeProfile", route: "/college" },
    { key: "companyProfile", route: "/company" }
  ];

  const matches = profiles.filter(({ key }) => {
    const savedProfile = localStorage.getItem(key);
    if (!savedProfile) return false;

    const profile = JSON.parse(savedProfile);
    return typeof profile.email === "string" &&
      profile.email.trim().toLowerCase() === accountEmail;
  });

  if (matches.length > 1) return "ambiguous";
  return matches[0]?.route || null;
}

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    try {
      const workspace = findAccountWorkspace(email);
      if (workspace === "ambiguous") {
        setLoginError("This email is linked to more than one account. Use an email unique to your account.");
        return;
      }

      if (!workspace) {
        setLoginError("No account matches this email. Create an account first, then sign in with its email.");
        return;
      }

      navigate(workspace);
    } catch (error) {
      console.error("Unable to look up the sign-in account.", error);
      setLoginError("We couldn't check this account. Please try again.");
    }
  };

  return (

    <main className="auth-page login-page">
      <div className="login-shell">
        <aside className="login-showcase">
          <Link className="login-brand" to="/" aria-label="CampusXCompany home">
            <span className="login-brand-mark" aria-hidden="true">C</span>
            <span>Campus<span>XCompany</span></span>
          </Link>

          <div className="login-showcase-copy">
            <p className="login-kicker">YOUR NEXT CHAPTER STARTS HERE</p>
            <h1>Bring campus talent and opportunity together.</h1>
            <p className="login-showcase-description">
              One connected space for colleges, employers, and the people building what comes next.
            </p>

            <div className="login-preview" aria-label="CampusXCompany platform highlights">
              <div className="login-preview-heading">
                <span className="login-preview-indicator" />
                <span>Campus network</span>
                <strong>Live</strong>
              </div>
              <div className="login-preview-stats">
                <div><strong>2.8k+</strong><span>Students matched</span></div>
                <div><strong>310</strong><span>Active employers</span></div>
              </div>
              <div className="login-preview-list">
                <span className="login-preview-icon">TN</span>
                <span><strong>TechNova Technologies</strong><small>Verified employer</small></span>
                <span className="login-preview-check" aria-label="Verified">✓</span>
              </div>
            </div>
          </div>

          <p className="login-showcase-footer">Made for better campus-to-career connections.</p>
        </aside>

        <section className="login-panel" aria-labelledby="login-heading">
          <Link className="login-home-link" to="/">← Back to home</Link>

          <div className="login-form-content">
            <p className="login-form-eyebrow">WELCOME BACK</p>
            <h2 id="login-heading">Sign in to your account</h2>
            <p className="login-form-intro">Sign in with the email you used to create your account.</p>

            <form className="login-form" onSubmit={handleLogin}>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@organization.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError("");
                }}
                required
              />

              <div className="login-password-heading">
                <label htmlFor="login-password">Password</label>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Sign in</button>
            </form>

            {loginError && <p className="login-error" role="alert">{loginError}</p>}

            <div className="login-demo-note">
              <span aria-hidden="true">i</span>
              <p>Your email selects the account workspace. Password verification will be added with authentication.</p>
            </div>

            <p className="login-signup-prompt">
              New to CampusXCompany? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>

  );
}

export default Login;