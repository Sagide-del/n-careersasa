import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "careersasa_token";
const DRAFT_KEY = "careersasa_assessment_draft";

// Add this function right here
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"];
const subjectOptions = [
  "English",
  "Kiswahili",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "CRE",
  "Business Studies",
  "Agriculture",
  "Computer Studies",
  "Home Science",
  "Art & Design",
  "Music",
];
const interestOptions = [
  "Coding",
  "Design",
  "Music",
  "Sports",
  "Debate",
  "Reading",
  "Writing",
  "Business",
  "Farming",
  "Helping People",
  "Leadership",
  "Art",
  "Gaming",
  "Fixing Things",
  "Science Experiments",
  "Photography",
];
const platformOptions = ["TikTok", "Instagram", "YouTube", "WhatsApp", "Telegram", "LinkedIn", "Facebook"];
const purposeOptions = ["Learning", "Entertainment", "News", "Networking", "Business", "Messaging"];
const stepLabels = ["KCSE", "Interests", "Social", "Family", "Personality"];

function createEmptyAssessment() {
  return {
    kcse: {
      meanGrade: "",
      subjects: [
        { name: "English", grade: "" },
        { name: "Kiswahili", grade: "" },
        { name: "Mathematics", grade: "" },
      ],
    },
    interests: {
      hobbies: [],
    },
    social: {
      platforms: [{ name: "YouTube", hoursPerDay: 1, purpose: ["Learning"] }],
    },
    family: {
      birthOrder: "firstborn",
      guardianSupport: 3,
      notes: "",
    },
    briggs: {
      E: 50,
      I: 50,
      S: 50,
      N: 50,
      T: 50,
      F: 50,
      J: 50,
      P: 50,
      type: "ESTJ",
    },
  };
}

function loadToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function loadDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) {
    return createEmptyAssessment();
  }

  try {
    return JSON.parse(saved);
  } catch {
    return createEmptyAssessment();
  }
}

function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function buildSnapshotType(briggs) {
  const ei = briggs.E >= briggs.I ? "E" : "I";
  const sn = briggs.S >= briggs.N ? "S" : "N";
  const tf = briggs.T >= briggs.F ? "T" : "F";
  const jp = briggs.J >= briggs.P ? "J" : "P";
  return `${ei}${sn}${tf}${jp}`;
}

function Api({ token }) {
  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const error = new Error(body?.message || "Request failed.");
      error.status = response.status;
      throw error;
    }

    return body;
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  };
}

