import React, { useEffect, useState } from "react";
import { User } from "../types";
import { Shield, User as UserIcon, Calendar, Clock, Monitor, LogOut, CheckCircle2 } from "lucide-react";

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

export function ProfileView({ user, onLogout }: ProfileViewProps) {
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.session) setSessionInfo(data.session);
      })
      .catch(e => {});
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>Owner Profile & Security</h1>
        <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>Manage your private manager account and active session details.</p>
      </div>

      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        padding: "32px",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: "1px solid #f3f4f6", paddingBottom: "24px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
            color: "#ffffff",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "700",
            boxShadow: "0 8px 20px rgba(220, 38, 38, 0.3)"
          }}>
            {user.username ? user.username.charAt(0).toUpperCase() : "O"}
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>{user.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                padding: "2px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "650",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <Shield size={12} /> {user.role || "Owner"}
              </span>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>@{user.username}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{ backgroundColor: "#f9fafb", padding: "18px", borderRadius: "14px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>
              <Calendar size={16} color="#dc2626" />
              <span>Account Created</span>
            </div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>
              {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div style={{ backgroundColor: "#f9fafb", padding: "18px", borderRadius: "14px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>
              <Clock size={16} color="#dc2626" />
              <span>Current Session Started</span>
            </div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>
              {sessionInfo?.createdAt ? new Date(sessionInfo.createdAt).toLocaleString() : "Active Now"}
            </p>
          </div>

          <div style={{ backgroundColor: "#f9fafb", padding: "18px", borderRadius: "14px", border: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "8px" }}>
              <Monitor size={16} color="#dc2626" />
              <span>Device & Browser</span>
            </div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>
              {sessionInfo?.deviceInfo || "Desktop Browser (Secure)"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "13px", fontWeight: "600" }}>
            <CheckCircle2 size={16} />
            <span>Single Active Session Protected</span>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <LogOut size={16} /> Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
