function HomeScreen({ onLogin, onRegister, health, healthError }) {
  return (
    <div className="hero-card">
      <div className="hero-copy">
        <div className="logo-container">
          <img src="/careersasa-logo.png" alt="CareerSasa" className="logo" />
          <p className="logo-tagline">Discover Your Best Career Path</p>
        </div>
        <p className="hero-text">
          Register, unlock the assessment, complete the student profile, and receive career recommendations from the local backend.
        </p>
        <div className="hero-actions">
          <button className="primary-link button-reset" onClick={onRegister}>Create account</button>
          <button className="secondary-link button-reset" onClick={onLogin}>Log in</button>
        </div>
      </div>

      <aside className="status-panel">
        <div className="status-header">
          <h2>System health</h2>
          <span className={classNames("status-pill", health ? "status-connected" : "status-disconnected")}>
            {health ? "Backend ready" : "Backend unavailable"}
          </span>
        </div>
        <dl className="status-list">
          <div>
            <dt>API base URL</dt>
            <dd>{API_BASE_URL}</dd>
          </div>
          <div>
            <dt>Health timestamp</dt>
            <dd>{health?.time || "Not available yet"}</dd>
          </div>
          <div>
            <dt>Available flow</dt>
            <dd>Register, pay, assess, view results</dd>
          </div>
        </dl>
        {healthError ? <p className="status-note">{healthError}</p> : null}
      </aside>
    </div>
  );
}

