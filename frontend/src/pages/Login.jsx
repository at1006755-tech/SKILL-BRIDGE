import { useState } from "react";
import "./Login.css";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Login({ onLoginSuccess, onBackToHome }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const clearMessage = () => setMessage({ text: "", type: "" });

  // Handle Login and Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessage();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const fullName = formData.get("fullName")?.toString().trim();

    if (!email || !password) {
      setMessage({ text: "Please provide both email and password.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        if (password !== confirmPassword) {
          setMessage({ text: "Passwords do not match. Please verify.", type: "error" });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setMessage({ text: "Password must be at least 6 characters.", type: "error" });
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Initialize Firestore profile document for the newly registered student
        try {
          await setDoc(doc(db, "users", user.uid), {
            fullName: fullName || "Student",
            email: user.email,
            college: "",
            degree: "",
            currentYear: "",
            branch: "",
            targetCareer: "Software Developer",
            targetJobRole: "Software Engineer",
            careerGoal: "Job Placement Preparation",
            skills: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (dbError) {
          console.warn("Initial profile write warning:", dbError);
        }

        setMessage({ text: "Account created successfully! Welcome to SkillBridge AI 🎉", type: "success" });
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(), 600);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ text: "Login successful! Redirecting to dashboard...", type: "success" });
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(), 400);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        setMessage({ text: "This email is already registered. Please login.", type: "error" });
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setMessage({ text: "Invalid email or password. Please try again.", type: "error" });
      } else if (error.code === "auth/weak-password") {
        setMessage({ text: "Password should be at least 6 characters long.", type: "error" });
      } else if (error.code === "auth/invalid-email") {
        setMessage({ text: "Please enter a valid email address.", type: "error" });
      } else {
        setMessage({ text: error.message || "Authentication failed. Please try again.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!resetEmail) {
      setMessage({ text: "Please enter your registered email address.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      setMessage({
        text: `Password reset link sent to ${resetEmail}. Check your inbox!`,
        type: "success"
      });
      setTimeout(() => {
        setIsForgotPassword(false);
      }, 3500);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/user-not-found") {
        setMessage({ text: "No user found with this email address.", type: "error" });
      } else if (error.code === "auth/invalid-email") {
        setMessage({ text: "Please enter a valid email format.", type: "error" });
      } else {
        setMessage({ text: error.message || "Failed to send reset email.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    clearMessage();
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure user profile document exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          fullName: user.displayName || "Student",
          email: user.email,
          college: "",
          degree: "",
          currentYear: "",
          branch: "",
          targetCareer: "Software Developer",
          skills: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setMessage({ text: "Google sign-in successful! Redirecting...", type: "success" });
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 500);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        setMessage({ text: error.message || "Google sign-in failed.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Showcase */}
      <div className="login-left">
        <div className="brand" onClick={onBackToHome} style={{ cursor: "pointer" }}>
          <div className="brand-icon">✦</div>
          <span>
            SkillBridge<span>AI</span>
          </span>
        </div>

        <div className="login-message">
          <div className="ai-badge">✨ AI-Powered Career Intelligence</div>

          <h1>
            Your Skills.
            <br />
            Your <span>Future.</span>
          </h1>

          <p>
            Bridge your skill gaps with AI-powered resume analysis,
            tailored career roadmaps, and intelligent placement preparation.
          </p>

          <div className="login-features">
            <div>
              <span>✓</span> AI Resume & Skill Gap Analysis
            </div>
            <div>
              <span>✓</span> Personalized Step-by-Step Career Roadmap
            </div>
            <div>
              <span>✓</span> Curated Job & Internship Matching
            </div>
            <div>
              <span>✓</span> Real-Time Placement Progress Tracking
            </div>
          </div>
        </div>

        <div className="login-footer-meta">
          <button
            type="button"
            className="back-home-link"
            onClick={onBackToHome}
          >
            ← Back to Homepage
          </button>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="login-right">
        <div className="login-card">
          <div className="mobile-logo" onClick={onBackToHome} style={{ cursor: "pointer" }}>
            <div className="brand-icon">✦</div>
            <span>
              SkillBridge<span>AI</span>
            </span>
          </div>

          {/* Feedback Banner */}
          {message.text && (
            <div className={`auth-alert ${message.type}`}>
              {message.type === "success" ? "✓ " : "⚠️ "}
              {message.text}
            </div>
          )}

          {/* Forgot Password Mode */}
          {isForgotPassword ? (
            <div>
              <div className="form-heading">
                <h2>Reset Password</h2>
                <p>
                  Enter your registered email and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handlePasswordReset}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >
                  {loading ? "Sending Reset Link..." : "Send Reset Link →"}
                </button>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    type="button"
                    className="forgot-btn"
                    onClick={() => {
                      setIsForgotPassword(false);
                      clearMessage();
                    }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Login / Register Mode */
            <div>
              <div className="form-heading">
                <h2>
                  {isRegister ? "Create your account" : "Welcome back"}
                </h2>
                <p>
                  {isRegister
                    ? "Start building your career with SkillBridge AI."
                    : "Login to continue your personalized career journey."}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {isRegister && (
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Anshika Sharma"
                      required
                    />
                  </div>
                )}

                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="input-group">
                  <div className="password-label">
                    <label>Password</label>
                    {!isRegister && (
                      <button
                        type="button"
                        className="forgot-btn"
                        onClick={() => {
                          setIsForgotPassword(true);
                          clearMessage();
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password (min 6 chars)"
                    required
                    minLength={6}
                  />
                </div>

                {isRegister && (
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      required
                      minLength={6}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : isRegister
                    ? "Create Account →"
                    : "Login →"}
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <button
                className="google-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <span className="google-icon">G</span>
                Continue with Google
              </button>

              <p className="switch-text">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    clearMessage();
                  }}
                >
                  {isRegister ? " Login" : " Create account"}
                </button>
              </p>

              <p className="terms">
                Protected by Firebase Authentication. Your data is private to you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;