import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./JobMatching.css";

// Curated Demonstration Job Opportunities for Freshers & Students
const DEMO_JOBS = [
  {
    id: "job-1",
    title: "Software Engineering Intern",
    company: "Google",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    type: "Internship",
    role: "Software Developer",
    experience: "College Final / Pre-final Year",
    stipend: "Competitive Industry Stipend",
    applyUrl: "https://careers.google.com/students/",
    requiredSkills: ["DSA", "Python", "Java", "C++", "Problem Solving", "Git"],
    description: "Join Google engineering teams to design, test, deploy and maintain scalable software solutions."
  },
  {
    id: "job-2",
    title: "Junior Frontend Developer",
    company: "Swiggy",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    type: "Full-time",
    role: "Web Developer",
    experience: "0 - 1 Year (Freshers Welcome)",
    stipend: "Standard CTC Package",
    applyUrl: "https://careers.swiggy.com/",
    requiredSkills: ["React", "JavaScript", "HTML", "CSS", "Git", "GitHub"],
    description: "Build user-facing web applications that serve millions of daily active food delivery orders."
  },
  {
    id: "job-3",
    title: "Associate Software Engineer",
    company: "Microsoft",
    location: "Hyderabad, Telangana",
    mode: "Hybrid",
    type: "Full-time",
    role: "Software Developer",
    experience: "Freshers / College Graduates",
    stipend: "Industry Leading Tier 1 CTC",
    applyUrl: "https://careers.microsoft.com/students/us/en",
    requiredSkills: ["DSA", "OOP", "C++", "Java", "SQL", "Git"],
    description: "Develop cloud, productivity, and developer tooling technologies across Azure and Windows."
  },
  {
    id: "job-4",
    title: "Backend Engineering Intern",
    company: "Razorpay",
    location: "Bengaluru, Karnataka",
    mode: "Remote",
    type: "Internship",
    role: "Backend Developer",
    experience: "College Students (Pre-final / Final)",
    stipend: "₹45,000 / month",
    applyUrl: "https://razorpay.com/jobs/",
    requiredSkills: ["Python", "FastAPI", "SQL", "REST APIs", "Git"],
    description: "Work on core financial routing APIs, transaction processing pipelines, and high availability systems."
  },
  {
    id: "job-5",
    title: "Graduate Engineer Trainee (GET)",
    company: "TCS (Tata Consultancy Services)",
    location: "Pune, Maharashtra",
    mode: "On-site",
    type: "Full-time",
    role: "Software Developer",
    experience: "2025/2026 Batch Graduates",
    stipend: "Standard Campus Package",
    applyUrl: "https://www.tcs.com/careers",
    requiredSkills: ["Python", "Java", "SQL", "OOP", "Programming Fundamentals"],
    description: "Join enterprise software engineering units across banking, digital retail, and cloud operations."
  },
  {
    id: "job-6",
    title: "Junior Data Analyst",
    company: "Flipkart",
    location: "Bengaluru, Karnataka",
    mode: "Hybrid",
    type: "Full-time",
    role: "Data Analyst",
    experience: "0 - 1 Year",
    stipend: "Competitive CTC",
    applyUrl: "https://www.flipkartcareers.com/",
    requiredSkills: ["SQL", "Python", "Excel", "Tableau", "Data Analysis", "Statistics"],
    description: "Analyze e-commerce consumer behavior, track supply chain efficiency, and generate KPI dashboards."
  },
  {
    id: "job-7",
    title: "AI / ML Research Intern",
    company: "Infosys Labs",
    location: "Bengaluru, Karnataka",
    mode: "Remote",
    type: "Internship",
    role: "AI ML Engineer",
    experience: "B.Tech / M.Tech / MCA Students",
    stipend: "₹35,000 / month",
    applyUrl: "https://www.infosys.com/careers/",
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "FastAPI", "AI"],
    description: "Explore enterprise generative AI agents, document processing LLMs, and computer vision models."
  },
  {
    id: "job-8",
    title: "Cybersecurity Analyst Intern",
    company: "Wipro",
    location: "Hyderabad, Telangana",
    mode: "On-site",
    type: "Internship",
    role: "Cybersecurity",
    experience: "College Final Year",
    stipend: "₹25,000 / month",
    applyUrl: "https://careers.wipro.com/",
    requiredSkills: ["Networking", "Linux", "Security", "Python", "Cryptography"],
    description: "Monitor security operations center (SOC) alerts, audit configurations, and vulnerability assessments."
  }
];

