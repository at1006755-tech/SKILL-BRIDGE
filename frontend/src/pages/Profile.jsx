import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Profile.css";
import { auth, db } from "../firebase";

const COLLEGE_OPTIONS = [
  "PSIT College of Higher Education, Kanpur",
  "Pranveer Singh Institute of Technology (PSIT), Kanpur",
  "IIT Kanpur",
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Roorkee",
  "IIT BHU Varanasi",
  "MNNIT Allahabad",
  "NIT Trichy",
  "NIT Warangal",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "AKGEC, Ghaziabad",
  "KIET Group of Institutions, Ghaziabad",
  "GLA University, Mathura",
  "Amity University",
  "Chandigarh University",
  "Lovely Professional University (LPU)",
  "VIT Vellore",
  "SRM Institute of Science and Technology",
  "JSS Academy of Technical Education, Noida",
  "Galgotias University",
  "Bennett University",
  "University of Lucknow",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "Christ University",
  "Symbiosis International University",
  "Banaras Hindu University (BHU)",
  "University of Delhi",
  "Other"
];
const LANGUAGE_OPTIONS = ["C","C++","C#","Java","Python","JavaScript","TypeScript","PHP","Ruby","Go","Rust","Kotlin","Swift","Dart","R","SQL","HTML","CSS","Bash","MATLAB"];
const SKILL_OPTIONS = ["HTML","CSS","JavaScript","TypeScript","React","Next.js","Node.js","Express.js","Python","Java","C","C++","SQL","MySQL","PostgreSQL","MongoDB","Firebase","Git","GitHub","REST API","DSA","Data Structures","Algorithms","OOP","Machine Learning","Artificial Intelligence","Data Analysis","Pandas","NumPy","Figma","Tailwind CSS","Bootstrap","Docker","AWS","Linux"];

