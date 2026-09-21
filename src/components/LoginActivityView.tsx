import React, { useEffect, useState } from "react";
import { LoginEvent } from "../types";
import { Shield, Clock, Monitor, Globe, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export function LoginActivityView() {
  const [logs, setLogs] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/security/activity")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch(e => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>Login & Security History</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Private audit log of authentication attempts and active device sessions.</p>
        </div>
        <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "6px 14px", borderRadius: "12px", border: "1px solid #fca5a5", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <Shield size={14} /> Owner Secured Log
        </div>
      </div>

      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", textAlign: "center", color: "#6b7280", border: "1px solid #e5e7eb" }}>
          Loading security logs...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", textAlign: "center", color: "#6b7280", border: "1px solid #e5e7eb" }}>
          No login history recorded yet.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block" style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            overflow: "hidden"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <th style={{ padding: "16px 20px" }}>Status</th>
                    <th style={{ padding: "16px 20px" }}>Timestamp</th>
                    <th style={{ padding: "16px 20px" }}>Device / OS</th>
                    <th style={{ padding: "16px 20px" }}>Browser</th>
                    <th style={{ padding: "16px 20px" }}>IP Address</th>
                    <th style={{ padding: "16px 20px" }}>Session Ended</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isSuccess = log.status === "Success" || log.status === "Active";
                    const isCurrent = log.isCurrent;
                    return (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: isCurrent ? "#fef2f2" : "transparent" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: isCurrent ? "#fee2e2" : isSuccess ? "#ecfdf5" : "#fef2f2",
                            color: isCurrent ? "#991b1b" : isSuccess ? "#047857" : "#dc2626"
                          }}>
                            {isCurrent ? <Shield size={12} /> : isSuccess ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {isCurrent ? "Current Session" : log.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", color: "#111827", fontWeight: "500" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: "16px 20px", color: "#4b5563" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Monitor size={15} color="#9ca3af" />
                            <span>{log.device} • {log.os}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", color: "#4b5563" }}>{log.browser}</td>
                        <td style={{ padding: "16px 20px", color: "#4b5563", fontFamily: "monospace" }}>{log.ip}</td>
                        <td style={{ padding: "16px 20px", color: "#6b7280" }}>
                          {log.logoutTime ? new Date(log.logoutTime).toLocaleTimeString() : isCurrent ? "Active" : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {logs.map((log) => {
              const isSuccess = log.status === "Success" || log.status === "Active";
              const isCurrent = log.isCurrent;
              return (
                <div key={log.id} style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: isCurrent ? "1px solid #fca5a5" : "1px solid #e5e7eb",
                  padding: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor: isCurrent ? "#fee2e2" : isSuccess ? "#ecfdf5" : "#fef2f2",
                      color: isCurrent ? "#991b1b" : isSuccess ? "#047857" : "#dc2626"
                    }}>
                      {isCurrent ? <Shield size={12} /> : isSuccess ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {isCurrent ? "Current Session" : log.status}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6b7280", fontFamily: "monospace" }}>IP: {log.ip}</span>
                  </div>

                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#4b5563", borderTop: "1px solid #f3f4f6", paddingTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Monitor size={13} color="#9ca3af" />
                      <span>{log.device} ({log.os})</span>
                    </div>
                    <span>{log.browser}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
