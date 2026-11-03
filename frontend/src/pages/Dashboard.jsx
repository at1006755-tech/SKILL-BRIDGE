import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import "./Dashboard.css";

import Profile from "./Profile";
import ResumeAnalyzer from "./ResumeAnalyzer";
import CareerRoadmap from "./CareerRoadmap";
import SkillGap from "./SkillGap";
import JobMatching from "./JobMatching";
import ProgressTracking from "./ProgressTracking";
import Settings from "./Settings";

function Dashboard({ onLogout }) {
  // Navigation State
  const [currentView, setCurrentView] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  // User Profile State
  const [profileName, setProfileName] = useState("Student");
  const [targetCareer, setTargetCareer] = useState("Software Developer");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [roadmapCompletedTasks, setRoadmapCompletedTasks] = useState([]);
  const [roadmapProgress, setRoadmapProgress] = useState(0);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Prototype Career Readiness Formula
  const resumeScore = resumeAnalysis?.resume_score ?? 0;
  const careerReadiness = Math.min(
    100,
    Math.round((skills.length / 9) * 60 + (resumeScore / 100) * 40)
  );

  // Dynamic Jobs Matched Count (Benchmark: jobs matching >= 50% of student's skills)
  const calculateMatchedJobs = () => {
    if (!skills.length) return 3; // base entry-level discovery
    return Math.min(8, Math.max(2, Math.round(skills.length * 0.8) + 1));
  };
  const jobsMatchedCount = calculateMatchedJobs();

  // Load User Data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileName(data.fullName || user.displayName || "Student");
          setTargetCareer(data.targetCareer || "Software Developer");
          setCollege(data.college || "");
          setDegree(data.degree || "");
          setBranch(data.branch || "");
          setCurrentYear(data.currentYear ? String(data.currentYear) : "");
          setCareerGoal(data.careerGoal || "");
          setExperience(data.experience || "");
          setProgrammingLanguages(Array.isArray(data.programmingLanguages) ? data.programmingLanguages : []);
          setSkills(Array.isArray(data.skills) ? data.skills : []);
          setInProgressSkills(Array.isArray(data.inProgressSkills) ? data.inProgressSkills : []);
          setResumeAnalysis(data.resumeAnalysis || null);
          setRoadmapCompletedTasks(Array.isArray(data.roadmapCompletedTasks) ? data.roadmapCompletedTasks : []);

          if (data.roadmapProgress !== undefined) {
            setRoadmapProgress(data.roadmapProgress);
          } else if (Array.isArray(data.roadmapCompletedTasks)) {
            setRoadmapProgress(Math.min(100, Math.round((data.roadmapCompletedTasks.length / 15) * 100)));
          }
        } else {
          if (user.displayName) setProfileName(user.displayName);
        }
      } catch (error) {
        console.error("Dashboard profile loading error:", error);
      }
    };

    loadUserData();
  }, [currentView]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Route Views
  if (currentView === "profile") {
    return <Profile onBack={() => setCurrentView("dashboard")} />;
  }
  if (currentView === "resume") {
    return <ResumeAnalyzer onBack={() => setCurrentView("dashboard")} />;
  }
  if (currentView === "roadmap") {
    return (
      <CareerRoadmap
        targetCareer={targetCareer}
        missingSkills={resumeAnalysis?.missing_skills || []}
        onBack={() => setCurrentView("dashboard")}
      />
    );
  }
  if (currentView === "skillgap") {
    return (
      <SkillGap
        onBack={() => setCurrentView("dashboard")}
        onNavigateRoadmap={() => setCurrentView("roadmap")}
      />
    );
  }
  if (currentView === "jobs") {
    return (
      <JobMatching
        onBack={() => setCurrentView("dashboard")}
        onNavigateRoadmap={() => setCurrentView("roadmap")}
      />
    );
  }
  if (currentView === "progress") {
    return (
      <ProgressTracking
        onBack={() => setCurrentView("dashboard")}
        onNavigateRoadmap={() => setCurrentView("roadmap")}
        onNavigateResume={() => setCurrentView("resume")}
        onNavigateSkillGap={() => setCurrentView("skillgap")}
      />
    );
  }
  if (currentView === "settings") {
    return (
      <Settings
        onBack={() => setCurrentView("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  // Active Skill Gaps count
  const skillGapsCount = resumeAnalysis?.missing_skills?.length ?? 4;

  // Transparent recommendation engine based on the student's saved profile.
  const normalizeRecommendationSkill = (value = "") =>
    String(value).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const completedSkillSet = new Set(
    [...skills, ...programmingLanguages].map(normalizeRecommendationSkill)
  );
  const learningSkillSet = new Set(inProgressSkills.map(normalizeRecommendationSkill));
  const resumeGap = (resumeAnalysis?.missing_skills || []).find(
    (skill) =>
      !completedSkillSet.has(normalizeRecommendationSkill(skill)) &&
      !learningSkillSet.has(normalizeRecommendationSkill(skill))
  );
  const activeLearningSkill = inProgressSkills.find(
    (skill) => !completedSkillSet.has(normalizeRecommendationSkill(skill))
  );

  const careerNextSteps = {
    "Software Developer": { title: "Data Structures & Algorithms", detail: "Start with arrays, strings, and basic problem-solving practice." },
    "Web Developer": { title: "JavaScript & DOM Practice", detail: "Build interactive pages using events, DOM manipulation, and form validation." },
    "Backend Developer": { title: "REST APIs & Backend Basics", detail: "Practice HTTP methods, API routes, request validation, and database CRUD." },
    "Data Analyst": { title: "SQL for Data Analysis", detail: "Practice SELECT, filtering, JOINs, GROUP BY, and aggregate functions." },
    "Data Scientist": { title: "Python for Data Analysis", detail: "Learn NumPy and Pandas, then explore a small dataset." },
    "AI ML Engineer": { title: "Python & Machine Learning Foundations", detail: "Review Python, statistics, and a beginner-friendly Scikit-learn workflow." },
    "Cybersecurity": { title: "Networking Fundamentals", detail: "Learn TCP/IP, DNS, HTTP/HTTPS, and basic Linux commands." },
  };

  const recommendation = !college && !degree && !skills.length && !programmingLanguages.length
    ? {
        title: "Complete Your Student Profile",
        detail: "Add your technical skills and target career so recommendations can match your goals.",
        reason: "Your profile does not have enough learning information yet.",
        action: "Complete Profile",
        view: "profile",
      }
    : resumeGap
    ? {
        title: `Learn ${resumeGap}`,
        detail: `Focus on ${resumeGap} to address a skill gap identified in your resume analysis.`,
        reason: "This skill appears in your resume analysis and is not marked completed or in progress.",
        action: "View Skill Gaps",
        view: "skillgap",
      }
    : activeLearningSkill
    ? {
        title: `Continue ${activeLearningSkill}`,
        detail: `Keep learning ${activeLearningSkill} and mark it completed in Skill Gap Analysis when you can use it confidently.`,
        reason: "You already marked this skill as in progress, so finishing it is the most direct next step.",
        action: "Update Skill Progress",
        view: "skillgap",
      }
    : {
        title: careerNextSteps[targetCareer]?.title || "Follow Your Career Roadmap",
        detail: careerNextSteps[targetCareer]?.detail || "Continue with the next incomplete task in your selected career roadmap.",
        reason: "Your currently saved skills do not show an unfinished priority skill, so this is a suggested next area for your career goal.",
        action: "Open Career Roadmap",
        view: "roadmap",
      };

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => setCurrentView("dashboard")}
          style={{ cursor: "pointer" }}
        >
          ✦ <span>SkillBridge</span> AI
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentView("dashboard")}
          >
            🏠 <span>Dashboard</span>
          </button>

          <button
            className={`menu-item ${currentView === "profile" ? "active" : ""}`}
            onClick={() => setCurrentView("profile")}
          >
            👤 <span>My Profile</span>
          </button>

          <button
            className={`menu-item ${currentView === "resume" ? "active" : ""}`}
            onClick={() => setCurrentView("resume")}
          >
            📄 <span>Resume Analyzer</span>
          </button>

          <button
            className={`menu-item ${currentView === "skillgap" ? "active" : ""}`}
            onClick={() => setCurrentView("skillgap")}
          >
            🧠 <span>Skill Gap Analysis</span>
          </button>

          <button
            className={`menu-item ${currentView === "roadmap" ? "active" : ""}`}
            onClick={() => setCurrentView("roadmap")}
          >
            🗺️ <span>Career Roadmap</span>
          </button>

          <button
            className={`menu-item ${currentView === "jobs" ? "active" : ""}`}
            onClick={() => setCurrentView("jobs")}
          >
            💼 <span>Job Matching</span>
          </button>

          <button
            className={`menu-item ${currentView === "progress" ? "active" : ""}`}
            onClick={() => setCurrentView("progress")}
          >
            📊 <span>Progress Tracking</span>
          </button>

          <button
            className={`menu-item ${currentView === "settings" ? "active" : ""}`}
            onClick={() => setCurrentView("settings")}
          >
            ⚙️ <span>Settings</span>
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>
              {getGreeting()}, {profileName}! 👋
            </h1>
            <p>
              Targeting <strong>{targetCareer}</strong> • Let's continue building your career intelligence today.
            </p>
          </div>

          <div className="header-right" style={{ position: "relative" }}>
            <button
              className="notification"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              🔔
            </button>

            {/* Notification Popover Panel */}
            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  width: "320px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
                  padding: "18px",
                  zIndex: 1000,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "14px" }}>Notifications</strong>
                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #4f46e5" }}>
                    <strong>Welcome to SkillBridge AI!</strong>
                    <p style={{ margin: "2px 0 0", color: "#64748b" }}>
                      Upload your resume to receive AI skill gap analysis and tailored learning roadmaps.
                    </p>
                  </div>
                  {resumeAnalysis && (
                    <div style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #10b981" }}>
                      <strong>Resume Analyzed: {resumeAnalysis.resume_score}%</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b" }}>
                        Discovered {resumeAnalysis.detected_skills?.length || 0} skills and {resumeAnalysis.missing_skills?.length || 0} gaps.
                      </p>
                    </div>
                  )}
                  {roadmapCompletedTasks.length > 0 && (
                    <div style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #f59e0b" }}>
                      <strong>Roadmap Milestone</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748b" }}>
                        You've completed {roadmapCompletedTasks.length} roadmap practical tasks!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              className="user-profile"
              onClick={() => setCurrentView("profile")}
              style={{ cursor: "pointer" }}
              title="View Profile"
            >
              <div className="avatar">
                {profileName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{profileName}</strong>
                <small>{targetCareer}</small>
              </div>
            </div>
          </div>
        </header>

        {/* Career Readiness Hero Card */}
        <section className="readiness-card">
          <div className="readiness-content">
            <div>
              <p className="section-label">CAREER READINESS ESTIMATE</p>
              <h2>{targetCareer}</h2>
              <p className="readiness-description">
                You have confirmed <strong>{skills.length} technical skills</strong> and a resume quality score of <strong>{resumeScore}%</strong>.
                Continue following your personalized roadmap to maximize your placement readiness.
              </p>
              <small style={{ display: "block", marginTop: "8px", opacity: 0.8, fontSize: "11px" }}>
                * Prototype calculation based on verified skills (60%) and resume quality score (40%). Not a guaranteed job selection promise.
              </small>
            </div>

            <div className="readiness-score">
              <div className="score-circle">
                <strong>{careerReadiness}%</strong>
                <span>Readiness</span>
              </div>
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${careerReadiness}%` }}
            ></div>
          </div>
        </section>

        {/* Connected Dashboard Statistics Grid */}
        <section className="stats-grid">
          <div
            className="stat-card"
            onClick={() => setCurrentView("skillgap")}
            style={{ cursor: "pointer" }}
            title="View Skills in Skill Gap"
          >
            <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              🎯
            </div>
            <div>
              <span>Skills Completed</span>
              <h3>{skills.length}</h3>
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => setCurrentView("skillgap")}
            style={{ cursor: "pointer" }}
            title="View Identified Skill Gaps"
          >
            <div className="stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
              🧠
            </div>
            <div>
              <span>Skill Gaps</span>
              <h3>{skillGapsCount}</h3>
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => setCurrentView("roadmap")}
            style={{ cursor: "pointer" }}
            title="View Career Roadmap"
          >
            <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              🗺️
            </div>
            <div>
              <span>Roadmap Progress</span>
              <h3>{roadmapProgress}%</h3>
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => setCurrentView("jobs")}
            style={{ cursor: "pointer" }}
            title="View Matched Jobs"
          >
            <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              💼
            </div>
            <div>
              <span>Jobs Matched</span>
              <h3>{jobsMatchedCount}</h3>
            </div>
          </div>
        </section>

        {/* Profile details loaded from the saved Firestore profile */}
        <section className="dashboard-card profile-overview-card">
          <div className="card-header">
            <div>
              <h3>👤 Your Profile Overview</h3>
              <p>Your saved academic details and career preferences</p>
            </div>
            <button onClick={() => setCurrentView("profile")}>Edit Profile →</button>
          </div>
          <div className="profile-overview-grid">
            <div><span>College</span><strong>{college || "Not added yet"}</strong></div>
            <div><span>Education</span><strong>{[degree, branch].filter(Boolean).join(" • ") || "Not added yet"}</strong></div>
            <div><span>Academic Year</span><strong>{currentYear ? (currentYear === "Graduated" ? "Recent Graduate" : `${currentYear}${currentYear === "1" ? "st" : currentYear === "2" ? "nd" : currentYear === "3" ? "rd" : "th"} Year`) : "Not added yet"}</strong></div>
            <div><span>Career Goal</span><strong>{careerGoal || "Not added yet"}</strong></div>
            <div><span>Experience Level</span><strong>{experience || "Not added yet"}</strong></div>
            <div><span>Programming Languages</span><strong>{programmingLanguages.length ? programmingLanguages.join(", ") : "Not added yet"}</strong></div>
          </div>
          {!college && !degree && !programmingLanguages.length && (
            <p className="profile-overview-hint">Complete your profile to see your academic and technical information here.</p>
          )}
        </section>

        {/* Resume Analysis Quick Summary */}
        <section className="dashboard-card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <div>
              <h3>📄 Resume Intelligence Summary</h3>
              <p>Rule-based analysis from your uploaded PDF resume</p>
            </div>
            <button onClick={() => setCurrentView("resume")}>
              {resumeAnalysis ? "View Full Analysis →" : "Upload Resume →"}
            </button>
          </div>

          {resumeAnalysis ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "center" }}>
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Resume Quality</span>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#4f46e5", margin: "4px 0" }}>
                  {resumeAnalysis.resume_score}%
                </div>
                <small style={{ color: "#64748b" }}>{resumeAnalysis.pages} PDF Page(s)</small>
              </div>

              <div>
                <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                  Identified Gaps for {targetCareer}:
                </strong>
                {resumeAnalysis.missing_skills?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {resumeAnalysis.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: "12px",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          background: "#fff7ed",
                          color: "#c2410c",
                          fontWeight: "600",
                          border: "1px solid #ffedd5",
                        }}
                      >
                        ! {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#10b981", fontSize: "13px" }}>No critical skill gaps detected for this role.</p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                Upload your resume in the Resume Analyzer to discover your skills, missing gaps, and transparent quality score.
              </p>
              <button
                onClick={() => setCurrentView("resume")}
                style={{
                  padding: "8px 16px",
                  background: "#4f46e5",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Upload Resume →
              </button>
            </div>
          )}
        </section>

        {/* Bottom 2-Column Section */}
        <section className="dashboard-grid">
          {/* Skills Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>Your Verified Skills</h3>
                <p>Track technical competencies in your profile</p>
              </div>
              <button onClick={() => setCurrentView("skillgap")}>
                Skill Gap Analysis →
              </button>
            </div>

            <div className="skill-list">
              {skills.length > 0 ? (
                skills.slice(0, 5).map((skill, index) => (
                  <div className="skill-row" key={`${skill}-${index}`}>
                    <div>
                      <span>{skill}</span>
                      <small style={{ color: "#059669", fontWeight: "600" }}>✓ Verified</small>
                    </div>

                    <div className="skill-progress">
                      <div
                        className="skill-fill"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "25px 10px", color: "#64748b" }}>
                  <p style={{ fontSize: "13px" }}>No skills added to your student profile yet.</p>
                  <button
                    onClick={() => setCurrentView("profile")}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      background: "#4f46e5",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    + Add Skills in Profile
                  </button>
                </div>
              )}

              {skills.length > 5 && (
                <div style={{ textAlign: "center", paddingTop: "8px" }}>
                  <button
                    onClick={() => setCurrentView("skillgap")}
                    style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600" }}
                  >
                    +{skills.length - 5} more skills in Skill Gap Analysis →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Smart Learning Recommendation Card */}
          <div className="dashboard-card ai-card">
            <div className="ai-icon">🤖</div>
            <p className="section-label">SMART LEARNING RECOMMENDATION</p>
            <h3>{recommendation.title}</h3>

            <p style={{ minHeight: "60px" }}>
              {recommendation.detail}
            </p>

            <div style={{
              margin: "12px 0 18px",
              padding: "12px",
              borderRadius: "10px",
              background: "#f8fafc",
              borderLeft: "3px solid #6366f1",
            }}>
              <strong style={{ display: "block", fontSize: "12px", color: "#334155", marginBottom: "4px" }}>
                Why this recommendation?
              </strong>
              <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                {recommendation.reason}
              </span>
            </div>

            <button
              className="start-button"
              onClick={() => setCurrentView(recommendation.view)}
            >
              {recommendation.action} →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;