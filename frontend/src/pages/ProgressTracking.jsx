import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ProgressTracking.css";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ProgressTracking({ onBack, onNavigateRoadmap, onNavigateResume, onNavigateSkillGap }) {
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("Student");
  const [targetCareer, setTargetCareer] = useState("Software Developer");
  const [skills, setSkills] = useState([]);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [roadmapCompletedTasks, setRoadmapCompletedTasks] = useState([]);
  const [studyStreak, setStudyStreak] = useState([true, true, true, false, false, false, false]); // Mon-Sun
  const [savingStreak, setSavingStreak] = useState(false);

  // Load User Data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfileName(data.fullName || "Student");
          setTargetCareer(data.targetCareer || "Software Developer");
          setSkills(Array.isArray(data.skills) ? data.skills : []);
          setInProgressSkills(Array.isArray(data.inProgressSkills) ? data.inProgressSkills : []);
          setResumeAnalysis(data.resumeAnalysis || null);
          setRoadmapCompletedTasks(Array.isArray(data.roadmapCompletedTasks) ? data.roadmapCompletedTasks : []);
          if (Array.isArray(data.weeklyStudyDays)) {
            setStudyStreak(data.weeklyStudyDays);
          }
        }
      } catch (err) {
        console.error("Progress tracking data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Career Readiness Score Calculation
  const resumeScore = resumeAnalysis?.resume_score ?? 0;
  const careerReadiness = Math.min(
    100,
    Math.round((skills.length / 9) * 60 + (resumeScore / 100) * 40)
  );

  // Roadmap Progress
  const totalRoadmapMilestones = 20; // benchmark tasks
  const roadmapProgress = Math.min(
    100,
    Math.round((roadmapCompletedTasks.length / totalRoadmapMilestones) * 100)
  );

  // Toggle study day
  const handleToggleDay = async (index) => {
    const updated = [...studyStreak];
    updated[index] = !updated[index];
    setStudyStreak(updated);

    const user = auth.currentUser;
    if (user) {
      try {
        setSavingStreak(true);
        await setDoc(
          doc(db, "users", user.uid),
          {
            weeklyStudyDays: updated,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Streak save error:", err);
      } finally {
        setSavingStreak(false);
      }
    }
  };

  const activeDaysCount = studyStreak.filter(Boolean).length;

  return (
    <div className="progress-page">
      {/* Header */}
      <header className="progress-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              📊 Career Progress & Placement Analytics
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Comprehensive visual overview of your skills, resume improvement, roadmap milestones, and study cadence.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Placement Target:</span>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#4f46e5" }}>
              {targetCareer}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="progress-content">
        {/* Career Readiness Banner */}
        <section className="progress-hero-card">
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "1px", color: "#c7d2fe", fontWeight: "800", textTransform: "uppercase" }}>
              CAREER READINESS OVERVIEW
            </span>
            <h2>{profileName}'s Placement Readiness</h2>
            <p>
              Your estimated prototype career readiness stands at <strong>{careerReadiness}%</strong>.
              This metric dynamically combines your verified technical competencies (60% weight) and AI resume evaluation (40% weight).
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
              {onNavigateRoadmap && (
                <button
                  type="button"
                  onClick={onNavigateRoadmap}
                  style={{
                    padding: "9px 16px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Continue Roadmap Tasks →
                </button>
              )}
              {onNavigateResume && (
                <button
                  type="button"
                  onClick={onNavigateResume}
                  style={{
                    padding: "9px 16px",
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Update Resume Analysis
                </button>
              )}
            </div>
          </div>

          <div className="hero-gauge">
            <strong>{careerReadiness}%</strong>
            <span>Readiness</span>
          </div>
        </section>

        {/* 4 Key Metric Cards */}
        <div className="metrics-row">
          <div className="metric-pill">
            <div className="metric-pill-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              🎯
            </div>
            <div>
              <small>Verified Skills</small>
              <strong>{skills.length}</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-pill-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
              ◐
            </div>
            <div>
              <small>Skills in Progress</small>
              <strong>{inProgressSkills.length}</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-pill-icon" style={{ background: "#faf5ff", color: "#7c3aed" }}>
              🗺️
            </div>
            <div>
              <small>Roadmap Milestones</small>
              <strong>{roadmapCompletedTasks.length} Done</strong>
            </div>
          </div>

          <div className="metric-pill">
            <div className="metric-pill-icon" style={{ background: "#fff7ed", color: "#ea580c" }}>
              📄
            </div>
            <div>
              <small>Resume Score</small>
              <strong>{resumeScore}%</strong>
            </div>
          </div>
        </div>

        {/* Analytics 2-Column Grid */}
        <div className="analytics-grid">
          {/* Column 1: Skill Distribution & Roadmap Progress */}
          <div className="analytics-card">
            <h3>Technical Competency Breakdown</h3>
            <p>Visual breakdown of current progress across your target career expectations.</p>

            {/* Bar 1: Confirmed Skills */}
            <div className="chart-bar-group">
              <div className="chart-bar-label">
                <span style={{ color: "#059669" }}>✓ Confirmed Technical Skills</span>
                <strong>{skills.length} skills ({Math.min(100, Math.round((skills.length / 9) * 100))}%)</strong>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((skills.length / 9) * 100))}%`,
                    background: "linear-gradient(90deg, #10b981, #059669)",
                  }}
                />
              </div>
            </div>

            {/* Bar 2: Roadmap Tasks */}
            <div className="chart-bar-group">
              <div className="chart-bar-label">
                <span style={{ color: "#4f46e5" }}>🗺️ Roadmap Practical Tasks</span>
                <strong>{roadmapProgress}% Completed</strong>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${roadmapProgress}%`,
                    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                  }}
                />
              </div>
            </div>

            {/* Bar 3: Resume Keyword Strength */}
            <div className="chart-bar-group">
              <div className="chart-bar-label">
                <span style={{ color: "#d97706" }}>📄 Resume Quality Rating</span>
                <strong>{resumeScore}% Evaluated</strong>
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{
                    width: `${resumeScore}%`,
                    background: "linear-gradient(90deg, #f59e0b, #d97706)",
                  }}
                />
              </div>
            </div>

            {/* Active Skills Tag Cloud */}
            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                Active Verified Skills ({skills.length}):
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                {skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "4px 10px",
                      background: "#f1f5f9",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {s}
                  </span>
                ))}
                {skills.length === 0 && (
                  <small style={{ color: "#94a3b8" }}>No skills recorded yet. Complete your profile or analyze resume.</small>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Weekly Cadence Tracker & Milestones */}
          <div className="analytics-card">
            <h3>Weekly Learning Cadence</h3>
            <p>Click any day to log your preparation activity streak ({activeDaysCount}/7 active days):</p>

            {/* 7 Days of the Week */}
            <div className="weekly-days-grid">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div
                  key={day}
                  className={`day-box ${studyStreak[idx] ? "active" : ""}`}
                  onClick={() => handleToggleDay(idx)}
                  title="Click to toggle study activity"
                >
                  <small>{day}</small>
                  <strong>{studyStreak[idx] ? "✓" : "—"}</strong>
                </div>
              ))}
            </div>
            {savingStreak && (
              <small style={{ color: "#4f46e5", display: "block", marginTop: "8px" }}>
                Updating streak...
              </small>
            )}

            {/* Milestones Timeline */}
            <div style={{ marginTop: "28px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
                Preparation Milestones
              </h4>
              <div className="timeline">
                <div className="timeline-item">
                  <span className="timeline-icon">👤</span>
                  <div>
                    <strong>Profile Initialized</strong>
                    <small>Academic background & {targetCareer} goal set.</small>
                  </div>
                </div>

                <div className="timeline-item" style={{ borderLeftColor: resumeAnalysis ? "#10b981" : "#cbd5e1" }}>
                  <span className="timeline-icon">{resumeAnalysis ? "✓" : "⏳"}</span>
                  <div>
                    <strong>Resume Upload & Evaluation</strong>
                    <small>
                      {resumeAnalysis
                        ? `Evaluated: ${resumeAnalysis.resume_score}% quality score.`
                        : "Upload resume in Resume Analyzer."}
                    </small>
                  </div>
                </div>

                <div className="timeline-item" style={{ borderLeftColor: roadmapCompletedTasks.length > 0 ? "#10b981" : "#cbd5e1" }}>
                  <span className="timeline-icon">{roadmapCompletedTasks.length > 0 ? "✓" : "⏳"}</span>
                  <div>
                    <strong>Roadmap Execution</strong>
                    <small>
                      {roadmapCompletedTasks.length > 0
                        ? `${roadmapCompletedTasks.length} milestone tasks completed.`
                        : "Begin checking off tasks in Career Roadmap."}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProgressTracking;
