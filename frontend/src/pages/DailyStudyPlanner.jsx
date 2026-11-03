import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./DailyStudyPlanner.css";

const CAREER_PLANS = {
  "Software Developer": [
    { id: "dsa", category: "DSA Practice", title: "Solve 2 array or string problems", detail: "Focus on loops, indexing, and explaining your approach.", minutes: 60, icon: "🧩" },
    { id: "development", category: "Programming", title: "Revise one programming concept", detail: "Practise functions, OOP, or problem-solving in your chosen language.", minutes: 45, icon: "💻" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Try percentages, ratios, averages, or time and work.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise one CS fundamental", detail: "Study OS, DBMS, computer networks, or software engineering.", minutes: 30, icon: "📘" },
  ],
  "Web Developer": [
    { id: "dsa", category: "DSA Practice", title: "Solve 2 beginner DSA problems", detail: "Practise arrays or strings and note the time complexity.", minutes: 45, icon: "🧩" },
    { id: "development", category: "Web Development", title: "Build one small frontend feature", detail: "Practise JavaScript, React components, forms, or responsive CSS.", minutes: 60, icon: "🌐" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Focus on percentages, ratios, averages, or logical reasoning.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise one web or CS concept", detail: "Study HTTP, browser basics, DBMS, OS, or software engineering.", minutes: 30, icon: "📘" },
  ],
  "Backend Developer": [
    { id: "dsa", category: "DSA Practice", title: "Solve 2 array or string problems", detail: "Practise problem-solving and explain the complexity.", minutes: 45, icon: "🧩" },
    { id: "development", category: "Backend Development", title: "Practise one API or database task", detail: "Build an endpoint, validate input, or perform a CRUD operation.", minutes: 60, icon: "⚙️" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Try percentages, ratios, averages, or time and work.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise DBMS or networking", detail: "Review SQL, keys, normalization, HTTP, or client-server basics.", minutes: 30, icon: "📘" },
  ],
  "Data Analyst": [
    { id: "dsa", category: "Problem Solving", title: "Solve 2 logic or SQL problems", detail: "Practise filtering, grouping, joins, or basic problem-solving.", minutes: 45, icon: "🧩" },
    { id: "development", category: "Data Skills", title: "Practise SQL or spreadsheet analysis", detail: "Use a small dataset and write queries to find useful patterns.", minutes: 60, icon: "📊" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Focus on percentages, averages, ratios, and data interpretation.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise statistics or DBMS", detail: "Review mean, median, data types, keys, and normalization.", minutes: 30, icon: "📘" },
  ],
  "Data Scientist": [
    { id: "dsa", category: "Problem Solving", title: "Solve 2 Python practice problems", detail: "Practise lists, dictionaries, strings, and functions.", minutes: 45, icon: "🧩" },
    { id: "development", category: "Data Science", title: "Practise Python data analysis", detail: "Explore a dataset using Pandas or NumPy and note observations.", minutes: 60, icon: "📈" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Focus on averages, probability, percentages, and data interpretation.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise statistics fundamentals", detail: "Review mean, median, variance, probability, and distributions.", minutes: 30, icon: "📘" },
  ],
  "AI ML Engineer": [
    { id: "dsa", category: "Python Practice", title: "Solve 2 Python coding problems", detail: "Practise lists, dictionaries, functions, and clean code.", minutes: 45, icon: "🧩" },
    { id: "development", category: "AI / ML Learning", title: "Study one machine learning concept", detail: "Learn a concept and try a small Scikit-learn example.", minutes: 60, icon: "🤖" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Focus on probability, averages, percentages, and reasoning.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise maths or CS fundamentals", detail: "Review statistics, linear algebra basics, DBMS, or OS.", minutes: 30, icon: "📘" },
  ],
  Cybersecurity: [
    { id: "dsa", category: "Linux & Command Line", title: "Practise 5 Linux commands", detail: "Try navigation, files, permissions, processes, and help commands.", minutes: 45, icon: "🔐" },
    { id: "development", category: "Cybersecurity", title: "Study one networking security topic", detail: "Learn TCP/IP, DNS, HTTP/HTTPS, ports, or common threats.", minutes: 60, icon: "🛡️" },
    { id: "aptitude", category: "Aptitude", title: "Practise 10 quantitative questions", detail: "Focus on percentages, ratios, averages, or logical reasoning.", minutes: 45, icon: "🧠" },
    { id: "core", category: "Core Subjects", title: "Revise OS or computer networks", detail: "Review processes, memory, protocols, and network layers.", minutes: 30, icon: "📘" },
  ],
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DailyStudyPlanner({ targetCareer = "Software Developer", onBack }) {
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const tasks = useMemo(
    () => CAREER_PLANS[targetCareer] || CAREER_PLANS["Software Developer"],
    [targetCareer]
  );
  const todayKey = getTodayKey();
  const completedCount = tasks.filter((task) => completedTaskIds.includes(task.id)).length;
  const completionPercent = Math.round((completedCount / tasks.length) * 100);
  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const completedMinutes = tasks
    .filter((task) => completedTaskIds.includes(task.id))
    .reduce((sum, task) => sum + task.minutes, 0);

  useEffect(() => {
    let cancelled = false;
    const loadPlan = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setMessage("Please sign in again to save your study plan.");
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        if (!cancelled && snapshot.exists()) {
          const savedPlans = snapshot.data().dailyStudyPlans || {};
          const todayPlan = savedPlans[todayKey];
          if (todayPlan?.targetCareer === targetCareer && Array.isArray(todayPlan.completedTaskIds)) {
            setCompletedTaskIds(todayPlan.completedTaskIds);
          }
        }
      } catch (error) {
        console.error("Daily study plan loading error:", error);
        if (!cancelled) setMessage("Could not load today's plan. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPlan();
    return () => { cancelled = true; };
  }, [todayKey, targetCareer]);

  const toggleTask = async (taskId) => {
    const user = auth.currentUser;
    if (!user || saving || loading) return;

    const previousIds = completedTaskIds;
    const nextIds = previousIds.includes(taskId)
      ? previousIds.filter((id) => id !== taskId)
      : [...previousIds, taskId];

    setCompletedTaskIds(nextIds);
    setSaving(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const existingPlans = snapshot.exists() && snapshot.data().dailyStudyPlans
        ? snapshot.data().dailyStudyPlans
        : {};
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
      const retainedPlans = Object.fromEntries(
        Object.entries(existingPlans).filter(([date]) => date >= cutoffKey)
      );

      retainedPlans[todayKey] = { targetCareer, completedTaskIds: nextIds };
      await setDoc(userRef, {
        dailyStudyPlans: retainedPlans,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setMessage("Progress saved to your account.");
    } catch (error) {
      console.error("Daily study plan save error:", error);
      setCompletedTaskIds(previousIds);
      setMessage("Could not save this task. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="daily-planner-page">
      <header className="daily-planner-header">
        <button type="button" className="daily-planner-back" onClick={onBack}>← Back to Dashboard</button>
        <span className="daily-planner-eyebrow">SKILLBRIDGE AI · YOUR DAILY ROUTINE</span>
        <h1>Daily Study Planner</h1>
        <p>A focused, career-based study plan to help you prepare one day at a time.</p>
      </header>

      <main className="daily-planner-content">
        <section className="daily-planner-summary">
          <div>
            <span className="daily-planner-label">TODAY'S TARGET</span>
            <h2>{targetCareer}</h2>
            <p>{new Date(`${todayKey}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="daily-planner-progress-circle" style={{ "--progress": `${completionPercent}%` }}>
            <strong>{completionPercent}%</strong>
            <span>Completed</span>
          </div>
        </section>

        <section className="daily-planner-stats">
          <div><span>Tasks completed</span><strong>{completedCount}/{tasks.length}</strong></div>
          <div><span>Time completed</span><strong>{completedMinutes} min</strong></div>
          <div><span>Daily study target</span><strong>{totalMinutes / 60} hours</strong></div>
        </section>

        <section className="daily-planner-list">
          <div className="daily-planner-list-heading">
            <div><h2>Today's Learning Tasks</h2><p>Tick a task when you finish it. Your progress is saved automatically.</p></div>
            <span>{completedCount === tasks.length ? "🎉 All done!" : `${tasks.length - completedCount} left`}</span>
          </div>

          {loading ? <p className="daily-planner-feedback">Loading your saved plan...</p> : (
            <div className="daily-planner-tasks">
              {tasks.map((task) => {
                const done = completedTaskIds.includes(task.id);
                return (
                  <button
                    type="button"
                    key={task.id}
                    className={`daily-planner-task ${done ? "completed" : ""}`}
                    onClick={() => toggleTask(task.id)}
                    disabled={saving}
                    aria-pressed={done}
                  >
                    <span className="daily-planner-task-check">{done ? "✓" : ""}</span>
                    <span className="daily-planner-task-icon">{task.icon}</span>
                    <span className="daily-planner-task-copy">
                      <small>{task.category}</small>
                      <strong>{task.title}</strong>
                      <span>{task.detail}</span>
                    </span>
                    <span className="daily-planner-task-time">{task.minutes} min</span>
                  </button>
                );
              })}
            </div>
          )}
          {saving && <p className="daily-planner-feedback" role="status">Saving your progress...</p>}
          {!saving && message && <p className={`daily-planner-feedback ${message.startsWith("Could not") ? "error" : ""}`} role="status">{message}</p>}
        </section>

        <p className="daily-planner-footnote">Your plan is a suggested routine. You can complete tasks at your own pace; unfinished tasks remain available in today's plan.</p>
      </main>
    </div>
  );
}

export default DailyStudyPlanner;
