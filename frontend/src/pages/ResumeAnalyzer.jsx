import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer({ onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [targetCareer, setTargetCareer] = useState("Software Developer");
  const [userProfile, setUserProfile] = useState(null);
  const [syncingSkills, setSyncingSkills] = useState(false);

  // Load user profile & any previous resume analysis
  useEffect(() => {
    const fetchExistingAnalysis = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data);
          if (data.targetCareer) {
            setTargetCareer(data.targetCareer);
          }
          if (data.resumeAnalysis) {
            setResult({
              ...data.resumeAnalysis,
              fromCache: true,
            });
          }
        }
      } catch (err) {
        console.warn("Could not load cached analysis:", err);
      }
    };

    fetchExistingAnalysis();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum supported resume size is 10 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select your resume PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("target_career", targetCareer);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Resume analysis failed on server.");
      }

      setResult(data);
      setSuccessMsg("Resume analyzed successfully!");

      // Save analysis to Firestore
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            {
              resumeAnalysis: {
                resume_score: data.resume_score,
                pages: data.pages,
                target_career: data.target_career || targetCareer,
                detected_skills: data.detected_skills || [],
                missing_skills: data.missing_skills || [],
                recommendations: data.recommendations || [],
                structured_recommendations: data.structured_recommendations || [],
                score_breakdown: data.score_breakdown || null,
                analyzedAt: serverTimestamp(),
              },
            },
            { merge: true }
          );
        } catch (dbErr) {
          console.error("Firestore resume save error:", dbErr);
          // Do not fail the UI if Firestore save had an issue
        }
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      setError(
        err.message?.includes("Failed to fetch")
          ? "Unable to connect to the SkillBridge AI backend. Please make sure the Python FastAPI backend is running on port 8000."
          : err.message || "Something went wrong while analyzing your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // Sync detected skills with Student Profile
  const handleSyncSkills = async () => {
    if (!result?.detected_skills?.length) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncingSkills(true);
      const currentSkills = userProfile?.skills || [];
      const merged = Array.from(new Set([...currentSkills, ...result.detected_skills]));

      await setDoc(
        doc(db, "users", user.uid),
        {
          skills: merged,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setUserProfile((prev) => ({ ...prev, skills: merged }));
      setSuccessMsg("Detected skills added to your Student Profile! 🎉");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Sync error:", err);
      setError("Failed to sync skills with profile.");
    } finally {
      setSyncingSkills(false);
    }
  };

  return (
    <div className="resume-page">
      {/* Header */}
      <header className="resume-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1>📄 AI Resume Analyzer</h1>
            <p>
              Upload your resume for intelligent skill extraction, gap discovery, and placement readiness evaluation.
            </p>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
              TARGET CAREER CONTEXT:
            </label>
            <select
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "white",
                fontWeight: "600",
                fontSize: "13px",
                color: "#1e293b",
              }}
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI ML Engineer">AI / ML Engineer</option>
              <option value="Cybersecurity">Cybersecurity Analyst</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="resume-content">
        {/* Alerts */}
        {error && (
          <div className="resume-alert error">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="resume-alert success">
            ✓ {successMsg}
          </div>
        )}

        {/* Upload Card */}
        <section className="resume-upload-card">
          <div className="upload-icon">📄</div>
          <h2>Upload Your College Resume</h2>
          <p>
            Supports standard PDF resumes. Our engine inspects technical keywords, projects, education, and links.
          </p>

          <label className="upload-box">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
            <div className="upload-cloud">☁️</div>
            <strong>{selectedFile ? selectedFile.name : "Click to select or drop resume PDF here"}</strong>
            <small>
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click to change file`
                : "PDF format up to 10MB"}
            </small>
          </label>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "⏳ Analyzing Resume Structure & Skills..." : "Analyze Resume with AI →"}
          </button>
        </section>

        {/* Results Section */}
        {result && (
          <div className="results-wrapper">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "32px 0 18px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2>Resume Analysis Results</h2>
                {result.fromCache && (
                  <small style={{ color: "#64748b" }}>
                    Showing latest saved analysis from Firestore. Upload a new PDF to update.
                  </small>
                )}
              </div>
              {result.detected_skills?.length > 0 && (
                <button
                  type="button"
                  onClick={handleSyncSkills}
                  disabled={syncingSkills}
                  style={{
                    padding: "10px 18px",
                    background: "#4f46e5",
                    color: "white",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {syncingSkills ? "Syncing..." : "Sync Detected Skills to Profile ✨"}
                </button>
              )}
            </div>

            {/* Score & Metrics Cards */}
            <div className="metrics-grid">
              {/* Score Card */}
              <div className="metric-card highlight">
                <h3>Resume Quality Score</h3>
                <div className="big-number">{result.resume_score ?? 0}%</div>
                <p>Rule-Based Prototype Score</p>
                <div className="prototype-note">
                  Prototype resume-quality assessment based on sections, keywords & links. Not a guarantee of job selection.
                </div>
              </div>

              {/* Pages Card */}
              <div className="metric-card">
                <h3>PDF Length</h3>
                <div className="big-number">{result.pages}</div>
                <p>{result.pages === 1 ? "Ideal 1-Page Format" : `${result.pages} Pages Document`}</p>
              </div>

              {/* Detected Skills Count */}
              <div className="metric-card">
                <h3>Detected Skills</h3>
                <div className="big-number" style={{ color: "#10b981" }}>
                  {result.detected_skills?.length || 0}
                </div>
                <p>Verified Technical Keywords</p>
              </div>

              {/* Skill Gaps Count */}
              <div className="metric-card">
                <h3>Skill Gaps</h3>
                <div className="big-number" style={{ color: "#f59e0b" }}>
                  {result.missing_skills?.length || 0}
                </div>
                <p>For {result.target_career || targetCareer}</p>
              </div>
            </div>

            {/* Transparent Score Breakdown */}
            {result.score_breakdown && (
              <section className="analysis-card-full">
                <h3>📊 Transparent Scoring Breakdown</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
                  Understand exactly how your score was evaluated:
                </p>
                <div className="score-bars-grid">
                  <div>
                    <div className="bar-label">
                      <span>Technical Skills ({result.score_breakdown.skills_score} / 40)</span>
                      <strong>{result.score_breakdown.skills_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.skills_score / 40) * 100}%`, background: "#4f46e5" }} />
                    </div>
                  </div>

                  <div>
                    <div className="bar-label">
                      <span>Projects Section ({result.score_breakdown.projects_score} / 15)</span>
                      <strong>{result.score_breakdown.projects_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.projects_score / 15) * 100}%`, background: "#10b981" }} />
                    </div>
                  </div>

                  <div>
                    <div className="bar-label">
                      <span>Education Credentials ({result.score_breakdown.education_score} / 10)</span>
                      <strong>{result.score_breakdown.education_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.education_score / 10) * 100}%`, background: "#06b6d4" }} />
                    </div>
                  </div>

                  <div>
                    <div className="bar-label">
                      <span>Experience & Internships ({result.score_breakdown.experience_score} / 10)</span>
                      <strong>{result.score_breakdown.experience_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.experience_score / 10) * 100}%`, background: "#8b5cf6" }} />
                    </div>
                  </div>

                  <div>
                    <div className="bar-label">
                      <span>GitHub & LinkedIn Links ({result.score_breakdown.links_score} / 10)</span>
                      <strong>{result.score_breakdown.links_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.links_score / 10) * 100}%`, background: "#f59e0b" }} />
                    </div>
                  </div>

                  <div>
                    <div className="bar-label">
                      <span>Career Objective / Summary ({result.score_breakdown.objective_score} / 10)</span>
                      <strong>{result.score_breakdown.objective_score} pts</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${(result.score_breakdown.objective_score / 10) * 100}%`, background: "#ec4899" }} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Detected Skills */}
            <section className="analysis-card-full">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>💻 Detected Technical Skills</h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>
                    Recognized from your resume text via keyword boundary analysis.
                  </p>
                </div>
                <span className="count-badge">{result.detected_skills?.length || 0} skills</span>
              </div>
              <div className="skills-wrap">
                {(result.detected_skills || []).map((skill, index) => (
                  <span key={index} className="skill-chip detected">
                    ✓ {skill}
                  </span>
                ))}
                {(!result.detected_skills || result.detected_skills.length === 0) && (
                  <p style={{ color: "#94a3b8" }}>No recognized technical keywords detected in this document.</p>
                )}
              </div>
            </section>

            {/* Missing Skills / Skill Gaps */}
            <section className="analysis-card-full">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>⚠️ Identified Skill Gaps for {result.target_career || targetCareer}</h3>
                  <p style={{ color: "#64748b", fontSize: "13px" }}>
                    Core competencies typically expected for this role that were not found in your resume.
                  </p>
                </div>
                <span className="count-badge warning">{result.missing_skills?.length || 0} missing</span>
              </div>
              <div className="skills-wrap">
                {(result.missing_skills || []).map((skill, index) => (
                  <span key={index} className="skill-chip missing">
                    ! {skill}
                  </span>
                ))}
                {(!result.missing_skills || result.missing_skills.length === 0) && (
                  <p style={{ color: "#10b981", fontWeight: "600" }}>
                    🎉 Outstanding! You have all the primary required skills for this career role.
                  </p>
                )}
              </div>
            </section>

            {/* Recommendations */}
            <section className="analysis-card-full">
              <h3>🤖 AI Learning Recommendations</h3>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
                Actionable next steps prioritized to increase your placement readiness:
              </p>
              {result.structured_recommendations?.length > 0 ? (
                <div className="structured-recs-grid">
                  {result.structured_recommendations.map((rec, index) => (
                    <article className="structured-rec-card" key={`${rec.topic}-${index}`}>
                      <div className="structured-rec-top">
                        <strong>{rec.topic}</strong>
                        <span className={`priority-pill priority-${(rec.priority || "medium").toLowerCase()}`}>
                          {rec.priority || "Suggested"}
                        </span>
                      </div>
                      <p className="structured-rec-reason">{rec.reason}</p>
                      <div className="structured-rec-action">
                        <strong>What to do next</strong>
                        <p>{rec.action}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="recs-list">
                  {(result.recommendations || []).map((rec, index) => (
                    <div key={index} className="rec-item">
                      <span className="rec-bullet">✦</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Extracted Text */}
            {result.extracted_text && (
              <section className="analysis-card-full">
                <h3>📄 Extracted Resume Content</h3>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>
                  Clean text extracted from your PDF document for transparency:
                </p>
                <div className="extracted-text-box">
                  {result.extracted_text}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ResumeAnalyzer;