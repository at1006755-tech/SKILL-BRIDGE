import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./SkillGap.css";

// Career Standard Skill Requirements Catalog
const CAREER_REQUIREMENTS = {
  "Software Developer": [
    { name: "Programming Fundamentals", desc: "Core syntax, logic building, functions, and modular code." },
    { name: "Python", desc: "Scripting, object-oriented design, standard libraries." },
    { name: "Java", desc: "Strong OOP principles, collections framework, and JVM execution." },
    { name: "C++", desc: "Memory management, pointers, and performance optimization." },
    { name: "DSA", desc: "Data structures (Arrays, Trees, Graphs) and algorithmic analysis." },
    { name: "OOP", desc: "Encapsulation, inheritance, polymorphism, and abstraction." },
    { name: "SQL", desc: "Relational database queries, joins, indices, and normalization." },
    { name: "Git", desc: "Branching, merging, commit discipline, and local version control." },
    { name: "GitHub", desc: "Remote repositories, pull requests, collaboration, and CI actions." },
    { name: "Problem Solving", desc: "Competitive programming platforms (LeetCode, HackerRank)." }
  ],
  "Web Developer": [
    { name: "HTML", desc: "Semantic markup, forms, accessibility, and modern HTML5 elements." },
    { name: "CSS", desc: "Flexbox, CSS Grid, animations, and responsive media queries." },
    { name: "JavaScript", desc: "ES6+, DOM manipulation, asynchronous promises, fetch API." },
    { name: "React", desc: "Component architecture, hooks, state management, SPA routing." },
    { name: "Node.js", desc: "Asynchronous JavaScript runtime and package management." },
    { name: "REST APIs", desc: "HTTP methods, status codes, JSON payload integration." },
    { name: "Git", desc: "Version control and branching strategies." },
    { name: "GitHub", desc: "Repository hosting and project deployment." },
    { name: "SQL", desc: "Backend database storage and query execution." }
  ],
  "Backend Developer": [
    { name: "Python", desc: "Server scripting and backend application logic." },
    { name: "Node.js", desc: "Event-driven asynchronous backend services." },
    { name: "FastAPI", desc: "High-performance Python API framework with automatic OpenAPI docs." },
    { name: "Django", desc: "Battery-included web framework with ORM and admin interface." },
    { name: "SQL", desc: "Database modeling, complex queries, transactions, and indexing." },
    { name: "MongoDB", desc: "Document-oriented NoSQL database and aggregation pipelines." },
    { name: "REST APIs", desc: "API security, authentication tokens, rate limiting, and caching." },
    { name: "Git", desc: "Version tracking and collaborative code review." },
    { name: "Docker", desc: "Containerization and environment portability." }
  ],
  "Data Analyst": [
    { name: "Python", desc: "Data wrangling, cleaning, and automated scripting." },
    { name: "SQL", desc: "Data extraction, aggregations, CTEs, and window functions." },
    { name: "Excel", desc: "Pivot tables, VLOOKUP/XLOOKUP, and business modeling." },
    { name: "Data Analysis", desc: "Exploratory data analysis, pattern identification." },
    { name: "Tableau", desc: "Interactive executive dashboards and visual storytelling." },
    { name: "Power BI", desc: "Business intelligence reports, DAX queries, and KPI cards." },
    { name: "Statistics", desc: "Descriptive statistics, distributions, and probability metrics." },
    { name: "Git", desc: "Version management of analytical notebooks and scripts." }
  ],
  "Data Scientist": [
    { name: "Python", desc: "Numerical computation and predictive modeling." },
    { name: "Machine Learning", desc: "Supervised and unsupervised ML algorithms." },
    { name: "SQL", desc: "High-volume data querying and ETL operations." },
    { name: "Statistics", desc: "Hypothesis testing, A/B testing, and regression analysis." },
    { name: "Deep Learning", desc: "Neural networks, gradient descent, and backpropagation." },
    { name: "Pandas", desc: "DataFrame manipulation and time-series operations." },
    { name: "NumPy", desc: "Vectorized mathematics and multi-dimensional arrays." },
    { name: "Git", desc: "Reproducible data science and experimental code management." }
  ],
  "AI ML Engineer": [
    { name: "Python", desc: "Core language for ML research and production deployment." },
    { name: "Machine Learning", desc: "Scikit-Learn, feature engineering, and model evaluation." },
    { name: "Deep Learning", desc: "PyTorch / TensorFlow deep neural network architectures." },
    { name: "FastAPI", desc: "Serving ML inference endpoints with low latency." },
    { name: "TensorFlow", desc: "End-to-end open source platform for machine learning." },
    { name: "PyTorch", desc: "Dynamic computational graphs for deep learning research." },
    { name: "AI", desc: "Generative AI, LLM prompting, and RAG architectures." },
    { name: "NLP", desc: "Text processing, tokenization, embeddings, and transformers." },
    { name: "Git", desc: "Version control for ML pipelines and training scripts." }
  ],
  "Cybersecurity": [
    { name: "Networking", desc: "OSI model, TCP/IP, routing, DNS, and packet analysis." },
    { name: "Linux", desc: "Command line administration, permissions, shell scripting." },
    { name: "Python", desc: "Security automation, socket programming, vulnerability scanning." },
    { name: "Security", desc: "Threat modeling, IAM, defense-in-depth security principles." },
    { name: "Cryptography", desc: "Symmetric/asymmetric encryption, hashing, and digital certificates." },
    { name: "Ethical Hacking", desc: "Penetration testing methodologies and vulnerability remediation." },
    { name: "Git", desc: "Tracking configuration files and security scripts." }
  ]
};