function Profile({ onBack }) {
  const [user, setUser] = useState(auth.currentUser);

  // Profile Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [location, setLocation] = useState("");

  const [targetCareer, setTargetCareer] = useState("Software Developer");
  const [targetJobRole, setTargetJobRole] = useState("Software Engineer");
  const [careerGoal, setCareerGoal] = useState("Placement Preparation");
  const [experience, setExperience] = useState("Beginner");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const [langInput, setLangInput] = useState("");
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [languageSearch, setLanguageSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: "", type: "" });

  // Calculate Profile Completion Percentage
  const calculateCompletion = () => {
    const checks = [
      Boolean(fullName.trim()),
      Boolean(email.trim()),
      Boolean(college.trim()),
      Boolean(degree),
      Boolean(branch.trim()),
      Boolean(currentYear),
      Boolean(targetCareer),
      Boolean(targetJobRole.trim()),
      Boolean(careerGoal.trim()),
      skills.length > 0,
      programmingLanguages.length > 0,
      Boolean(github.trim()),
      Boolean(linkedin.trim()),
    ];
    const completedCount = checks.filter(Boolean).length;
    return Math.round((completedCount / checks.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setEmail(currentUser.email || "");
        loadProfile(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load Profile from Firestore
  const loadProfile = async (uid) => {
    try {
      setLoading(true);
      const profileRef = doc(db, "users", uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setFullName(data.fullName || auth.currentUser?.displayName || "");
        setEmail(data.email || auth.currentUser?.email || "");
        setCollege(data.college || "");
        setDegree(data.degree || "");
        setBranch(data.branch || "");
        setCurrentYear(data.currentYear ? String(data.currentYear) : "");
        setLocation(data.location || "");

        setTargetCareer(data.targetCareer || "Software Developer");
        setTargetJobRole(data.targetJobRole || "Software Engineer");
        setCareerGoal(data.careerGoal || "Placement Preparation");
        setExperience(data.experience || "Beginner");

        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setProgrammingLanguages(Array.isArray(data.programmingLanguages) ? data.programmingLanguages : []);

        setGithub(data.github || "");
        setLinkedin(data.linkedin || "");
      } else {
        // Fallback to auth defaults
        if (auth.currentUser) {
          setFullName(auth.currentUser.displayName || "");
          setEmail(auth.currentUser.email || "");
        }
      }
    } catch (error) {
      console.error("Profile loading error:", error);
      setFeedback({ text: "Failed to load profile. Please refresh.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (items, setItems, value) => {
    setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  // Add Technical Skill
  const handleAddSkill = () => {
    const newSkill = skillInput.trim();
    if (!newSkill) return;

    if (skills.some((s) => s.toLowerCase() === newSkill.toLowerCase())) {
      setFeedback({ text: `"${newSkill}" is already in your skills list.`, type: "error" });
      setTimeout(() => setFeedback({ text: "", type: "" }), 3000);
      return;
    }

    setSkills([...skills, newSkill]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Add Programming Language
  const handleAddLanguage = () => {
    const newLang = langInput.trim();
    if (!newLang) return;

    if (programmingLanguages.some((l) => l.toLowerCase() === newLang.toLowerCase())) {
      setFeedback({ text: `"${newLang}" is already added.`, type: "error" });
      setTimeout(() => setFeedback({ text: "", type: "" }), 3000);
      return;
    }

    setProgrammingLanguages([...programmingLanguages, newLang]);
    setLangInput("");
  };

  const handleRemoveLanguage = (langToRemove) => {
    setProgrammingLanguages(programmingLanguages.filter((l) => l !== langToRemove));
  };

  // Save Profile to Firestore
  const handleSaveProfile = async () => {
    if (!user) {
      setFeedback({ text: "Please sign in to save your profile.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      setFeedback({ text: "", type: "" });

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: fullName.trim(),
          email: email.trim(),
          college: college.trim(),
          degree,
          branch: branch.trim(),
          currentYear,
          location: location.trim(),

          targetCareer,
          targetJobRole: targetJobRole.trim(),
          careerGoal: careerGoal.trim(),
          experience,

          skills,
          programmingLanguages,

          github: github.trim(),
          linkedin: linkedin.trim(),

          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setFeedback({ text: "Profile saved successfully! Your changes are up to date. 🎉", type: "success" });
    } catch (error) {
      console.error("Profile save error:", error);
      setFeedback({ text: "Unable to save your profile. Please check your internet connection and try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <header className="profile-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </header>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
          <h3>Loading your academic profile...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Top Header */}
      <header className="profile-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div className="profile-header-title">
          <h1>My Student Profile</h1>
          <p>
            Build your academic and technical profile to personalize your AI career intelligence.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-content">
        {/* Feedback Alert */}
        {feedback.text && (
          <div
            className={`profile-feedback ${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <span className="profile-feedback-icon" aria-hidden="true">
              {feedback.type === "success" ? "✓" : "⚠"}
            </span>
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Profile Card with Completion Meter */}
        <section className="profile-card">
          <div className="profile-avatar-large">
            {fullName ? fullName.charAt(0).toUpperCase() : "S"}
          </div>

          <div style={{ flex: 1 }}>
            <h2>{fullName || "Student Profile"}</h2>
            <p>
              {degree || "Undergraduate"} {branch ? `in ${branch}` : ""} • {targetCareer || "Career Aspirant"}
            </p>
            <small style={{ color: "#64748b" }}>{email || user?.email}</small>

            {/* Profile Completion Bar */}
            <div style={{ marginTop: "14px", maxWidth: "340px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "#475569",
                }}
              >
                <span>Profile Completion</span>
                <span style={{ color: completionPercentage >= 80 ? "#10b981" : "#4f46e5" }}>
                  {completionPercentage}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "50px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${completionPercentage}%`,
                    height: "100%",
                    background:
                      completionPercentage >= 80
                        ? "linear-gradient(90deg, #10b981, #059669)"
                        : "linear-gradient(90deg, #4f46e5, #7c3aed)",
                    borderRadius: "inherit",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>

          <span className="profile-status">Profile Active</span>
        </section>

        {/* Basic Information */}
        <section className="form-card">
          <div className="form-card-header">
            <h2>1. Academic & Personal Information</h2>
            <p>Your educational background and contact details.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                disabled
                style={{ background: "#f1f5f9", cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group">
              <label>College / University *</label>
              <input
                type="text"
                list="college-options"
                placeholder="Search or type your college name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
              <datalist id="college-options">
                {COLLEGE_OPTIONS.map((name) => <option key={name} value={name} />)}
              </datalist>
              <small className="field-hint">Search the list or type your college's full name if it is not listed.</small>
            </div>

            <div className="form-group">
              <label>Degree *</label>
              <select value={degree} onChange={(e) => setDegree(e.target.value)}>
                <option value="" disabled>Select degree</option>
                <option value="BTech">B.Tech / B.E.</option>
                <option value="BCA">BCA</option>
                <option value="BSc">B.Sc Computer Science / IT</option>
                <option value="MCA">MCA</option>
                <option value="MTech">M.Tech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Branch / Specialization *</label>
              <input
                type="text"
                placeholder="e.g. Computer Science, AI, Information Technology"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Current Academic Year *</label>
              <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)}>
                <option value="" disabled>Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year / Final Year</option>
                <option value="Graduated">Recent Graduate</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location (City, State)</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Career Aspirations */}
        <section className="form-card">
          <div className="form-card-header">
            <h2>2. Career Aspirations & Target Roles</h2>
            <p>Helps SkillBridge AI calibrate required skills and roadmaps.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Preferred Career Domain *</label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
              >
                <option value="Software Developer">Software Developer</option>
                <option value="Web Developer">Web Developer (Frontend / Full Stack)</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="AI ML Engineer">AI / ML Engineer</option>
                <option value="Cybersecurity">Cybersecurity Analyst</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Job Role</label>
              <input
                type="text"
                placeholder="e.g. Associate Software Engineer, Frontend Intern"
                value={targetJobRole}
                onChange={(e) => setTargetJobRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Career Goal</label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
              >
                <option value="Placement Preparation">Campus Placement Preparation</option>
                <option value="Internship Search">Summer Internship Search</option>
                <option value="Off-Campus Placement">Off-Campus Placement & Jobs</option>
                <option value="Higher Studies">Higher Studies & Tech Skills</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="Beginner">Beginner (Building fundamentals)</option>
                <option value="Intermediate">Intermediate (Built projects, solving problems)</option>
                <option value="Advanced">Advanced (Internship experience / competitive coder)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Programming Languages */}
        <section className="form-card">
          <div className="form-card-header">
            <h2>3. Programming Languages</h2>
            <p>Languages you know or are currently practicing.</p>
          </div>

          <input className="option-search" type="search" placeholder="Search programming languages..." value={languageSearch} onChange={(e) => setLanguageSearch(e.target.value)} />
          <div className="checkbox-options">
            {LANGUAGE_OPTIONS.filter((item) => item.toLowerCase().includes(languageSearch.toLowerCase())).map((lang) => (
              <label className="checkbox-option" key={lang}>
                <input type="checkbox" checked={programmingLanguages.includes(lang)} onChange={() => toggleSelection(programmingLanguages, setProgrammingLanguages, lang)} />
                <span>{lang}</span>
              </label>
            ))}
          </div>
          <div className="skills-input custom-option-input">
            <input type="text" placeholder="Add another language..." value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddLanguage(); } }} />
            <button type="button" onClick={handleAddLanguage}>+ Add Custom</button>
          </div>
          <p className="selection-count">{programmingLanguages.length} language(s) selected</p>
        </section>

        {/* Technical Skills */}
        <section className="form-card">
          <div className="form-card-header">
            <h2>4. Technical Skills & Tools</h2>
            <p>Frameworks, databases, platforms, and methodologies you know.</p>
          </div>

          <input className="option-search" type="search" placeholder="Search technical skills..." value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} />
          <div className="checkbox-options">
            {SKILL_OPTIONS.filter((item) => item.toLowerCase().includes(skillSearch.toLowerCase())).map((skill) => (
              <label className="checkbox-option" key={skill}>
                <input type="checkbox" checked={skills.includes(skill)} onChange={() => toggleSelection(skills, setSkills, skill)} />
                <span>{skill}</span>
              </label>
            ))}
          </div>
          <div className="skills-input custom-option-input">
            <input type="text" placeholder="Add another technical skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }} />
            <button type="button" onClick={handleAddSkill}>+ Add Custom</button>
          </div>
          <p className="selection-count">{skills.length} skill(s) selected</p>
        </section>

        {/* Professional Profiles */}
        <section className="form-card">
          <div className="form-card-header">
            <h2>5. Professional Links</h2>
            <p>Online profiles for proof-of-work and placement review.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>GitHub Profile URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourusername"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="profile-actions" style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "13px 22px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              fontWeight: "600",
              color: "#475569",
            }}
          >
            Cancel
          </button>

          <button
            className="save-profile-button"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? "Saving to Cloud..." : "Save Profile →"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;