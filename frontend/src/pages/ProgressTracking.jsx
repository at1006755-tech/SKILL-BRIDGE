import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ProgressTracking.css";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekDateKeys(referenceDate = new Date()) {
  const monday = new Date(referenceDate);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));

  return DAYS_OF_WEEK.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return formatLocalDate(date);
  });
}

function countCurrentStreak(log, today = new Date()) {
  const todayKey = formatLocalDate(today);
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  if (!log[todayKey]) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (log[formatLocalDate(cursor)]) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function formatWeekRange(dateKeys) {
  if (!dateKeys.length) return "";
  const options = { month: "short", day: "numeric" };
  const start = new Date(`${dateKeys[0]}T12:00:00`);
  const end = new Date(`${dateKeys[6]}T12:00:00`);
  return `${start.toLocaleDateString("en-IN", options)} – ${end.toLocaleDateString("en-IN", options)}`;
}

function ProgressTracking({ onBack, onNavigateRoadmap, onNavigateResume, onNavigateSkillGap }) {
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState("Student");
  const [targetCareer, setTargetCareer] = useState("Software Developer");
  const [skills, setSkills] = useState([]);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [roadmapCompletedTasks, setRoadmapCompletedTasks] = useState([]);
  const [savedRoadmapProgress, setSavedRoadmapProgress] = useState(null);
  const [studyLog, setStudyLog] = useState({});
  const [savingStreak, setSavingStreak] = useState(false);
  const [streakMessage, setStreakMessage] = useState("");

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
          const completedByCareer = data.roadmapCompletedTasksByCareer && typeof data.roadmapCompletedTasksByCareer === "object"
            ? data.roadmapCompletedTasksByCareer
            : {};
          const careerTasks = Array.isArray(completedByCareer[data.targetCareer || "Software Developer"])
            ? completedByCareer[data.targetCareer || "Software Developer"]
            : (Array.isArray(data.roadmapCompletedTasks) ? data.roadmapCompletedTasks : []);
          setRoadmapCompletedTasks(careerTasks);

          const progressByCareer = data.roadmapProgressByCareer && typeof data.roadmapProgressByCareer === "object"
            ? data.roadmapProgressByCareer
            : {};
          const careerProgress = progressByCareer[data.targetCareer || "Software Developer"];
          setSavedRoadmapProgress(typeof careerProgress === "number" ? careerProgress : null);

          if (data.weeklyStudyLog && typeof data.weeklyStudyLog === "object" && !Array.isArray(data.weeklyStudyLog)) {
            setStudyLog(data.weeklyStudyLog);
          } else if (Array.isArray(data.weeklyStudyDays)) {
            // Migrate the earlier Mon-Sun tracker format into dated entries for this week.
            const weekKeys = getCurrentWeekDateKeys();
            const migratedLog = {};
            weekKeys.forEach((dateKey, index) => {
              if (data.weeklyStudyDays[index]) migratedLog[dateKey] = true;
            });
            setStudyLog(migratedLog);
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
  const roadmapProgress = savedRoadmapProgress !== null
    ? Math.min(100, Math.max(0, savedRoadmapProgress))
    : Math.min(100, Math.round((roadmapCompletedTasks.length / totalRoadmapMilestones) * 100));

  const normalizedSkill = (value = "") => String(value).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const completedSkillKeys = new Set(skills.map(normalizedSkill));
  const inProgressUnique = inProgressSkills.filter((skill) => !completedSkillKeys.has(normalizedSkill(skill)));
  const inProgressKeys = new Set(inProgressUnique.map(normalizedSkill));
  const missingUnique = (resumeAnalysis?.missing_skills || []).filter(
    (skill) => !completedSkillKeys.has(normalizedSkill(skill)) && !inProgressKeys.has(normalizedSkill(skill))
  );
  const skillBreakdownTotal = skills.length + inProgressUnique.length + missingUnique.length;
  const skillBreakdownPercent = (count) => skillBreakdownTotal
    ? Math.round((count / skillBreakdownTotal) * 100)
    : 0;
  const currentWeekKeys = getCurrentWeekDateKeys();
  const currentWeekDays = currentWeekKeys.map((dateKey) => Boolean(studyLog[dateKey]));
  const activeDaysCount = currentWeekDays.filter(Boolean).length;
  const weeklyActivityPercent = Math.round((activeDaysCount / 7) * 100);
  const currentStreak = countCurrentStreak(studyLog);
  const weekRangeLabel = formatWeekRange(currentWeekKeys);

  // Save each study activity against its actual calendar date.
  const handleToggleDay = async (index) => {
    const user = auth.currentUser;
    if (!user || savingStreak) return;

    const dateKey = currentWeekKeys[index];
    const updatedLog = { ...studyLog };
    if (updatedLog[dateKey]) {
      delete updatedLog[dateKey];
    } else {
      updatedLog[dateKey] = true;
    }

    // Keep the last 90 days so the Firestore document does not grow indefinitely.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffKey = formatLocalDate(cutoff);
    const trimmedLog = Object.fromEntries(
      Object.entries(updatedLog).filter(([key]) => key >= cutoffKey)
    );

    setStudyLog(trimmedLog);
    setSavingStreak(true);
    setStreakMessage("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          weeklyStudyLog: trimmedLog,
          // Retain the old field for compatibility with earlier app versions.
          weeklyStudyDays: currentWeekKeys.map((key) => Boolean(trimmedLog[key])),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStreakMessage("Study activity saved successfully.");
    } catch (err) {
      console.error("Streak save error:", err);
      setStudyLog(studyLog);
      setStreakMessage("Could not save activity. Please check your connection and try again.");
    } finally {
      setSavingStreak(false);
    }
  };

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

        {/* Skill Status Breakdown */}
        <section className="analytics-card skill-breakdown-card">
          <h3>Skill Status Breakdown</h3>
          <p>Snapshot of skills identified from your profile and latest resume analysis.</p>

          {skillBreakdownTotal > 0 ? (
            <>
              <div className="skill-stack-track" role="img" aria-label={`${skills.length} completed, ${inProgressUnique.length} in progress, ${missingUnique.length} identified gaps`}>
                {skills.length > 0 && <div className="skill-stack-completed" style={{ width: `${skillBreakdownPercent(skills.length)}%` }} />}
                {inProgressUnique.length > 0 && <div className="skill-stack-progress" style={{ width: `${skillBreakdownPercent(inProgressUnique.length)}%` }} />}
                {missingUnique.length > 0 && <div className="skill-stack-gap" style={{ width: `${skillBreakdownPercent(missingUnique.length)}%` }} />}
              </div>
              <div className="skill-breakdown-legend">
                <span><i className="legend-dot completed" /> Completed <strong>{skills.length}</strong></span>
                <span><i className="legend-dot in-progress" /> In Progress <strong>{inProgressUnique.length}</strong></span>
                <span><i className="legend-dot gap" /> Resume Gaps <strong>{missingUnique.length}</strong></span>
              </div>
            </>
          ) : (
            <p className="skill-breakdown-empty">Add skills to your profile or analyze your resume to see your skill breakdown.</p>
          )}
        </section>

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
            <p>Log the days you studied this week. Your activity is saved by calendar date ({weekRangeLabel}).</p>

            {/* Weekly goal and current consecutive-day streak */}
            <div className="weekly-activity-summary">
              <div><strong>{activeDaysCount}/7</strong><span>study days logged this week</span></div>
              <div className="weekly-activity-track"><div style={{ width: `${weeklyActivityPercent}%` }} /></div>
              <small>{weeklyActivityPercent}% of your weekly goal</small>
              <div className="study-streak-note">🔥 Current study streak: <strong>{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong></div>
            </div>
            <div className="weekly-days-grid">
              {DAYS_OF_WEEK.map((day, idx) => (
                <button
                  type="button"
                  key={currentWeekKeys[idx]}
                  className={`day-box ${currentWeekDays[idx] ? "active" : ""}`}
                  onClick={() => handleToggleDay(idx)}
                  disabled={savingStreak || loading || !auth.currentUser}
                  aria-pressed={currentWeekDays[idx]}
                  title={`Toggle study activity for ${day}, ${currentWeekKeys[idx]}`}
                >
                  <small>{day}</small>
                  <strong>{currentWeekDays[idx] ? "✓" : "—"}</strong>
                  <span>{new Date(`${currentWeekKeys[idx]}T12:00:00`).getDate()}</span>
                </button>
              ))}
            </div>
            {savingStreak && (
              <small className="study-save-message" role="status">Saving study activity...</small>
            )}
            {!savingStreak && streakMessage && (
              <small className={`study-save-message ${streakMessage.startsWith("Could not") ? "error" : "success"}`} role="status">
                {streakMessage}
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
