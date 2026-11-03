import { useState } from "react";
import { updatePassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

function Settings({ onBack, onLogout }) {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    if (!user) {
      setMsg({ text: "No user signed in.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      // Update display name
      if (displayName && displayName !== user.displayName) {
        await updateProfile(user, { displayName });
        await setDoc(doc(db, "users", user.uid), { fullName: displayName, updatedAt: serverTimestamp() }, { merge: true });
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          setMsg({ text: "New password must be at least 6 characters.", type: "error" });
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setMsg({ text: "Passwords do not match.", type: "error" });
          setLoading(false);
          return;
        }
        await updatePassword(user, newPassword);
      }

      setMsg({ text: "Account settings updated successfully! 🎉", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Settings error:", error);
      if (error.code === "auth/requires-recent-login") {
        setMsg({ text: "Please log out and log back in before changing sensitive account settings.", type: "error" });
      } else {
        setMsg({ text: error.message || "Failed to update account.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, Arial, sans-serif" }}>
      <header style={{ background: "white", padding: "28px 48px", borderBottom: "1px solid #e2e8f0" }}>
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "#f1f5f9",
            color: "#475569",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px" }}>⚙️ Account & Application Settings</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
          Manage your account credentials, preferences, and session controls.
        </p>
      </header>

      <main style={{ maxWidth: "750px", margin: "36px auto", padding: "0 20px 60px" }}>
        {msg.text && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: "600",
              background: msg.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: msg.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${msg.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {msg.type === "success" ? "✓ " : "⚠️ "} {msg.text}
          </div>
        )}

        {/* Security & Credentials Card */}
        <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "30px", marginBottom: "24px", boxShadow: "0 4px 12px rgba(15,23,42,0.03)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Account Information</h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
            Signed in as: <strong>{user?.email}</strong>
          </p>

          <form onSubmit={handleUpdateAccount}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                Change Password (optional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>

            {newPassword && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#334155" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 22px",
                borderRadius: "10px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {loading ? "Updating..." : "Save Settings →"}
            </button>
          </form>
        </section>

        {/* Session Management */}
        <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "26px", boxShadow: "0 4px 12px rgba(15,23,42,0.03)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "#dc2626" }}>Session Controls</h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
            Safely log out of your current SkillBridge AI session on this browser.
          </p>

          <button
            type="button"
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            🚪 Logout from Account
          </button>
        </section>
      </main>
    </div>
  );
}

export default Settings;