function StepPills({ currentStep }) {
  return (
    <div className="step-pills">
      {stepLabels.map((label, index) => (
        <div
          key={label}
          className={classNames("step-pill", index === currentStep && "step-pill-active")}
        >
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

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

function AuthScreen({ mode, onSubmit, onSwitch, error, loading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <section className="panel auth-panel">
      <div className="panel-heading">
        <p className="panel-kicker">{mode === "register" ? "New learner" : "Welcome back"}</p>
        <h2>{mode === "register" ? "Create your account" : "Log in to continue"}</h2>
      </div>

      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        {mode === "register" ? (
          <label className="field">
            <span>Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Amina Njeri"
              required
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="student@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </label>

        {error ? <p className="inline-error">{error}</p> : null}

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Working..." : mode === "register" ? "Create account" : "Log in"}
        </button>
      </form>

      <button className="text-button button-reset" onClick={onSwitch}>
        {mode === "register" ? "Already have an account? Log in" : "Need an account? Register"}
      </button>
    </section>
  );
}

function Dashboard({ profile, payment, onGoToPay, onStartAssessment, onViewResults, onLogout }) {
  return (
    <>
      <section className="hero-card dashboard-hero">
        <div className="hero-copy">
          <p className="eyebrow">Learner dashboard</p>
          <h1>Hello, {profile.name}</h1>
          <p className="hero-text">
            Your account is active. Follow the guided flow to unlock the assessment and generate your career report.
          </p>
          <div className="hero-actions">
            {!payment?.paid ? (
              <button className="primary-link button-reset" onClick={onGoToPay}>Pay and unlock</button>
            ) : (
              <button className="primary-link button-reset" onClick={onStartAssessment}>Continue assessment</button>
            )}
            {profile.lastResultId ? (
              <button className="secondary-link button-reset" onClick={onViewResults}>Open latest results</button>
            ) : null}
          </div>
        </div>

        <aside className="status-panel">
          <div className="status-header">
            <h2>Account snapshot</h2>
            <span className={classNames("status-pill", payment?.paid ? "status-connected" : "status-checking")}>
              {payment?.paid ? "Paid" : "Awaiting payment"}
            </span>
          </div>
          <dl className="status-list">
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Payment status</dt>
              <dd>{payment?.status || "unpaid"}</dd>
            </div>
            <div>
              <dt>Latest result</dt>
              <dd>{profile.lastResultId || "No report yet"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <p className="panel-kicker">Next actions</p>
            <h2>Complete the guided flow</h2>
          </div>
          <ol className="checklist">
            <li>Create or log in to your learner account.</li>
            <li>Verify payment to unlock the assessment.</li>
            <li>Complete all five assessment sections and submit.</li>
            <li>Review your top career pathways and next steps.</li>
          </ol>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="panel-kicker">Session</p>
            <h2>Manage your account</h2>
          </div>
          <p className="muted-copy">You can safely log out and return later. Your assessment draft stays saved in this browser.</p>
          <button className="secondary-button" onClick={onLogout}>Log out</button>
        </article>
      </section>
    </>
  );
}

function PaymentScreen({ onBack, onPaymentConfirmed, api, error }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendStkPush() {
    setLoading(true);
    setMessage("");
    try {
      const data = await api.post("/payments/mpesa/stkpush", { phone });
      setMessage(data.message);
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment() {
    setLoading(true);
    setMessage("");
    try {
      const data = await api.post("/payments/verify", {});
      setMessage(data.message);
      onPaymentConfirmed();
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel wide-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Payment</p>
        <h2>Unlock the full assessment</h2>
      </div>

      <div className="payment-grid">
        <div className="feature-card">
          <h3>Option A: STK Push</h3>
          <p>Enter your phone number and simulate the payment prompt.</p>
          <label className="field">
            <span>Phone number</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07XXXXXXXX" />
          </label>
          <button className="primary-button" disabled={loading || !phone} onClick={sendStkPush}>
            {loading ? "Sending..." : "Send STK Push"}
          </button>
        </div>

        <div className="feature-card">
          <h3>Option B: Verify payment</h3>
          <p>For this local system, verification marks the payment as complete and unlocks the assessment.</p>
          <button className="secondary-button" disabled={loading} onClick={verifyPayment}>Verify payment</button>
          <button className="text-button button-reset align-left" onClick={onBack}>Back to dashboard</button>
        </div>
      </div>

      {message ? <p className="status-note success-note">{message}</p> : null}
      {error ? <p className="inline-error">{error}</p> : null}
    </section>
  );
}

function AssessmentScreen({ assessment, setAssessment, onBack, onSubmit, submitting, error }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    saveDraft(assessment);
  }, [assessment]);

  function updateSubject(index, field, value) {
    const nextSubjects = assessment.kcse.subjects.map((subject, subjectIndex) =>
      subjectIndex === index ? { ...subject, [field]: value } : subject
    );
    setAssessment({ ...assessment, kcse: { ...assessment.kcse, subjects: nextSubjects } });
  }

  function toggleInterest(item) {
    const hobbies = assessment.interests.hobbies.includes(item)
      ? assessment.interests.hobbies.filter((entry) => entry !== item)
      : [...assessment.interests.hobbies, item];
    setAssessment({ ...assessment, interests: { hobbies } });
  }

  function updatePlatform(index, field, value) {
    const nextPlatforms = assessment.social.platforms.map((platform, platformIndex) =>
      platformIndex === index ? { ...platform, [field]: value } : platform
    );
    setAssessment({ ...assessment, social: { platforms: nextPlatforms } });
  }

  function togglePurpose(index, item) {
    const nextPlatforms = assessment.social.platforms.map((platform, platformIndex) => {
      if (platformIndex !== index) {
        return platform;
      }

      const purpose = platform.purpose.includes(item)
        ? platform.purpose.filter((entry) => entry !== item)
        : [...platform.purpose, item];
      return { ...platform, purpose };
    });

    setAssessment({ ...assessment, social: { platforms: nextPlatforms } });
  }

  function updateBriggs(pair, leftValue) {
    const value = Math.max(0, Math.min(100, Number(leftValue)));
    const next = { ...assessment.briggs };

    if (pair === "EI") {
      next.E = value;
      next.I = 100 - value;
    }
    if (pair === "SN") {
      next.S = value;
      next.N = 100 - value;
    }
    if (pair === "TF") {
      next.T = value;
      next.F = 100 - value;
    }
    if (pair === "JP") {
      next.J = value;
      next.P = 100 - value;
    }

    next.type = buildSnapshotType(next);
    setAssessment({ ...assessment, briggs: next });
  }

  const stepContent = [
    <div className="step-content" key="kcse">
      <label className="field">
        <span>KCSE mean grade</span>
        <select
          value={assessment.kcse.meanGrade}
          onChange={(event) => setAssessment({
            ...assessment,
            kcse: { ...assessment.kcse, meanGrade: event.target.value },
          })}
        >
          <option value="">Select mean grade</option>
          {gradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
        </select>
      </label>

      <div className="subsection">
        <div className="subsection-header">
          <h3>Subjects and grades</h3>
          <button
            className="text-button button-reset"
            onClick={() => setAssessment({
              ...assessment,
              kcse: {
                ...assessment.kcse,
                subjects: [...assessment.kcse.subjects, { name: "", grade: "" }],
              },
            })}
          >
            Add subject
          </button>
        </div>
        {assessment.kcse.subjects.map((subject, index) => (
          <div className="assessment-row" key={`${subject.name}-${index}`}>
            <select value={subject.name} onChange={(event) => updateSubject(index, "name", event.target.value)}>
              <option value="">Subject</option>
              {subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={subject.grade} onChange={(event) => updateSubject(index, "grade", event.target.value)}>
              <option value="">Grade</option>
              {gradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>,
    <div className="step-content" key="interests">
      <p className="muted-copy">Select the interests that feel most like you.</p>
      <div className="chip-grid">
        {interestOptions.map((item) => (
          <button
            key={item}
            className={classNames("choice-chip", assessment.interests.hobbies.includes(item) && "choice-chip-active")}
            onClick={() => toggleInterest(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>,
    <div className="step-content" key="social">
      <div className="subsection-header">
        <h3>Social and learning habits</h3>
        <button
          className="text-button button-reset"
          onClick={() => setAssessment({
            ...assessment,
            social: {
              platforms: [...assessment.social.platforms, { name: "TikTok", hoursPerDay: 1, purpose: [] }],
            },
          })}
        >
          Add platform
        </button>
      </div>
      {assessment.social.platforms.map((platform, index) => (
        <div className="social-card" key={`${platform.name}-${index}`}>
          <div className="assessment-row">
            <select value={platform.name} onChange={(event) => updatePlatform(index, "name", event.target.value)}>
              {platformOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <input
              type="number"
              min="0"
              max="24"
              value={platform.hoursPerDay}
              onChange={(event) => updatePlatform(index, "hoursPerDay", Number(event.target.value))}
              placeholder="Hours per day"
            />
          </div>
          <div className="chip-grid compact-grid">
            {purposeOptions.map((item) => (
              <button
                key={`${platform.name}-${item}`}
                className={classNames("choice-chip", platform.purpose.includes(item) && "choice-chip-active")}
                onClick={() => togglePurpose(index, item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>,
    <div className="step-content" key="family">
      <label className="field">
        <span>Birth order</span>
        <select
          value={assessment.family.birthOrder}
          onChange={(event) => setAssessment({
            ...assessment,
            family: { ...assessment.family, birthOrder: event.target.value },
          })}
        >
          <option value="firstborn">Firstborn</option>
          <option value="middle">Middle</option>
          <option value="lastborn">Lastborn</option>
          <option value="only">Only child</option>
        </select>
      </label>
      <label className="field">
        <span>Guardian support level: {assessment.family.guardianSupport}</span>
        <input
          type="range"
          min="1"
          max="5"
          value={assessment.family.guardianSupport}
          onChange={(event) => setAssessment({
            ...assessment,
            family: { ...assessment.family, guardianSupport: Number(event.target.value) },
          })}
        />
      </label>
      <label className="field">
        <span>Additional notes</span>
        <textarea
          rows="4"
          value={assessment.family.notes}
          onChange={(event) => setAssessment({
            ...assessment,
            family: { ...assessment.family, notes: event.target.value },
          })}
          placeholder="Financial realities, family expectations, or anything else that matters"
        />
      </label>
    </div>,
    <div className="step-content" key="personality">
      {[
        ["EI", "Extraversion vs Introversion", assessment.briggs.E],
        ["SN", "Sensing vs Intuition", assessment.briggs.S],
        ["TF", "Thinking vs Feeling", assessment.briggs.T],
        ["JP", "Judging vs Perceiving", assessment.briggs.J],
      ].map(([pair, label, value]) => (
        <label className="field" key={pair}>
          <span>{label}</span>
          <input type="range" min="0" max="100" value={value} onChange={(event) => updateBriggs(pair, event.target.value)} />
        </label>
      ))}
      <div className="type-card">
        <p className="panel-kicker">Snapshot type</p>
        <h3>{assessment.briggs.type}</h3>
      </div>
    </div>,
  ];

  return (
    <section className="panel wide-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Assessment</p>
        <h2>CareerSasa student profile</h2>
      </div>

      <StepPills currentStep={currentStep} />
      {stepContent[currentStep]}
      {error ? <p className="inline-error">{error}</p> : null}

      <div className="wizard-actions">
        <button className="secondary-button" onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)}>
          {currentStep === 0 ? "Back to dashboard" : "Previous"}
        </button>
        {currentStep < stepLabels.length - 1 ? (
          <button className="primary-button" onClick={() => setCurrentStep(currentStep + 1)}>Next</button>
        ) : (
          <button className="primary-button" disabled={submitting} onClick={() => onSubmit(assessment)}>
            {submitting ? "Submitting..." : "Submit assessment"}
          </button>
        )}
      </div>
    </section>
  );
}

function ResultsScreen({ result, onBack }) {
  return (
    <section className="panel wide-panel">
      <div className="panel-heading">
        <p className="panel-kicker">Career report</p>
        <h2>Your top career pathways</h2>
      </div>

      {result.student_summary ? (
        <div className="summary-grid">
          <div className="feature-card">
            <h3>Strengths</h3>
            <ul className="result-list">
              {result.student_summary.strengths.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="feature-card">
            <h3>Growth areas</h3>
            <ul className="result-list">
              {result.student_summary.growth_areas.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="results-stack">
        {(result.top_3_career_pathways || []).map((pathway) => (
          <article className="result-card" key={pathway.rank}>
            <div className="result-header">
              <div>
                <p className="panel-kicker">Rank {pathway.rank}</p>
                <h3>{pathway.pathway_name}</h3>
              </div>
              <span className="confidence-badge">{pathway.confidence}% fit</span>
            </div>
            <div className="result-columns">
              <div>
                <h4>Why it fits</h4>
                <ul className="result-list">
                  {pathway.why_fit.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4>Suggested programmes</h4>
                <ul className="result-list">
                  {pathway.suggested_programmes.map((programme) => (
                    <li key={programme.programme}>
                      <strong>{programme.programme}</strong>: {programme.kuccps_notes}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4>Next steps</h4>
              <ul className="result-list">
                {pathway.next_steps.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <button className="secondary-button" onClick={onBack}>Back to dashboard</button>
    </section>
  );
}

function App() {
  const [token, setToken] = useState(null);
  const [screen, setScreen] = useState("home");
  const [profile, setProfile] = useState(null);
  const [payment, setPayment] = useState(null);
  const [assessment, setAssessment] = useState(createEmptyAssessment());
  const [result, setResult] = useState(null);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(loadToken());
    setAssessment(loadDraft());
  }, []);

  const api = useMemo(() => Api({ token }), [token]);

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }
        const data = await response.json();
        setHealth(data);
        setHealthError("");
      } catch (requestError) {
        setHealth(null);
        setHealthError(requestError.message || "Unable to reach the backend.");
      }
    }

    checkHealth();
  }, []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setPayment(null);
      return;
    }

    async function hydrateSession() {
      try {
        const [profileData, paymentData] = await Promise.all([
          api.get("/auth/me"),
          api.get("/payments/me"),
        ]);
        setProfile(profileData.user);
        setPayment(paymentData);
        setScreen(profileData.user.lastResultId ? "dashboard" : paymentData.paid ? "assessment" : "dashboard");
      } catch {
        clearToken();
        setToken(null);
        setScreen("home");
      }
    }

    hydrateSession();
  }, [token, api]);

  async function handleRegister(form) {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      await handleLogin({ email: form.email, password: form.password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(form) {
    setLoading(true);
    setError("");
    try {
      const data = await Api({ token: null }).post("/auth/login", form);
      saveToken(data.token);
      setToken(data.token);
      setProfile(data.user);
      setScreen(data.user.paid ? "assessment" : "dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssessmentSubmit(assessmentData) {
    setLoading(true);
    setError("");
    try {
      const submission = await api.post("/assessment/submit", { student_profile: assessmentData });
      const nextResult = await api.get(`/results/${submission.resultId}`);
      clearDraft();
      setAssessment(createEmptyAssessment());
      setResult(nextResult);
      setProfile((current) => ({ ...current, lastResultId: submission.resultId }));
      setScreen("results");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLatestResults() {
    if (!profile?.lastResultId) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/results/${profile.lastResultId}`);
      setResult(data);
      setScreen("results");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    setToken(null);
    setProfile(null);
    setPayment(null);
    setResult(null);
    setScreen("home");
  }

  const topBanner = profile ? (
    <header className="app-topbar">
      <div>
        <p className="eyebrow">CareerSasa</p>
        <strong>{profile.name}</strong>
      </div>
      <button className="text-button button-reset" onClick={handleLogout}>Log out</button>
    </header>
  ) : null;

  return (
    <div className="app-shell">
      <div className="page-glow page-glow-left" />
      <div className="page-glow page-glow-right" />
      <main className="app-frame">
        {topBanner}

        {screen === "home" ? (
          <HomeScreen
            onLogin={() => { setError(""); setScreen("login"); }}
            onRegister={() => { setError(""); setScreen("register"); }}
            health={health}
            healthError={healthError}
          />
        ) : null}

        {screen === "register" ? (
          <AuthScreen
            mode="register"
            onSubmit={handleRegister}
            onSwitch={() => { setError(""); setScreen("login"); }}
            error={error}
            loading={loading}
          />
        ) : null}

        {screen === "login" ? (
          <AuthScreen
            mode="login"
            onSubmit={handleLogin}
            onSwitch={() => { setError(""); setScreen("register"); }}
            error={error}
            loading={loading}
          />
        ) : null}

        {screen === "dashboard" && profile ? (
          <Dashboard
            profile={profile}
            payment={payment}
            onGoToPay={() => setScreen("payment")}
            onStartAssessment={() => setScreen("assessment")}
            onViewResults={loadLatestResults}
            onLogout={handleLogout}
          />
        ) : null}

        {screen === "payment" ? (
          <PaymentScreen
            api={api}
            onBack={() => setScreen("dashboard")}
            onPaymentConfirmed={async () => {
              const paymentData = await api.get("/payments/me");
              const profileData = await api.get("/auth/me");
              setPayment(paymentData);
              setProfile(profileData.user);
              setScreen("assessment");
            }}
            error={error}
          />
        ) : null}

        {screen === "assessment" ? (
          <AssessmentScreen
            assessment={assessment}
            setAssessment={setAssessment}
            onBack={() => setScreen("dashboard")}
            onSubmit={handleAssessmentSubmit}
            submitting={loading}
            error={error}
          />
        ) : null}

        {screen === "results" && result ? (
          <ResultsScreen result={result} onBack={() => setScreen("dashboard")} />
        ) : null}
      </main>
    </div>
  );
}

export default App;