function SkillGap({ onBack, onNavigateRoadmap }) {
  const [selectedCareer, setSelectedCareer] = useState("Software Developer");
  const [completedSkills, setCompletedSkills] = useState([]);
  const [inProgressSkills, setInProgressSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Load user profile skills from Firestore
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
          if (data.targetCareer && CAREER_REQUIREMENTS[data.targetCareer]) {
            setSelectedCareer(data.targetCareer);
          }
          if (Array.isArray(data.skills)) {
            setCompletedSkills(data.skills);
          }
          if (Array.isArray(data.inProgressSkills)) {
            setInProgressSkills(data.inProgressSkills);
          }
        }
      } catch (err) {
        console.error("Error loading skill gap data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Sync state to Firestore
  const syncToFirestore = async (newCompleted, newInProgress) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSaving(true);
      await setDoc(
        doc(db, "users", user.uid),
        {
          skills: newCompleted,
          inProgressSkills: newInProgress,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore sync error:", err);
      showToast("Error updating cloud database.");
    } finally {
      setSaving(false);
    }
  };

  // Get active career required skills
  const requiredList = CAREER_REQUIREMENTS[selectedCareer] || CAREER_REQUIREMENTS["Software Developer"];

  // Normalize comparisons
  const completedLower = completedSkills.map((s) => s.toLowerCase());
  const inProgressLower = inProgressSkills.map((s) => s.toLowerCase());

  // Derive Missing Skills for this career
  const missingSkills = requiredList.filter(
    (req) => !completedLower.includes(req.name.toLowerCase()) && !inProgressLower.includes(req.name.toLowerCase())
  );

  // Derive Completed required skills for this career
  const completedForCareer = requiredList.filter((req) =>
    completedLower.includes(req.name.toLowerCase())
  );

  // Derive In-Progress required skills for this career
  const inProgressForCareer = requiredList.filter((req) =>
    inProgressLower.includes(req.name.toLowerCase())
  );

  // Gap percentage: (Completed / Required) * 100
  const matchPercentage = requiredList.length > 0
    ? Math.round((completedForCareer.length / requiredList.length) * 100)
    : 0;

  // Actions: Move to Completed
  const handleMarkCompleted = (skillName) => {
    const newCompleted = Array.from(new Set([...completedSkills, skillName]));
    const newInProgress = inProgressSkills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );

    setCompletedSkills(newCompleted);
    setInProgressSkills(newInProgress);
    syncToFirestore(newCompleted, newInProgress);
    showToast(`✓ "${skillName}" marked as Completed!`);
  };

  // Actions: Move to In Progress
  const handleMarkInProgress = (skillName) => {
    const newInProgress = Array.from(new Set([...inProgressSkills, skillName]));
    const newCompleted = completedSkills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );

    setInProgressSkills(newInProgress);
    setCompletedSkills(newCompleted);
    syncToFirestore(newCompleted, newInProgress);
    showToast(`◐ "${skillName}" marked as In Progress!`);
  };

  // Actions: Reset / Mark Missing
  const handleMarkMissing = (skillName) => {
    const newCompleted = completedSkills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );
    const newInProgress = inProgressSkills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );

    setCompletedSkills(newCompleted);
    setInProgressSkills(newInProgress);
    syncToFirestore(newCompleted, newInProgress);
    showToast(`"${skillName}" moved back to Missing skills.`);
  };

  // Add custom skill to Completed
  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const clean = customSkill.trim();
    if (!clean) return;

    if (completedSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      showToast(`"${clean}" is already in your skills.`);
      return;
    }

    const newCompleted = [...completedSkills, clean];
    setCompletedSkills(newCompleted);
    setCustomSkill("");
    syncToFirestore(newCompleted, inProgressSkills);
    showToast(`Added "${clean}" to your confirmed skills!`);
  };

  return (
    <div className="skillgap-page">
      {/* Header */}
      <header className="skillgap-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              🧠 Smart Skill Gap Analysis
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Compare your current verified skills against industry requirements for your dream career role.
            </p>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
              TARGET CAREER DOMAIN:
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              style={{
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                fontWeight: "700",
                fontSize: "14px",
                color: "#1e293b",
                cursor: "pointer",
              }}
            >
              {Object.keys(CAREER_REQUIREMENTS).map((career) => (
                <option key={career} value={career}>{career}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="skillgap-content">
        {toast && (
          <div
            style={{
              padding: "12px 18px",
              background: "#1e293b",
              color: "white",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            {toast}
          </div>
        )}

        {/* Overview Hero Card */}
        <section className="gap-overview-card">
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "1px", color: "#a5b4fc", fontWeight: "800", textTransform: "uppercase" }}>
              CAREER READINESS GAP
            </span>
            <h2>{selectedCareer} Career Gap</h2>
            <p>
              You have acquired <strong>{completedForCareer.length} of {requiredList.length}</strong> core skills required for this role.
              {missingSkills.length > 0
                ? ` Bridging your ${missingSkills.length} missing skill(s) will substantially elevate your placement profile.`
                : " You meet all baseline skill requirements for this career track!"}
            </p>
            {missingSkills.length > 0 && onNavigateRoadmap && (
              <button
                type="button"
                onClick={onNavigateRoadmap}
                style={{
                  marginTop: "16px",
                  padding: "10px 18px",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                View Personalized Roadmap for Gaps →
              </button>
            )}
          </div>

          <div className="gap-percentage-circle">
            <strong>{matchPercentage}%</strong>
            <span>Matched</span>
          </div>
        </section>

        {/* 3 Quick Metric Pills */}
        <div className="gap-stats-bar">
          <div className="gap-stat-pill">
            <div className="gap-stat-icon green">✓</div>
            <div>
              <small>Completed Skills</small>
              <strong>{completedForCareer.length} / {requiredList.length}</strong>
            </div>
          </div>

          <div className="gap-stat-pill">
            <div className="gap-stat-icon blue">◐</div>
            <div>
              <small>In-Progress Learning</small>
              <strong>{inProgressForCareer.length} skills</strong>
            </div>
          </div>

          <div className="gap-stat-pill">
            <div className="gap-stat-icon amber">!</div>
            <div>
              <small>Skill Gaps (Missing)</small>
              <strong>{missingSkills.length} skills</strong>
            </div>
          </div>
        </div>

        {/* 3 Category Columns: Completed, In Progress, Missing */}
        <div className="categories-grid">
          {/* 1. Completed Skills Column */}
          <div className="category-column">
            <div className="category-header">
              <div className="category-title" style={{ color: "#15803d" }}>
                <span>✓</span> Completed Skills
              </div>
              <span className="category-count completed">{completedForCareer.length}</span>
            </div>

            {completedForCareer.map((skill) => (
              <div key={skill.name} className="skill-item-card">
                <div className="skill-item-name">{skill.name}</div>
                <div className="skill-item-desc">{skill.desc}</div>
                <div className="skill-actions">
                  <button
                    className="skill-action-btn"
                    onClick={() => handleMarkInProgress(skill.name)}
                    title="Move back to learning"
                  >
                    Move to In Progress
                  </button>
                  <button
                    className="skill-action-btn"
                    onClick={() => handleMarkMissing(skill.name)}
                    title="Remove from completed"
                  >
                    Unmark
                  </button>
                </div>
              </div>
            ))}

            {completedForCareer.length === 0 && (
              <div className="column-empty">
                <p>No skills marked as completed yet for this role.</p>
                <small>Select from Missing skills once mastered.</small>
              </div>
            )}
          </div>

          {/* 2. In Progress Skills Column */}
          <div className="category-column">
            <div className="category-header">
              <div className="category-title" style={{ color: "#1d4ed8" }}>
                <span>◐</span> In Progress
              </div>
              <span className="category-count progress">{inProgressForCareer.length}</span>
            </div>

            {inProgressForCareer.map((skill) => (
              <div key={skill.name} className="skill-item-card">
                <div className="skill-item-name">{skill.name}</div>
                <div className="skill-item-desc">{skill.desc}</div>
                <div className="skill-actions">
                  <button
                    className="skill-action-btn success"
                    onClick={() => handleMarkCompleted(skill.name)}
                  >
                    ✓ Mark Completed
                  </button>
                  <button
                    className="skill-action-btn"
                    onClick={() => handleMarkMissing(skill.name)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}

            {inProgressForCareer.length === 0 && (
              <div className="column-empty">
                <p>No skills currently in progress.</p>
                <small>Pick a missing skill to start learning.</small>
              </div>
            )}
          </div>

          {/* 3. Missing Skills Column */}
          <div className="category-column">
            <div className="category-header">
              <div className="category-title" style={{ color: "#b45309" }}>
                <span>!</span> Missing Skills (Skill Gaps)
              </div>
              <span className="category-count missing">{missingSkills.length}</span>
            </div>

            {missingSkills.map((skill) => (
              <div key={skill.name} className="skill-item-card">
                <div className="skill-item-name">{skill.name}</div>
                <div className="skill-item-desc">{skill.desc}</div>
                <div className="skill-actions">
                  <button
                    className="skill-action-btn primary"
                    onClick={() => handleMarkInProgress(skill.name)}
                  >
                    + Start Learning
                  </button>
                  <button
                    className="skill-action-btn success"
                    onClick={() => handleMarkCompleted(skill.name)}
                  >
                    ✓ I Know This
                  </button>
                </div>
              </div>
            ))}

            {missingSkills.length === 0 && (
              <div className="column-empty" style={{ color: "#15803d" }}>
                <p>🎉 Excellent! Zero skill gaps identified for {selectedCareer}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Other Verified Skills Card */}
        <section style={{ marginTop: "32px", background: "white", padding: "24px 28px", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Add Any Custom Skill to Your Profile</h3>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
            Know a technology not listed in the standard requirements? Add it directly to your profile:
          </p>
          <form onSubmit={handleAddCustomSkill} style={{ display: "flex", gap: "10px", maxWidth: "500px" }}>
            <input
              type="text"
              placeholder="e.g. Next.js, Redux, Kubernetes..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "9px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#4f46e5",
                color: "white",
                borderRadius: "9px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              + Add Skill
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default SkillGap;
