import React, { useState } from "react";
import { Lock, User as UserIcon, ShieldAlert, ArrowRight, BookOpen, Users, Shield, UserPlus } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  onLogin: (user: User) => void;
}

export function AuthModal({ onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"manager" | "student">("manager");
  
  const [username, setUsername] = useState("Gagan3806");
  const [password, setPassword] = useState("Gagan3806");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [conflictData, setConflictData] = useState<{ message: string; existingSession: any } | null>(null);

  const handleQuickFill = (role: "manager" | "student") => {
    setLoginRole(role);
    if (role === "manager") {
      setUsername("Gagan3806");
      setPassword("Gagan3806");
    } else {
      setUsername("student");
      setPassword("student123");
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent, force = false) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        
        // Automatically login after register
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, force: false })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || "Login failed");
        onLogin(loginData.user);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, force })
      });

      const data = await res.json();

      if (res.status === 409) {
        setConflictData({ message: data.message, existingSession: data.existingSession });
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setConflictData(null);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials or session error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "460px",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06)",
        padding: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Top Accent Bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #2563eb 0%, #0d9488 100%)"
        }} />

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#0d9488",
            boxShadow: "0 8px 20px rgba(13, 148, 136, 0.2)"
          }}>
            <BookOpen size={32} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            आयुष्मान लाइब्रेरी
          </h1>
          <p style={{ fontSize: "14px", fontWeight: "600", background: "linear-gradient(135deg, #2563eb 0%, #0d9488 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 6px" }}>
            Ayushman Library Portal
          </p>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>
            Manager & Student Reader Panels
          </p>
        </div>

        {/* Quick Role Selectors for Demo / Convenience */}
        {mode === "login" && !conflictData && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() => handleQuickFill("manager")}
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: loginRole === "manager" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                backgroundColor: loginRole === "manager" ? "#eff6ff" : "#f8fafc",
                color: loginRole === "manager" ? "#1d4ed8" : "#475569",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <Shield size={16} />
              <span>Manager Panel</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("student")}
              style={{
                padding: "12px",
                borderRadius: "12px",
                border: loginRole === "student" ? "2px solid #0d9488" : "1px solid #e2e8f0",
                backgroundColor: loginRole === "student" ? "#f0fdfa" : "#f8fafc",
                color: loginRole === "student" ? "#0f766e" : "#475569",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
            >
              <Users size={16} />
              <span>Student Panel</span>
            </button>
          </div>
        )}

        {conflictData ? (
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#d97706", marginBottom: "10px", fontWeight: "600" }}>
              <ShieldAlert size={20} />
              <span>Active Session Conflict</span>
            </div>
            <p style={{ fontSize: "13px", color: "#92400e", margin: "0 0 16px", lineHeight: "1.5" }}>
              {conflictData.message}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {loading ? "Terminating..." : "Terminate & Login Here"}
              </button>
              <button
                onClick={() => setConflictData(null)}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)}>
            {error && (
              <div style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "20px",
                fontWeight: "500"
              }}>
                {error}
              </div>
            )}

            {mode === "register" && (
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <UserIcon size={18} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af" }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "10px",
                      fontSize: "14px",
                      color: "#1e293b",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <UserIcon size={18} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af" }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "#1e293b",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "13px", color: "#9ca3af" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    fontSize: "14px",
                    color: "#1e293b",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loginRole === "manager" && mode === "login" 
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" 
                  : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)",
                transition: "all 0.2s"
              }}
            >
              <span>{loading ? "Please wait..." : mode === "register" ? "Register Student Account" : loginRole === "manager" ? "Login to Manager Panel" : "Login to Student Panel"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
          {mode === "login" ? (
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              New reader?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setUsername(""); setPassword(""); }}
                style={{ background: "none", border: "none", color: "#0d9488", fontWeight: "600", cursor: "pointer", padding: 0 }}
              >
                Register a student account
              </button>
            </p>
          ) : (
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); handleQuickFill("student"); }}
                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", padding: 0 }}
              >
                Login here
              </button>
            </p>
          )}
          <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px" }}>
            Manager: Gagan3806 / Gagan3806 • Student: student / student123
          </p>
        </div>
      </div>
    </div>
  );
}