function JobMatching({ onBack, onNavigateRoadmap }) {
  const [studentSkills, setStudentSkills] = useState([]);
  const [studentLanguages, setStudentLanguages] = useState([]);
  const [studentCareer, setStudentCareer] = useState("Software Developer");
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [minMatch, setMinMatch] = useState(0);
  const [expandedLearningJob, setExpandedLearningJob] = useState(null);

  // Load student profile skills from Firestore
  useEffect(() => {
    const fetchStudentProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.skills)) {
            setStudentSkills(data.skills);
          }
          if (Array.isArray(data.programmingLanguages)) {
            setStudentLanguages(data.programmingLanguages);
          }
          if (data.targetCareer) {
            setStudentCareer(data.targetCareer);
          }
        }
      } catch (err) {
        console.error("Job matching profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  // Normalize common skill aliases so equivalent names match correctly.
  const normalizeSkill = (skill) => {
    const value = String(skill || "").trim().toLowerCase().replace(/[._-]/g, " ").replace(/\\s+/g, " ");
    const aliases = {
      js: "javascript",
      "javascript": "javascript",
      "react js": "react",
      "react.js": "react",
      "node js": "node.js",
      "nodejs": "node.js",
      "html5": "html",
      "css3": "css",
      "rest api": "rest apis",
      "rest apis": "rest apis",
      "machine learning": "machine learning",
      "ml": "machine learning",
      "ai": "ai",
      "dsa": "dsa",
      "data structures and algorithms": "dsa",
      "git hub": "github",
      "problem-solving": "problem solving",
    };
    return aliases[value] || value;
  };

  // Combine skills, languages and in-progress skills from the saved profile.
  const allStudentSkills = [
    ...studentSkills,
    ...studentLanguages,
  ];
  const studentSkillSet = new Set(allStudentSkills.map(normalizeSkill).filter(Boolean));

  // Compute match details using normalized profile skills.
  const jobsWithMatch = DEMO_JOBS.map((job) => {
    const matchingSkills = job.requiredSkills.filter((reqSkill) =>
      studentSkillSet.has(normalizeSkill(reqSkill))
    );
    const missingSkills = job.requiredSkills.filter(
      (reqSkill) => !studentSkillSet.has(normalizeSkill(reqSkill))
    );

    const matchPercentage = job.requiredSkills.length > 0
      ? Math.round((matchingSkills.length / job.requiredSkills.length) * 100)
      : 0;
    const isCareerRecommended =
      normalizeSkill(job.role) === normalizeSkill(studentCareer);

    return {
      ...job,
      matchingSkills,
      missingSkills,
      matchPercentage,
      isCareerRecommended,
    };
  });

  // Filter Jobs
  const filteredJobs = jobsWithMatch.filter((job) => {
    if (roleFilter !== "all" && job.role !== roleFilter) return false;
    if (typeFilter !== "all" && job.type !== typeFilter) return false;
    if (modeFilter !== "all" && job.mode !== modeFilter) return false;
    if (job.matchPercentage < minMatch) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.company} ${job.location}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Sort by match percentage descending
  filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <div className="jobs-page">
      {/* Header */}
      <header className="jobs-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              💼 Smart Job & Internship Matching
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Discover college placements and internships ranked by your verified skill match percentage.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Your Verified Skills:</span>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#4f46e5" }}>
              {new Set(allStudentSkills.map(normalizeSkill).filter(Boolean)).size} Skills in Profile
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="jobs-content">
        {/* Demonstration Disclaimer Banner */}
        <div className="demo-banner">
          <span>ℹ️</span>
          <div>
            <strong>Sample Opportunities — Illustrative Data:</strong> These example roles demonstrate skill matching; they are not confirmed live vacancies.
            Match percentages are calculated from the skills saved in your profile. Check each company official careers portal for current openings, eligibility and compensation.
          </div>
        </div>

        {/* Filter Controls */}
        <section className="filter-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Filter Opportunities</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Showing {filteredJobs.length} of {DEMO_JOBS.length} positions
            </span>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label>Search Job / Company</label>
              <input
                type="text"
                placeholder="e.g. Google, Frontend, Intern..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Career Domain</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Domains</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Web Developer">Web Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="AI ML Engineer">AI / ML Engineer</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="Internship">Internship Only</option>
                <option value="Full-time">Full-Time Fresher</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Workplace Mode</label>
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="all">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>
        </section>

        {/* Job Cards Grid */}
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const isHighMatch = job.matchPercentage >= 70;
            const isMedMatch = job.matchPercentage >= 40 && job.matchPercentage < 70;

            return (
              <div key={job.id} className="job-card">
                <div>
                  <div className="job-header-top">
                    <div className="job-company-info">
                      <h3>{job.title}</h3>
                      <div className="job-company-name">🏢 {job.company}</div>
                    </div>

                    <div
                      className={`match-badge ${
                        isHighMatch ? "high" : isMedMatch ? "medium" : "low"
                      }`}
                    >
                      <span>★</span> {job.matchPercentage}% Match
                    </div>
                  </div>

                  {/* Meta Pills */}
                  {job.isCareerRecommended && (
                    <div className="career-recommendation-label">★ Recommended for your career goal: {studentCareer}</div>
                  )}
                  <div className="job-meta-pills">
                    <span className="job-meta-pill">📍 {job.location}</span>
                    <span className="job-meta-pill">💼 {job.type}</span>
                    <span className="job-meta-pill">🌐 {job.mode}</span>
                    <span className="job-meta-pill">🎓 {job.experience}</span>
                  </div>

                  <p className="job-desc">{job.description}</p>

                  {/* Skills Matching Breakdown */}
                  <div className="job-skills-section">
                    <h4>Required Skills Breakdown:</h4>
                    <div className="job-skill-chips">
                      {job.matchingSkills.map((skill) => (
                        <span key={skill} className="job-skill-chip has" title="You have this skill">
                          ✓ {skill}
                        </span>
                      ))}
                      {job.missingSkills.map((skill) => (
                        <span key={skill} className="job-skill-chip lacks" title="Skill gap for this role">
                          ! {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                                  {job.missingSkills.length > 0 && (
                    <section className="job-learning-section">
                      <button type="button" className="learning-toggle" aria-expanded={expandedLearningJob === job.id}
                        onClick={() => setExpandedLearningJob(expandedLearningJob === job.id ? null : job.id)}>
                        {expandedLearningJob === job.id ? "Hide" : "View"} your learning path
                        <span>{job.missingSkills.length} skills to build</span>
                      </button>
                      {expandedLearningJob === job.id && (
                        <div className="learning-path-list">
                          <p className="learning-intro">Practise these missing skills to improve your match for {job.title}:</p>
                          {job.missingSkills.map((skill, index) => (
                            <div className="learning-path-item" key={skill}>
                              <span className="learning-step-number">{index + 1}</span>
                              <div><strong>{skill}</strong><p>Learn the fundamentals, complete a small hands-on exercise, and use this skill in a project.</p></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                {/* Footer with Salary & Apply */}
                <div className="job-footer">
                  <span className="job-salary">💰 {job.stipend}</span>

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="apply-button"
                  >
                    Apply on Careers Portal ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
            <h3>No matching opportunities found</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
              Try clearing your filters or adding more verified skills to your student profile.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setTypeFilter("all");
                setModeFilter("all");
                setMinMatch(0);
              }}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#4f46e5",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobMatching;
