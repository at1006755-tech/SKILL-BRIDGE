import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./CareerRoadmap.css";

// Comprehensive Career Roadmap Templates
const ROADMAP_TEMPLATES = {
  "Software Developer": [
    {
      id: "sd-phase-1",
      number: "01",
      title: "Programming Fundamentals & Clean Code",
      duration: "3-4 Weeks",
      relatedSkills: ["Python", "Java", "C++", "Programming Fundamentals"],
      description: "Master variables, memory allocation, conditionals, loops, functions, and modular code architecture.",
      objectives: [
        "Write clean, idiomatic code with proper naming conventions and modular functions.",
        "Understand time and space complexity with Big-O notation.",
        "Implement basic recursion, sorting, and linear search algorithms."
      ],
      tasks: [
        { id: "sd-1-1", text: "Complete 25 basic syntax & logic problems in your chosen primary language (Python/Java/C++)." },
        { id: "sd-1-2", text: "Implement iterative and recursive Fibonacci, Factorial, and Palindrome checkers." },
        { id: "sd-1-3", text: "Build a CLI application (e.g. Student Management or Task Tracker) using file I/O." }
      ],
      resources: [
        { name: "freeCodeCamp Python", url: "https://www.freecodecamp.org/learn" },
        { name: "GeeksforGeeks Basics", url: "https://www.geeksforgeeks.org/" }
      ]
    },
    {
      id: "sd-phase-2",
      number: "02",
      title: "Data Structures & Algorithms (Core DSA)",
      duration: "6-8 Weeks",
      relatedSkills: ["DSA", "Data Structures", "Algorithms", "Problem Solving"],
      description: "Essential foundational concepts for technical interview rounds and algorithmic problem solving.",
      objectives: [
        "Master linear structures: Dynamic Arrays, Linked Lists, Stacks, Queues.",
        "Master non-linear structures: Binary Trees, BSTs, Heaps, and Graph Traversals (BFS/DFS).",
        "Practice two-pointer techniques, sliding window, and divide-and-conquer."
      ],
      tasks: [
        { id: "sd-2-1", text: "Solve 50 LeetCode Easy & Medium problems focusing on Arrays and Strings." },
        { id: "sd-2-2", text: "Implement singly and doubly Linked Lists from scratch without libraries." },
        { id: "sd-2-3", text: "Solve 20 Tree traversal problems (Inorder, Preorder, Postorder, Level Order)." },
        { id: "sd-2-4", text: "Implement BFS and DFS graph search algorithms on adjacency lists." }
      ],
      resources: [
        { name: "LeetCode 75", url: "https://leetcode.com/studyplan/leetcode-75/" },
        { name: "NeetCode Roadmap", url: "https://neetcode.io/roadmap" }
      ]
    },
    {
      id: "sd-phase-3",
      number: "03",
      title: "Object-Oriented Programming & Low-Level Design",
      duration: "3 Weeks",
      relatedSkills: ["OOP", "Java", "C++", "Python"],
      description: "Learn how to structure enterprise applications using SOLID principles and design patterns.",
      objectives: [
        "Deeply understand Encapsulation, Abstraction, Inheritance, and Polymorphism.",
        "Apply SOLID design principles to eliminate tight coupling.",
        "Implement Singleton, Factory, and Observer design patterns."
      ],
      tasks: [
        { id: "sd-3-1", text: "Design a Parking Lot or Library Management System following OOP principles." },
        { id: "sd-3-2", text: "Implement Abstract Classes and Interfaces to decouple business logic." },
        { id: "sd-3-3", text: "Write unit tests for your classes using pytest or JUnit." }
      ],
      resources: [
        { name: "Refactoring Guru: Design Patterns", url: "https://refactoring.guru/design-patterns" },
        { name: "SOLID Principles in Practice", url: "https://www.freecodecamp.org/" }
      ]
    },
    {
      id: "sd-phase-4",
      number: "04",
      title: "Database Management Systems & SQL",
      duration: "3-4 Weeks",
      relatedSkills: ["SQL", "MongoDB", "Database"],
      description: "Data modeling, relational theory, complex querying, normalization, and indexing.",
      objectives: [
        "Write complex SQL queries involving INNER/LEFT JOINs, Subqueries, and Aggregations.",
        "Normalize database tables from 1NF up to 3NF/BCNF.",
        "Understand transaction ACID properties and database indexing for query speed."
      ],
      tasks: [
        { id: "sd-4-1", text: "Design an E-commerce relational database schema with foreign key constraints." },
        { id: "sd-4-2", text: "Complete SQL 50 study plan on LeetCode or HackerRank SQL domain." },
        { id: "sd-4-3", text: "Practice database indexing and analyze query execution plans with EXPLAIN." }
      ],
      resources: [
        { name: "SQLZoo Interactive Tutorials", url: "https://sqlzoo.net/" },
        { name: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/" }
      ]
    },
    {
      id: "sd-phase-5",
      number: "05",
      title: "Version Control with Git & GitHub",
      duration: "1-2 Weeks",
      relatedSkills: ["Git", "GitHub"],
      description: "Professional collaborative workflow, branch strategies, pull requests, and open source hygiene.",
      objectives: [
        "Master git branch, merge, rebase, and conflict resolution.",
        "Create structured pull requests with clear issue linking.",
        "Set up GitHub Actions for basic linting and automated test runs."
      ],
      tasks: [
        { id: "sd-5-1", text: "Initialize a Git repository and practice branch-based feature development." },
        { id: "sd-5-2", text: "Simulate and resolve a git merge conflict between two feature branches." },
        { id: "sd-5-3", text: "Write a high-quality Markdown README.md with screenshots and setup instructions." }
      ],
      resources: [
        { name: "Git Immersion", url: "https://gitimmersion.com/" },
        { name: "GitHub Skills Labs", url: "https://skills.github.com/" }
      ]
    },
    {
      id: "sd-phase-6",
      number: "06",
      title: "Full-Stack Project Development",
      duration: "4-5 Weeks",
      relatedSkills: ["React", "Node.js", "FastAPI", "HTML", "CSS"],
      description: "Build a production-grade full-stack project demonstrating architecture and deployment.",
      objectives: [
        "Connect a frontend UI (React) with a RESTful backend API (FastAPI / Express).",
        "Implement user authentication with JWT or Firebase Auth.",
        "Deploy both frontend and backend to live cloud hosting."
      ],
      tasks: [
        { id: "sd-6-1", text: "Develop a complete web app with CRUD operations, auth, and database persistence." },
        { id: "sd-6-2", text: "Implement client-side validation and responsive mobile layouts." },
        { id: "sd-6-3", text: "Deploy to Vercel/Render and verify live API endpoints with CORS." }
      ],
      resources: [
        { name: "The Odin Project", url: "https://www.theodinproject.com/" },
        { name: "Full Stack Open", url: "https://fullstackopen.com/en/" }
      ]
    },
    {
      id: "sd-phase-7",
      number: "07",
      title: "Technical Interview & Placement Preparation",
      duration: "4 Weeks",
      relatedSkills: ["Problem Solving", "DSA", "OOP"],
      description: "Targeted placement preparation: mock interviews, CS fundamentals, and resume polishing.",
      objectives: [
        "Revise Operating Systems (Processes, Threads, Deadlocks, Memory Management).",
        "Revise Computer Networks (OSI, TCP/IP, HTTP/HTTPS, DNS).",
        "Master STAR-method behavioral question responses."
      ],
      tasks: [
        { id: "sd-7-1", text: "Complete 10 timed mock coding assessments on HackerRank or LeetCode." },
        { id: "sd-7-2", text: "Review Top 50 OS, DBMS, and CN interview questions." },
        { id: "sd-7-3", text: "Conduct a peer mock interview and polish resume bullet points with quantifiable metrics." }
      ],
      resources: [
        { name: "Gate Smashers CS Fundamentals", url: "https://www.youtube.com/@GateSmashers" },
        { name: "Pramp Mock Interviews", url: "https://www.pramp.com/" }
      ]
    }
  ],
  "Web Developer": [
    {
      id: "wd-phase-1",
      number: "01",
      title: "Modern HTML5 & Semantic Web",
      duration: "2 Weeks",
      relatedSkills: ["HTML"],
      description: "Semantic markup, form validation, accessible DOM structure, and web standards.",
      objectives: ["Master semantic tags (header, nav, main, article, section, footer).", "Implement accessible HTML forms."],
      tasks: [
        { id: "wd-1-1", text: "Build a multi-page semantic website without frameworks." },
        { id: "wd-1-2", text: "Create accessible forms with client-side pattern validation." }
      ],
      resources: [{ name: "MDN HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" }]
    },
    {
      id: "wd-phase-2",
      number: "02",
      title: "CSS3, Flexbox, Grid & Responsive Design",
      duration: "3 Weeks",
      relatedSkills: ["CSS", "Responsive Design"],
      description: "Modern layouts, Flexbox, CSS Grid, media queries, and responsive mobile-first design.",
      objectives: ["Create responsive layouts that adapt cleanly from mobile to 4K monitors.", "Master CSS variables."],
      tasks: [
        { id: "wd-2-1", text: "Build a responsive landing page using Flexbox and CSS Grid." },
        { id: "wd-2-2", text: "Implement a dark mode toggle using CSS Custom Properties." }
      ],
      resources: [{ name: "CSS Tricks: Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }]
    },
    {
      id: "wd-phase-3",
      number: "03",
      title: "Modern JavaScript (ES6+)",
      duration: "4 Weeks",
      relatedSkills: ["JavaScript"],
      description: "Arrow functions, destructuring, modules, DOM manipulation, promises, async/await.",
      objectives: ["Master asynchronous JavaScript and Fetch API.", "Understand closures, event bubbling, and the event loop."],
      tasks: [
        { id: "wd-3-1", text: "Build an interactive Weather Dashboard using public APIs and async/await." },
        { id: "wd-3-2", text: "Create a client-side search and filtering component with debounce." }
      ],
      resources: [{ name: "javascript.info", url: "https://javascript.info/" }]
    },
    {
      id: "wd-phase-4",
      number: "04",
      title: "React.js Framework & State Architecture",
      duration: "4-5 Weeks",
      relatedSkills: ["React", "React.js"],
      description: "Components, JSX, useState, useEffect, custom hooks, context API, and SPA routing.",
      objectives: ["Build reactive single-page applications with reusable component hierarchy."],
      tasks: [
        { id: "wd-4-1", text: "Build an interactive E-Commerce Product Catalog with cart state management." },
        { id: "wd-4-2", text: "Create a custom useFetch or useLocalStorage React hook." }
      ],
      resources: [{ name: "React Official Docs", url: "https://react.dev/" }]
    },
    {
      id: "wd-phase-5",
      number: "05",
      title: "Backend Integration & REST APIs",
      duration: "3 Weeks",
      relatedSkills: ["Node.js", "REST APIs", "SQL", "MongoDB"],
      description: "Connecting React frontend with Node/Express or FastAPI backends and databases.",
      objectives: ["Implement secure token authentication and CRUD database integration."],
      tasks: [
        { id: "wd-5-1", text: "Build a full-stack MERN or React+FastAPI application." },
        { id: "wd-5-2", text: "Deploy frontend on Vercel and backend on Render." }
      ],
      resources: [{ name: "Full Stack Open", url: "https://fullstackopen.com/" }]
    }
  ]
};

function CareerRoadmap({ onBack, targetCareer: propCareer, missingSkills: propMissingSkills }) {
  const [selectedCareer, setSelectedCareer] = useState(propCareer || "Software Developer");
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [missingSkills, setMissingSkills] = useState(propMissingSkills || []);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // "all", "pending", "completed"

  // Load user profile & saved roadmap progress from Firestore
  useEffect(() => {
    const fetchRoadmapData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.targetCareer && !propCareer) {
            setSelectedCareer(data.targetCareer);
          }
          if (Array.isArray(data.roadmapCompletedTasks)) {
            setCompletedTaskIds(data.roadmapCompletedTasks);
          }
          if (data.resumeAnalysis?.missing_skills && !propMissingSkills) {
            setMissingSkills(data.resumeAnalysis.missing_skills);
          }
        }
      } catch (err) {
        console.error("Roadmap fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [propCareer, propMissingSkills]);

  // Select roadmap template (fallback to Software Developer)
  const phases = ROADMAP_TEMPLATES[selectedCareer] || ROADMAP_TEMPLATES["Software Developer"];

  // Initialize expanded state for first 2 phases
  useEffect(() => {
    if (phases.length > 0) {
      setExpandedPhases({
        [phases[0].id]: true,
        [phases[1]?.id]: true,
      });
    }
  }, [selectedCareer]);

  // Calculate overall tasks & progress
  const allTasks = phases.flatMap((p) => p.tasks);
  const totalTasksCount = allTasks.length;
  const completedCount = allTasks.filter((t) => completedTaskIds.includes(t.id)).length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Toggle Task Completion and sync to Firestore
  const handleToggleTask = async (taskId) => {
    const isCompleted = completedTaskIds.includes(taskId);
    const updated = isCompleted
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];

    setCompletedTaskIds(updated);

    const user = auth.currentUser;
    if (user) {
      try {
        setSaving(true);
        await setDoc(
          doc(db, "users", user.uid),
          {
            roadmapCompletedTasks: updated,
            roadmapProgress: Math.round((updated.length / totalTasksCount) * 100),
            roadmapUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Roadmap sync error:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleExpand = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  // Determine if phase addresses a missing skill
  const isPhaseMissingSkillFocus = (phase) => {
    if (!missingSkills?.length) return false;
    const lowerMissing = missingSkills.map((s) => s.toLowerCase());
    return phase.relatedSkills.some((s) => lowerMissing.includes(s.toLowerCase()));
  };

  // Check if phase is fully completed
  const isPhaseFullyCompleted = (phase) => {
    return phase.tasks.every((t) => completedTaskIds.includes(t.id));
  };

  // Filter phases
  const filteredPhases = phases.filter((phase) => {
    const fullyDone = isPhaseFullyCompleted(phase);
    if (filterMode === "completed") return fullyDone;
    if (filterMode === "pending") return !fullyDone;
    return true;
  });

  return (
    <div className="roadmap-page">
      {/* Header */}
      <header className="roadmap-header-area">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>
              🗺️ Personalized Career Roadmap
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Step-by-step sequential learning phases prioritized to address your identified skill gaps.
            </p>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", display: "block", marginBottom: "4px" }}>
              ROADMAP TRACK:
            </label>
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                fontWeight: "700",
                fontSize: "13px",
                color: "#1e293b",
                cursor: "pointer",
              }}
            >
              <option value="Software Developer">Software Developer</option>
              <option value="Web Developer">Web Developer</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Roadmap Content */}
      <main className="roadmap-content">
        {/* Hero Progress Banner */}
        <section className="roadmap-progress-banner">
          <div>
            <span style={{ fontSize: "11px", letterSpacing: "1px", color: "#c7d2fe", fontWeight: "800", textTransform: "uppercase" }}>
              {selectedCareer.toUpperCase()} JOURNEY
            </span>
            <h2>Roadmap Progress: {progressPercentage}%</h2>
            <p>
              Completed <strong>{completedCount} of {totalTasksCount}</strong> practical milestone tasks.
              Phases highlighted with <strong>"Priority Focus"</strong> address the specific skill gaps discovered in your resume.
            </p>
            {saving && <small style={{ color: "#a5b4fc" }}>Saving progress to cloud...</small>}
          </div>

          <div className="banner-progress-circle">
            <strong>{progressPercentage}%</strong>
            <small>Completed</small>
          </div>
        </section>

        {/* Filter Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setFilterMode("all")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "all" ? "#4f46e5" : "white",
                color: filterMode === "all" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              All Phases ({phases.length})
            </button>
            <button
              onClick={() => setFilterMode("pending")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "pending" ? "#4f46e5" : "white",
                color: filterMode === "pending" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              In Progress / Pending
            </button>
            <button
              onClick={() => setFilterMode("completed")}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: filterMode === "completed" ? "#4f46e5" : "white",
                color: filterMode === "completed" ? "white" : "#475569",
                border: "1px solid #e2e8f0",
              }}
            >
              Completed
            </button>
          </div>

          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {completedCount}/{totalTasksCount} Tasks Completed
          </span>
        </div>

        {/* Phases Accordion List */}
        <div className="phases-container">
          {filteredPhases.map((phase) => {
            const isMissingFocus = isPhaseMissingSkillFocus(phase);
            const isDone = isPhaseFullyCompleted(phase);
            const isOpen = Boolean(expandedPhases[phase.id]);
            const phaseTasksDone = phase.tasks.filter((t) => completedTaskIds.includes(t.id)).length;

            return (
              <div
                key={phase.id}
                className={`phase-card ${isMissingFocus ? "priority-focus" : ""} ${isDone ? "all-completed" : ""}`}
              >
                {/* Header */}
                <div className="phase-card-header" onClick={() => toggleExpand(phase.id)}>
                  <div className="phase-title-group">
                    <div className={`phase-number-badge ${isDone ? "completed" : ""}`}>
                      {isDone ? "✓" : phase.number}
                    </div>

                    <div className="phase-title-text">
                      <h3>{phase.title}</h3>
                      <div className="phase-tags">
                        <span className="phase-duration">⏱️ {phase.duration}</span>
                        {isMissingFocus && (
                          <span className="focus-tag">★ Priority: Missing Skill Focus</span>
                        )}
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          • {phaseTasksDone}/{phase.tasks.length} tasks
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {isDone && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>
                        Completed
                      </span>
                    )}
                    <span style={{ fontSize: "16px", color: "#94a3b8" }}>
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Collapsible Body */}
                {isOpen && (
                  <div className="phase-card-body">
                    <p className="phase-desc">{phase.description}</p>

                    {/* Learning Objectives */}
                    <div className="objectives-box">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {phase.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Practical Tasks Checkbox List */}
                    <div className="tasks-box">
                      <h4>Practical Action Tasks:</h4>
                      {phase.tasks.map((task) => {
                        const checked = completedTaskIds.includes(task.id);
                        return (
                          <label
                            key={task.id}
                            className={`task-item ${checked ? "done" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleTask(task.id)}
                            />
                            <span className="task-label">{task.text}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Curated Resources */}
                    {phase.resources?.length > 0 && (
                      <div className="resources-box">
                        <h4>Recommended Free Learning Resources:</h4>
                        <div className="resources-links">
                          {phase.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="resource-link"
                            >
                              🔗 {res.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default CareerRoadmap;
