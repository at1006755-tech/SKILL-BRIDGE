import { useState, useEffect } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setShowDashboard(true);
        setShowLogin(false);
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setShowDashboard(false);
      setShowLogin(false);
    } catch (err) {
      console.error("Logout error in App:", err);
    }
  };

  // Loading spinner while verifying auth persistence
  if (authChecking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "Inter, sans-serif",
          color: "#4f46e5",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>✦</div>
        <p style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>
          Initializing SkillBridge AI...
        </p>
      </div>
    );
  }

  // Dashboard View (Protected when user is authenticated or explicitly opened)
  if (showDashboard && currentUser) {
    return (
      <Dashboard
        onLogout={handleLogout}
      />
    );
  }

  // Login / Register View
  if (showLogin) {
    return (
      <Login
        onLoginSuccess={() => {
          setShowLogin(false);
          setShowDashboard(true);
        }}
        onBackToHome={() => setShowLogin(false)}
      />
    );
  }

  // Modern SaaS Landing Page
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "pointer" }}>
          <span className="logo-icon">✦</span>
          SkillBridge<span>AI</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>

          {currentUser ? (
            <button
              className="login-btn"
              onClick={() => setShowDashboard(true)}
            >
              Go to Dashboard →
            </button>
          ) : (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            ✨ AI-Powered Career Intelligence for College Students
          </div>

          <h1>
            Bridge Your Skills.
            <br />
            <span>Build Your Future.</span>
          </h1>

          <p>
            SkillBridge AI understands your college profile, identifies your career skill gaps,
            and creates an actionable personalized learning roadmap to guide you towards your dream placement.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => {
                if (currentUser) {
                  setShowDashboard(true);
                } else {
                  setShowLogin(true);
                }
              }}
            >
              {currentUser ? "Open Dashboard →" : "Get Started Free →"}
            </button>

            <button
              className="secondary-btn"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Features
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <small>Resume Analysis</small>
            </div>

            <div>
              <strong>7+</strong>
              <small>Career Paths</small>
            </div>

            <div>
              <strong>1:1</strong>
              <small>Personalized Roadmap</small>
            </div>
          </div>
        </div>

        {/* Dashboard Live Interactive Preview Card */}
        <div className="dashboard-preview">
          <div className="dashboard-header">
            <div>
              <small>TARGET CAREER JOURNEY</small>
              <h3>Software Developer</h3>
            </div>

            <div className="status">
              ● AI Analysis Active
            </div>
          </div>

          <div className="progress-area">
            <div className="progress-info">
              <span>Estimated Placement Readiness</span>
              <strong>74%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "74%" }}></div>
            </div>
          </div>

          <div className="skill-cards">
            <div className="skill-card completed">
              <span>✓</span>
              <div>
                <strong>Python & OOP</strong>
                <small>Completed</small>
              </div>
            </div>

            <div className="skill-card completed">
              <span>✓</span>
              <div>
                <strong>SQL Databases</strong>
                <small>Completed</small>
              </div>
            </div>

            <div className="skill-card learning">
              <span>◐</span>
              <div>
                <strong>React.js & APIs</strong>
                <small>In Progress</small>
              </div>
            </div>

            <div className="skill-card missing">
              <span>!</span>
              <div>
                <strong>DSA & Trees</strong>
                <small>Skill Gap (Prioritized)</small>
              </div>
            </div>
          </div>

          <div className="ai-message">
            <span>✦</span>
            <p>
              <strong>AI Recommendation</strong>
              <br />
              Strengthen Binary Trees & Graphs to clear technical screening rounds.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <div className="section-heading">
          <div className="badge">POWERED BY CAREER INTELLIGENCE</div>
          <h2>
            Everything You Need to
            <span> Accelerate Your Career</span>
          </h2>
          <p>
            From parsing your resume to tracking milestones and matching placement openings,
            SkillBridge AI is your all-in-one companion.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>AI Resume Analyzer</h3>
            <p>
              Upload your PDF resume to extract technical competencies, verify project portfolios,
              and receive a transparent quality assessment score.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧩</div>
            <h3>Smart Skill Gap Analysis</h3>
            <p>
              Compare your current profile directly against required skills for Software Developers,
              Web Developers, Data Scientists, and AI Engineers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Personalized Career Roadmap</h3>
            <p>
              Follow sequential, curated phases that prioritize your identified missing skills
              with practical tasks, objectives, and free resources.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Intelligent Job Matching</h3>
            <p>
              Discover campus openings and fresher internships with exact skill overlap percentages,
              highlighting what you already have and what to learn next.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Career Progress Tracking</h3>
            <p>
              Visualize your placement readiness, roadmap task completion, and weekly study consistency
              from a unified intelligence dashboard.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Actionable Recommendations</h3>
            <p>
              Receive contextual suggestions based on your target career role, academic year, and current skill gaps.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-heading">
          <div className="badge">SIMPLE 6-STEP PROCESS</div>
          <h2>
            From College Student to
            <span> Job Ready Engineer</span>
          </h2>
          <p>A proven roadmap engineered to turn academic knowledge into industry employability.</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Create Profile</h3>
            <p>Set your degree, academic year, target role, and current confirmed skills.</p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Upload Resume</h3>
            <p>Upload your PDF resume for instant parsing and transparent score breakdown.</p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Discover Gaps</h3>
            <p>View your completed, in-progress, and missing skills side-by-side.</p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Follow Roadmap</h3>
            <p>Check off milestone practical tasks tailored to your weakest areas.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="about" className="cta-section">
        <div className="cta-content">
          <div className="badge">YOUR CAREER ACCELERATOR</div>
          <h2>
            Don't Just Hope for Placements.
            <br />
            <span>Engineer Them.</span>
          </h2>
          <p>
            SkillBridge AI is designed for college students aiming for top technology placements.
            Analyze your resume, bridge your skill gaps, and land your dream job.
          </p>

          <button
            className="primary-btn"
            onClick={() => {
              if (currentUser) {
                setShowDashboard(true);
              } else {
                setShowLogin(true);
              }
            }}
          >
            {currentUser ? "Open Your Dashboard →" : "Start Your Free Journey →"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">
          <span className="logo-icon">✦</span>
          SkillBridge<span>AI</span>
        </div>

        <p>AI-Powered Career Intelligence for the Next Generation of Engineers.</p>

        <small>© 2026 SkillBridge AI. Built for SIH / College Innovation Demonstration.</small>
      </footer>
    </div>
  );
}

export default App;